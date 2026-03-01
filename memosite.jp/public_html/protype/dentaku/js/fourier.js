/**
 * fourier.js - フーリエ変換と信号処理
 * 時間領域と周波数領域の変換、信号処理機能を提供
 */

document.addEventListener('DOMContentLoaded', function() {
    // フーリエ変換タブの初期化
    initFourierTab();
    
    // イベントリスナーの設定
    document.getElementById('fourier-input-type').addEventListener('change', handleFourierInputTypeChange);
    document.getElementById('fourier-transform-type').addEventListener('change', handleFourierTransformTypeChange);
    document.getElementById('fourier-filter-type').addEventListener('change', handleFourierFilterTypeChange);
    document.getElementById('fourier-signal-type').addEventListener('change', handleFourierSignalTypeChange);
    document.getElementById('fourier-transform-btn').addEventListener('click', performFourierTransform);
    document.getElementById('fourier-inverse-btn').addEventListener('click', performInverseFourierTransform);
    document.getElementById('fourier-latex-btn').addEventListener('click', displayFourierLatex);
    document.getElementById('fourier-export-btn').addEventListener('click', exportFourierResults);
    
    // オーディオファイル入力のイベントリスナー
    document.getElementById('fourier-audio-file').addEventListener('change', handleAudioFileInput);
    
    // 画像ファイル入力のイベントリスナー
    document.getElementById('fourier-image-file').addEventListener('change', handleImageFileInput);
});

/**
 * フーリエ変換タブの初期化
 */
function initFourierTab() {
    // 入力タイプの変更ハンドラを一度呼び出して初期状態を設定
    handleFourierInputTypeChange();
    
    // 変換タイプの変更ハンドラを一度呼び出して初期状態を設定
    handleFourierTransformTypeChange();
    
    // フィルタタイプの変更ハンドラを一度呼び出して初期状態を設定
    handleFourierFilterTypeChange();
    
    // 信号タイプの変更ハンドラを一度呼び出して初期状態を設定
    handleFourierSignalTypeChange();
}

/**
 * 入力タイプの変更ハンドラ
 */
function handleFourierInputTypeChange() {
    const inputType = document.getElementById('fourier-input-type').value;
    
    // すべての入力フォームを非表示
    document.querySelectorAll('.fourier-input').forEach(el => {
        el.style.display = 'none';
    });
    
    // 選択された入力タイプのフォームを表示
    document.getElementById(`fourier-${inputType}-input`).style.display = 'block';
}

/**
 * 変換タイプの変更ハンドラ
 */
function handleFourierTransformTypeChange() {
    const transformType = document.getElementById('fourier-transform-type').value;
    
    // ウェーブレット関連の設定を表示/非表示
    document.getElementById('fourier-wavelet-type-group').style.display = 
        transformType === 'wavelet' ? 'block' : 'none';
    
    // STFT関連の設定を表示/非表示
    document.getElementById('fourier-stft-window-group').style.display = 
        transformType === 'stft' ? 'block' : 'none';
}

/**
 * フィルタタイプの変更ハンドラ
 */
function handleFourierFilterTypeChange() {
    const filterType = document.getElementById('fourier-filter-type').value;
    
    // カットオフ周波数設定を表示/非表示
    document.getElementById('fourier-filter-cutoff-group').style.display = 
        (filterType === 'lowpass' || filterType === 'highpass') ? 'block' : 'none';
    
    // バンド設定を表示/非表示
    document.getElementById('fourier-filter-band-group').style.display = 
        (filterType === 'bandpass' || filterType === 'bandstop') ? 'block' : 'none';
    
    // カスタムフィルタ設定を表示/非表示
    document.getElementById('fourier-filter-custom-group').style.display = 
        filterType === 'custom' ? 'block' : 'none';
}

/**
 * 信号タイプの変更ハンドラ
 */
function handleFourierSignalTypeChange() {
    const signalType = document.getElementById('fourier-signal-type').value;
    
    // デューティ比設定を表示/非表示
    document.getElementById('fourier-signal-duty-group').style.display = 
        (signalType === 'square' || signalType === 'pulse') ? 'block' : 'none';
    
    // カスタム信号式を表示/非表示
    document.getElementById('fourier-signal-custom-group').style.display = 
        signalType === 'custom' ? 'block' : 'none';
}

/**
 * オーディオファイル入力ハンドラ
 */
function handleAudioFileInput(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const audioPreview = document.getElementById('fourier-audio-preview');
    audioPreview.src = URL.createObjectURL(file);
    audioPreview.onload = function() {
        URL.revokeObjectURL(audioPreview.src);
    };
}

/**
 * 画像ファイル入力ハンドラ
 */
function handleImageFileInput(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const imagePreview = document.getElementById('fourier-image-preview');
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.onload = function() {
        URL.revokeObjectURL(imagePreview.src);
    };
}

/**
 * フーリエ変換を実行
 */
function performFourierTransform() {
    const inputType = document.getElementById('fourier-input-type').value;
    const transformType = document.getElementById('fourier-transform-type').value;
    const filterType = document.getElementById('fourier-filter-type').value;
    
    let inputData, samplingRate;
    
    try {
        // 入力データの取得
        switch (inputType) {
            case 'function':
                [inputData, samplingRate] = getFunctionInputData();
                break;
            case 'data':
                [inputData, samplingRate] = getDataInputData();
                break;
            case 'signal':
                [inputData, samplingRate] = getSignalInputData();
                break;
            case 'audio':
                // オーディオ処理は別途実装が必要
                throw new Error('オーディオ処理は現在実装中です');
            case 'image':
                // 画像処理は別途実装が必要
                throw new Error('画像処理は現在実装中です');
            default:
                throw new Error('未対応の入力タイプです');
        }
        
        // フーリエ変換の実行
        let transformResult;
        switch (transformType) {
            case 'fft':
                transformResult = computeFFT(inputData);
                break;
            case 'dft':
                transformResult = computeDFT(inputData);
                break;
            case 'stft':
                transformResult = computeSTFT(inputData, samplingRate);
                break;
            case 'wavelet':
                transformResult = computeWaveletTransform(inputData, samplingRate);
                break;
            default:
                throw new Error('未対応の変換タイプです');
        }
        
        // フィルタリング（必要な場合）
        if (filterType !== 'none') {
            transformResult = applyFilter(transformResult, filterType, samplingRate);
        }
        
        // 結果の表示
        displayFourierResults(inputData, transformResult, samplingRate);
        
        // 可視化
        visualizeFourierResults(inputData, transformResult, samplingRate);
        
    } catch (e) {
        console.error('フーリエ変換エラー:', e);
        document.getElementById('fourier-output').innerHTML = `
            <div class="result-error">
                <h4>エラー:</h4>
                <p>${e.message}</p>
            </div>
        `;
        document.getElementById('fourier-time-visualization').innerHTML = '';
        document.getElementById('fourier-freq-visualization').innerHTML = '';
    }
}

