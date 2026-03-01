/**
 * differential-equations.js - 微分方程式ソルバー
 * 常微分方程式や偏微分方程式の数値解法を提供
 */

document.addEventListener('DOMContentLoaded', function() {
    // 微分方程式タブの初期化
    initDiffEqTab();
    
    // イベントリスナーの設定
    document.getElementById('diff-eq-type').addEventListener('change', handleDiffEqTypeChange);
    document.getElementById('diff-eq-solve-btn').addEventListener('click', solveDifferentialEquation);
    document.getElementById('diff-eq-latex-btn').addEventListener('click', displayDiffEqLatex);
});

/**
 * 微分方程式タブの初期化
 */
function initDiffEqTab() {
    // 方程式タイプの変更ハンドラを一度呼び出して初期状態を設定
    handleDiffEqTypeChange();
    
    // 数値解法のデフォルト値を設定
    document.getElementById('diff-eq-method').value = 'rk4';
}

/**
 * 微分方程式タイプの変更ハンドラ
 */
function handleDiffEqTypeChange() {
    const eqType = document.getElementById('diff-eq-type').value;
    
    // すべての方程式入力フォームを非表示
    document.querySelectorAll('.equation-input').forEach(el => {
        el.style.display = 'none';
    });
    
    // 選択された方程式タイプの入力フォームを表示
    document.getElementById(`${eqType}-input`).style.display = 'block';
    
    // 数値解法の選択肢を調整
    const methodSelect = document.getElementById('diff-eq-method');
    
    // 一度すべての選択肢を表示
    Array.from(methodSelect.options).forEach(option => {
        option.style.display = 'block';
    });
    
    // 方程式タイプに応じて不適切な解法を非表示
    if (eqType.startsWith('pde-')) {
        // PDEの場合、ODEのみの解法を非表示
        Array.from(methodSelect.options).forEach(option => {
            if (['euler', 'rk4', 'adams', 'bdf'].includes(option.value)) {
                option.style.display = 'none';
            }
        });
        // デフォルトを有限差分法に設定
        methodSelect.value = 'finite-difference';
    } else {
        // ODEの場合、PDEのみの解法を非表示
        Array.from(methodSelect.options).forEach(option => {
            if (['finite-difference', 'finite-element', 'spectral'].includes(option.value)) {
                option.style.display = 'none';
            }
        });
        // デフォルトをルンゲ・クッタ法に設定
        methodSelect.value = 'rk4';
    }
}

/**
 * 微分方程式を解く
 */
function solveDifferentialEquation() {
    const eqType = document.getElementById('diff-eq-type').value;
    const method = document.getElementById('diff-eq-method').value;
    
    let solution, error;
    
    try {
        switch (eqType) {
            case 'ode1':
                solution = solveFirstOrderODE(method);
                break;
            case 'ode2':
                solution = solveSecondOrderODE(method);
                break;
            case 'ode-system':
                solution = solveODESystem(method);
                break;
            case 'pde-heat':
                solution = solveHeatEquation(method);
                break;
            case 'pde-wave':
                solution = solveWaveEquation(method);
                break;
            case 'pde-laplace':
                solution = solveLaplaceEquation(method);
                break;
            default:
                throw new Error('未対応の方程式タイプです');
        }
        
        // 結果の表示
        displayDiffEqSolution(solution, eqType);
        
        // 解の可視化
        visualizeDiffEqSolution(solution, eqType);
        
    } catch (e) {
        console.error('微分方程式解法エラー:', e);
        document.getElementById('diff-eq-output').innerHTML = `
            <div class="result-error">
                <h4>エラー:</h4>
                <p>${e.message}</p>
            </div>
        `;
        document.getElementById('diff-eq-visualization').innerHTML = '';
    }
}

/**
 * 1階常微分方程式を解く
 */
function solveFirstOrderODE(method) {
    const expr = document.getElementById('ode1-expr').value;
    const initial = document.getElementById('ode1-initial').value.split(',');
    const range = document.getElementById('ode1-range').value.split(',');
    
    if (initial.length !== 2) {
        throw new Error('初期条件は2つの値（x₀,y₀）で指定してください');
    }
    
    if (range.length !== 2) {
        throw new Error('x範囲は2つの値（開始,終了）で指定してください');
    }
    
    const x0 = parseFloat(math.evaluate(initial[0]));
    const y0 = parseFloat(math.evaluate(initial[1]));
    const xStart = parseFloat(math.evaluate(range[0]));
    const xEnd = parseFloat(math.evaluate(range[1]));
    
    if (isNaN(x0) || isNaN(y0) || isNaN(xStart) || isNaN(xEnd)) {
        throw new Error('初期条件とx範囲に有効な数値を指定してください');
    }
    
    // 関数をコンパイル
    const f = math.compile(expr);
    
    // 微分方程式: dy/dx = f(x, y)
    function dydt(x, y) {
        return f.evaluate({x: x, y: y});
    }
    
    // 選択された方法で解く
    const n = 1000; // 計算点数
    const h = (xEnd - xStart) / n;
    
    const xValues = [x0];
    const yValues = [y0];
    
    let x = x0;
    let y = y0;
    
    // x0からxStartまで計算（必要な場合）
    if (x0 < xStart) {
        const hInit = (xStart - x0) / 100;
        for (let i = 0; i < 100; i++) {
            const [xNew, yNew] = stepODE(method, dydt, x, y, hInit);
            x = xNew;
            y = yNew;
        }
        xValues[0] = xStart;
        yValues[0] = y;
    } else if (x0 > xStart) {
        throw new Error('初期条件のx₀は範囲の開始値以下である必要があります');
    }
    
    // xStartからxEndまで計算
    for (let i = 1; i <= n; i++) {
        const [xNew, yNew] = stepODE(method, dydt, x, y, h);
        x = xNew;
        y = yNew;
        xValues.push(x);
        yValues.push(y);
    }
    
    return {
        x: xValues,
        y: yValues,
        type: 'ode1',
        equation: expr,
        method: method
    };
}

