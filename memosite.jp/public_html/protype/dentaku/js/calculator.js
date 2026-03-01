/**
 * 基本電卓機能
 */

function initializeCalculator() {
    const calcInput = document.getElementById('calc-input');
    const calcBtn = document.getElementById('calc-btn');
    const calcLatexBtn = document.getElementById('calc-latex-btn');
    const calcOutput = document.getElementById('calc-output');
    const calcLatex = document.getElementById('calc-latex');
    
    // 計算ボタンのイベントリスナー
    if (calcBtn) {
        calcBtn.addEventListener('click', calculateExpression);
    }
    
    // LaTeX表示ボタンのイベントリスナー
    if (calcLatexBtn) {
        calcLatexBtn.addEventListener('click', displayLatex);
    }
    
    // Enterキーで計算実行
    if (calcInput) {
        calcInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                calculateExpression();
            }
        });
    }
    
    console.log('基本電卓が初期化されました');
}

/**
 * 数式を計算
 */
function calculateExpression() {
    const calcInput = document.getElementById('calc-input');
    const calcOutput = document.getElementById('calc-output');
    
    if (!calcInput || !calcOutput) return;
    
    const expression = calcInput.value.trim();
    if (!expression) {
        calcOutput.textContent = '式を入力してください';
        return;
    }
    
    try {
        // 角度の単位を設定
        const angleUnit = app.settings.angleUnit;
        math.config({
            number: 'number',
            precision: app.settings.precision
        });
        
        // 角度単位に応じた設定
        if (angleUnit === 'deg') {
            // 度数法で計算
            math.config({
                angles: 'deg'
            });
        } else {
            // ラジアンで計算
            math.config({
                angles: 'rad'
            });
        }
        
        // 式を評価
        const result = math.evaluate(expression);
        
        // 結果をフォーマット
        let formattedResult;
        if (math.typeof(result) === 'number') {
            formattedResult = mathUtils.formatNumber(result);
        } else if (math.typeof(result) === 'Complex') {
            formattedResult = mathUtils.formatComplex(result);
        } else if (math.typeof(result) === 'Matrix') {
            formattedResult = mathUtils.formatMatrix(result.toArray());
        } else if (Array.isArray(result)) {
            if (Array.isArray(result[0])) {
                formattedResult = mathUtils.formatMatrix(result);
            } else {
                formattedResult = mathUtils.formatVector(result);
            }
        } else {
            formattedResult = String(result);
        }
        
        // 結果を表示
        calcOutput.textContent = formattedResult;
        
        // 計算履歴に追加
        addToHistory(expression, formattedResult);
        
    } catch (error) {
        console.error('計算エラー:', error);
        calcOutput.textContent = `エラー: ${error.message}`;
    }
}

/**
 * LaTeX形式で表示
 */
function displayLatex() {
    const calcInput = document.getElementById('calc-input');
    const calcLatex = document.getElementById('calc-latex');
    
    if (!calcInput || !calcLatex) return;
    
    const expression = calcInput.value.trim();
    if (!expression) {
        calcLatex.textContent = '';
        return;
    }
    
    try {
        // 式をLaTeX形式に変換
        const latexExpression = mathUtils.expressionToLatex(expression);
        
        // MathJaxで描画
        calcLatex.textContent = '';
        calcLatex.innerHTML = `\\[${latexExpression}\\]`;
        
        // MathJaxを再描画
        if (window.MathJax) {
            MathJax.typesetPromise([calcLatex]).catch(err => console.error('MathJax error:', err));
        }
        
    } catch (error) {
        console.error('LaTeX変換エラー:', error);
        calcLatex.textContent = `エラー: ${error.message}`;
    }
}

/**
 * 計算履歴に追加
 * @param {string} expression - 計算式
 * @param {string} result - 計算結果
 */
