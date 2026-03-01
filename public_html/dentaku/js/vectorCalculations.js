/**
 * ベクトル計算機能
 */

function initializeVectorCalculations() {
    const vector1Input = document.getElementById('vector1');
    const vector2Input = document.getElementById('vector2');
    const vector3Input = document.getElementById('vector3');
    const vectorOperationSelect = document.getElementById('vector-operation');
    const vector3Group = document.getElementById('vector3-group');
    const vectorCalcBtn = document.getElementById('vector-calc-btn');
    const vectorLatexBtn = document.getElementById('vector-latex-btn');
    const vectorVisualizeBtn = document.getElementById('vector-visualize-btn');
    const vectorOutput = document.getElementById('vector-output');
    const vectorLatex = document.getElementById('vector-latex');
    const vectorVisualization = document.getElementById('vector-visualization');
    
    // 操作選択の変更イベント
    if (vectorOperationSelect) {
        vectorOperationSelect.addEventListener('change', () => {
            // スカラー三重積の場合はベクトル3を表示
            if (vectorOperationSelect.value === 'triple') {
                vector3Group.style.display = 'block';
            } else {
                vector3Group.style.display = 'none';
            }
        });
    }
    
    // 計算ボタンのイベントリスナー
    if (vectorCalcBtn) {
        vectorCalcBtn.addEventListener('click', calculateVector);
    }
    
    // LaTeX表示ボタンのイベントリスナー
    if (vectorLatexBtn) {
        vectorLatexBtn.addEventListener('click', displayVectorLatex);
    }
    
    // 可視化ボタンのイベントリスナー
    if (vectorVisualizeBtn) {
        vectorVisualizeBtn.addEventListener('click', visualizeVector);
    }
    
    console.log('ベクトル計算が初期化されました');
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
        const vector1 = mathUtils.parseVector(vector1Input.value);
        if (vector1.length === 0) {
            vectorOutput.textContent = 'ベクトル1の形式が正しくありません';
            return;
        }
        
        // 操作を取得
        const operation = vectorOperationSelect.value;
        
        let result;
        
        // 単項演算
        if (operation === 'magnitude' || operation === 'normalize') {
            switch (operation) {
                case 'magnitude':
                    result = math.norm(vector1);
                    vectorOutput.textContent = `|v1| = ${mathUtils.formatNumber(result)}`;
                    break;
                case 'normalize':
                    result = math.divide(vector1, math.norm(vector1));
                    vectorOutput.textContent = `v1/|v1| = ${mathUtils.formatVector(result)}`;
                    break;
            }
        } 
        // 二項演算
        else if (operation !== 'triple') {
            // ベクトル2を解析
            const vector2 = mathUtils.parseVector(vector2Input.value);
            if (vector2.length === 0) {
                vectorOutput.textContent = 'ベクトル2の形式が正しくありません';
                return;
            }
            
            switch (operation) {
                case 'add':
                    result = math.add(vector1, vector2);
                    vectorOutput.textContent = `v1 + v2 = ${mathUtils.formatVector(result)}`;
                    break;
                case 'subtract':
                    result = math.subtract(vector1, vector2);
                    vectorOutput.textContent = `v1 - v2 = ${mathUtils.formatVector(result)}`;
                    break;
                case 'dot':
                    result = math.dot(vector1, vector2);
                    vectorOutput.textContent = `v1 · v2 = ${mathUtils.formatNumber(result)}`;
                    break;
                case 'cross':
                    // 外積は3次元ベクトルのみ
                    if (vector1.length !== 3 || vector2.length !== 3) {
                        vectorOutput.textContent = '外積は3次元ベクトルのみ計算できます';
                        return;
                    }
                    result = math.cross(vector1, vector2);
                    vectorOutput.textContent = `v1 × v2 = ${mathUtils.formatVector(result)}`;
                    break;
                case 'angle':
                    const dot = math.dot(vector1, vector2);
                    const norm1 = math.norm(vector1);
                    const norm2 = math.norm(vector2);
                    const cosTheta = dot / (norm1 * norm2);
                    // 数値誤差を考慮
                    const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));
                    const angleRad = Math.acos(clampedCosTheta);
                    const angleDeg = angleRad * 180 / Math.PI;
                    vectorOutput.textContent = `角度 = ${mathUtils.formatNumber(angleDeg)}° (${mathUtils.formatNumber(angleRad)} rad)`;
                    break;
                case 'projection':
                    const dotProduct = math.dot(vector1, vector2);
                    const normSquared = math.dot(vector2, vector2);
                    result = math.multiply(vector2, dotProduct / normSquared);
                    vectorOutput.textContent = `proj_v2(v1) = ${mathUtils.formatVector(result)}`;
                    break;
            }
        } 
        // スカラー三重積
        else {
            // ベクトル2と3を解析
            const vector2 = mathUtils.parseVector(vector2Input.value);
            const vector3 = mathUtils.parseVector(vector3Input.value);
            
            if (vector2.length === 0 || vector3.length === 0) {
                vectorOutput.textContent = 'ベクトル2または3の形式が正しくありません';
                return;
            }
            
            // 3次元ベクトルのみ
            if (vector1.length !== 3 || vector2.length !== 3 || vector3.length !== 3) {
                vectorOutput.textContent = 'スカラー三重積は3次元ベクトルのみ計算できます';
                return;
            }
            
            const crossProduct = math.cross(vector2, vector3);
            result = math.dot(vector1, crossProduct);
            vectorOutput.textContent = `v1 · (v2 × v3) = ${mathUtils.formatNumber(result)}`;
        }
        
        // 計算履歴に追加
        const expression = `ベクトル計算: ${operation}`;
        addToHistory(expression, vectorOutput.textContent);
        
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
        const vector1 = mathUtils.parseVector(vector1Input.value);
        if (vector1.length === 0) {
            vectorLatex.textContent = 'ベクトル1の形式が正しくありません';
            return;
        }
        
        // ベクトル1のLaTeX表現
        const vector1Latex = mathUtils.vectorToLatex(vector1);
        
        // 操作を取得
        const operation = vectorOperationSelect.value;
        
        let latexExpression = '';
        
        // 単項演算
        if (operation === 'magnitude' || operation === 'normalize') {
            switch (operation) {
                case 'magnitude':
                    latexExpression = `\\left|${vector1Latex}\\right|`;
                    break;
                case 'normalize':
                    latexExpression = `\\frac{${vector1Latex}}{\\left|${vector1Latex}\\right|}`;
                    break;
            }
        } 
        // 二項演算
        else if (operation !== 'triple') {
            // ベクトル2を解析
            const vector2 = mathUtils.parseVector(vector2Input.value);
            if (vector2.length === 0) {
                vectorLatex.textContent = 'ベクトル2の形式が正しくありません';
                return;
            }
            
            // ベクトル2のLaTeX表現
            const vector2Latex = mathUtils.vectorToLatex(vector2);
            
            switch (operation) {
                case 'add':
                    latexExpression = `${vector1Latex} + ${vector2Latex}`;
                    break;
                case 'subtract':
                    latexExpression = `${vector1Latex} - ${vector2Latex}`;
                    break;
                case 'dot':
                    latexExpression = `${vector1Latex} \\cdot ${vector2Latex}`;
                    break;
                case 'cross':
                    latexExpression = `${vector1Latex} \\times ${vector2Latex}`;
                    break;
                case 'angle':
                    latexExpression = `\\cos^{-1}\\left(\\frac{${vector1Latex} \\cdot ${vector2Latex}}{\\left|${vector1Latex}\\right| \\left|${vector2Latex}\\right|}\\right)`;
                    break;
                case 'projection':
                    latexExpression = `\\text{proj}_{${vector2Latex}}(${vector1Latex}) = \\frac{${vector1Latex} \\cdot ${vector2Latex}}{${vector2Latex} \\cdot ${vector2Latex}} ${vector2Latex}`;
                    break;
            }
        } 
        // スカラー三重積
        else {
            // ベクトル2と3を解析
            const vector2 = mathUtils.parseVector(vector2Input.value);
            const vector3 = mathUtils.parseVector(vector3Input.value);
            
            if (vector2.length === 0 || vector3.length === 0) {
                vectorLatex.textContent = 'ベクトル2または3の形式が正しくありません';
                return;
            }
            
            // ベクトル2と3のLaTeX表現
            const vector2Latex = mathUtils.vectorToLatex(vector2);
            const vector3Latex = mathUtils.vectorToLatex(vector3);
            
            latexExpression = `${vector1Latex} \\cdot (${vector2Latex} \\times ${vector3Latex})`;
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
        const vector1 = mathUtils.parseVector(vector1Input.value);
        if (vector1.length === 0) {
            vectorVisualization.textContent = 'ベクトル1の形式が正しくありません';
            return;
        }
        
        // 操作を取得
        const operation = vectorOperationSelect.value;
        
        // 可視化のためのデータを準備
        const traces = [];
        
        // ベクトル1を追加
        traces.push(createVectorTrace(vector1, 'ベクトル1', 'blue'));
        
        // 二項演算または三重積の場合はベクトル2も追加
        if (operation !== 'magnitude' && operation !== 'normalize') {
            const vector2 = mathUtils.parseVector(vector2Input.value);
            if (vector2.length === 0) {
                vectorVisualization.textContent = 'ベクトル2の形式が正しくありません';
                return;
            }
            
            traces.push(createVectorTrace(vector2, 'ベクトル2', 'red'));
            
            // 結果ベクトルを追加（該当する場合）
            if (operation === 'add' || operation === 'subtract' || operation === 'cross') {
                let resultVector;
                let resultName;
                
                switch (operation) {
                    case 'add':
                        resultVector = math.add(vector1, vector2);
                        resultName = 'v1 + v2';
                        break;
                    case 'subtract':
                        resultVector = math.subtract(vector1, vector2);
                        resultName = 'v1 - v2';
                        break;
                    case 'cross':
                        if (vector1.length === 3 && vector2.length === 3) {
                            resultVector = math.cross(vector1, vector2);
                            resultName = 'v1 × v2';
                        }
                        break;
                }
                
                if (resultVector) {
                    traces.push(createVectorTrace(resultVector, resultName, 'green'));
                }
            }
            
            // 射影ベクトルを追加
            if (operation === 'projection') {
                const dotProduct = math.dot(vector1, vector2);
                const normSquared = math.dot(vector2, vector2);
                const projectionVector = math.multiply(vector2, dotProduct / normSquared);
                
                traces.push(createVectorTrace(projectionVector, 'proj_v2(v1)', 'green'));
            }
            
            // 三重積の場合はベクトル3も追加
            if (operation === 'triple') {
                const vector3 = mathUtils.parseVector(vector3Input.value);
                if (vector3.length === 0) {
                    vectorVisualization.textContent = 'ベクトル3の形式が正しくありません';
                    return;
                }
                
                traces.push(createVectorTrace(vector3, 'ベクトル3', 'purple'));
                
                // v2 × v3 を追加
                if (vector2.length === 3 && vector3.length === 3) {
                    const crossProduct = math.cross(vector2, vector3);
                    traces.push(createVectorTrace(crossProduct, 'v2 × v3', 'orange'));
                }
            }
        }
        
        // 正規化ベクトルを追加
        if (operation === 'normalize') {
            const norm = math.norm(vector1);
            const normalizedVector = math.divide(vector1, norm);
            
            traces.push(createVectorTrace(normalizedVector, 'v1/|v1|', 'green'));
        }
        
        // プロットの設定
        const layout = {
            title: 'ベクトル可視化',
            autosize: true,
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 30
            },
            scene: {
                aspectmode: 'cube',
                xaxis: { title: 'X' },
                yaxis: { title: 'Y' },
                zaxis: { title: 'Z' }
            },
            showlegend: true
        };
        
        // 2次元または3次元プロットを決定
        if (vector1.length === 2) {
            // 2次元プロット
            layout.scene = undefined;
            layout.xaxis = { title: 'X', zeroline: true };
            layout.yaxis = { title: 'Y', zeroline: true };
            
            // 2次元トレースに変換
            traces.forEach(trace => {
                trace.type = 'scatter';
                trace.mode = 'lines+markers';
                trace.line = { width: 2 };
                trace.marker = { size: 6 };
            });
        }
        
        // プロットを描画
        Plotly.newPlot(vectorVisualization, traces, layout);
        
    } catch (error) {
        console.error('ベクトル可視化エラー:', error);
        vectorVisualization.textContent = `エラー: ${error.message}`;
    }
}

/**
 * ベクトルのトレースを作成
 * @param {Array} vector - ベクトル
 * @param {string} name - 名前
 * @param {string} color - 色
 * @returns {Object} Plotlyトレースオブジェクト
 */
function createVectorTrace(vector, name, color) {
    // 原点から始まるベクトル
    const x = [0, vector[0]];
    const y = [0, vector.length > 1 ? vector[1] : 0];
    
    if (vector.length === 2) {
        // 2次元ベクトル
        return {
            x: x,
            y: y,
            name: name,
            line: { color: color },
            marker: { color: color }
        };
    } else {
        // 3次元ベクトル
        const z = [0, vector.length > 2 ? vector[2] : 0];
        
        return {
            type: 'scatter3d',
            x: x,
            y: y,
            z: z,
            name: name,
            line: { color: color, width: 6 },
            marker: { color: color, size: 4 }
        };
    }
}
