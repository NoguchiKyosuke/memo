<?php
declare(strict_types=1);

/**
 * お問い合わせフォーム送信処理
 */

$redirectTarget = sanitizeRedirect($_POST['redirect'] ?? '/');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method !== 'POST') {
    redirectWithStatus($redirectTarget, 'error');
}

$honeypot = trim((string)($_POST['website'] ?? ''));
if ($honeypot !== '') {
    redirectWithStatus($redirectTarget, 'success');
}

$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));
$topic = trim((string)($_POST['topic'] ?? 'general'));
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
    $lines = [
        'Memo Site から新しいお問い合わせが届きました。',
        '',
        'お名前: ' . $submission['name'],
        'メールアドレス: ' . $submission['email'],
        'ご用件: ' . $submission['topic'],
        '送信日時: ' . $submission['submitted_at'],
        '送信元IP: ' . $submission['ip'],
        'ユーザーエージェント: ' . $submission['user_agent'],
        '',
        '--- お問い合わせ内容 ---',
        $submission['message'],
    ];

    return implode("\n", $lines);
}

function buildEmailHeaders(string $replyTo): string
{
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'From: noreply@memo-site.com',
        'Reply-To: ' . $replyTo,
    ];

    return implode("\r\n", $headers);
}
