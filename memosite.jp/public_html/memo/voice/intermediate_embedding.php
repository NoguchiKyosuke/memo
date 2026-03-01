<?php
require_once '../../includes/head.php';
require_once '../../includes/common.php';
require_once '../../includes/ad-a8.php';
require_once '../../includes/image-helper.php';
require_once __DIR__ . '/../../includes/comment-section.php';

$title = 'GNNにおける中間埋め込みについて';
$description = 'GNNにおける中間埋め込みについてわからなかった点を調査した．';
$keywords = 'GNN,中間埋め込み,調査';
$canonical = 'https://memosite.jp/memo/voice/intermediate_embedding.php';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('memo'); ?>

<main class="container fade-in page-content">
  <article>
    <header>
      <h1>GNNにおける中間埋め込みについて <span class="update-info"><?php echo date('Y年m月d日更新', filemtime(__FILE__)); ?></span></h1>
      <p class="lead">GNNにおける中間埋め込みについて調査した。</p>
      <div class="article-meta" style="margin-top:1rem;">
        <span class="tag">GNN</span>
        <span class="tag">中間埋め込み</span>
      </div>
    </header>

    <section>
      <h2>中間埋め込みとは</h2>
      <p>
        中間埋め込みは，特徴マップなどともいわれ，ニューラルネットワークにおける入力層と　出力層の間の中間層の数値データを表す．
      </p>
      
      <p>
        グラフニューラルネットワークでは0番目の中間埋め込みがノード特徴量で初期化され，隣接するノードたちのひとつ前の中間埋め込みを集約して新しい中間埋め込みを生成する．
    </p>

    </section>

    <?php renderA8Ad(); ?>

  </article>
</main>

<?php renderFooter(); ?>

<!-- 構造化データ -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "GNNにおける中間埋め込みについて",
  "description": "GNNにおける中間埋め込みについてわからなかった点を調査した．",
  "author": {"@type": "Organization", "name": "メモ帳"},
  "datePublished": "2025-12-28",
  "dateModified": "<?php echo date('c', filemtime(__FILE__)); ?>",
  "mainEntityOfPage": {"@type": "WebPage", "@id": "https://memosite.jp/voice/intermediate_embedding.php"},
  "keywords": "GNN,中間埋め込み,調査"
}
</script>

<!-- 構造化データ（パンくず） -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://memosite.jp/"},
    {"@type": "ListItem", "position": 2, "name": "音声研究メモ", "item": "https://memosite.jp/voice/"},
    {"@type": "ListItem", "position": 3, "name": "GNNにおける中間埋め込みについて", "item": "https://memosite.jp/voice/intermediate_embedding.php"}
  ]
}
</script>

</body>
</html>
