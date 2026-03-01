<?php
require_once __DIR__ . '/../../game/includes/session.php';
require_once __DIR__ . '/../../game/minecraft/api/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Lazy Initialization of Table
// In production, this should be a migration script, but for this task, we ensure it exists here.
try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'notebook_items'");
    if ($stmt->rowCount() === 0) {
        $sql = "CREATE TABLE notebook_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            parent_id INT DEFAULT NULL,
            type ENUM('folder', 'note') NOT NULL,
            title VARCHAR(255) NOT NULL DEFAULT 'Untitled',
            content LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (user_id),
            INDEX (parent_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $pdo->exec($sql);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database Setup Error: ' . $e->getMessage()]);
    exit;
}
?>
