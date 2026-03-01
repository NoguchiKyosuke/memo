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
        $stmt = $pdo->prepare("SELECT * FROM shogi_ranking WHERE username = :name");
        $stmt->execute([':name' => $name]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            $stmt = $pdo->prepare("INSERT INTO shogi_ranking (username, rate) VALUES (:name, 1500)");
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
