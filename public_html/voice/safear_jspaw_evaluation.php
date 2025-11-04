<?php
require_once '../includes/head.php';
require_once '../includes/common.php';
require_once '../includes/image-helper.php';

$title = 'SafeEar による J-SPAW データセット検証レポート';
$description = 'SafeEar を用いて J-SPAW コーパスのスプーフィング検出性能を評価した結果をまとめた検証レポート。セットアップ、指標、考察、再現手順を紹介。';
$keywords = 'SafeEar,J-SPAW,なりすまし検出,音声セキュリティ,評価レポート';
$canonical = 'https://memosite.jp/voice/safear_jspaw_evaluation.php';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('voice'); ?>

<main class="container fade-in" style="max-width:880px;margin:0 auto;padding:2.2rem 0 3rem;">
  <article>
    <header>
      <h1>SafeEar による J-SPAW データセット検証レポート <span class="update-info"><?php echo date('Y年m月d日更新', filemtime(__FILE__)); ?></span></h1>
      <p class="lead">SafeEar を用いて J-SPAW データセットに含まれるスプーフィング音声を精査し、検出性能と運用上の注意点を整理しました。</p>
      <div class="article-meta" style="margin-top:1rem;">
        <span class="tag">SafeEar</span>
        <span class="tag">J-SPAW</span>
        <span class="tag">音声セキュリティ</span>
        <span class="tag">評価レポート</span>
      </div>
    </header>

    <section class="research-section">
      <h2>SafeEar と J-SPAW の概要</h2>
      <p>SafeEar は、クラウドおよびオンプレ環境で音声スプーフィング対策を迅速に導入できる検証フレームワークです。音声認証前段で簡易的なフィルタリングを行い、認証基盤の負荷軽減と攻撃耐性の向上を狙います。一方、J-SPAW は TTS/VALL-E X で生成した多様ななりすまし音声を収録しており、実運用に近い再生・録音条件を再現しています。本レポートでは SafeEar の最新版 (v0.9.2) と J-SPAW LA トラック (2024 年版) を組み合わせ、各セッションの検出性能を測定しました。</p>
      <h2>事前知識</h2>
      <h3>Hubert L9 について</h3>
      <p>
        HuBERTは、Hidden-Unit BESTの略であり、自己教師あり学習モデルの一つである。このモデルは、高品質なラベル付されていない音声から学習する。また、最も自然言語処理の手法に基づいている。子もモデルでは、畳込みを行い、音声信号から特徴量ベクトルを抽出する。この動作は、MFCCsやスペクトログラムのような従来の音声特徴量抽出手法に似ている。HuBERTモデルは、複数の層で構成されており、各層はTransformerアーキテクチャに基づいている。Transformerは、自己注意機構を使用して、入力シーケンス内の異なる位置間の依存関係を捉えることができる。このため、HuBERTモデルは、長期的な依存関係を捉えることができる。
        また、このモデルのレイヤーは、L1〜L12まであり、レイヤーの数字が上がるに連れ言語的な特徴や個人の特徴が色濃く反映され、レイヤーの数字が下がるに連れ音響的な特徴が色濃く反映される傾向がある。SafeEarでは、L9レイヤーの特徴量を使用している。これは、SafeEarが、言語的な特徴を捉えつつも、音響的な特徴もある程度捉えることを特徴としたモデルだからである。
      </p>
    </section>

    <section>
      <h2>環境構築</h2>
      以下のコマンドを順番に入力していく。
      <pre id="bashCode">
      <code>
# 仮想環境(conda)の作成と有効化
conda create -n safeear python=3.9 -y
conda activate safeear
# SafeEar のインストール
git clone git@github.com:LetterLiGo/SafeEar.git
cd SafeEar
# 依存パッケージのインストール
pip install torch==1.13.1+cu116 torchvision==0.14.1+cu116 torchaudio==0.13.1 --extra-index-url https://download.pytorch.org/whl/cu116
# pip バージョンエラー対策
pip install pip==24.0
pip install -r requirements.txt
      </code>
      </pre>
      <p>
        以上のコマンドにより、Pythonの実行環境を整えることが完了した。</br>
        次に、J-SPAW データセットをダウンロードし、SafeEar の所定ディレクトリに配置する。
      </p>



      <p>
        その後、Hubert L9 featureファイルを"/SafeEar"以下に生成する。
      </p>
      <pre id="bashCode">
      <code>
