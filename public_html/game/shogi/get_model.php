<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    // 1. Try to fetch the latest model
    // We order by ID DESC to get the latest.
    $stmt = $pdo->query("SELECT weights_json FROM shogi_ai_model ORDER BY id DESC LIMIT 1");
    $row = $stmt->fetch();

    if ($row) {
        echo $row['weights_json'];
    } else {
        // Table exists but is empty? Or table doesn't exist?
        // If table doesn't exist, query usually throws exception.
        // If we are here, table likely exists but empty.
        echo is_file('data/model.json') ? file_get_contents('data/model.json') : '{}';
    }

} catch (PDOException $e) {
    // 2. Catch "Table doesn't exist" error (Code 42S02 for MySQL usually, but checking message is safer or just try-catch create)
    // For simplicity, attempt to create table and init if query failed.
    
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS shogi_ai_model (
            id INT AUTO_INCREMENT PRIMARY KEY,
            generation INT DEFAULT 1,
            weights_json LONGTEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");

        // Seed
        $json = '{}';
        if (file_exists(__DIR__ . '/data/model.json')) {
            $json = file_get_contents(__DIR__ . '/data/model.json');
        }

        $insert = $pdo->prepare("INSERT INTO shogi_ai_model (generation, weights_json) VALUES (1, :json)");
        $insert->execute([':json' => $json]);

        echo $json;

    } catch (PDOException $ex) {
        http_response_code(500);
        echo json_encode(['error' => 'Database Error: ' . $ex->getMessage()]);
    }
}
?>
