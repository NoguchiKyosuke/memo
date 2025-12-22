/**
 * グラフ描画機能
 */

function initializePlotting() {
    const plotTab = document.getElementById('plot');
    if (!plotTab) return;
    
    // グラフタイプの選択要素
    const plotTypeSelect = document.createElement('select');
    plotTypeSelect.id = 'plot-type';
    plotTypeSelect.className = 'form-control';
    
    // グラフタイプのオプション
    const plotTypes = [
        { value: '2d-function', text: '2D関数 (y = f(x))' },
        { value: '3d-function', text: '3D関数 (z = f(x,y))' },
        { value: 'parametric', text: 'パラメトリック曲線' },
        { value: 'polar', text: '極座標' },
        { value: 'implicit', text: '陰関数' },
        { value: 'vector-field', text: 'ベクトル場' }
    ];
    
    // オプションを追加
    plotTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.text;
        plotTypeSelect.appendChild(option);
    });
    
    // 入力エリアを作成
    const inputArea = plotTab.querySelector('.input-area');
    if (inputArea) {
        // グラフタイプの選択
        const typeGroup = document.createElement('div');
        typeGroup.className = 'input-group';
        const typeLabel = document.createElement('label');
        typeLabel.htmlFor = 'plot-type';
        typeLabel.textContent = 'グラフタイプ:';
        typeGroup.appendChild(typeLabel);
        typeGroup.appendChild(plotTypeSelect);
        inputArea.appendChild(typeGroup);
        
        // 関数入力
        const functionGroup = document.createElement('div');
        functionGroup.className = 'input-group';
        const functionLabel = document.createElement('label');
        functionLabel.htmlFor = 'plot-function';
        functionLabel.textContent = '関数:';
        const functionInput = document.createElement('input');
        functionInput.type = 'text';
        functionInput.id = 'plot-function';
        functionInput.placeholder = '例: sin(x) + cos(x)';
        functionGroup.appendChild(functionLabel);
        functionGroup.appendChild(functionInput);
        inputArea.appendChild(functionGroup);
        
        // 範囲入力
        const rangeGroup = document.createElement('div');
        rangeGroup.className = 'input-group';
        const xRangeLabel = document.createElement('label');
        xRangeLabel.htmlFor = 'plot-x-range';
        xRangeLabel.textContent = 'x範囲:';
        const xRangeInput = document.createElement('input');
        xRangeInput.type = 'text';
        xRangeInput.id = 'plot-x-range';
        xRangeInput.placeholder = '例: -10,10';
        xRangeInput.value = '-10,10';
        rangeGroup.appendChild(xRangeLabel);
        rangeGroup.appendChild(xRangeInput);
        inputArea.appendChild(rangeGroup);
        
        // y範囲入力（3D用）
        const yRangeGroup = document.createElement('div');
        yRangeGroup.className = 'input-group';
        yRangeGroup.id = 'plot-y-range-group';
        yRangeGroup.style.display = 'none';
        const yRangeLabel = document.createElement('label');
        yRangeLabel.htmlFor = 'plot-y-range';
        yRangeLabel.textContent = 'y範囲:';
        const yRangeInput = document.createElement('input');
        yRangeInput.type = 'text';
        yRangeInput.id = 'plot-y-range';
        yRangeInput.placeholder = '例: -10,10';
        yRangeInput.value = '-10,10';
        yRangeGroup.appendChild(yRangeLabel);
        yRangeGroup.appendChild(yRangeInput);
        inputArea.appendChild(yRangeGroup);
        
        // ボタングループ
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';
        
        // 描画ボタン
        const plotButton = document.createElement('button');
        plotButton.id = 'plot-btn';
        plotButton.className = 'primary-btn';
        plotButton.textContent = '描画';
        plotButton.addEventListener('click', drawPlot);
        buttonGroup.appendChild(plotButton);
        
        // クリアボタン
        const clearButton = document.createElement('button');
        clearButton.id = 'plot-clear-btn';
        clearButton.className = 'secondary-btn';
        clearButton.textContent = 'クリア';
        clearButton.addEventListener('click', clearPlot);
        buttonGroup.appendChild(clearButton);
        
        // エクスポートボタン
        const exportButton = document.createElement('button');
        exportButton.id = 'plot-export-btn';
        exportButton.className = 'secondary-btn';
        exportButton.textContent = 'エクスポート';
        exportButton.addEventListener('click', exportPlot);
        buttonGroup.appendChild(exportButton);
        
        inputArea.appendChild(buttonGroup);
        
        // グラフタイプの変更イベント
        plotTypeSelect.addEventListener('change', function() {
            const plotType = this.value;
            
            // 3D関数の場合はy範囲を表示
            if (plotType === '3d-function') {
                document.getElementById('plot-y-range-group').style.display = 'block';
            } else {
                document.getElementById('plot-y-range-group').style.display = 'none';
            }
            
            // 関数ラベルとプレースホルダーを更新
            const functionLabel = document.querySelector('label[for="plot-function"]');
            const functionInput = document.getElementById('plot-function');
            
            switch (plotType) {
                case '2d-function':
                    functionLabel.textContent = '関数 f(x):';
                    functionInput.placeholder = '例: sin(x) + cos(x)';
                    break;
                case '3d-function':
                    functionLabel.textContent = '関数 f(x,y):';
                    functionInput.placeholder = '例: sin(x) * cos(y)';
                    break;
                case 'parametric':
                    functionLabel.textContent = 'パラメトリック関数 [x(t), y(t)]:';
                    functionInput.placeholder = '例: [cos(t), sin(t)]';
                    break;
                case 'polar':
                    functionLabel.textContent = '極座標関数 r(θ):';
                    functionInput.placeholder = '例: 1 + cos(theta)';
                    break;
                case 'implicit':
                    functionLabel.textContent = '陰関数 f(x,y) = 0:';
                    functionInput.placeholder = '例: x^2 + y^2 - 9';
                    break;
                case 'vector-field':
                    functionLabel.textContent = 'ベクトル場 [f(x,y), g(x,y)]:';
                    functionInput.placeholder = '例: [y, -x]';
                    break;
            }
        });
    }
    
    // 可視化エリアを作成
    const outputArea = plotTab.querySelector('.output-area');
    if (outputArea) {
        const visualizationContainer = outputArea.querySelector('.visualization-container');
        if (visualizationContainer) {
            const plotDiv = document.createElement('div');
            plotDiv.id = 'plot-visualization';
            plotDiv.className = 'visualization';
            plotDiv.style.width = '100%';
            plotDiv.style.height = '500px';
            visualizationContainer.appendChild(plotDiv);
        }
    }
    
    console.log('グラフ描画機能が初期化されました');
}

