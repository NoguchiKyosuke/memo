/**
 * 線形代数機能
 */

function initializeLinearAlgebra() {
    // ベクトル計算の初期化
    initializeVectorCalculations();
    
    // 行列計算の初期化
    initializeMatrixCalculations();
    
    console.log('線形代数機能が初期化されました');
}

/**
 * ベクトル計算の初期化
 */
function initializeVectorCalculations() {
    const vectorTab = document.getElementById('vector');
    if (!vectorTab) return;
    
    const vector1Input = document.getElementById('vector1');
    const vector2Input = document.getElementById('vector2');
    const vector3Input = document.getElementById('vector3');
    const vectorOperationSelect = document.getElementById('vector-operation');
    const vector3Group = document.getElementById('vector3-group');
    const vectorCalcBtn = document.getElementById('vector-calc-btn');
    const vectorLatexBtn = document.getElementById('vector-latex-btn');
    const vectorVisualizeBtn = document.getElementById('vector-visualize-btn');
    
    // 操作変更時のイベント
    if (vectorOperationSelect) {
        vectorOperationSelect.addEventListener('change', function() {
            // スカラー三重積の場合はベクトル3を表示
            if (this.value === 'triple') {
                vector3Group.style.display = 'block';
            } else {
                vector3Group.style.display = 'none';
            }
        });
    }
    
    // 計算ボタンのイベント
    if (vectorCalcBtn) {
        vectorCalcBtn.addEventListener('click', calculateVector);
    }
    
    // LaTeXボタンのイベント
    if (vectorLatexBtn) {
        vectorLatexBtn.addEventListener('click', displayVectorLatex);
    }
    
    // 可視化ボタンのイベント
    if (vectorVisualizeBtn) {
        vectorVisualizeBtn.addEventListener('click', visualizeVector);
    }
    
    console.log('ベクトル計算機能が初期化されました');
}

/**
 * ベクトル計算を実行
 */
function calculateVector() {
    const vector1Input = document.getElementById('vector1');
    const vector2Input = document.getElementById('vector2');
    const vector3Input = document.getElementById('vector3');
    const vectorOperationSelect = document.getElementById('vector-operation');
    const vectorOutput = document.getElementById('vector-output');
    
    if (!vector1Input || !vectorOperationSelect || !vectorOutput) return;
    
    try {
        // ベクトル1を解析
        const vector1 = math.evaluate(vector1Input.value);
        
        // 操作を取得
        const operation = vectorOperationSelect.value;
        
        let result;
        let resultText;
        
        // 単項演算
        if (['magnitude', 'normalize'].includes(operation)) {
            switch (operation) {
                case 'magnitude':
                    result = math.norm(vector1);
                    resultText = `|v1| = ${result}`;
                    break;
                case 'normalize':
                    result = math.divide(vector1, math.norm(vector1));
                    resultText = `v1/|v1| = [${result.join(', ')}]`;
                    break;
            }
        } 
        // 二項演算
        else if (operation !== 'triple') {
            // ベクトル2を解析
            const vector2 = math.evaluate(vector2Input.value);
            
            switch (operation) {
                case 'add':
                    result = math.add(vector1, vector2);
                    resultText = `v1 + v2 = [${result.join(', ')}]`;
                    break;
                case 'subtract':
                    result = math.subtract(vector1, vector2);
                    resultText = `v1 - v2 = [${result.join(', ')}]`;
                    break;
                case 'dot':
                    result = math.dot(vector1, vector2);
                    resultText = `v1 · v2 = ${result}`;
                    break;
                case 'cross':
                    if (vector1.length !== 3 || vector2.length !== 3) {
                        throw new Error('外積は3次元ベクトルにのみ適用できます');
                    }
                    result = math.cross(vector1, vector2);
                    resultText = `v1 × v2 = [${result.join(', ')}]`;
                    break;
                case 'angle':
                    const dot = math.dot(vector1, vector2);
                    const norm1 = math.norm(vector1);
                    const norm2 = math.norm(vector2);
                    const cosTheta = dot / (norm1 * norm2);
                    result = Math.acos(Math.min(Math.max(cosTheta, -1), 1));
                    const degrees = result * 180 / Math.PI;
                    resultText = `角度 = ${result.toFixed(4)} rad (${degrees.toFixed(2)}°)`;
                    break;
                case 'projection':
                    const dotProduct = math.dot(vector1, vector2);
                    const normSquared = math.dot(vector2, vector2);
                    result = math.multiply(vector2, dotProduct / normSquared);
                    resultText = `proj_v2(v1) = [${result.join(', ')}]`;
                    break;
            }
        }
        // スカラー三重積
        else {
            // ベクトル2と3を解析
            const vector2 = math.evaluate(vector2Input.value);
            const vector3 = math.evaluate(vector3Input.value);
            
            if (vector1.length !== 3 || vector2.length !== 3 || vector3.length !== 3) {
                throw new Error('スカラー三重積は3次元ベクトルにのみ適用できます');
            }
            
            const crossProduct = math.cross(vector2, vector3);
            result = math.dot(vector1, crossProduct);
            resultText = `v1 · (v2 × v3) = ${result}`;
        }
        
        // 結果を表示
        vectorOutput.textContent = resultText;
        
        // 計算履歴に追加
        const expression = `ベクトル計算: ${operation}`;
        addToHistory(expression, resultText);
        
    } catch (error) {
        console.error('ベクトル計算エラー:', error);
        vectorOutput.textContent = `エラー: ${error.message}`;
    }
}

