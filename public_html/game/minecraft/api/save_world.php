<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['room_code']) || !isset($input['world_data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing parameter']);
    exit;
}

session_start();
$room_code = $input['room_code'];
$host_token = $input['host_token'] ?? ''; 
$world_data = json_encode($input['world_data']);
$user_id = $_SESSION['user_id'] ?? null;

try {
    // Check if room exists
    $stmt = $pdo->prepare("SELECT id, host_token, user_id FROM minecraft_worlds WHERE room_code = ?");
    $stmt->execute([$room_code]);
    $row = $stmt->fetch();

    if ($row) {
        // Update existing - Allow anyone to save (per user request)
        // if ($row['host_token'] !== $host_token) { ... } // Removed check

        // However, we might want to ensure only non-host tokens can save IF the user passed null? 
        // The requester said "anyone can save". So we proceed.

        $update = $pdo->prepare("UPDATE minecraft_worlds SET world_data = ? WHERE id = ?");
        $update->execute([$world_data, $row['id']]);
        
        // Optional: Link user_id if not linked and token matches or fresh?
        if ($user_id && !$row['user_id'] && $host_token && $row['host_token'] === $host_token) {
             $link = $pdo->prepare("UPDATE minecraft_worlds SET user_id = ? WHERE id = ?");
             $link->execute([$user_id, $row['id']]);
        }
        
        echo json_encode(['success' => true, 'message' => 'World updated']);
    } else {
        // Insert new
        $insert = $pdo->prepare("INSERT INTO minecraft_worlds (room_code, host_token, world_data, user_id) VALUES (?, ?, ?, ?)");
        $insert->execute([$room_code, $host_token, $world_data, $user_id]);
        echo json_encode(['success' => true, 'message' => 'World created']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
