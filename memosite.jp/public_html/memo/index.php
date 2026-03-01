<?php
require_once '../includes/head.php';
require_once '../includes/common.php';
require_once '../includes/ad-a8.php';
require_once '../includes/voice-articles.php';
require_once '../includes/article-helper.php';

$title = 'メモ - メモ帳';
$description = '音声処理研究・車載ソフトウェア技術など、日々の学習と研究をまとめた技術メモのコレクションです。';
$keywords = 'メモ,技術ブログ,学習記録,研究ノート,音声処理,SDV,機械学習';
$canonical = 'https://memosite.jp/memo/';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('memo'); ?>

<main class="container fade-in page-content">
  <article>
    <?php
    renderBreadcrumb([
        ['label' => 'ホーム', 'url' => '/'],
        ['label' => 'メモ'],
    ]);
    ?>
    <header>
      <h1>メモ</h1>
      <p class="lead">音声処理・機械学習・車載技術など、日々の学習と研究をまとめたメモのコレクション。</p>
    </header>

    <section>
      <h2>カテゴリ</h2>
      <div class="content-grid">
        <a class="content-card content-card--category" href="/memo/discord/">
          <div class="card-icon">🎮</div>
          <h3>ディスコードボット作成</h3>
          <p>ディスコードのボット作成に関する技術メモと手順。</p>
        </a>

        <a class="content-card content-card--category" href="/memo/voice/">
          <div class="card-icon">🎤</div>
          <h3>音声研究メモ</h3>
          <p>音声解析・話者認証・スプーフィング検出など、音声言語処理に関する技術メモと研究文献。全 <?php echo getVoiceArticleCount(); ?> 件。</p>
        </a>

        <a class="content-card content-card--category" href="/memo/sdv/sdv.php">
          <div class="card-icon">🚗</div>
          <h3>SDV (Software Defined Vehicle)</h3>
          <p>車載ソフトウェアのアーキテクチャ、OTAアップデート、自動運転の技術ノート。</p>
        </a>
      </div>
    </section>

    <?php renderA8Ad(); ?>

    <section>
      <h2>音声研究の最新記事</h2>
      <p style="margin-bottom:1.2rem;color:var(--text-dim);font-size:.9rem;">
        全 <?php echo getVoiceArticleCount(); ?> 件 ─ すべての記事は<a href="/memo/voice/">音声研究メモ</a>から閲覧できます
      </p>
      <div class="content-grid content-grid--wide">
        <?php
        $articles = getVoiceArticles();
        foreach ($articles as $article):
        ?>
        <a class="content-card content-card--article" href="/memo/voice/<?php echo htmlspecialchars($article['slug'], ENT_QUOTES, 'UTF-8'); ?>">
          <h3><?php echo htmlspecialchars($article['title'], ENT_QUOTES, 'UTF-8'); ?></h3>
          <p><?php echo htmlspecialchars($article['description'], ENT_QUOTES, 'UTF-8'); ?></p>
          <div class="article-tags">
            <?php foreach (array_slice($article['tags'], 0, 3) as $tag): ?>
            <span class="tag"><?php echo htmlspecialchars($tag, ENT_QUOTES, 'UTF-8'); ?></span>
            <?php endforeach; ?>
          </div>
          <div class="article-date"><?php echo htmlspecialchars($article['date'], ENT_QUOTES, 'UTF-8'); ?></div>
        </a>
        <?php endforeach; ?>
      </div>
    </section>

    <section>
      <h2>関連リンク</h2>
      <ul>
        <li><a href="/">ホーム</a></li>
        <li><a href="/game/">ゲームポータル</a></li>
        <li><a href="/protype/">ミニアプリ</a></li>
        <li><a href="/vocabulary_app/">単語帳アプリ</a></li>
      </ul>
    </section>
  </article>
</main>

<?php renderFooter(); ?>

<?php
renderBreadcrumbJsonLd([
    ['label' => 'ホーム', 'url' => '/'],
    ['label' => 'メモ', 'url' => '/memo/'],
]);
?>

</body>
</html>
