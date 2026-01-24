<?php
header('Content-Type: application/json');
require_once 'db.php';
session_start();

$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    // If not logged in, return 0 or error? Game.js handles login check maybe?
    // Return success: false or default money
    echo json_encode(['success' => false, 'error' => 'Not logged in', 'money' => 0]);
    exit;
}

try {
    // Lazy create table checks? Just in case load is called first
    $stmt = $pdo->prepare("SELECT money FROM minecraft_user_data WHERE user_id = ?");
    // Ensure table exists implicitly... or just try catch
    try {
        $stmt->execute([$user_id]);
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), "doesn't exist") !== false) {
             echo json_encode(['success' => true, 'money' => 0]);
             exit;
        }
        throw $e;
    }

    $row = $stmt->fetch();

    if ($row) {
        echo json_encode(['success' => true, 'money' => (int)$row['money']]);
    } else {
        echo json_encode(['success' => true, 'money' => 0]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