/**
 * グラフを描画
 */
function drawPlot() {
    const plotType = document.getElementById('plot-type').value;
    const functionExpr = document.getElementById('plot-function').value;
    const xRangeStr = document.getElementById('plot-x-range').value;
    const plotDiv = document.getElementById('plot-visualization');
    
    if (!functionExpr || !xRangeStr || !plotDiv) {
        showNotification('関数と範囲を入力してください', 'error');
        return;
    }
    
    try {
        // x範囲を解析
        const xRange = xRangeStr.split(',').map(Number);
        if (xRange.length !== 2 || isNaN(xRange[0]) || isNaN(xRange[1])) {
            showNotification('範囲の形式が正しくありません。例: -10,10', 'error');
            return;
        }
        
        // プロットデータを生成
        let plotData = [];
        
        switch (plotType) {
            case '2d-function':
                plotData = generate2DFunctionPlot(functionExpr, xRange);
                break;
            case '3d-function':
                const yRangeStr = document.getElementById('plot-y-range').value;
                const yRange = yRangeStr.split(',').map(Number);
                if (yRange.length !== 2 || isNaN(yRange[0]) || isNaN(yRange[1])) {
                    showNotification('y範囲の形式が正しくありません。例: -10,10', 'error');
                    return;
                }
                plotData = generate3DFunctionPlot(functionExpr, xRange, yRange);
                break;
            case 'parametric':
                plotData = generateParametricPlot(functionExpr, xRange);
                break;
            case 'polar':
                plotData = generatePolarPlot(functionExpr, xRange);
                break;
            case 'implicit':
                plotData = generateImplicitPlot(functionExpr, xRange);
                break;
            case 'vector-field':
                plotData = generateVectorFieldPlot(functionExpr, xRange);
                break;
        }
        
        // レイアウト設定
        let layout = {
            title: functionExpr,
            showlegend: false,
            autosize: true,
            margin: { t: 60, l: 50, r: 50, b: 50 }
        };
        
        // 2Dプロットの場合
        if (['2d-function', 'parametric', 'polar', 'implicit'].includes(plotType)) {
            layout.xaxis = {
                title: 'x',
                range: xRange
            };
            layout.yaxis = {
                title: 'y',
                scaleanchor: 'x',
                scaleratio: 1
            };
        }
        
        // 3Dプロットの場合
        if (['3d-function', 'vector-field'].includes(plotType)) {
            layout.scene = {
                xaxis: { title: 'x' },
                yaxis: { title: 'y' },
                zaxis: { title: 'z' },
                aspectratio: { x: 1, y: 1, z: 1 }
            };
        }
        
        // プロットを描画
        Plotly.newPlot(plotDiv, plotData, layout);
        
    } catch (error) {
        console.error('グラフ描画エラー:', error);
        showNotification(`エラー: ${error.message}`, 'error');
    }
}

