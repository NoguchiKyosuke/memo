<?php
require_once 'common.php';

try {
    $stmt = $pdo->prepare("SELECT id, parent_id, type, title, updated_at FROM notebook_items WHERE user_id = ? ORDER BY type DESC, title ASC");
    $stmt->execute([$user_id]);
    $items = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'items' => $items]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
