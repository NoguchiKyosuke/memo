<?php
require_once 'db.php';
require_once __DIR__ . '/../includes/session.php'; // Get Session

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$googleId = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT * FROM shogi_ranking_standard WHERE google_user_id = :gid");
    $stmt->execute([':gid' => $googleId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Found
        if (isset($input['username'])) {
             // Update Name
             $newName = trim($input['username']);
             if (!empty($newName)) {
                 try {
                     $upd = $pdo->prepare("UPDATE shogi_ranking_standard SET username = :name WHERE google_user_id = :gid");
                     $upd->execute([':name' => $newName, ':gid' => $googleId]);
                     echo json_encode(['status' => 'updated', 'username' => $newName]);
                 } catch (PDOException $e) {
                     if ($e->getCode() == 23000) {
                        echo json_encode(['error' => 'Username taken']);
                     } else {
                        throw $e;
                     }
                 }
             } else {
                 echo json_encode(['error' => 'Empty name']);
             }
        } else {
             echo json_encode(['status' => 'registered', 'username' => $user['username']]);
        }
    } else {
        // Not found
        if (isset($input['username'])) {
            // Registering
            $name = trim($input['username']);
            if (empty($name)) {
                echo json_encode(['error' => 'Empty name']);
                exit;
            }
            // Check name uniqueness? (Table has UNIQUE on username)
            
            try {
                $ins = $pdo->prepare("INSERT INTO shogi_ranking_standard (username, google_user_id, rate) VALUES (:name, :gid, 1500)");
                $ins->execute([':name' => $name, ':gid' => $googleId]);
                echo json_encode(['status' => 'registered', 'username' => $name]);
            } catch (PDOException $e) {
                if ($e->getCode() == 23000) {
                    echo json_encode(['error' => 'Username taken']);
                } else {
                    throw $e;
                }
            }
        } else {
            // Just checking, not found
            echo json_encode(['status' => 'not_registered']);
        }
    }

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