/**
 * 2D関数のプロットデータを生成
 * @param {string} expr - 関数式
 * @param {Array} xRange - x範囲 [min, max]
 * @returns {Array} プロットデータ
 */
function generate2DFunctionPlot(expr, xRange) {
    // x値の配列を生成
    const points = 1000;
    const xStep = (xRange[1] - xRange[0]) / points;
    const xValues = Array.from({ length: points + 1 }, (_, i) => xRange[0] + i * xStep);
    
    // 関数をコンパイル
    const f = math.compile(expr);
    
    // y値を計算
    const yValues = xValues.map(x => {
        try {
            return f.evaluate({ x: x });
        } catch (e) {
            return null;
        }
    });
    
    // プロットデータを作成
    return [{
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        line: { color: 'blue', width: 2 }
    }];
}

/**
 * 3D関数のプロットデータを生成
 * @param {string} expr - 関数式
 * @param {Array} xRange - x範囲 [min, max]
 * @param {Array} yRange - y範囲 [min, max]
 * @returns {Array} プロットデータ
 */
function generate3DFunctionPlot(expr, xRange, yRange) {
    // グリッドを生成
    const points = 50;
    const xStep = (xRange[1] - xRange[0]) / points;
    const yStep = (yRange[1] - yRange[0]) / points;
    
    const xValues = Array.from({ length: points + 1 }, (_, i) => xRange[0] + i * xStep);
    const yValues = Array.from({ length: points + 1 }, (_, i) => yRange[0] + i * yStep);
    
    // 関数をコンパイル
    const f = math.compile(expr);
    
    // z値を計算
    const zValues = [];
    for (let i = 0; i <= points; i++) {
        const row = [];
        for (let j = 0; j <= points; j++) {
            try {
                row.push(f.evaluate({ x: xValues[i], y: yValues[j] }));
            } catch (e) {
                row.push(null);
            }
        }
        zValues.push(row);
    }
    
    // プロットデータを作成
    return [{
        type: 'surface',
        x: xValues,
        y: yValues,
        z: zValues,
        colorscale: 'Viridis'
    }];
}

/**
 * パラメトリック曲線のプロットデータを生成
 * @param {string} expr - パラメトリック関数式 [x(t), y(t)]
 * @param {Array} tRange - tパラメータ範囲 [min, max]
 * @returns {Array} プロットデータ
 */
