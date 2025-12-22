/**
 * calculus.js - 微積分関連の計算機能
 * 数値微分、数値積分、極限計算などの機能を提供
 */

document.addEventListener('DOMContentLoaded', function() {
    // 数値積分タブの初期化
    initIntegrationTab();
    
    // イベントリスナーの設定
    document.getElementById('integration-calc-btn').addEventListener('click', calculateIntegral);
    document.getElementById('integration-latex-btn').addEventListener('click', displayIntegralLatex);
    document.getElementById('integration-visualize-btn').addEventListener('click', visualizeIntegral);
    document.getElementById('integration-type').addEventListener('change', handleIntegrationTypeChange);
});

/**
 * 数値積分タブの初期化
 */
function initIntegrationTab() {
    // 積分タイプの変更ハンドラを一度呼び出して初期状態を設定
    handleIntegrationTypeChange();
    
    // 積分方法のデフォルト値を設定
    document.getElementById('integration-method').value = 'simpson';
    document.getElementById('integration-points').value = '1000';
}

/**
 * 積分タイプの変更ハンドラ
 */
function handleIntegrationTypeChange() {
    const integrationType = document.getElementById('integration-type').value;
    
    // すべての積分入力フォームを非表示
    document.querySelectorAll('.integration-input').forEach(el => {
        el.style.display = 'none';
    });
    
    // 選択された積分タイプの入力フォームを表示
    document.getElementById(`${integrationType}-integral-input`).style.display = 'block';
    
    // 線積分タイプの追加処理
    if (integrationType === 'line') {
        document.getElementById('line-integral-type').addEventListener('change', function() {
            const lineIntegralType = this.value;
            if (lineIntegralType === 'scalar') {
                document.getElementById('line-integral-scalar-input').style.display = 'block';
                document.getElementById('line-integral-vector-input').style.display = 'none';
            } else {
                document.getElementById('line-integral-scalar-input').style.display = 'none';
                document.getElementById('line-integral-vector-input').style.display = 'block';
            }
        });
        // 初期状態を設定
        document.getElementById('line-integral-type').dispatchEvent(new Event('change'));
    }
    
    // 面積分タイプの追加処理
    if (integrationType === 'surface') {
        document.getElementById('surface-integral-type').addEventListener('change', function() {
            const surfaceIntegralType = this.value;
            if (surfaceIntegralType === 'scalar') {
                document.getElementById('surface-integral-scalar-input').style.display = 'block';
                document.getElementById('surface-integral-vector-input').style.display = 'none';
            } else {
                document.getElementById('surface-integral-scalar-input').style.display = 'none';
                document.getElementById('surface-integral-vector-input').style.display = 'block';
            }
        });
        
        document.getElementById('surface-integral-surface-type').addEventListener('change', function() {
            const surfaceType = this.value;
            document.getElementById('surface-integral-parametric-input').style.display = 'none';
            document.getElementById('surface-integral-explicit-input').style.display = 'none';
            document.getElementById('surface-integral-implicit-input').style.display = 'none';
            
            document.getElementById(`surface-integral-${surfaceType}-input`).style.display = 'block';
        });
        
        // 初期状態を設定
        document.getElementById('surface-integral-type').dispatchEvent(new Event('change'));
        document.getElementById('surface-integral-surface-type').dispatchEvent(new Event('change'));
    }
}

/**
 * 積分計算を実行
 */
function calculateIntegral() {
    const integrationType = document.getElementById('integration-type').value;
    const method = document.getElementById('integration-method').value;
    const points = parseInt(document.getElementById('integration-points').value);
    
    let result, error;
    
    try {
        switch (integrationType) {
            case 'definite':
                result = calculateDefiniteIntegral(method, points);
                break;
            case 'double':
                result = calculateDoubleIntegral(method, points);
                break;
            case 'triple':
                result = calculateTripleIntegral(method, points);
                break;
            case 'line':
                result = calculateLineIntegral(method, points);
                break;
            case 'surface':
                result = calculateSurfaceIntegral(method, points);
                break;
            case 'improper':
                result = calculateImproperIntegral(method, points);
                break;
            default:
                throw new Error('未対応の積分タイプです');
        }
        
        // 結果の表示
        document.getElementById('integration-output').innerHTML = `
            <div class="result-success">
                <h4>積分結果:</h4>
                <p class="result-value">${result.toFixed(10)}</p>
                <p class="result-info">使用した方法: ${getMethodName(method)}</p>
                <p class="result-info">分割数: ${points}</p>
            </div>
        `;
        
    } catch (e) {
        console.error('積分計算エラー:', e);
        document.getElementById('integration-output').innerHTML = `
            <div class="result-error">
                <h4>エラー:</h4>
                <p>${e.message}</p>
            </div>
        `;
    }
}