/**
 * ベクトル計算のLaTeX表示
 */
function displayVectorLatex() {
    const vector1Input = document.getElementById('vector1');
    const vector2Input = document.getElementById('vector2');
    const vector3Input = document.getElementById('vector3');
    const vectorOperationSelect = document.getElementById('vector-operation');
    const vectorLatex = document.getElementById('vector-latex');
    
    if (!vector1Input || !vectorOperationSelect || !vectorLatex) return;
    
    try {
        // ベクトル1を解析
        const vector1 = math.evaluate(vector1Input.value);
        
        // ベクトル1のLaTeX表現
        const vector1Latex = `\\vec{v}_1 = \\begin{bmatrix} ${vector1.join(' \\\\ ')} \\end{bmatrix}`;
        
        // 操作を取得
        const operation = vectorOperationSelect.value;
        
        let latexExpression = '';
        
        // 単項演算
        if (['magnitude', 'normalize'].includes(operation)) {
            switch (operation) {
                case 'magnitude':
                    const magnitude = math.norm(vector1);
                    latexExpression = `|\\vec{v}_1| = \\sqrt{${vector1.map(v => v * v).join(' + ')}} = ${magnitude}`;
                    break;
                case 'normalize':
                    const norm = math.norm(vector1);
                    const normalized = math.divide(vector1, norm);
                    latexExpression = `\\frac{\\vec{v}_1}{|\\vec{v}_1|} = \\frac{1}{${norm}} \\begin{bmatrix} ${vector1.join(' \\\\ ')} \\end{bmatrix} = \\begin{bmatrix} ${normalized.join(' \\\\ ')} \\end{bmatrix}`;
                    break;
            }
        } 
        // 二項演算
        else if (operation !== 'triple') {
            // ベクトル2を解析
            const vector2 = math.evaluate(vector2Input.value);
            
            // ベクトル2のLaTeX表現
            const vector2Latex = `\\vec{v}_2 = \\begin{bmatrix} ${vector2.join(' \\\\ ')} \\end{bmatrix}`;
            
            switch (operation) {
                case 'add':
                    const sum = math.add(vector1, vector2);
                    latexExpression = `${vector1Latex} + ${vector2Latex} = \\begin{bmatrix} ${sum.join(' \\\\ ')} \\end{bmatrix}`;
                    break;
                case 'subtract':
                    const diff = math.subtract(vector1, vector2);
                    latexExpression = `${vector1Latex} - ${vector2Latex} = \\begin{bmatrix} ${diff.join(' \\\\ ')} \\end{bmatrix}`;
                    break;
                case 'dot':
                    const dot = math.dot(vector1, vector2);
                    latexExpression = `\\vec{v}_1 \\cdot \\vec{v}_2 = ${vector1.map((v, i) => `${v} \\cdot ${vector2[i]}`).join(' + ')} = ${dot}`;
                    break;
                case 'cross':
                    if (vector1.length !== 3 || vector2.length !== 3) {
                        throw new Error('外積は3次元ベクトルにのみ適用できます');
                    }
                    const cross = math.cross(vector1, vector2);
                    latexExpression = `\\vec{v}_1 \\times \\vec{v}_2 = \\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ ${vector1.join(' & ')} \\\\ ${vector2.join(' & ')} \\end{vmatrix} = \\begin{bmatrix} ${cross.join(' \\\\ ')} \\end{bmatrix}`;
                    break;
                case 'angle':
                    const dotProduct = math.dot(vector1, vector2);
                    const norm1 = math.norm(vector1);
                    const norm2 = math.norm(vector2);
                    const cosTheta = dotProduct / (norm1 * norm2);
                    const angle = Math.acos(Math.min(Math.max(cosTheta, -1), 1));
                    const degrees = angle * 180 / Math.PI;
                    latexExpression = `\\cos \\theta = \\frac{\\vec{v}_1 \\cdot \\vec{v}_2}{|\\vec{v}_1| |\\vec{v}_2|} = \\frac{${dotProduct}}{${norm1} \\cdot ${norm2}} = ${cosTheta.toFixed(4)} \\Rightarrow \\theta = ${angle.toFixed(4)} \\text{ rad } (${degrees.toFixed(2)}^{\\circ})`;
                    break;
                case 'projection':
                    const dotProd = math.dot(vector1, vector2);
                    const normSquared = math.dot(vector2, vector2);
                    const projection = math.multiply(vector2, dotProd / normSquared);
                    latexExpression = `\\text{proj}_{\\vec{v}_2}(\\vec{v}_1) = \\frac{\\vec{v}_1 \\cdot \\vec{v}_2}{\\vec{v}_2 \\cdot \\vec{v}_2} \\vec{v}_2 = \\frac{${dotProd}}{${normSquared}} \\begin{bmatrix} ${vector2.join(' \\\\ ')} \\end{bmatrix} = \\begin{bmatrix} ${projection.join(' \\\\ ')} \\end{bmatrix}`;
                    break;
            }
        }
        // スカラー三重積
        else {
            // ベクトル2と3を解析
            const vector2 = math.evaluate(vector2Input.value);
            const vector3 = math.evaluate(vector3Input.value);
            
            if (vector1.length !== 3 || vector2.length !== 3 || vector3.length !== 3) {
                throw new Error('スカラー三重積は3次元ベクトルにのみ適用できます');
            }
            
            const vector2Latex = `\\vec{v}_2 = \\begin{bmatrix} ${vector2.join(' \\\\ ')} \\end{bmatrix}`;
            const vector3Latex = `\\vec{v}_3 = \\begin{bmatrix} ${vector3.join(' \\\\ ')} \\end{bmatrix}`;
            
            const crossProduct = math.cross(vector2, vector3);
            const tripleProduct = math.dot(vector1, crossProduct);
            
            latexExpression = `\\vec{v}_1 \\cdot (\\vec{v}_2 \\times \\vec{v}_3) = \\begin{bmatrix} ${vector1.join(' \\\\ ')} \\end{bmatrix} \\cdot \\begin{bmatrix} ${crossProduct.join(' \\\\ ')} \\end{bmatrix} = ${tripleProduct}`;
        }
        
        // LaTeXを表示
        vectorLatex.textContent = '';
        vectorLatex.innerHTML = `\\[${latexExpression}\\]`;
        
        // MathJaxを再描画
        if (window.MathJax) {
            MathJax.typesetPromise([vectorLatex]).catch(err => console.error('MathJax error:', err));
        }
        
    } catch (error) {
        console.error('ベクトルLaTeX変換エラー:', error);
        vectorLatex.textContent = `エラー: ${error.message}`;
    }
}

