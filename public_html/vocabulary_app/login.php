<?php
require_once 'db.php';
require_once 'functions.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);

    if (empty($email)) {
        $error = 'Please enter your email address.';
    } else {
        $stmt = $pdo->prepare("SELECT id, email, is_verified FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            if ($user['is_verified']) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['email'] = $user['email'];
                
                // Set remember me cookie if requested
                if (isset($_POST['remember'])) {
                    $token = bin2hex(random_bytes(32));
                    $stmt = $pdo->prepare("UPDATE users SET remember_token = ? WHERE id = ?");
                    $stmt->execute([$token, $user['id']]);
                    
                    setcookie('remember_me', $token, time() + (86400 * 30), "/", "", true, true); // 30 days, Secure, HttpOnly
                }

                header("Location: dashboard.php");
                exit;
            } else {
                $error = 'Please verify your email address before logging in.';
            }
        } else {
            $error = 'Email not found. Please register first.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - My Dictionary</title>
    <link rel="stylesheet" href="style.css?v=<?php echo time(); ?>">
</head>
<body>
    <header>
        <div class="container">
            <h1>My Dictionary</h1>
            <nav>
                <a href="register.php">Register</a>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="card">
            <h2>Login</h2>
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo h($error); ?></div>
            <?php endif; ?>
            <form method="post">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required placeholder="you@example.com" autocomplete="email">
                
                <div style="margin: 10px 0;">
                    <label>
                        <input type="checkbox" name="remember" value="1"> Remember Me
                    </label>
                </div>
                
                <button type="submit">Login</button>
            </form>

            <div class="divider" style="margin: 20px 0; text-align: center; border-bottom: 1px solid #eee; line-height: 0.1em;">
                <span style="background:#fff; padding:0 10px; color:#777;">OR</span>
            </div>

            <!-- Google Sign-In -->
            <div id="g_id_onload"
                 data-client_id="485681185238-18l5j0atohb9aubgveaucp7r5l0cfk6q.apps.googleusercontent.com"
                 data-callback="handleCredentialResponse"
                 data-auto_select="false"
                 data-auto_prompt="false">
            </div>
            <div class="g_id_signin"
                 data-type="standard"
                 data-size="large"
                 data-theme="outline"
                 data-text="sign_in_with"
                 data-shape="pill"
                 data-logo_alignment="left">
            </div>

            <script src="https://accounts.google.com/gsi/client" async defer></script>
            <script>
                function handleCredentialResponse(response) {
                    if (!response.credential) {
                        alert('Login failed: No credential received.');
                        return;
                    }

                    fetch('google_login.php', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ credential: response.credential })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            window.location.href = data.redirect;
                        } else {
                            alert('Login failed: ' + (data.error || 'Unknown error'));
                        }
                    })
                    .catch(e => {
                        console.error('Error:', e);
                        alert('An error occurred during login.');
                    });
                }
            </script>
        </div>
    </div>
</body>
</html>