/**
 * 定積分の計算
 */
function calculateDefiniteIntegral(method, points) {
    const expr = document.getElementById('definite-integral-expr').value;
    const range = document.getElementById('definite-integral-range').value.split(',');
    
    if (range.length !== 2) {
        throw new Error('積分範囲は2つの値（下限,上限）で指定してください');
    }
    
    const a = parseFloat(math.evaluate(range[0]));
    const b = parseFloat(math.evaluate(range[1]));
    
    if (isNaN(a) || isNaN(b)) {
        throw new Error('積分範囲に有効な数値を指定してください');
    }
    
    // 関数をコンパイル
    const f = math.compile(expr);
    
    // 選択された方法で積分を計算
    switch (method) {
        case 'rectangle':
            return rectangleMethod(f, a, b, points);
        case 'trapezoid':
            return trapezoidMethod(f, a, b, points);
        case 'simpson':
            return simpsonMethod(f, a, b, points);
        case 'romberg':
            return rombergMethod(f, a, b, 10); // 10回の反復
        case 'gauss':
            return gaussQuadrature(f, a, b, Math.min(points, 20)); // 最大20点
        case 'montecarlo':
            return monteCarloIntegration(f, a, b, points);
        default:
            throw new Error('未対応の積分方法です');
    }
}

/**
 * 二重積分の計算
 */
function calculateDoubleIntegral(method, points) {
    const expr = document.getElementById('double-integral-expr').value;
    const xRange = document.getElementById('double-integral-x-range').value.split(',');
    const yRange = document.getElementById('double-integral-y-range').value;
    
    if (xRange.length !== 2) {
        throw new Error('x範囲は2つの値（下限,上限）で指定してください');
    }
    
    const a = parseFloat(math.evaluate(xRange[0]));
    const b = parseFloat(math.evaluate(xRange[1]));
    
    if (isNaN(a) || isNaN(b)) {
        throw new Error('x範囲に有効な数値を指定してください');
    }
    
    // 関数をコンパイル
    const f = math.compile(expr);
    
    // y範囲が定数か関数かを判定
    if (yRange.includes('x')) {
        // y範囲が関数の場合
        const yRangeParts = yRange.split(',');
        if (yRangeParts.length !== 2) {
            throw new Error('y範囲は2つの式（下限,上限）で指定してください');
        }
        
        const g1 = math.compile(yRangeParts[0]);
        const g2 = math.compile(yRangeParts[1]);
        
        // 二重積分を計算（変数境界）
        return doubleIntegralVariableBounds(f, a, b, g1, g2, points);
    } else {
        // y範囲が定数の場合
        const yRangeParts = yRange.split(',');
        if (yRangeParts.length !== 2) {
            throw new Error('y範囲は2つの値（下限,上限）で指定してください');
        }
        
        const c = parseFloat(math.evaluate(yRangeParts[0]));
        const d = parseFloat(math.evaluate(yRangeParts[1]));
        
        if (isNaN(c) || isNaN(d)) {
            throw new Error('y範囲に有効な数値を指定してください');
        }
        
        // 二重積分を計算（定数境界）
        return doubleIntegralConstantBounds(f, a, b, c, d, points);
    }
}

// 以下、各種積分法の実装

/**
 * 長方形法による数値積分
 */
function rectangleMethod(f, a, b, n) {
    const h = (b - a) / n;
    let sum = 0;
    
    for (let i = 0; i < n; i++) {
        const x = a + (i + 0.5) * h; // 区間の中点
        sum += f.evaluate({x: x});
    }
    
    return h * sum;
}

/**
 * 台形法による数値積分
 */
