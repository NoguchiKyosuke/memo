<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Noisereducer Code Learning</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    
    <!-- PrismJS for Syntax Highlighting -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css" rel="stylesheet" />

    <style>
        :root {
            --bg-color: #0f0f12;
            --surface-color: #1e1e24;
            --text-primary: #e0e0e0;
            --text-secondary: #a0a0a0;
            --accent-color: #6c5ce7;
            --accent-hover: #5b4cc4;
            --border-color: #333333;
            --code-bg: #1a1a1d;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }

        header {
            background-color: rgba(15, 15, 18, 0.95);
            padding: 2rem 5%;
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 100;
            backdrop-filter: blur(10px);
        }

        h1 {
            font-size: 2rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
        }

        main {
            padding: 2rem 5%;
            max-width: 1600px;
            margin: 0 auto;
        }

        /* Template: Code & Explanation Pair */
        .code-explanation-pair {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            margin-bottom: 4rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 2rem;
        }

        @media (min-width: 1024px) {
            .code-explanation-pair {
                grid-template-columns: 350px 1fr; /* Explanation width fixed, code takes rest */
                gap: 3rem;
            }
        }

        .explanation-block {
            padding-top: 1rem;
        }

        .explanation-block h2 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: var(--accent-color);
        }

        .explanation-block p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .explanation-block code {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85em;
        }

        .code-block {
            position: relative;
            border-radius: 8px;
            overflow: hidden;
            background-color: var(--code-bg);
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        /* PrismJS Overrides */
        pre[class*="language-"] {
            margin: 0 !important;
            border-radius: 0 !important;
            padding: 1.5rem !important;
            font-family: 'JetBrains Mono', monospace !important;
            font-size: 0.9rem !important;
            background: var(--code-bg) !important;
            text-shadow: none !important;
        }

        code[class*="language-"], pre[class*="language-"] {
            color: #ccc;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: var(--bg-color); 
        }
        ::-webkit-scrollbar-thumb {
            background: #444; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #555; 
        }

        .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #fff;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: background 0.2s;
            z-index: 10;
        }
        .copy-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

    </style>
</head>
<body>

<header>
    <h1>GMM ソースコード</h1>
    <p class="subtitle">ASVspoof2021のベースラインで使われたGMMのソースコードについて調べる。</p>
</header>

<main>

    <!-- SECTION 1 -->
    <section class="code-explanation-pair">

        <div class="code-block">
            <pre class="line-numbers"><code class="language-python">
from gmm import train_gmm
from os.path import exists
import pickle


# configs - feature extraction e.g., LFCC or CQCC
features = 'lfcc'

# configs - GMM parameters
ncomp = 512

# GMM pickle file
dict_file = 'gmm_LA_lfcc.pkl'
dict_file_final = 'gmm_lfcc_asvspoof21_la.pkl'

# configs - train & dev data - if you change these datasets
db_folder = '/path/to/ASVspoof_root/'
train_folders = [db_folder + 'LA/ASVspoof2019_LA_train/flac/']  # [db_folder + 'LA/ASVspoof2019_LA_train/flac/', db_folder + 'LA/ASVspoof2019_LA_dev/flac/']
train_keys = [db_folder + 'LA/ASVspoof2019_LA_cm_protocols/ASVspoof2019.LA.cm.train.trn.txt']  # [db_folder + 'LA/ASVspoof2019_LA_cm_protocols/ASVspoof2019.LA.cm.train.trn.txt', db_folder + 'LA/ASVspoof2019_LA_cm_protocols/ASVspoof2019.LA.cm.dev.trn.txt']

audio_ext = '.flac'

# train bona fide & spoof GMMs
if not exists(dict_file):
    gmm_bona = train_gmm(data_label='bonafide', features=features,
                         train_keys=train_keys, train_folders=train_folders, audio_ext=audio_ext,
                         dict_file=dict_file, ncomp=ncomp,
                         init_only=True)
    gmm_spoof = train_gmm(data_label='spoof', features=features,
                          train_keys=train_keys, train_folders=train_folders, audio_ext=audio_ext,
                          dict_file=dict_file, ncomp=ncomp,
                          init_only=True)

    gmm_dict = dict()
    gmm_dict['bona'] = gmm_bona._get_parameters()
    gmm_dict['spoof'] = gmm_spoof._get_parameters()
    with open(dict_file, "wb") as tf:
        pickle.dump(gmm_dict, tf)