/**
 * 逆フーリエ変換を実行
 */
function performInverseFourierTransform() {
    // 現在の変換結果を取得（グローバル変数または状態管理が必要）
    // この例では簡略化のため、新たに変換を行います
    try {
        const inputType = document.getElementById('fourier-input-type').value;
        const transformType = document.getElementById('fourier-transform-type').value;
        
        let inputData, samplingRate;
        
        // 入力データの取得
        switch (inputType) {
            case 'function':
                [inputData, samplingRate] = getFunctionInputData();
                break;
            case 'data':
                [inputData, samplingRate] = getDataInputData();
                break;
            case 'signal':
                [inputData, samplingRate] = getSignalInputData();
                break;
            default:
                throw new Error('この入力タイプでは逆変換を実行できません');
        }
        
        // フーリエ変換の実行
        let transformResult;
        switch (transformType) {
            case 'fft':
                transformResult = computeFFT(inputData);
                break;
            case 'dft':
                transformResult = computeDFT(inputData);
                break;
            default:
                throw new Error('この変換タイプでは逆変換を実行できません');
        }
        
        // 逆変換の実行
        let inverseResult;
        switch (transformType) {
            case 'fft':
                inverseResult = computeInverseFFT(transformResult);
                break;
            case 'dft':
                inverseResult = computeInverseDFT(transformResult);
                break;
            default:
                throw new Error('この変換タイプでは逆変換を実行できません');
        }
        
        // 結果の表示
        displayInverseFourierResults(inputData, transformResult, inverseResult, samplingRate);
        
        // 可視化
        visualizeInverseFourierResults(inputData, transformResult, inverseResult, samplingRate);
        
    } catch (e) {
        console.error('逆フーリエ変換エラー:', e);
        document.getElementById('fourier-output').innerHTML = `
            <div class="result-error">
                <h4>エラー:</h4>
                <p>${e.message}</p>
            </div>
        `;
    }
}

/**
 * 関数入力からデータを取得
 */
function getFunctionInputData() {
    const funcExpr = document.getElementById('fourier-function').value;
    const rangeStr = document.getElementById('fourier-function-range').value;
    const samples = parseInt(document.getElementById('fourier-function-samples').value);
    
    if (!funcExpr) {
        throw new Error('関数を入力してください');
    }
    
    if (!rangeStr) {
        throw new Error('時間範囲を指定してください');
    }
    
    if (isNaN(samples) || samples < 16 || samples > 16384) {
        throw new Error('サンプル数は16から16384の間で指定してください');
    }
    
    // 範囲の解析
    const range = rangeStr.split(',').map(x => parseFloat(math.evaluate(x.trim())));
    if (range.length !== 2 || isNaN(range[0]) || isNaN(range[1])) {
        throw new Error('時間範囲は2つの数値（開始,終了）で指定してください');
    }
    
    const tStart = range[0];
    const tEnd = range[1];
    
    // 関数をコンパイル
    const func = math.compile(funcExpr);
    
    // サンプリングレート
    const samplingRate = samples / (tEnd - tStart);
    
    // 時間領域のデータを生成
    const timeData = new Array(samples);
    for (let i = 0; i < samples; i++) {
        const t = tStart + i * (tEnd - tStart) / samples;
        timeData[i] = func.evaluate({t: t});
    }
    
    return [timeData, samplingRate];
}

/**
 * データ列入力からデータを取得
 */
function getDataInputData() {
    const dataStr = document.getElementById('fourier-data').value;
    const samplingRate = parseFloat(document.getElementById('fourier-data-sampling-rate').value);
    
    if (!dataStr) {
        throw new Error('データを入力してください');
    }
    
    if (isNaN(samplingRate) || samplingRate <= 0) {
        throw new Error('有効なサンプリングレートを指定してください');
    }
    
    // データの解析
    const data = dataStr.split(',').map(x => parseFloat(x.trim()));
    if (data.some(isNaN)) {
        throw new Error('無効なデータ形式です。カンマ区切りの数値を入力してください');
    }
    
    // FFTのために2のべき乗にパディング
    const paddedLength = Math.pow(2, Math.ceil(Math.log2(data.length)));
    const paddedData = new Array(paddedLength).fill(0);
    for (let i = 0; i < data.length; i++) {
        paddedData[i] = data[i];
    }
    
    return [paddedData, samplingRate];
}

/**
 * 信号生成入力からデータを取得
 */
