<?php
require_once 'db.php';

try {
    // Add verification_token column
    $pdo->exec("ALTER TABLE users ADD COLUMN verification_token VARCHAR(255)");
    echo "Added verification_token column.<br>";
} catch (PDOException $e) {
    echo "verification_token column might already exist or error: " . $e->getMessage() . "<br>";
}

try {
    // Add is_verified column
    $pdo->exec("ALTER TABLE users ADD COLUMN is_verified TINYINT(1) DEFAULT 0");
    echo "Added is_verified column.<br>";
} catch (PDOException $e) {
    echo "is_verified column might already exist or error: " . $e->getMessage() . "<br>";
}

echo "Migration V3 complete.";
?>