function trapezoidMethod(f, a, b, n) {
    const h = (b - a) / n;
    let sum = 0.5 * (f.evaluate({x: a}) + f.evaluate({x: b}));
    
    for (let i = 1; i < n; i++) {
        const x = a + i * h;
        sum += f.evaluate({x: x});
    }
    
    return h * sum;
}

/**
 * シンプソン法による数値積分
 */
function simpsonMethod(f, a, b, n) {
    if (n % 2 !== 0) n++; // nを偶数に調整
    
    const h = (b - a) / n;
    let sum = f.evaluate({x: a}) + f.evaluate({x: b});
    
    for (let i = 1; i < n; i++) {
        const x = a + i * h;
        const coef = (i % 2 === 0) ? 2 : 4;
        sum += coef * f.evaluate({x: x});
    }
    
    return (h / 3) * sum;
}

/**
 * ロンバーグ積分法
 */
function rombergMethod(f, a, b, iterations) {
    const R = [];
    
    // 初期化
    for (let i = 0; i <= iterations; i++) {
        R[i] = [];
    }
    
    // 台形則の初期値
    R[0][0] = 0.5 * (b - a) * (f.evaluate({x: a}) + f.evaluate({x: b}));
    
    for (let i = 1; i <= iterations; i++) {
        // h = (b-a)/2^i
        let h = (b - a) / Math.pow(2, i);
        let sum = 0;
        
        // 新しい点での関数値の合計
        for (let k = 1; k <= Math.pow(2, i - 1); k++) {
            sum += f.evaluate({x: a + (2 * k - 1) * h});
        }
        
        // 台形則の改良
        R[i][0] = 0.5 * R[i-1][0] + h * sum;
        
        // リチャードソン外挿
        for (let j = 1; j <= i; j++) {
            R[i][j] = R[i][j-1] + (R[i][j-1] - R[i-1][j-1]) / (Math.pow(4, j) - 1);
        }
    }
    
    return R[iterations][iterations];
}

/**
 * ガウス求積法
 */
function gaussQuadrature(f, a, b, n) {
    // ガウス・ルジャンドル求積点と重み
    const points = {
        2: {
            points: [-0.5773502691896257, 0.5773502691896257],
            weights: [1.0, 1.0]
        },
        3: {
            points: [0, -0.7745966692414834, 0.7745966692414834],
            weights: [0.8888888888888888, 0.5555555555555556, 0.5555555555555556]
        },
        4: {
            points: [-0.3399810435848563, 0.3399810435848563, -0.8611363115940526, 0.8611363115940526],
            weights: [0.6521451548625461, 0.6521451548625461, 0.3478548451374538, 0.3478548451374538]
        },
        5: {
            points: [0, -0.5384693101056831, 0.5384693101056831, -0.9061798459386640, 0.9061798459386640],
            weights: [0.5688888888888889, 0.4786286704993665, 0.4786286704993665, 0.2369268850561891, 0.2369268850561891]
        }
    };
    
    // 使用する点の数を調整（2, 3, 4, 5のいずれか）
    n = Math.min(Math.max(n, 2), 5);
    
    const gaussPoints = points[n].points;
    const gaussWeights = points[n].weights;
    
    // 区間[a,b]から[-1,1]への変換係数
    const c1 = (b - a) / 2;
    const c2 = (b + a) / 2;
    
    let sum = 0;
    for (let i = 0; i < n; i++) {
        // [-1,1]から[a,b]への変換
        const x = c1 * gaussPoints[i] + c2;
        sum += gaussWeights[i] * f.evaluate({x: x});
    }
    
    return c1 * sum;
}

/**
 * モンテカルロ法による数値積分
 */
function monteCarloIntegration(f, a, b, n) {
    let sum = 0;
    
    // 関数の最大値と最小値を概算
    let fMin = Infinity;
    let fMax = -Infinity;
    const samples = 100;
    
    for (let i = 0; i < samples; i++) {
        const x = a + (b - a) * Math.random();
        const fVal = f.evaluate({x: x});
        fMin = Math.min(fMin, fVal);
        fMax = Math.max(fMax, fVal);
    }
    
    // 安全マージンを追加
    fMin = fMin - 0.1 * Math.abs(fMin);
    fMax = fMax + 0.1 * Math.abs(fMax);
    
    // モンテカルロ積分
    let hits = 0;
    for (let i = 0; i < n; i++) {
        const x = a + (b - a) * Math.random();
        const y = fMin + (fMax - fMin) * Math.random();
        const fVal = f.evaluate({x: x});
        
        if ((y >= 0 && y <= fVal) || (y <= 0 && y >= fVal)) {
            hits++;
        }
    }
    
    return (b - a) * (fMax - fMin) * hits / n;
}

