<?php
require_once '../includes/head.php';
require_once '../includes/common.php';
require_once '../includes/ad-a8.php';
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
    <?php renderA8Ad(); ?>

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
      <h2>SafeEarのモデルの概要</h2>
      <p>
        SafeEarは"safeear"フォルダ直下にモデルのpythonプログラムが配置されている。</br>
        "safeear"フォルダは、以下の3のサブフォルダで構成されている。
      </p>
      <ul>
        <li>"datas"フォルダ: 音声データや特徴量が配置されている。</li>
        <li>"losses"フォルダ: 学習時の損失関数が定義されている。</li>
        <li>"models"フォルダ: モデルの定義や学習に関するコードが配置されている。</li>
        <li>"trainer"フォルダ: 学習ループや評価ループなどのトレーニング関連の機能が配置されている。</li>
        <li>"utils"フォルダ: ロギングや設定管理などのユーティリティ関数が配置されている。</li>
        <li>"__pycache__"フォルダ: コンパイル済みのPythonファイルがキャッシュされる。</li>
      </ul>

      <h3>utilsフォルダの内容</h3>
      <p>
        SafeEarの処理として、最初に実行されるのが音声の前処理である。
        前処理とは、生の音声データをモデルが扱いやすいように変換することである。</br>
        "utils"フォルダには、その前処理を実行する以下のPythonファイルが配置されている。
      </p>
      <ul>
        <li>dump_hubert_feature.py: HuBERT特徴量を抽出するためのスクリプト。</li>
      </ul>
      <h4>dump_hubert_feature.pyの内容</h4>
      <p>
        dump_hubert_feature.pyは、音声データからHuBERT特徴量を抽出するためのスクリプトである。</br>
        具体的には、以下のような処理が行われている。
      </p>
      <p>
        95行目より、pythonの処理が開始されている。</br>
        96から106行目は、コマンドライン引数より値を設定できるようにしている。</br>
        99行目は、生の音声データのフォルダを引数の1番目もしくは"--audio_dir"のあとに記述することで設定できる。(デフォルトは"./datasets/ASVSpoof2019")。100行目は、HuBERT特徴量を保存するフォルダを引数の2番目もしくは"--save_dir"のあとに記述することで設定できる。(デフォルトは"./datasets/ASVSpoof2021/ASVspoof2021_LA_eval/Hubert_L9")。102行目は、使用するhubertモデルのバージョンを引数の3番目もしくは"--ckpt_path"のあとに記述することで設定できる。(デフォルトは"./model_zoo/hubert/hubert_base_ls960.pt")。103行目はレイヤーの数を引数の4番目もしくは"--layer"のあとに記述することで設定できる(デフォルトは"9")。104行目はchunk数の最大値を引数の5番目もしくは"--max_chunk"のあとに記述することで設定できる(デフォルトは"1600000")。</br>
        108行目より、コマンドラインの引数をmain関数に引き渡している。
      </p>
      <p>
        91行目より、main関数が定義されている。</br>
        92行目は、HubertFeatureReaderクラスを読み込み、返り値をreaderに代入している。</br>
        93行目は、dump_feature関数を呼び出している。</br>
      </p>
      <p>
        73行目より、dump_feature関数が定義されている。</br>

      </p>
      <p>
        29行目よりHubertFeatureReaderクラスが定義されている。</br>
      </p>
      <h5>単語</h5>
      <ul>
        <li>chunk数: 音声データを分割する際の単位数。音声データを分割して処理を行わないとメモリ不足などの問題が発生する可能性がある。</li>
      </ul>

      <h3>modelsフォルダの内容</h3>
      <p>
        "models"フォルダには、SafeEarのモデル定義や学習に関するコードが配置されている。具体的には、以下のようなファイルやフォルダが含まれている。
      </p>
      <ul>
        <li>decouple.py: SafeEarのメインモデルが定義されている。</li>
        <li>discriminator.py: モデル内で使用される各種レイヤーが定義されている。</li>
        <li>safeear.py: モデルの設定やハイパーパラメータが管理されている。</li>
      </ul>
      <h4>decouple.pyの内容</h4>
      <p>
        "decouple.py"には、SafeEarのメインモデルが定義されている。
      </p>
      <p>
        14行目より、SpeechTokenizerクラスが定義されている。このクラスは、訓練時に使用するyamlファイルの"decouplemodel"の"_target"において参照されている。</br>
        15行目は、SpeechTokenizerクラスのコンストラクタであり、引数として以下のパラメータを受け取る。</br>
      </p>
      <ul>
        <li>n_filters: SeaNetのベースチャンネル数</li>
        <li>dimension: 音声特徴量の次元数。エンコーダの出力次元数であり、デコーダの入力次元数でもある。</li>
        <li>strides: 畳み込み層のストライド</li>
        <li>lstm_layers: LSTM層の数</li>
        <li>bidirectional: 双方向LSTMの使用有無</li>
        <li>dilation_base: 膨張畳み込みの基準</li>
        <li>residual_kernel_size: 残差接続に使用するカーネルサイズ</li>
        <li>n_residual_layers: 残差接続の層数</li>
        <li>activation: 活性化関数</li>
        <li>sample_rate: サンプリングレート</li>
        <li>n_q: Quantizationのビット数</li>
        <li>semantic_dimension: セマンティック次元</li>
        <li>codebook_size: コードブックのサイズ</li>
      </ul>
      <h5>単語</h5>
      <ul>
        <li>LSTM層: 長短期記憶 (Long Short-Term Memory) ネットワークの層。時系列データの処理に適している。</li>
      </ul>


      <h4>safeear.pyの内容</h4>
      <p>
        "safeear.py"には、SafeEarのモデルに関する設定やハイパーパラメータが定義されている。具体的には、以下のような内容が含まれている。
      </p>
      <p>
        13行目のconv3x3()は、音声の特徴量を3x3のカーネルサイズのフィルタによって畳み込むための関数である。</br>
        引数は、2次元の入力平面のチャンネル数、2次元の出力平面のチャンネル数、カーネルサイズ(1で固定)である。</br>
        15行目より、返り値はnn.conv2d<sup><a href="#ref1">[1]</a></sup>によって生成される畳み込みレイヤー(カーネルサイズが3、ストライドが1、パディングが1、バイアスは無し)である。</br>
      </p>
      <p>
        18行目より、SELayerクラスを定義している。</br>
        23行目より、プーリングを"nn.AdaptiveAvgPool2d"により平均プーリングに設定している。</br>
        24行目より、層をLinear -> ReLU -> Linear -> Sigmoidの順に設定している。</br>
        33, 34行目より、入力テンソルをプーリングし、全結合層を通じてスケーリング係数を計算している。入力は[バッチサイズ, 64, 行数, 列数]であり、出力は[バッチサイズ, 64, 1, 1]である。</br>
      </p>
      <p>
        37行目より、BasicBlockクラスを定義している。</br>
        42行目より、conv3x3関数を使用して、入力データを3x3のカーネルサイズで畳み込む畳み込みレイヤーを作成している。</br>
        43行目より、"nn.BatchNorm2d"でバッチ正規化レイヤーを作成している。</br>
        44行目より、"nn.ReLU"で活性化関数ReLUを作成している。</br>
        45行目より、再度conv3x3関数を使用して、2回目の畳み込みレイヤーを作成している。</br>
        46行目より、再度"nn.BatchNorm2d"でバッチ正規化レイヤーを作成している。</br>
        47行目より、出力outの次元数がshortcutによって入力されるデータxと異なる場合に、使用する"downsample"を設定している。</br>
        50行目より、入力データを残差学習する。このとき入力と出力の次元数は同じである。
      </p>
      <p>
        68行目より、SEBasicBlockクラスを定義している。</br>
        このクラスでは、BasicBlockクラスにSELayerを組み合わせている。SELayerはSqueeze-and-Excitation Layerの略であり、チャネルごとの重要度を学習するためのモジュールである。</br>
        69行目より、expansionを1に設定している。</br>
        71から80行目において、reductionを16に設定してレイヤーを作成してる。3x3の畳み込みが2回、バッチ正規化が2回、ReLUが1回、SELayerが1回である。ダウンサンプリングも実装しているが、デフォルトでNoneとしている。</br>

      </p>
      <h5>
        単語
      </h5>
      <ul>
        <li>conv2d: 2次元畳み込みレイヤー。画像処理などでよく使用される。</li>
        <li>カーネルサイズ: 畳み込み演算に使用されるフィルターのサイズ。</li>
        <li>ストライド: 畳み込み演算を行う際の移動幅。</li>
        <li>パディング: 入力データの周囲に追加される値。出力サイズを調整するために使用される。</li>
        <li>バイアス: ニューラルネットワークの各ニューロンに加えられる定数項。</li>
        <li>ResNet(Residual Network): 残差(Residual)学習を利用した深層学習モデル。通常のネットワークでは直前の層の出力を全て次のレイヤーに渡すのに対し、ResNetではshortcutを用いて、入力を後の層に直接加えることで学習を容易にしている。層が深くなる際に、通常のネットワークでは複雑になりすぎてしまうため、残差学習を利用することが多い。</li>
        <li>expansion(ResNet): ResNetの1x1畳み込みによってチャンネル数を増やした際に出力チャンネル数が入力チャンネル数と一致しないことがあるため、このパラメータで調節する。</li>
      </ul>
      <p>
        単語についてもっと知りたい人は、<a href="https://qiita.com/kenichiro-yamato/items/60affeb7ca9f67c87a17">kerasのConv2D（2次元畳み込み層）について調べてみた</a>を参考にすると良い。
      </p>


      <h3>datasフォルダの内容</h3>
      <p>
        "datas"フォルダには、音声データや特徴量が配置されている。具体的には、以下のようなファイルやフォルダが含まれている。
      </p>
      <ul>
        <li>音声データファイル: 学習や評価に使用する音声データが格納されている。</li>
        <li>特徴量ファイル: 音声データから抽出した特徴量が格納されている。</li>
      </ul>

      <h3>trainerフォルダの内容</h3>
      <p>
        "trainer"フォルダには、学習ループや評価ループなどのトレーニング関連の機能が配置されている。具体的には、以下のようなファイルが含まれている。
      </p>
      <ul>
        <li>safeear_trainer.py: モデルの学習を実行するスクリプト。</li>
      </ul>
      <h4>safeear_trainer.pyの内容</h4>
      <p>
        "safeear_trainer.py"には、SafeEarのモデルの学習を実行するためのコードが含まれている。
      </p>
      <p>
        23行目にSafeEarTrainerクラスが定義されている。</br>
        155行目より、on_test_epoch_end関数が定義されている。この関数はepochのテスト終了時に呼び出され、テスト結果のログ出力やモデルの保存などを行う。
        157行目より、テスト時に使用するファイル名群をstring_listに格納している。</br>
        160行目より、テストのファイル名群を".reshape(-1, 1)"によって二次元の1列配列に変換している。<sup><a href="#ref2">[2]</a></sup></br>

      </p>
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
      <h2>参考文献</h2>
      <ol class="references">
        <li id="ref1">
          PyTorch Contributors. "torch.nn.Conv2d — PyTorch 2.5 documentation." PyTorch Documentation. 
          <a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html" target="_blank" rel="noopener">
            https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html
          </a> (閲覧日 2025-11-07)
        </li>
        <li id="ref2">
          AI Academy運営事務局. "reshape(1, -1)とreshape(-1, 1)とは何か." AI Academy Media. 
          <a href="https://aiacademy.jp/media/?p=1732" target="_blank" rel="noopener">
            https://aiacademy.jp/media/?p=1732
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