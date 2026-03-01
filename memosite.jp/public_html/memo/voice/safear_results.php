<?php
require_once '../../includes/head.php';
require_once '../../includes/common.php';
require_once '../../includes/ad-a8.php';
require_once '../../includes/image-helper.php';
require_once __DIR__ . '/../../includes/comment-section.php';

$title = 'SafeEar: 実験レポート';
$description = 'SafeEarをASVspoof2019やJ-SpAWで学習、評価した実験の記録。仮説、実験方法、結果（添付ファイル一覧）、考察を整理。';
$keywords = 'SafeEar,ASVspoof2019,J-SPAW,スプーフィング検出,EER,実験レポート,ドメインシフト';
$canonical = 'https://memosite.jp/voice/safear_results.php';

renderHead($title, $description, $keywords, $canonical);
?>
<body>
<?php renderNavigation('memo'); ?>

<main class="container fade-in page-content">
  <article>
    <header>
      <h1>SafeEar: 実験レポート <span class="update-info"><?php echo date('Y年m月d日更新', filemtime(__FILE__)); ?></span></h1>
      <p class="lead">SafeEar を用い、実験、考察を行う。</p>
      <div class="article-meta" style="margin-top:1rem;">
        <span class="tag">SafeEar</span>
        <span class="tag">ASVspoof2019</span>
        <span class="tag">J-SPAW</span>
        <span class="tag">スプーフィング検出</span>
      </div>
    </header>

    <section>
      <h2>実験1: ASVspoof2019学習 → J-SPAW評価</h2>

      <h3>仮説</h3>
      <p>
        ASVspoof2019（LA）で学習したスプーフィング検出器は、J-SPAW に対しても一定の汎化性能を示すはずだ、という仮説を置いた。</br>
        ここで、ASVspoof2019は英語、J-SpAWは日本語のデータセットであるため、言語による違いがスプーフィング検出の精度に影響する可能性が考えられる。</br>
        しかし、SafeEarはHuBERT-L9特徴に基づく音声の前処理を行っているため、言語情報を除き音響的特徴を重視するモデルである。そのため、言語の違いに対しても頑健に動作することを期待した。
      </p>

      <h3>実験方法</h3>
      <ul>
        <li>モデル: SafeEar（HuBERT L9 ベースの特徴抽出、既定設定）<sup><a href="#ref1">[1]</a></sup></li>
        <li>学習データ: ASVspoof2019 LA（train+dev を使用）<sup><a href="#ref2">[2]</a></sup></li>
        <li>評価データ: J-SPAW（LA セット、ゼロショット評価）<sup><a href="#ref3">[3]</a></sup></li>
        <li>評価指標: EER（Equal Error Rate）、DET/ROCの見た目確認</li>
      </ul>
      
      <h3>実験結果（添付画像とファイル）</h3>
      <p>
        以下に、ASVspoof2019で学習したSafeEarをJ-SPAWで評価した際の主要な図とスコアファイルを添付する。
      </p>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">DETカーブ (det_curve)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_ASV2019/testing_on_J-SpAW-LA/det_curve.webp.jxl', 'DET curve for SafeEar (ASVspoof2019→J-SPAW)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">ROCカーブ (roc_curve)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_ASV2019/testing_on_J-SpAW-LA/roc_curve.webp.jxl', 'ROC curve for SafeEar (ASVspoof2019→J-SPAW)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">スコア分布 (score_distribution)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_ASV2019/testing_on_J-SpAW-LA/score_distribution.webp.jxl', 'Score distribution for SafeEar (ASVspoof2019→J-SPAW)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">スコアファイル (score.csv)</h4>
        <p>
          生のスコアは以下のCSVから取得できる。
          <a href="/voice/images/SafeEar/training_on_ASV2019/testing_on_J-SpAW-LA/score.csv" target="_blank" rel="noopener">score.csv をダウンロード</a>
        </p>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">サマリー (summary.txt)</h4>
        <p>
          実験条件やEERなどのサマリーは以下のテキストにまとめている。
          <a href="/voice/images/SafeEar/training_on_ASV2019/testing_on_J-SpAW-LA/summary.txt" target="_blank" rel="noopener">summary.txt をダウンロード</a>
        </p>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">収録環境とスコアの相関ヒートマップ (env_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_ASV2019/testing_on_J-SpAW-LA/env_id_heatmap.webp.jxl', 'Correlation heatmap for SafeEar (ASVspoof2019→J-SPAW)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">合成音声手法とスコアの相関ヒートマップ (la_method_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_ASV2019/testing_on_J-SpAW-LA/la_method_id_heatmap.webp.jxl', 'Correlation heatmap for SafeEar (ASVspoof2019→J-SPAW)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">マイク環境とスコアの相関ヒートマップ (mic_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_ASV2019/testing_on_J-SpAW-LA/mic_id_heatmap.webp.jxl', 'Correlation heatmap for SafeEar (ASVspoof2019→J-SPAW)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">収録場所とスコアの相関ヒートマップ (room_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_ASV2019/testing_on_J-SpAW-LA/room_id_heatmap.webp.jxl', 'Correlation heatmap for SafeEar (ASVspoof2019→J-SPAW)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">発話テキストとスコアの相関ヒートマップ (sent_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_ASV2019/testing_on_J-SpAW-LA/sent_id_heatmap.webp.jxl', 'Correlation heatmap for SafeEar (ASVspoof2019→J-SPAW)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">発話者とスコアの相関ヒートマップ (spkr_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_ASV2019/testing_on_J-SpAW-LA/spkr_id_heatmap.webp.jxl', 'Correlation heatmap for SafeEar (ASVspoof2019→J-SPAW)');
        ?>
      </section>


      <h3>考察</h3>
      <p>
        実験1では、EERは0.4526とスプーフィング検出器としては高い値となってしまった。主な要因として、以下のドメインギャップが考えられる。
      </p>
      <ul>
        <li>攻撃分布の違い: ASVspoof2019 LA の主攻撃（TTS/VC）の実装・品質と、J-SPAW における生成器や再生・収録条件が大きく異なる。</li>
        <li>言語・話者の相違: 日本語話者・読み上げ条件の違いにより、HuBERT-L9 が抽出する音響・準言語的特徴の統計がシフト。</li>
      </ul>
      <p>
        また、発話者ラベルのヒートマップより、全体的に人間の音声も機械の音声も、機械の音声であると認識している傾向に見られた。これは、モデルが話者情報を多く影響しているために違う話者の音声を訓練した際に機械音声として誤認識してしまうと考えられる。また、発話者のヒートマップから、話者ごとのスコアのばらつきが大きいことも確認できる。これは、話者ごとの音響的特徴の違いがスプーフィング検出に影響を与えている可能性を示唆している。
      </p>
      <p>
        改善策としては、(a) J-SPAW 一部を開発用に用いた軽微なファインチューニング、(b) チャネル正規化やボコーダ依存成分の抑制、(c) 対敵的学習やドメイン不変表現の導入、(d) 複数特徴（e.g., CQT/Log-Mel + HuBERT）や複数器のアンサンブル (e) HuBERTのレイヤー数を上げることでより言語情報を少なくする、などが挙げられる。
      </p>
    </section>

    <?php renderA8Ad(); ?>

    <section>
      <h2>実験2: J-SPAW-LA学習 → J-SPAW-PA評価</h2>

      <h3>仮説</h3>
      <p>
        実験2では、J-SPAW-LA で SafeEar を学習し、そのモデルを J-SPAW-PA に対して評価する。学習・評価ともに日本語コーパスかつ同一ドメインであるため、実験1（ASVspoof2019→J-SPAW）よりもドメインギャップが小さく、EER や ROC/DET の形状が改善することを期待した。
        ただし、PA ではスピーカ再生やマイク位置、部屋の反響といった要因が加わるため、一部の環境や話者ではスコアが悪化する傾向も見られる可能性がある。相関ヒートマップを精査し、どの条件で偽受容／偽拒否が増えているかを特定することで、フロントエンド処理やしきい値設定の改善方針を立てることができる。
      </p>

      <h3>実験方法</h3>
      <ul>
        <li>モデル: SafeEar（J-SPAW-LA で再学習したモデル）</li>
        <li>学習データ: J-SPAW-LA（LA セット、合成音声と本物音声を利用）</li>
        <li>評価データ: J-SPAW-PA（物理再生された攻撃音声と本物音声）</li>
        <li>評価指標: EER、ROC/DET カーブ、環境・マイク・部屋・発話文・話者ごとのスコア分布と相関</li>
        <li>学習設定: attentionのdropoutを0.1->0.3に増加した。</li>
      </ul>

      <h3>実験結果（添付画像とファイル）</h3>
      <p>
        
        以下に実験結果の画像を添付する。
      </p>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">DETカーブ (det_curve)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_J-SpAW-PA/det_curve.webp.jxl', 'DET curve for SafeEar (J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">ROCカーブ (roc_curve)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_J-SpAW-PA/roc_curve.webp.jxl', 'ROC curve for SafeEar (J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">スコア分布 (score_distribution)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_J-SpAW-PA/score_distribution.webp.jxl', 'Score distribution for SafeEar (J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">相関サマリー (correlation_summary.csv)</h4>
        <p>
          環境、マイク、部屋、発話文、話者ごとのスコア相関の概要は以下の CSV にまとめている。
          <a href="/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_J-SpAW-PA/correlation_summary.csv" target="_blank" rel="noopener">correlation_summary.csv をダウンロード</a>
        </p>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">スコアファイル (score.csv)</h4>
        <p>
          生のスコアは以下の CSV から取得できる。
          <a href="/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_J-SpAW-PA/score.csv" target="_blank" rel="noopener">score.csv をダウンロード</a>
        </p>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">サマリー (summary.txt)</h4>
        <p>
          実験条件や EER などのサマリーは以下のテキストにまとめている。
          <a href="/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_J-SpAW-PA/summary.txt" target="_blank" rel="noopener">summary.txt をダウンロード</a>
        </p>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">収録環境とスコアの相関ヒートマップ (env_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_J-SpAW-PA/env_id_heatmap.webp.jxl', 'Correlation heatmap (environment vs score, J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">マイク環境とスコアの相関ヒートマップ (mic_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_J-SpAW-PA/mic_id_heatmap.webp.jxl', 'Correlation heatmap (microphone vs score, J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">収録場所とスコアの相関ヒートマップ (room_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_J-SpAW-PA/room_id_heatmap.webp.jxl', 'Correlation heatmap (room vs score, J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">発話テキストとスコアの相関ヒートマップ (sent_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_J-SpAW-PA/sent_id_heatmap.webp.jxl', 'Correlation heatmap (sentence vs score, J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">発話者とスコアの相関ヒートマップ (spkr_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_J-SpAW-PA/spkr_id_heatmap.webp.jxl', 'Correlation heatmap (speaker vs score, J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <h3>考察</h3>
      <p>
        実験2では、学習・評価ともに J-SPAW 系コーパスであることから、実験1と比べてドメインギャップが小さい設定となる。しかしながら、EERは0.3949と高い値となってしまった。ただ、実験1と違いスコアが全体的に1に近づいていることから、合成音声を本物の話者として認識してしまう傾向となっている。
      </p>
      <p>
        これは、J-SpAWのLAの人間の音声にはノイズが含まれて機械の音声にはノイズが含まれていないが、PAの人間と機械の音声はともにノイズが含まれているため、PAのノイズが人間の音声の特徴と捉えてしまっていると考えられる。
      </p>
      <p>
        SafeEarはノイズ除去をしていない。</br>
        そのため次回の実験では、音声ファイルのノイズ除去をした結果を調べることにする。
      </p>
    </section>

    <?php renderA8Ad(); ?>

    <section>
      <h2>実験3: J-SPAW-LA学習(ノイズ除去) → J-SPAW-PA評価(ノイズ除去)</h2>

      <h3>仮説</h3>
      <p>
        実験3では、ノイズを除去した音声を使用して、実験2と同様の実験を行った。
        attentionのdropoutは元に戻した。
      </p>

      <h3>実験方法</h3>
      <ul>
        <li>モデル: SafeEar（J-SPAW-LA で再学習したモデル）。学習済みのモデルの<a href="models/J-SpAW_denoise_L9/epoch=41-val_eer=0.2392.ckpt">ダウンロード(762MB)</a>。</li>
        <li>学習データ: J-SPAW-LA（LA セット、合成音声と本物音声を利用）</li>
        <li>評価データ: J-SPAW-PA（物理再生された攻撃音声と本物音声）</li>
        <li>評価指標: EER、ROC/DET カーブ、環境・マイク・部屋・発話文・話者ごとのスコア分布と相関</li>
        <li>学習設定: ノイズ除去に"reducenoise"<sup><a href="#ref4">[4]</a></sup></li>を使用した。
        </li>
      </ul>

      <h3>実験結果（添付画像とファイル）</h3>
      <p>
        
        以下に実験結果の画像を添付する。
      </p>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">DETカーブ (det_curve)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_denoise-PA/det_curve.webp.jxl', 'DET curve for SafeEar (J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">ROCカーブ (roc_curve)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_denoise-PA/roc_curve.webp.jxl', 'ROC curve for SafeEar (J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">スコア分布 (score_distribution)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_denoise-PA/score_distribution.webp.jxl', 'Score distribution for SafeEar (J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">相関サマリー (correlation_summary.csv)</h4>
        <p>
          環境、マイク、部屋、発話文、話者ごとのスコア相関の概要は以下の CSV にまとめている。
          <a href="/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_denoise-PA/correlation_summary.csv" target="_blank" rel="noopener">correlation_summary.csv をダウンロード</a>
        </p>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">スコアファイル (score.csv)</h4>
        <p>
          生のスコアは以下の CSV から取得できる。
          <a href="/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_denoise-PA/score.csv" target="_blank" rel="noopener">score.csv をダウンロード</a>
        </p>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">サマリー (summary.txt)</h4>
        <p>
          実験条件や EER などのサマリーは以下のテキストにまとめている。
          <a href="/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_denoise-PA/summary.txt" target="_blank" rel="noopener">summary.txt をダウンロード</a>
        </p>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">収録環境とスコアの相関ヒートマップ (env_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_denoise-PA/env_id_heatmap.webp.jxl', 'Correlation heatmap (environment vs score, J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">マイク環境とスコアの相関ヒートマップ (mic_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_denoise-PA/mic_id_heatmap.webp.jxl', 'Correlation heatmap (microphone vs score, J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">収録場所とスコアの相関ヒートマップ (room_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_denoise-PA/room_id_heatmap.webp.jxl', 'Correlation heatmap (room vs score, J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">発話テキストとスコアの相関ヒートマップ (sent_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_denoise-PA/sent_id_heatmap.webp.jxl', 'Correlation heatmap (sentence vs score, J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <section class="attachment-item" style="margin:1rem 0;">
        <h4 style="font-size:1rem;margin:.2rem 0;">発話者とスコアの相関ヒートマップ (spkr_id_heatmap)</h4>
        <?php
          echo renderImage('/voice/images/SafeEar/training_on_J-SpAW-LA/testing_on_denoise-PA/spkr_id_heatmap.webp.jxl', 'Correlation heatmap (speaker vs score, J-SPAW-LA→J-SPAW-PA)');
        ?>
      </section>

      <h3>考察</h3>
      <p>
        実験3では、EERは0.275であった。依然として、合成音声の検出器としては高い値であったが、実験2寄りは精度が上がったことが確認できた。
        音声の前処理や、ノイズ除去が精度に関係していると考えることができた。
      </p>
      <p>
        次回の実験では、ノイズ除去の方法を変更して、実験を行いたいと考えている。
      </p>
    </section>

    <section>
      <h3>参考文献</h3>
      <ol class="references">
        <li id="ref1">
          SafeEar 開発リポジトリ. "SafeEar." GitHub. 
          <a href="https://github.com/LetterLiGo/SafeEar" target="_blank" rel="noopener">https://github.com/LetterLiGo/SafeEar</a> (閲覧日 2025-11-14)
        </li>
        <li id="ref2">
          Tomi Kinnunen, Nicholas Evans, Junichi Yamagishi, et al. "ASVspoof 2019: Automatic Speaker Verification Spoofing and Countermeasures Challenge." arXiv. 
          <a href="https://arxiv.org/abs/1910.00017" target="_blank" rel="noopener">https://arxiv.org/abs/1910.00017</a> (閲覧日 2025-11-14)
        </li>
        <li id="ref3">
          Takamichi Lab. "J-SpAW: Japanese Spoofed and Authentic Speech Corpus." GitHub. 
          <a href="https://github.com/takamichi-lab/J-SpAW" target="_blank" rel="noopener">https://github.com/takamichi-lab/J-SpAW</a> (閲覧日 2025-11-14)
        </li>
        <li id="ref4">
          noisereduce 3.0.3 
          <a href="https://pypi.org/project/noisereduce/#description" target="_blank" rel="noopener">https://pypi.org/project/noisereduce/#description</a> (閲覧日 2025-11-21)
        </li>
      </ol>
    </section>
  </article>
</main>

<?php renderFooter(); ?>

<!-- 構造化データ -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "SafeEar: ASVspoof2019学習 → J-SPAW評価 実験レポート",
  "description": "ASVspoof2019で学習したSafeEarをJ-SPAWで評価した結果の技術レポート。",
  "author": {"@type": "Organization", "name": "メモ帳"},
  "datePublished": "2025-11-14",
  "dateModified": "<?php echo date('c', filemtime(__FILE__)); ?>",
  "mainEntityOfPage": {"@type": "WebPage", "@id": "https://memosite.jp/voice/safear_results.php"},
  "keywords": "SafeEar,ASVspoof2019,J-SPAW,スプーフィング検出,EER"
}
</script>

<!-- 構造化データ（パンくず） -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://memosite.jp/"},
    {"@type": "ListItem", "position": 2, "name": "音声研究メモ", "item": "https://memosite.jp/voice/"},
    {"@type": "ListItem", "position": 3, "name": "SafeEar 実験レポート", "item": "https://memosite.jp/voice/safear_results.php"}
  ]
}
</script>

</body>
</html>
