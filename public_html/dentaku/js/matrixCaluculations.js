/**
 * 行列計算機能
 */

function initializeMatrixCalculations() {
    const matrix1 = document.getElementById('matrix1');
    const matrix2 = document.getElementById('matrix2');
    const matrixOperation = document.getElementById('matrix-operation');
    const matrixPowerGroup = document.getElementById('matrix-power-group');
    const matrixPower = document.getElementById('matrix-power');
    const matrixCalcBtn = document.getElementById('matrix-calc-btn');
    const matrixLatexBtn = document.getElementById('matrix-latex-btn');
    const matrixOutput = document.getElementById('matrix-output');
    const matrixLatex = document.getElementById('matrix-latex');
    
    // 行列生成ボタンのイベントリスナー
    const generateMatrix1Btn = document.getElementById('generate-matrix1');
    const generateMatrix2Btn = document.getElementById('generate-matrix2');
    
    if (generateMatrix1Btn) {
        generateMatrix1Btn.addEventListener('click', () => {
            generateMatrixGrid('matrix1');
        });
    }
    
    if (generateMatrix2Btn) {
        generateMatrix2Btn.addEventListener('click', () => {
            generateMatrixGrid('matrix2');
        });
    }
    
    // 操作選択の変更イベント
    if (matrixOperation) {
        matrixOperation.addEventListener('change', () => {
            // 累乗の場合は指数入力を表示
            if (matrixOperation.value === 'power') {
                matrixPowerGroup.style.display = 'block';
            } else {
                matrixPowerGroup.style.display = 'none';
            }
        });
    }
    
    // 計算ボタンのイベントリスナー
    if (matrixCalcBtn) {
        matrixCalcBtn.addEventListener('click', calculateMatrix);
    }
    
    // LaTeX表示ボタンのイベントリスナー
    if (matrixLatexBtn) {
        matrixLatexBtn.addEventListener('click', displayMatrixLatex);
    }
    
    console.log('行列計算が初期化されました');
}

/**
 * 行列入力グリッドを生成
 * @param {string} matrixId - 行列のID
 */
function generateMatrixGrid(matrixId) {
    const rowsInput = document.getElementById(`${matrixId}-rows`);
    const colsInput = document.getElementById(`${matrixId}-cols`);
    const container = document.getElementById(`${matrixId}-generator-container`);
    
    if (!rowsInput || !colsInput || !container) return;
    
    const rows = parseInt(rowsInput.value);
    const cols = parseInt(colsInput.value);
    
    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1 || rows > 10 || cols > 10) {
        showNotification('行列のサイズは1〜10の範囲で指定してください', 'error');
        return;
    }
    
    // グリッドをクリア
    container.innerHTML = '';
    
    // グリッドのスタイルを設定
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    // 入力フィールドを生成
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'matrix-cell';
            input.dataset.row = i;
            input.dataset.col = j;
            input.value = '0';
            container.appendChild(input);
        }
    }
    
    // 生成ボタンを追加
    const applyButton = document.createElement('button');
    applyButton.textContent = '適用';
    applyButton.className = 'secondary-btn';
    applyButton.style.gridColumn = `1 / span ${cols}`;
    applyButton.addEventListener('click', () => {
        applyMatrixFromGrid(matrixId);
    });
    container.appendChild(applyButton);
}

/**
 * グリッドから行列を適用
 * @param {string} matrixId - 行列のID
 */
