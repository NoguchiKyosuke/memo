<?php
require_once 'includes/head.php';
require_once 'includes/common.php';

$title = 'メモ帳 - SDVと音声解析の技術リソース';
$description = 'Software Defined Vehicle (SDV) と音声解析に関する技術メモとリソース。最新の自動車ソフトウェア技術と機械学習による音声処理について学べます。';
$keywords = 'SDV,Software Defined Vehicle,音声解析,機械学習,自動車ソフトウェア,技術メモ,プラットフォーム';

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
      <a class="card home-card card-sdv" href="/sdv.php">
        <h3>SDV</h3>
      </a>

      <a class="card home-card card-voice" href="/voice/">
        <h3>音声研究メモ</h3>
      </a>

      <a class="card home-card card-time" href="/timekeeper.php">
        <h3>タイムマネージャ</h3>
      </a>

      <a class="card home-card card-vocab" href="/vocabulary_app/">
        <h3>単語帳アプリ</h3>
      </a>

      <a class="card home-card card-ocr" href="/ocr_app/">
        <h3>AI OCR</h3>
      </a>

      <a class="card home-card card-game" href="/game/">
        <h3>GAME PORTAL</h3>
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