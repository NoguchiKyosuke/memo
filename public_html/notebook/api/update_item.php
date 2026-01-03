<?php
require_once 'common.php';

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;

if (!$id) {
    echo json_encode(['error' => 'ID required']);
    exit;
}

// Security: Check ownership
$stmt = $pdo->prepare("SELECT id FROM notebook_items WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $user_id]);
if (!$stmt->fetch()) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$fields = [];
$params = [];

if (isset($input['title'])) {
    $fields[] = "title = ?";
    $params[] = $input['title'];
}
if (array_key_exists('parent_id', $input)) { // Allow null
    $fields[] = "parent_id = ?";
    $params[] = $input['parent_id'];
}
if (isset($input['content'])) {
    $fields[] = "content = ?";
    $params[] = $input['content'];
}

if (empty($fields)) {
    echo json_encode(['success' => true, 'message' => 'No changes']);
    exit;
}

$params[] = $id;
$sql = "UPDATE notebook_items SET " . implode(', ', $fields) . " WHERE id = ?";

try {
    $updateStmt = $pdo->prepare($sql);
    $updateStmt->execute($params);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
