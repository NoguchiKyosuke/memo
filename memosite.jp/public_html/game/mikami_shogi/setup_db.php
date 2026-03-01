<?php
require_once 'db.php';

try {
    // Create Table
    $sql = "CREATE TABLE IF NOT EXISTS shogi_ai_model (
        id INT AUTO_INCREMENT PRIMARY KEY,
        generation INT DEFAULT 1,
        weights_json LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "Table shogi_ai_model created successfully.\n";

    // Check if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM shogi_ai_model");
    if ($stmt->fetchColumn() == 0) {
        // Init with existing model.json if available
        $jsonFile = __DIR__ . '/data/model.json';
        if (file_exists($jsonFile)) {
            $json = file_get_contents($jsonFile);
            $data = json_decode($json, true);
            // We store the 'weights' part? Or the whole object?
            // model.json structure: { "weights": { ... } }
            // Let's store the whole JSON for simplicity.
        } else {
             // Fallback default structure if file missing
             $json = '{"weights":{}}';
        }
        
        $insert = $pdo->prepare("INSERT INTO shogi_ai_model (generation, weights_json) VALUES (1, :json)");
        $insert->execute([':json' => $json]);
        echo "Initialized with data from model.json.\n";
    } else {
        echo "Table already has data.\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
