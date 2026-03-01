/**
 * 高度数学電卓アプリケーション
 * メインスクリプト
 */

// アプリケーションの状態を管理するグローバルオブジェクト
const app = {
    // 現在のタブ
    currentTab: 'calculator',
    
    // 計算履歴
    history: [],
    
    // 設定
    settings: {
        precision: 10,
        notation: 'auto',
        angleUnit: 'rad',
        theme: 'light',
        plotStyle: 'default',
        fontSize: 'medium',
        latexRenderer: 'mathjax',
        maxIterations: 1000,
        tolerance: 1e-10,
        complexMode: 'auto',
        exportFormat: 'csv',
        plotResolution: 300,
        plotSize: '8,6',
        cache: true,
        parallel: true,
        symbolic: true,
        customConstants: {}
    }
};

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * アプリケーションの初期化
 */
function initializeApp() {
    // 設定の読み込み
    loadSettings();
    
    // テーマの適用
    applyTheme();
    
    // 履歴の読み込み
    loadHistory();
    
    // タブ切り替えの初期化
    initializeTabs();
    
    // テーマ切り替えの初期化
    initializeThemeToggle();
    
    // 各機能の初期化
    initializeCalculator();
    initializeVectorCalculations();
    initializeMatrixCalculations();
    initializeComplexCalculations();
    initializeFieldCalculations();
    initializeDifferentialEquations();
    initializeIntegration();
    initializeStatistics();
    initializeFourier();
    initializeTensor();
    initializeOptimization();
    initializePlotting();
    
    // モーダルとNotificationの初期化
    initializeModal();
    initializeNotification();
    
    console.log('アプリケーションが初期化されました');
}

/**
 * 設定の読み込み
 */
function loadSettings() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        try {
            const parsedSettings = JSON.parse(savedSettings);
            app.settings = { ...app.settings, ...parsedSettings };
        } catch (error) {
            console.error('設定の読み込みエラー:', error);
        }
    }
    
    // Math.jsの設定を適用
    math.config({
        number: 'number',
        precision: app.settings.precision,
        epsilon: 1e-12
    });
}

/**
 * 履歴の読み込み
 */
function loadHistory() {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        try {
            app.history = JSON.parse(savedHistory);
        } catch (error) {
            console.error('履歴の読み込みエラー:', error);
            app.history = [];
        }
    }
}

/**
 * テーマの適用
 */
function applyTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    
    if (app.settings.theme === 'dark' || 
        (app.settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        body.classList.add('dark-theme');
        if (themeSwitch) themeSwitch.checked = true;
    } else {
        body.classList.remove('dark-theme');
        if (themeSwitch) themeSwitch.checked = false;
    }
}

/**
 * タブ切り替えの初期化
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            showTab(tabName);
        });
    });
    
    // 初期タブを表示
    showTab(app.currentTab);
}

/**
 * 指定したタブを表示
 * @param {string} tabName - 表示するタブの名前
 */
function showTab(tabName) {
    // タブボタンのアクティブ状態を更新
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // タブコンテンツの表示状態を更新
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        if (content.id === tabName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // 現在のタブを更新
    app.currentTab = tabName;
    
    // 履歴タブの場合は履歴を表示
    if (tabName === 'history') {
        displayHistory();
    }
}

/**
 * テーマ切り替えの初期化
 */
function initializeThemeToggle() {
    const themeSwitch = document.getElementById('theme-switch');
    
    if (themeSwitch) {
        themeSwitch.addEventListener('change', () => {
            if (themeSwitch.checked) {
                document.body.classList.add('dark-theme');
                app.settings.theme = 'dark';
            } else {
                document.body.classList.remove('dark-theme');
                app.settings.theme = 'light';
            }
            
            // 設定を保存
            saveSettings();
        });
    }
}

/**
 * 設定を保存
 */
function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(app.settings));
}

/**
 * モーダルダイアログの初期化
 */
function initializeModal() {
    const modal = document.getElementById('modal');
    const closeButton = document.querySelector('.close-button');
    const cancelButton = document.getElementById('modal-cancel');
    
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // モーダル外をクリックしたら閉じる
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * モーダルダイアログを表示
 * @param {string} title - モーダルのタイトル
 * @param {string} message - モーダルのメッセージ
 * @param {Function} confirmCallback - 確認ボタンを押したときのコールバック
 */
function showModal(title, message, confirmCallback) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const confirmButton = document.getElementById('modal-confirm');
    
    if (!modal || !modalTitle || !modalBody || !confirmButton) return;
    
    modalTitle.textContent = title;
    modalBody.textContent = message;
    
    // 確認ボタンのイベントリスナーをリセット
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    
    // 新しいイベントリスナーを設定
    newConfirmButton.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        modal.style.display = 'none';
    });
    
    // モーダルを表示
    modal.style.display = 'block';
}

/**
 * 通知の初期化
 */
function initializeNotification() {
    const notification = document.getElementById('notification');
    const closeButton = document.querySelector('.notification-close');
    
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            notification.classList.remove('show');
        });
    }
}

/**
 * 通知を表示
 * @param {string} message - 通知メッセージ
 * @param {string} type - 通知タイプ ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (!notification || !notificationMessage) return;
    
    // 通知タイプのクラスをリセット
    notification.classList.remove('success', 'error', 'info');
    notification.classList.add(type);
    
    // メッセージを設定
    notificationMessage.textContent = message;
    
    // 通知を表示
    notification.classList.add('show');
    
    // 5秒後に自動的に閉じる
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

/**
 * 計算履歴に追加
 * @param {string} expression - 計算式
 * @param {string} result - 計算結果
 */
function addToHistory(expression, result) {
    // 履歴に追加
    app.history.unshift({
        expression: expression,
        result: result,
        timestamp: new Date().toISOString()
    });
    
    // 履歴が100件を超えたら古いものを削除
    if (app.history.length > 100) {
        app.history.pop();
    }
    
    // ローカルストレージに保存
    localStorage.setItem('calculatorHistory', JSON.stringify(app.history));
}