/**
 * 2階常微分方程式を解く
 */
function solveSecondOrderODE(method) {
    const expr = document.getElementById('ode2-expr').value;
    const initial = document.getElementById('ode2-initial').value.split(',');
    const range = document.getElementById('ode2-range').value.split(',');
    
    if (initial.length !== 3) {
        throw new Error('初期条件は3つの値（x₀,y₀,y₁）で指定してください');
    }
    
    if (range.length !== 2) {
        throw new Error('x範囲は2つの値（開始,終了）で指定してください');
    }
    
    const x0 = parseFloat(math.evaluate(initial[0]));
    const y0 = parseFloat(math.evaluate(initial[1]));
    const y1 = parseFloat(math.evaluate(initial[2])); // y'(x₀)
    const xStart = parseFloat(math.evaluate(range[0]));
    const xEnd = parseFloat(math.evaluate(range[1]));
    
    if (isNaN(x0) || isNaN(y0) || isNaN(y1) || isNaN(xStart) || isNaN(xEnd)) {
        throw new Error('初期条件とx範囲に有効な数値を指定してください');
    }
    
    // 関数をコンパイル
    const f = math.compile(expr);
    
    // 2階ODEを1階ODEシステムに変換
    // y' = z
    // z' = f(x, y, z)
    function system(x, y, z) {
        return [
            z,
            f.evaluate({x: x, y: y, 'y\'': z})
        ];
    }
    
    // 選択された方法で解く
    const n = 1000; // 計算点数
    const h = (xEnd - xStart) / n;
    
    const xValues = [x0];
    const yValues = [y0];
    const zValues = [y1]; // y'の値
    
    let x = x0;
    let y = y0;
    let z = y1;
    
    // x0からxStartまで計算（必要な場合）
    if (x0 < xStart) {
        const hInit = (xStart - x0) / 100;
        for (let i = 0; i < 100; i++) {
            const [xNew, yNew, zNew] = stepODESystem(method, system, x, y, z, hInit);
            x = xNew;
            y = yNew;
            z = zNew;
        }
        xValues[0] = xStart;
        yValues[0] = y;
        zValues[0] = z;
    } else if (x0 > xStart) {
        throw new Error('初期条件のx₀は範囲の開始値以下である必要があります');
    }
    
    // xStartからxEndまで計算
    for (let i = 1; i <= n; i++) {
        const [xNew, yNew, zNew] = stepODESystem(method, system, x, y, z, h);
        x = xNew;
        y = yNew;
        z = zNew;
        xValues.push(x);
        yValues.push(y);
        zValues.push(z);
    }
    
    return {
        x: xValues,
        y: yValues,
        yPrime: zValues,
        type: 'ode2',
        equation: expr,
        method: method
    };
}

/**
 * 連立常微分方程式を解く
 */