/**
 * 二重積分（定数境界）
 */
function doubleIntegralConstantBounds(f, a, b, c, d, n) {
    // 各方向の分割数
    const nx = Math.floor(Math.sqrt(n));
    const ny = Math.floor(n / nx);
    
    const hx = (b - a) / nx;
    const hy = (d - c) / ny;
    
    let sum = 0;
    
    for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
            const x = a + (i + 0.5) * hx;
            const y = c + (j + 0.5) * hy;
            sum += f.evaluate({x: x, y: y});
        }
    }
    
    return hx * hy * sum;
}

/**
 * 二重積分（変数境界）
 */
function doubleIntegralVariableBounds(f, a, b, g1, g2, n) {
    const h = (b - a) / n;
    let sum = 0;
    
    for (let i = 0; i < n; i++) {
        const x = a + (i + 0.5) * h;
        const c = g1.evaluate({x: x});
        const d = g2.evaluate({x: x});
        
        if (c > d) {
            throw new Error('y範囲の下限が上限を超えています');
        }
        
        // x固定でyについて積分
        const ny = Math.max(10, Math.floor(Math.sqrt(n)));
        const hy = (d - c) / ny;
        
        let innerSum = 0;
        for (let j = 0; j < ny; j++) {
            const y = c + (j + 0.5) * hy;
            innerSum += f.evaluate({x: x, y: y});
        }
        
        sum += hy * innerSum;
    }
    
    return h * sum;
}

/**
 * 積分のLaTeX表示
 */
function displayIntegralLatex() {
    const integrationType = document.getElementById('integration-type').value;
    let latexStr = '';
    
    try {
        switch (integrationType) {
            case 'definite':
                latexStr = getDefiniteIntegralLatex();
                break;
            case 'double':
                latexStr = getDoubleIntegralLatex();
                break;
            case 'triple':
                latexStr = getTripleIntegralLatex();
                break;
            case 'line':
                latexStr = getLineIntegralLatex();
                break;
            case 'surface':
                latexStr = getSurfaceIntegralLatex();
                break;
            case 'improper':
                latexStr = getImproperIntegralLatex();
                break;
            default:
                throw new Error('未対応の積分タイプです');
        }
        
        // LaTeX表示
        document.getElementById('integration-latex').innerHTML = latexStr;
        
        // MathJaxで再レンダリング
        if (window.MathJax) {
            MathJax.typesetPromise([document.getElementById('integration-latex')]).catch(function (err) {
                console.error('MathJax error:', err);
            });
        }
        
    } catch (e) {
        console.error('LaTeX生成エラー:', e);
        document.getElementById('integration-latex').innerHTML = `
            <div class="result-error">
                <p>LaTeX生成エラー: ${e.message}</p>
            </div>
        `;
    }
}

/**
 * 定積分のLaTeX表現を取得
 */
function getDefiniteIntegralLatex() {
    const expr = document.getElementById('definite-integral-expr').value;
    const range = document.getElementById('definite-integral-range').value.split(',');
    
    if (range.length !== 2) {
        throw new Error('積分範囲は2つの値（下限,上限）で指定してください');
    }
    
    // 数式をLaTeX形式に変換
    const exprLatex = math.parse(expr).toTex({parenthesis: 'keep', implicit: 'hide'});
    const a = math.parse(range[0]).toTex();
    const b = math.parse(range[1]).toTex();
    
    return `\\int_{${a}}^{${b}} ${exprLatex} \\, dx`;
}

/**
 * 積分方法の名前を取得
 */
function getMethodName(method) {
    const methodNames = {
        'rectangle': '長方形法',
        'trapezoid': '台形法',
        'simpson': 'シンプソン法',
        'romberg': 'ロンバーグ積分',
        'gauss': 'ガウス求積法',
        'montecarlo': 'モンテカルロ法'
    };
    
    return methodNames[method] || method;
}

/**
 * 積分の可視化
 */
