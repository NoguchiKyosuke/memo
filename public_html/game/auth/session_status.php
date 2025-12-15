<?php
require_once __DIR__ . '/../includes/session.php';
header('Content-Type: application/json');

echo json_encode(['logged_in' => isset($_SESSION['user_id'])]);
