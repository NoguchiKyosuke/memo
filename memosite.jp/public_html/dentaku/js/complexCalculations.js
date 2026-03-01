/**
 * 複素数計算機能
 */

function initializeComplexCalculations() {
    const complex1Input = document.getElementById('complex1');
    const complex2Input = document.getElementById('complex2');
    const complexOperationSelect = document.getElementById('complex-operation');
    const complexCalcBtn = document.getElementById('complex-calc-btn');
    const complexLatexBtn = document.getElementById('complex-latex-btn');
    const complexVisualizeBtn = document.getElementById('complex-visualize-btn');
    const complexOutput = document.getElementById('complex-output');
    const complexLatex = document.getElementById('complex-latex');
    const complexVisualization = document.getElementById('complex-visualization');
    
    // 計算ボタンのイベントリスナー
    if (complexCalcBtn) {
        complexCalcBtn.addEventListener('click', calculateComplex);
    }
    
    // LaTeX表示ボタンのイベントリスナー
    if (complexLatexBtn) {
        complexLatexBtn.addEventListener('click', displayComplexLatex);
    }
    
    // 可視化ボタンのイベントリスナー
    if (complexVisualizeBtn) {
        complexVisualizeBtn.addEventListener('click', visualizeComplex);
    }
    
    console.log('複素数計算が初期化されました');
}

/**
 * 複素数計算を実行
 */
function calculateComplex() {
    const complex1Input = document.getElementById('complex1');
    const complex2Input = document.getElementById('complex2');
    const complexOperationSelect = document.getElementById('complex-operation');
    const complexOutput = document.getElementById('complex-output');
    
    if (!complex1Input || !complexOperationSelect || !complexOutput) return;
    
    try {
        // 複素数1を解析
        const complex1 = mathUtils.parseComplex(complex1Input.value);
        
        // 操作を取得
        const operation = complexOperationSelect.value;
        
        let result;
        let resultText;
        
        // 単項演算
        if (['abs', 'arg', 'conjugate', 'exp', 'log', 'sin', 'cos', 'tan', 'sqrt'].includes(operation)) {
            switch (operation) {
                case 'abs':
                    result = math.abs(complex1);
                    resultText = `|z1| = ${mathUtils.formatNumber(result)}`;
                    break;
                case 'arg':
                    result = math.arg(complex1);
                    resultText = `arg(z1) = ${mathUtils.formatNumber(result)} rad (${mathUtils.formatNumber(result * 180 / Math.PI)}°)`;
                    break;
                case 'conjugate':
                    result = math.conj(complex1);
                    resultText = `z1* = ${mathUtils.formatComplex(result)}`;
                    break;
                case 'exp':
                    result = math.exp(complex1);
                    resultText = `e^(z1) = ${mathUtils.formatComplex(result)}`;
                    break;
                case 'log':
                    result = math.log(complex1);
                    resultText = `log(z1) = ${mathUtils.formatComplex(result)}`;
                    break;
                case 'sin':
                    result = math.sin(complex1);
                    resultText = `sin(z1) = ${mathUtils.formatComplex(result)}`;
                    break;
                case 'cos':
                    result = math.cos(complex1);
                    resultText = `cos(z1) = ${mathUtils.formatComplex(result)}`;
                    break;
                case 'tan':
                    result = math.tan(complex1);
                    resultText = `tan(z1) = ${mathUtils.formatComplex(result)}`;
                    break;
                case 'sqrt':
                    result = math.sqrt(complex1);
                    resultText = `√z1 = ${mathUtils.formatComplex(result)}`;
                    break;
            }
        } 
        // 二項演算
        else {
            // 複素数2を解析
            const complex2 = mathUtils.parseComplex(complex2Input.value);
            
            switch (operation) {
                case 'add':
                    result = math.add(complex1, complex2);
                    resultText = `z1 + z2 = ${mathUtils.formatComplex(result)}`;
                    break;
                case 'subtract':
                    result = math.subtract(complex1, complex2);
                    resultText = `z1 - z2 = ${mathUtils.formatComplex(result)}`;
                    break;
                case 'multiply':
                    result = math.multiply(complex1, complex2);
                    resultText = `z1 × z2 = ${mathUtils.formatComplex(result)}`;
                    break;
                case 'divide':
                    result = math.divide(complex1, complex2);
                    resultText = `z1 ÷ z2 = ${mathUtils.formatComplex(result)}`;
                    break;
                case 'power':
                    result = math.pow(complex1, complex2);
                    resultText = `z1^z2 = ${mathUtils.formatComplex(result)}`;
                    break;
            }
        }
        
        // 結果を表示
        complexOutput.textContent = resultText;
        
        // 計算履歴に追加
        const expression = `複素数計算: ${operation}`;
        addToHistory(expression, resultText);
        
    } catch (error) {
        console.error('複素数計算エラー:', error);
        complexOutput.textContent = `エラー: ${error.message}`;
    }
}

