<?php
require_once 'includes/head.php';
require_once 'includes/common.php';
require_once 'includes/ad.php';

$title = 'プラットフォームポータル - SDVと音声解析の技術リソース';
$description = 'Software Defined Vehicle (SDV) と音声解析に関する技術メモとリソース。最新の自動車ソフトウェア技術と機械学習による音声処理について学べます。';
$keywords = 'SDV,Software Defined Vehicle,音声解析,機械学習,自動車ソフトウェア,技術メモ,プラットフォーム';

renderHead($title, $description, $keywords);
?>
<body>
<?php renderNavigation('home'); ?>

<main class="container fade-in">
  <section class="hero">
    <h1>メモ帳</h1>
    <p class="lead">対象領域: Software Defined Vehicle (SDV) と 音声解析。統合された安全で可視化可能なバックエンド。</p>
    <div class="status-row" id="global-status" aria-live="polite"></div>
  </section>

  <section>
    <h2 class="section-title">領域</h2>
    <div class="card-grid">
      <a class="card" href="/sdv.php">
        <div class="card-head">
          <h3>SDV (Software Defined Vehicle)</h3>
        </div>
        <p>Software Defined Vehicle に関する知見。車載ソフトウェアとアーキテクチャについて学べます。</p>
        <div class="badge" data-service="sdv">loading...</div>
      </a>

      <a class="card" href="/speech.php">
        <div class="card-head">
          <h3>音声解析</h3>
        </div>
        <p>音声解析に関するメモと数式。機械学習による音声処理技術について解説します。</p>
        <div class="badge" data-service="speech">loading...</div>
      </a>

      <a class="card" href="/jspaw.php">
        <div class="card-head">
          <h3>J-SPAW研究文献</h3>
        </div>
        <p>音声言語処理に関する最新研究文献の紹介。J-SPAW 2024で発表された論文について詳しく解説します。</p>
        <div class="badge" data-service="jspaw">loading...</div>
      </a>
    </div>
  </section>
</main>

<div class="hero-ad" style="margin-top:1.6rem;display:flex;justify-content:center;">
  <?php renderAdBanner(); ?>
</div>

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
      "item": "https://memo-site.com/"
    }
  ]
}
</script>

</body>
</html>