/**
 * ベクトルを可視化
 */
function visualizeVector() {
    const vector1Input = document.getElementById('vector1');
    const vector2Input = document.getElementById('vector2');
    const vector3Input = document.getElementById('vector3');
    const vectorOperationSelect = document.getElementById('vector-operation');
    const vectorVisualization = document.getElementById('vector-visualization');
    
    if (!vector1Input || !vectorVisualization) return;
    
    try {
        // ベクトル1を解析
        const vector1 = math.evaluate(vector1Input.value);
        
        // 3次元以上のベクトルは3次元に制限
        const v1 = vector1.slice(0, 3);
        while (v1.length < 3) v1.push(0);
        
        // 操作を取得
        const operation = vectorOperationSelect.value;
        
        // 可視化のためのデータを準備
        const traces = [];
        
        // 原点からベクトル1へのベクトル
        traces.push({
            type: 'scatter3d',
            mode: 'lines',
            x: [0, v1[0]],
            y: [0, v1[1]],
            z: [0, v1[2]],
            line: { color: 'blue', width: 6 },
            name: 'v1'
        });
        
        // 二項演算または三重積の場合はベクトル2も表示
        if (!['magnitude', 'normalize'].includes(operation)) {
            // ベクトル2を解析
            const vector2 = math.evaluate(vector2Input.value);
            
            // 3次元以上のベクトルは3次元に制限
            const v2 = vector2.slice(0, 3);
            while (v2.length < 3) v2.push(0);
            
            // 原点からベクトル2へのベクトル
            traces.push({
                type: 'scatter3d',
                mode: 'lines',
                x: [0, v2[0]],
                y: [0, v2[1]],
                z: [0, v2[2]],
                line: { color: 'red', width: 6 },
                name: 'v2'
            });
            
            // 操作に応じた追加の可視化
            switch (operation) {
                case 'add':
                    const sum = math.add(v1, v2);
                    // ベクトル和
                    traces.push({
                        type: 'scatter3d',
                        mode: 'lines',
                        x: [0, sum[0]],
                        y: [0, sum[1]],
                        z: [0, sum[2]],
                        line: { color: 'purple', width: 6 },
                        name: 'v1 + v2'
                    });
                    // 平行四辺形の可視化
                    traces.push({
                        type: 'scatter3d',
                        mode: 'lines',
                        x: [0, v1[0], sum[0], v2[0], 0],
                        y: [0, v1[1], sum[1], v2[1], 0],
                        z: [0, v1[2], sum[2], v2[2], 0],
                        line: { color: 'gray', width: 2, dash: 'dash' },
                        name: '平行四辺形'
                    });
                    break;
                case 'subtract':
                    const diff = math.subtract(v1, v2);
                    // ベクトル差
                    traces.push({
                        type: 'scatter3d',
                        mode: 'lines',
                        x: [0, diff[0]],
                        y: [0, diff[1]],
                        z: [0, diff[2]],
                        line: { color: 'green', width: 6 },
                        name: 'v1 - v2'
                    });
                    // v2をv1の始点に移動した可視化
                    traces.push({
                        type: 'scatter3d',
                        mode: 'lines',
                        x: [v1[0], v1[0] - v2[0]],
                        y: [v1[1], v1[1] - v2[1]],
                        z: [v1[2], v1[2] - v2[2]],
                        line: { color: 'gray', width: 2, dash: 'dash' },
                        name: '-v2'
                    });
                    break;
                case 'cross':
                    if (v1.length === 3 && v2.length === 3) {
                        const cross = math.cross(v1, v2);
                        // 外積ベクトル
                        traces.push({
                            type: 'scatter3d',
                            mode: 'lines',
                            x: [0, cross[0]],
                            y: [0, cross[1]],
                            z: [0, cross[2]],
                            line: { color: 'green', width: 6 },
                            name: 'v1 × v2'
                        });
                        // v1とv2が張る平面の可視化
                        const norm = math.norm(cross);
                        if (norm > 0.001) { // 外積が0でない場合
                            const normalizedCross = math.divide(cross, norm);
                            const planeSize = Math.max(math.norm(v1), math.norm(v2));
                            const planePoints = generatePlanePoints(v1, v2, planeSize);
                            traces.push({
                                type: 'mesh3d',
                                x: planePoints.x,
                                y: planePoints.y,
                                z: planePoints.z,
                                opacity: 0.5,
                                color: 'lightblue',
                                name: 'v1-v2平面'
                            });
                        }
                    }
                    break;
                case 'projection':
                    const dotProduct = math.dot(v1, v2);
                    const normSquared = math.dot(v2, v2);
                    const projection = math.multiply(v2, dotProduct / normSquared);
                    // 射影ベクトル
                    traces.push({
                        type: 'scatter3d',
                        mode: 'lines',
                        x: [0, projection[0]],
                        y: [0, projection[1]],
                        z: [0, projection[2]],
                        line: { color: 'green', width: 6 },
                        name: 'proj_v2(v1)'
                    });
                    // v1から射影への線
                    traces.push({
                        type: 'scatter3d',
                        mode: 'lines',
                        x: [v1[0], projection[0]],
                        y: [v1[1], projection[1]],
                        z: [v1[2], projection[2]],
                        line: { color: 'gray', width: 2, dash: 'dash' },
                        name: '垂線'
                    });
                    break;
                case 'triple':
                    // ベクトル3を解析
                    const vector3 = math.evaluate(vector3Input.value);
                    
                    // 3次元以上のベクトルは3次元に制限
                    const v3 = vector3.slice(0, 3);
                    while (v3.length < 3) v3.push(0);
                    
                    // 原点からベクトル3へのベクトル
                    traces.push({
                        type: 'scatter3d',
                        mode: 'lines',
                        x: [0, v3[0]],
                        y: [0, v3[1]],
                        z: [0, v3[2]],
                        line: { color: 'green', width: 6 },
                        name: 'v3'
                    });
                    
                    // v2とv3の外積
                    const cross = math.cross(v2, v3);
                    traces.push({
                        type: 'scatter3d',
                        mode: 'lines',
                        x: [0, cross[0]],
                        y: [0, cross[1]],
                        z: [0, cross[2]],
                        line: { color: 'purple', width: 6 },
                        name: 'v2 × v3'
                    });
                    
                    // v2とv3が張る平行四辺形の可視化
                    traces.push({
                        type: 'scatter3d',
                        mode: 'lines',
                        x: [0, v2[0], v2[0] + v3[0], v3[0], 0],
                        y: [0, v2[1], v2[1] + v3[1], v3[1], 0],
                        z: [0, v2[2], v2[2] + v3[2], v3[2], 0],
                        line: { color: 'gray', width: 2, dash: 'dash' },
                        name: '平行四辺形'
                    });
                    break;
            }
        }
        
        // レイアウト設定
        const layout = {
            title: 'ベクトル可視化',
            autosize: true,
            height: 500,
            scene: {
                xaxis: { title: 'X', range: [-10, 10] },
                yaxis: { title: 'Y', range: [-10, 10] },
                zaxis: { title: 'Z', range: [-10, 10] },
                aspectratio: { x: 1, y: 1, z: 1 }
            }
        };
        
        // プロットを描画
        Plotly.newPlot(vectorVisualization, traces, layout);
        
    } catch (error) {
        console.error('ベクトル可視化エラー:', error);
        vectorVisualization.textContent = `エラー: ${error.message}`;
    }
}

