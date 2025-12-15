<?php
require_once 'db.php';

$sql = file_get_contents('google_auth_migration.sql');

try {
    $pdo->exec($sql);
    echo "Migration completed successfully.\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
