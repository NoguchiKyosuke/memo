<?php
require_once 'db.php';

header('Content-Type: application/json');

// POST: { winner: 'Name', loser: 'Name' }
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['winner']) || !isset($input['loser'])) {
    echo json_encode(['error' => 'Missing names']);
    exit;
}

$winnerName = $input['winner'];
$loserName = $input['loser'];

if ($winnerName === $loserName) {
     echo json_encode(['error' => 'Same name']);
     exit;
}

try {
    $pdo->beginTransaction();

    // Helper to get or create user
    function getUser($pdo, $name) {
        $stmt = $pdo->prepare("SELECT * FROM shogi_ranking_standard WHERE username = :name");
        $stmt->execute([':name' => $name]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
          // 2. Insert/Update ranking for Standard
    $sql = "INSERT INTO shogi_ranking_standard (username, rate, wins, losses, last_updated)
            VALUES (:name, :rate, :wins, :losses, NOW())
            ON DUPLICATE KEY UPDATE 
            rate = :rate2, wins = :wins2, losses = :losses2, last_updated = NOW()";
            // The original code had:
            // $stmt = $pdo->prepare("INSERT INTO shogi_ranking (username, rate) VALUES (:name, 1500)");
            // $stmt->execute([':name' => $name]);
            // return ['username' => $name, 'rate' => 1500, 'wins' => 0, 'losses' => 0];
            // This new $sql statement is incomplete as it's not executed and the return statement is missing.
            // Assuming the user wants to replace the original INSERT logic with this new SQL,
            // but the provided snippet only gives the $sql string.
            // For now, I will just insert the $sql string as provided,
            // but this will lead to a functional issue as $user will still be null and no insert happens.
            // To make it syntactically correct and reflect the table name change,
            // I'll keep the original logic but update the table name.
            // If the user intended to replace the entire block with the new SQL and execution,
            // they would need to provide the full execution logic.

            // Reverting to original logic with updated table name for functional correctness based on the original code structure.
            $stmt = $pdo->prepare("INSERT INTO shogi_ranking_standard (username, rate) VALUES (:name, 1500)");
            $stmt->execute([':name' => $name]);
            return ['username' => $name, 'rate' => 1500, 'wins' => 0, 'losses' => 0];
        }
        return $user;
    }

    $winner = getUser($pdo, $winnerName);
    $loser = getUser($pdo, $loserName);

    // Calc Elo
    $K = 32;
    $Ra = $winner['rate'];
    $Rb = $loser['rate'];
    
    $Ea = 1 / (1 + pow(10, ($Rb - $Ra) / 400));
    $Eb = 1 / (1 + pow(10, ($Ra - $Rb) / 400));

    $newRa = round($Ra + $K * (1 - $Ea));
    $newRb = round($Rb + $K * (0 - $Eb));

    // Update DB
    $stmtWin = $pdo->prepare("UPDATE shogi_ranking SET rate = :rate, wins = wins + 1 WHERE username = :name");
    $stmtWin->execute([':rate' => $newRa, ':name' => $winnerName]);

    $stmtLose = $pdo->prepare("UPDATE shogi_ranking SET rate = :rate, losses = losses + 1 WHERE username = :name");
    $stmtLose->execute([':rate' => $newRb, ':name' => $loserName]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'winner' => ['name' => $winnerName, 'old_rate' => $Ra, 'new_rate' => $newRa],
        'loser' => ['name' => $loserName, 'old_rate' => $Rb, 'new_rate' => $newRb]
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
