<?php
require_once '../includes/head.php';
require_once '../includes/common.php';
require_once '../includes/ad.php';
require_once '../includes/voice-articles.php';

$title = '音声研究メモ - メモ帳';
$description = '音声解析と音声言語処理に関する研究メモの一覧。MFCC、DTW、機械学習、最新の研究論文など、音声処理技術について学べます。';
$keywords = '音声研究,音声解析,音声処理,機械学習,研究メモ,MFCC,DTW,J-SPAW';
$canonical = 'https://memo-site.com/voice/';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('voice'); ?>

<main class="container fade-in">
  <section class="hero">
    <h1>音声研究メモ</h1>
    <p class="lead">音声解析と音声言語処理に関する技術メモと研究文献のコレクション。基礎技術から最新研究まで幅広くカバーします。</p>
  </section>

  <?php renderAdBanner(); ?>

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
          <span class="article-icon"><?php echo $article['icon']; ?></span>
          <h3><?php echo htmlspecialchars($article['title'], ENT_QUOTES, 'UTF-8'); ?></h3>
        </div>
        <p><?php echo htmlspecialchars($article['description'], ENT_QUOTES, 'UTF-8'); ?></p>
        
        <div class="article-tags">
          <?php foreach ($article['tags'] as $tag): ?>
          <span class="tag"><?php echo htmlspecialchars($tag, ENT_QUOTES, 'UTF-8'); ?></span>
          <?php endforeach; ?>
        </div>
        
        <div class="article-meta">
          <span class="date"> <?php echo htmlspecialchars($article['date'], ENT_QUOTES, 'UTF-8'); ?></span>
        </div>
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
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "音声研究メモ",
      "item": "https://memo-site.com/voice/"
    }
  ]
}
</script>

<!-- 構造化データ（コレクション） -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "音声研究メモ",
  "description": "音声解析と音声言語処理に関する研究メモの一覧",
  "url": "https://memo-site.com/voice/",
  "about": {
    "@type": "Thing",
    "name": "音声処理技術"
  }
}
</script>

<style>
.article-card {
  transition: all 0.3s var(--ease);
}

.article-card .card-head {
  display: flex;
  align-items: center;
  gap: .8rem;
}

.article-icon {
  font-size: 2rem;
  line-height: 1;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  margin-top: .5rem;
}

.tag {
  font-size: .7rem;
  padding: .25rem .6rem;
  background: var(--bg-alt);
  border: 1px solid var(--border);
  border-radius: .35rem;
  color: var(--text-dim);
  font-weight: 500;
}

.article-meta {
  margin-top: .8rem;
  padding-top: .8rem;
  border-top: 1px solid var(--border);
  font-size: .75rem;
  color: var(--text-dim);
}

.date {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
}
</style>

</body>
</html>