function solveODESystem(method) {
    const expr1 = document.getElementById('ode-system-expr1').value;
    const expr2 = document.getElementById('ode-system-expr2').value;
    const initial = document.getElementById('ode-system-initial').value.split(',');
    const range = document.getElementById('ode-system-range').value.split(',');
    
    if (initial.length !== 3) {
        throw new Error('初期条件は3つの値（t₀,x₀,y₀）で指定してください');
    }
    
    if (range.length !== 2) {
        throw new Error('t範囲は2つの値（開始,終了）で指定してください');
    }
    
    const t0 = parseFloat(math.evaluate(initial[0]));
    const x0 = parseFloat(math.evaluate(initial[1]));
    const y0 = parseFloat(math.evaluate(initial[2]));
    const tStart = parseFloat(math.evaluate(range[0]));
    const tEnd = parseFloat(math.evaluate(range[1]));
    
    if (isNaN(t0) || isNaN(x0) || isNaN(y0) || isNaN(tStart) || isNaN(tEnd)) {
        throw new Error('初期条件とt範囲に有効な数値を指定してください');
    }
    
    // 関数をコンパイル
    const f = math.compile(expr1);
    const g = math.compile(expr2);
    
    // 連立ODE: dx/dt = f(t, x, y), dy/dt = g(t, x, y)
    function system(t, x, y) {
        return [
            f.evaluate({t: t, x: x, y: y}),
            g.evaluate({t: t, x: x, y: y})
        ];
    }
    
    // 選択された方法で解く
    const n = 1000; // 計算点数
    const h = (tEnd - tStart) / n;
    
    const tValues = [t0];
    const xValues = [x0];
    const yValues = [y0];
    
    let t = t0;
    let x = x0;
    let y = y0;
    
    // t0からtStartまで計算（必要な場合）
    if (t0 < tStart) {
        const hInit = (tStart - t0) / 100;
        for (let i = 0; i < 100; i++) {
            const [tNew, xNew, yNew] = stepODESystem(method, system, t, x, y, hInit);
            t = tNew;
            x = xNew;
            y = yNew;
        }
        tValues[0] = tStart;
        xValues[0] = x;
        yValues[0] = y;
    } else if (t0 > tStart) {
        throw new Error('初期条件のt₀は範囲の開始値以下である必要があります');
    }
    
    // tStartからtEndまで計算
    for (let i = 1; i <= n; i++) {
        const [tNew, xNew, yNew] = stepODESystem(method, system, t, x, y, h);
        t = tNew;
        x = xNew;
        y = yNew;
        tValues.push(t);
        xValues.push(x);
        yValues.push(y);
    }
    
    return {
        t: tValues,
        x: xValues,
        y: yValues,
        type: 'ode-system',
        equation1: expr1,
        equation2: expr2,
        method: method
    };
}

/**
 * 熱伝導方程式を解く
 */
function solveHeatEquation(method) {
    const alpha = parseFloat(document.getElementById('pde-heat-alpha').value);
    const initialTemp = document.getElementById('pde-heat-initial').value;
    const boundaryType = document.getElementById('pde-heat-boundary').value;
    const timeRange = document.getElementById('pde-heat-time').value.split(',');
    
    if (isNaN(alpha) || alpha <= 0) {
        throw new Error('熱拡散率αは正の数値で指定してください');
    }
    
    if (timeRange.length !== 2) {
        throw new Error('時間範囲は2つの値（開始,終了）で指定してください');
    }
    
    const tStart = parseFloat(math.evaluate(timeRange[0]));
    const tEnd = parseFloat(math.evaluate(timeRange[1]));
    
    if (isNaN(tStart) || isNaN(tEnd) || tStart >= tEnd) {
        throw new Error('時間範囲に有効な数値を指定してください（開始 < 終了）');
    }
    
    // 初期温度分布関数をコンパイル
    const initialFunc = math.compile(initialTemp);
    
    // 空間グリッドの設定
    const nx = 100; // 空間分割数
    const nt = 100; // 時間分割数
    const dx = 1.0 / nx;
    const dt = (tEnd - tStart) / nt;
    
    // 安定性条件のチェック
    const r = alpha * dt / (dx * dx);
    if (r > 0.5) {
        console.warn(`安定性警告: 計算パラメータr = ${r.toFixed(4)} > 0.5 です。数値解が不安定になる可能性があります。`);
    }
    
    // 初期条件の設定
    const u = Array(nt + 1).fill().map(() => Array(nx + 1).fill(0));
    
    // 初期温度分布を設定
    for (let i = 0; i <= nx; i++) {
        const x = i * dx;
        u[0][i] = initialFunc.evaluate({x: x});
    }
    
    // 境界条件の適用
    for (let n = 0; n <= nt; n++) {
        switch (boundaryType) {
            case 'dirichlet':
                // ディリクレ条件: u(0,t) = u(1,t) = 0
                u[n][0] = 0;
                u[n][nx] = 0;
                break;
            case 'neumann':
                // ノイマン条件: ∂u/∂x|₀ = ∂u/∂x|₁ = 0
                // 中央差分近似を使用
                if (n > 0) {
                    u[n][0] = u[n][1]; // ∂u/∂x|₀ = 0
                    u[n][nx] = u[n][nx-1]; // ∂u/∂x|₁ = 0
                }
                break;
            case 'periodic':
                // 周期的境界条件: u(0,t) = u(1,t), ∂u/∂x|₀ = ∂u/∂x|₁
                if (n > 0) {
                    u[n][0] = u[n][nx-1];
                    u[n][nx] = u[n][1];
                }
                break;
        }
    }
    
    // 熱方程式を解く（陽解法）
    for (let n = 0; n < nt; n++) {
        for (let i = 1; i < nx; i++) {
            u[n+1][i] = u[n][i] + r * (u[n][i+1] - 2 * u[n][i] + u[n][i-1]);
        }
        
        // 境界条件の再適用
        switch (boundaryType) {
            case 'dirichlet':
                u[n+1][0] = 0;
                u[n+1][nx] = 0;
                break;
            case 'neumann':
                u[n+1][0] = u[n+1][1];
                u[n+1][nx] = u[n+1][nx-1];
                break;
            case 'periodic':
                u[n+1][0] = u[n+1][nx-1];
                u[n+1][nx] = u[n+1][1];
                break;
        }
    }
    
    // 結果の整形
    const xValues = Array(nx + 1).fill().map((_, i) => i * dx);
    const tValues = Array(nt + 1).fill().map((_, i) => tStart + i * dt);
    
    return {
        x: xValues,
        t: tValues,
        u: u,
        type: 'pde-heat',
        alpha: alpha,
        initialTemp: initialTemp,
        boundaryType: boundaryType,
        method: method
    };
}

