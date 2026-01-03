<?php
require_once '../includes/head.php';
require_once '../includes/common.php';
require_once '../includes/ad-a8.php';
require_once '../includes/image-helper.php';
require_once __DIR__ . '/../includes/comment-section.php';

$title = 'AASISTの論文を調査した．';
$description = 'AASISTの論文を調査した．';
$keywords = 'AASIST,論文,調査';
$canonical = 'https://memosite.jp/voice/aasist_paper.php';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('voice'); ?>

<main class="container fade-in" style="max-width:880px;margin:0 auto;padding:2.2rem 0 3rem;">
  <article>
    <header>
      <h1>AASISTの論文を調査した <span class="update-info"><?php echo date('Y年m月d日更新', filemtime(__FILE__)); ?></span></h1>
      <p class="lead">AASISTの論文を調査した。</p>
      <div class="article-meta" style="margin-top:1rem;">
        <span class="tag">AASIST</span>
        <span class="tag">論文</span>
      </div>
    </header>

    <section>
      <p>
        今回使用した論文は，<a href="https://arxiv.org/abs/2110.01200">AASIST: AUDIO ANTI-SPOOFING USING INTEGRATED SPECTRO-TEMPORAL GRAPH ATTENTION NETWORKS</a>です．
      </p>
      <h2>ABSTRACT</h2>
      <p>
        なりすまし音声と人間の音声を区別するための要因は，スペクトル領域と時間領域の二つの領域において存在する可能性がある．ただし，両方の領域を満たす学習は計算量が大きい傾向にある．ここで，AASISTは一つのシステムむとして効率的な計算によってなりすまし音声を検出するシステムを作成した．このシステムにおいては，
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
