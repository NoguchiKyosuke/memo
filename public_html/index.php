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
  <section class="hero">
    <h1>メモ帳</h1>
    <p class="lead">対象領域: Software Defined Vehicle (SDV) と 音声解析。統合された安全で可視化可能なバックエンド。</p>
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

      <a class="card" href="/voice/">
        <div class="card-head">
          <h3>音声研究メモ</h3>
        </div>
        <p>音声解析と音声言語処理に関する研究メモ。MFCC、DTW、機械学習、最新の研究論文など、音声処理技術について学べます。</p>
        <div class="badge ok">記事 <?php require_once 'includes/voice-articles.php'; echo getVoiceArticleCount(); ?> 件</div>
      </a>

      <a class="card" href="/timekeeper.php">
        <div class="card-head">
          <h3>タイムマネージャ</h3>
        </div>
        <p>ブラウザのタイムゾーンに合わせた現在時刻の表示と最大5件のアラーム管理が行えます。端末に保存されるので再訪時も即座に利用できます。</p>
        <div class="badge ok">最大5件のアラーム</div>
      </a>

      <a class="card" href="/vocabulary_app/">
        <div class="card-head">
          <h3>単語帳アプリ</h3>
        </div>
        <p>自分だけの単語帳を作成して学習できるWebアプリ。単語の追加、一覧表示、テスト機能などを備えています。</p>
        <div class="badge ok">Webアプリ</div>
      </a>

      <a class="card" href="/ocr_app/">
        <div class="card-head">
          <h3>AI OCR Converter</h3>
        </div>
        <p>画像からテキストを瞬時に抽出するAIツール。ローカルLLM (Ollama) を使用して、プライバシーを確保しながら高精度な文字認識を行います。</p>
        <div class="badge ok">AIツール</div>
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