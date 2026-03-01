<?php
require_once 'db.php';

$sql = file_get_contents(__DIR__ . '/schema.sql');

try {
    $pdo->exec($sql);
    echo "Database schema imported successfully.\n";
} catch (PDOException $e) {
    echo "Error importing schema: " . $e->getMessage() . "\n";
}
?>