function addToHistory(expression, result) {
    // 履歴オブジェクトを作成
    const historyItem = {
        expression: expression,
        result: result,
        timestamp: new Date().toISOString()
    };
    
    // 履歴に追加
    app.history.unshift(historyItem);
    
    // 履歴の最大数を制限（例: 100件）
    if (app.history.length > 100) {
        app.history.pop();
    }
    
    // ローカルストレージに保存
    localStorage.setItem('calculatorHistory', JSON.stringify(app.history));
}

/**
 * 計算履歴を読み込む
 */
function loadHistory() {
    const historyTab = document.getElementById('history');
    if (!historyTab) return;
    
    // ローカルストレージから履歴を読み込む
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        try {
            app.history = JSON.parse(savedHistory);
        } catch (error) {
            console.error('履歴の読み込みに失敗しました:', error);
            app.history = [];
        }
    }
    
    // 履歴を表示
    displayHistory();
}

/**
 * 計算履歴を表示
 */
function displayHistory() {
    const historyTab = document.getElementById('history');
    if (!historyTab) return;
    
    // 履歴表示用のHTML要素を取得または作成
    let historyContainer = historyTab.querySelector('.history-container');
    if (!historyContainer) {
        historyContainer = document.createElement('div');
        historyContainer.className = 'history-container';
        historyTab.appendChild(historyContainer);
    }
    
    // 履歴がない場合
    if (app.history.length === 0) {
        historyContainer.innerHTML = '<p>計算履歴はありません</p>';
        return;
    }
    
    // 履歴を表示
    let historyHTML = '<ul class="history-list">';
    app.history.forEach((item, index) => {
        const date = new Date(item.timestamp);
        const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        historyHTML += `
            <li class="history-item">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">${item.result}</div>
                <div class="history-timestamp">${formattedDate}</div>
                <button class="history-use-btn" data-index="${index}">再利用</button>
                <button class="history-delete-btn" data-index="${index}">削除</button>
            </li>
        `;
    });
    historyHTML += '</ul>';
    
    // 履歴をクリアするボタンを追加
    historyHTML += '<button id="clear-history-btn" class="danger-btn">履歴をクリア</button>';
    
    // HTMLを設定
    historyContainer.innerHTML = historyHTML;
    
    // 履歴アイテムのボタンにイベントリスナーを設定
    const useButtons = historyContainer.querySelectorAll('.history-use-btn');
    useButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            useHistoryItem(index);
        });
    });
    
    const deleteButtons = historyContainer.querySelectorAll('.history-delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            deleteHistoryItem(index);
        });
    });
    
    // 履歴クリアボタンにイベントリスナーを設定
    const clearButton = document.getElementById('clear-history-btn');
    if (clearButton) {
        clearButton.addEventListener('click', clearHistory);
    }
}

/**
 * 履歴アイテムを再利用
 * @param {number} index - 履歴アイテムのインデックス
 */
function useHistoryItem(index) {
    if (index < 0 || index >= app.history.length) return;
    
    const item = app.history[index];
    
    // 計算タブに切り替え
    showTab('calculator');
    
    // 式を入力欄に設定
    const calcInput = document.getElementById('calc-input');
    if (calcInput) {
        calcInput.value = item.expression;
    }
}

/**
 * 履歴アイテムを削除
 * @param {number} index - 履歴アイテムのインデックス
 */
function deleteHistoryItem(index) {
    if (index < 0 || index >= app.history.length) return;
    
    // 履歴から削除
    app.history.splice(index, 1);
    
    // ローカルストレージを更新
    localStorage.setItem('calculatorHistory', JSON.stringify(app.history));
    
    // 履歴表示を更新
    displayHistory();
}

/**
 * 履歴をクリア
 */
function clearHistory() {
    showModal(
        '履歴のクリア',
        '計算履歴をすべて削除しますか？この操作は元に戻せません。',
        () => {
            // 履歴をクリア
            app.history = [];
            
            // ローカルストレージを更新
            localStorage.setItem('calculatorHistory', JSON.stringify(app.history));
            
            // 履歴表示を更新
            displayHistory();
            
            showNotification('計算履歴がクリアされました', 'success');
        }
    );
}

