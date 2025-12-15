<?php
require_once 'db.php';
require_once 'functions.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $log = date('Y-m-d H:i:s') . " - Request received.\n";
    $log .= "POST: " . print_r($_POST, true) . "\n";
    $log .= "Session User ID: " . ($_SESSION['user_id'] ?? 'None') . "\n";
    
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $log .= "Target ID: $id\n";
    
    if ($id > 0) {
        $stmt = $pdo->prepare("SELECT user_id FROM vocabulary WHERE id = ?");
        $stmt->execute([$id]);
        $word = $stmt->fetch();
        
        if ($word) {
            $log .= "Word Owner ID: " . $word['user_id'] . "\n";
            if ((int)$word['user_id'] === (int)$_SESSION['user_id']) {
                $stmt = $pdo->prepare("DELETE FROM vocabulary WHERE id = ?");
                if ($stmt->execute([$id])) {
                    $log .= "Deletion SUCCESS.\n";
                    // Redirect...
                } else {
                    $log .= "Deletion FAILED (SQL Error).\n";
                }
            } else {
                $log .= "Ownership mismatch.\n";
            }
        } else {
            $log .= "Word not found.\n";
        }
    } else {
        $log .= "Invalid ID.\n";
    }
    file_put_contents('debug_delete_full.txt', $log, FILE_APPEND);
    
    // Original logic continues...
    if ($id > 0) {
        // Verify the word belongs to the current user
        $stmt = $pdo->prepare("DELETE FROM vocabulary WHERE id = ? AND user_id = ?");
        if ($stmt->execute([$id, $_SESSION['user_id']])) {
            // Success
            header("Location: dashboard.php?msg=deleted");
            exit;
        }
    }
}

// If something went wrong or invalid request
header("Location: dashboard.php?error=delete_failed");
exit;
