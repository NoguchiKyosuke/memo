<?php
require_once __DIR__ . '/../../game/minecraft/api/db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS notebook_items (
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
    echo "Table 'notebook_items' created or already exists successfully.\n";

} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
}
?>
