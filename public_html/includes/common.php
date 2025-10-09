<?php
/**
 * 共通ナビゲーション
 */
function renderNavigation($currentPage = '') {
?>
<header class="site-header">
  <div class="container flex-between">
    <div class="brand">プラットフォームポータル</div>
    <nav class="main-nav">
      <a href="/" <?php echo ($currentPage === 'home') ? 'class="active"' : ''; ?>>ホーム</a>
      <a href="/sdv.php" <?php echo ($currentPage === 'sdv') ? 'class="active"' : ''; ?>>SDV</a>
      <a href="/voice/" <?php echo (in_array($currentPage, ['voice', 'speech', 'jspaw'])) ? 'class="active"' : ''; ?>>音声研究</a>
    </nav>
  </div>
</header>
<?php
}

/**
 * 共通フッター
 */
function renderFooter() {
    $currentUrl = $_SERVER['REQUEST_URI'] ?? '/';
    $currentUrl = str_replace(["\r", "\n"], '', $currentUrl);
    if ($currentUrl === '') {
        $currentUrl = '/';
    }
    if ($currentUrl[0] !== '/') {
        $currentUrl = '/' . ltrim($currentUrl, '/');
    }

  $status = '';
  if (isset($_GET['contact'])) {
    $rawStatus = $_GET['contact'];
    if (is_string($rawStatus)) {
      $status = $rawStatus;
    }
  }
    $feedbackMessage = '';
    $feedbackClass = '';

    switch ($status) {
        case 'success':
            $feedbackMessage = 'お問い合わせを受け付けました。通常24時間以内にご連絡いたします。';
            $feedbackClass = 'footer-alert footer-alert-success';
            break;
        case 'error':
            $feedbackMessage = '入力内容をご確認ください。すべての必須項目を正しくご入力ください。';
            $feedbackClass = 'footer-alert footer-alert-error';
            break;
        default:
            $feedbackMessage = '';
            $feedbackClass = '';
            break;
    }
?>
<footer class="site-footer">
  <div class="container footer-container">
    <div class="footer-grid">
      <div class="footer-info">
        <h2 class="footer-title">お問い合わせ</h2>
        <p class="footer-description">SDV や音声解析に関するご相談・取材・共同研究のご依頼など、お気軽にご連絡ください。内容に応じて担当者より折り返しさせていただきます。</p>
      </div>
      <form class="footer-form" action="/contact.php" method="post" accept-charset="UTF-8">
        <div class="footer-form-field">
          <label for="footer-name">お名前 <span class="required">必須</span></label>
          <input type="text" name="name" id="footer-name" maxlength="80" required placeholder="例: 山田 太郎" />
        </div>
        <div class="footer-form-field">
          <label for="footer-email">メールアドレス <span class="required">必須</span></label>
          <input type="email" name="email" id="footer-email" maxlength="120" required placeholder="example@example.com" />
        </div>
        <div class="footer-form-field">
          <label for="footer-message">お問い合わせ内容 <span class="required">必須</span></label>
          <textarea name="message" id="footer-message" rows="4" minlength="10" maxlength="2000" required placeholder="お問い合わせ内容をご記入ください"></textarea>
        </div>
        <div class="footer-form-field compact">
          <label for="footer-topic">ご用件</label>
          <select name="topic" id="footer-topic">
            <option value="general">一般的なお問い合わせ</option>
            <option value="partnership">協業・パートナーシップ</option>
            <option value="media">メディア・取材</option>
            <option value="feedback">サイトへのフィードバック</option>
          </select>
        </div>
        <div class="footer-form-actions">
          <input type="hidden" name="redirect" value="<?php echo htmlspecialchars($currentUrl, ENT_QUOTES, 'UTF-8'); ?>" />
          <div class="footer-trap" aria-hidden="true">
            <label for="footer-website">ウェブサイト</label>
            <input type="text" name="website" id="footer-website" tabindex="-1" autocomplete="off" />
          </div>
          <button type="submit">送信する</button>
        </div>
      </form>
    </div>

    <?php if ($feedbackMessage !== ''): ?>
    <div class="<?php echo $feedbackClass; ?>" role="status" aria-live="polite">
      <?php echo htmlspecialchars($feedbackMessage, ENT_QUOTES, 'UTF-8'); ?>
    </div>
    <?php endif; ?>

    <div class="footer-meta small">&copy; <?php echo date('Y'); ?> プラットフォームポータル</div>
  </div>

  <?php if ($feedbackMessage !== ''): ?>
  <script>
    (function() {
      try {
        var url = new URL(window.location.href);
        if (url.searchParams.has('contact')) {
          url.searchParams.delete('contact');
          window.history.replaceState({}, document.title, url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash);
        }
      } catch (e) {
        /* noop */
      }
    })();
  </script>
  <?php endif; ?>
</footer>
<?php
}
?>