/**
 * 複素数計算のLaTeX表示
 */
function displayComplexLatex() {
    const complex1Input = document.getElementById('complex1');
    const complex2Input = document.getElementById('complex2');
    const complexOperationSelect = document.getElementById('complex-operation');
    const complexLatex = document.getElementById('complex-latex');
    
    if (!complex1Input || !complexOperationSelect || !complexLatex) return;
    
    try {
        // 複素数1を解析
        const complex1 = mathUtils.parseComplex(complex1Input.value);
        
        // 複素数1のLaTeX表現
        const complex1Latex = mathUtils.complexToLatex(complex1);
        
        // 操作を取得
        const operation = complexOperationSelect.value;
        
        let latexExpression = '';
        
        // 単項演算
        if (['abs', 'arg', 'conjugate', 'exp', 'log', 'sin', 'cos', 'tan', 'sqrt'].includes(operation)) {
            switch (operation) {
                case 'abs':
                    latexExpression = `|${complex1Latex}| = ${mathUtils.formatNumber(math.abs(complex1))}`;
                    break;
                case 'arg':
                    const argRad = math.arg(complex1);
                    const argDeg = argRad * 180 / Math.PI;
                    latexExpression = `\\arg(${complex1Latex}) = ${mathUtils.formatNumber(argRad)} \\text{ rad } (${mathUtils.formatNumber(argDeg)}^{\\circ})`;
                    break;
                case 'conjugate':
                    latexExpression = `\\overline{${complex1Latex}} = ${mathUtils.complexToLatex(math.conj(complex1))}`;
                    break;
                case 'exp':
                    latexExpression = `e^{${complex1Latex}} = ${mathUtils.complexToLatex(math.exp(complex1))}`;
                    break;
                case 'log':
                    latexExpression = `\\log(${complex1Latex}) = ${mathUtils.complexToLatex(math.log(complex1))}`;
                    break;
                case 'sin':
                    latexExpression = `\\sin(${complex1Latex}) = ${mathUtils.complexToLatex(math.sin(complex1))}`;
                    break;
                case 'cos':
                    latexExpression = `\\cos(${complex1Latex}) = ${mathUtils.complexToLatex(math.cos(complex1))}`;
                    break;
                case 'tan':
                    latexExpression = `\\tan(${complex1Latex}) = ${mathUtils.complexToLatex(math.tan(complex1))}`;
                    break;
                case 'sqrt':
                    latexExpression = `\\sqrt{${complex1Latex}} = ${mathUtils.complexToLatex(math.sqrt(complex1))}`;
                    break;
            }
        } 
        // 二項演算
        else {
            // 複素数2を解析
            const complex2 = mathUtils.parseComplex(complex2Input.value);
            
            // 複素数2のLaTeX表現
            const complex2Latex = mathUtils.complexToLatex(complex2);
            
            switch (operation) {
                case 'add':
                    latexExpression = `${complex1Latex} + ${complex2Latex} = ${mathUtils.complexToLatex(math.add(complex1, complex2))}`;
                    break;
                case 'subtract':
                    latexExpression = `${complex1Latex} - ${complex2Latex} = ${mathUtils.complexToLatex(math.subtract(complex1, complex2))}`;
                    break;
                case 'multiply':
                    latexExpression = `${complex1Latex} \\times ${complex2Latex} = ${mathUtils.complexToLatex(math.multiply(complex1, complex2))}`;
                    break;
                case 'divide':
                    latexExpression = `\\frac{${complex1Latex}}{${complex2Latex}} = ${mathUtils.complexToLatex(math.divide(complex1, complex2))}`;
                    break;
                case 'power':
                    latexExpression = `{${complex1Latex}}^{${complex2Latex}} = ${mathUtils.complexToLatex(math.pow(complex1, complex2))}`;
                    break;
            }
        }
        
        // LaTeXを表示
        complexLatex.textContent = '';
        complexLatex.innerHTML = `\\[${latexExpression}\\]`;
        
        // MathJaxを再描画
        if (window.MathJax) {
            MathJax.typesetPromise([complexLatex]).catch(err => console.error('MathJax error:', err));
        }
        
    } catch (error) {
        console.error('複素数LaTeX変換エラー:', error);
        complexLatex.textContent = `エラー: ${error.message}`;
    }
}