/**
 * 波動方程式を解く
 */
function solveWaveEquation(method) {
    const c = parseFloat(document.getElementById('pde-wave-c').value);
    const initialPos = document.getElementById('pde-wave-initial-pos').value;
    const initialVel = document.getElementById('pde-wave-initial-vel').value;
    const boundaryType = document.getElementById('pde-wave-boundary').value;
    const timeRange = document.getElementById('pde-wave-time').value.split(',');
    
    if (isNaN(c) || c <= 0) {
        throw new Error('波速cは正の数値で指定してください');
    }
    
    if (timeRange.length !== 2) {
        throw new Error('時間範囲は2つの値（開始,終了）で指定してください');
    }
    
    const tStart = parseFloat(math.evaluate(timeRange[0]));
    const tEnd = parseFloat(math.evaluate(timeRange[1]));
    
    if (isNaN(tStart) || isNaN(tEnd) || tStart >= tEnd) {
        throw new Error('時間範囲に有効な数値を指定してください（開始 < 終了）');
    }
    
    // 初期条件関数をコンパイル
    const initialPosFunc = math.compile(initialPos);
    const initialVelFunc = math.compile(initialVel);
    
    // 空間グリッドの設定
    const nx = 100; // 空間分割数
    const nt = 500; // 時間分割数
    const dx = 1.0 / nx;
    const dt = (tEnd - tStart) / nt;
    
    // 安定性条件のチェック
    const r = c * dt / dx;
    if (r > 1.0) {
        console.warn(`安定性警告: クーラン数r = ${r.toFixed(4)} > 1.0 です。数値解が不安定になる可能性があります。`);
    }
    
    // 初期条件の設定
    const u = Array(nt + 1).fill().map(() => Array(nx + 1).fill(0));
    
    // 初期位置を設定
    for (let i = 0; i <= nx; i++) {
        const x = i * dx;
        u[0][i] = initialPosFunc.evaluate({x: x});
    }
    
    // 境界条件の適用
    switch (boundaryType) {
        case 'dirichlet':
            // ディリクレ条件: u(0,t) = u(1,t) = 0
            for (let n = 0; n <= nt; n++) {
                u[n][0] = 0;
                u[n][nx] = 0;
            }
            break;
        case 'neumann':
            // ノイマン条件: ∂u/∂x|₀ = ∂u/∂x|₁ = 0
            // 初期条件に適用
            u[0][0] = u[0][1];
            u[0][nx] = u[0][nx-1];
            break;
        case 'periodic':
            // 周期的境界条件: u(0,t) = u(1,t)
            for (let n = 0; n <= nt; n++) {
                u[n][0] = u[n][nx-1];
                u[n][nx] = u[n][1];
            }
            break;
    }
    
    // 初期速度を使って2番目の時間ステップを計算
    for (let i = 1; i < nx; i++) {
        const x = i * dx;
        const initialV = initialVelFunc.evaluate({x: x});
        u[1][i] = u[0][i] + initialV * dt + 0.5 * c * c * dt * dt * (u[0][i+1] - 2 * u[0][i] + u[0][i-1]) / (dx * dx);
    }
    
    // 境界条件の再適用
    switch (boundaryType) {
        case 'dirichlet':
            u[1][0] = 0;
            u[1][nx] = 0;
            break;
        case 'neumann':
            u[1][0] = u[1][1];
            u[1][nx] = u[1][nx-1];
            break;
        case 'periodic':
            u[1][0] = u[1][nx-1];
            u[1][nx] = u[1][1];
            break;
    }
    
    // 波動方程式を解く（中央差分法）
    for (let n = 1; n < nt; n++) {
        for (let i = 1; i < nx; i++) {
            u[n+1][i] = 2 * u[n][i] - u[n-1][i] + r * r * (u[n][i+1] - 2 * u[n][i] + u[n][i-1]);
        }
        
        // 境界条件の再適用
        switch (boundaryType) {
            case 'dirichlet':
                u[n+1][0] = 0;
                u[n+1][nx] = 0;
                break;
            case 'neumann':
                u[n+1][0] = u[n+1][1];
                u[n+1][nx] = u[n+1][nx-1];
                break;
            case 'periodic':
                u[n+1][0] = u[n+1][nx-1];
                u[n+1][nx] = u[n+1][1];
                break;
        }
    }
    
    // 結果の整形
    const xValues = Array(nx + 1).fill().map((_, i) => i * dx);
    const tValues = Array(nt + 1).fill().map((_, i) => tStart + i * dt);
    
    return {
        x: xValues,
        t: tValues,
        u: u,
        type: 'pde-wave',
        c: c,
        initialPos: initialPos,
        initialVel: initialVel,
        boundaryType: boundaryType,
        method: method
    };
}

/**
 * ラプラス方程式を解く
 */