/**
 * 平面の点を生成
 * @param {Array} v1 - ベクトル1
 * @param {Array} v2 - ベクトル2
 * @param {number} size - 平面のサイズ
 * @returns {Object} 平面の点の座標
 */
function generatePlanePoints(v1, v2, size) {
    const points = { x: [], y: [], z: [] };
    const steps = 10;
    const halfSize = size / 2;
    
    for (let i = -steps; i <= steps; i++) {
        for (let j = -steps; j <= steps; j++) {
            const a = (i / steps) * halfSize;
            const b = (j / steps) * halfSize;
            const point = math.add(
                math.multiply(v1, a / math.norm(v1)),
                math.multiply(v2, b / math.norm(v2))
            );
            points.x.push(point[0]);
            points.y.push(point[1]);
            points.z.push(point[2]);
        }
    }
    
    return points;
}

/**
 * 行列計算の初期化
 */
function initializeMatrixCalculations() {
    const matrixTab = document.getElementById('matrix');
    if (!matrixTab) return;
    
    const matrix1 = document.getElementById('matrix1');
    const matrix2 = document.getElementById('matrix2');
    const matrixOperation = document.getElementById('matrix-operation');
    const matrixPowerGroup = document.getElementById('matrix-power-group');
    const matrixCalcBtn = document.getElementById('matrix-calc-btn');
    const matrixLatexBtn = document.getElementById('matrix-latex-btn');
    
    // 行列生成ボタンのイベント
    const generateMatrix1Btn = document.getElementById('generate-matrix1');
    const generateMatrix2Btn = document.getElementById('generate-matrix2');
    
    if (generateMatrix1Btn) {
        generateMatrix1Btn.addEventListener('click', () => {
            generateMatrixInputGrid('matrix1');
        });
    }
    
    if (generateMatrix2Btn) {
        generateMatrix2Btn.addEventListener('click', () => {
            generateMatrixInputGrid('matrix2');
        });
    }
    
    // 操作変更時のイベント
    if (matrixOperation) {
        matrixOperation.addEventListener('change', function() {
            // 累乗の場合は指数入力を表示
            if (this.value === 'power') {
                matrixPowerGroup.style.display = 'block';
            } else {
                matrixPowerGroup.style.display = 'none';
            }
        });
    }
    
    // 計算ボタンのイベント
    if (matrixCalcBtn) {
        matrixCalcBtn.addEventListener('click', calculateMatrix);
    }
    
    // LaTeXボタンのイベント
    if (matrixLatexBtn) {
        matrixLatexBtn.addEventListener('click', displayMatrixLatex);
    }
    
    console.log('行列計算機能が初期化されました');
}

