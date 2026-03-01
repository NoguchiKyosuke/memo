<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../minecraft/api/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['game']) || !isset($input['data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing parameters']);
    exit;
}

$user_id = $_SESSION['user_id'];
$game_type = $input['game'];
$save_data = json_encode($input['data']);

// DEBUG LOGGING
$log = date('Y-m-d H:i:s') . " User: $user_id Game: $game_type Data: " . json_encode($input['data']) . " Session: " . session_id() . "\n";
file_put_contents(__DIR__ . '/debug_save.log', $log, FILE_APPEND);

try {
    // Check if session matches active_session_id
    $stmt_check = $pdo->prepare("SELECT active_session_id FROM users WHERE id = ?");
    $stmt_check->execute([$user_id]);
    $user_row = $stmt_check->fetch();

    // If active_session_id is set and differs from current session, reject
    if ($user_row && $user_row['active_session_id'] && $user_row['active_session_id'] !== session_id()) {
        http_response_code(409); // Conflict
        echo json_encode(['error' => 'Session expired. Another device is active.']);
        exit;
    }

    // Upsert (Insert or Update)
    // Upsert (Insert or Update)
    $stmt = $pdo->prepare("INSERT INTO game_saves (user_id, game_type, save_data) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE save_data = ?, updated_at = CURRENT_TIMESTAMP");
    $stmt->execute([$user_id, $game_type, $save_data, $save_data]);

    // Handle Global Money Sync
    $input_data = $input['data'];
    $global_money = null;
    
    if (isset($input_data['money'])) {
        $global_money = (int)$input_data['money'];
    } elseif (isset($input_data['credits'])) {
        $global_money = (int)$input_data['credits'];
    }

    if ($global_money !== null) {
        $stmt_money = $pdo->prepare("UPDATE users SET money = ? WHERE id = ?");
        $stmt_money->execute([$global_money, $user_id]);
    }

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
