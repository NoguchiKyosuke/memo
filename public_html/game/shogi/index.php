<?php // Shogi Game Entry ?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebShogi - ブラウザ将棋</title>
    <link rel="stylesheet" href="style.css?v=33">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&family=Outfit:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
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
                <div class="network-controls">
                    <button class="btn" onclick="game.hostGame()">部屋を作る (Host)</button>
                    <div class="divider">OR</div>
                    <input type="text" id="room-code-input" placeholder="ルームID">
                    <button class="btn" onclick="game.joinGame()">参加する (Join)</button>
                </div>
                <button class="btn danger sm" onclick="game.showMainMenu()">戻る</button>
            </div>

            <div id="game-info" style="display: none;">
                <div id="turn-indicator">先手 (あなた) の番です</div>
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

    <script src="js/shogi.js?v=34"></script>
    <script src="js/view.js?v=34"></script>
    <script src="js/cpu.js?v=34"></script>
    <script src="js/network.js?v=34"></script>
    <script src="js/main.js?v=34"></script>
</body>
</html>
