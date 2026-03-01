<?php
// Set session lifetime to 30 days
ini_set('session.gc_maxlifetime', 60 * 60 * 24 * 30);
ini_set('session.cookie_lifetime', 60 * 60 * 24 * 30);

session_start();

// Extend session on activity
if (isset($_SESSION['user_id'])) {
    setcookie(session_name(), session_id(), time() + 60 * 60 * 24 * 30, "/");
}
?>