function solveLaplaceEquation(method) {
    const boundaryTop = document.getElementById('pde-laplace-boundary-top').value;
    const boundaryRight = document.getElementById('pde-laplace-boundary-right').value;
    const boundaryBottom = document.getElementById('pde-laplace-boundary-bottom').value;
    const boundaryLeft = document.getElementById('pde-laplace-boundary-left').value;
    const gridSize = parseInt(document.getElementById('pde-laplace-grid').value);
    
    if (isNaN(gridSize) || gridSize < 10 || gridSize > 200) {
        throw new Error('グリッドサイズは10から200の間で指定してください');
    }
    
    // 境界値を数値に変換
    const topValue = parseFloat(math.evaluate(boundaryTop));
    const rightValue = parseFloat(math.evaluate(boundaryRight));
    const bottomValue = parseFloat(math.evaluate(boundaryBottom));
    const leftValue = parseFloat(math.evaluate(boundaryLeft));
    
    if (isNaN(topValue) || isNaN(rightValue) || isNaN(bottomValue) || isNaN(leftValue)) {
        throw new Error('境界条件に有効な数値を指定してください');
    }
    
    // グリッドの初期化
    const u = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    
    // 境界条件の設定
    for (let i = 0; i < gridSize; i++) {
        u[0][i] = topValue;           // 上側境界
        u[gridSize-1][i] = bottomValue; // 下側境界
        u[i][0] = leftValue;          // 左側境界
        u[i][gridSize-1] = rightValue;  // 右側境界
    }
    
    // ラプラス方程式を解く（ヤコビ法）
    const maxIterations = 1000;
    const tolerance = 1e-6;
    let error = 1.0;
    let iterations = 0;
    
    while (error > tolerance && iterations < maxIterations) {
        error = 0.0;
        const uNew = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        
        // 境界条件をコピー
        for (let i = 0; i < gridSize; i++) {
            uNew[0][i] = u[0][i];
            uNew[gridSize-1][i] = u[gridSize-1][i];
            uNew[i][0] = u[i][0];
            uNew[i][gridSize-1] = u[i][gridSize-1];
        }
        
        // 内部点を更新
        for (let i = 1; i < gridSize - 1; i++) {
            for (let j = 1; j < gridSize - 1; j++) {
                uNew[i][j] = 0.25 * (u[i+1][j] + u[i-1][j] + u[i][j+1] + u[i][j-1]);
                error = Math.max(error, Math.abs(uNew[i][j] - u[i][j]));
            }
        }
        
        // 解を更新
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                u[i][j] = uNew[i][j];
            }
        }
        
        iterations++;
    }
    
    // 結果の整形
    const xValues = Array(gridSize).fill().map((_, i) => i / (gridSize - 1));
    const yValues = Array(gridSize).fill().map((_, i) => i / (gridSize - 1));
    
    return {
        x: xValues,
        y: yValues,
        u: u,
        type: 'pde-laplace',
        boundaryTop: topValue,
        boundaryRight: rightValue,
        boundaryBottom: bottomValue,
        boundaryLeft: leftValue,
        iterations: iterations,
        error: error,
        method: method
    };
}

/**
 * 1階ODEの1ステップ計算
 */
function stepODE(method, f, x, y, h) {
    switch (method) {
        case 'euler':
            // オイラー法
            return [x + h, y + h * f(x, y)];
        
        case 'rk4':
            // 4次ルンゲ・クッタ法
            const k1 = f(x, y);
            const k2 = f(x + h/2, y + h*k1/2);
            const k3 = f(x + h/2, y + h*k2/2);
            const k4 = f(x + h, y + h*k3);
            return [x + h, y + h*(k1 + 2*k2 + 2*k3 + k4)/6];
        
        case 'adams':
            // アダムス・バッシュフォース法（簡易版）
            // 注: 実際の実装では過去の複数ステップの値を保持する必要があります
            const f1 = f(x, y);
            const f2 = f(x - h, y - h*f1); // 近似的な前ステップの導関数
            return [x + h, y + h*(3*f1 - f2)/2];
        
        case 'bdf':
            // 後退差分法（簡易版）
            // 注: 実際の実装では非線形方程式を解く必要があります
            const yPredict = y + h*f(x, y); // 予測子
            const fPredict = f(x + h, yPredict);
            return [x + h, y + h*fPredict]; // 修正子
        
        default:
            throw new Error('未対応の数値解法です');
    }
}

/**
 * 連立ODEの1ステップ計算
 */
function stepODESystem(method, f, t, x, y, h) {
    switch (method) {
        case 'euler':
            // オイラー法
            const [dxdt, dydt] = f(t, x, y);
            return [t + h, x + h * dxdt, y + h * dydt];
        
        case 'rk4':
            // 4次ルンゲ・クッタ法
            const [k1x, k1y] = f(t, x, y);
            const [k2x, k2y] = f(t + h/2, x + h*k1x/2, y + h*k1y/2);
            const [k3x, k3y] = f(t + h/2, x + h*k2x/2, y + h*k2y/2);
            const [k4x, k4y] = f(t + h, x + h*k3x, y + h*k3y);
            
            return [
                t + h,
                x + h*(k1x + 2*k2x + 2*k3x + k4x)/6,
                y + h*(k1y + 2*k2y + 2*k3y + k4y)/6
            ];
        
        case 'adams':
        case 'bdf':
            // 簡易実装（実際にはより複雑）
            return stepODESystem('rk4', f, t, x, y, h);
        
        default:
            throw new Error('未対応の数値解法です');
    }
}

