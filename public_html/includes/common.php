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
      <a href="/speech.php" <?php echo ($currentPage === 'speech') ? 'class="active"' : ''; ?>>音声</a>
      <a href="/api/v1/health" target="_blank" rel="noopener">API 状態</a>
    </nav>
  </div>
</header>
<?php
}

/**
 * 共通フッター
 */
function renderFooter() {
?>
<footer class="site-footer">
  <div class="container small">&copy; <?php echo date('Y'); ?> プラットフォームポータル</div>
</footer>
<?php
}
?>