function getSignalInputData() {
    const signalType = document.getElementById('fourier-signal-type').value;
    const frequency = parseFloat(document.getElementById('fourier-signal-frequency').value);
    const amplitude = parseFloat(document.getElementById('fourier-signal-amplitude').value);
    const phase = parseFloat(document.getElementById('fourier-signal-phase').value);
    const duration = parseFloat(document.getElementById('fourier-signal-duration').value);
    const samplingRate = parseFloat(document.getElementById('fourier-signal-sampling-rate').value);
    
    if (isNaN(frequency) || frequency <= 0) {
        throw new Error('有効な周波数を指定してください');
    }
    
    if (isNaN(amplitude) || amplitude <= 0) {
        throw new Error('有効な振幅を指定してください');
    }
    
    if (isNaN(phase)) {
        throw new Error('有効な位相を指定してください');
    }
    
    if (isNaN(duration) || duration <= 0) {
        throw new Error('有効な持続時間を指定してください');
    }
    
    if (isNaN(samplingRate) || samplingRate <= 0) {
        throw new Error('有効なサンプリングレートを指定してください');
    }
    
    // サンプル数の計算
    const samples = Math.floor(duration * samplingRate);
    
    // FFTのために2のべき乗にパディング
    const paddedLength = Math.pow(2, Math.ceil(Math.log2(samples)));
    const timeData = new Array(paddedLength).fill(0);
    
    // 信号の生成
    for (let i = 0; i < samples; i++) {
        const t = i / samplingRate;
        
        switch (signalType) {
            case 'sine':
                timeData[i] = amplitude * Math.sin(2 * Math.PI * frequency * t + phase);
                break;
            case 'square':
                const duty = parseFloat(document.getElementById('fourier-signal-duty').value) / 100;
                const period = 1 / frequency;
                const normalizedTime = (t % period) / period;
                timeData[i] = amplitude * (normalizedTime < duty ? 1 : -1);
                break;
            case 'triangle':
                const trianglePeriod = 1 / frequency;
                const normalizedTriangleTime = (t % trianglePeriod) / trianglePeriod;
                timeData[i] = amplitude * (normalizedTriangleTime < 0.5 ? 
                    4 * normalizedTriangleTime - 1 : 3 - 4 * normalizedTriangleTime);
                break;
            case 'sawtooth':
                const sawPeriod = 1 / frequency;
                const normalizedSawTime = (t % sawPeriod) / sawPeriod;
                timeData[i] = amplitude * (2 * normalizedSawTime - 1);
                break;
            case 'pulse':
                const pulseDuty = parseFloat(document.getElementById('fourier-signal-duty').value) / 100;
                const pulsePeriod = 1 / frequency;
                const normalizedPulseTime = (t % pulsePeriod) / pulsePeriod;
                timeData[i] = amplitude * (normalizedPulseTime < pulseDuty ? 1 : 0);
                break;
            case 'noise':
                timeData[i] = amplitude * (Math.random() * 2 - 1);
                break;
            case 'custom':
                const customExpr = document.getElementById('fourier-signal-custom').value;
                if (!customExpr) {
                    throw new Error('カスタム信号式を入力してください');
                }
                const customFunc = math.compile(customExpr);
                timeData[i] = customFunc.evaluate({t: t});
                break;
            default:
                throw new Error('未対応の信号タイプです');
        }
    }
    
    return [timeData, samplingRate];
}

/**
 * 高速フーリエ変換（FFT）を計算
 */
function computeFFT(timeData) {
    // 入力データの長さが2のべき乗であることを確認
    const n = timeData.length;
    if ((n & (n - 1)) !== 0) {
        throw new Error('FFTの入力データは2のべき乗の長さである必要があります');
    }
    
    // 複素数配列に変換
    const complexData = timeData.map(x => ({re: x, im: 0}));
    
    // FFTの実行
    const fftResult = fft(complexData);
    
    // 振幅と位相を計算
    const magnitudes = fftResult.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
    const phases = fftResult.map(c => Math.atan2(c.im, c.re));
    
    return {
        complex: fftResult,
        magnitudes: magnitudes,
        phases: phases,
        length: n
    };
}

/**
 * 離散フーリエ変換（DFT）を計算
 */
function computeDFT(timeData) {
    const n = timeData.length;
    const result = new Array(n);
    
    for (let k = 0; k < n; k++) {
        let sumReal = 0;
        let sumImag = 0;
        
        for (let t = 0; t < n; t++) {
            const angle = 2 * Math.PI * k * t / n;
            sumReal += timeData[t] * Math.cos(angle);
            sumImag -= timeData[t] * Math.sin(angle);
        }
        
        result[k] = {
            re: sumReal,
            im: sumImag
        };
    }
    
    // 振幅と位相を計算
    const magnitudes = result.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
    const phases = result.map(c => Math.atan2(c.im, c.re));
    
    return {
        complex: result,
        magnitudes: magnitudes,
        phases: phases,
        length: n
    };
}

/**
 * 短時間フーリエ変換（STFT）を計算
 */
function computeSTFT(timeData, samplingRate) {
    const windowSize = parseInt(document.getElementById('fourier-stft-window-size').value);
    const overlap = parseInt(document.getElementById('fourier-stft-overlap').value) / 100;
    
    if (isNaN(windowSize) || windowSize < 16 || windowSize > 4096) {
        throw new Error('窓サイズは16から4096の間で指定してください');
    }
    
    if (isNaN(overlap) || overlap < 0 || overlap >= 1) {
        throw new Error('オーバーラップは0%から99%の間で指定してください');
    }
    
    const hopSize = Math.floor(windowSize * (1 - overlap));
    const numFrames = Math.floor((timeData.length - windowSize) / hopSize) + 1;
    
    // 窓関数（ハニング窓）
    const window = new Array(windowSize);
    for (let i = 0; i < windowSize; i++) {
        window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (windowSize - 1)));
    }
    
    // 各フレームのFFTを計算
    const stftResult = new Array(numFrames);
    const timePoints = new Array(numFrames);
    
    for (let frame = 0; frame < numFrames; frame++) {
        const startIdx = frame * hopSize;
        const frameData = new Array(windowSize);
        
        // 窓関数を適用
        for (let i = 0; i < windowSize; i++) {
            frameData[i] = timeData[startIdx + i] * window[i];
        }
        
        // このフレームのFFTを計算
        const paddedLength = Math.pow(2, Math.ceil(Math.log2(windowSize)));
        const paddedFrame = new Array(paddedLength).fill(0);
        for (let i = 0; i < windowSize; i++) {
            paddedFrame[i] = frameData[i];
        }
        
        const frameFFT = computeFFT(paddedFrame);
        stftResult[frame] = frameFFT.magnitudes.slice(0, paddedLength / 2);
        
        // このフレームの時間点
        timePoints[frame] = startIdx / samplingRate;
    }
    
    // 周波数ビンを計算
    const freqBins = new Array(Math.floor(paddedLength / 2));
    for (let i = 0; i < freqBins.length; i++) {
        freqBins[i] = i * samplingRate / paddedLength;
    }
    
    return {
        stft: stftResult,
        times: timePoints,
        frequencies: freqBins,
        windowSize: windowSize,
        hopSize: hopSize,
        samplingRate: samplingRate
    };
}