/**
 * 微分方程式の解をLaTeX形式で表示
 */
function displayDiffEqLatex() {
    const eqType = document.getElementById('diff-eq-type').value;
    let latexStr = '';
    
    try {
        switch (eqType) {
            case 'ode1':
                latexStr = getFirstOrderODELatex();
                break;
            case 'ode2':
                latexStr = getSecondOrderODELatex();
                break;
            case 'ode-system':
                latexStr = getODESystemLatex();
                break;
            case 'pde-heat':
                latexStr = getHeatEquationLatex();
                break;
            case 'pde-wave':
                latexStr = getWaveEquationLatex();
                break;
            case 'pde-laplace':
                latexStr = getLaplaceEquationLatex();
                break;
            default:
                throw new Error('未対応の方程式タイプです');
        }
        
        // LaTeX表示
        document.getElementById('diff-eq-latex').innerHTML = latexStr;
        
        // MathJaxで再レンダリング
        if (window.MathJax) {
            MathJax.typesetPromise([document.getElementById('diff-eq-latex')]).catch(function (err) {
                console.error('MathJax error:', err);
            });
        }
        
    } catch (e) {
        console.error('LaTeX生成エラー:', e);
        document.getElementById('diff-eq-latex').innerHTML = `
            <div class="result-error">
                <p>LaTeX生成エラー: ${e.message}</p>
            </div>
        `;
    }
}

/**
 * 1階ODEのLaTeX表現を取得
 */
function getFirstOrderODELatex() {
    const expr = document.getElementById('ode1-expr').value;
    const initial = document.getElementById('ode1-initial').value.split(',');
    
    if (initial.length !== 2) {
        throw new Error('初期条件は2つの値（x₀,y₀）で指定してください');
    }
    
    // 数式をLaTeX形式に変換
    const exprLatex = math.parse(expr).toTex({parenthesis: 'keep', implicit: 'hide'});
    const x0 = math.parse(initial[0]).toTex();
    const y0 = math.parse(initial[1]).toTex();
    
    return `
        \\begin{align}
        \\frac{dy}{dx} &= ${exprLatex} \\\\
        y(${x0}) &= ${y0}
        \\end{align}
    `;
}

/**
 * 微分方程式の解を表示
 */
function displayDiffEqSolution(solution, eqType) {
    let resultHTML = '';
    
    switch (eqType) {
        case 'ode1':
        case 'ode2':
            resultHTML = `
                <div class="result-success">
                    <h4>数値解:</h4>
                    <p>方程式: ${solution.equation}</p>
                    <p>解法: ${getMethodName(solution.method)}</p>
                    <p>計算点数: ${solution.x.length}</p>
                    <p>x範囲: [${solution.x[0].toFixed(4)}, ${solution.x[solution.x.length-1].toFixed(4)}]</p>
                    <p>サンプル値:</p>
                    <table class="result-table">
                        <tr>
                            <th>x</th>
                            <th>y</th>
                            ${eqType === 'ode2' ? '<th>y\'</th>' : ''}
                        </tr>
                        ${getSampleValues(solution, 5)}
                    </table>
                </div>
            `;
            break;
        
        case 'ode-system':
            resultHTML = `
                <div class="result-success">
                    <h4>数値解:</h4>
                    <p>方程式1: ${solution.equation1}</p>
                    <p>方程式2: ${solution.equation2}</p>
                    <p>解法: ${getMethodName(solution.method)}</p>
                    <p>計算点数: ${solution.t.length}</p>
                    <p>t範囲: [${solution.t[0].toFixed(4)}, ${solution.t[solution.t.length-1].toFixed(4)}]</p>
                    <p>サンプル値:</p>
                    <table class="result-table">
                        <tr>
                            <th>t</th>
                            <th>x</th>
                            <th>y</th>
                        </tr>
                        ${getSampleValuesSystem(solution, 5)}
                    </table>
                </div>
            `;
            break;
        
        case 'pde-heat':
        case 'pde-wave':
            resultHTML = `
                <div class="result-success">
                    <h4>数値解:</h4>
                    <p>方程式タイプ: ${eqType === 'pde-heat' ? '熱伝導方程式' : '波動方程式'}</p>
                    <p>パラメータ: ${eqType === 'pde-heat' ? `α = ${solution.alpha}` : `c = ${solution.c}`}</p>
                    <p>境界条件: ${getBoundaryTypeName(solution.boundaryType)}</p>
                    <p>空間分割数: ${solution.x.length}</p>
                    <p>時間分割数: ${solution.t.length}</p>
                    <p>x範囲: [${solution.x[0].toFixed(4)}, ${solution.x[solution.x.length-1].toFixed(4)}]</p>
                    <p>t範囲: [${solution.t[0].toFixed(4)}, ${solution.t[solution.t.length-1].toFixed(4)}]</p>
                </div>
            `;
            break;
        
        case 'pde-laplace':
            resultHTML = `
                <div class="result-success">
                    <h4>数値解:</h4>
                    <p>方程式: ラプラス方程式 (∇²u = 0)</p>
                    <p>境界条件:</p>
                    <ul>
                        <li>上側: ${solution.boundaryTop}</li>
                        <li>右側: ${solution.boundaryRight}</li>
                        <li>下側: ${solution.boundaryBottom}</li>
                        <li>左側: ${solution.boundaryLeft}</li>
                    </ul>
                    <p>グリッドサイズ: ${solution.x.length} × ${solution.y.length}</p>
                    <p>反復回数: ${solution.iterations}</p>
                    <p>最終誤差: ${solution.error.toExponential(4)}</p>
                </div>
            `;
            break;
    }
    
    document.getElementById('diff-eq-output').innerHTML = resultHTML;
}

