<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['room_code']) || !isset($input['host_token'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing parameter']);
    exit;
}

$room_code = $input['room_code'];
$host_token = $input['host_token'];

// Debug Log
file_put_contents('debug_delete.log', date('Y-m-d H:i:s') . " Delete request for: $room_code\n", FILE_APPEND);

try {
    // Check if room exists and token matches
    $stmt = $pdo->prepare("SELECT id, host_token FROM minecraft_worlds WHERE room_code = ?");
    $stmt->execute([$room_code]);
    $row = $stmt->fetch();

    if ($row) {
        if ($row['host_token'] !== $host_token) {
            http_response_code(403);
            echo json_encode(['error' => 'Invalid host token']);
            exit;
        }

        $delete = $pdo->prepare("DELETE FROM minecraft_worlds WHERE id = ?");
        $delete->execute([$row['id']]);
        echo json_encode(['success' => true, 'message' => 'World deleted']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'World not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
