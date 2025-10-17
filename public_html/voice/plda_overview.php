<?php
require_once '../includes/head.php';
require_once '../includes/common.php';
require_once '../includes/ad.php';
require_once '../includes/image-helper.php';

$title = 'PLDA (Probabilistic Linear Discriminant Analysis) の基礎と応用';
$description = 'PLDA の理論背景、ASV への応用、学習フロー、ハイパーパラメータ設計、実装のコツをまとめた技術解説。';
$keywords = 'PLDA,Probabilistic Linear Discriminant Analysis,音声認証,話者認証,機械学習,Bayesian';
$canonical = 'https://memo-site.com/voice/plda_overview.php';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('voice'); ?>

<main class="container fade-in" style="max-width:880px;margin:0 auto;padding:2.2rem 0 3rem;">
  <article>
    <header>
      <h1>PLDA (Probabilistic Linear Discriminant Analysis) の基礎と応用 <span class="update-info"><?php echo date('Y年m月d日更新', filemtime(__FILE__)); ?></span></h1>
      <p class="lead">話者認証や音声バイオメトリクスで広く用いられている PLDA の原理と、実務で押さえておきたい実装ポイントを整理します。</p>
      <div class="article-meta" style="margin-top:1rem;">
        <span class="tag">PLDA</span>
        <span class="tag">話者認証</span>
        <span class="tag">音声セキュリティ</span>
      </div>
    </header>

    <?php renderAdBanner(); ?>

    <section class="research-section">
      <h2>PLDA とは何か</h2>
      <p>PLDA (Probabilistic Linear Discriminant Analysis) は、線形判別分析を確率的に拡張したモデルで、クラス内・クラス間の分散構造を明示的にモデリングする手法です。話者認証では i-vector や x-vector の埋め込みを PLDA で判別するのが一般的なパイプラインとなっています。</p>
      <ul>
        <li>各発話が話者固有ベクトル + セッション雑音の線形結合として生成されると仮定</li>
        <li>話者固有ベクトルと雑音は多変量ガウス分布に従うと想定</li>
        <li>ベイズ推定により、話者間類似度 (log-likelihood ratio) を計算可能</li>
      </ul>
    </section>

    <section>
      <h2>前提となるパイプライン</h2>
      <div class="md-table-wrap">
        <table class="md-table">
          <thead>
            <tr>
              <th>段階</th>
              <th>処理内容</th>
              <th>出力</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>特徴抽出</td>
              <td>MFCC / FBANK / Spectrogram などを計算</td>
              <td>フレーム系列 (T × D)</td>
            </tr>
            <tr>
              <td>埋め込み抽出</td>
              <td>i-vector や x-vector モデルで固定長ベクトル化</td>
              <td>ベクトル z ∈ ℝⁿ</td>
            </tr>
            <tr>
              <td>次元圧縮・正規化</td>
              <td>LDA, PCA, Whitening などで分布整形</td>
              <td>正規化済の埋め込み</td>
            </tr>
            <tr>
              <td>PLDA 学習</td>
              <td>EM アルゴリズムで各トレーニング話者のクラス分布を推定</td>
              <td>Σ_between, Σ_within 等のパラメータ</td>
            </tr>
            <tr>
              <td>スコアリング</td>
              <td>検証発話と登録発話の尤度比を算出</td>
              <td>LLR スコア</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>PLDA は独立したモジュールとして設計できるため、既存の埋め込みモデルを差し替えても再利用しやすいメリットがあります。</p>
    </section>

    <section>
      <h2>確率モデルの定式化</h2>
      <div class="research-section">
        <h3>生成モデル</h3>
        <p>各発話埋め込み <code>z</code> は、話者固有の隠れ変数 <code>y</code> と、セッション固有の雑音 <code>ε</code> から生成されると仮定します。</p>
        <pre><code>
y ~ 𝒩(0, I)
ε ~ 𝒩(0, Σ_w)
z = μ + Fy + ε
        </code></pre>
        <ul>
          <li><code>μ</code>: グローバル平均</li>
          <li><code>F</code>: 話者因子行列 (eigenvoice matrix)</li>
          <li><code>Σ_w</code>: セッション内分散</li>
        </ul>
      </div>
      <div class="research-section">
        <h3>尤度比スコア</h3>
        <p>2つの埋め込み <code>z_1, z_2</code> が同一話者か否かの仮説検定を行う場合、以下の尤度比が用いられます。</p>
        <pre><code>
score = log p(z_1, z_2 | H_same) - log p(z_1 | H_diff) - log p(z_2 | H_diff)
        </code></pre>
        <p>ガウス積分を解析的に解ける点が PLDA の大きな利点です。実装では共分散行列の逆行列計算や Cholesky 分解を用いることが多いです。</p>
      </div>
    </section>

    <section>
      <h2>学習手順 (EM アルゴリズム)</h2>
      <ol>
        <li><strong>E-step:</strong> 観測データと現状のパラメータから <code>y</code> の事後分布を推定</li>
        <li><strong>M-step:</strong> 推定された <code>y</code> を用いて行列 <code>F</code> と共分散 <code>Σ_w</code> を更新</li>
        <li>収束判定: 対数尤度の増加量が閾値以下になったら終了</li>
      </ol>
      <p>初期化には PCA やランダム初期値が用いられます。実務では 5〜10 回程度の EM で収束することが多いですが、特異行列を避けるために正則化 (diagonal loading) を入れると安定します。</p>
    </section>

    <section>
      <h2>ハイパーパラメータ設計</h2>
      <ul>
        <li><strong>埋め込み次元:</strong> x-vector の場合は 256〜512 次元が一般的。PLDA 前に 150〜200 次元に圧縮することが多い。</li>
        <li><strong>話者数と発話数:</strong> 1 話者あたり最低でも 10 発話程度が望ましい。ドメイン適合を重視する。</li>
        <li><strong>正則化:</strong> <code>Σ_w</code> に対して <code>λI</code> を加えるなど、数値安定性を確保。</li>
        <li><strong>ドメイン適応:</strong> PLDA はテスト環境へのドメイン適応が重要。特定環境で追加学習を行うことで EER が大幅に改善する。</li>
      </ul>
    </section>

    <section>
      <h2>Python 実装例 (Kaldi 風)</h2>
      <pre><code class="language-python">import numpy as np