/**
 * ウェーブレット変換を計算
 */
function computeWaveletTransform(timeData, samplingRate) {
    const waveletType = document.getElementById('fourier-wavelet-type').value;
    
    // 簡易的なウェーブレット変換の実装
    // 実際の実装ではより複雑なアルゴリズムが必要
    
    const n = timeData.length;
    const scales = Math.min(10, Math.floor(Math.log2(n)));
    const result = new Array(scales);
    
    for (let scale = 1; scale <= scales; scale++) {
        const scaleResult = new Array(n);
        const waveletWidth = Math.pow(2, scale);
        
        for (let i = 0; i < n; i++) {
            let sum = 0;
            
            for (let j = Math.max(0, i - waveletWidth); j < Math.min(n, i + waveletWidth); j++) {
                const distance = Math.abs(i - j) / waveletWidth;
                let waveletValue;
                
                switch (waveletType) {
                    case 'haar':
                        waveletValue = distance < 0.5 ? 1 : -1;
                        break;
                    case 'mexh':
                        // メキシカンハット（簡易版）
                        waveletValue = (1 - distance * distance) * Math.exp(-distance * distance / 2);
                        break;
                    case 'morl':
                        // モルレット（簡易版）
                        waveletValue = Math.cos(5 * distance) * Math.exp(-distance * distance / 2);
                        break;
                    default:
                        // デフォルトはHaar
                        waveletValue = distance < 0.5 ? 1 : -1;
                }
                
                sum += timeData[j] * waveletValue;
            }
            
            scaleResult[i] = sum / Math.sqrt(waveletWidth);
        }
        
        result[scale - 1] = scaleResult;
    }
    
    return {
        wavelet: result,
        scales: scales,
        samplingRate: samplingRate,
        waveletType: waveletType
    };
}

/**
 * 逆高速フーリエ変換（IFFT）を計算
 */
function computeInverseFFT(fftResult) {
    const n = fftResult.length;
    
    // 複素共役を取る
    const conjugated = fftResult.complex.map(c => ({re: c.re, im: -c.im}));
    
    // FFTを適用
    const ifftResult = fft(conjugated);
    
    // スケーリングと実部の取り出し
    const timeData = ifftResult.map(c => c.re / n);
    
    return timeData;
}

/**
 * 逆離散フーリエ変換（IDFT）を計算
 */
function computeInverseDFT(dftResult) {
    const n = dftResult.length;
    const result = new Array(n);
    
    for (let t = 0; t < n; t++) {
        let sum = 0;
        
        for (let k = 0; k < n; k++) {
            const angle = 2 * Math.PI * k * t / n;
            sum += dftResult.complex[k].re * Math.cos(angle) - dftResult.complex[k].im * Math.sin(angle);
        }
        
        result[t] = sum / n;
    }
    
    return result;
}

/**
 * フィルタを適用
 */
function applyFilter(transformResult, filterType, samplingRate) {
    const n = transformResult.length;
    const nyquist = samplingRate / 2;
    
    // フィルタ関数の作成
    let filterFunc;
    
    switch (filterType) {
        case 'lowpass':
            const lowCutoff = parseFloat(document.getElementById('fourier-filter-cutoff').value);
            if (isNaN(lowCutoff) || lowCutoff <= 0 || lowCutoff >= nyquist) {
                throw new Error('有効なカットオフ周波数を指定してください');
            }
            filterFunc = f => f <= lowCutoff ? 1 : 0;
            break;
        
        case 'highpass':
            const highCutoff = parseFloat(document.getElementById('fourier-filter-cutoff').value);
            if (isNaN(highCutoff) || highCutoff <= 0 || highCutoff >= nyquist) {
                throw new Error('有効なカットオフ周波数を指定してください');
            }
            filterFunc = f => f >= highCutoff ? 1 : 0;
            break;
        
        case 'bandpass':
            const lowBand = parseFloat(document.getElementById('fourier-filter-low-cutoff').value);
            const highBand = parseFloat(document.getElementById('fourier-filter-high-cutoff').value);
            if (isNaN(lowBand) || isNaN(highBand) || lowBand >= highBand || lowBand <= 0 || highBand >= nyquist) {
                throw new Error('有効な周波数帯域を指定してください');
            }
            filterFunc = f => (f >= lowBand && f <= highBand) ? 1 : 0;
            break;
        
        case 'bandstop':
            const lowStop = parseFloat(document.getElementById('fourier-filter-low-cutoff').value);
            const highStop = parseFloat(document.getElementById('fourier-filter-high-cutoff').value);
            if (isNaN(lowStop) || isNaN(highStop) || lowStop >= highStop || lowStop <= 0 || highStop >= nyquist) {
                throw new Error('有効な周波数帯域を指定してください');
            }
            filterFunc = f => (f <= lowStop || f >= highStop) ? 1 : 0;
            break;
        
        case 'custom':
            const customExpr = document.getElementById('fourier-filter-custom').value;
            if (!customExpr) {
                throw new Error('カスタムフィルタ関数を入力してください');
            }
            const customFunc = math.compile(customExpr);
            filterFunc = f => {
                try {
                    return customFunc.evaluate({f: f});
                } catch (e) {
                    console.error('カスタムフィルタ評価エラー:', e);
                    return 0;
                }
            };
            break;
        
        default:
            throw new Error('未対応のフィルタタイプです');
    }
    
    // フィルタの適用
    const filteredComplex = transformResult.complex.map((c, i) => {
        const freq = i <= n/2 ? i * samplingRate / n : (i - n) * samplingRate / n;
        const absFreq = Math.abs(freq);
        const gain = filterFunc(absFreq);
        
        return {
            re: c.re * gain,
            im: c.im * gain
        };
    });
    
    // 振幅と位相を再計算
    const filteredMagnitudes = filteredComplex.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
    const filteredPhases = filteredComplex.map(c => Math.atan2(c.im, c.re));
    
    return {
        complex: filteredComplex,
        magnitudes: filteredMagnitudes,
        phases: filteredPhases,
        length: n,
        filterType: filterType
    };
}

