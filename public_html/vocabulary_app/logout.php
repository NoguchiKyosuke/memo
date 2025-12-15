<?php
require_once 'db.php';
require_once 'functions.php';

if (isLoggedIn()) {
    $user_id = $_SESSION['user_id'];
    
    // Clear token in DB
    $stmt = $pdo->prepare("UPDATE users SET remember_token = NULL WHERE id = ?");
    $stmt->execute([$user_id]);
    
    // Clear cookie
    setcookie('remember_me', '', time() - 3600, "/");
}

session_destroy();
header("Location: login.php");
exit;
?>
