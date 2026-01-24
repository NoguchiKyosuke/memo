<?php
require_once 'db.php';
require_once 'functions.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    
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