/**
 * フーリエ変換結果を表示
 */
function displayFourierResults(timeData, transformResult, samplingRate) {
    const transformType = document.getElementById('fourier-transform-type').value;
    const filterType = document.getElementById('fourier-filter-type').value;
    
    let resultHTML = '';
    
    switch (transformType) {
        case 'fft':
        case 'dft':
            const n = transformResult.length;
            const nyquist = samplingRate / 2;
            
            // 主要な周波数成分を抽出
            const significantFreqs = [];
            for (let i = 1; i < n/2; i++) {
                const freq = i * samplingRate / n;
                const magnitude = transformResult.magnitudes[i];
                const phase = transformResult.phases[i];
                
                // 振幅が閾値以上の成分を抽出
                const threshold = Math.max(...transformResult.magnitudes) * 0.05;
                if (magnitude > threshold) {
                    significantFreqs.push({
                        frequency: freq.toFixed(2),
                        magnitude: magnitude.toFixed(4),
                        phase: (phase * 180 / Math.PI).toFixed(2)
                    });
                }
            }
            
            // 最大5つの主要成分を表示
            significantFreqs.sort((a, b) => parseFloat(b.magnitude) - parseFloat(a.magnitude));
            const topFreqs = significantFreqs.slice(0, 5);
            
            resultHTML = `
                <div class="result-success">
                    <h4>${transformType === 'fft' ? '高速フーリエ変換' : '離散フーリエ変換'}の結果:</h4>
                    <p>サンプル数: ${timeData.length}</p>
                    <p>サンプリングレート: ${samplingRate.toFixed(2)} Hz</p>
                    <p>ナイキスト周波数: ${nyquist.toFixed(2)} Hz</p>
                    <p>周波数分解能: ${(samplingRate / n).toFixed(4)} Hz</p>
                    
                    ${filterType !== 'none' ? `<p>適用フィルタ: ${getFilterTypeName(filterType)}</p>` : ''}
                    
                    <h4>主要な周波数成分:</h4>
                    <table class="result-table">
                        <tr>
                            <th>周波数 (Hz)</th>
                            <th>振幅</th>
                            <th>位相 (度)</th>
                        </tr>
                        ${topFreqs.map(f => `
                            <tr>
                                <td>${f.frequency}</td>
                                <td>${f.magnitude}</td>
                                <td>${f.phase}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
            break;
        
        case 'stft':
            resultHTML = `
                <div class="result-success">
                    <h4>短時間フーリエ変換の結果:</h4>
                    <p>サンプル数: ${timeData.length}</p>
                    <p>サンプリングレート: ${samplingRate.toFixed(2)} Hz</p>
                    <p>窓サイズ: ${transformResult.windowSize}</p>
                    <p>ホップサイズ: ${transformResult.hopSize}</p>
                    <p>時間フレーム数: ${transformResult.times.length}</p>
                    <p>周波数ビン数: ${transformResult.frequencies.length}</p>
                    
                    ${filterType !== 'none' ? `<p>適用フィルタ: ${getFilterTypeName(filterType)}</p>` : ''}
                </div>
            `;
            break;
        
        case 'wavelet':
            resultHTML = `
                <div class="result-success">
                    <h4>ウェーブレット変換の結果:</h4>
                    <p>サンプル数: ${timeData.length}</p>
                    <p>サンプリングレート: ${samplingRate.toFixed(2)} Hz</p>
                    <p>ウェーブレットタイプ: ${getWaveletTypeName(transformResult.waveletType)}</p>
                    <p>スケール数: ${transformResult.scales}</p>
                    
                    ${filterType !== 'none' ? `<p>適用フィルタ: ${getFilterTypeName(filterType)}</p>` : ''}
                </div>
            `;
            break;
    }
    
    document.getElementById('fourier-output').innerHTML = resultHTML;
}

/**
 * 逆フーリエ変換結果を表示
 */
function displayInverseFourierResults(timeData, transformResult, inverseResult, samplingRate) {
    const transformType = document.getElementById('fourier-transform-type').value;
    
    // 元の信号と再構成信号の誤差を計算
    let mse = 0;
    for (let i = 0; i < Math.min(timeData.length, inverseResult.length); i++) {
        mse += Math.pow(timeData[i] - inverseResult[i], 2);
    }
    mse /= Math.min(timeData.length, inverseResult.length);
    
    const resultHTML = `
        <div class="result-success">
            <h4>逆${transformType === 'fft' ? '高速フーリエ変換' : '離散フーリエ変換'}の結果:</h4>
            <p>サンプル数: ${inverseResult.length}</p>
            <p>サンプリングレート: ${samplingRate.toFixed(2)} Hz</p>
            <p>平均二乗誤差 (MSE): ${mse.toExponential(4)}</p>
            <p>信号対雑音比 (SNR): ${(10 * Math.log10(getSignalPower(timeData) / mse)).toFixed(2)} dB</p>
        </div>
    `;
    
    document.getElementById('fourier-output').innerHTML = resultHTML;
}

/**
 * 信号のパワーを計算
 */
function getSignalPower(signal) {
    let power = 0;
    for (let i = 0; i < signal.length; i++) {
        power += signal[i] * signal[i];
    }
    return power / signal.length;
}

/**
 * フーリエ変換結果を可視化
 */
function visualizeFourierResults(timeData, transformResult, samplingRate) {
    const transformType = document.getElementById('fourier-transform-type').value;
    
    // 時間領域の可視化
    visualizeTimeData(timeData, samplingRate);
    
    // 周波数領域の可視化
    switch (transformType) {
        case 'fft':
        case 'dft':
            visualizeFrequencyData(transformResult, samplingRate);
            break;
        case 'stft':
            visualizeSTFT(transformResult);
            break;
        case 'wavelet':
            visualizeWavelet(transformResult, samplingRate);
            break;
    }
}

/**
 * 逆フーリエ変換結果を可視化
 */
