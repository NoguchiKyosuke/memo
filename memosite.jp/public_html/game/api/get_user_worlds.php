<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../minecraft/api/db.php';

if (!isset($_SESSION['user_id'])) {
    // If not logged in, return empty list (not error) for easier frontend handling
    echo json_encode(['success' => true, 'worlds' => []]);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Fetch worlds belonging to this user
    // Ordering by creation date descending makes sense
    $stmt = $pdo->prepare("SELECT room_code, host_token, created_at FROM minecraft_worlds WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $worlds = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true, 
        'worlds' => $worlds,
        'user_name' => $_SESSION['name'] ?? 'Player'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