/**
 * 行列入力グリッドを生成
 * @param {string} matrixId - 行列のID
 */
function generateMatrixInputGrid(matrixId) {
    const rowsInput = document.getElementById(`${matrixId}-rows`);
    const colsInput = document.getElementById(`${matrixId}-cols`);
    const container = document.getElementById(`${matrixId}-generator-container`);
    
    if (!rowsInput || !colsInput || !container) return;
    
    const rows = parseInt(rowsInput.value);
    const cols = parseInt(colsInput.value);
    
    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1 || rows > 10 || cols > 10) {
        showNotification('行と列は1から10の間で指定してください', 'error');
        return;
    }
    
    // コンテナをクリア
    container.innerHTML = '';
    
    // グリッドのスタイルを設定
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gap = '5px';
    container.style.margin = '10px 0';
    
    // 入力フィールドを生成
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'matrix-cell';
            input.dataset.row = i;
            input.dataset.col = j;
            input.value = '0';
            input.style.width = '100%';
            input.style.textAlign = 'center';
            container.appendChild(input);
        }
    }
    
    // 適用ボタンを追加
    const applyButton = document.createElement('button');
    applyButton.textContent = '適用';
    applyButton.className = 'secondary-btn';
    applyButton.style.gridColumn = `1 / span ${cols}`;
    applyButton.style.marginTop = '10px';
    applyButton.addEventListener('click', () => {
        applyMatrixFromGrid(matrixId, rows, cols);
    });
    container.appendChild(applyButton);
}

