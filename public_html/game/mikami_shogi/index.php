<?php
// Shogi Game Entry
// Enforce Login
require_once __DIR__ . '/../auth/check_login.php'; // Redirects if not logged in
// DB Setup (Auto-run)
require_once 'setup_ranking.php';
require_once 'setup_queue.php';

// Get User Info for JS
$userId = $_SESSION['user_id'] ?? null;
$userName = $_SESSION['user_name'] ?? 'Unknown'; // Default name?
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebShogi - ブラウザ将棋</title>
    <link rel="stylesheet" href="style.css?v=2">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&family=Outfit:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
    <script>
        const CURRENT_USER = {
            id: <?php echo json_encode($userId); ?>,
            name: <?php echo json_encode($userName); ?>
        };
    </script>
</head>
<body>

    <div id="game-container">
        <!-- Sidebar / Controls -->
        <div id="sidebar">
            <h1>WebShogi</h1>
            
            <div id="menu">
                <div class="menu-section">
                    <h3>モード選択</h3>
                    <button class="btn primary" onclick="game.showCpuMenu()">👤 vs 🤖 CPU対戦</button>
                    <button class="btn secondary" onclick="game.showNetworkMenu()">🌐 ネット対戦</button>
                </div>
            </div>

            <div id="cpu-menu" style="display: none;">
                <h3>CPU難易度</h3>
                <button class="btn weak" onclick="game.startCPU('weak')">🐣 初級 (Weak)</button>
                <button class="btn normal" onclick="game.startCPU('normal')">🐥 中級 (Normal)</button>
                <button class="btn strong" onclick="game.startCPU('strong')">🦅 上級 (Strong)</button>
                <button class="btn god" onclick="game.startCPU('god')">👑 超上級 (God) 👑</button>
                <button class="btn danger sm" onclick="game.showMainMenu()">戻る</button>
            </div>

            <div id="network-menu" style="display: none;">
                <h3>ネット対戦</h3>
                <div id="network-status">未接続</div>

                <!-- Setup Name -->
                <div id="network-setup">
                     <!-- Name handled by Auth -->
                </div>

                <div class="network-controls" style="background:#222; padding:10px; border-radius:5px; margin-bottom:15px;">
                    <h4 style="margin-top:0; color:#fff;">ルーム対戦 (ID指定)</h4>
                    <p style="font-size:0.8rem; color:#aaa; margin-bottom:5px;">友達と遊ぶ場合はこちら</p>
                    <button class="btn" onclick="game.hostGame()">部屋を作る (Host)</button>
                    <div class="divider">OR</div>
                    <input type="text" id="room-code-input" placeholder="ルームID (参加時のみ)">
                    <button class="btn" onclick="game.joinGame()">参加する (Join)</button>
                </div>
                
                <div class="network-controls" style="background:#422; padding:10px; border-radius:5px;">
                    <h4 style="margin-top:0; color:#ffd700;">ランクマッチ (自動)</h4>
                    <p style="font-size:0.8rem; color:#dac; margin-bottom:5px;">ランダムな相手と対戦します<br>(ID入力不要・自動マッチング)</p>
                     <button class="btn strong" onclick="game.startRankMatch()">⚔️ ランクマッチ開始</button>
                     <button class="btn" style="margin-top:5px; font-size: 0.9rem;" onclick="game.showRanking()">🏆 ランキングを見る</button>
                </div>

                <button class="btn danger sm" onclick="game.showMainMenu()">戻る</button>
            </div>

    <!-- Ranking Modal -->
    <div id="ranking-modal" class="modal">
        <div class="modal-content" style="background:var(--bg-color); color:white; padding:20px; border-radius:10px; min-width:300px;">
            <h3 style="text-align:center; color:#FFD700; margin-bottom:15px;">🏆 ランキング TOP 10</h3>
            <div id="ranking-list" style="margin-bottom:20px;">
                <!-- List -->
            </div>
            <button class="btn secondary" onclick="document.getElementById('ranking-modal').classList.remove('active')">閉じる</button>
        </div>
    </div>

            <div id="game-info" style="display: none;">
                <div id="turn-indicator">先手 (あなた) の番です</div>
                <div id="game-timer" style="font-size: 1.5rem; color: #ffeb3b; font-weight: bold; margin: 10px 0;">残り: 10秒</div>
                <div id="room-info" style="display: none;">ルームID: <span id="current-room-id"></span></div>
                <button class="btn danger sm" onclick="game.surrender()">🏳️ 降参する</button>
            </div>

            <div id="chat-container">
                <div id="chat-messages"></div>
                <input type="text" id="chat-input" placeholder="チャット..." disabled>
            </div>
        </div>

        <!-- Main Board Area -->
        <div id="board-area">
            <!-- Gote (Opponent) Komadai -->
            <div class="komadai-container" id="komadai-gote">
                <div class="komadai-label">後手 (相手)</div>
                <div class="komadai-slots"></div>
            </div>

            <!-- The Shogi Board -->
            <div id="shogi-board"></div>

            <!-- Sente (Player) Komadai -->
            <div class="komadai-container" id="komadai-sente">
                <div class="komadai-label">先手 (あなた)</div>
                <div class="komadai-slots"></div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div id="promotion-modal" class="modal">
        <div class="modal-content">
            <h3>成りますか？</h3>
            <div class="modal-buttons">
                <button class="btn primary" onclick="game.confirmPromotion(true)">成る</button>
                <button class="btn secondary" onclick="game.confirmPromotion(false)">成らない</button>
            </div>
        </div>
    </div>

    <!-- Result Overlay -->
    <div id="result-overlay">
        <div id="result-title">VICTORY</div>
        <div id="result-message">あなたの勝利です！</div>
        <button class="result-action-btn" onclick="game.closeResult()">タイトルへ戻る</button>
    </div>

    <script src="js/shogi.js?v=2"></script>
    <script src="js/view.js?v=2"></script>
    <script src="js/cpu.js?v=2"></script>
    <script src="js/network.js?v=2"></script>
    <script src="js/main.js?v=2"></script>
</body>
</html>
