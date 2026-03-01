<?php
require_once '../../includes/head.php';
require_once '../../includes/common.php';
require_once '../../includes/ad-a8.php';
require_once '../../includes/discord-articles.php';
require_once '../../includes/article-helper.php';

$title = 'ディスコードボット作成';
$description = '無料でディスコードのボットを作成する過程をまとめた記事を作成します。';
$keywords = 'ボット,ディスコード,discord,無料,作成,ガイド';
$canonical = 'https://memosite.jp/memo/discord/';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('memo'); ?>

<main class="container fade-in">
  <?php
  renderBreadcrumb([
      ['label' => 'ホーム', 'url' => '/'],
      ['label' => 'メモ', 'url' => '/memo/'],
      ['label' => 'ディスコードボット作成'],
  ]);
  ?>
  <section class="hero">
    <h1>ディスコードボット作成</h1>
    <p class="lead">無料でディスコードのボットを作成する過程をまとめた記事を作成します。初心者から上級者まで、実践的な手順を解説します。</p>
  </section>
  <?php renderA8Ad(); ?>

  <section>
    <h2 class="section-title">ディスコードボット作成記事一覧</h2>
    <p style="margin-bottom:1.5rem;color:var(--text-dim);font-size:.9rem;">
      全 <?php echo getDiscordArticleCount(); ?> 件の記事があります
    </p>
    
    <div class="card-grid">
      <?php
      $articles = getDiscordArticles();
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
</main>

<?php renderFooter(); ?>

<?php
renderBreadcrumbJsonLd([
    ['label' => 'ホーム', 'url' => '/'],
    ['label' => 'メモ', 'url' => '/memo/'],
    ['label' => 'ディスコードボット作成メモ', 'url' => '/memo/discord/'],
]);
?>

<!-- 構造化データ（コレクション） -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "ディスコードボット作成メモ",
  "description": "ディスコードボット作成メモの一覧",
  "url": "https://memosite.jp/memo/discord/",
  "about": {
    "@type": "Thing",
    "name": "ディスコードボット作成技術"
  }
}
</script>

</body>
</html>