/**
 * グリッドから行列を適用
 * @param {string} matrixId - 行列のID
 * @param {number} rows - 行数
 * @param {number} cols - 列数
 */
function applyMatrixFromGrid(matrixId, rows, cols) {
    const container = document.getElementById(`${matrixId}-generator-container`);
    const matrixInput = document.getElementById(matrixId);
    
    if (!container || !matrixInput) return;
    
    // 行列データを収集
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const input = container.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
            if (input) {
                const value = parseFloat(input.value);
                row.push(isNaN(value) ? 0 : value);
            } else {
                row.push(0);
            }
        }
        matrix.push(row);
    }
    
    // 行列をテキストエリアに設定
    matrixInput.value = JSON.stringify(matrix);
    
    showNotification('行列が適用されました', 'success');
}

/**
 * 行列計算を実行
 */
function calculateMatrix() {
    const matrix1Input = document.getElementById('matrix1');
    const matrix2Input = document.getElementById('matrix2');
    const matrixOperationSelect = document.getElementById('matrix-operation');
    const matrixPowerInput = document.getElementById('matrix-power');
    const matrixOutput = document.getElementById('matrix-output');
    
    if (!matrix1Input || !matrixOperationSelect || !matrixOutput) return;
    
    try {
        // 行列1を解析
        const matrix1 = math.evaluate(matrix1Input.value);
        
        // 操作を取得
        const operation = matrixOperationSelect.value;
        
        let result;
        let resultText;
        
        // 単項演算
        if (['determinant', 'inverse', 'transpose', 'eigenvalues', 'eigenvectors', 'rank', 'trace', 'lu', 'qr', 'svd'].includes(operation)) {
            switch (operation) {
                case 'determinant':
                    result = math.det(matrix1);
                    resultText = `行列式 |A| = ${result}`;
                    break;
                case 'inverse':
                    result = math.inv(matrix1);
                    resultText = `逆行列 A^(-1) = ${formatMatrix(result)}`;
                    break;
                case 'transpose':
                    result = math.transpose(matrix1);
                    resultText = `転置行列 A^T = ${formatMatrix(result)}`;
                    break;
                case 'eigenvalues':
                    result = math.eigs(matrix1);
                    resultText = `固有値 = ${formatVector(result.values)}`;
                    break;
                case 'eigenvectors':
                    result = math.eigs(matrix1);
                    resultText = `固有ベクトル = ${formatMatrix(result.vectors)}`;
                    break;
                case 'rank':
                    // SVDを使用してランクを計算
                    const svd = math.svd(matrix1);
                    const tol = 1e-10;
                    const singularValues = svd.s;
                    result = singularValues.filter(v => Math.abs(v) > tol).length;
                    resultText = `ランク = ${result}`;
                    break;
                case 'trace':
                    result = math.trace(matrix1);
                    resultText = `トレース = ${result}`;
                    break;
                case 'lu':
                    result = math.lup(matrix1);
                    resultText = `LU分解:\nL = ${formatMatrix(result.L)}\nU = ${formatMatrix(result.U)}\nP = ${formatMatrix(result.P)}`;
                    break;
                case 'qr':
                    result = math.qr(matrix1);
                    resultText = `QR分解:\nQ = ${formatMatrix(result.Q)}\nR = ${formatMatrix(result.R)}`;
                    break;
                case 'svd':
                    result = math.svd(matrix1);
                    resultText = `特異値分解:\nU = ${formatMatrix(result.U)}\nΣ = ${formatDiagonalMatrix(result.s)}\nV = ${formatMatrix(result.V)}`;
                    break;
            }
        } 
        // 二項演算
        else if (operation !== 'power') {
            // 行列2を解析
            const matrix2 = math.evaluate(matrix2Input.value);
            
            switch (operation) {
                case 'add':
                    result = math.add(matrix1, matrix2);
                    resultText = `A + B = ${formatMatrix(result)}`;
                    break;
                case 'subtract':
                    result = math.subtract(matrix1, matrix2);
                    resultText = `A - B = ${formatMatrix(result)}`;
                    break;
                case 'multiply':
                    result = math.multiply(matrix1, matrix2);
                    resultText = `A × B = ${formatMatrix(result)}`;
                    break;
            }
        }
        // 累乗
        else {
            const power = parseInt(matrixPowerInput.value);
            if (isNaN(power)) {
                throw new Error('指数は整数で指定してください');
            }
            
            result = math.pow(matrix1, power);
            resultText = `A^${power} = ${formatMatrix(result)}`;
        }
        
        // 結果を表示
        matrixOutput.textContent = resultText;
        
        // 計算履歴に追加
        const expression = `行列計算: ${operation}`;
        addToHistory(expression, resultText);
        
    } catch (error) {
        console.error('行列計算エラー:', error);
        matrixOutput.textContent = `エラー: ${error.message}`;
    }
}

