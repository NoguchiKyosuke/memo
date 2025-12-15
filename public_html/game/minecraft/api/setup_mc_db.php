<?php
require_once 'db.php';

$sql = "
CREATE TABLE IF NOT EXISTS minecraft_worlds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(12) NOT NULL UNIQUE,
    host_token VARCHAR(64) NOT NULL,
    world_data LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (room_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

try {
    $pdo->exec($sql);
    echo "Table 'minecraft_worlds' created successfully.\n";
} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
}
?>