/**
 * 複素数を可視化
 */
function visualizeComplex() {
    const complex1Input = document.getElementById('complex1');
    const complex2Input = document.getElementById('complex2');
    const complexOperationSelect = document.getElementById('complex-operation');
    const complexVisualization = document.getElementById('complex-visualization');
    
    if (!complex1Input || !complexVisualization) return;
    
    try {
        // 複素数1を解析
        const complex1 = mathUtils.parseComplex(complex1Input.value);
        
        // 操作を取得
        const operation = complexOperationSelect.value;
        
        // 可視化のためのデータを準備
        const traces = [];
        
        // 原点から複素数1へのベクトル
        traces.push({
            x: [0, complex1.re],
            y: [0, complex1.im],
            mode: 'lines+markers',
            name: 'z1',
            line: { color: 'blue', width: 2 },
            marker: { size: 8 }
        });
        
        // 二項演算の場合は複素数2も表示
        if (!['abs', 'arg', 'conjugate', 'exp', 'log', 'sin', 'cos', 'tan', 'sqrt'].includes(operation)) {
            const complex2 = mathUtils.parseComplex(complex2Input.value);
            
            // 原点から複素数2へのベクトル
            traces.push({
                x: [0, complex2.re],
                y: [0, complex2.im],
                mode: 'lines+markers',
                name: 'z2',
                line: { color: 'red', width: 2 },
                marker: { size: 8 }
            });
            
            // 結果を表示（該当する場合）
            let result;
            let resultName;
            
            switch (operation) {
                case 'add':
                    result = math.add(complex1, complex2);
                    resultName = 'z1 + z2';
                    break;
                case 'subtract':
                    result = math.subtract(complex1, complex2);
                    resultName = 'z1 - z2';
                    break;
                case 'multiply':
                    result = math.multiply(complex1, complex2);
                    resultName = 'z1 × z2';
                    break;
                case 'divide':
                    result = math.divide(complex1, complex2);
                    resultName = 'z1 ÷ z2';
                    break;
                case 'power':
                    result = math.pow(complex1, complex2);
                    resultName = 'z1^z2';
                    break;
            }
            
            if (result) {
                traces.push({
                    x: [0, result.re],
                    y: [0, result.im],
                    mode: 'lines+markers',
                    name: resultName,
                    line: { color: 'green', width: 2 },
                    marker: { size: 8 }
                });
            }
        } 
        // 単項演算の場合は結果を表示
        else {
            let result;
            let resultName;
            
            switch (operation) {
                case 'conjugate':
                    result = math.conj(complex1);
                    resultName = 'z1*';
                    break;
                case 'exp':
                    result = math.exp(complex1);
                    resultName = 'e^(z1)';
                    break;
                case 'log':
                    result = math.log(complex1);
                    resultName = 'log(z1)';
                    break;
                case 'sin':
                    result = math.sin(complex1);
                    resultName = 'sin(z1)';
                    break;
                case 'cos':
                    result = math.cos(complex1);
                    resultName = 'cos(z1)';
                    break;
                case 'tan':
                    result = math.tan(complex1);
                    resultName = 'tan(z1)';
                    break;
                case 'sqrt':
                    result = math.sqrt(complex1);
                    resultName = '√z1';
                    break;
            }
            
            if (result) {
                traces.push({
                    x: [0, result.re],
                    y: [0, result.im],
                    mode: 'lines+markers',
                    name: resultName,
                    line: { color: 'green', width: 2 },
                    marker: { size: 8 }
                });
            }
            
            // 絶対値を表示
            if (operation === 'abs') {
                const abs = math.abs(complex1);
                
                // 単位円
                const unitCircleX = [];
                const unitCircleY = [];
                for (let i = 0; i <= 100; i++) {
                    const angle = (i / 100) * 2 * Math.PI;
                    unitCircleX.push(abs * Math.cos(angle));
                    unitCircleY.push(abs * Math.sin(angle));
                }
                
                traces.push({
                    x: unitCircleX,
                    y: unitCircleY,
                    mode: 'lines',
                    name: '|z1|',
                    line: { color: 'green', width: 1, dash: 'dash' }
                });
            }
            
            // 偏角を表示
            if (operation === 'arg') {
                const arg = math.arg(complex1);
                const abs = math.abs(complex1);
                
                // 原点から角度方向への線
                traces.push({
                    x: [0, abs * Math.cos(arg)],
                    y: [0, abs * Math.sin(arg)],
                    mode: 'lines',
                    name: 'arg(z1)',
                    line: { color: 'green', width: 1, dash: 'dash' }
                });
                
                // 角度を示す弧
                const arcX = [];
                const arcY = [];
                const arcRadius = Math.min(abs / 3, 1);
                for (let i = 0; i <= 100; i++) {
                    const angle = (i / 100) * arg;
                    arcX.push(arcRadius * Math.cos(angle));
                    arcY.push(arcRadius * Math.sin(angle));
                }
                
                traces.push({
                    x: arcX,
                    y: arcY,
                    mode: 'lines',
                    name: 'angle',
                    line: { color: 'purple', width: 2 }
                });
            }
        }
        
        // 単位円を追加
        const unitCircleX = [];
        const unitCircleY = [];
        for (let i = 0; i <= 100; i++) {
            const angle = (i / 100) * 2 * Math.PI;
            unitCircleX.push(Math.cos(angle));
            unitCircleY.push(Math.sin(angle));
        }
        
        traces.push({
            x: unitCircleX,
            y: unitCircleY,
            mode: 'lines',
            name: '単位円',
            line: { color: 'gray', width: 1 }
        });
        
        // 実軸と虚軸を追加
        const maxVal = Math.max(
            2,
            Math.abs(complex1.re) * 1.2,
            Math.abs(complex1.im) * 1.2
        );
        
        traces.push({
            x: [-maxVal, maxVal],
            y: [0, 0],
            mode: 'lines',
            name: '実軸',
            line: { color: 'black', width: 1 }
        });
        
        traces.push({
            x: [0, 0],
            y: [-maxVal, maxVal],
            mode: 'lines',
            name: '虚軸',
            line: { color: 'black', width: 1 }
        });
        
        // プロットの設定
        const layout = {
            title: '複素平面',
            xaxis: {
                title: '実部',
                zeroline: false
            },
            yaxis: {
                title: '虚部',
                zeroline: false,
                scaleanchor: 'x',
                scaleratio: 1
            },
            showlegend: true,
            legend: {
                x: 1,
                xanchor: 'right',
                y: 1
            }
        };
        
        // プロットを描画
        Plotly.newPlot(complexVisualization, traces, layout);
        
    } catch (error) {
        console.error('複素数可視化エラー:', error);
        complexVisualization.textContent = `エラー: ${error.message}`;
    }
}

