<?php
require_once '../includes/head.php';
require_once '../includes/common.php';
require_once '../includes/ad.php';
require_once '../includes/image-helper.php';

$title = 'Kaggle で GPU T4×2 を使いこなす手順ガイド';
$description = 'Kaggle Notebooks で GPU T4×2 アクセラレータを有効化し、運用するための設定手順をまとめた。';
$keywords = 'Kaggle,GPU,T4,ディープラーニング,Notebook,PyTorch,TensorFlow,ハードウェアアクセラレータ';
$canonical = 'https://memo-site.com/voice/kaggle_t4x2_guide.php';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('voice'); ?>

<main class="container fade-in" style="max-width:880px;margin:0 auto;padding:2.2rem 0 3rem;">
  <article>
    <header>
      <h1>Kaggle で GPU T4×2 を使いこなす手順ガイド <span class="update-info"><?php echo date('Y年m月d日更新', filemtime(__FILE__)); ?></span></h1>
      <p class="lead">Kaggle Notebooks の GPU T4×2 アクセラレータを有効化するための前提条件、設定フロー、マルチ GPU を活かす学習テクニック、運用時の注意点をまとめました。</p>
      <div class="article-meta" style="margin-top:1rem;">
        <span class="tag">Kaggle</span>
        <span class="tag">GPU</span>
        <span class="tag">深層学習</span>
      </div>
    </header>

    <section class="research-section">
      <h2>概要</h2>
      <p>Kaggle では Notebooks/Code 環境から無料または Pro プランで GPU を利用できます。T4×2 は 2 基の NVIDIA T4 GPU を同時に割り当ててくれるモードで、マルチ GPU 学習や並列推論に向いています。本稿では 2025 年 10 月時点の UI と仕様に基づいて手順を解説します。</p>

    </section>

<div class="hero-ad" style="margin-top:1.6rem;display:flex;justify-content:center;">
  <?php renderAdBanner(); ?>
</div>

    <section>
      <h2>T4×2 を有効化する手順</h2>
      <ol>
        <li>セッション起動時に <em>Accelerator</em> を <strong>GPU</strong> &gt; <strong>T4 x2</strong> に設定することで有効化</li>
        <img src="./images/select_GPU_on_Kaggle.webp" alt="Kaggle Notebook の Accelerator 設定画面" style="max-width:100%;border:1px solid var(--border);border-radius:8px;margin:1rem 0;">
        <li>
            プログラムでマルチGPUを適用するように記述する。<br/>
            その際のコツを次のセクションで記述する。
        </li>
      </ol>
    </section>

<div class="hero-ad" style="margin-top:1.6rem;display:flex;justify-content:center;">
  <?php renderAdBanner(); ?>
</div>

    <section>
        <h2>マルチGPUを活用するためのコードの記述方法</h2>
        <ul>
            <li>
                まず、モデルをインポートする際に以下のように"DataParallel"を使用する。
            </li>
            <pre id="pythonCode">
            <code>
device = "cuda" if torch.cuda.is_available() else "cpu"

#使用したいモデルをmodelとして定義する
model = EncoderClassifier.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb",
    savedir = root_path + "/models/pretrained_models/ecapa-tdnn",
    run_opts={"device": device}
    )

# GPUが2基以上ある場合にDataParallelでモデルをラップする
if torch.cuda.device_count() > 1:
    print(f"Using {torch.cuda.device_count()} GPUs !")
    model = torch.nn.DataParallel(model)

model.to(device)
# 「Using 2 GPUs !」と表示される
            </code>
            </pre>
            <p>
                ただし、自動的に処理を最適化する際にDataParallelは勝手に無効化されることがある為、気をつけなければならない。
            </p>
            <p>
                もしも、この記述でGPUが2基使用されない場合は、モデルに受け渡しているファイルの数が一つずつである可能性を疑う。<br/>
                たとえば、以下のように音声認識モデルに音声ファイルを一つずつ渡している場合、DataParallelは有効にならない。<br/>
                <pre id="pythonCode">
                <code>