function applyMatrixFromGrid(matrixId) {
    const container = document.getElementById(`${matrixId}-generator-container`);
    const matrixTextarea = document.getElementById(matrixId);
    
    if (!container || !matrixTextarea) return;
    
    const cells = container.querySelectorAll('.matrix-cell');
    if (cells.length === 0) return;
    
    // 行と列の数を取得
    const rows = Math.max(...Array.from(cells).map(cell => parseInt(cell.dataset.row))) + 1;
    const cols = Math.max(...Array.from(cells).map(cell => parseInt(cell.dataset.col))) + 1;
    
    // 行列を構築
    const matrix = Array(rows).fill().map(() => Array(cols).fill(0));
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const value = parseFloat(cell.value);
        
        if (!isNaN(value)) {
            matrix[row][col] = value;
        }
    });
    
    // 行列をテキストエリアに設定
    matrixTextarea.value = JSON.stringify(matrix);
    
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
        const matrix1 = mathUtils.parseMatrix(matrix1Input.value);
        if (matrix1.length === 0) {
            matrixOutput.textContent = '行列1の形式が正しくありません';
            return;
        }
        
        // 操作を取得
        const operation = matrixOperationSelect.value;
        
        let result;
        let resultText;
        
        // 単項演算
        if (['determinant', 'inverse', 'transpose', 'eigenvalues', 'eigenvectors', 'rank', 'trace', 'lu', 'qr', 'svd'].includes(operation)) {
            switch (operation) {
                case 'determinant':
                    result = math.det(matrix1);
                    resultText = `行列式 |A| = ${mathUtils.formatNumber(result)}`;
                    break;
                case 'inverse':
                    result = math.inv(matrix1);
                    resultText = `逆行列 A^(-1) = ${mathUtils.formatMatrix(result)}`;
                    break;
                case 'transpose':
                    result = math.transpose(matrix1);
                    resultText = `転置行列 A^T = ${mathUtils.formatMatrix(result)}`;
                    break;
                case 'eigenvalues':
                    result = math.eigs(matrix1);
                    resultText = `固有値 = ${mathUtils.formatVector(result.values)}`;
                    break;
                case 'eigenvectors':
                    result = math.eigs(matrix1);
                    resultText = `固有ベクトル = ${mathUtils.formatMatrix(result.vectors)}`;
                    break;
                case 'rank':
                    result = math.rank(matrix1);
                    resultText = `ランク = ${result}`;
                    break;
                case 'trace':
                    result = math.trace(matrix1);
                    resultText = `トレース = ${mathUtils.formatNumber(result)}`;
                    break;
                case 'lu':
                    result = math.lup(matrix1);
                    resultText = `LU分解:\nL = ${mathUtils.formatMatrix(result.L)}\nU = ${mathUtils.formatMatrix(result.U)}\nP = ${mathUtils.formatMatrix(result.P)}`;
                    break;
                case 'qr':
                    result = math.qr(matrix1);
                    resultText = `QR分解:\nQ = ${mathUtils.formatMatrix(result.Q)}\nR = ${mathUtils.formatMatrix(result.R)}`;
                    break;
                case 'svd':
                    result = math.svd(matrix1);
                    resultText = `特異値分解:\nU = ${mathUtils.formatMatrix(result.U)}\nΣ = ${mathUtils.formatMatrix(math.diag(result.S))}\nV = ${mathUtils.formatMatrix(result.V)}`;
                    break;
            }
        } 
        // 累乗
        else if (operation === 'power') {
            const power = parseInt(matrixPowerInput.value);
            if (isNaN(power)) {
                matrixOutput.textContent = '指数は整数で指定してください';
                return;
            }
            
            result = math.pow(matrix1, power);
            resultText = `A^${power} = ${mathUtils.formatMatrix(result)}`;
        } 
        // 二項演算
        else {
            // 行列2を解析
            const matrix2 = mathUtils.parseMatrix(matrix2Input.value);
            if (matrix2.length === 0) {
                matrixOutput.textContent = '行列2の形式が正しくありません';
                return;
            }
            
            switch (operation) {
                case 'add':
                    result = math.add(matrix1, matrix2);
                    resultText = `A + B = ${mathUtils.formatMatrix(result)}`;
                    break;
                case 'subtract':
                    result = math.subtract(matrix1, matrix2);
                    resultText = `A - B = ${mathUtils.formatMatrix(result)}`;
                    break;
                case 'multiply':
                    result = math.multiply(matrix1, matrix2);
                    resultText = `A × B = ${mathUtils.formatMatrix(result)}`;
                    break;
            }
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
        const matrix1 = mathUtils.parseMatrix(matrix1Input.value);
        if (matrix1.length === 0) {
            matrixLatex.textContent = '行列1の形式が正しくありません';
            return;
        }
        
        // 行列1のLaTeX表現
        const matrix1Latex = mathUtils.matrixToLatex(matrix1);
        
        // 操作を取得
        const operation = matrixOperationSelect.value;
        
        let latexExpression = '';
        
        // 単項演算
        if (['determinant', 'inverse', 'transpose', 'eigenvalues', 'eigenvectors', 'rank', 'trace', 'lu', 'qr', 'svd'].includes(operation)) {
            switch (operation) {
                case 'determinant':
                    latexExpression = `\\det(${matrix1Latex}) = ${mathUtils.formatNumber(math.det(matrix1))}`;
                    break;
                case 'inverse':
                    latexExpression = `${matrix1Latex}^{-1} = ${mathUtils.matrixToLatex(math.inv(matrix1))}`;
                    break;
                case 'transpose':
                    latexExpression = `${matrix1Latex}^{T} = ${mathUtils.matrixToLatex(math.transpose(matrix1))}`;
                    break;
                case 'eigenvalues':
                    const eigenvalues = math.eigs(matrix1).values;
                    latexExpression = `\\text{固有値} = ${mathUtils.vectorToLatex(eigenvalues)}`;
                    break;
                case 'eigenvectors':
                    const eigenvectors = math.eigs(matrix1).vectors;
                    latexExpression = `\\text{固有ベクトル} = ${mathUtils.matrixToLatex(eigenvectors)}`;
                    break;
                case 'rank':
                    latexExpression = `\\text{rank}(${matrix1Latex}) = ${math.rank(matrix1)}`;
                    break;
                case 'trace':
                    latexExpression = `\\text{tr}(${matrix1Latex}) = ${mathUtils.formatNumber(math.trace(matrix1))}`;
                    break;
                case 'lu':
                    const lu = math.lup(matrix1);
                    latexExpression = `\\text{LU分解:} \\quad ${matrix1Latex} = ${mathUtils.matrixToLatex(lu.L)} \\cdot ${mathUtils.matrixToLatex(lu.U)} \\cdot ${mathUtils.matrixToLatex(lu.P)}`;
                    break;
                case 'qr':
                    const qr = math.qr(matrix1);
                    latexExpression = `\\text{QR分解:} \\quad ${matrix1Latex} = ${mathUtils.matrixToLatex(qr.Q)} \\cdot ${mathUtils.matrixToLatex(qr.R)}`;
                    break;
                case 'svd':
                    const svd = math.svd(matrix1);
                    latexExpression = `\\text{特異値分解:} \\quad ${matrix1Latex} = ${mathUtils.matrixToLatex(svd.U)} \\cdot ${mathUtils.matrixToLatex(math.diag(svd.S))} \\cdot ${mathUtils.matrixToLatex(svd.V)}`;
                    break;
            }
        } 
        // 累乗
        else if (operation === 'power') {
            const power = parseInt(matrixPowerInput.value);
            if (isNaN(power)) {
                matrixLatex.textContent = '指数は整数で指定してください';
                return;
            }
            
            latexExpression = `${matrix1Latex}^{${power}} = ${mathUtils.matrixToLatex(math.pow(matrix1, power))}`;
        } 
        // 二項演算
        else {
            // 行列2を解析
            const matrix2 = mathUtils.parseMatrix(matrix2Input.value);
            if (matrix2.length === 0) {
                matrixLatex.textContent = '行列2の形式が正しくありません';
                return;
            }
            
            // 行列2のLaTeX表現
            const matrix2Latex = mathUtils.matrixToLatex(matrix2);
            
            switch (operation) {
                case 'add':
                    latexExpression = `${matrix1Latex} + ${matrix2Latex} = ${mathUtils.matrixToLatex(math.add(matrix1, matrix2))}`;
                    break;
                case 'subtract':
                    latexExpression = `${matrix1Latex} - ${matrix2Latex} = ${mathUtils.matrixToLatex(math.subtract(matrix1, matrix2))}`;
                    break;
                case 'multiply':
                    latexExpression = `${matrix1Latex} \\times ${matrix2Latex} = ${mathUtils.matrixToLatex(math.multiply(matrix1, matrix2))}`;
                    break;
            }
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