/**
 * 数値解法の名前を取得
 */
function getMethodName(method) {
    const methodNames = {
        'euler': 'オイラー法',
        'rk4': 'ルンゲ・クッタ法 (4次)',
        'adams': 'アダムス・バッシュフォース法',
        'bdf': '後退差分法',
        'finite-difference': '有限差分法',
        'finite-element': '有限要素法',
        'spectral': 'スペクトル法'
    };
    
    return methodNames[method] || method;
}

/**
 * 境界条件タイプの名前を取得
 */
function getBoundaryTypeName(boundaryType) {
    const boundaryNames = {
        'dirichlet': 'ディリクレ条件',
        'neumann': 'ノイマン条件',
        'periodic': '周期的境界条件'
    };
    
    return boundaryNames[boundaryType] || boundaryType;
}

/**
 * サンプル値のHTML表を生成（ODE用）
 */
function getSampleValues(solution, count) {
    const n = solution.x.length;
    const step = Math.max(1, Math.floor(n / count));
    let html = '';
    
    for (let i = 0; i < n; i += step) {
        html += `<tr>
            <td>${solution.x[i].toFixed(4)}</td>
            <td>${solution.y[i].toFixed(4)}</td>
            ${solution.type === 'ode2' ? `<td>${solution.yPrime[i].toFixed(4)}</td>` : ''}
        </tr>`;
    }
    
    // 最後の値も表示
    if ((n - 1) % step !== 0) {
        html += `<tr>
            <td>${solution.x[n-1].toFixed(4)}</td>
            <td>${solution.y[n-1].toFixed(4)}</td>
            ${solution.type === 'ode2' ? `<td>${solution.yPrime[n-1].toFixed(4)}</td>` : ''}
        </tr>`;
    }
    
    return html;
}

/**
 * サンプル値のHTML表を生成（ODE System用）
 */
function getSampleValuesSystem(solution, count) {
    const n = solution.t.length;
    const step = Math.max(1, Math.floor(n / count));
    let html = '';
    
    for (let i = 0; i < n; i += step) {
        html += `<tr>
            <td>${solution.t[i].toFixed(4)}</td>
            <td>${solution.x[i].toFixed(4)}</td>
            <td>${solution.y[i].toFixed(4)}</td>
        </tr>`;
    }
    
    // 最後の値も表示
    if ((n - 1) % step !== 0) {
        html += `<tr>
            <td>${solution.t[n-1].toFixed(4)}</td>
            <td>${solution.x[n-1].toFixed(4)}</td>
            <td>${solution.y[n-1].toFixed(4)}</td>
        </tr>`;
    }
    
    return html;
}

/**
 * 微分方程式の解を可視化
 */
function visualizeDiffEqSolution(solution, eqType) {
    switch (eqType) {
        case 'ode1':
            visualizeODE1Solution(solution);
            break;
        case 'ode2':
            visualizeODE2Solution(solution);
            break;
        case 'ode-system':
            visualizeODESystemSolution(solution);
            break;
        case 'pde-heat':
        case 'pde-wave':
            visualizePDESolution(solution);
            break;
        case 'pde-laplace':
            visualizeLaplaceSolution(solution);
            break;
    }
}

/**
 * 1階ODEの解を可視化
 */
function visualizeODE1Solution(solution) {
    const trace = {
        x: solution.x,
        y: solution.y,
        type: 'scatter',
        mode: 'lines',
        name: 'y(x)',
        line: {
            color: 'blue',
            width: 2
        }
    };
    
    const layout = {
        title: '1階常微分方程式の解',
        xaxis: {
            title: 'x'
        },
        yaxis: {
            title: 'y'
        },
        showlegend: true
    };
    
    Plotly.newPlot('diff-eq-visualization', [trace], layout);
}

/**
 * 2階ODEの解を可視化
 */
