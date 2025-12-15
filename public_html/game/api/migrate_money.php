<?php
require_once __DIR__ . '/../minecraft/api/db.php';

try {
    $pdo->exec("ALTER TABLE users ADD COLUMN money INT DEFAULT 0");
    echo "Added money column successfully.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Column already exists.";
    } else {
        echo "Error: " . $e->getMessage();
    }
}
?>
