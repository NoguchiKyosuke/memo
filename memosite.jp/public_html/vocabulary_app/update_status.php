<?php
require_once 'db.php';
require_once 'functions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($input['id']) ? intval($input['id']) : 0;
    $status = isset($input['status']) ? $input['status'] : '';

    if ($id > 0 && ($status === 'mastered' || $status === 'review')) {
        try {
            $is_mastered = ($status === 'mastered') ? 1 : 0;
            
            // Update only if the word belongs to the user
            $stmt = $pdo->prepare("UPDATE vocabulary SET is_mastered = ? WHERE id = ? AND user_id = ?");
            if ($stmt->execute([$is_mastered, $id, $_SESSION['user_id']])) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Update failed']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
