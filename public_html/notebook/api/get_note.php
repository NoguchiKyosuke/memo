<?php
require_once 'common.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(['error' => 'ID required']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, type, title, content, updated_at FROM notebook_items WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user_id]);
    $item = $stmt->fetch();
    
    if (!$item) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        exit;
    }
    
    echo json_encode(['success' => true, 'item' => $item]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