/**
 * 行列計算のLaTeX表示
 */
function displayMatrixLatex() {
    const matrix1Input = document.getElementById('matrix1');
    const matrix2Input = document.getElementById('matrix2');
    const matrixOperationSelect = document.getElementById('matrix-operation');
    const matrixPowerInput = document.getElementById('matrix-power');
    const matrixLatex = document.getElementById('matrix-latex');
    
    if (!matrix1Input || !matrixOperationSelect || !matrixLatex) return;
    
    try {
        // 行列1を解析
        const matrix1 = math.evaluate(matrix1Input.value);
        
        // 行列1のLaTeX表現
        const matrix1Latex = matrixToLatex(matrix1);
        
        // 操作を取得
        const operation = matrixOperationSelect.value;
        
        let latexExpression = '';
        
        // 単項演算
        if (['determinant', 'inverse', 'transpose', 'eigenvalues', 'eigenvectors', 'rank', 'trace', 'lu', 'qr', 'svd'].includes(operation)) {
            switch (operation) {
                case 'determinant':
                    const det = math.det(matrix1);
                    latexExpression = `\\det(A) = \\begin{vmatrix} ${matrixToLatexContent(matrix1)} \\end{vmatrix} = ${det}`;
                    break;
                case 'inverse':
                    const inv = math.inv(matrix1);
                    latexExpression = `A^{-1} = ${matrixToLatex(inv)}`;
                    break;
                case 'transpose':
                    const trans = math.transpose(matrix1);
                    latexExpression = `A^{T} = ${matrixToLatex(trans)}`;
                    break;
                case 'eigenvalues':
                    const eig = math.eigs(matrix1);
                    latexExpression = `\\lambda = ${vectorToLatex(eig.values)}`;
                    break;
                case 'eigenvectors':
                    const eigVec = math.eigs(matrix1);
                    latexExpression = `\\text{固有ベクトル} = ${matrixToLatex(eigVec.vectors)}`;
                    break;
                case 'rank':
                    const svd = math.svd(matrix1);
                    const tol = 1e-10;
                    const singularValues = svd.s;
                    const rank = singularValues.filter(v => Math.abs(v) > tol).length;
                    latexExpression = `\\text{rank}(A) = ${rank}`;
                    break;
                case 'trace':
                    const trace = math.trace(matrix1);
                    latexExpression = `\\text{tr}(A) = ${trace}`;
                    break;
                case 'lu':
                    const lu = math.lup(matrix1);
                    latexExpression = `\\text{LU分解:} \\\\
                        L = ${matrixToLatex(lu.L)} \\\\
                        U = ${matrixToLatex(lu.U)} \\\\
                        P = ${matrixToLatex(lu.P)}`;
                    break;
                case 'qr':
                    const qr = math.qr(matrix1);
                    latexExpression = `\\text{QR分解:} \\\\
                        Q = ${matrixToLatex(qr.Q)} \\\\
                        R = ${matrixToLatex(qr.R)}`;
                    break;
                case 'svd':
                    const svdResult = math.svd(matrix1);
                    latexExpression = `\\text{特異値分解:} \\\\
                        U = ${matrixToLatex(svdResult.U)} \\\\
                        \\Sigma = ${diagonalMatrixToLatex(svdResult.s)} \\\\
                        V = ${matrixToLatex(svdResult.V)}`;
                    break;
            }
        } 
        // 二項演算
        else if (operation !== 'power') {
            // 行列2を解析
            const matrix2 = math.evaluate(matrix2Input.value);
            
            // 行列2のLaTeX表現
            const matrix2Latex = matrixToLatex(matrix2);
            
            switch (operation) {
                case 'add':
                    const sum = math.add(matrix1, matrix2);
                    latexExpression = `${matrix1Latex} + ${matrix2Latex} = ${matrixToLatex(sum)}`;
                    break;
                case 'subtract':
                    const diff = math.subtract(matrix1, matrix2);
                    latexExpression = `${matrix1Latex} - ${matrix2Latex} = ${matrixToLatex(diff)}`;
                    break;
                case 'multiply':
                    const product = math.multiply(matrix1, matrix2);
                    latexExpression = `${matrix1Latex} \\times ${matrix2Latex} = ${matrixToLatex(product)}`;
                    break;
            }
        }
        // 累乗
        else {
            const power = parseInt(matrixPowerInput.value);
            if (isNaN(power)) {
                throw new Error('指数は整数で指定してください');
            }
            
            const result = math.pow(matrix1, power);
            latexExpression = `${matrix1Latex}^{${power}} = ${matrixToLatex(result)}`;
        }
        
        // LaTeXを表示
        matrixLatex.textContent = '';
        matrixLatex.innerHTML = `\\[${latexExpression}\\]`;
        
        // MathJaxを再描画
        if (window.MathJax) {
            MathJax.typesetPromise([matrixLatex]).catch(err => console.error('MathJax error:', err));
        }
        
    } catch (error) {
        console.error('行列LaTeX変換エラー:', error);
        matrixLatex.textContent = `エラー: ${error.message}`;
    }
}

