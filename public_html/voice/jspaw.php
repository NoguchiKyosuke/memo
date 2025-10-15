<?php
require_once '../includes/head.php';
require_once '../includes/common.php';
require_once '../includes/ad.php';

$title = '音声コーパスJ-SpAWに関する文献調査';
$description = 'J-SpAW: 話者照合となりすまし音声検出のための
日本語音声コーパスについて詳しく解説します。';
$keywords = '音声言語処理,J-SpAW,音声処理,機械学習,研究論文,SLP,音声認識,言語処理,2024';

renderHead($title, $description, $keywords);
?>
<body>
<?php renderNavigation('jspaw'); ?>

<!-- MathJax for mathematical expressions -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<script>
MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
    }
};
</script>

<main class="container fade-in">
  <article>
    <header class="article-header">
      <h1>音声言語処理に関する研究文献</h1>
    </header>

    <section class="paper-info">
      <h2>まえがき</h2>
      <p>
        今回は、音声合成による音声認識のなりすましに対するモデル作成に使用するデータセット
        <a href="https://github.com/takamichi-lab/J-SpAW">J-SpAW</a>について、今後使用するにあたって調べた。<br/>
        その際に使用した文献は<a href="https://takamichi-lab.github.io/assets/pdf/paper/2024/kanno24slp_J-SpAW.pdf">J-SpAW: 話者照合となりすまし音声検出のための日本語音声コーパス</a>である。
      </p>
    </section>

    <section class="paper-content">
      <h2>データセットの概要</h2>
      <p>
        J-SpAWはなりすまし音声データを収録した、研究目的で利用可能な無料の音声コーパスである。<br/>
        J-SpAWは以下の3種類の音声データを収録している。
      </p>
      <ul>
        <li>実発話音声:       男性21名、女性19名の話者から収録された日本語音声データ</li>
        <li>なりすまし音声:    実発話の音声を基に、音声合成技術で生成された音声データ</li>
        <li>収録なりすまし音声: 合成音声を実際の使用環境を模した様々なノイズが乗った音声データ</li>
      </ul>
      <p>
        なりすまし音声には、収録環境が4種類、再生機器が4種類に分かれて想定された録音データがある。
      </p>

      <h2>話者照合評価実験</h2>
      <div class="content-section">
        <h3>J-SpAWとVoxCelebとの比較</h3>
        <p>
          事前学習モデルにおける話者照合をした際に、J-SpAWのEERは十分に低い値であった。しかしながら、VoxCelebに比べるとEERが高い傾向にあった。<br/>
          これは、J-SpAWが録音環境による雑音を意図的に大きくしているため、EERに影響があったと考えられる。
          一方、多言語のVoxCelebに対する言語の違いは余り影響がないと考えられる。
        </p>
      </div>

      <div class="content-section">
        <h3>なりすまし音声検出評価実験</h3>
        <p>
          なりすまし音声は、TTSとVALL-E Xによる合成音声手法を用いて生成されている。<br/>
          TTSの合成音声は、人間が聞いても不自然さが目立つため、比較的なりすましを検出しやすい。一方、VALL-E Xの合成音声は、自然さが高く、なりすまし検出が難しい傾向にある。<br/>
          また、ASVspoofというなりすまし音声検出のためのデータセットと比較して、J-SpAWはよりなりすまし検出が難しい傾向にある。
        </p>

      <div class="content-section">
        <h3>収録なりすまし音声検出評価実験</h3>
        <p>
          収録なりすまし音声のEERは様々なモデルにおいても高い傾向にあった。周囲の雑音の有無によって10ポイントほどの違いがあったモデルもあったが、いずれにしても高い傾向にあった。一番、EERが高い収録状況は、周囲で音楽がなっている場合であった。
        </p>
      </div>

      <div class="content-section">
        <h3>3. 実験結果</h3>
        <p>
          以上3つの実験結果から、J-SpAWは話者照合、なりすまし音声検出、収録なりすまし音声検出のいずれにおいても、既存のデータセットよりも難易度が高いことが示された。<br/>
        </p>
      </div>

    <section class="references">
      <h2>参考文献と関連リンク</h2>
      <div class="reference-links">
        <h3>関連技術ページ:</h3>
        <ul>
          <li><a href="/speech.php">音声解析と機械学習の研究メモ</a></li>
          <li><a href="/">メモ帳 ホーム</a></li>
        </ul>
      </div>
    </section>

  </article>
</main>

<div class="hero-ad" style="margin-top:1.6rem;display:flex;justify-content:center;">
  <?php renderAdBanner(); ?>
</div>

<?php renderFooter(); ?>

<!-- 構造化データ（記事） -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": "音声言語処理に関する研究文献 - J-SpAW 2024",
  "description": "音声言語処理（Speech and Language Processing）に関する最新研究文献の紹介。J-SpAW 2024で発表された音声処理技術について詳しく解説します。",
  "author": {
    "@type": "Person",
    "name": "菅野"
  },
  "datePublished": "2024-01-01",
  "publisher": {
    "@type": "Organization",
    "name": "メモ帳"
  },
  "about": {
    "@type": "Thing",
    "name": "音声言語処理"
  },
  "keywords": "音声言語処理,J-SpAW,音声処理,機械学習,研究論文,SLP,音声認識,言語処理"
}
</script>

<!-- パンくずリスト -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ホーム",
      "item": "/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "J-SpAW研究文献",
      "item": "/jspaw.php"
    }
  ]
}
</script>

<script src="/assets/js/health.js"></script>
</body>
</html>