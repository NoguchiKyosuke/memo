<?php
declare(strict_types=1);

/**
 * コメント投稿処理
 */

session_start();
$now = time();
$cooldownPeriod = 10; // 10秒のクールダウン（連投防止）

// レート制限
if (isset($_SESSION['last_comment_time'])) {
    $timeSinceLastSubmit = $now - $_SESSION['last_comment_time'];
    if ($timeSinceLastSubmit < $cooldownPeriod) {
        $redirectTarget = sanitizeRedirect($_POST['redirect'] ?? '/');
        redirectWithStatus($redirectTarget, 'error_cooldown');
    }
}

$redirectTarget = sanitizeRedirect($_POST['redirect'] ?? '/');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method !== 'POST') {
    redirectWithStatus($redirectTarget, 'error');
}

// Honeypot check
$honeypot = trim((string)($_POST['website'] ?? ''));
if ($honeypot !== '') {
    redirectWithStatus($redirectTarget, 'success'); // Silently fail
}

$articleId = trim((string)($_POST['article_id'] ?? ''));
$name = trim((string)($_POST['name'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

// バリデーション
$errors = [];

// Article ID: 英数字、ハイフン、アンダースコアのみ許可
if ($articleId === '' || !preg_match('/^[a-zA-Z0-9_-]+$/', $articleId)) {
    $errors[] = 'article_id';
}

if ($name === '' || stringLength($name) > 50) {
    $errors[] = 'name';
}
// 名前が「管理人」などの詐称を防ぐ簡易チェック（必要なら追加）

if ($message === '' || stringLength($message) > 1000) {
    $errors[] = 'message';
}

if ($errors !== []) {
    redirectWithStatus($redirectTarget, 'error_validation');
}

// 保存データ構築
$commentData = [
    'id' => uniqid('', true),
    'name' => $name,
    'message' => $message,
    'timestamp' => (new DateTimeImmutable('now', new DateTimeZone('Asia/Tokyo')))->format(DATE_ATOM),
    // IPアドレスはハッシュ化して保存（プライバシー配慮しつつ同一性確認用）
    'ip_hash' => hash('sha256', $_SERVER['REMOTE_ADDR'] ?? ''),
];

// 保存先ディレクトリ
$storageDir = dirname(__DIR__) . '/mail/memosite.jp/comments';
if (!is_dir($storageDir)) {
    if (!mkdir($storageDir, 0777, true) && !is_dir($storageDir)) {
        error_log("Failed to create comments directory: $storageDir");
        redirectWithStatus($redirectTarget, 'error_server');
    }
}

$filePath = $storageDir . '/' . $articleId . '.json';

// 排他制御付きでファイル読み書き
$fp = fopen($filePath, 'c+');
if ($fp === false) {
    error_log("Failed to open comment file: $filePath");
    redirectWithStatus($redirectTarget, 'error_server');
}

if (flock($fp, LOCK_EX)) {
    $fileContent = stream_get_contents($fp);
    $comments = [];
    if ($fileContent !== false && $fileContent !== '') {
        $decoded = json_decode($fileContent, true);
        if (is_array($decoded)) {
            $comments = $decoded;
        }
    }

    // 新しいコメントを追加
    $comments[] = $commentData;

    // ファイルを空にして書き込み
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($comments, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
} else {
    error_log("Failed to lock comment file: $filePath");
    redirectWithStatus($redirectTarget, 'error_busy');
}

fclose($fp);

// 成功時
$_SESSION['last_comment_time'] = $now;
redirectWithStatus($redirectTarget, 'success_comment');


// --- Helper Functions ---

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
    // プロトコル付きや // で始まるURLは拒否（オープンリダイレクト対策）
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
    // ステータスを上書き
    $queryParams['status'] = $status;
    // コメントエリアにスクロールするためのフラグメント
    $fragment = 'comments-section';

    $queryString = http_build_query($queryParams);
    $redirectUrl = $path;
    if ($queryString !== '') {
        $redirectUrl .= '?' . $queryString;
    }
    $redirectUrl .= '#' . $fragment;

    header('Location: ' . $redirectUrl);
    exit;
}
