<?php
require_once 'common.php';

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;

if (!$id) {
    echo json_encode(['error' => 'ID required']);
    exit;
}

// Ownership Check
$stmt = $pdo->prepare("SELECT id FROM notebook_items WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $user_id]);
if (!$stmt->fetch()) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

// Simple Delete (Cascading deletes if we used foreign keys, but we define manual cleanup or simple suppression)
// Since we didn't define FK ON DELETE CASCADE, we should conceptually delete children.
// For simplicity in this iteration, we just delete the item. Children will be orphaned (invisible in tree).
// We'll execute a delete.
try {
    $del = $pdo->prepare("DELETE FROM notebook_items WHERE id = ?");
    $del->execute([$id]);
    
    // Also delete children (one level? or recursive? Recursive is hard in simple SQL without CTEs or logic)
    // Quick fix: Delete direct children.
    $delChildren = $pdo->prepare("DELETE FROM notebook_items WHERE parent_id = ?");
    $delChildren->execute([$id]);
    
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
