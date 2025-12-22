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
    <h1>Noisereducer ソースコード</h1>
    <p class="subtitle">Understanding noise reduction via spectral gating in Python.</p>
</header>

<main>

    <!-- SECTION 1 -->
    <section class="code-explanation-pair">
        <div class="explanation-block">
            <h2>ノイズの音声データがなかった際の処理 - spectralgate/stationary.py</h2>
            <p>
                noisereducerはノイズ音声をパラメータ"y_noise"によって設定できるが、受け取ることができなかった場合は47行目においてy_noiseがなかった際の条件分岐が行われる。
                このとき、48行目においてノイズ音声を全体の音声として設定する。
                そうすることで、全体の音声から定常音声をノイズとして抜き取ることができる。
            </p>
        </div>
        <div class="code-block">
            <pre class="line-numbers"><code class="language-python">
if y_noise is None:
    self.y_noise = self.y
            </code></pre>
        </div>
    </section>

    <!-- SECTION 2 -->
    <section class="code-explanation-pair">
        <div class="explanation-block">
            <h2>除去率の設定 - spectralgate/stationary.py</h2>
            <p>
                除去率は、パラメータ"prop_decrease"によって設定される。
                パラメータの値の範囲は0から1までである。
                108行目において、prop_decreaseで指定したノイズのカット率が高いほどノイズ部分を0に近い値にし、低いほどノイズ部分を元の音声の大きさに近い値にする。
            </p>
        </div>
        <div class="code-block">
            <pre class="line-numbers"><code class="language-python">
sig_mask = sig_mask * self._prop_decrease + np.ones(np.shape(sig_mask)) * (
        1.0 - self._prop_decrease
)
            </code></pre>
        </div>
    </section>

    <!-- SECTION 3 -->
    <section class="code-explanation-pair">
        <div class="explanation-block">
            <h2>平滑化</h2>
            <p>
                112行目において、平滑化の有無を決めるsmooth_maskが有効であればノイズ除去後の音声を平滑化する。
                平滑化を決めるパラメータは"freq_mask_smooth_hz"と"time_mask_smooth_ms"である。ともにデフォルトは"500"と"50"である。
                平滑化のプログラムは、base.pyの7行目に関数として定義されている。
                そこでは、N点の三角フィルタを生成している。その時、Nの数は周波数成分と時間成分において"freq_mask_smooth_hz"と"time_mask_smooth_ms"で定義されているため、三角フィルタは2次元のピラミッド型のフィルタになる。
                その後、平滑化した音声データを元の音声データと掛け合わせて、平滑化した音声データを元の音声データに代入する。
            </p>
        </div>
        <div class="code-block">
             <pre class="line-numbers"><code class="language-python">
if self.smooth_mask:
    # convolve the mask with a smoothing filter
    sig_mask = fftconvolve(sig_mask, self._smoothing_filter, mode="same")
             </code></pre>
             <pre class="line-numbers"><code class="language-python">
def _smoothing_filter(n_grad_freq, n_grad_time):
    """Generates a filter to smooth the mask for the spectrogram

    Arguments:
        n_grad_freq {[type]} -- [how many frequency channels to smooth over with the mask.]
        n_grad_time {[type]} -- [how many time channels to smooth over with the mask.]
    """
    smoothing_filter = np.outer(
        np.concatenate(
            [
                np.linspace(0, 1, n_grad_freq + 1, endpoint=False),
                np.linspace(1, 0, n_grad_freq + 2),
            ]
        )[1:-1],
        np.concatenate(
            [
                np.linspace(0, 1, n_grad_time + 1, endpoint=False),
                np.linspace(1, 0, n_grad_time + 2),
            ]
        )[1:-1],
    )
    smoothing_filter = smoothing_filter / np.sum(smoothing_filter)
    return smoothing_filter
             </code></pre>
        </div>
    </section>

    <!-- SECTION 4 -->
    <section class="code-explanation-pair">
        <div class="explanation-block">
            <h2>Dispatch Logic</h2>
            <p>
                112行目において、平滑化の有無を決めるsmooth_maskが有効であればノイズ除去後の音声を平滑化する。
                平滑化を決めるパラメータは"freq_mask_smooth_hz"と"time_mask_smooth_ms"である。ともにデフォルトは"500"と"50"である。
                平滑化のプログラムは、base.pyの7行目に関数として定義されている。
                そこでは、N点の三角フィルタを生成している。その時、Nの数は周波数成分と時間成分において"freq_mask_smooth_hz"と"time_mask_smooth_ms"で定義されているため、三角フィルタは2次元のピラミッド型のフィルタになる。
                その後、平滑化した音声データを元の音声データと掛け合わせて、平滑化した音声データを元の音声データに代入する。
                これをカットした時間ごとに行うことによって、移動平均フィルタを実現している。
            </p>
        </div>
        <div class="code-block">
             <pre class="line-numbers"><code class="language-python">
if self.smooth_mask:
    # convolve the mask with a smoothing filter
    sig_mask = fftconvolve(sig_mask, self._smoothing_filter, mode="same")
             </code></pre>
             <pre class="line-numbers"><code class="language-python">
def _smoothing_filter(n_grad_freq, n_grad_time):
    """Generates a filter to smooth the mask for the spectrogram

    Arguments:
        n_grad_freq {[type]} -- [how many frequency channels to smooth over with the mask.]
        n_grad_time {[type]} -- [how many time channels to smooth over with the mask.]
    """
    smoothing_filter = np.outer(
        np.concatenate(
            [
                np.linspace(0, 1, n_grad_freq + 1, endpoint=False),
                np.linspace(1, 0, n_grad_freq + 2),
            ]
        )[1:-1],
        np.concatenate(
            [
                np.linspace(0, 1, n_grad_time + 1, endpoint=False),
                np.linspace(1, 0, n_grad_time + 2),
            ]
        )[1:-1],
    )
    smoothing_filter = smoothing_filter / np.sum(smoothing_filter)
    return smoothing_filter
             </code></pre>
        </div>
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
