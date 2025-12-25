<?php
require_once 'db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS shogi_matching_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        peer_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    // Silent success
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