function generateParametricPlot(expr, tRange) {
    // 関数式を解析
    let parametricExpr;
    try {
        parametricExpr = math.parse(expr).compile();
    } catch (e) {
        // 配列形式でない場合は配列として解析
        if (!expr.startsWith('[') || !expr.endsWith(']')) {
            expr = `[${expr}]`;
        }
        parametricExpr = math.parse(expr).compile();
    }
    
    // tの配列を生成
    const points = 1000;
    const tStep = (tRange[1] - tRange[0]) / points;
    const tValues = Array.from({ length: points + 1 }, (_, i) => tRange[0] + i * tStep);
    
    // x, y値を計算
    const xyValues = tValues.map(t => {
        try {
            const result = parametricExpr.evaluate({ t: t });
            return Array.isArray(result) ? result : [t, result];
        } catch (e) {
            return [null, null];
        }
    });
    
    const xValues = xyValues.map(xy => xy[0]);
    const yValues = xyValues.map(xy => xy[1]);
    
    // プロットデータを作成
    return [{
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        line: { color: 'red', width: 2 }
    }];
}

/**
 * 極座標プロットのデータを生成
 * @param {string} expr - 極座標関数式 r(θ)
 * @param {Array} thetaRange - θ範囲 [min, max]
 * @returns {Array} プロットデータ
 */
function generatePolarPlot(expr, thetaRange) {
    // 関数をコンパイル
    const f = math.compile(expr.replace(/theta/g, 'x'));
    
    // θの配列を生成
    const points = 1000;
    const thetaStep = (thetaRange[1] - thetaRange[0]) / points;
    const thetaValues = Array.from({ length: points + 1 }, (_, i) => thetaRange[0] + i * thetaStep);
    
    // r値を計算
    const rValues = thetaValues.map(theta => {
        try {
            return f.evaluate({ x: theta, theta: theta });
        } catch (e) {
            return null;
        }
    });
    
    // 極座標から直交座標に変換
    const xValues = thetaValues.map((theta, i) => rValues[i] * Math.cos(theta));
    const yValues = thetaValues.map((theta, i) => rValues[i] * Math.sin(theta));
    
    // プロットデータを作成
    return [{
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        line: { color: 'green', width: 2 }
    }];
}

/**
 * 陰関数プロットのデータを生成
 * @param {string} expr - 陰関数式 f(x,y) = 0
 * @param {Array} xRange - x範囲 [min, max]
 * @returns {Array} プロットデータ
 */
function generateImplicitPlot(expr, xRange) {
    // 等高線レベルを0に設定
    const contourLevels = [0];
    
    // グリッドを生成
    const points = 100;
    const xStep = (xRange[1] - xRange[0]) / points;
    const yRange = [xRange[0], xRange[1]]; // 同じ範囲を使用
    const yStep = (yRange[1] - yRange[0]) / points;
    
    const xValues = Array.from({ length: points + 1 }, (_, i) => xRange[0] + i * xStep);
    const yValues = Array.from({ length: points + 1 }, (_, i) => yRange[0] + i * yStep);
    
    // 関数をコンパイル
    const f = math.compile(expr);
    
    // z値を計算
    const zValues = [];
    for (let i = 0; i <= points; i++) {
        const row = [];
        for (let j = 0; j <= points; j++) {
            try {
                row.push(f.evaluate({ x: xValues[j], y: yValues[i] }));
            } catch (e) {
                row.push(null);
            }
        }
        zValues.push(row);
    }
    
    // プロットデータを作成
    return [{
        type: 'contour',
        x: xValues,
        y: yValues,
        z: zValues,
        contours: {
            coloring: 'lines',
            showlabels: true,
            start: 0,
            end: 0,
            size: 0
        },
        line: { color: 'purple', width: 2 }
    }];
}

/**
 * ベクトル場プロットのデータを生成
 * @param {string} expr - ベクトル場式 [f(x,y), g(x,y)]
 * @param {Array} xRange - x範囲 [min, max]
 * @returns {Array} プロットデータ
 */
