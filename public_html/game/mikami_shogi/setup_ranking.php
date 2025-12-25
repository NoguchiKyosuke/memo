<?php
require_once 'db.php';

try {
    // Create Ranking Table
    $sql = "CREATE TABLE IF NOT EXISTS shogi_ranking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        rate INT DEFAULT 1500,
        wins INT DEFAULT 0,
        losses INT DEFAULT 0,
        last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    // Silent success

    // Ensure google_user_id column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM shogi_ranking LIKE 'google_user_id'");
    if (!$stmt->fetch()) {
        $sqlAlter = "ALTER TABLE shogi_ranking ADD COLUMN google_user_id VARCHAR(255) UNIQUE AFTER id";
        $pdo->exec($sqlAlter);
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