/**
 * 行列を整形された文字列に変換
 * @param {Array} matrix - 行列
 * @returns {string} 整形された行列
 */
function formatMatrix(matrix) {
    return JSON.stringify(matrix)
        .replace(/],/g, '],\n ')
        .replace(/\[\[/g, '[\n [')
        .replace(/]]/g, ']\n]');
}

/**
 * ベクトルを整形された文字列に変換
 * @param {Array} vector - ベクトル
 * @returns {string} 整形されたベクトル
 */
function formatVector(vector) {
    return JSON.stringify(vector);
}

/**
 * 対角行列を整形された文字列に変換
 * @param {Array} diag - 対角成分
 * @returns {string} 整形された対角行列
 */
function formatDiagonalMatrix(diag) {
    const n = diag.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        matrix[i][i] = diag[i];
    }
    
    return formatMatrix(matrix);
}

/**
 * 行列をLaTeX形式に変換
 * @param {Array} matrix - 行列
 * @returns {string} LaTeX形式の行列
 */
function matrixToLatex(matrix) {
    return `\\begin{bmatrix} ${matrixToLatexContent(matrix)} \\end{bmatrix}`;
}

/**
 * 行列の内容をLaTeX形式に変換
 * @param {Array} matrix - 行列
 * @returns {string} LaTeX形式の行列内容
 */
function matrixToLatexContent(matrix) {
    return matrix.map(row => row.join(' & ')).join(' \\\\ ');
}

/**
 * ベクトルをLaTeX形式に変換
 * @param {Array} vector - ベクトル
 * @returns {string} LaTeX形式のベクトル
 */
function vectorToLatex(vector) {
    return `\\begin{bmatrix} ${vector.join(' \\\\ ')} \\end{bmatrix}`;
}

/**
 * 対角行列をLaTeX形式に変換
 * @param {Array} diag - 対角成分
 * @returns {string} LaTeX形式の対角行列
 */
function diagonalMatrixToLatex(diag) {
    const n = diag.length;
    const matrix = Array(n).fill().map(() => Array(n).fill('0'));
    
    for (let i = 0; i < n; i++) {
        matrix[i][i] = diag[i].toString();
    }
    
    return `\\begin{bmatrix} ${matrix.map(row => row.join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
}



