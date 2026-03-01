/**
 * ユーティリティ関数モジュール
 */

/**
 * 通知を表示する
 * @param {string} message - 表示するメッセージ
 * @param {string} type - 通知タイプ ('success', 'error', 'info', 'warning')
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    // メッセージを設定
    notificationMessage.textContent = message;
    
    // タイプに応じたスタイルを適用
    notification.className = 'notification';
    notification.classList.add(`notification-${type}`);
    
    // 通知を表示
    notification.classList.add('show');
    
    // 一定時間後に非表示
    const timeout = setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
    
    // 閉じるボタンのイベント
    const closeButton = notification.querySelector('.notification-close');
    closeButton.onclick = function() {
        clearTimeout(timeout);
        notification.classList.remove('show');
    };
}

/**
 * 確認ダイアログを表示する
 * @param {string} title - ダイアログのタイトル
 * @param {string} message - 表示するメッセージ
 * @param {Function} onConfirm - 確認時のコールバック関数
 * @param {Function} onCancel - キャンセル時のコールバック関数
 */
function showConfirmDialog(title, message, onConfirm, onCancel = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const confirmButton = document.getElementById('modal-confirm');
    const cancelButton = document.getElementById('modal-cancel');
    
    // タイトルとメッセージを設定
    modalTitle.textContent = title;
    modalBody.innerHTML = `<p>${message}</p>`;
    
    // モーダルを表示
    modal.style.display = 'block';
    
    // 確認ボタンのイベント
    confirmButton.onclick = function() {
        modal.style.display = 'none';
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    };
    
    // キャンセルボタンのイベント
    cancelButton.onclick = function() {
        modal.style.display = 'none';
        if (typeof onCancel === 'function') {
            onCancel();
        }
    };
    
    // 閉じるボタンのイベント
    const closeButton = modal.querySelector('.close-button');
    closeButton.onclick = function() {
        modal.style.display = 'none';
        if (typeof onCancel === 'function') {
            onCancel();
        }
    };
    
    // モーダル外クリックでも閉じる
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }
    };
}

/**
 * 入力ダイアログを表示する
 * @param {string} title - ダイアログのタイトル
 * @param {string} message - 表示するメッセージ
 * @param {string} defaultValue - デフォルト値
 * @param {Function} onConfirm - 確認時のコールバック関数
 * @param {Function} onCancel - キャンセル時のコールバック関数
 */
function showInputDialog(title, message, defaultValue = '', onConfirm, onCancel = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const confirmButton = document.getElementById('modal-confirm');
    const cancelButton = document.getElementById('modal-cancel');
    
    // タイトルとメッセージを設定
    modalTitle.textContent = title;
    modalBody.innerHTML = `
        <p>${message}</p>
        <input type="text" id="modal-input" value="${defaultValue}" class="modal-input">
    `;
    
    // モーダルを表示
    modal.style.display = 'block';
    
    // 入力フィールドにフォーカス
    setTimeout(() => {
        document.getElementById('modal-input').focus();
    }, 100);
    
    // 確認ボタンのイベント
    confirmButton.onclick = function() {
        const inputValue = document.getElementById('modal-input').value;
        modal.style.display = 'none';
        if (typeof onConfirm === 'function') {
            onConfirm(inputValue);
        }
    };
    
    // キャンセルボタンのイベント
    cancelButton.onclick = function() {
        modal.style.display = 'none';
        if (typeof onCancel === 'function') {
            onCancel();
        }
    };
    
    // 閉じるボタンのイベント
    const closeButton = modal.querySelector('.close-button');
    closeButton.onclick = function() {
        modal.style.display = 'none';
        if (typeof onCancel === 'function') {
            onCancel();
        }
    };
    
    // モーダル外クリックでも閉じる
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }
    };
    
    // Enterキーで確定
    document.getElementById('modal-input').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            const inputValue = document.getElementById('modal-input').value;
            modal.style.display = 'none';
            if (typeof onConfirm === 'function') {
                onConfirm(inputValue);
            }
        }
    });
}

/**
 * 数値を指定した精度でフォーマットする
 * @param {number} value - フォーマットする数値
 * @param {number} precision - 小数点以下の桁数
 * @param {string} notation - 表記法 ('auto', 'fixed', 'scientific', 'engineering')
 * @returns {string} フォーマットされた数値文字列
 */
function formatNumber(value, precision = 10, notation = 'auto') {
    if (value === undefined || value === null || isNaN(value)) {
        return 'N/A';
    }
    
    // 設定から精度と表記法を取得
    precision = getSetting ? getSetting('precision') : precision;
    notation = getSetting ? getSetting('notation') : notation;
    
    try {
        if (notation === 'auto') {
            // 自動表記法
            if (Math.abs(value) >= 1e4 || (Math.abs(value) > 0 && Math.abs(value) < 1e-3)) {
                // 大きな数値または小さな数値は科学表記法
                return value.toExponential(precision);
            } else {
                // それ以外は固定小数点
                return value.toFixed(precision).replace(/\.?0+$/, '');
            }
        } else if (notation === 'fixed') {
            // 固定小数点表記法
            return value.toFixed(precision);
        } else if (notation === 'scientific') {
            // 科学表記法
            return value.toExponential(precision);
        } else if (notation === 'engineering') {
            // 工学表記法（3の倍数の指数）
            const exp = Math.floor(Math.log10(Math.abs(value)));
            const engExp = Math.floor(exp / 3) * 3;
            const mantissa = value / Math.pow(10, engExp);
            return mantissa.toFixed(precision) + 'e' + engExp;
        }
    } catch (e) {
        console.error('数値フォーマットエラー:', e);
        return String(value);
    }
    
    return String(value);
}

/**
 * 配列を指定した精度でフォーマットする
 * @param {Array} arr - フォーマットする配列
 * @param {number} precision - 小数点以下の桁数
 * @param {string} notation - 表記法
 * @returns {Array} フォーマットされた配列
 */
