<?php
require_once 'common.php';

$input = json_decode(file_get_contents('php://input'), true);
$parent_id = $input['parent_id'] ?? null;
$type = $input['type'] ?? 'note';
$title = $input['title'] ?? ($type === 'folder' ? 'New Folder' : 'New Note');

if (!in_array($type, ['folder', 'note'])) {
    echo json_encode(['error' => 'Invalid type']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO notebook_items (user_id, parent_id, type, title, content) VALUES (?, ?, ?, ?, ?)");
    $content = ($type === 'note') ? '{}' : null;
    $stmt->execute([$user_id, $parent_id, $type, $title, $content]);
    
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'type' => $type, 'title' => $title, 'parent_id' => $parent_id]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
