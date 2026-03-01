<?php
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_GET['room_code'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing room_code']);
    exit;
}

$room_code = $_GET['room_code'];

try {
    $stmt = $pdo->prepare("SELECT world_data FROM minecraft_worlds WHERE room_code = ?");
    $stmt->execute([$room_code]);
    $row = $stmt->fetch();

    if ($row) {
        echo json_encode(['success' => true, 'world_data' => json_decode($row['world_data'])]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'World not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
