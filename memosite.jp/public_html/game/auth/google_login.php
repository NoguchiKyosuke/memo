<?php
require_once __DIR__ . '/../includes/session.php';
header('Content-Type: application/json');
require_once __DIR__ . '/../minecraft/api/db.php'; // Reuse shared DB connection

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
    http_response_code(400);
    echo json_encode(['error' => 'No credential provided', 'debug_post' => $_POST, 'debug_json' => $input]);
    exit;
}
$client_id = $input['client_id'] ?? null;

// Verify ID Token with Google endpoint (Simple verification)
// For production, using a library is recommended, but curl is fine for this lightweight setup.
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

// Verify Client ID (Audience)
// Ideally, check against your known client ID. user passes it for now, but backend should validate.
// if ($payload['aud'] !== 'YOUR_CLIENT_ID') ...

$google_sub = $payload['sub'];
$email = $payload['email'];
$name = $payload['name'];
$picture = $payload['picture'];

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE google_sub = ?");
    $stmt->execute([$google_sub]);
    $user = $stmt->fetch();

    if ($user) {
        $user_id = $user['id'];
        // Update info
        $update = $pdo->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
        $update->execute([$name, $email, $user_id]);
    } else {
        // Check if email already exists (legacy account link?)
        // For simplicity, we assume if no google_sub, it's a new or separate user.
        // Or we can try to link by email.
        $stmt_email = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt_email->execute([$email]);
        $existing_email = $stmt_email->fetch();

        if ($existing_email) {
            $user_id = $existing_email['id'];
            $link = $pdo->prepare("UPDATE users SET google_sub = ?, name = ? WHERE id = ?");
            $link->execute([$google_sub, $name, $user_id]);
        } else {
            // Create new user
            $insert = $pdo->prepare("INSERT INTO users (google_sub, email, name, is_verified) VALUES (?, ?, ?, 1)");
            $insert->execute([$google_sub, $email, $name]);
            $user_id = $pdo->lastInsertId();
        }
    }

    // Set Session
    $_SESSION['user_id'] = $user_id;
    $_SESSION['email'] = $email;
    $_SESSION['name'] = $name;
    $_SESSION['google_sub'] = $google_sub;
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user_id,
            'name' => $name,
            'email' => $email,
            'picture' => $picture
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
