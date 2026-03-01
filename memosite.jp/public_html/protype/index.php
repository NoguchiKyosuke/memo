<?php
require_once '../includes/head.php';
require_once '../includes/common.php';
require_once '../includes/ad-a8.php';
require_once '../includes/article-helper.php';

$title = 'ミニアプリ - メモ帳';
$description = '様々なミニアプリケーション・プロトタイプを試験的に公開しているコーナーです。';
$keywords = 'ミニアプリ,プロトタイプ,Webアプリ,ツール,実験的';
$canonical = 'https://memosite.jp/protype/';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('protype'); ?>

<main class="container fade-in page-content">
  <article>
    <?php
    renderBreadcrumb([
        ['label' => 'ホーム', 'url' => '/'],
        ['label' => 'ミニアプリ'],
    ]);
    ?>
    <header>
      <h1>ミニアプリ</h1>
      <p class="lead">実験的に開発中のプロトタイプと小規模ツールの集約ページ。</p>
    </header>

    <?php renderA8Ad(); ?>

    <section>
      <h2>利用可能なアプリ</h2>
      <div class="content-grid">

        <a class="content-card" href="/protype/dentaku/">
          <div class="card-icon">🔢</div>
          <h3>高度数学電卓</h3>
          <p>ベクトル・行列・複素数・フーリエ変換・統計解析など多機能な数学電卓。</p>
        </a>

        <a class="content-card" href="/protype/notebook/">
          <div class="card-icon">📓</div>
          <h3>Web Notebook</h3>
          <p>Google認証付きのウェブノートブックアプリ。</p>
        </a>

        <a class="content-card" href="/protype/ocr_app/">
          <div class="card-icon">🔍</div>
          <h3>OCR変換ツール</h3>
          <p>画像からテキストを抽出するOCR変換ツール。</p>
        </a>

        <a class="content-card" href="/protype/pdf_compressor/">
          <div class="card-icon">📄</div>
          <h3>PDF圧縮ツール</h3>
          <p>クライアントサイドで完結するPDF圧縮。ファイルは外部に送信されません。</p>
        </a>

        <a class="content-card" href="/protype/editor/">
          <div class="card-icon">✏️</div>
          <h3>テキストエディタ</h3>
          <p>ブラウザ上で動作するシンプルなリッチテキストエディタ。</p>
        </a>

        <a class="content-card" href="/protype/purikura/">
          <div class="card-icon">📸</div>
          <h3>Kawaii Photo Studio</h3>
          <p>プリクラ風フォトエディター。写真アップロード・カメラ撮影対応。</p>
        </a>

        <a class="content-card" href="/protype/zenchishi/">
          <div class="card-icon">📝</div>
          <h3>前置詞穴埋め問題</h3>
          <p>英語の前置詞を穴埋め形式で学べるクイズアプリ。</p>
        </a>

        <a class="content-card" href="/protype/vb/">
          <div class="card-icon">🎳</div>
          <h3>ボウリングスコア</h3>
          <p>Liquid Glassデザインのボウリングスコア記録アプリ。</p>
        </a>

        <a class="content-card" href="/protype/abareru/ab.html">
          <div class="card-icon">⚔️</div>
          <h3>Abareru-Kun Quest</h3>
          <p>あばれる君をテーマにしたRPG風ブラウザゲーム。</p>
        </a>

      </div>
    </section>

    <section>
      <h2>説明</h2>
      <p>
        このセクションに掲載されているアプリケーションやプロトタイプは、開発・実験的な段階のものが多くあります。
        仕様変更やサービス停止の可能性があります。ご了承ください。
      </p>
    </section>

    <section>
      <h2>関連リンク</h2>
      <ul>
        <li><a href="/">ホーム</a></li>
        <li><a href="/game/">ゲームポータル</a></li>
        <li><a href="/memo/">メモ</a></li>
      </ul>
    </section>
  </article>
</main>

<?php renderFooter(); ?>

<?php
renderBreadcrumbJsonLd([
    ['label' => 'ホーム', 'url' => '/'],
    ['label' => 'ミニアプリ', 'url' => '/protype/'],
]);
?>

</body>
</html>