function visualizeInverseFourierResults(timeData, transformResult, inverseResult, samplingRate) {
    // 時間領域の可視化（元の信号と再構成信号）
    visualizeTimeDataComparison(timeData, inverseResult, samplingRate);
    
    // 周波数領域の可視化
    visualizeFrequencyData(transformResult, samplingRate);
}

/**
 * 時間領域データを可視化
 */
function visualizeTimeData(timeData, samplingRate) {
    const n = timeData.length;
    const timePoints = new Array(n);
    
    for (let i = 0; i < n; i++) {
        timePoints[i] = i / samplingRate;
    }
    
    const trace = {
        x: timePoints,
        y: timeData,
        type: 'scatter',
        mode: 'lines',
        name: '時間領域信号',
        line: {
            color: 'blue',
            width: 2
        }
    };
    
    const layout = {
        title: '時間領域信号',
        xaxis: {
            title: '時間 (秒)'
        },
        yaxis: {
            title: '振幅'
        },
        showlegend: true
    };
    
    Plotly.newPlot('fourier-time-visualization', [trace], layout);
}

/**
 * 時間領域データの比較を可視化（元の信号と再構成信号）
 */
function visualizeTimeDataComparison(originalData, reconstructedData, samplingRate) {
    const n = Math.min(originalData.length, reconstructedData.length);
    const timePoints = new Array(n);
    
    for (let i = 0; i < n; i++) {
        timePoints[i] = i / samplingRate;
    }
    
    const traceOriginal = {
        x: timePoints,
        y: originalData.slice(0, n),
        type: 'scatter',
        mode: 'lines',
        name: '元の信号',
        line: {
            color: 'blue',
            width: 2
        }
    };
    
    const traceReconstructed = {
        x: timePoints,
        y: reconstructedData.slice(0, n),
        type: 'scatter',
        mode: 'lines',
        name: '再構成信号',
        line: {
            color: 'red',
            width: 2,
            dash: 'dash'
        }
    };
    
    const layout = {
        title: '時間領域信号の比較',
        xaxis: {
            title: '時間 (秒)'
        },
        yaxis: {
            title: '振幅'
        },
        showlegend: true
    };
    
    Plotly.newPlot('fourier-time-visualization', [traceOriginal, traceReconstructed], layout);
}

/**
 * 周波数領域データを可視化
 */
function visualizeFrequencyData(transformResult, samplingRate) {
    const n = transformResult.length;
    const freqPoints = new Array(Math.floor(n/2));
    const magnitudes = new Array(Math.floor(n/2));
    
    for (let i = 0; i < Math.floor(n/2); i++) {
        freqPoints[i] = i * samplingRate / n;
        magnitudes[i] = transformResult.magnitudes[i];
    }
    
    const trace = {
        x: freqPoints,
        y: magnitudes,
        type: 'scatter',
        mode: 'lines',
        name: '振幅スペクトル',
        line: {
            color: 'red',
            width: 2
        }
    };
    
    const layout = {
        title: '周波数領域（振幅スペクトル）',
        xaxis: {
            title: '周波数 (Hz)'
        },
        yaxis: {
            title: '振幅'
        },
        showlegend: true
    };
    
    Plotly.newPlot('fourier-freq-visualization', [trace], layout);
}

/**
 * STFTを可視化（スペクトログラム）
 */
function visualizeSTFT(stftResult) {
    const data = [{
        z: stftResult.stft,
        x: stftResult.times,
        y: stftResult.frequencies,
        type: 'heatmap',
        colorscale: 'Viridis',
        colorbar: {
            title: '振幅'
        }
    }];
    
    const layout = {
        title: 'スペクトログラム',
        xaxis: {
            title: '時間 (秒)'
        },
        yaxis: {
            title: '周波数 (Hz)'
        }
    };
    
    Plotly.newPlot('fourier-freq-visualization', data, layout);
}

/**
 * ウェーブレット変換を可視化
 */
function visualizeWavelet(waveletResult, samplingRate) {
    const n = waveletResult.wavelet[0].length;
    const timePoints = new Array(n);
    
    for (let i = 0; i < n; i++) {
        timePoints[i] = i / samplingRate;
    }
    
    // スケールごとの係数をプロット
    const data = [];
    
    for (let scale = 0; scale < waveletResult.scales; scale++) {
        data.push({
            x: timePoints,
            y: waveletResult.wavelet[scale],
            type: 'scatter',
            mode: 'lines',
            name: `スケール ${scale + 1}`,
            line: {
                width: 1
            }
        });
    }
    
    const layout = {
        title: 'ウェーブレット変換',
        xaxis: {
            title: '時間 (秒)'
        },
        yaxis: {
            title: '係数'
        },
        showlegend: true
    };
    
    Plotly.newPlot('fourier-freq-visualization', data, layout);
}

/**
 * フーリエ変換のLaTeX表示
 */
function displayFourierLatex() {
    const inputType = document.getElementById('fourier-input-type').value;
    const transformType = document.getElementById('fourier-transform-type').value;
    
    let latexStr = '';
    
    try {
        switch (transformType) {
            case 'fft':
            case 'dft':
                latexStr = getFourierTransformLatex();
                break;
            case 'stft':
                latexStr = getSTFTLatex();
                break;
            case 'wavelet':
                latexStr = getWaveletTransformLatex();
                break;
            default:
                throw new Error('未対応の変換タイプです');
        }
        
        // LaTeX表示
        document.getElementById('fourier-latex').innerHTML = latexStr;
        
        // MathJaxで再レンダリング
        if (window.MathJax) {
            MathJax.typesetPromise([document.getElementById('fourier-latex')]).catch(function (err) {
                console.error('MathJax error:', err);
            });
        }
        
    } catch (e) {
        console.error('LaTeX生成エラー:', e);
        document.getElementById('fourier-latex').innerHTML = `
            <div class="result-error">
                <p>LaTeX生成エラー: ${e.message}</p>
            </div>
        `;
    }
}

/**
 * フーリエ変換のLaTeX表現を取得
 */