function formatArray(arr, precision = 10, notation = 'auto') {
    if (!Array.isArray(arr)) {
        return arr;
    }
    
    return arr.map(item => {
        if (Array.isArray(item)) {
            return formatArray(item, precision, notation);
        } else if (typeof item === 'number') {
            return formatNumber(item, precision, notation);
        } else {
            return item;
        }
    });
}

/**
 * 行列を文字列に変換する
 * @param {Array<Array>} matrix - 変換する行列
 * @param {number} precision - 小数点以下の桁数
 * @returns {string} 行列の文字列表現
 */
function matrixToString(matrix, precision = 10) {
    if (!Array.isArray(matrix) || matrix.length === 0) {
        return '[]';
    }
    
    const formattedMatrix = formatArray(matrix, precision);
    
    // 各列の最大幅を計算
    const colWidths = [];
    for (let i = 0; i < formattedMatrix[0].length; i++) {
        let maxWidth = 0;
        for (let j = 0; j < formattedMatrix.length; j++) {
            const cellWidth = String(formattedMatrix[j][i]).length;
            maxWidth = Math.max(maxWidth, cellWidth);
        }
        colWidths.push(maxWidth);
    }
    
    // 行列を整形された文字列に変換
    let result = '';
    for (let i = 0; i < formattedMatrix.length; i++) {
        result += '[ ';
        for (let j = 0; j < formattedMatrix[i].length; j++) {
            const cell = String(formattedMatrix[i][j]);
            const padding = ' '.repeat(colWidths[j] - cell.length);
            result += cell + padding;
            if (j < formattedMatrix[i].length - 1) {
                result += ', ';
            }
        }
        result += ' ]';
        if (i < formattedMatrix.length - 1) {
            result += '\n';
        }
    }
    
    return result;
}

/**
 * 行列をLaTeX形式に変換する
 * @param {Array<Array>} matrix - 変換する行列
 * @param {number} precision - 小数点以下の桁数
 * @returns {string} 行列のLaTeX表現
 */
function matrixToLatex(matrix, precision = 10) {
    if (!Array.isArray(matrix) || matrix.length === 0) {
        return '\\begin{bmatrix} \\end{bmatrix}';
    }
    
    const formattedMatrix = formatArray(matrix, precision);
    
    let latex = '\\begin{bmatrix}\n';
    
    for (let i = 0; i < formattedMatrix.length; i++) {
        latex += '  ' + formattedMatrix[i].join(' & ');
        if (i < formattedMatrix.length - 1) {
            latex += ' \\\\\n';
        }
    }
    
    latex += '\n\\end{bmatrix}';
    
    return latex;
}

/**
 * ベクトルをLaTeX形式に変換する
 * @param {Array} vector - 変換するベクトル
 * @param {number} precision - 小数点以下の桁数
 * @returns {string} ベクトルのLaTeX表現
 */
function vectorToLatex(vector, precision = 10) {
    if (!Array.isArray(vector)) {
        return '\\begin{pmatrix} \\end{pmatrix}';
    }
    
    const formattedVector = formatArray(vector, precision);
    
    let latex = '\\begin{pmatrix}\n';
    latex += '  ' + formattedVector.join(' \\\\\n  ');
    latex += '\n\\end{pmatrix}';
    
    return latex;
}

/**
 * 複素数をLaTeX形式に変換する
 * @param {Object} complex - 変換する複素数 (math.jsの複素数オブジェクト)
 * @param {number} precision - 小数点以下の桁数
 * @returns {string} 複素数のLaTeX表現
 */
function complexToLatex(complex, precision = 10) {
    if (!complex || typeof complex !== 'object') {
        return '';
    }
    
    const re = formatNumber(complex.re, precision);
    const im = formatNumber(complex.im, precision);
    
    if (complex.im === 0) {
        return re;
    } else if (complex.re === 0) {
        if (complex.im === 1) {
            return 'i';
        } else if (complex.im === -1) {
            return '-i';
        } else {
            return `${im}i`;
        }
    } else {
        if (complex.im === 1) {
            return `${re} + i`;
        } else if (complex.im === -1) {
            return `${re} - i`;
        } else if (complex.im > 0) {
            return `${re} + ${im}i`;
        } else {
            return `${re} - ${Math.abs(complex.im).toFixed(precision)}i`;
        }
    }
}

/**
 * オブジェクトをCSV形式に変換する
 * @param {Object} data - 変換するデータ
 * @returns {string} CSV形式の文字列
 */
