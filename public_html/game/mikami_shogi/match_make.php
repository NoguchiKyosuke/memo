<?php
require_once 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['peer_id'])) {
    echo json_encode(['error' => 'Missing peer_id']);
    exit;
}

$myPeerId = $input['peer_id'];

try {
    $pdo->beginTransaction();

    // 1. Cleanup old entries (e.g. older than 30 seconds)
    // This allows creating detailed room logic later, but for now just simple queue.
    $pdo->exec("DELETE FROM shogi_matching_queue WHERE created_at < (NOW() - INTERVAL 30 SECOND)");

    // 2. Look for opponent
    // Must be someone else
    $stmt = $pdo->prepare("SELECT * FROM shogi_matching_queue WHERE peer_id != :id ORDER BY created_at ASC LIMIT 1 FOR UPDATE");
    $stmt->execute([':id' => $myPeerId]);
    $opponent = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($opponent) {
        // Found!
        // Remove opponent from queue (they are now matched with me)
        $del = $pdo->prepare("DELETE FROM shogi_matching_queue WHERE id = :id");
        $del->execute([':id' => $opponent['id']]);
        
        // Also remove myself if I was there (idk why I would be, but safety)
        $delSelf = $pdo->prepare("DELETE FROM shogi_matching_queue WHERE peer_id = :id");
        $delSelf->execute([':id' => $myPeerId]);

        $pdo->commit();
        echo json_encode(['status' => 'found', 'opponent_id' => $opponent['peer_id']]);
    } else {
        // Not found, queue myself
        // Check if already in queue to avoid dupes
        $check = $pdo->prepare("SELECT count(*) FROM shogi_matching_queue WHERE peer_id = :id");
        $check->execute([':id' => $myPeerId]);
        if ($check->fetchColumn() == 0) {
            $ins = $pdo->prepare("INSERT INTO shogi_matching_queue (peer_id) VALUES (:id)");
            $ins->execute([':id' => $myPeerId]);
        } else {
            // Already queuing, update time?
            $upd = $pdo->prepare("UPDATE shogi_matching_queue SET created_at = NOW() WHERE peer_id = :id");
            $upd->execute([':id' => $myPeerId]);
        }

        $pdo->commit();
        echo json_encode(['status' => 'waiting']);
    }

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