function generateVectorFieldPlot(expr, xRange) {
    // 関数式を解析
    let vectorExpr;
    try {
        vectorExpr = math.parse(expr).compile();
    } catch (e) {
        // 配列形式でない場合は配列として解析
        if (!expr.startsWith('[') || !expr.endsWith(']')) {
            expr = `[${expr}]`;
        }
        vectorExpr = math.parse(expr).compile();
    }
    
    // グリッドを生成
    const points = 20; // ベクトル場は密度を下げる
    const xStep = (xRange[1] - xRange[0]) / points;
    const yRange = [xRange[0], xRange[1]]; // 同じ範囲を使用
    const yStep = (yRange[1] - yRange[0]) / points;
    
    // ベクトル場のデータを生成
    const x = [];
    const y = [];
    const u = [];
    const v = [];
    
    for (let i = 0; i <= points; i++) {
        for (let j = 0; j <= points; j++) {
            const xVal = xRange[0] + i * xStep;
            const yVal = yRange[0] + j * yStep;
            
            try {
                const vector = vectorExpr.evaluate({ x: xVal, y: yVal });
                if (Array.isArray(vector) && vector.length >= 2) {
                    x.push(xVal);
                    y.push(yVal);
                    u.push(vector[0]);
                    v.push(vector[1]);
                }
            } catch (e) {
                // エラーの場合はスキップ
            }
        }
    }
    
    // プロットデータを作成
    return [{
        type: 'quiver',
        x: x,
        y: y,
        u: u,
        v: v,
        scale: 0.1,
        mode: 'lines',
        line: { color: 'blue', width: 1 },
        name: 'ベクトル場'
    }];
}

/**
 * グラフをクリア
 */
function clearPlot() {
    const plotDiv = document.getElementById('plot-visualization');
    if (plotDiv) {
        Plotly.purge(plotDiv);
    }
}

/**
 * グラフをエクスポート
 */
function exportPlot() {
    const plotDiv = document.getElementById('plot-visualization');
    if (!plotDiv) return;
    
    // エクスポート形式を選択するモーダルを表示
    showModal('グラフのエクスポート', 
        '形式を選択してください：',
        () => {
            const format = document.querySelector('input[name="export-format"]:checked').value;
            
            switch (format) {
                case 'png':
                    Plotly.toImage(plotDiv, { format: 'png', width: 800, height: 600 })
                        .then(url => {
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = 'graph.png';
                            link.click();
                        });
                    break;
                case 'svg':
                    Plotly.toImage(plotDiv, { format: 'svg', width: 800, height: 600 })
                        .then(url => {
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = 'graph.svg';
                            link.click();
                        });
                    break;
                case 'csv':
                    exportPlotDataAsCsv(plotDiv);
                    break;
                case 'json':
                    exportPlotDataAsJson(plotDiv);
                    break;
            }
        }
    );
    
    // モーダルの内容を設定
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="export-options">
            <div class="export-option">
                <input type="radio" id="export-png" name="export-format" value="png" checked>
                <label for="export-png">PNG画像</label>
            </div>
            <div class="export-option">
                <input type="radio" id="export-svg" name="export-format" value="svg">
                <label for="export-svg">SVGベクター画像</label>
            </div>
            <div class="export-option">
                <input type="radio" id="export-csv" name="export-format" value="csv">
                <label for="export-csv">CSVデータ</label>
            </div>
            <div class="export-option">
                <input type="radio" id="export-json" name="export-format" value="json">
                <label for="export-json">JSONデータ</label>
            </div>
        </div>
    `;
}

/**
 * プロットデータをCSVとしてエクスポート
 * @param {HTMLElement} plotDiv - プロット要素
 */
function exportPlotDataAsCsv(plotDiv) {
    const data = plotDiv.data;
    if (!data || data.length === 0) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // ヘッダー行
    const headers = ['x', 'y'];
    if (data[0].z) headers.push('z');
    csvContent += headers.join(',') + '\r\n';
    
    // データ行
    const rows = [];
    const len = data[0].x.length;
    
    for (let i = 0; i < len; i++) {
        const row = [data[0].x[i], data[0].y[i]];
        if (data[0].z) {
            if (Array.isArray(data[0].z)) {
                row.push(data[0].z[i] || '');
            } else {
                row.push('');
            }
        }
        rows.push(row.join(','));
    }
    
    csvContent += rows.join('\r\n');
    
    // ダウンロード
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'plot_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * プロットデータをJSONとしてエクスポート
 * @param {HTMLElement} plotDiv - プロット要素
 */
function exportPlotDataAsJson(plotDiv) {
    const data = plotDiv.data;
    if (!data || data.length === 0) return;
    
    // JSONデータを作成
    const jsonData = JSON.stringify(data, null, 2);
    
    // ダウンロード
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plot_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
