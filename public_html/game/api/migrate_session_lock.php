<?php
require_once __DIR__ . '/../minecraft/api/db.php';

try {
    $pdo->exec("ALTER TABLE users ADD COLUMN active_session_id VARCHAR(255) DEFAULT NULL");
    echo "Added active_session_id column successfully.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Column already exists.";
    } else {
        echo "Error: " . $e->getMessage();
    }
}
?>
