<?php
require_once __DIR__ . '/../minecraft/api/db.php';

try {
    $pdo->exec("ALTER TABLE users ADD COLUMN active_token VARCHAR(64) DEFAULT NULL");
    echo "Added active_token column successfully.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Column already exists.";
    } else {
        echo "Error: " . $e->getMessage();
    }
}
?>