function visualizeODE2Solution(solution) {
    const traceY = {
        x: solution.x,
        y: solution.y,
        type: 'scatter',
        mode: 'lines',
        name: 'y(x)',
        line: {
            color: 'blue',
            width: 2
        }
    };
    
    const traceYPrime = {
        x: solution.x,
        y: solution.yPrime,
        type: 'scatter',
        mode: 'lines',
        name: 'y\'(x)',
        line: {
            color: 'red',
            width: 2,
            dash: 'dash'
        }
    };
    
    const layout = {
        title: '2階常微分方程式の解',
        xaxis: {
            title: 'x'
        },
        yaxis: {
            title: 'y, y\''
        },
        showlegend: true
    };
    
    Plotly.newPlot('diff-eq-visualization', [traceY, traceYPrime], layout);
}

/**
 * 連立ODEの解を可視化
 */
function visualizeODESystemSolution(solution) {
    // 時間に対する解のプロット
    const traceX = {
        x: solution.t,
        y: solution.x,
        type: 'scatter',
        mode: 'lines',
        name: 'x(t)',
        line: {
            color: 'blue',
            width: 2
        }
    };
    
    const traceY = {
        x: solution.t,
        y: solution.y,
        type: 'scatter',
        mode: 'lines',
        name: 'y(t)',
        line: {
            color: 'red',
            width: 2
        }
    };
    
    // 位相図（x-y平面）
    const tracePhase = {
        x: solution.x,
        y: solution.y,
        type: 'scatter',
        mode: 'lines',
        name: '位相図',
        line: {
            color: 'green',
            width: 2
        },
        xaxis: 'x2',
        yaxis: 'y2'
    };
    
    const layout = {
        grid: {
            rows: 2,
            columns: 1,
            pattern: 'independent'
        },
        title: '連立常微分方程式の解',
        xaxis: {
            title: 't',
            domain: [0, 1]
        },
        yaxis: {
            title: 'x(t), y(t)',
            domain: [0.55, 1]
        },
        xaxis2: {
            title: 'x',
            domain: [0, 1]
        },
        yaxis2: {
            title: 'y',
            domain: [0, 0.45]
        },
        showlegend: true
    };
    
    Plotly.newPlot('diff-eq-visualization', [traceX, traceY, tracePhase], layout);
}

/**
 * PDE（熱方程式・波動方程式）の解を可視化
 */
function visualizePDESolution(solution) {
    // 3Dサーフェスプロット
    const surfaceData = {
        x: solution.x,
        y: solution.t,
        z: solution.u,
        type: 'surface',
        colorscale: 'Viridis'
    };
    
    // 特定の時間での断面図
    const timeIndices = [0, Math.floor(solution.t.length / 4), Math.floor(solution.t.length / 2), solution.t.length - 1];
    const timeSlices = timeIndices.map(i => {
        return {
            x: solution.x,
            y: solution.u[i],
            type: 'scatter',
            mode: 'lines',
            name: `t = ${solution.t[i].toFixed(2)}`,
            xaxis: 'x2',
            yaxis: 'y2'
        };
    });
    
    const layout = {
        grid: {
            rows: 2,
            columns: 1,
            pattern: 'independent'
        },
        title: solution.type === 'pde-heat' ? '熱伝導方程式の解' : '波動方程式の解',
        scene: {
            xaxis: {title: 'x'},
            yaxis: {title: 't'},
            zaxis: {title: 'u(x,t)'},
            camera: {
                eye: {x: 1.5, y: 1.5, z: 1}
            },
            domain: {
                x: [0, 1],
                y: [0.5, 1]
            }
        },
        xaxis2: {
            title: 'x',
            domain: [0, 1]
        },
        yaxis2: {
            title: 'u(x,t)',
            domain: [0, 0.4]
        },
        showlegend: true,
        legend: {
            x: 0,
            y: 0.4
        }
    };
    
    Plotly.newPlot('diff-eq-visualization', [surfaceData, ...timeSlices], layout);
}

/**
 * ラプラス方程式の解を可視化
 */
function visualizeLaplaceSolution(solution) {
    // 2Dヒートマップ
    const heatmapData = {
        x: solution.x,
        y: solution.y,
        z: solution.u,
        type: 'heatmap',
        colorscale: 'Viridis',
        colorbar: {
            title: 'u(x,y)'
        }
    };
    
    // 3Dサーフェスプロット
    const surfaceData = {
        x: solution.x,
        y: solution.y,
        z: solution.u,
        type: 'surface',
        colorscale: 'Viridis',
        scene: 'scene2'
    };
    
    const layout = {
        grid: {
            rows: 1,
            columns: 2,
            pattern: 'independent'
        },
        title: 'ラプラス方程式の解',
        xaxis: {
            title: 'x',
            domain: [0, 0.45]
        },
        yaxis: {
            title: 'y',
            domain: [0, 1]
        },
        scene2: {
            xaxis: {title: 'x'},
            yaxis: {title: 'y'},
            zaxis: {title: 'u(x,y)'},
            camera: {
                eye: {x: 1.5, y: 1.5, z: 1}
            },
            domain: {
                x: [0.55, 1],
                y: [0, 1]
            }
        }
    };
    
    Plotly.newPlot('diff-eq-visualization', [heatmapData, surfaceData], layout);
}



