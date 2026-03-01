<?php
require_once 'db.php';

try {
    $pdo->exec("ALTER TABLE vocabulary ADD COLUMN dictionary_type VARCHAR(20) DEFAULT 'en-ja' AFTER meaning");
    echo "Migration successful: Added dictionary_type column.\n";
} catch (PDOException $e) {
    echo "Migration failed (maybe column already exists?): " . $e->getMessage() . "\n";
}
?>
