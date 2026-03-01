<?php
require_once 'db.php';
require_once 'functions.php';

$token = isset($_GET['token']) ? $_GET['token'] : '';
$message = '';
$success = false;

if ($token) {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE verification_token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $pdo->prepare("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?");
        if ($stmt->execute([$user['id']])) {
            $success = true;
            $message = "Email verified successfully! You can now login.";
        } else {
            $message = "Verification failed. Please try again.";
        }
    } else {
        $message = "Invalid or expired verification token.";
    }
} else {
    $message = "No token provided.";
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - My Dictionary</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="card">
            <h2>Email Verification</h2>
            <?php if ($success): ?>
                <div class="alert alert-success">
                    <?php echo h($message); ?>
                    <br><br>
                    <a href="login.php" class="btn">Go to Login</a>
                </div>
            <?php else: ?>
                <div class="alert alert-danger">
                    <?php echo h($message); ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