# pathに一つずつ音声ファイルのパスを格納してループする
for path in paths:
    # 音声ファイルを一つずつモデルに渡して埋め込みを取得する
    embedding = get_embedding(path, model)
                </code>
                </pre>
                その際は以下のような記述で、ファイルごとに異なるGPUで処理できるようにする。
                <pre id="pythonCode">
                <code>

                </code>
                </pre>
            </p>

    <li>
          <h3>torch.from_numpyの使い方について</h3>
    </li>
    <p>
        音声をGPUに送信する際に、以下のコードを使用した。
    </p>
    <pre>
    <code>
torch.from_numpy(signal).float().unsqueeze(0).to(next(model.parameters()).device)
    </code>
    </pre>
    <p>
        以下のコードについて、各メソッドの説明を行う。
        <ul>
            <li>torch.from_numpy(signal): numpy配列の音声データsignalを、PyTorchのテンソルに変換する。このとき、メモリーのコピーを行わない。signalのデータ形式は、float32かfloat64の一次元配列である。PyTorchのモデルは常に"torch.Tensor"型を求めているため、こうしてNumpyの形式を変換する必要がある。</li>
            <li>float(): テンソルのデータ型をfloat32に変換する。このとき使用していた事前学習モデルがfloat32を要求していたため、明示的に変換を行っている。</li>
            <li>unsqueeze(0): テンソルの次元を増やす。ここではバッチサイズの次元を追加して、形状を(1, シーケンス長)にする。</li>
            <li>to(next(model.parameters()).device): テンソルをモデルと同じデバイス(GPUまたはCPU)に移動する。</li>
        </ul>
    </p>
    <p>
        GPUを2つ以上使用する際は特に最後の処理が大事になってくる。モデルを予めCPU上に転送しておいてそれぞれのGPUに送信したほうが、GPU上で効率的に処理できるようになる。
    </p>
    </ul>
    </section>

<div class="hero-ad" style="margin-top:1.6rem;display:flex;justify-content:center;">
  <?php renderAdBanner(); ?>
</div>

    <section>
      <h2>トラブルシューティング</h2>
      <ol>
        <li>
          RunTimeError が発生する場合。
        </li>
        <pre id="pythonCode">
        <code>
RuntimeError: Cannot re-initialize CUDA in forked subprocess. To use CUDA with multiprocessing, you must use the 'spawn' start method
        </code>
        </pre>
        <p>
          上記のエラーが発生した場合、multiprocessingのstart methodを"spawn"に変更することで解決できる。<br/>
          具体的には、学習スクリプトの最初に以下のコードを追加する。
        </p>
        <pre id="pythonCode">
        <code>
import torch.multiprocessing as mp
mp.set_start_method('spawn', force=True)
        </code>
        </pre>
        <p>
            ここで、Windows環境では"spawn"がデフォルトであるため、上記のコードは不要である。<br/>
            しかし、Linux環境では"fork"がデフォルトであるため、上記のコードを追加し、"spawn"にする必要がある。
        </p>
        <li>
      </ol>
    </section>

<div class="hero-ad" style="margin-top:1.6rem;display:flex;justify-content:center;">
  <?php renderAdBanner(); ?>
</div>

    <section>
      <h2>関連リソース</h2>
      <ul>
        <li><a href="https://www.kaggle.com/docs/notebooks" target="_blank" rel="noopener">Kaggle Notebooks ドキュメント</a></li>
        <li><a href="https://www.kaggle.com/settings" target="_blank" rel="noopener">Kaggle Usage 情報 (残り時間の確認)</a></li>
        <li><a href="https://github.com/huggingface/accelerate" target="_blank" rel="noopener">Hugging Face Accelerate</a></li>
      </ul>
    </section>
  </article>
</main>

<?php renderFooter(); ?>

<!-- 構造化データ（ScholarlyArticle） -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Kaggle で GPU T4×2 を使いこなす手順ガイド",
  "description": "Kaggle Notebooks で GPU T4×2 アクセラレータを有効化する方法とマルチ GPU 学習の運用ノウハウをまとめた解説記事です。",
  "datePublished": "2025-10-15",
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
  "keywords": "Kaggle, GPU, T4, Notebook",
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
      "name": "Kaggle GPU T4×2 ガイド",
      "item": "https://memo-site.com/voice/kaggle_t4x2_guide.php"
    }
  ]
}
</script>

</body>
</html>
