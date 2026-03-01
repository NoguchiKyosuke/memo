<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("SELECT username, rate, wins, losses FROM shogi_ranking_standard ORDER BY rate DESC LIMIT 10");
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($data);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
