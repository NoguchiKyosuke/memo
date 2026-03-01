<?php
require_once 'includes/head.php';
require_once 'includes/common.php';

$title = 'メモ';
$description = '情報系のメモを中心に記録しているメモブログです。';
$keywords = '音声解析,機械学習,メモ';

renderHead($title, $description, $keywords);
?>
<body>
<?php renderNavigation('home'); ?>

<main class="container fade-in">
  <section class="hero" style="text-align: center; padding: 4rem 0;">
    <h1 style="font-size: 3rem; margin-bottom: 0;">メモ帳</h1>
  </section>

  <section>
    <div class="card-grid">
      <a class="card home-card card-voice" href="/memo/">
        <h3>メモ</h3>
      </a>

      <a class="card home-card card-time" href="/clock/">
        <h3>デジタル時計</h3>
      </a>

      <a class="card home-card card-vocab" href="/vocabulary_app/">
        <h3>単語帳アプリ</h3>
      </a>

      <a class="card home-card card-game" href="/game/">
        <h3>GAME PORTAL</h3>
      </a>

      <a class="card home-card card-game" href="/protype/">
        <h3>ミニアプリ</h3>
      </a>
    </div>
  </section>
</main>

<?php renderFooter(); ?>

<!-- 構造化データ（パンくずリスト） -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ホーム",
  "item": "https://memosite.jp/"
    }
  ]
}
</script>

</body>
</html>