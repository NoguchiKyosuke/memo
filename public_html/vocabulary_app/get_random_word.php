<?php
require_once 'db.php';
require_once 'functions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    // Fetch a random word that is NOT mastered
    $stmt = $pdo->prepare("SELECT id, word, meaning, sentence FROM vocabulary WHERE user_id = ? AND is_mastered = 0 ORDER BY RAND() LIMIT 1");
    $stmt->execute([$_SESSION['user_id']]);
    $word = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($word) {
        echo json_encode($word);
    } else {
        echo json_encode(['error' => 'No words found. Great job!']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
