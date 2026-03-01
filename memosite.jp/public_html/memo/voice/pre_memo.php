<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>卒研メモ</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        body {
            font-family: 'Noto Sans JP', 'Hiragino Sans', 'Meiryo', sans-serif;
            line-height: 1.8;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fafafa;
            color: #333;
        }
        h1 {
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        h2 {
            border-left: 5px solid #4a90d9;
            padding-left: 15px;
            margin-top: 40px;
            background-color: #e8f4fc;
            padding: 10px 15px;
        }
        h3 {
            border-left: 3px solid #7ab8e8;
            padding-left: 10px;
            margin-top: 30px;
        }
        h4 {
            color: #4a90d9;
            margin-top: 25px;
        }
        .abstract {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .abstract-title {
            font-weight: bold;
            margin-bottom: 10px;
        }
        ul, ol {
            margin-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .formula {
            overflow-x: auto;
            margin: 15px 0;
        }
        .note {
            background-color: #fff9e6;
            border-left: 4px solid #ffc107;
            padding: 10px 15px;
            margin: 15px 0;
        }
        .section {
            margin-bottom: 40px;
        }
        figure {
            text-align: center;
            margin: 20px 0;
        }
        figure img {
            max-width: 80%;
            height: auto;
        }
        figcaption {
            font-size: 0.9em;
            color: #666;
            margin-top: 10px;
        }
        .page-break {
            border-top: 2px dashed #ccc;
            margin: 40px 0;
        }
        .reference {
            color: #4a90d9;
            text-decoration: none;
        }
        .reference:hover {
            text-decoration: underline;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #4a90d9;
            color: white;
        }
    </style>
</head>
<body>

<?php
// 卒研メモ - 言語学に依存しない話者識別について
?>

<h1>卒研メモ</h1>
<p style="text-align: center; font-style: italic;">－サブタイトル－</p>

<div class="abstract">
    <div class="abstract-title">概要</div>
    <p>本稿では、言語学に依存しない話者識別について、音声におけるパラ言語情報の認識、非言語情報の抽出方法の歴史、言語非依存性のジレンマ、基本的な音響特徴についてまとめる。</p>
</div>

<div class="section">
    <h2>1. 音声におけるパラ言語情報の認識のための学習話者の選択</h2>
    <p>音声は、3つに分類できる。</p>
    <ul>
        <li><strong>言語情報</strong>: 発話内容。</li>
        <li><strong>非言語情報</strong>: 性別や年齢など。</li>
        <li><strong>パラ言語情報</strong>: 感情、態度、意図など。</li>
    </ul>
    <p>感情が類似する話者のみのサンプルデータを使った話者認識のほうがそうでないデータよりも認識率が上がったという研究がある<span class="reference">[jasj_emotion]</span>。</p>
    <p>そのため、言語学と間接的につながっている感情のデータが話者特定に寄与することがわかる。</p>
</div>

<div class="section">
    <h2>2. 先行研究調べ</h2>
    <ul>
        <li><strong>狭義の話者識別</strong>: 音声サンプルが既知の話者のうち誰かを判定するタスク。</li>
        <li><strong>広義の話者識別</strong>: 話者認識と話者検証と話者ダイアライゼーションを含むタスク。<br>
            話者検証とは、主張された話者本人かを判定するタスク。<br>
            話者ダイアライゼーションとは、音声区間を話者ごとにセグメント化し、誰がいつ話したかを特定するタスク。複数人が同時に話しているサンプルに対して行う。
        </li>
    </ul>
    <p>言語非依存での課題の一つに言語的変異、つまり音韻内容や言語構造に関連するプロソディ(韻律)に対して頑健な特徴を抽出しなければならないことである。</p>
    <div class="note">
        <p>ここで、プロソディとはリズムやストレスやアクセントなどの言語の音の特徴のことである<span class="reference">[nativecamp_prosody]</span>。</p>
    </div>
    <p>また、言語非依存話者識別では、話者固有の特徴を抽出する必要がある。この時、生理学的属性(声道長、咽頭の構成など)や学習された行動パターン(特異な調音、習慣的なピッチ範囲、発話速度)を抽出する必要がある。</p>

    <h3>2.1 非言語情報の抽出方法の歴史について</h3>
    <p>初期ではスペクトル表現やピッチなどの音響特徴の長時間平均に依存していた。</p>
    <p>その後、統計モデルや混合正規分布モデル(GMM)およびGMM-ユニバーサル背景モデル(GMM-UBM)アプローチが各話者の音響特徴の分布をモデル化するために主流となった。</p>
    <p>その後、因子分析技術が導入され、i-vectorの開発につながった。</p>
    <p>その後、深層学習が支配的となった。DNNは音声データから直接識別力の高い固定長のスピーカー埋め込みを学習するために採用されている。最近では、Whisper Speaker Identification（WSI）フレームワークによって言語非依存の話者埋め込みを導出することに焦点を当てている。</p>
    <div class="note">
        <p>ここで、話者埋め込みとは話者の特徴全体を一つのベクトルで表現することである。話者そのものを一つの空間に埋め込むイメージ。</p>
    </div>
    <p>初期のころのモデルは、ピッチなどの平均をとるものであるなど単純な抽象化であった。しかし、統計モデルが発達するにつれ、深層学習埋め込みでは、生の音声をほとんど加工せずに必要な特徴を学習して複雑で非線形の関係をモデル化する能力にたけている<span class="reference">[zenn_speaker]</span>。</p>

    <h4>2.1.1 i-vectorとは</h4>
    <p>i-vectorについては<span class="reference">[jasj_ivector]</span>を参考にしている。話者の識別に寄与しない情報を軽減した空間である。</p>
    <p>(1昔前では)音声サンプルを一度i-vectorに変換したのちに、その空間内で話者照合していた。</p>
    <p>また、このi-vectorは話者とチャネルの違いを同時に全変動空間でモデル化しようとする空間である。ここで、話者識別の際はi-vectorから話者の情報を敏感に抽出したいため、チャネルを低減または除去する「チャネル補償」の技術(LDA, WCCN, etc...)が必要である。</p>
    <div class="note">
        <p>ここで、チャネルとは同一話者でも録音ごとに違いが生まれてしまう原因のことである。例えば、録音環境や体調などがあげられる。</p>
    </div>

    <p>全変動とは、\(y_i\): 測定値, \(\mu_Y\): 平均値, \(\sigma_Y^2\): 分散とした際、</p>
    <div class="formula">
        \[\sum_{i=1}^n(y_i-\mu_Y)^2\]
    </div>
    <p>によって計算される値である。</p>
    <p>全変動はデータがどれぐらい散らばっているかを表す指標である。全変動は分散のn倍(\(n\mu_Y^2\))と同値である。</p>
    <p>全変動は回帰変動と比べるとわかりやすい。</p>
    <p>\(f(x_i)\): 最小二乗法による1次関数の回帰モデルとした際、回帰変動は、</p>
    <div class="formula">
        \[\sum_{i=1}^n(f(x_i)-\mu_Y)^2\]
    </div>
    <p>で計算される。</p>
    <p>以上の式の導出は<span class="reference">[manabitimes_math]</span>を参考にしている。</p>
</div>

<div class="section">
    <h2>3. 言語非依存性のジレンマ</h2>
    <p>単一言語データで訓練された言語学非依存の話者識別モデルは、他の言語の話者識別に対して精度が悪い。一方で、多言語データで訓練された言語学非依存の話者識別モデル(WSIなど)では、さまざまな言語に対して比較的精度が高いことが知られている。</p>
    <p>これは、学習過程において異なる言語同士の変動性を考慮したほうが言語非依存の話者識別モデルの精度が上がることが示唆されている。実は言語非依存の話者識別モデルのサンプルには言語の依存をしているのが現状である。</p>
    <p>そもそも、学習サンプルは様々な種類かつ大量にあることが望ましい。その点、多言語モデルのほうが単一言語モデルよりも優れていることは明らかである。それとともに、言語非依存モデルの構築において、まったく言語によらない人間の音のみで学習することは偏りが生じてしまうため、あまり良いとは言えない。</p>
</div>

<div class="section">
    <h2>4. 言語非依存の基本的な音響特徴</h2>

    <h3>4.1 メル周波数ケプストラム係数(MFCC)</h3>
    <p>MFCCは、人間が音を認識する際の周波数近くを模倣した心理音響学的基盤を基にした特徴量の抽出方法である。これによって表現できる音声のスペクトルは声道振動(フォルマント)による影響が大きい。</p>
    <p>ここで、人間の声道のサイズと形状は一意であるためMFCCによる音声スペクトルの表現は非言語情報を強く映し出していることがわかる。そのため、平滑化されたスペクトルを利用することで音韻的な情報を抑えつつ、話者の発声器官による特徴量に焦点を当てることができる。</p>

    <h3>4.2 ピッチ(基本周波数 - F0)</h3>
    <p>ピッチには2種類存在するが、今回取り扱うのはF0である。F0とは、声帯振動数の音響的相関である。</p>
    <p>咽頭サイズと声道特性がベースラインF0に影響を与えることが知られている。ただし、F0は言語的なアクセントなどのプロソディに依存する面もある。そのため、言語的なF0の特徴を話者固有のF0の特徴から切り離すことが大事である。</p>

    <h3>4.3 フォルマント</h3>
    <p>（内容準備中）</p>
</div>

<div class="section">
    <h2>5. 話者識別の歴史について</h2>
    <p>音声認識技術の発展は「音声の多様な変形への対処」の歴史であるといえる。代表的なものでは、同じ単語を発話しても発生時間がその都度変化する時間方向の変形や、発生した人の違いによる話者の違いによる変形などがある。</p>
    <p>そこでまず1970年代に、DP(Dynamic Programming)が考案された。DPマッチングによって時間方向の伸縮の正規化を実現した。</p>
    <p>次に1980年代では、確率統計モデルHMM(Hidden Markov Model)が考案された。HMMにより時間方向の収縮だけではなく、その他の変形への対処が可能となった。</p>
    <p>初期のDPマッチングでは、孤立言語の発話に対して特定の話者をテストケースとして用いることしかできなかった。しかし、DPマッチングの晩年からHMMの発展によって連続単語に対して不特定話者のテストケースを使用することが可能となった。また、HMMから使用できる語彙が100程度から数1000語に増加した。</p>

    <h4>5.0.1 DP(Dynamic Programming)による音声認識</h4>
    <p>以下の歴史は<span class="reference">[ieej_lpc]</span>を参考にしている。1970年代後半、音声認識のもっとも簡単な形態である、孤立単語認識が可能となった。音響分析手法としての線形予測(LPC)分析、音声の時間方向の変形に対処したDPマッチングの提案によって確立した。</p>
    <p>ここで、線形予想分析とは、過去の音声サンプルの特徴量から次の特徴量を予想する分析方法である。音声は複雑なシステムであるが、仮に線形近似が成り立つならば、その変数は各種指標(定数係数)を要素とするベクトルとして表現することができる。よって予想できるパラメータは行列の系列として考えることができる。ここで、多次元音声の難しさは指標の間にある相関関係を断つような独立成分分析が必要になる<span class="reference">[toho_linear_prediction]</span>。なぜなら、サンプルの音声から一般的に使用できる音声認識モデルを作成をするためには、サンプル音声固有の成分の相関関係を取り除かなくてはならないからである。線形予想分析による次の特徴量の予想は以下の式で行われる。</p>

    <p><strong>線形予測分析の基本式：</strong></p>
    <div class="formula">
        \[\hat{s}(n) = -\sum_{k=1}^{p} a_k s(n-k) (+ v_n)\]
    </div>
    <p>ここで、</p>
    <ul>
        <li>\(\hat{s}(n)\): 予測値</li>
        <li>\(s(n-k)\): 過去のサンプル値</li>
        <li>\(a_k\): 線形予測係数</li>
        <li>\(p\): 予測次数</li>
        <li>\(v_n\): 正規白色雑音(ホワイトノイズ)、つまり系列相関のない(サンプルの違いによる成分の違いがない)データである。（ただし、ここでは省略されることが多い）</li>
    </ul>
    <p>であり、\(a_k\)の値を適切に設定することによって、精度の高い\(\hat{s}(n)\)を求めることが可能となる。</p>

    <p><strong>予測誤差：</strong></p>
    <div class="formula">
        \[e(n) = s(n) - \hat{s}(n) = s(n) + \sum_{k=1}^{p} a_k s(n-k)\]
    </div>
    <p>ここで、線形分析の基本式を負としたことで\(\hat{s}(n)\)を正の数として計算することが可能となっている。当然であるが、この予測誤差を0に近づけることを目指す。</p>

    <p>以下に、予想誤差分散の期待値を最小にする\(a_k\)を求める方程式であるYule-Walker方程式<span class="reference">[utokyo_timeseries]</span>を示す。</p>

    <p><strong>自己相関関数を用いた正規方程式（Yule-Walker方程式）：</strong></p>
    <div class="formula">
        \[\sum_{k=1}^{p} a_k R(|i-k|) = -R(i), \quad i = 1, 2, \ldots, p\]
    </div>

    <p>ここで、\(R(k)\)は自己相関関数：</p>
    <div class="formula">
        \[R(k) = \sum_{n=0}^{N-1-k} s(n)s(n+k)\]
    </div>
    <p>であり、自己相関関数は\(k\)の時間長さの間にどれだけ似ているかを示す関数である。\(R(k)\)が大きいほど、\(k\)の時間ずらしたサンプルは似ているといえる。</p>

    <p><strong>線形予測係数の最適化（最小二乗誤差）：</strong></p>
    <div class="formula">
        \[E = \sum_{n=p}^{N-1} e^2(n) = \sum_{n=p}^{N-1} \left(s(n) + \sum_{k=1}^{p} a_k s(n-k)\right)^2\]
    </div>
    <p>このとき、\(a_k\)を求める際に連続的に変えることで、Eは連続的な二次関数となる。また、その二次関数は下に凸な形であるため、最小値を簡単に求めることができる。その際に、最小二乗誤差を重みについて偏微分し、0の点を求めることで最小の値をを求める方法こそがYule-Walker方程式である<span class="reference">[toho_linear_prediction]</span>。</p>
</div>

<div class="page-break"></div>

<div class="section">
    <h2>6. 隠れマルコフモデル(HMM)による音響分析</h2>
    <p>（まずこれを見てマルコフを勉強する→<span class="reference">[bin_startup16]</span>）</p>
    <p>隠れマルコフモデルはいまだに、ディープランニングと組み合わせて使われている。そのため、HMMについて知ることは大切である<span class="reference">[spjai_speech_recognition]</span>。</p>
    <p>HMMとは、時間変移によって状態が変移するシステムをモデル化する手法である。特に、システムの状態は直接観測できない隠れ状態であり、何らかの観測可能な記号によって確立が生成される場合に用いられる。</p>
    <p>また、HMMはマルコフ過程という考え方がもとになっている。マルコフ過程とは、未来の状態は現在の状態のみに依存し、過去の状態には依存しない過程を指す。</p>

    <div class="note">
        <p><strong>HMMの例：</strong><br>
        天気の状態を{晴れ、曇り、雨}とし、観測可能な記号を{アイスクリームの売り上げ}とする。このとき、アイスクリーム屋の店員は経験則から天気を見ずとも、アイスクリームの売り上げで天気を予測することができる。例えば、アイスクリームの売り上げが高いときは晴れ、低いときは雨と予測することができる。このように、隠れ状態(天気)と観測可能な記号(アイスクリームの売り上げ)がある場合にHMMを用いることができる。</p>
    </div>
    <p>ただし、マルコフ過程に準ずるHMMは一次のHMMであり、二次以上のマルコフモデルも存在する。</p>

    <h4>6.0.1 HMMの構成要素</h4>
    <ul>
        <li><strong>状態\(S\)</strong>: システムがとりうる内部的な隠れている状態の集合。</li>
        <li><strong>観測記号\(O\)</strong>: 各状態から確率的に出力される観測可能な記号の集合。</li>
        <li><strong>状態遷移確率\(A\)</strong>: ある状態から別の状態へ変移する確率。</li>
        <li><strong>出力確率\(B\)</strong>: ある状態にいるときに、特定の観測記号が出力される確率。</li>
        <li><strong>初期状態確率\(\pi\)</strong>: モデル開始時に、各状態が初期状態である確率。</li>
    </ul>
    <p>ここで、HMMは、</p>
    <div class="formula">
        \[\lambda = (A, B, \pi)\]
    </div>
    <p>によって定義される。</p>

    <h4>6.0.2 HMMの利点と欠点</h4>
    <p><strong>HMMの利点</strong></p>
    <ul>
        <li>時系列データの時間的な変動や依存関係をとらえるのに適している。</li>
        <li>確率に基づき、不確実性や曖昧性を持つ現象を扱うことができる。</li>
        <li>アルゴリズムの研究が進んでいる。</li>
        <li>柔軟性に富み、様々な研究で応用化されている。</li>
    </ul>

    <p><strong>HMMの欠点</strong></p>
    <ul>
        <li>過去の状態に依存しないマルコフ性自体が、過程として現実から離れている。</li>
        <li>マルコフ性の制約から、長い時間スケールでの依存関係をとらえるのは苦手である。</li>
        <li>状態数を適切に定めなければならない。これが難しい場合がある。</li>
    </ul>

    <h3>6.1 音響分析へのHMMの応用</h3>

    <h4>6.1.1 音声認識</h4>
    <p>HMMは音声認識において最も成功した応用例の一つとなっている。モデル化は以下のように行われる。</p>
    <ul>
        <li><strong>状態\(S\)</strong>: 音声の最小単位である「音素」や、音素内の部分的な音響特徴をHMMの状態として定義する。</li>
        <li><strong>観測記号\(O\)</strong>: 音声信号から抽出される特徴量(MFCC)のベクトルを観測記号として定義している。ただし、これらは連続値であるため、連続分布HMMを使用し、出力確率はガウス混合モデルなどで表現されている。</li>
        <li><strong>単語モデル</strong>: 音素HMMを連結することで単語HMMを構築する。</li>
        <li><strong>言語モデル</strong>: 単語の並びやすさ(文法的な正しさや出現頻度)をモデル化し、HMMのデコーディング結果と統合するモデル。</li>
    </ul>

    <p><strong>処理の流れ：</strong></p>
    <ol>
        <li>入力音声から短時間フレームごとに音響特徴量(MFCCなど)を抽出する。つまり、観測系列を得る。</li>
        <li>学習済みの音素HMMや単語HMMや言語モデルを使用して、ビタビアルゴリズムによって観測された音響特徴系列に最も適合する単語列を探索する。</li>
        <li>探索結果が認識されたテキストとなる。</li>
    </ol>

    <h4>6.1.2 話者識別・話者照合</h4>
    <p>モデル化は以下のように行われる。</p>
    <ul>
        <li><strong>状態\(S\)</strong>: 個人が固有に持つ声道の音響的な特徴を抽象的にとらえたものを状態として定義する。</li>
        <li><strong>観測記号\(O\)</strong>: 音声信号から抽出される特徴量(MFCCやピッチなど)を観測記号として定義する。</li>
        <li><strong>状態遷移確率\(A\)</strong>: 話者の音声特徴が時間とともにどのように変化するかをモデル化する。</li>
        <li><strong>モデル</strong>: 登録話者に対して、各々の特徴を表すHMMを構築する。</li>
    </ul>
    <p>識別においては、登録話者のHMMに対して入力音声の尤度を計算し、最尤度を持つHMMを識別結果とする。照合においては、話者のHMMの尤度を計算し、事前に設定した閾値を超えれば本人と判定する。</p>

    <h3>6.2 HMMの数学的な理解</h3>

    <h4>6.2.1 定常信号源</h4>
    <p>観測できる量を\(y_t\)としたとき、その系列が一定の確率分布によって得られるときに、それを定常信号源という<span class="reference">[utokyo_hmm]</span>。</p>
    <p>この時、定常過程には、強定常と弱定常の2種類がある。</p>
    <ul>
        <li><strong>強定常</strong>とは、\(x(t)\)と\(x(t+\tau)\)の確率分布が任意の\(\tau\)に対して同一の確率密度分布を要することを指す。</li>
        <li><strong>弱定常</strong>とは、\(x(t)\)の平均が定数である。また、自己相関関数が時間差のみの関数であることを指す。つまり、\(E[x(t)]\)は一定で、\(E[x(t)x(t+\tau)] = R(\tau)\)である<span class="reference">[utokyo_kameoka_sp]</span>。</li>
    </ul>
    <p>つまり、定常信号源は強定常である。</p>

    <p>自己相関がない場合において、混合正規分布を考える。ここで混合正規分布\(f(\mathbf{y})\)とは、凹凸が複数あるような複雑な分布を複数の正規分布の和として表現したものである。</p>
    <div class="formula">
        \[f(\mathbf{y}) = \sum_{i=1}^{m} w_i N(\mathbf{y}; \boldsymbol{\mu}_i, \boldsymbol{\Sigma}_i)\]
    </div>
    <div class="formula">
        \[\text{ただし、}\sum_{i} w_i = 1\]
    </div>
</div>

<div class="page-break"></div>

<div class="section">
    <h2>7. DNNについて</h2>
    <p>（内容準備中）</p>
</div>

<div class="page-break"></div>

<div class="section">
    <h2>8. エラー一覧</h2>

    <h3>8.1 CLion コンパイルエラー</h3>
    <figure>
        <img src="images/pre_memo/error_statement.png.jxl" alt="CLionコンパイルエラーの表示">
        <figcaption>図1: CLionコンパイルエラーの表示</figcaption>
    </figure>
    <p>gccだとコンパイルできないのが原因であった。そのため、nvccを使わなければならない。ただし、windows環境でのnvccの使用は難しいので、wslの環境で使用した。wslでのcuda環境の構築は<span class="reference">[jetbrains_clion_cuda]</span><span class="reference">[nvidia_cuda_linux_install]</span>を参考にした。</p>
</div>

<div class="page-break"></div>

<div class="section">
    <h2>参考文献</h2>
    <ul>
        <li>[jasj_emotion] 音声におけるパラ言語情報の認識のための学習話者の選択</li>
        <li>[nativecamp_prosody] プロソディについて</li>
        <li>[zenn_speaker] 話者識別について</li>
        <li>[jasj_ivector] i-vectorについて</li>
        <li>[manabitimes_math] 全変動と回帰変動の数学的導出</li>
        <li>[ieej_lpc] 線形予測分析の歴史</li>
        <li>[toho_linear_prediction] 線形予測分析について</li>
        <li>[utokyo_timeseries] 時系列分析・Yule-Walker方程式</li>
        <li>[bin_startup16] マルコフ過程について</li>
        <li>[spjai_speech_recognition] 音声認識について</li>
        <li>[utokyo_hmm] HMMと定常信号源について</li>
        <li>[utokyo_kameoka_sp] 定常過程について</li>
        <li>[jetbrains_clion_cuda] CLionでのCUDA環境構築</li>
        <li>[nvidia_cuda_linux_install] Linux環境でのCUDAインストール</li>
    </ul>
</div>

<footer style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; color: #666;">
    <p>卒研メモ - <?php echo date('Y'); ?></p>
</footer>

</body>
</html>