from numpy.linalg import cholesky, inv

class PLDA:
    def __init__(self, dim, y_dim):
        self.mean = np.zeros(dim)
        self.F = np.random.randn(dim, y_dim) * 0.1
        self.Sigma_w = np.eye(dim)

    def e_step(self, X):
        # X: (n_samples, dim)
        centered = X - self.mean
        Sigma_y = np.eye(self.F.shape[1]) + self.F.T @ inv(self.Sigma_w) @ self.F
        Sigma_y_inv = inv(Sigma_y)
        posterior_mean = Sigma_y_inv @ self.F.T @ inv(self.Sigma_w) @ centered.T
        return posterior_mean.T, Sigma_y_inv

    def m_step(self, X, post_mean, post_cov):
        centered = X - self.mean
        n = X.shape[0]
        Ey = post_mean
        Eyy = post_cov + Ey.T @ Ey / n
        self.F = centered.T @ Ey @ inv(Eyy)
        residual = centered - Ey @ self.F.T
        self.Sigma_w = (residual.T @ residual) / n

    def fit(self, X, n_iters=10):
        for _ in range(n_iters):
            post_mean, post_cov = self.e_step(X)
            self.m_step(X, post_mean, post_cov)

    def score(self, enrollment, test):
        # enrollment/test: (dim,)
        # ここでは簡略化した2クラス尤度比
        return -np.dot(enrollment - test, inv(self.Sigma_w) @ (enrollment - test))
</code></pre>
      <p>実際の Kaldi や pyannote.audio ではより高度なバックエンドを採用していますが、仕組みの理解には上記のようなミニマル実装が役立ちます。</p>
    </section>

    <section>
      <h2>評価指標と実務での着眼点</h2>
      <ul>
        <li><strong>EER (Equal Error Rate):</strong> 認証システムの総合性能を確認するための指標。PLDA 導入前後の比較で改善を測定。</li>
        <li><strong>DET カーブ:</strong> 操作点毎の false accept / false reject のバランスを視覚化。</li>
        <li><strong>スコア校正:</strong> PLDA スコアはシンプルなロジット変換でキャリブレーション可能。後段の閾値設定が安定。</li>
        <li><strong>攻撃耐性:</strong> VC 系攻撃のような合成音声に対しては別途 CM (countermeasure) を組み合わせるのが必須。</li>
      </ul>
    </section>

    <section>
      <h2>まとめ</h2>
      <p>PLDA はクラシックな手法ながら、最新の深層学習ベース埋め込みとも相性が良く、話者認証のバックエンドとしていまだに現役です。ドメイン適応やスコア校正とセットで運用することで、堅牢かつ高精度な認証を実現できます。</p>
    </section>

    <section>
      <h2>関連リンク</h2>
      <ul>
        <li><a href="https://kaldi-asr.org/doc/">Kaldi Documentation</a></li>
        <li><a href="https://pyannote.github.io/">pyannote.audio</a></li>
        <li><a href="/voice/V2S-attack_paper.php">V2S Attack 論文解説</a></li>
        <li><a href="/voice/speech.php">音声解析と機械学習の研究メモ</a></li>
      </ul>
    </section>
  </article>
</main>

<div class="hero-ad" style="margin-top:1.6rem;display:flex;justify-content:center;">
  <?php renderAdBanner(); ?>
</div>

<?php renderFooter(); ?>

<!-- 構造化データ -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": "PLDA (Probabilistic Linear Discriminant Analysis) の基礎と応用",
  "description": "PLDA の理論背景、ASV への応用、EM 学習、ハイパーパラメータ、評価手法をまとめた技術解説。",
  "datePublished": "2025-10-17",
  "dateModified": "<?php echo date('c', filemtime(__FILE__)); ?>",
  "author": {
    "@type": "Person",
    "name": "菅野"
  },
  "publisher": {
    "@type": "Organization",
    "name": "メモ帳"
  },
  "inLanguage": "ja",
  "url": "<?php echo htmlspecialchars($canonical, ENT_QUOTES, 'UTF-8'); ?>",
  "keywords": "PLDA, Probabilistic Linear Discriminant Analysis, Speaker Verification",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "<?php echo htmlspecialchars($canonical, ENT_QUOTES, 'UTF-8'); ?>"
  }
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
      "item": "https://memo-site.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "音声研究メモ",
      "item": "https://memo-site.com/voice/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "PLDA の技術解説",
      "item": "https://memo-site.com/voice/plda_overview.php"
    }
  ]
}
</script>

</body>
</html>
