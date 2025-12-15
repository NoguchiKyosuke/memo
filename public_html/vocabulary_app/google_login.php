<?php
require_once 'db.php';
require_once 'functions.php'; // For h() if needed, but mainly for session start if not in db.php (db.php doesn't start session potentially)

// Ensure session is started if not already
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

// Log for debugging
file_put_contents(__DIR__ . '/login_debug.log', date('Y-m-d H:i:s') . " Raw Input: " . file_get_contents('php://input') . "\n", FILE_APPEND);
file_put_contents(__DIR__ . '/login_debug.log', date('Y-m-d H:i:s') . " POST: " . print_r($_POST, true) . "\n", FILE_APPEND);

$input = json_decode(file_get_contents('php://input'), true);

$id_token = null;
if (isset($input['credential'])) {
    $id_token = $input['credential'];
} elseif (isset($_POST['credential'])) {
    $id_token = $_POST['credential'];
}

if (!$id_token) {
    // Debug what we received
    file_put_contents(__DIR__ . '/login_debug.log', "Error: No credential found. Input: " . print_r($input, true) . "\n", FILE_APPEND);
    http_response_code(400);
    echo json_encode(['error' => 'No credential provided', 'debug_input' => $input]);
    exit;
}

// Verify ID Token with Google endpoint (Simple verification)
$verify_url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . $id_token;
$response = @file_get_contents($verify_url);

if ($response === false) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

$payload = json_decode($response, true);

if (isset($payload['error'])) {
    http_response_code(401);
    echo json_encode(['error' => $payload['error_description']]);
    exit;
}

// Minimal data needed
$google_sub = $payload['sub'];
$email = $payload['email'];
$name = $payload['name'];
$picture = $payload['picture'];

try {
    // Check if user exists by google_sub
    $stmt = $pdo->prepare("SELECT id FROM users WHERE google_sub = ?");
    $stmt->execute([$google_sub]);
    $user = $stmt->fetch();

    if ($user) {
        $user_id = $user['id'];
        // Update user info
        $update = $pdo->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
        $update->execute([$name, $email, $user_id]);
    } else {
        // Fallback: Check by email to link accounts
        $stmt_email = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt_email->execute([$email]);
        $existing_email = $stmt_email->fetch();

        if ($existing_email) {
            $user_id = $existing_email['id'];
            // Link account
            $link = $pdo->prepare("UPDATE users SET google_sub = ?, name = ? WHERE id = ?");
            $link->execute([$google_sub, $name, $user_id]);
        } else {
            // Create new user
            // Note: vocabulary_app schema has is_verified. We can auto-verify Google users.
            
            // Generate a random generic password/token stub if strict mode requires it, but schema allows NULL password usually?
            // Checking schema.sql: password VARCHAR(255) - not explicitly NOT NULL in the CREATE, but often implied.
            // Let's check if we need to provide a dummy password or if nullable.
            // Based on earlier view_file of schema.sql: password VARCHAR(255) -- Nullable by default safely.
            
            $insert = $pdo->prepare("INSERT INTO users (google_sub, email, name, is_verified) VALUES (?, ?, ?, 1)");
            $insert->execute([$google_sub, $email, $name]);
            $user_id = $pdo->lastInsertId();
        }
    }

    // Set Session
    $_SESSION['user_id'] = $user_id;
    $_SESSION['email'] = $email;
    $_SESSION['name'] = $name;
    // vocabulary_app might rely on 'is_verified' check in login.php, but here we set session directly so they are logged in.
    
    echo json_encode([
        'success' => true,
        'redirect' => 'dashboard.php'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
