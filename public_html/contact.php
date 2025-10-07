<?php
declare(strict_types=1);

/**
 * お問い合わせフォーム送信処理
 */

// レート制限: セッションベースで同一ユーザーの連続送信を防ぐ
session_start();
$now = time();
$cooldownPeriod = 60; // 60秒のクールダウン

if (isset($_SESSION['last_contact_time'])) {
    $timeSinceLastSubmit = $now - $_SESSION['last_contact_time'];
    if ($timeSinceLastSubmit < $cooldownPeriod) {
        // クールダウン期間中は静かに成功として返す（攻撃者に情報を与えない）
        $redirectTarget = sanitizeRedirect($_POST['redirect'] ?? '/');
        redirectWithStatus($redirectTarget, 'success');
    }
}

$redirectTarget = sanitizeRedirect($_POST['redirect'] ?? '/');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method !== 'POST') {
    redirectWithStatus($redirectTarget, 'error');
}

$honeypot = trim((string)($_POST['website'] ?? ''));
if ($honeypot !== '') {
    redirectWithStatus($redirectTarget, 'success');
}

// スパム検出: 疑わしいパターンをチェック
$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));
$topic = trim((string)($_POST['topic'] ?? 'general'));

// スパムキーワードチェック（大文字小文字区別なし）
$spamKeywords = ['viagra', 'cialis', 'casino', 'bitcoin', 'crypto', 'loan', 'prize', 'winner', 'click here', 'buy now'];
$messageL = mb_strtolower($message, 'UTF-8');
foreach ($spamKeywords as $keyword) {
    if (mb_strpos($messageL, $keyword) !== false) {
        // スパムとして静かに成功を返す
        redirectWithStatus($redirectTarget, 'success');
    }
}

// URL の過剰な埋め込みチェック（5個以上のリンクはスパム）
if (preg_match_all('/https?:\/\//', $message) > 5) {
    redirectWithStatus($redirectTarget, 'success');
}

$allowedTopics = ['general', 'partnership', 'media', 'feedback'];

$errors = [];
if ($name === '' || stringLength($name) > 80) {
    $errors[] = 'name';
}
if ($email === '' || stringLength($email) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}
if ($message === '' || stringLength($message) < 10 || stringLength($message) > 2000) {
    $errors[] = 'message';
}
if ($topic === '' || !in_array($topic, $allowedTopics, true)) {
    $topic = 'general';
}

if ($errors !== []) {
    redirectWithStatus($redirectTarget, 'error');
}

$submission = [
    'name' => $name,
    'email' => $email,
    'topic' => $topic,
    'message' => $message,
    'submitted_at' => (new DateTimeImmutable('now', new DateTimeZone('Asia/Tokyo')))->format(DATE_ATOM),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
];

$storageDir = dirname(__DIR__) . '/mail/memo-site.com/inquiries';
if (!is_dir($storageDir)) {
    if (!mkdir($storageDir, 0775, true) && !is_dir($storageDir)) {
        redirectWithStatus($redirectTarget, 'error');
    }
}

$fileName = sprintf('%s_%s.json', (new DateTimeImmutable('now', new DateTimeZone('Asia/Tokyo')))->format('Ymd_His'), bin2hex(random_bytes(4)));
$filePath = $storageDir . '/' . $fileName;

if (file_put_contents($filePath, json_encode($submission, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) === false) {
    redirectWithStatus($redirectTarget, 'error');
}

// レート制限: 送信成功時にタイムスタンプを記録
$_SESSION['last_contact_time'] = $now;

$recipient = getenv('CONTACT_RECIPIENT');
$recipient = is_string($recipient) ? trim($recipient) : '';
if ($recipient === '') {
    $recipient = 'k.noguchi2005@gmail.com';
}

if (filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    $subject = '【Memo Site】新しいお問い合わせが届きました';
    $body = buildEmailBody($submission);
    $headers = buildEmailHeaders($email);
    @mail($recipient, $subject, $body, $headers);
}

redirectWithStatus($redirectTarget, 'success');

function stringLength(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}

function sanitizeRedirect($value): string
{
    if (!is_string($value)) {
        return '/';
    }
    $value = trim(str_replace(["\r", "\n"], '', $value));
    if ($value === '') {
        return '/';
    }
    if ($value[0] === '?') {
        $value = '/' . $value;
    }
    if ($value[0] !== '/') {
        return '/';
    }
    if (preg_match('/^\/\//', $value) === 1 || stripos($value, '://') !== false) {
        return '/';
    }
    return $value;
}

function redirectWithStatus(string $url, string $status): void
{
    $sanitized = sanitizeRedirect($url);
    $parsed = parse_url($sanitized);

    $path = $parsed['path'] ?? '/';
    if ($path === '') {
        $path = '/';
    }

    $queryParams = [];
    if (!empty($parsed['query'])) {
        parse_str($parsed['query'], $queryParams);
    }
    $queryParams['contact'] = $status;

    $queryString = http_build_query($queryParams);
    $redirectUrl = $path;
    if ($queryString !== '') {
        $redirectUrl .= '?' . $queryString;
    }
    if (!empty($parsed['fragment'])) {
        $redirectUrl .= '#' . $parsed['fragment'];
    }

    header('Location: ' . $redirectUrl);
    exit;
}

function buildEmailBody(array $submission): string
{
    // XSS やインジェクション対策としてすべての値をエスケープ
    $lines = [
        'Memo Site から新しいお問い合わせが届きました。',
        '',
        'お名前: ' . htmlspecialchars($submission['name'], ENT_QUOTES, 'UTF-8'),
        'メールアドレス: ' . htmlspecialchars($submission['email'], ENT_QUOTES, 'UTF-8'),
        'ご用件: ' . htmlspecialchars($submission['topic'], ENT_QUOTES, 'UTF-8'),
        '送信日時: ' . htmlspecialchars($submission['submitted_at'], ENT_QUOTES, 'UTF-8'),
        '送信元IP: ' . htmlspecialchars($submission['ip'], ENT_QUOTES, 'UTF-8'),
        'ユーザーエージェント: ' . htmlspecialchars($submission['user_agent'], ENT_QUOTES, 'UTF-8'),
        '',
        '--- お問い合わせ内容 ---',
        htmlspecialchars($submission['message'], ENT_QUOTES, 'UTF-8'),
    ];

    return implode("\n", $lines);
}

function buildEmailHeaders(string $replyTo): string
{
    // Reply-To のメールヘッダーインジェクション対策を強化
    $replyTo = filter_var($replyTo, FILTER_SANITIZE_EMAIL);
    $replyTo = str_replace(["\r", "\n", "%0a", "%0d"], '', $replyTo);
    
    // 無効なメールアドレスの場合はデフォルトを使用
    if (!filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $replyTo = 'noreply@memo-site.com';
    }
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'From: noreply@memo-site.com',
        'Reply-To: ' . $replyTo,
        'X-Mailer: PHP/' . phpversion(),
        'X-Priority: 3',
    ];

    return implode("\r\n", $headers);
}
