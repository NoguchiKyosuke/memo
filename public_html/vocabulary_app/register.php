<?php
require_once 'db.php';
require_once 'functions.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);

    if (empty($email)) {
        $error = 'Please enter your email address.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Invalid email format.';
    } else {
        // Check if email exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $error = 'Email already registered.';
        } else {
            // Create user (no password) with verification token
            $verification_token = bin2hex(random_bytes(16));
            $stmt = $pdo->prepare("INSERT INTO users (email, verification_token, is_verified) VALUES (?, ?, 0)");
            
            if ($stmt->execute([$email, $verification_token])) {
                // Send verification email
                $verify_link = "https://memosite.jp/vocabulary_app/verify.php?token=" . $verification_token;
                $subject = "Verify your account - My Dictionary";
                $message = "Please click the link below to verify your account:\n\n" . $verify_link;
                $headers = "From: no-reply@memosite.jp";
                
                mail($email, $subject, $message, $headers);
                
                $success = 'Registration successful! Please check your email to verify your account.';
            } else {
                $error = 'Something went wrong. Please try again.';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - My Dictionary</title>
    <link rel="stylesheet" href="style.css?v=<?php echo time(); ?>">
</head>
<body>
    <header>
        <div class="container">
            <h1>My Dictionary</h1>
            <nav>
                <a href="login.php">Login</a>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="card">
            <h2>Register</h2>
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo h($error); ?></div>
            <?php endif; ?>
            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo $success; ?></div>
            <?php endif; ?>
            <form method="post">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required placeholder="you@example.com">
                
                <button type="submit">Register & Login</button>
            </form>
        </div>
    </div>
</body>
</html>