gmm_dict = dict()
with open(dict_file + '_bonafide_init_partial.pkl', "rb") as tf:
    gmm_dict['bona'] = pickle.load(tf)

with open(dict_file + '_spoof_init_partial.pkl', "rb") as tf:
    gmm_dict['spoof'] = pickle.load(tf)

with open(dict_file_final, "wb") as f:
    pickle.dump(gmm_dict, f)
            </code></pre>
        </div>
        <div class="explanation-block">
            <h2>ノイズの音声データがなかった際の処理 - spectralgate/stationary.py</h2>
            <p>
                7行目において、音声の前処理をLFCC<sup><a href="#lfcc">[1]</a></sup>によって行うことを指定している。
                10行目において、GMMのパラメータを512成分に指定している。
            </p>
        </div>
    </section>

    <!-- SECTION 1 -->
    <section class="code-explanation-pair">

        <div class="code-block">
            <pre class="line-numbers"><code class="language-python">
def train_gmm(data_label, features, train_keys, train_folders, audio_ext, dict_file, ncomp, init_only=False):
    logging.info('Start GMM training.')

    partial_gmm_dict_file = '_'.join((dict_file, data_label, 'init', 'partial.pkl'))
    if exists(partial_gmm_dict_file):
        gmm = GaussianMixture(covariance_type='diag')
        with open(partial_gmm_dict_file, "rb") as tf:
            gmm._set_parameters(pickle.load(tf))
    else:
        data = list()
        for k, train_key in enumerate(train_keys):
            pd = pandas.read_csv(train_key, sep=' ', header=None)
            files = pd[pd[4] == data_label][1]
            # files_subset = sample(list(files), 1000)  # random init with 1000 files
            files_subset = (files.reset_index()[1]).loc[list(range(0, len(files), 10))]  # only every 10th file init
            for file in files_subset:
                Tx = extract_features(train_folders[k] + file + audio_ext, features=features, cached=True)
                data.append(Tx.T)

        X = vstack(data)
        gmm = GaussianMixture(n_components=ncomp,
                              random_state=None,
                              covariance_type='diag',
                              max_iter=200,
                              verbose=2,
                              verbose_interval=1).fit(X)

        logging.info('GMM init done - llh: %.5f' % gmm.lower_bound_)

        with open(partial_gmm_dict_file, "wb") as f:
            pickle.dump(gmm._get_parameters(), f)

    if init_only:
        return gmm

    # EM training
    prev_lower_bound = -infty
    for i in range(10):
        partial_gmm_dict_file = '_'.join((dict_file, data_label, str(i), 'partial.pkl'))
        if exists(partial_gmm_dict_file):
            with open(partial_gmm_dict_file, "rb") as tf:
                gmm._set_parameters(pickle.load(tf))
                continue

        nk_acc = zeros_like(gmm.weights_)
        mu_acc = zeros_like(gmm.means_)
        sigma_acc = zeros_like(gmm.covariances_)
        log_prob_norm_acc = 0
        n_samples = 0
        for k, train_key in enumerate(train_keys):
            pd = pandas.read_csv(train_key, sep=' ', header=None)
            files = pd[pd[4] == data_label][1]

            for file in files.values:
                Tx = extract_features(train_folders[k] + file + audio_ext, features=features, cached=True)
                n_samples += Tx.shape[1]

                # e step
                weighted_log_prob = gmm._estimate_weighted_log_prob(Tx.T)
                log_prob_norm = logsumexp(weighted_log_prob, axis=1)
                with errstate(under='ignore'):
                    # ignore underflow
                    log_resp = weighted_log_prob - log_prob_norm[:, None]
                log_prob_norm_acc += log_prob_norm.sum()

                # m step preparation
                resp = exp(log_resp)
                nk_acc += resp.sum(axis=0) + 10 * finfo(log(1).dtype).eps
                mu_acc += resp.T @ Tx.T
                sigma_acc += resp.T @ (Tx.T ** 2)

        # m step
        gmm.means_ = mu_acc / nk_acc[:, None]
        gmm.covariances_ = sigma_acc / nk_acc[:, None] - gmm.means_ ** 2 + gmm.reg_covar
        gmm.weights_ = nk_acc / n_samples
        gmm.weights_ /= gmm.weights_.sum()
        if (gmm.covariances_ <= 0.0).any():
            raise ValueError("ill-defined empirical covariance")
        gmm.precisions_cholesky_ = 1. / sqrt(gmm.covariances_)

        with open(partial_gmm_dict_file, "wb") as f:
            pickle.dump(gmm._get_parameters(), f)

        # infos
        lower_bound = log_prob_norm_acc / n_samples
        change = lower_bound - prev_lower_bound
        logging.info("  Iteration %d\t llh %.5f\t ll change %.5f" % (i, lower_bound, change))
        prev_lower_bound = lower_bound

        if abs(change) < gmm.tol:
            logging.info('  Coverged; too small change')
            gmm.converged_ = True
            break

    return gmm
            </code></pre>
        </div>
        <div class="explanation-block">
            <h2>GMMの訓練時のプログラム-GMM.py</h2>
            <ul>
                <li>76から102行目: GMMの訓練を効率的に行うように事前学習モデルのパラメータを使用して最初のトレーニングをしている。</li>
                <li>76行目: 事前学習モデルの有無を判定して、存在した場合は77行目においてガウス混合モデルをgmmに作成して、79行目で事前学習モデルからパラメータを読み込んでセットしている。</li>
                <li>81行目から102行目: 事前学習モデルが存在しない場合に、指定されたdata_labelに基づいて音声特徴量を抽出し、GMMの初期化とEMアルゴリズムによるトレーニングを行っている。</li>
                <li>83行目: pandasを使用してトレーニングプロトコルファイルを読み込む。</li>
                <li>84行目: ト指定されたdata_labelにマッチした行をフィルタリングする。</li>
                <li>86行目: 音声ファイルを10個おきに読み込んで、最初のトレーニングの準備をする。ここで、すべてのファイルを使用しないのは、処理が遅くなるからである。</li>
                <li>88行目: 音声ファイルをLFCCによって、音声特徴量を抽出している。</li>
                <li>89行目: 抽出した特徴量を転地してリストに格納している。</li>
                <li>91行目: 特徴量のリストを一つの行列Xとしてまとめている。</li>
                <li>92行目: Xを使用して最初のGMMの初期化を行っている。このときのパラメータとして、n_componentsは混合するガウス分布の数、covariance_type='diag'は共分散行列の成約タイプが対角共分散、。<sup><a href="#parameter">[2]</a></sup>。このとき、対角共分散が使われる理由として、音声特徴量の抽出にLFCCを使っているため特徴量同士で無相関のため、対角共分散が適用されやすいためである。<sup><a href="#slide">[3]</a></sup></li>
            </ul>
        </div>
    </section>

    <section>
      <h2>参考文献</h2>
      <ol class="references">
        <li id="lfcc">
            "線形周波数ケプストラム係数(LFCC) Python" pythonで生きていく. 
          <a href="https://python-climbing.com/lfcc/" target="_blank" rel="noopener">
            https://python-climbing.com/lfcc/
          </a> (閲覧日 2026-1-29)
        </li>
        <li id="parameter">
            "GaussianMixture" scikit-learn. 
          <a href="https://sklearn.org/1.6/modules/generated/sklearn.mixture.GaussianMixture.html" target="_blank" rel="noopener">
            https://sklearn.org/1.6/modules/generated/sklearn.mixture.GaussianMixture.html
          </a> (閲覧日 2026-1-29)
        </li>
        <li id="slide">
            "【Pythonで学ぶ音声認識】第5章：GMM-HMMによる音声認識（5.3節まで）" docswell. 
          <a href="https://www.docswell.com/s/kyoto-kaira/Z38Y18-2023-11-08-212249#p30" target="_blank" rel="noopener">
            https://www.docswell.com/s/kyoto-kaira/Z38Y18-2023-11-08-212249#p30
          </a> (閲覧日 2026-1-29)
        </li>
      </ol>
    </section>

</main>

<!-- Scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js"></script>

</body>
</html>