function getFourierTransformLatex() {
    const inputType = document.getElementById('fourier-input-type').value;
    let funcExpr = '';
    
    switch (inputType) {
        case 'function':
            funcExpr = document.getElementById('fourier-function').value;
            break;
        case 'signal':
            const signalType = document.getElementById('fourier-signal-type').value;
            const frequency = document.getElementById('fourier-signal-frequency').value;
            const amplitude = document.getElementById('fourier-signal-amplitude').value;
            
            switch (signalType) {
                case 'sine':
                    funcExpr = `${amplitude} \\sin(2\\pi ${frequency} t)`;
                    break;
                case 'square':
                    funcExpr = `${amplitude} \\operatorname{sgn}(\\sin(2\\pi ${frequency} t))`;
                    break;
                case 'triangle':
                    funcExpr = `${amplitude} \\operatorname{tri}(2\\pi ${frequency} t)`;
                    break;
                case 'sawtooth':
                    funcExpr = `${amplitude} \\operatorname{saw}(2\\pi ${frequency} t)`;
                    break;
                default:
                    funcExpr = 'f(t)';
            }
            break;
        default:
            funcExpr = 'f(t)';
    }
    
    return `
        \\begin{align}
        \\text{時間領域信号:} & \\quad f(t) = ${funcExpr} \\\\
        \\text{フーリエ変換:} & \\quad F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt \\\\
        \\text{離散フーリエ変換:} & \\quad X[k] = \\sum_{n=0}^{N-1} x[n] e^{-i2\\pi kn/N} \\\\
        \\end{align}
    `;
}

/**
 * STFTのLaTeX表現を取得
 */
function getSTFTLatex() {
    return `
        \\begin{align}
        \\text{短時間フーリエ変換:} & \\quad \\text{STFT}\\{x(t)\\}(\\tau, \\omega) = \\int_{-\\infty}^{\\infty} x(t) w(t-\\tau) e^{-i\\omega t} dt \\\\
        \\text{離散STFT:} & \\quad \\text{STFT}\\{x[n]\\}(m, k) = \\sum_{n=0}^{N-1} x[n] w[n-m] e^{-i2\\pi kn/N} \\\\
        \\end{align}
    `;
}

/**
 * ウェーブレット変換のLaTeX表現を取得
 */
function getWaveletTransformLatex() {
    const waveletType = document.getElementById('fourier-wavelet-type').value;
    let waveletExpr = '';
    
    switch (waveletType) {
        case 'haar':
            waveletExpr = '\\psi(t) = \\begin{cases} 1 & 0 \\leq t < 1/2 \\\\ -1 & 1/2 \\leq t < 1 \\\\ 0 & \\text{otherwise} \\end{cases}';
            break;
        case 'mexh':
            waveletExpr = '\\psi(t) = (1 - t^2) e^{-t^2/2}';
            break;
        case 'morl':
            waveletExpr = '\\psi(t) = e^{-t^2/2} \\cos(5t)';
            break;
        default:
            waveletExpr = '\\psi(t)';
    }
    
    return `
        \\begin{align}
        \\text{ウェーブレット関数:} & \\quad ${waveletExpr} \\\\
        \\text{連続ウェーブレット変換:} & \\quad \\text{CWT}\\{x(t)\\}(a, b) = \\frac{1}{\\sqrt{a}} \\int_{-\\infty}^{\\infty} x(t) \\psi^*\\left(\\frac{t-b}{a}\\right) dt \\\\
        \\end{align}
    `;
}

/**
 * フーリエ変換結果をエクスポート
 */
function exportFourierResults() {
    const transformType = document.getElementById('fourier-transform-type').value;
    const format = document.getElementById('setting-export-format')?.value || 'csv';
    
    try {
        // 現在の結果を取得（グローバル変数または状態管理が必要）
        // この例では簡略化のため、新たに変換を行います
        const inputType = document.getElementById('fourier-input-type').value;
        let inputData, samplingRate;
        
        // 入力データの取得
        switch (inputType) {
            case 'function':
                [inputData, samplingRate] = getFunctionInputData();
                break;
            case 'data':
                [inputData, samplingRate] = getDataInputData();
                break;
            case 'signal':
                [inputData, samplingRate] = getSignalInputData();
                break;
            default:
                throw new Error('この入力タイプではエクスポートできません');
        }
        
        // フーリエ変換の実行
        let transformResult;
        switch (transformType) {
            case 'fft':
                transformResult = computeFFT(inputData);
                break;
            case 'dft':
                transformResult = computeDFT(inputData);
                break;
            case 'stft':
                transformResult = computeSTFT(inputData, samplingRate);
                break;
            case 'wavelet':
                transformResult = computeWaveletTransform(inputData, samplingRate);
                break;
            default:
                throw new Error('この変換タイプではエクスポートできません');
        }
        
        // エクスポートデータの準備
        let exportData;
        let filename;
        
        switch (transformType) {
            case 'fft':
            case 'dft':
                exportData = prepareFrequencyExportData(inputData, transformResult, samplingRate);
                filename = `fourier_transform_${transformType}`;
                break;
            case 'stft':
                exportData = prepareSTFTExportData(transformResult);
                filename = 'stft_result';
                break;
            case 'wavelet':
                exportData = prepareWaveletExportData(transformResult, samplingRate);
                filename = 'wavelet_transform';
                break;
            default:
                throw new Error('この変換タイプではエクスポートできません');
        }
        
        // 選択された形式でエクスポート
        switch (format) {
            case 'csv':
                exportCSV(exportData, filename);
                break;
            case 'json':
                exportJSON(exportData, filename);
                break;
            case 'latex':
                exportLaTeX(transformType, filename);
                break;
            default:
                throw new Error('未対応のエクスポート形式です');
        }
        
    } catch (e) {
        console.error('エクスポートエラー:', e);
        showNotification('エクスポートエラー: ' + e.message, 'error');
    }
}

/**
 * 周波数データのエクスポート用データを準備
 */
