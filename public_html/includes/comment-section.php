<?php
/**
 * コメントセクション表示関数
 * 
 * @param string $articleId 記事を一意に識別するID（ファイル名に使用されます）
 */
function renderComments($articleId) {
    // 記事IDのバリデーション（英数字・ハイフン・アンダースコアのみ）
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $articleId)) {
        echo '<p class="error">Invalid Article ID for comments.</p>';
        return;
    }

    // コメントデータの読み込み
    // public_html/includes/ から見て ../../mail/memosite.jp/comments/
    $storageDir = dirname(__DIR__, 2) . '/mail/memosite.jp/comments';
    $filePath = $storageDir . '/' . $articleId . '.json';
    
    $comments = [];
    if (file_exists($filePath)) {
        $json = file_get_contents($filePath);
        if ($json !== false) {
            $decoded = json_decode($json, true);
            if (is_array($decoded)) {
                $comments = $decoded;
            }
        }
    }

    // ステータスメッセージの取得
    $status = $_GET['status'] ?? '';
    $message = '';
    $messageClass = '';
    
    switch ($status) {
        case 'success_comment':
            $message = 'コメントを投稿しました。';
            $messageClass = 'alert-success';
            break;
        case 'error_validation':
            $message = '入力内容に不備があります。名前とコメントを確認してください。';
            $messageClass = 'alert-error';
            break;
        case 'error_cooldown':
            $message = '投稿間隔が短すぎます。少し待ってから再投稿してください。';
            $messageClass = 'alert-error';
            break;
        case 'error_server':
        case 'error_busy':
        case 'error':
            $message = 'エラーが発生しました。後でもう一度お試しください。';
            $messageClass = 'alert-error';
            break;
    }

    $currentUrl = $_SERVER['REQUEST_URI'] ?? '/';
?>
<section id="comments-section" class="comments-section">
    <h3>コメント</h3>
    
    <?php if ($message !== ''): ?>
        <div class="alert <?php echo $messageClass; ?>" role="alert">
            <?php echo htmlspecialchars($message, ENT_QUOTES, 'UTF-8'); ?>
        </div>
    <?php endif; ?>

    <div class="comments-list">
        <?php if (empty($comments)): ?>
            <p class="no-comments">この記事にはまだコメントがありません。</p>
        <?php else: ?>
            <?php foreach ($comments as $comment): ?>
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-name"><?php echo htmlspecialchars($comment['name'] ?? '名無し', ENT_QUOTES, 'UTF-8'); ?></span>
                        <span class="comment-date">
                            <?php 
                                if (isset($comment['timestamp'])) {
                                    $dt = new DateTime($comment['timestamp']);
                                    echo $dt->format('Y/m/d H:i');
                                }
                            ?>
                        </span>
                    </div>
                    <div class="comment-body">
                        <?php echo nl2br(htmlspecialchars($comment['message'] ?? '', ENT_QUOTES, 'UTF-8')); ?>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <div class="comment-form-wrapper">
        <h4>コメントを投稿する</h4>
        <form action="/comment.php" method="post" class="comment-form">
            <input type="hidden" name="article_id" value="<?php echo htmlspecialchars($articleId, ENT_QUOTES, 'UTF-8'); ?>">
            <input type="hidden" name="redirect" value="<?php echo htmlspecialchars($currentUrl, ENT_QUOTES, 'UTF-8'); ?>">
            
            <div class="form-group">
                <label for="comment-name">お名前</label>
                <input type="text" name="name" id="comment-name" maxlength="50" required placeholder="お名前">
            </div>
            
            <div class="form-group">
                <label for="comment-message">コメント</label>
                <textarea name="message" id="comment-message" rows="4" maxlength="1000" required placeholder="コメントを入力してください"></textarea>
            </div>

            <!-- Honeypot -->
            <div style="display:none;" aria-hidden="true">
                <label for="comment-website">Website</label>
                <input type="text" name="website" id="comment-website" tabindex="-1" autocomplete="off">
            </div>

            <button type="submit" class="btn-submit">投稿する</button>
        </form>
    </div>
</section>

<style>
/* コメントセクション用の簡易スタイル（app.cssに統合しても良い） */
.comments-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #eee;
}
.comments-list {
    margin-bottom: 2rem;
}
.comment-item {
    background: #f9f9f9;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
}
.comment-header {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: space-between;
}
.comment-name {
    font-weight: bold;
    color: #333;
}
.comment-form-wrapper {
    background: #fff;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}
.comment-form .form-group {
    margin-bottom: 1rem;
}
.comment-form label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}
.comment-form input[type="text"],
.comment-form textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}
.alert {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
}
.alert-success {
    background-color: #d4edda;
    color: #155724;
}
.alert-error {
    background-color: #f8d7da;
    color: #721c24;
}
</style>
<?php
}
?>
