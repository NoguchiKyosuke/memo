<?php
require_once __DIR__ . '/../includes/session.php'; // Ensures session is started

if (!isset($_SESSION['user_id'])) {
    // Redirect to Game Portal (Login Page)
    header("Location: /game/?login_required=1");
    exit;
}
?>
