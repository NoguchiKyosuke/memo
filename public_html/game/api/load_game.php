<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../minecraft/api/db.php'; 

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$game_type = $_GET['game'] ?? null;

if (!$game_type) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing game type']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT save_data FROM game_saves WHERE user_id = ? AND game_type = ?");
    $stmt->execute([$user_id, $game_type]);
    $row = $stmt->fetch();

    $data = [];
    if ($row) {
        $data = json_decode($row['save_data'], true) ?? [];
    }

    // Session Locking: Set current PHP session as the active one
    $session_id = session_id();
    $stmt_lock = $pdo->prepare("UPDATE users SET active_session_id = ? WHERE id = ?");
    $stmt_lock->execute([$session_id, $user_id]);

    // Always fetch global money
    $stmt_money = $pdo->prepare("SELECT money FROM users WHERE id = ?");
    $stmt_money->execute([$user_id]);
    $user_row = $stmt_money->fetch();
    $global_money = $user_row ? (int)$user_row['money'] : 0;

    // Inject/Overwrite money in the response
    $data['money'] = $global_money;
    $data['credits'] = $global_money;

    echo json_encode(['success' => true, 'data' => $data]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