function objectToCSV(data) {
    if (!data || typeof data !== 'object') {
        return '';
    }
    
    // 配列の場合
    if (Array.isArray(data)) {
        // 2次元配列の場合
        if (Array.isArray(data[0])) {
            return data.map(row => row.join(',')).join('\n');
        }
        // 1次元配列の場合
        return data.join(',');
    }
    
    // オブジェクトの場合
    const headers = Object.keys(data);
    const csvRows = [headers.join(',')];
    
    // 値が配列の場合
    if (Array.isArray(data[headers[0]])) {
        const rowCount = data[headers[0]].length;
        for (let i = 0; i < rowCount; i++) {
            const row = headers.map(header => {
                const value = data[header][i];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            });
            csvRows.push(row.join(','));
        }
    } else {
        // 値がスカラーの場合
        const row = headers.map(header => {
            const value = data[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        });
        csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
}

/**
 * データをJSONファイルとして保存する
 * @param {Object} data - 保存するデータ
 * @param {string} filename - ファイル名
 */
function saveAsJSON(data, filename = 'data.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, filename);
}

/**
 * データをCSVファイルとして保存する
 * @param {Object} data - 保存するデータ
 * @param {string} filename - ファイル名
 */
function saveAsCSV(data, filename = 'data.csv') {
    const csv = objectToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
}

/**
 * LaTeXをPDFファイルとして保存する
 * @param {string} latex - LaTeXコード
 * @param {string} filename - ファイル名
 */
function saveAsPDF(latex, filename = 'document.pdf') {
    // PDFへの変換はサーバーサイドで行うか、外部サービスを利用する必要がある
    // ここでは簡易的な実装として、LaTeXをテキストファイルとして保存
    const blob = new Blob([latex], { type: 'application/x-latex' });
    saveAs(blob, filename.replace('.pdf', '.tex'));
    
    showNotification('PDFへの直接変換はサポートされていません。LaTeXファイルとして保存しました。', 'info');
}

/**
 * 現在の日時を含むファイル名を生成する
 * @param {string} prefix - ファイル名の接頭辞
 * @param {string} extension - ファイル拡張子
 * @returns {string} 生成されたファイル名
 */
function generateFilename(prefix = 'data', extension = 'txt') {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${prefix}-${timestamp}.${extension}`;
}

/**
 * 数値の配列から基本統計量を計算する
 * @param {Array<number>} data - 数値の配列
 * @returns {Object} 基本統計量
 */
function calculateBasicStats(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return {
            count: 0,
            min: NaN,
            max: NaN,
            sum: 0,
            mean: NaN,
            median: NaN,
            variance: NaN,
            stdDev: NaN
        };
    }
    
    // 数値のみをフィルタリング
    const numericData = data.filter(x => typeof x === 'number' && !isNaN(x));
    
    if (numericData.length === 0) {
        return {
            count: 0,
            min: NaN,
            max: NaN,
            sum: 0,
            mean: NaN,
            median: NaN,
            variance: NaN,
            stdDev: NaN
        };
    }
    
    // ソートされたデータ
    const sortedData = [...numericData].sort((a, b) => a - b);
    
    // 基本統計量の計算
    const count = numericData.length;
    const min = sortedData[0];
    const max = sortedData[count - 1];
    const sum = numericData.reduce((acc, val) => acc + val, 0);
    const mean = sum / count;
    
    // 中央値
    let median;
    if (count % 2 === 0) {
        median = (sortedData[count / 2 - 1] + sortedData[count / 2]) / 2;
    } else {
        median = sortedData[Math.floor(count / 2)];
    }
    
    // 分散と標準偏差
    const variance = numericData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    
    return {
        count,
        min,
        max,
        sum,
        mean,
        median,
        variance,
        stdDev
    };
}

/**
 * 2つの数値配列間の相関係数を計算する
 * @param {Array<number>} x - 最初の数値配列
 * @param {Array<number>} y - 2番目の数値配列
 * @returns {number} 相関係数
 */
function calculateCorrelation(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length === 0) {
        return NaN;
    }
    
    // 数値ペアのみをフィルタリング
    const pairs = [];
    for (let i = 0; i < x.length; i++) {
        if (typeof x[i] === 'number' && !isNaN(x[i]) && typeof y[i] === 'number' && !isNaN(y[i])) {
            pairs.push([x[i], y[i]]);
        }
    }
    
    if (pairs.length === 0) {
        return NaN;
    }
    
    // 平均の計算
    const meanX = pairs.reduce((acc, pair) => acc + pair[0], 0) / pairs.length;
    const meanY = pairs.reduce((acc, pair) => acc + pair[1], 0) / pairs.length;
    
    // 相関係数の計算
    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;
    
    for (const [xi, yi] of pairs) {
        const xDiff = xi - meanX;
        const yDiff = yi - meanY;
        numerator += xDiff * yDiff;
        denominatorX += xDiff * xDiff;
        denominatorY += yDiff * yDiff;
    }
    
    const denominator = Math.sqrt(denominatorX * denominatorY);
    
    return denominator === 0 ? NaN : numerator / denominator;
}

/**
 * 線形回帰を計算する
 * @param {Array<number>} x - 説明変数の配列
 * @param {Array<number>} y - 目的変数の配列
 * @returns {Object} 回帰結果
 */
function calculateLinearRegression(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length === 0) {
        return {
            slope: NaN,
            intercept: NaN,
            rSquared: NaN,
            predict: () => NaN
        };
    }
    
    // 数値ペアのみをフィルタリング
    const pairs = [];
    for (let i = 0; i < x.length; i++) {
        if (typeof x[i] === 'number' && !isNaN(x[i]) && typeof y[i] === 'number' && !isNaN(y[i])) {
            pairs.push([x[i], y[i]]);
        }
    }
    
    if (pairs.length < 2) {
        return {
            slope: NaN,
            intercept: NaN,
            rSquared: NaN,
            predict: () => NaN
        };
    }
    
    // 平均の計算
    const meanX = pairs.reduce((acc, pair) => acc + pair[0], 0) / pairs.length;
    const meanY = pairs.reduce((acc, pair) => acc + pair[1], 0) / pairs.length;
    
    // 回帰係数の計算
    let numerator = 0;
    let denominator = 0;
    
    for (const [xi, yi] of pairs) {
        const xDiff = xi - meanX;
        numerator += xDiff * (yi - meanY);
        denominator += xDiff * xDiff;
    }
    
    const slope = denominator === 0 ? NaN : numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // 決定係数の計算
    let ssTotal = 0;
    let ssResidual = 0;
    
    for (const [xi, yi] of pairs) {
        const yPred = slope * xi + intercept;
        ssTotal += Math.pow(yi - meanY, 2);
        ssResidual += Math.pow(yi - yPred, 2);
    }
    
    const rSquared = ssTotal === 0 ? NaN : 1 - ssResidual / ssTotal;
    
    // 予測関数
    const predict = (newX) => slope * newX + intercept;
    
    return {
        slope,
        intercept,
        rSquared,
        predict
    };
}

/**
 * 多項式回帰を計算する
 * @param {Array<number>} x - 説明変数の配列
 * @param {Array<number>} y - 目的変数の配列
 * @param {number} degree - 多項式の次数
 * @returns {Object} 回帰結果
 */
function calculatePolynomialRegression(x, y, degree = 2) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length === 0) {
        return {
            coefficients: [],
            rSquared: NaN,
            predict: () => NaN
        };
    }
    
    // 数値ペアのみをフィルタリング
    const pairs = [];
    for (let i = 0; i < x.length; i++) {
        if (typeof x[i] === 'number' && !isNaN(x[i]) && typeof y[i] === 'number' && !isNaN(y[i])) {
            pairs.push([x[i], y[i]]);
        }
    }
    
    if (pairs.length <= degree) {
        return {
            coefficients: [],
            rSquared: NaN,
            predict: () => NaN
        };
    }
    
    // 行列を構築
    const X = [];
    const Y = [];
    
    for (const [xi, yi] of pairs) {
        const row = [];
        for (let j = 0; j <= degree; j++) {
            row.push(Math.pow(xi, j));
        }
        X.push(row);
        Y.push([yi]);
    }
    
    try {
        // 正規方程式を解く
        const Xt = numeric.transpose(X);
        const XtX = numeric.dot(Xt, X);
        const XtY = numeric.dot(Xt, Y);
        const coefficients = numeric.solve(XtX, XtY).map(c => c[0]);
        
        // 決定係数の計算
        const meanY = pairs.reduce((acc, pair) => acc + pair[1], 0) / pairs.length;
        let ssTotal = 0;
        let ssResidual = 0;
        
        for (const [xi, yi] of pairs) {
            let yPred = 0;
            for (let j = 0; j <= degree; j++) {
                yPred += coefficients[j] * Math.pow(xi, j);
            }
            ssTotal += Math.pow(yi - meanY, 2);
            ssResidual += Math.pow(yi - yPred, 2);
        }
        
        const rSquared = ssTotal === 0 ? NaN : 1 - ssResidual / ssTotal;
        
        // 予測関数
        const predict = (newX) => {
            let result = 0;
            for (let j = 0; j <= degree; j++) {
                result += coefficients[j] * Math.pow(newX, j);
            }
            return result;
        };
        
        return {
            coefficients,
            rSquared,
            predict
        };
    } catch (e) {
        console.error('多項式回帰計算エラー:', e);
        return {
            coefficients: [],
            rSquared: NaN,
            predict: () => NaN
        };
    }
}

/**
 * 数値を指定された範囲に制限する
 * @param {number} value - 制限する値
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {number} 制限された値
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * 数値を指定された範囲から別の範囲にマッピングする
 * @param {number} value - マッピングする値
 * @param {number} fromMin - 元の範囲の最小値
 * @param {number} fromMax - 元の範囲の最大値
 * @param {number} toMin - 新しい範囲の最小値
 * @param {number} toMax - 新しい範囲の最大値
 * @returns {number} マッピングされた値
 */
function mapRange(value, fromMin, fromMax, toMin, toMax) {
    // 元の範囲での相対位置を計算
    const normalizedValue = (value - fromMin) / (fromMax - fromMin);
    // 新しい範囲に変換
    return toMin + normalizedValue * (toMax - toMin);
}

/**
 * 角度をラジアンから度に変換する
 * @param {number} radians - ラジアン単位の角度
 * @returns {number} 度単位の角度
 */
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

/**
 * 角度を度からラジアンに変換する
 * @param {number} degrees - 度単位の角度
 * @returns {number} ラジアン単位の角度
 */
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * 極座標を直交座標に変換する
 * @param {number} r - 半径
 * @param {number} theta - 角度（ラジアン）
 * @returns {Object} 直交座標 {x, y}
 */
function polarToCartesian(r, theta) {
    return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta)
    };
}

/**
 * 直交座標を極座標に変換する
 * @param {number} x - x座標
 * @param {number} y - y座標
 * @returns {Object} 極座標 {r, theta}
 */
function cartesianToPolar(x, y) {
    const r = Math.sqrt(x * x + y * y);
    const theta = Math.atan2(y, x);
    return { r, theta };
}

/**
 * 球面座標を直交座標に変換する
 * @param {number} r - 半径
 * @param {number} theta - 極角（ラジアン）
 * @param {number} phi - 方位角（ラジアン）
 * @returns {Object} 直交座標 {x, y, z}
 */
function sphericalToCartesian(r, theta, phi) {
    return {
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta)
    };
}

/**
 * 直交座標を球面座標に変換する
 * @param {number} x - x座標
 * @param {number} y - y座標
 * @param {number} z - z座標
 * @returns {Object} 球面座標 {r, theta, phi}
 */
function cartesianToSpherical(x, y, z) {
    const r = Math.sqrt(x * x + y * y + z * z);
    const theta = r === 0 ? 0 : Math.acos(z / r);
    const phi = Math.atan2(y, x);
    return { r, theta, phi };
}

/**
 * 円柱座標を直交座標に変換する
 * @param {number} r - 半径
 * @param {number} phi - 方位角（ラジアン）
 * @param {number} z - 高さ
 * @returns {Object} 直交座標 {x, y, z}
 */
function cylindricalToCartesian(r, phi, z) {
    return {
        x: r * Math.cos(phi),
        y: r * Math.sin(phi),
        z: z
    };
}

/**
 * 直交座標を円柱座標に変換する
 * @param {number} x - x座標
 * @param {number} y - y座標
 * @param {number} z - z座標
 * @returns {Object} 円柱座標 {r, phi, z}
 */
function cartesianToCylindrical(x, y, z) {
    const r = Math.sqrt(x * x + y * y);
    const phi = Math.atan2(y, x);
    return { r, phi, z };
}

/**
 * 配列をシャッフルする
 * @param {Array} array - シャッフルする配列
 * @returns {Array} シャッフルされた配列
 */
function shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * 指定された範囲の整数の配列を生成する
 * @param {number} start - 開始値
 * @param {number} end - 終了値
 * @param {number} step - ステップ
 * @returns {Array<number>} 整数の配列
 */
function range(start, end, step = 1) {
    const result = [];
    if (step === 0) return result;
    
    if (step > 0) {
        for (let i = start; i <= end; i += step) {
            result.push(i);
        }
    } else {
        for (let i = start; i >= end; i += step) {
            result.push(i);
        }
    }
    
    return result;
}

/**
 * 線形空間の配列を生成する
 * @param {number} start - 開始値
 * @param {number} end - 終了値
 * @param {number} num - 要素数
 * @returns {Array<number>} 線形空間の配列
 */
function linspace(start, end, num = 50) {
    const result = [];
    if (num <= 0) return result;
    if (num === 1) return [start];
    
    const step = (end - start) / (num - 1);
    for (let i = 0; i < num; i++) {
        result.push(start + step * i);
    }
    
    return result;
}

/**
 * 対数空間の配列を生成する
 * @param {number} start - 開始値（10の累乗）
 * @param {number} end - 終了値（10の累乗）
 * @param {number} num - 要素数
 * @returns {Array<number>} 対数空間の配列
 */
function logspace(start, end, num = 50) {
    const result = [];
    if (num <= 0) return result;
    
    const logStart = Math.log10(start);
    const logEnd = Math.log10(end);
    const linearSpace = linspace(logStart, logEnd, num);
    
    return linearSpace.map(x => Math.pow(10, x));
}

/**
 * 配列の要素の合計を計算する
 * @param {Array<number>} array - 数値の配列
 * @returns {number} 合計
 */
function sum(array) {
    if (!Array.isArray(array) || array.length === 0) return 0;
    return array.reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
}

/**
 * 配列の要素の平均を計算する
 * @param {Array<number>} array - 数値の配列
 * @returns {number} 平均
 */
function mean(array) {
    if (!Array.isArray(array) || array.length === 0) return NaN;
    const validValues = array.filter(val => typeof val === 'number' && !isNaN(val));
    if (validValues.length === 0) return NaN;
    return sum(validValues) / validValues.length;
}

/**
 * 配列の要素の中央値を計算する
 * @param {Array<number>} array - 数値の配列
 * @returns {number} 中央値
 */
function median(array) {
    if (!Array.isArray(array) || array.length === 0) return NaN;
    const validValues = array.filter(val => typeof val === 'number' && !isNaN(val));
    if (validValues.length === 0) return NaN;
    
    const sorted = [...validValues].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
        return sorted[mid];
    }
}

/**
 * 配列の要素の分散を計算する
 * @param {Array<number>} array - 数値の配列
 * @param {boolean} isSample - サンプル分散を計算するかどうか
 * @returns {number} 分散
 */
function variance(array, isSample = true) {
    if (!Array.isArray(array) || array.length === 0) return NaN;
    const validValues = array.filter(val => typeof val === 'number' && !isNaN(val));
    if (validValues.length === 0) return NaN;
    
    const avg = mean(validValues);
    const squaredDiffs = validValues.map(val => Math.pow(val - avg, 2));
    const divisor = isSample ? validValues.length - 1 : validValues.length;
    
    return sum(squaredDiffs) / divisor;
}

/**
 * 配列の要素の標準偏差を計算する
 * @param {Array<number>} array - 数値の配列
 * @param {boolean} isSample - サンプル標準偏差を計算するかどうか
 * @returns {number} 標準偏差
 */
function standardDeviation(array, isSample = true) {
    return Math.sqrt(variance(array, isSample));
}

/**
 * 配列の要素の最小値を計算する
 * @param {Array<number>} array - 数値の配列
 * @returns {number} 最小値
 */
function min(array) {
    if (!Array.isArray(array) || array.length === 0) return NaN;
    const validValues = array.filter(val => typeof val === 'number' && !isNaN(val));
    if (validValues.length === 0) return NaN;
    return Math.min(...validValues);
}

/**
 * 配列の要素の最大値を計算する
 * @param {Array<number>} array - 数値の配列
 * @returns {number} 最大値
 */
function max(array) {
    if (!Array.isArray(array) || array.length === 0) return NaN;
    const validValues = array.filter(val => typeof val === 'number' && !isNaN(val));
    if (validValues.length === 0) return NaN;
    return Math.max(...validValues);
}

/**
 * 配列の要素の四分位数を計算する
 * @param {Array<number>} array - 数値の配列
 * @returns {Object} 四分位数 {q1, q2, q3}
 */
function quartiles(array) {
    if (!Array.isArray(array) || array.length === 0) {
        return { q1: NaN, q2: NaN, q3: NaN };
    }
    
    const validValues = array.filter(val => typeof val === 'number' && !isNaN(val));
    if (validValues.length === 0) {
        return { q1: NaN, q2: NaN, q3: NaN };
    }
    
    const sorted = [...validValues].sort((a, b) => a - b);
    const q2 = median(sorted);
    
    const lowerHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const upperHalf = sorted.slice(Math.ceil(sorted.length / 2));
    
    const q1 = median(lowerHalf);
    const q3 = median(upperHalf);
    
    return { q1, q2, q3 };
}

/**
 * 配列の要素のパーセンタイルを計算する
 * @param {Array<number>} array - 数値の配列
 * @param {number} p - パーセンタイル（0～100）
 * @returns {number} パーセンタイル値
 */
function percentile(array, p) {
    if (!Array.isArray(array) || array.length === 0 || p < 0 || p > 100) {
        return NaN;
    }
    
    const validValues = array.filter(val => typeof val === 'number' && !isNaN(val));
    if (validValues.length === 0) {
        return NaN;
    }
    
    const sorted = [...validValues].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
        return sorted[lower];
    }
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * 配列の要素のモード（最頻値）を計算する
 * @param {Array} array - 値の配列
 * @returns {Array} モード（複数ある場合もある）
 */
function mode(array) {
    if (!Array.isArray(array) || array.length === 0) {
        return [];
    }
    
    // 頻度を計算
    const frequency = {};
    let maxFreq = 0;
    
    for (const value of array) {
        const key = String(value);
        frequency[key] = (frequency[key] || 0) + 1;
        maxFreq = Math.max(maxFreq, frequency[key]);
    }
    
    // 最頻値を抽出
    const modes = [];
    for (const [key, freq] of Object.entries(frequency)) {
        if (freq === maxFreq) {
            // 数値に変換を試みる
            const numValue = Number(key);
            modes.push(isNaN(numValue) ? key : numValue);
        }
    }
    
    return modes;
}

/**
 * 2つの配列の共分散を計算する
 * @param {Array<number>} x - 最初の数値配列
 * @param {Array<number>} y - 2番目の数値配列
 * @param {boolean} isSample - サンプル共分散を計算するかどうか
 * @returns {number} 共分散
 */
function covariance(x, y, isSample = true) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length === 0) {
        return NaN;
    }
    
    // 有効なペアのみをフィルタリング
    const pairs = [];
    for (let i = 0; i < x.length; i++) {
        if (typeof x[i] === 'number' && !isNaN(x[i]) && typeof y[i] === 'number' && !isNaN(y[i])) {
            pairs.push([x[i], y[i]]);
        }
    }
    
    if (pairs.length === 0) {
        return NaN;
    }
    
    const meanX = pairs.reduce((acc, pair) => acc + pair[0], 0) / pairs.length;
    const meanY = pairs.reduce((acc, pair) => acc + pair[1], 0) / pairs.length;
    
    const sumOfProducts = pairs.reduce((acc, pair) => acc + (pair[0] - meanX) * (pair[1] - meanY), 0);
    const divisor = isSample ? pairs.length - 1 : pairs.length;
    
    return sumOfProducts / divisor;
}

/**
 * 文字列をキャメルケースに変換する
 * @param {string} str - 変換する文字列
 * @returns {string} キャメルケースの文字列
 */
function toCamelCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '');
}

/**
 * 文字列をパスカルケースに変換する
 * @param {string} str - 変換する文字列
 * @returns {string} パスカルケースの文字列
 */
function toPascalCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
        .replace(/\s+/g, '');
}

/**
 * 文字列をスネークケースに変換する
 * @param {string} str - 変換する文字列
 * @returns {string} スネークケースの文字列
 */
function toSnakeCase(str) {
    return str
        .replace(/\s+/g, '_')
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '');
}

/**
 * 文字列をケバブケースに変換する
 * @param {string} str - 変換する文字列
 * @returns {string} ケバブケースの文字列
 */
function toKebabCase(str) {
    return str
        .replace(/\s+/g, '-')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
}

/**
 * 数値を指定された基数の文字列に変換する
 * @param {number} num - 変換する数値
 * @param {number} base - 基数（2～36）
 * @returns {string} 変換された文字列
 */
function toBaseString(num, base) {
    if (base < 2 || base > 36) {
        throw new Error('基数は2から36の間である必要があります');
    }
    return Math.floor(num).toString(base);
}

/**
 * 指定された基数の文字列を数値に変換する
 * @param {string} str - 変換する文字列
 * @param {number} base - 基数（2～36）
 * @returns {number} 変換された数値
 */
function fromBaseString(str, base) {
    if (base < 2 || base > 36) {
        throw new Error('基数は2から36の間である必要があります');
    }
    return parseInt(str, base);
}

/**
 * 数値を科学表記法の文字列に変換する
 * @param {number} num - 変換する数値
 * @param {number} precision - 小数点以下の桁数
 * @returns {string} 科学表記法の文字列
 */
function toScientificNotation(num, precision = 6) {
    return num.toExponential(precision);
}

/**
 * 数値を工学表記法の文字列に変換する
 * @param {number} num - 変換する数値
 * @param {number} precision - 小数点以下の桁数
 * @returns {string} 工学表記法の文字列
 */
function toEngineeringNotation(num, precision = 6) {
    const exponent = Math.floor(Math.log10(Math.abs(num)));
    const engineeringExp = Math.floor(exponent / 3) * 3;
    const mantissa = num / Math.pow(10, engineeringExp);
    return mantissa.toFixed(precision) + 'e' + engineeringExp;
}

/**
 * 数値を指定された単位の文字列に変換する
 * @param {number} num - 変換する数値
 * @param {string} unit - 単位
 * @param {number} precision - 小数点以下の桁数
 * @returns {string} 単位付きの文字列
 */
function formatWithUnit(num, unit, precision = 2) {
    return num.toFixed(precision) + ' ' + unit;
}

/**
 * 数値をSI接頭辞付きの文字列に変換する
 * @param {number} num - 変換する数値
 * @param {string} unit - 基本単位
 * @param {number} precision - 小数点以下の桁数
 * @returns {string} SI接頭辞付きの文字列
 */
function formatWithSIPrefix(num, unit = '', precision = 2) {
    const prefixes = {
        24: 'Y', // ヨタ
        21: 'Z', // ゼタ
        18: 'E', // エクサ
        15: 'P', // ペタ
        12: 'T', // テラ
        9: 'G',  // ギガ
        6: 'M',  // メガ
        3: 'k',  // キロ
        0: '',
        '-3': 'm',  // ミリ
        '-6': 'μ',  // マイクロ
        '-9': 'n',  // ナノ
        '-12': 'p', // ピコ
        '-15': 'f', // フェムト
        '-18': 'a', // アト
        '-21': 'z', // ゼプト
        '-24': 'y'  // ヨクト
    };
    
    if (num === 0) return '0 ' + unit;
    
    const exponent = Math.floor(Math.log10(Math.abs(num)) / 3) * 3;
    const clampedExponent = Math.max(Math.min(exponent, 24), -24);
    const scaledNum = num / Math.pow(10, clampedExponent);
    
    return scaledNum.toFixed(precision) + ' ' + prefixes[clampedExponent] + unit;
}

/**
 * 数値を通貨形式の文字列に変換する
 * @param {number} num - 変換する数値
 * @param {string} currency - 通貨コード
 * @param {string} locale - ロケール
 * @returns {string} 通貨形式の文字列
 */
function formatCurrency(num, currency = 'JPY', locale = 'ja-JP') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(num);
}

/**
 * 日付を指定された形式の文字列に変換する
 * @param {Date} date - 変換する日付
 * @param {string} format - 日付形式
 * @returns {string} 形式化された日付文字列
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();
    
    return format
        .replace('YYYY', year)
        .replace('YY', String(year).slice(-2))
        .replace('MM', month.toString().padStart(2, '0'))
        .replace('M', month)
        .replace('DD', day.toString().padStart(2, '0'))
        .replace('D', day)
        .replace('HH', hours.toString().padStart(2, '0'))
        .replace('H', hours)
        .replace('mm', minutes.toString().padStart(2, '0'))
        .replace('m', minutes)
        .replace('ss', seconds.toString().padStart(2, '0'))
        .replace('s', seconds)
        .replace('SSS', milliseconds.toString().padStart(3, '0'));
}

/**
 * 文字列をHTML特殊文字にエスケープする
 * @param {string} str - エスケープする文字列
 * @returns {string} エスケープされた文字列
 */
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * 文字列からHTML特殊文字をアンエスケープする
 * @param {string} str - アンエスケープする文字列
 * @returns {string} アンエスケープされた文字列
 */
function unescapeHTML(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

/**
 * 文字列をURLエンコードする
 * @param {string} str - エンコードする文字列
 * @returns {string} エンコードされた文字列
 */
function encodeURL(str) {
    return encodeURIComponent(str);
}

/**
 * URLエンコードされた文字列をデコードする
 * @param {string} str - デコードする文字列
 * @returns {string} デコードされた文字列
 */
function decodeURL(str) {
    return decodeURIComponent(str);
}

/**
 * 文字列をBase64エンコードする
 * @param {string} str - エンコードする文字列
 * @returns {string} Base64エンコードされた文字列
 */
function encodeBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
    }));
}

/**
 * Base64エンコードされた文字列をデコードする
 * @param {string} str - デコードする文字列
 * @returns {string} デコードされた文字列
 */
function decodeBase64(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

/**
 * 文字列のハッシュ値を計算する（単純なハッシュ関数）
 * @param {string} str - ハッシュ化する文字列
 * @returns {number} ハッシュ値
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32ビット整数に変換
    }
    return hash;
}

/**
 * 文字列が有効なJSONかどうかを検証する
 * @param {string} str - 検証する文字列
 * @returns {boolean} 有効なJSONならtrue
 */
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * 文字列が有効なURLかどうかを検証する
 * @param {string} str - 検証する文字列
 * @returns {boolean} 有効なURLならtrue
 */
function isValidURL(str) {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * 文字列が有効なメールアドレスかどうかを検証する
 * @param {string} str - 検証する文字列
 * @returns {boolean} 有効なメールアドレスならtrue
 */
function isValidEmail(str) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(str);
}

/**
 * 文字列が有効な数値かどうかを検証する
 * @param {string} str - 検証する文字列
 * @returns {boolean} 有効な数値ならtrue
 */
function isValidNumber(str) {
    return !isNaN(parseFloat(str)) && isFinite(str);
}

/**
 * 文字列が有効な整数かどうかを検証する
 * @param {string} str - 検証する文字列
 * @returns {boolean} 有効な整数ならtrue
 */
function isValidInteger(str) {
    return /^-?\d+$/.test(str);
}

/**
 * 文字列が有効な16進数かどうかを検証する
 * @param {string} str - 検証する文字列
 * @returns {boolean} 有効な16進数ならtrue
 */
function isValidHex(str) {
    return /^[0-9A-Fa-f]+$/.test(str);
}

/**
 * 文字列が有効な日付かどうかを検証する
 * @param {string} str - 検証する文字列
 * @returns {boolean} 有効な日付ならtrue
 */
function isValidDate(str) {
    const date = new Date(str);
    return !isNaN(date.getTime());
}

/**
 * 文字列をトリムする
 * @param {string} str - トリムする文字列
 * @returns {string} トリムされた文字列
 */
function trim(str) {
    return str.trim();
}

/**
 * 文字列を指定された長さに切り詰める
 * @param {string} str - 切り詰める文字列
 * @param {number} maxLength - 最大長
 * @param {string} suffix - 接尾辞
 * @returns {string} 切り詰められた文字列
 */
function truncate(str, maxLength, suffix = '...') {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 文字列を指定された長さに埋める
 * @param {string} str - 埋める文字列
 * @param {number} length - 目標の長さ
 * @param {string} char - 埋め文字
 * @param {boolean} end - 末尾に埋めるかどうか
 * @returns {string} 埋められた文字列
 */
function pad(str, length, char = ' ', end = false) {
    if (str.length >= length) return str;
    const padding = char.repeat(length - str.length);
    return end ? str + padding : padding + str;
}

/**
 * 文字列を指定された回数繰り返す
 * @param {string} str - 繰り返す文字列
 * @param {number} count - 繰り返し回数
 * @returns {string} 繰り返された文字列
 */
function repeat(str, count) {
    return str.repeat(count);
}

/**
 * 文字列を逆順にする
 * @param {string} str - 逆順にする文字列
 * @returns {string} 逆順にされた文字列
 */
function reverse(str) {
    return str.split('').reverse().join('');
}

/**
 * 文字列の最初の文字を大文字にする
 * @param {string} str - 変換する文字列
 * @returns {string} 変換された文字列
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 文字列をタイトルケースに変換する
 * @param {string} str - 変換する文字列
 * @returns {string} タイトルケースの文字列
 */
function toTitleCase(str) {
    return str.replace(/\b\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

/**
 * 文字列を複数の区切り文字で分割する
 * @param {string} str - 分割する文字列
 * @param {Array<string>} separators - 区切り文字の配列
 * @returns {Array<string>} 分割された文字列の配列
 */
function splitMultiple(str, separators) {
    let result = [str];
    for (const separator of separators) {
        result = result.flatMap(s => s.split(separator));
    }
    return result.filter(s => s.length > 0);
}

/**
 * 文字列内の特定のパターンを置換する
 * @param {string} str - 置換する文字列
 * @param {string|RegExp} pattern - 置換するパターン
 * @param {string|Function} replacement - 置換後の文字列または関数
 * @returns {string} 置換された文字列
 */
function replaceAll(str, pattern, replacement) {
    if (typeof pattern === 'string') {
        pattern = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    }
    return str.replace(pattern, replacement);
}

/**
 * 文字列内の特定の文字の出現回数をカウントする
 * @param {string} str - 検索する文字列
 * @param {string} char - カウントする文字
 * @returns {number} 出現回数
 */
function countChar(str, char) {
    return str.split(char).length - 1;
}

/**
 * 文字列内の単語数をカウントする
 * @param {string} str - カウントする文字列
 * @returns {number} 単語数
 */
function countWords(str) {
    return str.trim().split(/\s+/).length;
}

/**
 * 文字列内の行数をカウントする
 * @param {string} str - カウントする文字列
 * @returns {number} 行数
 */
function countLines(str) {
    return str.split(/\r\n|\r|\n/).length;
}

/**
 * 文字列が別の文字列で始まるかどうかを確認する
 * @param {string} str - 確認する文字列
 * @param {string} prefix - 接頭辞
 * @returns {boolean} 接頭辞で始まるならtrue
 */
function startsWith(str, prefix) {
    return str.startsWith(prefix);
}

/**
 * 文字列が別の文字列で終わるかどうかを確認する
 * @param {string} str - 確認する文字列
 * @param {string} suffix - 接尾辞
 * @returns {boolean} 接尾辞で終わるならtrue
 */
function endsWith(str, suffix) {
    return str.endsWith(suffix);
}

/**
 * 文字列が別の文字列を含むかどうかを確認する
 * @param {string} str - 確認する文字列
 * @param {string} substring - 部分文字列
 * @returns {boolean} 部分文字列を含むならtrue
 */
function contains(str, substring) {
    return str.includes(substring);
}

/**
 * 文字列を指定された区切り文字で結合する
 * @param {Array<string>} strings - 結合する文字列の配列
 * @param {string} separator - 区切り文字
 * @returns {string} 結合された文字列
 */
function join(strings, separator = '') {
    return strings.join(separator);
}

/**
 * 文字列から特定の文字を削除する
 * @param {string} str - 処理する文字列
 * @param {string} chars - 削除する文字
 * @returns {string} 処理された文字列
 */
function removeChars(str, chars) {
    let result = str;
    for (const char of chars) {
        result = result.split(char).join('');
    }
    return result;
}

/**
 * 文字列から空白を削除する
 * @param {string} str - 処理する文字列
 * @returns {string} 処理された文字列
 */
function removeWhitespace(str) {
    return str.replace(/\s+/g, '');
}

/**
 * 文字列をスラッグ化する（URL用に変換する）
 * @param {string} str - 変換する文字列
 * @returns {string} スラッグ化された文字列
 */
function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // 英数字、アンダースコア、ハイフン、空白以外を削除
        .replace(/[\s_-]+/g, '-') // 空白、アンダースコア、ハイフンをハイフンに置換
        .replace(/^-+|-+$/g, ''); // 先頭と末尾のハイフンを削除
}

/**
 * 文字列をキャメルケースからスネークケースに変換する
 * @param {string} str - 変換する文字列
 * @returns {string} スネークケースの文字列
 */
function camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * 文字列をスネークケースからキャメルケースに変換する
 * @param {string} str - 変換する文字列
 * @returns {string} キャメルケースの文字列
 */
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 文字列をキャメルケースからケバブケースに変換する
 * @param {string} str - 変換する文字列
 * @returns {string} ケバブケースの文字列
 */
function camelToKebab(str) {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

/**
 * 文字列をケバブケースからキャメルケースに変換する
 * @param {string} str - 変換する文字列
 * @returns {string} キャメルケースの文字列
 */
function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 文字列を指定された幅で折り返す
 * @param {string} str - 折り返す文字列
 * @param {number} width - 折り返し幅
 * @param {string} breakChar - 折り返し文字
 * @returns {string} 折り返された文字列
 */
function wordWrap(str, width = 80, breakChar = '\n') {
    const regex = new RegExp(`(.{1,${width}})( +|$\n?)|(.{1,${width}})`, 'g');
    return str.replace(regex, (_, line, space, lastLine) => {
        if (line) {
            return line + (space ? breakChar : '');
        }
        return lastLine + breakChar;
    });
}

/**
 * 文字列内の特定のパターンにマッチする部分を抽出する
 * @param {string} str - 検索する文字列
 * @param {RegExp} pattern - 検索パターン
 * @returns {Array<string>} マッチした部分の配列
 */
function extractMatches(str, pattern) {
    const matches = str.match(pattern);
    return matches || [];
}

/**
 * 文字列内の数値を抽出する
 * @param {string} str - 検索する文字列
 * @returns {Array<number>} 抽出された数値の配列
 */
function extractNumbers(str) {
    const matches = str.match(/-?\d+(\.\d+)?/g);
    return matches ? matches.map(Number) : [];
}

/**
 * 文字列内のURLを抽出する
 * @param {string} str - 検索する文字列
 * @returns {Array<string>} 抽出されたURLの配列
 */
function extractURLs(str) {
    const urlPattern = /https?:\/\/[^\s]+/g;
    const matches = str.match(urlPattern);
    return matches || [];
}

/**
 * 文字列内のメールアドレスを抽出する
 * @param {string} str - 検索する文字列
 * @returns {Array<string>} 抽出されたメールアドレスの配列
 */
function extractEmails(str) {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = str.match(emailPattern);
    return matches || [];
}

/**
 * 文字列内のハッシュタグを抽出する
 * @param {string} str - 検索する文字列
 * @returns {Array<string>} 抽出されたハッシュタグの配列
 */
function extractHashtags(str) {
    const hashtagPattern = /#[a-zA-Z0-9_]+/g;
    const matches = str.match(hashtagPattern);
    return matches || [];
}

/**
 * 文字列内のメンション（@username）を抽出する
 * @param {string} str - 検索する文字列
 * @returns {Array<string>} 抽出されたメンションの配列
 */
function extractMentions(str) {
    const mentionPattern = /@[a-zA-Z0-9_]+/g;
    const matches = str.match(mentionPattern);
    return matches || [];
}

/**
 * 文字列をランダムに生成する
 * @param {number} length - 生成する文字列の長さ
 * @param {string} charset - 使用する文字セット
 * @returns {string} ランダムな文字列
 */
function generateRandomString(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset.charAt(randomIndex);
    }
    return result;
}


