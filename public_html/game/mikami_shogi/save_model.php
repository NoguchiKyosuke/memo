<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    
    // Validate JSON
    $data = json_decode($json);
    if ($data === null) {
        http_response_code(400);
        echo 'Invalid JSON';
        exit;
    }

    try {
        // Ensure table exists (Robustness against setup failure)
        $pdo->exec("CREATE TABLE IF NOT EXISTS shogi_ai_model (
            id INT AUTO_INCREMENT PRIMARY KEY,
            generation INT DEFAULT 1,
            weights_json LONGTEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");

        // Simple strategy: Insert new row for every save (History).
        // Optionally clean up old rows if table gets too big.
        $stmt = $pdo->prepare("INSERT INTO shogi_ai_model (weights_json) VALUES (:json)");
        $stmt->execute([':json' => $json]);
        
        echo 'Success';
    } catch (PDOException $e) {
        http_response_code(500);
        echo 'Database Error: ' . $e->getMessage();
    }
} else {
    http_response_code(405);
    echo 'Method Not Allowed';
}
?>
