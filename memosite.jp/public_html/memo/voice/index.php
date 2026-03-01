<?php
require_once '../../includes/head.php';
require_once '../../includes/common.php';
require_once '../../includes/ad-a8.php';
require_once '../../includes/voice-articles.php';
require_once '../../includes/article-helper.php';

$title = '音声研究メモ - メモ帳';
$description = '音声解析と音声言語処理に関する研究メモの一覧。MFCC、DTW、機械学習、最新の研究論文など、音声処理技術について学べます。';
$keywords = '音声研究,音声解析,音声処理,機械学習,研究メモ,MFCC,DTW,J-SPAW';
$canonical = 'https://memosite.jp/memo/voice/';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('memo'); ?>

<main class="container fade-in">
  <?php
  renderBreadcrumb([
      ['label' => 'ホーム', 'url' => '/'],
      ['label' => 'メモ', 'url' => '/memo/'],
      ['label' => '音声研究メモ'],
  ]);
  ?>
  <section class="hero">
    <h1>音声研究メモ</h1>
    <p class="lead">音声解析と音声言語処理に関する技術メモと研究文献のコレクション。基礎技術から最新研究まで幅広くカバーします。</p>
  </section>
  <?php renderA8Ad(); ?>

  <section>
    <h2 class="section-title">研究記事一覧</h2>
    <p style="margin-bottom:1.5rem;color:var(--text-dim);font-size:.9rem;">
      全 <?php echo getVoiceArticleCount(); ?> 件の記事があります
    </p>
    
    <div class="card-grid">
      <?php
      $articles = getVoiceArticles();
      foreach ($articles as $article):
      ?>
      <a class="card article-card" href="<?php echo htmlspecialchars($article['slug'], ENT_QUOTES, 'UTF-8'); ?>">
        <div class="card-head">
          <h3><?php echo htmlspecialchars($article['title'], ENT_QUOTES, 'UTF-8'); ?></h3>
        </div>
        <p><?php echo htmlspecialchars($article['description'], ENT_QUOTES, 'UTF-8'); ?></p>
        
        <div class="article-tags">
          <?php foreach ($article['tags'] as $tag): ?>
          <span class="tag"><?php echo htmlspecialchars($tag, ENT_QUOTES, 'UTF-8'); ?></span>
          <?php endforeach; ?>
        </div>
        
        <div class="article-date"><?php echo htmlspecialchars($article['date'], ENT_QUOTES, 'UTF-8'); ?></div>
      </a>
      <?php endforeach; ?>
    </div>
  </section>

  <section style="margin-top:3rem;">
    <h2 class="section-title">関連リソース</h2>
    <div class="card-grid">
      <div class="card">
        <div class="card-head">
          <h3>外部リンク</h3>
        </div>
        <ul class="api-list" style="margin-top:.8rem;">
          <li><a href="https://github.com/takamichi-lab/j-spaw" target="_blank" rel="noopener">J-SPAW Dataset (GitHub)</a></li>
          <li><a href="https://librosa.org/" target="_blank" rel="noopener">librosa - Python音声処理ライブラリ</a></li>
        </ul>
      </div>
    </div>
  </section>
</main>

<?php renderFooter(); ?>

<?php
renderBreadcrumbJsonLd([
    ['label' => 'ホーム', 'url' => '/'],
    ['label' => 'メモ', 'url' => '/memo/'],
    ['label' => '音声研究メモ', 'url' => '/memo/voice/'],
]);
?>

<!-- 構造化データ（コレクション） -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "音声研究メモ",
  "description": "音声解析と音声言語処理に関する研究メモの一覧",
  "url": "https://memosite.jp/memo/voice/",
  "about": {
    "@type": "Thing",
    "name": "音声処理技術"
  }
}
</script>

</body>
</html>
