<?php
require_once '../includes/head.php';
require_once '../includes/common.php';

$title = '音声解析と機械学習の研究メモ - メモ帳';
$description = '音声解析と機械学習に関する技術メモ。MFCCやDTW、z-score、Pythonライブラリの使い方など、音声処理技術について詳しく解説します。';
$keywords = '音声解析,機械学習,MFCC,DTW,z-score,Python,librosa,音声処理,アイヌ語,研究メモ';

renderHead($title, $description, $keywords);
?>
<body>
<?php renderNavigation('speech'); ?>

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

function collapseAllCodeBlocks() {
    document.querySelectorAll('pre#pythonCode').forEach(function(pre) {
        pre.classList.add('collapsed');
        const container = pre.parentElement;
        if (container) {
            const tableWrap = container.previousElementSibling;
            if (tableWrap && tableWrap.classList && tableWrap.classList.contains('md-table-wrap')) {
                tableWrap.classList.add('collapsed');
            }
        }
    });
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    collapseAllCodeBlocks();
});
</script>

<style>
html{-webkit-text-size-adjust:100%;}
body{font-family:system-ui,Helvetica,Arial,sans-serif;line-height:1.6;word-break:break-word;color:#333333;}
h1{margin:.2rem 0 1rem;font-size:2rem;}
h2{margin-top:1.8rem;font-size:1.3rem;border-bottom:2px solid #ccc;padding-bottom:.25rem;}
h3{margin-top:1.1rem;font-size:1.1rem;}
p{line-height:1.7;}
ul{padding-left:1.3rem;}
li{color:#333333;margin-bottom:0.3rem;}
a{color:#0066cc;text-decoration:none;}
a:hover{text-decoration:underline;color:#004499;}
@media (max-width:640px){
    body{margin:1.2rem auto;padding:0 .9rem;}
    h1{font-size:1.7rem;}
    h2{font-size:1.2rem;}
    h3{font-size:1.02rem;}
}
#pythonCode {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #0066cc;
    overflow-x: auto;
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 1.5rem 0;
    color: #2c3e50;
}
div[style*="position: relative"] {
    position: relative !important;
}

.research-section {
    margin: 2rem 0;
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    border-left: 4px solid #036;
}

.research-item {
    margin: 1rem 0;
    padding: 1rem;
    background-color: white;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.research-item h3 {
    color: #036;
    margin-top: 0;
}

</style>

<main class="container fade-in" style="max-width:880px;margin:0 auto;padding:2.2rem 0 3rem;">
  <article>
    <header>
      <h1>音声解析と機械学習の研究メモ <span class="update-info">(<?php echo date('Y年m月d日更新', filemtime(__FILE__)); ?>)</span></h1>
    </header>
    <section><h2>2025/9/9</h2>
    <h3>アイヌ語の勉強</h3>
    <h4>z-scoreとは</h4>
    <p>z-scoreは標準得点のこと。別名"standard score"とも言う。</p>
    <p>z-scoreの式は以下のように表される。</p>
    <div style="text-align: center; margin: 1.5rem 0;">
        $$z = \frac{X - \mu}{\sigma}$$
    </div>
    <p>ここで、$X$は各データの値、$\mu$は平均、$\sigma$は標準偏差を表す。</p>
    <p>z-scoreが0の際は<br/>
        データの値が平均と等しい。<br/>
        正の値の際はデータの値が平均よりも高い。<br/>
        負の値の際はデータの値が平均よりも低い。</p>
    <p>z-scoreの絶対値は標準偏差と等しくなる。</p>
    <p>正規分布のうち、<br/>
        68%のデータはz-scoreが$-1$から$1$の範囲に収まり、<br/>
        95%のデータはz-scoreが$-2$から$2$の範囲に収まり、<br/>
        99.7%のデータはz-scoreが$-3$から$3$の範囲に収まる。</p>
    <h3>Webページの音声のダウンロードが楽だった方法</h3>
    <p>生成AIにWebの音声ファイルを一括でダウンロードするPythonファイルを作成してもらうのが一番早い。</p>
    <p>今回は<a href="https://www.aa.tufs.ac.jp/~mmine/kiki_gen/murasaki/">『浅井タケ昔話全集 I, II』 （村崎恭子 編訳）</a>の音声ファイルを一括でダウンロードした。このときのダウンロード用のPythonコードを以下に示す。</p>
    
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            #!/usr/bin/env python3
            """
            浅井タケ昔話集からすべての音声ファイルをダウンロードする
            https://www.aa.tufs.ac.jp/~mmine/kiki_gen/murasaki/asai01.html
            """
                    
            import requests
            from bs4 import BeautifulSoup
            import re
            from urllib.parse import urljoin
            import os
            import time
            from pathlib import Path
            import json
            from tqdm import tqdm
                    
            def download_asai_collection():
                # ダウンロード用のディレクトリを作成
                base_dir = Path('data/samples')
                asai_dir = base_dir / 'asai_take_stories'
                asai_dir.mkdir(exist_ok=True)
                    
                # ダウンロード状況を記録するメタデータファイルを作成
                metadata_file = asai_dir / 'metadata.json'
                metadata = {
                    'collection': 'Asai Take Folktale Collection',
                    'source': 'https://www.aa.tufs.ac.jp/~mmine/kiki_gen/murasaki/asai01.html',
                    'stories': {}
                }
                
                # 物語コレクションのベースURL
                base_url = 'https://www.aa.tufs.ac.jp/~mmine/kiki_gen/murasaki/'
                
                print('浅井タケ音声コレクション全体のダウンロードを開始します...')
                print(f'保存先ディレクトリ: {asai_dir}')
                
                # すべての物語ページのURLを生成（At01からAt54まで）
                story_urls = []
                for i in range(1, 55):  # 1から54まで
                    story_url = f'{base_url}at{i:02d}aj.html'
                    story_urls.append((i, story_url))
                
                print(f'処理対象の物語ページ数: {len(story_urls)}')
                
                total_downloaded = 0
                total_audio_files = 0
                
                # プログレスバー付きですべての物語を処理
                for story_num, story_url in tqdm(story_urls, desc="物語を処理中"):
                    story_id = f"At{story_num:02d}"
                    print(f'\\n{story_id}を処理中: {story_url}')
                    
                    try:
                        response = requests.get(story_url, timeout=30)
                        response.raise_for_status()
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # このページ内の音声リンクを検索
                        audio_links = []
                        for link in soup.find_all('a', href=True):
                            href = link['href']
                            if any(ext in href.lower() for ext in ['.wav', '.mp3', '.au', '.aiff']):
                                full_url = urljoin(story_url, href)
                                audio_links.append(full_url)
                        
                        print(f'  発見した音声ファイル数: {len(audio_links)}')
                        total_audio_files += len(audio_links)
                        
                        # プログレスバー付きで各音声ファイルをダウンロード
                        story_downloaded = 0
                        for i, audio_url in enumerate(tqdm(audio_links, desc=f"  {story_id} 音声", leave=False)):
                            filename = f'{story_id}_{i+1:03d}.wav'
                            filepath = asai_dir / filename
                            
                            # 既に存在する場合はスキップ
                            if filepath.exists():
                                print(f'    ⚡ スキップ（既存）: {filename}')
                                story_downloaded += 1
                                continue
                            
                            try:
                                audio_response = requests.get(audio_url, timeout=30)
                                audio_response.raise_for_status()
                                
                                with open(filepath, 'wb') as f:
                                    f.write(audio_response.content)
                                
                                story_downloaded += 1
                                print(f'    ✓ ダウンロード完了: {filename} ({len(audio_response.content)} バイト)')
                                
                            except Exception as e:
                                print(f'    ✗ ダウンロード失敗 {audio_url}: {e}')
                            
                            time.sleep(0.3)  # サーバーに配慮した待機時間
                        
                        total_downloaded += story_downloaded
                        
                        # メタデータを更新
                        metadata['stories'][story_id] = {
                            'url': story_url,
                            'audio_files_found': len(audio_links),
                            'audio_files_downloaded': story_downloaded,
                            'title': f'物語 {story_num}'  # 実際のタイトルでさらに改善可能
                        }
                        
                        print(f'  ✓ {story_id}: {story_downloaded}/{len(audio_links)} ファイルをダウンロード')
                        
                    except Exception as e:
                        print(f'  ✗ {story_url}の処理中にエラー: {e}')
                        metadata['stories'][story_id] = {
                            'url': story_url,
                            'error': str(e)
                        }
                    
                    # 定期的にメタデータを保存
                    if story_num % 5 == 0:
                        with open(metadata_file, 'w', encoding='utf-8') as f:
                            json.dump(metadata, f, indent=2, ensure_ascii=False)
                    
                # 最終的なメタデータ保存
                metadata['total_stories'] = len(story_urls)
                metadata['total_audio_files_found'] = total_audio_files
                metadata['total_audio_files_downloaded'] = total_downloaded
                    
                with open(metadata_file, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, indent=2, ensure_ascii=False)
                    
                print(f'\\n🎉 ダウンロード完了！')
                print(f'📊 統計情報:')
                print(f'   処理した物語数: {len(story_urls)}')
                print(f'   発見した音声ファイル総数: {total_audio_files}')
                print(f'   ダウンロード成功数: {total_downloaded}')
                print(f'   保存ディレクトリ: {asai_dir}')
                print(f'   メタデータ保存先: {metadata_file}')
                    
                return asai_dir, total_downloaded, total_audio_files
                    
            if __name__ == '__main__':
                download_asai_collection()
        </code></pre>
    </div>
    </section>
    <section>
      <h2>2025/09/11</h2>
    <h3>アイヌ語のサイト</h3>
    <h4>音声まとめサイト</h4>
    <a href="https://akitaben.com/category19/entry238.html">無料で使えるインターネット上のアイヌ語資料・アイヌ語教材のご紹介(アイヌ語を勉強・学習したい人のために)</a>
    <h4>アイヌ語辞書</h4>
    <a href="https://www.ff-ainu.or.jp/teach/files/saru_tango.pdf">アイヌ語辞書</a>

    <h3>Pythonの勉強</h3>
    <h4>suffix.lower()の使い方</h4>
    <p>以下のコードにおける"suffix.lower()"は、ファイルのパスを格納している"p"の拡張子が"AUDIO_EXTS"ファイルに含まれているかを判定するために使用されている。</p>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            def list_audio_files(folder: Path) -> List[Path]:
            # AUDIO_EXTSには音声ファイルの拡張子が格納されている。
            return [p for p in folder.rglob('*') if p.suffix.lower() in AUDIO_EXTS]
        </code></pre>
    </div>
    <h4>audio_urilsのtrim_silenceについて</h4>
    <p>以下のコードのように"trim_silence"は"top_db"で指定したデシベル以下の音声をカットする関数である。また、0.01秒の間隔でカットを行うため、0.01秒以上の無音部分をカットすることができる。</p>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            TRIM_DB = 30.0
            trimmed_audio = trim_silence(rec_audio, top_db=TRIM_DB)
        </code></pre>
    </div>

    <h4>notebookの記述のコツ</h4>
    <p>notebookのセルをまたぐ際に、一つ前のセルの最初で変更する予定の変数をゼロリセットすることで、次のセルの最初に条件分岐によって一つ前のセルが実行されたかを判定することができる。</p>

    <h2>2025/09/12</h2>
    <h3>DTWとは</h3>
    <p>DTW(Dynamic Time Warping)は、2つの時間軸のシーケンスの類似度を図るアルゴリズムである。このとき、2つのシーケンスは時間が一致する必要がない。</br>
    音声シーケンスのグリッドの距離が最短になるように速さをストレッチすることで、異なる速度で話される音声を比較することができる。</p>

    <h3>MFAとは</h3>
    <p>音素認識技術の一つである。音声ファイルとテキストの対応関係を学習し、新たな音声データに対して音素のラベリングを行う。</p>

    <h3>Pythonの勉強</h3>
    <h4>tqdmとは</h4>
    <p>tqdmとは、notebookなどでデータの処理の際に視覚的にわかりやすいデザインにしてくれるプラグインである。</p>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            TDTW scoring: 100%|██████████| 2815/2815 [00:11<00:00, 243.06it/s]
        </code></pre>
    </div>
    </section>
    <section>
    <h2>2025/09/25</h2>
    <h3>Pythonの勉強</h3>
    <h4>librosa.feature.mfccの引数について</h4>
    <p>
        y: 音声データそのもの<br/>
        sr: サンプリング周波数<br/>
        n_mfcc: mfccの次元数
    </p>

    <h3>GMMs(Gaussian Mixture Models)を用いたモデルを作成する</h3>
    <p>以下のコードのようにn_componentsを16に設定することで16個の正規分布の重ね合わせによるモデルを実現している。</p>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            gmm = GaussianMixture(n_components=16, random_state=0)
        </code></pre>
    </div>
    <h4>GMMs適用時のエラーの対処法</h4>
    <p>以下のようなエラーコードが出た際は、モデルの統計データの計算が正しく行われていないことが示唆されている。大抵は、MFCCのデータが小さすぎたり、似すぎていたり、アルゴリズムが働くほどにデータにバリエーションがないことが多い。<br/>
    そのため、scikit-learnを使用してコードを正規化することで解決することができる。機械学習においては、正規化を常に行うことが慣例となっている。</p>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            ---------------------------------------------------------------------------
            LinAlgError                               Traceback (most recent call last)
            File ~/OneDrive/5years/graduation_research/ainu/venv/lib/python3.12/site-packages/sklearn/mixture/_gaussian_mixture.py:334, in _compute_precision_cholesky(covariances, covariance_type)
                333 try:
            --> 334     cov_chol = linalg.cholesky(covariance, lower=True)
                335 except linalg.LinAlgError:
            
            File ~/OneDrive/5years/graduation_research/ainu/venv/lib/python3.12/site-packages/scipy/_lib/_util.py:1233, in _apply_over_batch.&lt;locals&gt;.decorator.&lt;locals&gt;.wrapper(*args, **kwargs)
               1232 if not any(batch_shapes):
            -> 1233     return f(*arrays, *other_args, **kwargs)
               1235 # Determine broadcasted batch shape
            
            File ~/OneDrive/5years/graduation_research/ainu/venv/lib/python3.12/site-packages/scipy/linalg/_decomp_cholesky.py:106, in cholesky(a, lower, overwrite_a, check_finite)
                 52 """
                 53 Compute the Cholesky decomposition of a matrix.
                 54 
               (...)    104 
                105 """
            --> 106 c, lower = _cholesky(a, lower=lower, overwrite_a=overwrite_a, clean=True,
                107                      check_finite=check_finite)
                108 return c
            
            File ~/OneDrive/5years/graduation_research/ainu/venv/lib/python3.12/site-packages/scipy/linalg/_decomp_cholesky.py:39, in _cholesky(a, lower, overwrite_a, clean, check_finite)
                 38 if info &gt; 0:
            --> 39     raise LinAlgError(
                 40         f"{info}-th leading minor of the array is not positive definite"
                 41     )
                 42 if info &lt; 0:
            
            LinAlgError: 17-th leading minor of the array is not positive definite
            
            During handling of the above exception, another exception occurred:
            
            ValueError                                Traceback (most recent call last)
            Cell In[8], line 6
                  4 for speaker, features in speaker_features.items():
                  5     gmm = GaussianMixture(n_components=16, random_state=0)
            ----&gt; 6     gmm.fit(features)
                  7     gmm_models[speaker] = gmm
                  8     print(f"Model for {speaker} trained successfully.")
            
            File ~/OneDrive/5years/graduation_research/ainu/venv/lib/python3.12/site-packages/sklearn/mixture/_base.py:182, in BaseMixture.fit(self, X, y)
                156 """Estimate model parameters with the EM algorithm.
                157 
                158 The method fits the model ``n_init`` times and sets the parameters with
               (...)    179     The fitted mixture.
                180 """
                181 # parameters are validated in fit_predict
            --&gt; 182 self.fit_predict(X, y)
                183 return self
            
            File ~/OneDrive/5years/graduation_research/ainu/venv/lib/python3.12/site-packages/sklearn/base.py:1365, in _fit_context.&lt;locals&gt;.decorator.&lt;locals&gt;.wrapper(estimator, *args, **kwargs)
               1358     estimator._validate_params()
               1360 with config_context(
               1361     skip_parameter_validation=(
               1362         prefer_skip_nested_validation or global_skip_validation
               1363     )
               1364 ):
            -&gt; 1365     return fit_method(estimator, *args, **kwargs)
            
            File ~/OneDrive/5years/graduation_research/ainu/venv/lib/python3.12/site-packages/sklearn/mixture/_base.py:251, in BaseMixture.fit_predict(self, X, y)
                248 prev_lower_bound = lower_bound
                250 log_prob_norm, log_resp = self._e_step(X)
            --&gt; 251 self._m_step(X, log_resp)
                252 lower_bound = self._compute_lower_bound(log_resp, log_prob_norm)
                253 current_lower_bounds.append(lower_bound)
            
            File ~/OneDrive/5years/graduation_research/ainu/venv/lib/python3.12/site-packages/sklearn/mixture/_gaussian_mixture.py:834, in GaussianMixture._m_step(self, X, log_resp)
                830 self.weights_, self.means_, self.covariances_ = _estimate_gaussian_parameters(
                831     X, np.exp(log_resp), self.reg_covar, self.covariance_type
                832 )
                833 self.weights_ /= self.weights_.sum()
            --&gt; 834 self.precisions_cholesky_ = _compute_precision_cholesky(
                835     self.covariances_, self.covariance_type
                836 )
            
            File ~/OneDrive/5years/graduation_research/ainu/venv/lib/python3.12/site-packages/sklearn/mixture/_gaussian_mixture.py:336, in _compute_precision_cholesky(covariances, covariance_type)
                334             cov_chol = linalg.cholesky(covariance, lower=True)
                335         except linalg.LinAlgError:
            --&gt; 336             raise ValueError(estimate_precision_error_message)
                337         precisions_chol[k] = linalg.solve_triangular(
                338             cov_chol, np.eye(n_features, dtype=dtype), lower=True
                339         ).T
                340 elif covariance_type == "tied":
            
            ValueError: Fitting the mixture model failed because some components have ill-defined empirical covariance (for instance caused by singleton or collapsed samples). Try to decrease the number of components, increase reg_covar, or scale the input data. The numerical accuracy can also be improved by passing float64 data instead of float32.
            
             (See &lt;attachments&gt; above for file contents. You may not need to search or read the file again.)
        </code></pre>
    </div>

    <p>以上のエラーを以下のようなコードでall_featuresを正規化した。</p>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
                from sklearn.preprocessing import StandardScaler
                scaler = StandardScaler()
                scaled_features = scaler.fit_transform(all_features)
        </code></pre>
    </div>

    <p>また、以下のようにreg_covarをGaussianMixtureに設定することで、共分散を正の正規化するので収束時に不安定になることを防ぐことができる。</p>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
                gmm = GaussianMixture(n_components=16, random_state=0, reg_covar=1e-6)
        </code></pre>
    </div>

    <h3>結果が一方に偏った際の対処法</h3>
    <p>GMMsによる分類の結果が、特定の対象のみに偏った場合、以下のようなプロセスが原因だと考えられる。</p>
    <h4>コード</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            def extract_features(file_path):
                try:
                    audio, sample_rate = librosa.load(file_path, sr=16000)
                    mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=20)

                    # each row is a time frame and each column is an MFCC coefficient
                    return mfccs.T

                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    return None

            all_features = {}
            speaker_features = {}
            #store the scaler for each speaker
            scalers = {}
            for speaker, paths in speaker_paths.items():
                combined_features = []
                print(f"Extracting features for {speaker}...")
                for path in paths:
                    features = extract_features(path)
                    if features is not None:
                        combined_features.append(features)

                all_features[speaker] = np.vstack(combined_features)

                scaler = StandardScaler()
                scaled_features = scaler.fit_transform(all_features[speaker])

                speaker_features[speaker] = scaled_features
                scalers[speaker] = scaler

                print(f"Finished extracting features for {speaker}. Shape: {speaker_features[speaker].shape}")
        </code></pre>
    </div>

    <h4>結果</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            Extracting features for Speaker1...
            Finished extracting features for Speaker1. Shape: (711208, 20)
            Extracting features for Speaker2...
            Finished extracting features for Speaker2. Shape: (257415, 20)
        </code></pre>
    </div>

    <p>
        以上の様にSpeaker1のデータの量がSpeaker2に比べて3倍以上である。そのため比較的に、Speaker1のデータは全体として包括的に音響を分析し、Speaker2のデータは特徴的な部分を中心的に分析してしまう。<br/>
        結果的に、テストの際にSpeaker2の音声に対しては十分に波形が近いことを求められるため分類の結果がSpeaker1に偏ってしまう。<br/>
        解決法としてそれぞれのデータを均等な量にする必要がある。
    </p>

    <p>
        それでもなお解決しなかった。原因はテスト時にテストデータを正規化するのを忘れていたためだった。<br/>
        以下のようにscalersを追加することで修正した。
    </p>

    <h4>修正前</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            def predict_speaker(file_path, models):
                unknown_features = extract_features(file_path)
                if unknown_features is None:
                    return "Could not process audio."

                scores = {}
                for speaker, gmm in models.items():
                    scores[speaker] = gmm.score(unknown_features)

                predicted_speaker = max(scores, key=scores.get)

                return predicted_speaker, scores[predicted_speaker]
        </code></pre>
    </div>

    <h4>修正後</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            def predict_speaker(file_path, models, scalers):
                unknown_features = extract_features(file_path)
                if unknown_features is None:
                    return "Could not process audio.", 0

                scores = {}
                for speaker, gmm in models.items():
                    scaler = scalers[speaker]
                    scaled_unknown_features = scaler.transform(unknown_features)

                    scores[speaker] = gmm.score(scaled_unknown_features)

                predicted_speaker = max(scores, key=scores.get)

                return predicted_speaker, scores[predicted_speaker]
        </code></pre>
    </div>

    <h3>結果をCSVで保存するときの日時の指定</h3>
    <p>
        「<a href="https://note.nkmk.me/python-datetime-now-today/">Pythonで現在時刻・日付・日時を取得</a>」このサイトを参考にした。
    </p>
    
    </section>
    <section>
    <h2>2025/09/26</h2>
    <h3>Deep Learningのデータ組込時のRAMエラーの対処法</h3>
    <p>
        以下のプログラムとエラーログより、学習済みのモデルを扱う際に膨大なRAMを消費したことが原因であると推測することができる。
    </p>

    <h4>プログラム</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            def get_embedding(file_path, model):
                try:
                    signal, fs = librosa.load(file_path, sr=16000)
                    audio_tensor = torch.from_numpy(signal)

                    embedding = model.encode_batch(audio_tensor)
                    embedding = embedding.squeeze().cpu().numpy()

                    return embedding
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    return None

            speaker_embedding_db = {}

            print("Creating speaker embedding database from training data...")
            for speaker, paths in speaker_paths_train.items():
                embeddings = []
                for path in paths:
                    embedding = get_embedding(path, language_id)
                    if embedding is not None:
                        embeddings.append(embedding)

                if embeddings:
                    speaker_embedding_db[speaker] = np.mean(embeddings, axis=0)
                    print(f"Created avarage embedding for {speaker}.")

            print("/n--- Speaker Embedding Database Complete ---")
        </code></pre>
    </div>

    <h4>app.log</h4>
    <div class="md-table-wrap">
        <table class="md-table">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Level</th>
                    <th>Message</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Sep 26, 2025, 11:02:06 AM</td><td>WARNING</td><td>0.00s - Note: Debugging will proceed. Set PYDEVD_DISABLE_FILE_VALIDATION=1 to disable this validation.</td></tr>
                <tr><td>Sep 26, 2025, 11:02:06 AM</td><td>WARNING</td><td>0.00s - to python to disable frozen modules.</td></tr>
                <tr><td>Sep 26, 2025, 11:02:06 AM</td><td>WARNING</td><td>0.00s - make the debugger miss breakpoints. Please pass -Xfrozen_modules=off</td></tr>
                <tr><td>Sep 26, 2025, 11:02:06 AM</td><td>WARNING</td><td>0.00s - Debugger warning: It seems that frozen modules are being used, which may</td></tr>
                <tr><td>Sep 26, 2025, 11:02:05 AM</td><td>WARNING</td><td>kernel 527821a1-c507-43c3-805c-40394db7bda6 restarted</td></tr>
                <tr><td>Sep 26, 2025, 11:02:05 AM</td><td>INFO</td><td>AsyncIOLoopKernelRestarter: restarting kernel (1/5), keep random ports</td></tr>
                <tr><td>Sep 26, 2025, 10:58:54 AM</td><td>WARNING</td><td>0.00s - Note: Debugging will proceed. Set PYDEVD_DISABLE_FILE_VALIDATION=1 to disable this validation.</td></tr>
                <tr><td>Sep 26, 2025, 10:58:54 AM</td><td>WARNING</td><td>0.00s - to python to disable frozen modules.</td></tr>
                <tr><td>Sep 26, 2025, 10:58:54 AM</td><td>WARNING</td><td>0.00s - make the debugger miss breakpoints. Please pass -Xfrozen_modules=off</td></tr>
                <tr><td>Sep 26, 2025, 10:58:54 AM</td><td>WARNING</td><td>0.00s - Debugger warning: It seems that frozen modules are being used, which may</td></tr>
                <tr><td>Sep 26, 2025, 10:58:53 AM</td><td>INFO</td><td>Kernel restarted: 527821a1-c507-43c3-805c-40394db7bda6</td></tr>
                <tr><td>Sep 26, 2025, 10:58:02 AM</td><td>WARNING</td><td>0.00s - Note: Debugging will proceed. Set PYDEVD_DISABLE_FILE_VALIDATION=1 to disable this validation.</td></tr>
                <tr><td>Sep 26, 2025, 10:58:02 AM</td><td>WARNING</td><td>0.00s - to python to disable frozen modules.</td></tr>
                <tr><td>Sep 26, 2025, 10:58:02 AM</td><td>WARNING</td><td>0.00s - make the debugger miss breakpoints. Please pass -Xfrozen_modules=off</td></tr>
                <tr><td>Sep 26, 2025, 10:58:02 AM</td><td>WARNING</td><td>0.00s - Debugger warning: It seems that frozen modules are being used, which may</td></tr>
                <tr><td>Sep 26, 2025, 10:58:01 AM</td><td>WARNING</td><td>kernel 527821a1-c507-43c3-805c-40394db7bda6 restarted</td></tr>
                <tr><td>Sep 26, 2025, 10:58:01 AM</td><td>INFO</td><td>AsyncIOLoopKernelRestarter: restarting kernel (1/5), keep random ports</td></tr>
                <tr><td>Sep 26, 2025, 10:53:05 AM</td><td>WARNING</td><td>0.00s - Note: Debugging will proceed. Set PYDEVD_DISABLE_FILE_VALIDATION=1 to disable this validation.</td></tr>
                <tr><td>Sep 26, 2025, 10:53:05 AM</td><td>WARNING</td><td>0.00s - to python to disable frozen modules.</td></tr>
                <tr><td>Sep 26, 2025, 10:53:05 AM</td><td>WARNING</td><td>0.00s - make the debugger miss breakpoints. Please pass -Xfrozen_modules=off</td></tr>
                <tr><td>Sep 26, 2025, 10:53:05 AM</td><td>WARNING</td><td>0.00s - Debugger warning: It seems that frozen modules are being used, which may</td></tr>
                <tr><td>Sep 26, 2025, 10:53:04 AM</td><td>WARNING</td><td>kernel 527821a1-c507-43c3-805c-40394db7bda6 restarted</td></tr>
                <tr><td>Sep 26, 2025, 10:53:04 AM</td><td>INFO</td><td>AsyncIOLoopKernelRestarter: restarting kernel (1/5), keep random ports</td></tr>
                <tr><td>Sep 26, 2025, 10:48:47 AM</td><td>INFO</td><td>Connecting to kernel 527821a1-c507-43c3-805c-40394db7bda6.</td></tr>
                <tr><td>Sep 26, 2025, 10:48:46 AM</td><td>WARNING</td><td>0.00s - Note: Debugging will proceed. Set PYDEVD_DISABLE_FILE_VALIDATION=1 to disable this validation.</td></tr>
                <tr><td>Sep 26, 2025, 10:48:46 AM</td><td>WARNING</td><td>0.00s - to python to disable frozen modules.</td></tr>
                <tr><td>Sep 26, 2025, 10:48:46 AM</td><td>WARNING</td><td>0.00s - make the debugger miss breakpoints. Please pass -Xfrozen_modules=off</td></tr>
                <tr><td>Sep 26, 2025, 10:48:46 AM</td><td>WARNING</td><td>0.00s - Debugger warning: It seems that frozen modules are being used, which may</td></tr>
                <tr><td>Sep 26, 2025, 10:48:46 AM</td><td>INFO</td><td>Kernel started: 527821a1-c507-43c3-805c-40394db7bda6</td></tr>
                <tr><td>Sep 26, 2025, 10:48:46 AM</td><td>WARNING</td><td>validate_schema(_schema)</td></tr>
                <tr><td>Sep 26, 2025, 10:48:46 AM</td><td>WARNING</td><td>/usr/local/lib/python3.12/dist-packages/jupyter_events/schema.py:68: JupyterEventsVersionWarning: The `version` property of an event schema must be a string. It has been type coerced, but in a future version of this library, it will fail to validate. Please update schema: https://events.jupyter.org/jupyter_server/kernel_actions/v1</td></tr>
                <tr><td>Sep 26, 2025, 10:48:45 AM</td><td>WARNING</td><td>0.00s - Note: Debugging will proceed. Set PYDEVD_DISABLE_FILE_VALIDATION=1 to disable this validation.</td></tr>
                <tr><td>Sep 26, 2025, 10:48:45 AM</td><td>WARNING</td><td>0.00s - to python to disable frozen modules.</td></tr>
                <tr><td>Sep 26, 2025, 10:48:45 AM</td><td>WARNING</td><td>0.00s - make the debugger miss breakpoints. Please pass -Xfrozen_modules=off</td></tr>
                <tr><td>Sep 26, 2025, 10:48:45 AM</td><td>WARNING</td><td>0.00s - Debugger warning: It seems that frozen modules are being used, which may</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>http://127.0.0.1:9000/</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>http://172.28.0.12:9000/</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>Jupyter Server 2.14.0 is running at:</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>Serving notebooks from local directory: /</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>panel.io.jupyter_server_extension</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>nbclassic</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>jupyterlab_jupytext</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>[Jupytext Server Extension] Deriving an AsyncTextFileContentsManager from AsyncLargeFileManager</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>jupyter_server_terminals</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>ipyparallel</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>Loading IPython parallel extension</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>google.colab._serverextension</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>google.colab server extension initialized.</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>google.colab</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>notebook_shim</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>WARNING</td><td>Customizing authentication via ServerApp.login_handler_class=&lt;class 'google.colab._login_handler.ColabLoginHandler'&gt; is deprecated in Jupyter Server 2.0. Use ServerApp.identity_provider_class. Falling back on legacy authentication.</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>panel.io.jupyter_server_extension</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>INFO</td><td>notebook_shim</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>WARNING</td><td>/root/.jupyter/jupyter_notebook_config.json</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>WARNING</td><td>/root/.local/etc/jupyter/jupyter_notebook_config.json</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>WARNING</td><td>/usr/etc/jupyter/jupyter_notebook_config.json</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_notebook_config.json</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_notebook_config.d/panel-client-jupyter.json</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_notebook_config.d/jupytext.json</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_notebook_config.d/ipyparallel.json</td></tr>
                <tr><td>Sep 26, 2025, 10:45:02 AM</td><td>WARNING</td><td>/etc/jupyter/jupyter_notebook_config.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>validate_schema(_schema)</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/lib/python3.12/dist-packages/jupyter_events/schema.py:68: JupyterEventsVersionWarning: The `version` property of an event schema must be a string. It has been type coerced, but in a future version of this library, it will fail to validate. Please update schema: https://events.jupyter.org/jupyter_server/gateway_client/v1</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>validate_schema(_schema)</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/lib/python3.12/dist-packages/jupyter_events/schema.py:68: JupyterEventsVersionWarning: The `version` property of an event schema must be a string. It has been type coerced, but in a future version of this library, it will fail to validate. Please update schema: https://events.jupyter.org/jupyter_server/contents_service/v1</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/root/.jupyter/jupyter_server_config.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/root/.local/etc/jupyter/jupyter_server_config.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/etc/jupyter/jupyter_server_config.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_server_config.d/nbclassic.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_server_config.d/google.colab.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_server_config.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_server_config.d/panel-client-jupyter.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_server_config.d/notebook_shim.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_server_config.d/nbclassic.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_server_config.d/jupytext.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_server_config.d/jupyter_server_terminals.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_server_config.d/ipyparallel.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/usr/local/etc/jupyter/jupyter_server_config.d/google.colab._serverextension.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>/etc/jupyter/jupyter_server_config.json</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>ServerApp.iopub_data_rate_limit config is deprecated in 2.0. Use ZMQChannelsWebsocketConnection.iopub_data_rate_limit.</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>[W 2025-09-26 01:44:59.341 ServerApp] ServerApp.token config is deprecated in 2.0. Use IdentityProvider.token.</td></tr>
                <tr><td>Sep 26, 2025, 10:44:59 AM</td><td>WARNING</td><td>warn(</td></tr>
            </tbody>
        </table>
    </div>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            |Timestamp|Level|Message|
            |---|---|---|
            |Sep 26, 2025, 11:02:06 AM|WARNING|0\.00s - Note: Debugging will proceed\. Set PYDEVD\_DISABLE\_FILE\_VALIDATION=1 to disable this validation\.|
            |Sep 26, 2025, 11:02:06 AM|WARNING|0\.00s - to python to disable frozen modules\.|
            |Sep 26, 2025, 11:02:06 AM|WARNING|0\.00s - make the debugger miss breakpoints\. Please pass -Xfrozen\_modules=off|
            |Sep 26, 2025, 11:02:06 AM|WARNING|0\.00s - Debugger warning: It seems that frozen modules are being used, which may|
            |Sep 26, 2025, 11:02:05 AM|WARNING|kernel 527821a1-c507-43c3-805c-40394db7bda6 restarted|
            |Sep 26, 2025, 11:02:05 AM|INFO|AsyncIOLoopKernelRestarter: restarting kernel \(1/5\), keep random ports|
            |Sep 26, 2025, 10:58:54 AM|WARNING|0\.00s - Note: Debugging will proceed\. Set PYDEVD\_DISABLE\_FILE\_VALIDATION=1 to disable this validation\.|
            |Sep 26, 2025, 10:58:54 AM|WARNING|0\.00s - to python to disable frozen modules\.|
            |Sep 26, 2025, 10:58:54 AM|WARNING|0\.00s - make the debugger miss breakpoints\. Please pass -Xfrozen\_modules=off|
            |Sep 26, 2025, 10:58:54 AM|WARNING|0\.00s - Debugger warning: It seems that frozen modules are being used, which may|
            |Sep 26, 2025, 10:58:53 AM|INFO|Kernel restarted: 527821a1-c507-43c3-805c-40394db7bda6|
            |Sep 26, 2025, 10:58:02 AM|WARNING|0\.00s - Note: Debugging will proceed\. Set PYDEVD\_DISABLE\_FILE\_VALIDATION=1 to disable this validation\.|
            |Sep 26, 2025, 10:58:02 AM|WARNING|0\.00s - to python to disable frozen modules\.|
            |Sep 26, 2025, 10:58:02 AM|WARNING|0\.00s - make the debugger miss breakpoints\. Please pass -Xfrozen\_modules=off|
            |Sep 26, 2025, 10:58:02 AM|WARNING|0\.00s - Debugger warning: It seems that frozen modules are being used, which may|
            |Sep 26, 2025, 10:58:01 AM|WARNING|kernel 527821a1-c507-43c3-805c-40394db7bda6 restarted|
            |Sep 26, 2025, 10:58:01 AM|INFO|AsyncIOLoopKernelRestarter: restarting kernel \(1/5\), keep random ports|
            |Sep 26, 2025, 10:53:05 AM|WARNING|0\.00s - Note: Debugging will proceed\. Set PYDEVD\_DISABLE\_FILE\_VALIDATION=1 to disable this validation\.|
            |Sep 26, 2025, 10:53:05 AM|WARNING|0\.00s - to python to disable frozen modules\.|
            |Sep 26, 2025, 10:53:05 AM|WARNING|0\.00s - make the debugger miss breakpoints\. Please pass -Xfrozen\_modules=off|
            |Sep 26, 2025, 10:53:05 AM|WARNING|0\.00s - Debugger warning: It seems that frozen modules are being used, which may|
            |Sep 26, 2025, 10:53:04 AM|WARNING|kernel 527821a1-c507-43c3-805c-40394db7bda6 restarted|
            |Sep 26, 2025, 10:53:04 AM|INFO|AsyncIOLoopKernelRestarter: restarting kernel \(1/5\), keep random ports|
            |Sep 26, 2025, 10:48:47 AM|INFO|Connecting to kernel 527821a1-c507-43c3-805c-40394db7bda6\.|
            |Sep 26, 2025, 10:48:46 AM|WARNING|0\.00s - Note: Debugging will proceed\. Set PYDEVD\_DISABLE\_FILE\_VALIDATION=1 to disable this validation\.|
            |Sep 26, 2025, 10:48:46 AM|WARNING|0\.00s - to python to disable frozen modules\.|
            |Sep 26, 2025, 10:48:46 AM|WARNING|0\.00s - make the debugger miss breakpoints\. Please pass -Xfrozen\_modules=off|
            |Sep 26, 2025, 10:48:46 AM|WARNING|0\.00s - Debugger warning: It seems that frozen modules are being used, which may|
            |Sep 26, 2025, 10:48:46 AM|INFO|Kernel started: 527821a1-c507-43c3-805c-40394db7bda6|
            |Sep 26, 2025, 10:48:46 AM|WARNING|  validate\_schema\(\_schema\)|
            |Sep 26, 2025, 10:48:46 AM|WARNING|/usr/local/lib/python3\.12/dist-packages/jupyter\_events/schema\.py:68: JupyterEventsVersionWarning: The `version` property of an event schema must be a string\. It has been type coerced, but in a future version of this library, it will fail to validate\. Please update schema: https://events\.jupyter\.org/jupyter\_server/kernel\_actions/v1|
            |Sep 26, 2025, 10:48:45 AM|WARNING|0\.00s - Note: Debugging will proceed\. Set PYDEVD\_DISABLE\_FILE\_VALIDATION=1 to disable this validation\.|
            |Sep 26, 2025, 10:48:45 AM|WARNING|0\.00s - to python to disable frozen modules\.|
            |Sep 26, 2025, 10:48:45 AM|WARNING|0\.00s - make the debugger miss breakpoints\. Please pass -Xfrozen\_modules=off|
            |Sep 26, 2025, 10:48:45 AM|WARNING|0\.00s - Debugger warning: It seems that frozen modules are being used, which may|
            |Sep 26, 2025, 10:45:02 AM|INFO|Use Control-C to stop this server and shut down all kernels \(twice to skip confirmation\)\.|
            |Sep 26, 2025, 10:45:02 AM|INFO|    http://127\.0\.0\.1:9000/|
            |Sep 26, 2025, 10:45:02 AM|INFO|http://172\.28\.0\.12:9000/|
            |Sep 26, 2025, 10:45:02 AM|INFO|Jupyter Server 2\.14\.0 is running at:|
            |Sep 26, 2025, 10:45:02 AM|INFO|Serving notebooks from local directory: /|
            |Sep 26, 2025, 10:45:02 AM|INFO|panel\.io\.jupyter\_server\_extension |
            |Sep 26, 2025, 10:45:02 AM|INFO|nbclassic |
            |Sep 26, 2025, 10:45:02 AM|INFO|jupyterlab\_jupytext |
            |Sep 26, 2025, 10:45:02 AM|INFO|\[Jupytext Server Extension\] Deriving an AsyncTextFileContentsManager from AsyncLargeFileManager|
            |Sep 26, 2025, 10:45:02 AM|INFO|jupyter\_server\_terminals |
            |Sep 26, 2025, 10:45:02 AM|INFO|ipyparallel |
            |Sep 26, 2025, 10:45:02 AM|INFO|Loading IPython parallel extension|
            |Sep 26, 2025, 10:45:02 AM|INFO|google\.colab\._serverextension |
            |Sep 26, 2025, 10:45:02 AM|INFO|google\.colab server extension initialized\.|
            |Sep 26, 2025, 10:45:02 AM|INFO|google\.colab |
            |Sep 26, 2025, 10:45:02 AM|INFO|notebook\_shim |
            |Sep 26, 2025, 10:45:02 AM|WARNING|Customizing authentication via ServerApp\.login\_handler\_class=\<class 'google\.colab\._login\_handler.ColabLoginHandler'\> is deprecated in Jupyter Server 2\.0\. Use ServerApp\.identity\_provider\_class\. Falling back on legacy authentication.|
            |Sep 26, 2025, 10:45:02 AM|INFO|panel\.io\.jupyter\_server\_extension |
            |Sep 26, 2025, 10:45:02 AM|INFO|notebook\_shim |
            |Sep 26, 2025, 10:45:02 AM|WARNING|    \t/root/\.jupyter/jupyter\_notebook\_config\.json|
            |Sep 26, 2025, 10:45:02 AM|WARNING|    \t/root/\.local/etc/jupyter/jupyter\_notebook\_config\.json|
            |Sep 26, 2025, 10:45:02 AM|WARNING|    \t/usr/etc/jupyter/jupyter\_notebook\_config\.json|
            |Sep 26, 2025, 10:45:02 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_notebook\_config\.json|
            |Sep 26, 2025, 10:45:02 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_notebook\_config\.d/panel-client-jupyter\.json|
            |Sep 26, 2025, 10:45:02 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_notebook\_config\.d/jupytext\.json|
            |Sep 26, 2025, 10:45:02 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_notebook\_config\.d/ipyparallel\.json|
            |Sep 26, 2025, 10:45:02 AM|WARNING|    \t/etc/jupyter/jupyter\_notebook\_config\.json|
            |Sep 26, 2025, 10:45:02 AM|WARNING|    \t/root/\.jupyter/jupyter\_notebook\_config\.json|
            |Sep 26, 2025, 10:45:02 AM|INFO|Writing Jupyter server cookie secret to /root/\.local/share/jupyter/runtime/jupyter\_cookie\_secret|
            |Sep 26, 2025, 10:45:02 AM|INFO|nbclassic |
            |Sep 26, 2025, 10:45:02 AM|INFO|jupyterlab\_jupytext |
            |Sep 26, 2025, 10:45:02 AM|INFO|jupyter\_server\_terminals |
            |Sep 26, 2025, 10:45:02 AM|INFO|ipyparallel |
            |Sep 26, 2025, 10:45:02 AM|INFO|google\.colab\._serverextension |
            |Sep 26, 2025, 10:45:02 AM|INFO|google\.colab |
            |Sep 26, 2025, 10:45:02 AM|INFO|Extension package panel\.io\.jupyter\_server\_extension took 1\.8744s to import|
            |Sep 26, 2025, 10:45:00 AM|WARNING|A `\_jupyter\_server\_extension\_points` function was not found in nbclassic\. Instead, a `\_jupyter\_server\_extension\_paths` function was found and will be used for now\. This function name will be deprecated in future releases of Jupyter Server.|
            |Sep 26, 2025, 10:45:00 AM|INFO|Extension package jupyterlab\_jupytext took 0\.1630s to import|
            |Sep 26, 2025, 10:45:00 AM|WARNING|A `\_jupyter\_server\_extension\_points` function was not found in ipyparallel\. Instead, a `\_jupyter\_server\_extension\_paths` function was found and will be used for now\. This function name will be deprecated in future releases of Jupyter Server.|
            |Sep 26, 2025, 10:45:00 AM|INFO|Extension package ipyparallel took 0\.2001s to import|
            |Sep 26, 2025, 10:44:59 AM|WARNING|  validate\_schema\(\_schema\)|
            |Sep 26, 2025, 10:44:59 AM|WARNING|/usr/local/lib/python3\.12/dist-packages/jupyter\_events/schema\.py:68: JupyterEventsVersionWarning: The `version` property of an event schema must be a string\. It has been type coerced, but in a future version of this library, it will fail to validate\. Please update schema: https://events\.jupyter\.org/jupyter\_server/gateway\_client/v1|
            |Sep 26, 2025, 10:44:59 AM|WARNING|  validate\_schema\(\_schema\)|
            |Sep 26, 2025, 10:44:59 AM|WARNING|/usr/local/lib/python3\.12/dist-packages/jupyter\_events/schema\.py:68: JupyterEventsVersionWarning: The `version` property of an event schema must be a string\. It has been type coerced, but in a future version of this library, it will fail to validate\. Please update schema: https://events\.jupyter\.org/jupyter\_server/contents\_service/v1|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/root/\.jupyter/jupyter\_server\_config\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/root/\.local/etc/jupyter/jupyter\_server\_config\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/usr/etc/jupyter/jupyter\_server\_config\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_server\_config\.d/nbclassic\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_server\_config\.d/google\.colab\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_server\_config\.d/panel-client-jupyter\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_server\_config\.d/notebook\_shim\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_server\_config\.d/nbclassic\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_server\_config\.d/jupytext\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_server\_config\.d/jupyter\_server\_terminals\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_server\_config\.d/ipyparallel\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/usr/local/etc/jupyter/jupyter\_server\_config\.d/google\.colab\._serverextension\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|    \t/etc/jupyter/jupyter\_server\_config\.json|
            |Sep 26, 2025, 10:44:59 AM|WARNING|ServerApp\.iopub\_data\_rate\_limit config is deprecated in 2\.0\. Use ZMQChannelsWebsocketConnection\.iopub\_data\_rate\_limit.|
            |Sep 26, 2025, 10:44:59 AM|WARNING|\[W 2025-09-26 01:44:59\.341 ServerApp\] ServerApp\.token config is deprecated in 2\.0\. Use IdentityProvider\.token.|
            |Sep 26, 2025, 10:44:59 AM|WARNING|  warn\(|
        </code></pre>
    </div>
    <p>
        この状態では一回に読み込む音声ファイルが数分であり長いためメモリを余分に使ってしまう。
        そのため、以下のように音声ファイルを細かく分けて組み込みに使用することとした。
        そうすることでメモリの使用量を抑えることに成功した。
    </p>

    <h4>修正後のプログラム</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
        def get_embedding_chunked(file_path, model, chunk_length_sec=10):
            try:
                signal, fs = librosa.load(file_path, sr=16000)

                chunk_size = chunk_length_sec * fs
                chunk_embeddings = []

                for i in range(0, len(signal), chunk_size):
                    chunk = signal[i:i+chunk_size]

                    if len(chunk) < fs * 1:
                        #Skip chunks that are too short
                        continue

                    audio_tensor = torch.from_numpy(chunk)

                    embedding = model.encode_batch(audio_tensor)
                    embedding = embedding.squeeze().cpu().numpy()

                    chunk_embeddings.append(embedding)

                if not chunk_embeddings:
                    print(f"Warning: No valid chunks found for {os.path.basename(file_path)}")
                    return None

                final_embedding = np.mean(chunk_embeddings, axis=0)
                return final_embedding

            except Exception as e:
                print(f"Error processing {file_path}: {e}")
                return None

        speaker_embedding_db = {}

        print("Creating speaker embedding database from training data(using chunking)...")
        for speaker, paths in speaker_paths_train.items():
            embeddings = []
            for path in paths[:3]:
                embedding = get_embedding_chunked(path, language_id)
                if embedding is not None:
                    embeddings.append(embedding)
                    print(f"Processed {os.path.basename(path)}")

            if embeddings:
                speaker_embedding_db[speaker] = np.mean(embeddings, axis=0)
                print(f"Created average embedding for {speaker}.")

        print("/n--- Speaker Embedding Database Complete ---")
        </code></pre>
    </div>

    <h3>GPUが全く使われていなかった。</h3>
    <p>
        事前学習モデルを使用する際に、run_optsでGPUを指定していなかったため、CPUで処理が行われていた。
        そのため、以下のようにGPUの設定をし直してGPUを使用できるようにした。
    </p>

    <h4>修正前のプログラム</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            language_id = EncoderClassifier.from_hparams(
                source="speechbrain/spkrec-ecapa-voxceleb",
                savedir = root_path + "/models/pretrained_models/ecapa-tdnn"
                )

            print("Pre-trained model loaded successfully.")

            ...

            audio_tensor = torch.from_numpy(chunk)

            embedding = model.encode_batch(audio_tensor)
        </code></pre>
    </div>

    <h4>修正後のプログラム</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            device = "cuda" if torch.cuda.is_available() else "cpu"

            language_id = EncoderClassifier.from_hparams(
                source="speechbrain/spkrec-ecapa-voxceleb",
                savedir = root_path + "/models/pretrained_models/ecapa-tdnn",
                run_opts={"device": device}
                )

            print(f"Device is {device}")
            print("Pre-trained model loaded successfully.")

            ...

            audio_tensor = torch.from_numpy(chunk)
            audio_tensor = audio_tensor.to(device)
            embedding = model.encode_batch(audio_tensor)
        </code></pre>

    </section>
    <section>
    <h2>2025/09/28</h2>
    <h3>t-SNEとは</h3>
    <p>
        t-SNEは高次元データを視覚的に表すアルゴリズムである。
        今回は192次元のデータを扱っていたが、2次元として視覚化した。
    </p>

    </section>
    <section>
    <h2>2025/09/29</h2>
    <h3>t-SNEのパラメータ"n_iter"が使えない</h3>
    <p>
        t-SNEのパラメータ"n_iter"は、バージョン1.5以降で"max_iter"に名称が変更された。
    </p>
    <h3>voiceprint extractorとは</h3>
    <p>
        話者特定のシステムでは事前学習されたAIモデルを使用することが多い。
        その際に使用される大規模な汎用的なAIモデルの一つに"voiceprint extractor"がある。</br>
        今回使用したモデル"speechbrain/spkrec-ecapa-voxceleb"は、人間が発せられる音声からワードや言語やノイズ等を無視して個人の特徴量のみにフォーカスしたモデルである。
    </p>
    <h3>今回作成した話者特定モデルのメソッド</h3>
    <p>
        今回作成したモデルは、2つのステージに分かれている。
    </p>
    <p>
        まず1つ目のステージでは、大規模なvoiceprint extractorを使用して、音声から話者固有の特徴量を抽出する。
        今回使用した"speechbrain/spkrec-ecapa-voxceleb"は、音声から192次元の特徴量を抽出する。ここで組み込む音声ファイルが2秒だろうが30秒だろうが192個の特徴量に要約される。そうすることで音声ファイル同士を比較することに優れている。
    </p>
    <p>
        2つ目のステージでは、抽出した特徴量をもとに、話者の識別を行うためのモデルを訓練する。今回では、コサイン類似度を使用した。</br>
        最初に訓練フェーズでVoiceprint Databaseを作成する。用意した訓練データをvoiceprint extractorに組み込む。また、各話者ごとに用意した複数の音声ファイルのvoiceprintを話者ごとに平均を撮って話者特有のvoiceprintを作成する。その後、テストデータでコサイン類似度を計算して1〜0の範囲で類似度を求める。
    </p>
    <h3>x-vectorとは</h3>
    <p>
        x-vectorとは、voiceprintを計算するために抽出する特徴量の計算方法である。
    </p>
    <h4>x-vectorの計算方法</h4>
    <p>
        x-vectorはニューラルネットワークを使用して計算が行われる。
        まず、最初に音声を細かく分けて重なり合う部分を解析する。このときTime Delay Neural Network(TDNN)を使用する。TDNNは音声の時間領域での特徴量の抽出に優れている。TDNNによって音声ファイルの細かい時間ごとの特徴ベクトルの抽出に長けている。
        その後、統計的プーリングレイヤーを使用する。このとき全体のすべてのフレームレベルでの特徴量の平均や正規分布を計算してそれらを組み合わせる。そうすることで、音声ファイル全体としての特徴量を抽出することができる。
        最終的にはだいたい128~512次元のベクトルの特徴量に抑えることができる。
    </p>
    <h3>音声が持つデータの数</h3>
    <p>
        音声データには、時間の情報と大きさの情報しかない。
        ただし、時間を瞬間的に切り取るとその時の周波数ごとの特性を抽出することができる。
        このときFFTを使用するのが一般的であるが、例えば100フレームの512次元での解析では257次元の周波数ごとの振幅を得られることが可能である。このときのデータの数は100x257=25700個であり、これをスペクトルを言う。
        ニューラルネットワークにおいては、このスペクトルを独自の計算で重み付けするような学習を行う。
    </p>

    </section>
    <section>
    <h2>2025/10/02</h2>
    <h3>TTSの使用時のランタイムエラー</h3>
    <p>
        以下のようなエラーが発生した際は、以下のようなコマンドでLinuxにmecabをインストールする。
    </p>

    <h4>TTS使用時のエラー</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            ---------------------------------------------------------------------------
            RuntimeError                              Traceback (most recent call last)
            Cell In[9], line 2
                  1 print("Cloning the voice and generating speech...")
            ----> 2 tts.tts_to_file(
                  3     text=text_to_synthesize,
                  4     speaker_wav=speaker_wav_path,
                  5     language="ja",  # Specify Japanese
                  6     file_path=output_wav_path
                  7 )
                  9 print(f"Speech generated successfully and saved to {output_wav_path}")

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/TTS/api.py:334, in TTS.tts_to_file(self, text, speaker, language, speaker_wav, emotion, speed, pipe_out, file_path, split_sentences, **kwargs)
                303 """Convert text to speech.
                304 
                305 Args:
               (...)    330         Additional arguments for the model.
                331 """
                332 self._check_arguments(speaker=speaker, language=language, speaker_wav=speaker_wav, **kwargs)
            --> 334 wav = self.tts(
                335     text=text,
                336     speaker=speaker,
                337     language=language,
                338     speaker_wav=speaker_wav,
                339     split_sentences=split_sentences,
                340     **kwargs,
                341 )
                342 self.synthesizer.save_wav(wav=wav, path=file_path, pipe_out=pipe_out)
                343 return file_path

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/TTS/api.py:276, in TTS.tts(self, text, speaker, language, speaker_wav, emotion, speed, split_sentences, **kwargs)
                248 """Convert text to speech.
                249 
                250 Args:
               (...)    271         Additional arguments for the model.
                272 """
                273 self._check_arguments(
                274     speaker=speaker, language=language, speaker_wav=speaker_wav, emotion=emotion, speed=speed, **kwargs
                275 )
            --> 276 wav = self.synthesizer.tts(
                277     text=text,
                278     speaker_name=speaker,
                279     language_name=language,
                280     speaker_wav=speaker_wav,
                281     reference_wav=None,
                282     style_wav=None,
                283     style_text=None,
                284     reference_speaker_name=None,
                285     split_sentences=split_sentences,
                286     **kwargs,
                287 )
                288 return wav

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/TTS/utils/synthesizer.py:386, in Synthesizer.tts(self, text, speaker_name, language_name, speaker_wav, style_wav, style_text, reference_wav, reference_speaker_name, split_sentences, **kwargs)
                384 for sen in sens:
                385 if hasattr(self.tts_model, "synthesize"):
            --> 386         outputs = self.tts_model.synthesize(
                387             text=sen,
                388             config=self.tts_config,
                389             speaker_id=speaker_name,
                390             voice_dirs=self.voice_dir,
                391             d_vector=speaker_embedding,
                392             speaker_wav=speaker_wav,
                393             language=language_name,
                394             **kwargs,
                395         )
                396     else:
                397         # synthesize voice
                398         outputs = synthesis(
                399             model=self.tts_model,
                400             text=sen,
               (...)    408             language_id=language_id,
                409         )

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/TTS/tts/models/xtts.py:419, in Xtts.synthesize(self, text, config, speaker_wav, language, speaker_id, **kwargs)
                412     return self.inference(text, language, gpt_cond_latent, speaker_embedding, **settings)
                413 settings.update({
                414     "gpt_cond_len": config.gpt_cond_len,
                415     "gpt_cond_chunk_len": config.gpt_cond_chunk_len,
                416     "max_ref_len": config.max_ref_len,
                417     "sound_norm_refs": config.sound_norm_refs,
                418 })
            --> 419 return self.full_inference(text, speaker_wav, language, **settings)

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/torch/utils/_contextlib.py:116, in context_decorator.<locals>.decorate_context(*args, **kwargs)
                113 @functools.wraps(func)
                114 def decorate_context(*args, **kwargs):
                115     with ctx_factory():
            --> 116         return func(*args, **kwargs)

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/TTS/tts/models/xtts.py:488, in Xtts.full_inference(self, text, ref_audio_path, language, temperature, length_penalty, repetition_penalty, top_k, top_p, do_sample, gpt_cond_len, gpt_cond_chunk_len, max_ref_len, sound_norm_refs, **hf_generate_kwargs)
                441 """
                442 This function produces an audio clip of the given text being spoken with the given reference voice.
                443 
               (...)    478     Sample rate is 24kHz.
                479 """
                480 (gpt_cond_latent, speaker_embedding) = self.get_conditioning_latents(
                481     audio_path=ref_audio_path,
                482     gpt_cond_len=gpt_cond_len,
               (...)    485     sound_norm_refs=sound_norm_refs,
                486 )
            --> 488 return self.inference(
                489     text,
                490     language,
                491     gpt_cond_latent,
                492     speaker_embedding,
                493     temperature=temperature,
                494     length_penalty=length_penalty,
                495     repetition_penalty=repetition_penalty,
                496     top_k=top_k,
                497     top_p=top_p,
                498     do_sample=do_sample,
                499     **hf_generate_kwargs,
                500 )

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/torch/utils/_contextlib.py:116, in context_decorator.<locals>.decorate_context(*args, **kwargs)
                113 @functools.wraps(func)
                114 def decorate_context(*args, **kwargs):
                115     with ctx_factory():
            --> 116         return func(*args, **kwargs)

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/TTS/tts/models/xtts.py:534, in Xtts.inference(self, text, language, gpt_cond_latent, speaker_embedding, temperature, length_penalty, repetition_penalty, top_k, top_p, do_sample, num_beams, speed, enable_text_splitting, **hf_generate_kwargs)
                532 for sent in text:
                533     sent = sent.strip().lower()
            --> 534     text_tokens = torch.IntTensor(self.tokenizer.encode(sent, lang=language)).unsqueeze(0).to(self.device)
                536     assert (
                537         text_tokens.shape[-1] < self.args.gpt_max_text_tokens
                538     ), " ❗ XTTS can only generate text with a maximum of 400 tokens."
                540     with torch.no_grad():

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/TTS/tts/layers/xtts/tokenizer.py:649, in VoiceBpeTokenizer.encode(self, txt, lang)
                647 lang = lang.split("-")[0]  # remove the region
                648 self.check_input_length(txt, lang)
            --> 649 txt = self.preprocess_text(txt, lang)
                650 lang = "zh-cn" if lang == "zh" else lang
                651 txt = f"[{lang}]{txt}"

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/TTS/tts/layers/xtts/tokenizer.py:638, in VoiceBpeTokenizer.preprocess_text(self, txt, lang)
                636         txt = korean_transliterate(txt)
                637 elif lang == "ja":
            --> 638     txt = japanese_cleaners(txt, self.katsu)
                639 elif lang == "hi":
                640     # @manmay will implement this
                641     txt = basic_cleaners(txt)

            File ~/miniconda3/envs/tts_env/lib/python3.11/functools.py:1001, in cached_property.__get__(self, instance, owner)
                999 val = cache.get(self.attrname, _NOT_FOUND)
               1000 if val is _NOT_FOUND:
            -> 1001     val = self.func(instance)
               1002     try:
               1003         cache[self.attrname] = val

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/TTS/tts/layers/xtts/tokenizer.py:620, in VoiceBpeTokenizer.katsu(self)
                616 @cached_property
                617 def katsu(self):
                618     import cutlet
            --> 620     return cutlet.Cutlet()

            File ~/miniconda3/envs/tts_env/lib/python3.11/site-packages/cutlet/cutlet.py:137, in Cutlet.__init__(self, system, use_foreign_spelling, ensure_ascii, mecab_args)
                134     print("unknown system: {}".format(system))
                135     raise
            --> 137 self.tagger = fugashi.Tagger(mecab_args)
                138 self.exceptions = load_exceptions()
                140 # these are too minor to be worth exposing as arguments

            File fugashi/fugashi.pyx:391, in fugashi.fugashi.Tagger.__init__()

            File fugashi/fugashi.pyx:231, in fugashi.fugashi.GenericTagger.__init__()

            RuntimeError: 
            Failed initializing MeCab. Please see the README for possible solutions:

                https://github.com/polm/fugashi

            If you are still having trouble, please file an issue here, and include the
            ERROR DETAILS below:

                https://github.com/polm/fugashi/issues

            issueを英語で書く必要はありません。

            ------------------- ERROR DETAILS ------------------------
            arguments: [b'fugashi', b'-C']
            param.cpp(69) [ifs] no such file or directory: /usr/local/etc/mecabrc
            ----------------------------------------------------------
        </code></pre>
    </div>

    <h4>mecabのインストール</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            sudo apt-get update
            sudo apt-get install mecab libmecab-dev mecab-ipadic-utf8
        </code></pre>
    </div>

    <h3>generateでエラーが起こった</h3>
    <p>
        以下のようなエラーが起こった際は<a href="https://huggingface.co/coqui/XTTS-v2/discussions/122">こちらのディスカッション</a>を参考にしてcoqui-ttsをインストールすることで解決した。
    </p>
    <h4>generateのエラー</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            An error occurred: 'GPT2InferenceModel' object has no attribute 'generate'
        </code></pre>
    </div>

    <h4>coqui-ttsのインストール</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            %pip install coqui-tts transformers==4.35.2
        </code></pre>
    </div>

    <h3>split()でエラーが起こった</h3>
    <p>
        以下のようなエラーが起こった際はsplit関数をlist形式の変数に適用しているので、string形式の変数に適用するように修正した。
    </p>
    <h4>generateのエラー</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            An error occurred: 'list' object has no attribute 'strip'
        </code></pre>
    </div>

    <h4>修正前のコード</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            print("Starting batch processing")

            try:

                with open(text_path, 'r', encoding='utf-8') as f:

                    lines = f.readlines()

                    total_files = len(lines)

                    print(f"Found {total_files} entries in the transcript file.")



                    for i, row in enumerate(lines):

                        parts = lines.strip().split(':', 1)



                        if len(row) != 2:

                            print(f"Skipping malformed row: {lines.strip()}")

                            continue

                        file_id, text_to_synthesize = parts
        </code></pre>
    </div>

    <h4>修正後のコード</h4>
    <div style="position: relative; margin: 1.5rem 0;">
        
        <pre id="pythonCode"><code>
            print("Starting batch processing")
            try:
                with open(text_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    total_files = len(lines)
                    print(f"Found {total_files} entries in the transcript file.")

                    for i, row in enumerate(lines):
                        # 1. Use .strip() on the 'row' (the string), not 'lines' (the list)
                        clean_row = row.strip()

                        # Skip any empty lines
                        if not clean_row:
                            continue

                        # 2. Split the 'clean_row' string
                        parts = clean_row.split(':', 1)

                        # 3. Check the number of 'parts', not the length of the 'row' string
                        if len(parts) != 2:
                            print(f"Skipping malformed row: {clean_row}")
                            continue

                ...
        </code></pre>
    </div>


    </section>
    <section>
    <h2>2025/10/03</h2>
    <h3>Google Driveのマウント</h3>
    <p>
        Google DriveのマウントをUbuntuで行う場合、多くのサイトで"google-drive-ocamlfuse"を推奨されるが、"rclone"を使用した場合のほうが良かった。大きいサイズのファイルを扱う場合に"rclone"のほうが安定している。
    </p>
    <h3>cost function(目的関数)とは</h3>
    <p>
        cost function(別名: loss function, objective function)とは、機械学習におけるコンセプトである。</br>
        モデルが出力した値がどれほど正解から離れているかを計算する関数である。この値が大きければ大きいほどロスが多いということになる。</br>
        目的関数には、以下のような種類がある。
    </p>
    <h4>1. 平均二乗誤差</h4>
    <div style="text-align: center; margin: 1.5rem 0;">
        $$ J(\theta) = \frac{1}{m} \sum_{i=1}^{m} (\hat{y}^{(i)} - y^{(i)})^2 $$
    </div>
    <p>ただし記号は以下の通りに定義する。</p>
    <div style="text-align: center; margin: 1.5rem 0;">
        $$ m: 訓練データの数 $$<br>
        $$ \hat{y}^{(i)}: i番目のモデルが予測した値 $$<br>
        $$ y^{(i)}: i番目のモデルの正解の値 $$<br>
    </div>
    <p>特徴</p>
    <ul>
        <li>誤差が大きい場合に、ペナルティ(関数の出力値)を大きくすることができる。</li>
        <li>外れ値に影響されやすい。</li>
        <li>微分可能であるため、勾配降下法で使用できる。</li>
    </ul>

    <h4>2. 二値交差エントロピー</h4>
    <div style="text-align: center; margin: 1.5rem 0;">
        $$ J(\theta) = -\frac{1}{m} \sum_{i=1}^{m} [y^{(i)} \log(\hat{y}^{(i)}) + (1-y^{(i)}) \log(1-\hat{y}^{(i)})] $$
    </div>
    <p>特徴</p>
    <ul>
        <li>モデルの出力値に影響を大きく受ける。</li>
        <li>予想が外れている際に勾配が強く出る。</li>
    </ul>

    <h4>3. カテゴリカル交差エントロピー</h4>
    <div style="text-align: center; margin: 1.5rem 0;">
        $$ [ J(\theta) = -\frac{1}{m} \sum_{i=1}^{m} \sum_{j=1}^{C} y_j^{(i)} \log(\hat{y}_j^{(i)}) $$
    </div>
    <div style="text-align: center; margin: 1.5rem 0;">
        $$ C: クラスの数 $$
    </div>




    </section>
    <section>
    <h2>2025/10/15</h2>
    </section>
    
    <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ddd; text-align: center; color: #666;">
        <p>&copy; <?php echo date('Y'); ?> 音声研究ノート - 最終更新: <?php echo date('Y年m月d日 H:i', filemtime(__FILE__)); ?></p>
    </footer>
  </article>
</main>

<?php renderFooter(); ?>

<!-- 構造化データ（記事） -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "音声解析と機械学習の研究メモ",
  "description": "<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>",
  "author": {
    "@type": "Organization",
    "name": "メモ帳"
  },
  "datePublished": "2025-09-09",
  "dateModified": "<?php echo date('c', filemtime(__FILE__)); ?>",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://memo-site.com/speech.php"
  },
  "about": [
    {
      "@type": "Thing",
      "name": "音声解析"
    },
    {
      "@type": "Thing", 
      "name": "機械学習"
    },
    {
      "@type": "Thing",
      "name": "MFCC"
    },
    {
      "@type": "Thing",
      "name": "Python"
    }
  ],
  "keywords": ["音声解析", "機械学習", "MFCC", "DTW", "z-score", "Python", "アイヌ語"]
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
      "name": "音声解析",
      "item": "https://memo-site.com/speech.php"
    }
  ]
}
</script>