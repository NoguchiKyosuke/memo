<?php
require_once 'db.php';

try {
    // 1. Truncate users table (since we are changing auth method completely)
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("TRUNCATE TABLE users");
    $pdo->exec("TRUNCATE TABLE vocabulary"); // Also clear vocab since user IDs might reset or be mismatched
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "Tables truncated.\n";

    // 2. Alter users table
    // Drop old columns
    try {
        $pdo->exec("ALTER TABLE users DROP COLUMN password");
        $pdo->exec("ALTER TABLE users DROP COLUMN username");
    } catch (PDOException $e) {
        echo "Columns might have already been dropped or didn't exist: " . $e->getMessage() . "\n";
    }

    // Add new columns
    $pdo->exec("ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL UNIQUE AFTER id");
    $pdo->exec("ALTER TABLE users ADD COLUMN remember_token VARCHAR(64) NULL AFTER email");
    
    echo "Schema migration completed successfully.\n";

} catch (PDOException $e) {
    die("Migration failed: " . $e->getMessage() . "\n");
}
?>
