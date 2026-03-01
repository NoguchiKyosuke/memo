<?php
/**
 * 記事テンプレート
 *
 * 新しい記事を作成する手順:
 *   1. このファイルをコピーして新しい名前に変更 (例: my_article.php)
 *   2. 下記の「記事メタデータ」セクションを編集する
 *   3. includes/voice-articles.php の配列に記事情報を追加する
 *   4. <section> 内に本文を記述する
 */
require_once '../../includes/head.php';
require_once '../../includes/common.php';
require_once '../../includes/ad-a8.php';
require_once '../../includes/article-helper.php';

// ============================================================
// 記事メタデータ（編集必須）
// ============================================================
$title       = '記事タイトル';
$description = '記事の説明文。SEO に使用されます。';
$keywords    = 'キーワード1,キーワード2,キーワード3';
$canonical   = 'https://memosite.jp/memo/voice/ファイル名.php';
$tags        = ['タグ1', 'タグ2', 'タグ3'];
$lead        = 'この記事の概要をここに書きます。';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('memo'); ?>

<main class="container fade-in page-content">
  <article>
    <?php
    renderBreadcrumb([
        ['label' => 'ホーム', 'url' => '/'],
        ['label' => 'メモ', 'url' => '/memo/'],
        ['label' => '音声研究', 'url' => '/memo/voice/'],
        ['label' => $title],
    ]);
    renderArticleHeader($title, $lead, $tags, __FILE__);
    renderA8Ad();
    ?>

    <section>
      <h2>セクション見出し</h2>
      <p>本文をここに記述します。</p>
    </section>

    <!-- 必要に応じてセクションを追加 -->

  </article>
</main>

<?php renderFooter(); ?>

<?php
renderBreadcrumbJsonLd([
    ['label' => 'ホーム', 'url' => '/'],
    ['label' => 'メモ', 'url' => '/memo/'],
    ['label' => '音声研究', 'url' => '/memo/voice/'],
    ['label' => $title, 'url' => $canonical],
]);
?>
</body>
</html>