function visualizeIntegral() {
    const integrationType = document.getElementById('integration-type').value;
    
    try {
        switch (integrationType) {
            case 'definite':
                visualizeDefiniteIntegral();
                break;
            case 'double':
                visualizeDoubleIntegral();
                break;
            case 'line':
                visualizeLineIntegral();
                break;
            case 'surface':
                visualizeSurfaceIntegral();
                break;
            default:
                throw new Error('この積分タイプの可視化は未対応です');
        }
    } catch (e) {
        console.error('可視化エラー:', e);
        document.getElementById('integration-visualization').innerHTML = `
            <div class="result-error">
                <p>可視化エラー: ${e.message}</p>
            </div>
        `;
    }
}

/**
 * 定積分の可視化
 */
function visualizeDefiniteIntegral() {
    const expr = document.getElementById('definite-integral-expr').value;
    const range = document.getElementById('definite-integral-range').value.split(',');
    const method = document.getElementById('integration-method').value;
    const points = parseInt(document.getElementById('integration-points').value);
    
    if (range.length !== 2) {
        throw new Error('積分範囲は2つの値（下限,上限）で指定してください');
    }
    
    const a = parseFloat(math.evaluate(range[0]));
    const b = parseFloat(math.evaluate(range[1]));
    
    if (isNaN(a) || isNaN(b)) {
        throw new Error('積分範囲に有効な数値を指定してください');
    }
    
    // 関数をコンパイル
    const f = math.compile(expr);
    
    // プロット用のデータ生成
    const n = 500; // プロット用の点数
    const h = (b - a) / n;
    
    const xValues = [];
    const yValues = [];
    
    for (let i = 0; i <= n; i++) {
        const x = a + i * h;
        xValues.push(x);
        yValues.push(f.evaluate({x: x}));
    }
    
    // 積分領域の塗りつぶし用のデータ
    const fillX = [];
    const fillY = [];
    
    // x軸より上の領域と下の領域を分けて処理
    const positiveX = [];
    const positiveY = [];
    const negativeX = [];
    const negativeY = [];
    
    for (let i = 0; i <= n; i++) {
        const x = a + i * h;
        const y = f.evaluate({x: x});
        
        if (y >= 0) {
            positiveX.push(x);
            positiveY.push(y);
        } else {
            negativeX.push(x);
            negativeY.push(y);
        }
    }
    
    // プロットデータ
    const traces = [
        {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines',
            name: 'f(x)',
            line: {
                color: 'blue',
                width: 2
            }
        }
    ];
    
    // 正の領域の塗りつぶし
    if (positiveX.length > 0) {
        traces.push({
            x: positiveX,
            y: positiveY,
            type: 'scatter',
            fill: 'tozeroy',
            mode: 'none',
            name: '正の積分領域',
            fillcolor: 'rgba(0, 128, 255, 0.3)'
        });
    }
    
    // 負の領域の塗りつぶし
    if (negativeX.length > 0) {
        traces.push({
            x: negativeX,
            y: negativeY,
            type: 'scatter',
            fill: 'tozeroy',
            mode: 'none',
            name: '負の積分領域',
            fillcolor: 'rgba(255, 0, 0, 0.3)'
        });
    }
    
    // x軸
    traces.push({
        x: [a, b],
        y: [0, 0],
        type: 'scatter',
        mode: 'lines',
        name: 'x軸',
        line: {
            color: 'black',
            width: 1
        }
    });
    
    // レイアウト設定
    const layout = {
        title: '定積分の可視化',
        xaxis: {
            title: 'x',
            range: [a, b]
        },
        yaxis: {
            title: 'f(x)'
        },
        showlegend: true,
        legend: {
            x: 0,
            y: 1
        },
        annotations: [
            {
                x: a,
                y: 0,
                xref: 'x',
                yref: 'y',
                text: `x = ${a}`,
                showarrow: true,
                arrowhead: 2,
                ax: 0,
                ay: -40
            },
            {
                x: b,
                y: 0,
                xref: 'x',
                yref: 'y',
                text: `x = ${b}`,
                showarrow: true,
                arrowhead: 2,
                ax: 0,
                ay: -40
            }
        ]
    };
    
    // プロット
    Plotly.newPlot('integration-visualization', traces, layout);
}
