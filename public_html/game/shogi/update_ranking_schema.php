<?php
require_once 'db.php';

try {
    // Check if column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM shogi_ranking_standard LIKE 'google_user_id'");
    if ($stmt->fetch()) {
        echo "Column google_user_id already exists.\n";
    } else {
        $sql = "ALTER TABLE shogi_ranking_standard ADD COLUMN google_user_id VARCHAR(255) UNIQUE AFTER id";
        $pdo->exec($sql);
        echo "Added google_user_id column.\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
