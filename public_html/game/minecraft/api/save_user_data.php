<?php
header('Content-Type: application/json');
require_once 'db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['money'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing parameter: money']);
    exit;
}

$money = (int)$input['money'];

try {
    // Lazy create table
    $pdo->exec("CREATE TABLE IF NOT EXISTS minecraft_user_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        money INT DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Check if exists
    $stmt = $pdo->prepare("SELECT id FROM minecraft_user_data WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $row = $stmt->fetch();

    if ($row) {
        $update = $pdo->prepare("UPDATE minecraft_user_data SET money = ? WHERE user_id = ?");
        $update->execute([$money, $user_id]);
    } else {
        $insert = $pdo->prepare("INSERT INTO minecraft_user_data (user_id, money) VALUES (?, ?)");
        $insert->execute([$user_id, $money]);
    }

    echo json_encode(['success' => true, 'money' => $money]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
