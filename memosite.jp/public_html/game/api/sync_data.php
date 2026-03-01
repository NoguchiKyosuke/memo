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
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$response = ['success' => true];

// 1. Sync Money
// We treat 'webcraft_money' as a shared currency across Juggler and Tetris.
// We will unify them to the highest known value.
if (isset($input['money'])) {
    $local_money = (int)$input['money'];
    
    // Fetch current server values
    $stmt = $pdo->prepare("SELECT game_type, save_data FROM game_saves WHERE user_id = ? AND game_type IN ('juggler', 'tetris')");
    $stmt->execute([$user_id]);
    $rows = $stmt->fetchAll();
    
    $max_money = $local_money;
    
    foreach ($rows as $row) {
        $data = json_decode($row['save_data'], true);
        if (isset($data['money'])) { // Tetris style
            $max_money = max($max_money, (int)$data['money']);
        }
        if (isset($data['credits'])) { // Juggler style
            $max_money = max($max_money, (int)$data['credits']);
        }
    }
    
    // Update both games with the new max money
    // Juggler uses 'credits', Tetris uses 'money'. We save both formats or standardise?
    // Let's save specific formats to avoid breaking games.
    
    // Juggler
    $juggler_data = json_encode(['credits' => $max_money]);
    $sql_upsert = "INSERT INTO game_saves (user_id, game_type, save_data) VALUES (?, ?, ?)
                   ON DUPLICATE KEY UPDATE save_data = JSON_SET(save_data, '$.credits', ?)"; 
                   // Note: JSON_SET requires MySQL 5.7+. If unsure, we replace full object or merge in PHP.
                   // Safer to merge in PHP for compatibility if we had other data. 
                   // But here we might overwrite High Scores? 
                   // Valid point. We should fetch, merge, save.
                   
    // Re-Reading to be safe
    // Helper function to merge and save
    function updateGameSave($pdo, $uid, $type, $key, $val) {
        $stmt = $pdo->prepare("SELECT save_data FROM game_saves WHERE user_id = ? AND game_type = ?");
        $stmt->execute([$uid, $type]);
        $row = $stmt->fetch();
        
        $data = $row ? json_decode($row['save_data'], true) : [];
        if (!is_array($data)) $data = [];
        
        $data[$key] = $val;
        $json = json_encode($data);
        
        $upsert = $pdo->prepare("INSERT INTO game_saves (user_id, game_type, save_data) VALUES (?, ?, ?)
                                 ON DUPLICATE KEY UPDATE save_data = ?");
        $upsert->execute([$uid, $type, $json, $json]);
    }

    updateGameSave($pdo, $user_id, 'juggler', 'credits', $max_money);
    updateGameSave($pdo, $user_id, 'tetris', 'money', $max_money);
    
    $response['synced_money'] = $max_money;
}

// 2. Claim Worlds
if (isset($input['worlds']) && is_array($input['worlds'])) {
    $claimed = 0;
    $errors = [];
    
    foreach ($input['worlds'] as $world) {
        $code = $world['code'] ?? '';
        $token = $world['token'] ?? '';
        
        if (!$code || !$token) continue;
        
        // Try to claim
        // Only if user_id is NULL (unclaimed) to prevent stealing?
        // Or if user_id is NULL matches host_token.
        $stmt = $pdo->prepare("UPDATE minecraft_worlds SET user_id = ? 
                               WHERE room_code = ? AND host_token = ? AND user_id IS NULL");
        $stmt->execute([$user_id, $code, $token]);
        
        if ($stmt->rowCount() > 0) {
            $claimed++;
        }
    }
    $response['claimed_worlds'] = $claimed;
}

echo json_encode($response);
?>