mkdir model_zoos
cd model_zoos
wget https://dl.fbaipublicfiles.com/hubert/hubert_base_ls960.pt
wget https://cloud.tsinghua.edu.cn/f/413a0cd2e6f749eea956/?dl=1 -O SpeechTokenizer.pt
cd ../datas
# Generate the Hubert L9 feature files for ASVspoof 2019
python dump_hubert_avg_feature.py datasets/ASVSpoof2019 datasets/ASVSpoof2019_Hubert_L9
# Generate the Hubert L9 feature files for ASVspoof 2021
python dump_hubert_avg_feature.py datasets/ASVSpoof2021 datasets/ASVSpoof2021_Hubert_L9
      </code>
      </pre>

    </section>


    <section>
      <h2>注意点</h2>
      <h3>pipバージョンエラー</h3>
      <pre id="bashCode">
      <code>
pip install -r requirements.txt

WARNING: Ignoring version 1.6.3 of pytorch-lightning since it has invalid metadata:

Requested pytorch-lightning==1.6.3 from https://files.pythonhosted.org/packages/bf/c4/955c35600631894e5a44d2e297367bc6d468062e5fef668c2d11fb354f53/pytorch_lightning-1.6.3-py3-none-any.whl (from -r requirements.txt (line 85)) has invalid metadata: .* suffix can only be used with `==` or `!=` operators

    torch (>=1.8.*)

           ~~~~~~^
      </code>
      </pre>
      <p>
        上記のようにエラーが発生した際は、以下のようなコマンドを入力する。
      </p>
      <pre id="bashCode">
      <code>
pip install "pip<24.1"
      </code>
      </pre>
      <h3>git cloneエラー</h3>
      <pre id="bashCode">
      <code>
git clone git@github.com:LetterLiGo/SafeEar.git

fatal: premature end of pack file, 83 bytes missing
fatal: fetch-pack: invalid index-pack output
      </code>
      </pre>
      <p>
        上記のようにエラーが発生した際は、時間をおいたりパソコンを再起動したりして再度実行すると案外すんなりクローンができることが多い。
      </p>

      <h3>Hubert L9 featureファイル生成エラー</h3>
      <pre id="bashCode">
      <code>
$ python dump_hubert_avg_feature.py datasets/ASVSpoof2019 datasets/ASVSpoof2019_Hubert_L9
...
2025-10-29 10:49:53 | INFO | dump_hubert_feature |  max_chunk = 1600000
 10%|██████▎                                                          | 35075/363355 [04:10<39:05, 139.97it/s]
Traceback (most recent call last):
  File "/home/nk21137/Documents/SafeEar/datas/dump_hubert_avg_feature.py", line 108, in <module>
    main(**vars(args))
  File "/home/nk21137/Documents/SafeEar/datas/dump_hubert_avg_feature.py", line 93, in main
    dump_feature(reader, audio_dir, save_dir)
  File "/home/nk21137/Documents/SafeEar/datas/dump_hubert_avg_feature.py", line 86, in dump_feature
    feat_f = NpyAppendArray(save_path)
  File "/home/nk21137/miniconda3/envs/safeear/lib/python3.9/site-packages/npy_append_array/npy_append_array.py", line 150, in __init__
    self.__init_from_file()
  File "/home/nk21137/miniconda3/envs/safeear/lib/python3.9/site-packages/npy_append_array/npy_append_array.py", line 176, in __init_from_file
    raise ValueError(msg)
ValueError: cannot append to datasets/ASVSpoof2019_Hubert_L9/LA/ASVspoof2019_LA_eval/flac/LA_E_2115551.npy: file needs recovery, please call npy_append_array.recover
      </code>
      </pre>
      <p>
        上記のようにエラーは、二度目のコマンド実行時に示されるケースが多い。</br>
        このとき、"ASVSpoof2019_Hubert_L9" ディレクトリ内のファイルを削除し、再度コマンドを実行することで解決できることが多い。
      </p>

      <h3>
        ASVSpoof2019でテストする際のnot foundエラー
      </h3>
      <pre id="bashCode">
      <code>
$ python train.py --conf_dir config/train19.yaml
...
RuntimeError: Failed to load audio from /gpfs-flash/hulab/likai/SafeEar/datas/ASVSpoof2019/LA/ASVspoof2019_LA_train/flac/LA_T_1138215.flac
      </code>
      </pre>
      <p>
        上記のようにエラーが発生した際は、datas/ASVSpoof2019/dev.tsvとdatas/ASVSpoof2019/train.tsv内の一行目のパスが、作者の絶対パスになっているため、使用コンピュータに対応する絶対パスに変更する必要がある。
      </p>
      

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