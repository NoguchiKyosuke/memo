<?php
require_once __DIR__ . '/minecraft/api/db.php'; // Reuse existing DB connection

$sql = file_get_contents(__DIR__ . '/google_auth_migration.sql');

try {
    $pdo->exec($sql);
    echo "Migration completed successfully.\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
