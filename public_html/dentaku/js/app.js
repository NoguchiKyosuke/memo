/**
 * 高度数学電卓 - メインアプリケーションファイル
 */

// アプリケーションの状態を管理するオブジェクト
const app = {
    currentTab: 'calculator',
    settings: {
        precision: 10,
        notation: 'auto',
        angleUnit: 'rad',
        theme: 'light',
        plotStyle: 'default',
        fontSize: 'medium',
        latexRenderer: 'mathjax',
        maxIterations: 1000,
        tolerance: '1e-10',
        complexMode: 'auto',
        exportFormat: 'csv',
        plotResolution: 300,
        plotSize: '8,6',
        cache: true,
        parallel: true,
        symbolic: true,
        customConstants: {}
    },
    history: []
};

// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadSettings();
});

/**
 * アプリケーションの初期化
 */
function initializeApp() {
    // デフォルトタブを表示
    showTab(app.currentTab);
    
    // mathjs設定の初期化
    math.config({
        number: 'number',
        precision: app.settings.precision
    });
    
    // テーマの設定
    applyTheme();
    
    console.log('アプリケーションが初期化されました');
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    // タブ切り替えボタン
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            showTab(tabId);
        });
    });
    
    // テーマ切り替えスイッチ
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', toggleTheme);
        // 現在のテーマに合わせてスイッチの状態を設定
        themeSwitch.checked = document.body.classList.contains('dark-theme');
    }
    
    // モーダルの閉じるボタン
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // 通知の閉じるボタン
    const notificationCloseButtons = document.querySelectorAll('.notification-close');
    notificationCloseButtons.forEach(button => {
        button.addEventListener('click', closeNotification);
    });
    
    // プライバシーポリシーリンク
    const privacyLink = document.getElementById('privacy-link');
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('プライバシーポリシー', '<p>このアプリケーションは、ユーザーの設定と計算履歴をブラウザのローカルストレージに保存します。これらのデータはあなたのデバイスから外部に送信されることはありません。</p><p>このアプリケーションは、Google Analyticsなどの分析ツールを使用していません。</p>');
        });
    }
    
    // 利用規約リンク
    const termsLink = document.getElementById('terms-link');
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('利用規約', '<p>このアプリケーションは、教育および研究目的で提供されています。計算結果の正確性は保証されません。重要な計算には、結果を別の方法で検証することをお勧めします。</p><p>このアプリケーションは、オープンソースソフトウェアとして提供されています。</p>');
        });
    }
}

/**
 * タブの表示切り替え
 * @param {string} tabId - 表示するタブのID
 */
function showTab(tabId) {
    // すべてのタブコンテンツを非表示
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // すべてのタブボタンから active クラスを削除
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // 選択されたタブを表示
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // 選択されたタブボタンに active クラスを追加
    const selectedButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // 現在のタブを状態に保存
    app.currentTab = tabId;
    
    // タブ固有の初期化処理を呼び出す
    initializeTabContent(tabId);
}

/**
 * タブ固有のコンテンツを初期化
 * @param {string} tabId - 初期化するタブのID
 */
function initializeTabContent(tabId) {
    switch (tabId) {
        case 'calculator':
            initializeCalculator();
            break;
        case 'vector':
            initializeVectorCalculations();
            break;
        case 'matrix':
            initializeMatrixCalculations();
            break;
        case 'complex':
            initializeComplexCalculations();
            break;
        case 'field':
            initializeFieldCalculations();
            break;
        case 'diff-eq':
            initializeDifferentialEquations();
            break;
        case 'integration':
            initializeNumericalIntegration();
            break;
        case 'statistics':
            initializeStatistics();
            break;
        case 'fourier':
            initializeFourierTransform();
            break;
        case 'tensor':
            initializeTensorCalculations();
            break;
        case 'optimization':
            initializeOptimization();
            break;
        case 'plot':
            initializePlotting();
            break;
        case 'history':
            loadHistory();
            break;
    }
}

/**
 * テーマの切り替え
 */
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    app.settings.theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    saveSettings();
}

/**
 * テーマを適用
 */
function applyTheme() {
    document.body.classList.toggle('dark-theme', app.settings.theme === 'dark');
}

/**
 * 設定の読み込み
 */
function loadSettings() {
    const savedSettings = localStorage.getItem('advancedMathCalcSettings');
    if (savedSettings) {
        try {
            const parsedSettings = JSON.parse(savedSettings);
            app.settings = { ...app.settings, ...parsedSettings };
            applyTheme();
            console.log('設定が読み込まれました');
        } catch (error) {
            console.error('設定の読み込みに失敗しました:', error);
        }
    }
}

/**
 * 設定の保存
 */
function saveSettings() {
    localStorage.setItem('advancedMathCalcSettings', JSON.stringify(app.settings));
    console.log('設定が保存されました');
}

/**
 * モーダルダイアログを表示
 * @param {string} title - モーダルのタイトル
 * @param {string} content - モーダルの内容（HTML可）
 * @param {Function} onConfirm - 確認ボタンを押したときのコールバック
 */
function showModal(title, content, onConfirm = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    
    // 確認ボタンのイベントリスナーをリセット
    modalConfirm.replaceWith(modalConfirm.cloneNode(true));
    const newModalConfirm = document.getElementById('modal-confirm');
    
    if (onConfirm) {
        newModalConfirm.addEventListener('click', () => {
            onConfirm();
            closeModal();
        });
        newModalConfirm.style.display = 'block';
        modalCancel.style.display = 'block';
    } else {
        newModalConfirm.style.display = 'none';
        modalCancel.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

/**
 * モーダルダイアログを閉じる
 */
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

/**
 * 通知を表示
 * @param {string} message - 通知メッセージ
 * @param {string} type - 通知タイプ（'success', 'error', 'info'）
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    notificationMessage.textContent = message;
    notification.className = 'notification'; // クラスをリセット
    notification.classList.add(`notification-${type}`);
    
    notification.style.display = 'block';
    
    // 一定時間後に通知を閉じる
    if (duration > 0) {
        setTimeout(() => {
            closeNotification();
        }, duration);
    }
}

/**
 * 通知を閉じる
 */
function closeNotification() {
    const notification = document.getElementById('notification');
    notification.style.display = 'none';
}

// 他のJSファイルからアクセスできるようにグローバルに公開
window.app = app;
window.showTab = showTab;
window.showModal = showModal;
window.showNotification = showNotification;
window.closeModal = closeModal;
window.closeNotification = closeNotification;
