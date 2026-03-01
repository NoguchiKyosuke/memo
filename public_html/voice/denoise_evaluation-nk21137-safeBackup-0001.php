<?php
require_once '../includes/head.php';
require_once '../includes/common.php';
require_once '../includes/ad-a8.php';
require_once '../includes/image-helper.php';

$title = 'ノイズ除去の評価レポート';
$description = 'ノイズ除去の評価レポート。セットアップ、指標、考察、再現手順を紹介。';
$keywords = 'ノイズ除去,評価レポート,音声セキュリティ,評価レポート';
$canonical = 'https://memosite.jp/voice/denoise_evaluation.php';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('voice'); ?>

<main class="container fade-in" style="max-width:880px;margin:0 auto;padding:2.2rem 0 3rem;">
  <article>
    <header>
      <h1>ノイズ除去の評価レポート</h1>
      <p><span class="update-info"><?php echo date('Y年m月d日更新', filemtime(__FILE__)); ?></span></p>
      <p class="lead">ノイズ除去の評価レポート。セットアップ、指標、考察、再現手順を紹介。</p>
      <div class="article-meta" style="margin-top:1rem;">
        <span class="tag">ノイズ除去</span>
        <span class="tag">評価レポート</span>
        <span class="tag">音声セキュリティ</span>
        <span class="tag">評価レポート</span>
      </div>
    </header>
    <?php renderA8Ad(); ?>

    <section>
      <h2>仮説</h2>
      <p>音声の前処理によりノイズを除去すると、合成音声の認識精度が向上する。</p>
    </section>

    <section>
      <h2>実験方法</h2>
      <p>合成音声のデータセットは"J-SpAW"、合成音声の認識モデルは"AASIST"、ノイズ除去に使用したパケージは"noisereduce"である。</p>
      <p>ノイズの除去に使用した
    </section>

    <section>
      <h2>実験結果</h2> 
      <p>ノイズ除去を適用する前のASVとLAを比較した際のEERは52.3750%。</p>
      <p>ノイズ除去を適用する前のASVとPAを比較した際のEERは66.5179%。</p>
      <p>ノイズ除去を適用した後のASVとLAを比較した際のEERは58.2500%。</p>
      <p>ノイズ除去を適用した後のASVとPAを比較した際のEERは45.4405%。</p>
      <p>ノイズのみの音声を利用した前のEERは51.8750%。</p>
      <p>ノイズのみの音声を利用した後のASVとPAを比較した際のEERは66.6984%。</p>
    </section>

    <section>
      <h2>考察</h2>
      <p>
        実験結果より、ノイズを除去したことでLAのEERは4%ほど精度が向上したが、PAの精度は50%を割ってしまい、ランダムな判定よりも悪い結果となってしまった。</br>
        これは、ノイズを除去したことがあまり効果がなかったと考えることもできるが、もともとノイズを除去する前も精度が低かったとこから、使用しているモデルが学習に使用している音声データとのドメインミスマッチが発生していたと考えることができる。</br>
        そのため、次回の実験では、ドメインミスマッチを解消するために、ASV-LA間でモデルのトレーニングを実行してモデルの作成から行いたいと考える。
      </p>
    </section>

    <section>
      <h2>参考文献</h2>
      <ol class="references">
        <li id="ref1">
          PyTorch Contributors. "torch.nn.Conv2d — PyTorch 2.5 documentation." PyTorch Documentation. 
          <a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html" target="_blank" rel="noopener">
            https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html
          </a> (閲覧日 2025-11-07)
        </li>
      </ol>
    </section>

    <section>
      <h2>関連リンク</h2>
      <ul>
        <li><a href="https://github.com/safear-ai/safear" target="_blank" rel="noopener">SafeEar GitHub</a></li>
        <li><a href="https://github.com/takamichi-lab/J-SpAW" target="_blank" rel="noopener">J-SPAW Dataset</a></li>
        <li><a href="/voice/jspaw.php">J-SPAW 文献調査ノート</a></li>
        <li><a href="/voice/V2S-attack_paper.php">V2S Attack 論文解説</a></li>
      </ul>
    </section>
  </article>
</main>

<?php renderFooter(); ?>

<!-- 構造化データ -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "SafeEar による J-SPAW データセット検証レポート",
  "description": "SafeEar を用いた J-SPAW データセットのスプーフィング検出評価結果と運用上の示唆をまとめた技術レポート。",
  "author": {
    "@type": "Organization",
    "name": "メモ帳"
  },
  "datePublished": "2025-10-21",
  "dateModified": "<?php echo date('c', filemtime(__FILE__)); ?>",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://memosite.jp/voice/safear_jspaw_evaluation.php"
  },
  "keywords": "SafeEar,J-SPAW,音声セキュリティ,スプーフィング検出",
  "about": [
    {
      "@type": "Thing",
      "name": "音声セキュリティ"
    },
    {
      "@type": "Thing",
      "name": "スプーフィング対策"
    }
  ]
}
</script>

<!-- 構造化データ（パンくず） -->
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
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "音声研究メモ",
  "item": "https://memosite.jp/voice/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "SafeEar 評価レポート",
  "item": "https://memosite.jp/voice/safear_jspaw_evaluation.php"
    }
  ]
}
</script>

</body>
</html>