function prepareFrequencyExportData(timeData, transformResult, samplingRate) {
    const n = transformResult.length;
    const result = [];
    
    // ヘッダー行
    result.push(['Index', 'Time (s)', 'Signal', 'Frequency (Hz)', 'Magnitude', 'Phase (rad)']);
    
    // データ行
    for (let i = 0; i < n; i++) {
        const time = i / samplingRate;
        const freq = i <= n/2 ? i * samplingRate / n : (i - n) * samplingRate / n;
        
        result.push([
            i,
            time.toFixed(6),
            timeData[i].toFixed(6),
            Math.abs(freq).toFixed(6),
            transformResult.magnitudes[i].toFixed(6),
            transformResult.phases[i].toFixed(6)
        ]);
    }
    
    return result;
}

/**
 * STFT結果のエクスポート用データを準備
 */
function prepareSTFTExportData(stftResult) {
    const result = [];
    
    // ヘッダー行（時間点）
    const header = ['Frequency (Hz)'];
    stftResult.times.forEach(time => {
        header.push(`Time ${time.toFixed(4)} s`);
    });
    result.push(header);
    
    // データ行（各周波数ビンの振幅）
    for (let i = 0; i < stftResult.frequencies.length; i++) {
        const row = [stftResult.frequencies[i].toFixed(4)];
        
        for (let j = 0; j < stftResult.times.length; j++) {
            row.push(stftResult.stft[j][i].toFixed(6));
        }
        
        result.push(row);
    }
    
    return result;
}

/**
 * ウェーブレット変換結果のエクスポート用データを準備
 */
function prepareWaveletExportData(waveletResult, samplingRate) {
    const result = [];
    
    // 時間点の計算
    const n = waveletResult.wavelet[0].length;
    const timePoints = new Array(n);
    for (let i = 0; i < n; i++) {
        timePoints[i] = i / samplingRate;
    }
    
    // ヘッダー行
    const header = ['Time (s)'];
    for (let scale = 0; scale < waveletResult.scales; scale++) {
        header.push(`Scale ${scale + 1}`);
    }
    result.push(header);
    
    // データ行
    for (let i = 0; i < n; i++) {
        const row = [timePoints[i].toFixed(6)];
        
        for (let scale = 0; scale < waveletResult.scales; scale++) {
            row.push(waveletResult.wavelet[scale][i].toFixed(6));
        }
        
        result.push(row);
    }
    
    return result;
}

/**
 * CSVとしてエクスポート
 */
function exportCSV(data, filename) {
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
    
    showNotification('CSVファイルとしてエクスポートしました', 'success');
}

/**
 * JSONとしてエクスポート
 */
function exportJSON(data, filename) {
    // ヘッダー行を取得
    const headers = data[0];
    
    // JSONオブジェクトの配列に変換
    const jsonData = [];
    for (let i = 1; i < data.length; i++) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = data[i][j];
        }
        jsonData.push(obj);
    }
    
    const jsonContent = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    saveAs(blob, `${filename}.json`);
    
    showNotification('JSONファイルとしてエクスポートしました', 'success');
}

/**
 * LaTeXとしてエクスポート
 */
function exportLaTeX(transformType, filename) {
    let latexContent = '';
    
    switch (transformType) {
        case 'fft':
        case 'dft':
            latexContent = getFourierTransformLatex();
            break;
        case 'stft':
            latexContent = getSTFTLatex();
            break;
        case 'wavelet':
            latexContent = getWaveletTransformLatex();
            break;
    }
    
    const fullLatex = `
\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\title{フーリエ変換結果}
\\author{数学計算ツール}
\\begin{document}
\\maketitle

${latexContent}

\\end{document}
`;
    
    const blob = new Blob([fullLatex], { type: 'application/x-tex;charset=utf-8;' });
    saveAs(blob, `${filename}.tex`);
    
    showNotification('LaTeXファイルとしてエクスポートしました', 'success');
}

/**
 * フィルタタイプの名前を取得
 */
function getFilterTypeName(filterType) {
    switch (filterType) {
        case 'lowpass': return 'ローパスフィルタ';
        case 'highpass': return 'ハイパスフィルタ';
        case 'bandpass': return 'バンドパスフィルタ';
        case 'bandstop': return 'バンドストップフィルタ';
        case 'custom': return 'カスタムフィルタ';
        default: return filterType;
    }
}

/**
 * ウェーブレットタイプの名前を取得
 */
function getWaveletTypeName(waveletType) {
    switch (waveletType) {
        case 'haar': return 'Haar';
        case 'db4': return 'Daubechies 4';
        case 'sym4': return 'Symlet 4';
        case 'coif1': return 'Coiflet 1';
        case 'mexh': return 'Mexican Hat';
        case 'morl': return 'Morlet';
        default: return waveletType;
    }
}

/**
 * 高速フーリエ変換（FFT）の実装
 * Cooley-Tukey FFTアルゴリズム
 */
function fft(x) {
    const n = x.length;
    
    // 長さが1の場合は変換不要
    if (n === 1) {
        return [x[0]];
    }
    
    // 長さが2のべき乗でない場合はエラー
    if ((n & (n - 1)) !== 0) {
        throw new Error('FFTの入力データは2のべき乗の長さである必要があります');
    }
    
    // 偶数インデックスと奇数インデックスに分割
    const even = new Array(n / 2);
    const odd = new Array(n / 2);
    
    for (let i = 0; i < n / 2; i++) {
        even[i] = x[i * 2];
        odd[i] = x[i * 2 + 1];
    }
    
    // 再帰的にFFTを適用
    const evenFFT = fft(even);
    const oddFFT = fft(odd);
    
    // 結果を結合
    const result = new Array(n);
    
    for (let k = 0; k < n / 2; k++) {
        const angle = -2 * Math.PI * k / n;
        const t = {
            re: Math.cos(angle),
            im: Math.sin(angle)
        };
        
        // 複素数乗算
        const oddTerm = {
            re: t.re * oddFFT[k].re - t.im * oddFFT[k].im,
            im: t.re * oddFFT[k].im + t.im * oddFFT[k].re
        };
        
        // 結果の計算
        result[k] = {
            re: evenFFT[k].re + oddTerm.re,
            im: evenFFT[k].im + oddTerm.im
        };
        
        result[k + n / 2] = {
            re: evenFFT[k].re - oddTerm.re,
            im: evenFFT[k].im - oddTerm.im
        };
    }
    
    return result;
}

/**
 * 通知を表示
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    notificationMessage.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}



