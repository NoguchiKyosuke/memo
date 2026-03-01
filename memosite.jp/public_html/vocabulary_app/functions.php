<?php
// Set session lifetime to 30 days (Unified with Game App)
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.gc_maxlifetime', 60 * 60 * 24 * 30);
    ini_set('session.cookie_lifetime', 60 * 60 * 24 * 30);
    session_start();
}

// Extend session on activity if logged in
if (isset($_SESSION['user_id'])) {
    setcookie(session_name(), session_id(), time() + 60 * 60 * 24 * 30, "/");
}

function isLoggedIn() {
    if (isset($_SESSION['user_id'])) {
        return true;
    }
    return checkAutoLogin();
}

function checkAutoLogin() {
    if (isset($_COOKIE['remember_me'])) {
        global $pdo;
        $token = $_COOKIE['remember_me'];
        
        $stmt = $pdo->prepare("SELECT id, email FROM users WHERE remember_token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            return true;
        }
    }
    return false;
}

function requireLogin() {
    if (!isLoggedIn()) {
        header("Location: login.php");
        exit;
    }
}

function h($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

function translateWithDeepL($text, $targetLang = 'JA') {
    $apiKey = '64a5cecc-5b44-4b2a-9c09-cc6a99dff5a3:fx';
    $url = 'https://api-free.deepl.com/v2/translate';

    $data = [
        'auth_key' => $apiKey,
        'text' => $text,
        'target_lang' => $targetLang
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $result = json_decode($response, true);
        if (isset($result['translations'][0]['text'])) {
            return $result['translations'][0]['text'];
        }
    }

    return "Translation failed.";
}
?>
