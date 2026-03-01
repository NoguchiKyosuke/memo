<?php
require_once 'db.php';

try {
    // Add is_mastered column to vocabulary table
    $sql = "ALTER TABLE vocabulary ADD COLUMN is_mastered TINYINT(1) DEFAULT 0";
    $pdo->exec($sql);
    echo "Migration v4 successful: 'is_mastered' column added.\n";
} catch (PDOException $e) {
    echo "Migration v4 failed: " . $e->getMessage() . "\n";
}
?>
