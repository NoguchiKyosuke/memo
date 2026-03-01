<?php require_once '../auth/check_login.php'; ?>
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>テトリス - ゲームポータル</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #fff;
            padding: 20px;
        }

        .game-header {
            text-align: center;
            margin-bottom: 20px;
        }

        .game-header h1 {
            font-size: 2.5rem;
            background: linear-gradient(90deg, #00d4ff, #7b2ff7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }

        .game-header p {
            color: #888;
            font-size: 0.9rem;
        }

        .game-container {
            display: flex;
            gap: 20px;
            align-items: flex-start;
        }

        .game-board-wrapper {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        #game-board {
            display: grid;
            grid-template-columns: repeat(10, 30px);
            grid-template-rows: repeat(20, 30px);
            gap: 1px;
            background: #111;
            border: 2px solid #333;
            border-radius: 4px;
        }

        .cell {
            width: 30px;
            height: 30px;
            background: #1a1a2e;
            border-radius: 2px;
        }

        .cell.filled {
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .info-panel {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .info-box {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 15px;
            min-width: 150px;
        }

        .info-box h3 {
            font-size: 0.8rem;
            color: #888;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .info-box .value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #00d4ff;
        }

        #next-piece {
            display: grid;
            grid-template-columns: repeat(4, 25px);
            grid-template-rows: repeat(4, 25px);
            gap: 1px;
            background: #111;
            border-radius: 4px;
            padding: 5px;
        }

        #next-piece .cell {
            width: 25px;
            height: 25px;
        }

        .controls {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 15px;
            font-size: 0.75rem;
            color: #888;
        }

        .controls h3 {
            margin-bottom: 10px;
            color: #fff;
        }

        .controls p {
            margin: 4px 0;
        }

        .controls kbd {
            background: #333;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }

        .btn {
            background: linear-gradient(90deg, #00d4ff, #7b2ff7);
            border: none;
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            width: 100%;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
        }

        .back-link {
            margin-top: 20px;
            color: #888;
            text-decoration: none;
            transition: color 0.2s;
        }

        .back-link:hover {
            color: #00d4ff;
        }

        .game-over {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            display: none;
        }

        .game-over.show {
            display: block;
        }

        .game-over h2 {
            color: #ff4757;
            margin-bottom: 15px;
        }

        /* Mobile controls */
        .mobile-controls {
            display: none;
            margin-top: 20px;
            gap: 10px;
        }

        .mobile-btn {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            font-size: 1.5rem;
            cursor: pointer;
            touch-action: manipulation;
        }

        .mobile-btn:active {
            background: rgba(0, 212, 255, 0.3);
        }

        @media (max-width: 600px) {
            .game-container {
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }

            .game-board-wrapper {
                padding: 10px;
            }

            #game-board {
                grid-template-columns: repeat(10, 25px);
                grid-template-rows: repeat(20, 25px);
            }

            .cell {
                width: 25px;
                height: 25px;
            }
            
            .info-panel {
                width: 100%;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
            }
            
            .info-box {
                min-width: auto;
                padding: 5px 10px;
                flex: 1;
            }
            
            .controls {
                display: none;
            }

            .mobile-controls {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                width: 100%;
                max-width: 320px;
                margin-top: 15px;
            }
            
            /* Specific button positioning */
            .mobile-btn {
                width: auto;
                height: 55px;
                font-size: 1.5rem;
            }
            
            /* Layout:
              Turn |  Up(Rotate)  | Turn | Pause
              Left |  Down        | Right| Drop
            */
            
            .btn-rotate { grid-column: 2; grid-row: 1; }
            .btn-left { grid-column: 1; grid-row: 2; }
            .btn-down { grid-column: 2; grid-row: 2; }
            .btn-right { grid-column: 3; grid-row: 2; }
            .btn-drop { grid-column: 4; grid-row: 2; background: rgba(255, 71, 87, 0.3) !important; border-color: #ff4757 !important; }
            .btn-pause { grid-column: 4; grid-row: 1; font-size: 1rem; }
            
            .opponent-section {
                 order: 3; /* Put opponent below main game if needed, or side by side if space permits */
                 margin-top: 10px;
            }
            
            .game-header h1 {
                font-size: 1.8rem;
            }
        }
        
        /* Multiplayer Styles */
        .opponent-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            opacity: 0.8;
            transform: scale(0.9);
        }
        
        .opponent-board-wrapper {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 10px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        #opponent-board {
            display: grid;
            grid-template-columns: repeat(10, 20px);
            grid-template-rows: repeat(20, 20px);
            gap: 1px;
            background: #111;
            border: 2px solid #555;
            border-radius: 4px;
        }

        #opponent-board .cell {
            width: 20px;
            height: 20px;
        }
        
        .status-message {
            margin-bottom: 10px;
            font-weight: bold;
            color: #ffd700;
            min-height: 1.5em;
        }
        
        .mode-select {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
        }
        
        .mode-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            color: #fff;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .mode-btn.active {
            background: #00d4ff;
            color: #000;
            border-color: #00d4ff;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="game-header">
        <h1>🧱 テトリス</h1>
        <p>矢印キーで操作 / スペースでハードドロップ</p>
        <div class="mode-select">
            <button class="mode-btn active" id="mode-single" onclick="switchMode('single')">シングルプレイ</button>
            <button class="mode-btn" id="mode-multi" onclick="switchMode('multi')">オンライン対戦</button>
        </div>
        <div id="connection-status" class="status-message" style="display: none;">接続待機中...</div>
    </div>

    <div class="game-container">
        <div class="game-board-wrapper" style="position: relative;">
            <div id="game-board"></div>
            <div class="game-over" id="game-over">
                <h2>ゲームオーバー</h2>
                <p>スコア: <span id="final-score">0</span></p>
                <button class="btn" onclick="resetGame()">もう一度</button>
            </div>
        </div>

        <div class="info-panel">
            <div class="info-box">
                <h3>スコア</h3>
                <div class="value" id="score">0</div>
            </div>
            <div class="info-box">
                <h3>レベル</h3>
                <div class="value" id="level">1</div>
            </div>
            <div class="info-box">
                <h3>ライン</h3>
                <div class="value" id="lines">0</div>
            </div>
            <div class="info-box">
                <h3>次のピース</h3>
                <div id="next-piece"></div>
            </div>
            <div class="info-box">
                <h3>所持金</h3>
                <div class="value">💰 <span id="current-money">0</span></div>
            </div>
            <div class="controls">
                <h3>操作方法</h3>
                <p><kbd>←</kbd> <kbd>→</kbd> 移動</p>
                <p><kbd>↓</kbd> 落下</p>
                <p><kbd>↑</kbd> 回転</p>
                <p><kbd>Space</kbd> ハードドロップ</p>
                <p><kbd>P</kbd> ポーズ</p>
            </div>
            <button class="btn" id="start-btn" onclick="startGame()">ゲーム開始</button>
            <button class="btn" id="find-match-btn" onclick="findMatch()" style="display: none; background: linear-gradient(90deg, #ff416c, #ff4b2b);">対戦相手を探す</button>
        </div>

        <div class="opponent-section" id="opponent-section" style="display: none;">
            <div class="game-header" style="margin-bottom: 10px;">
                <p>対戦相手</p>
            </div>
            <div class="opponent-board-wrapper">
                <div id="opponent-board"></div>
            </div>
        </div>
    </div>

    <div class="mobile-controls">
        <button class="mobile-btn btn-left" onclick="moveLeft()">←</button>
        <button class="mobile-btn btn-rotate" onclick="rotate()">↻</button>
        <button class="mobile-btn btn-right" onclick="moveRight()">→</button>
        <button class="mobile-btn btn-down" onclick="moveDown()">↓</button>
        <button class="mobile-btn btn-drop" onclick="hardDrop()">⏬</button>
        <button class="mobile-btn btn-pause" onclick="togglePause()">II</button>
    </div>

    <a href="/game/" class="back-link">← ゲームポータルに戻る</a>

    <script src="/game/common_game_save.js?v=2"></script>
    <script>
        // Start of game script
        const ROWS = 20;
        const COLS = 10;
        console.log('Tetris Script Loaded. ROWS:', ROWS);

        // ... (Game Logic)

        let isGameLoaded = false;

        async function initGameSaver() {
            await GameSaver.init('tetris');
            const data = await GameSaver.load();
            if (data && data.money !== undefined) { // Check for undefined to allow 0
                // Update local storage to match cloud
                localStorage.setItem('webcraft_money', data.money);
                document.getElementById('current-money').textContent = data.money.toLocaleString();
            }
            isGameLoaded = true;
            console.log('Tetris Cloud Data Loaded');
        }

        initGameSaver();

        function addMoney(amount) {
            console.log(`[Tetris] addMoney called with ${amount}. isGameLoaded: ${isGameLoaded}`);
            if (!isGameLoaded) {
                 console.warn('[Tetris] addMoney aborted: Game not loaded.');
                 return; 
            }

            let money = loadMoney();
            money += amount;
            localStorage.setItem('webcraft_money', money);
            document.getElementById('current-money').textContent = money.toLocaleString();

            console.log(`[Tetris] Money updated to: ${money}`);

            // Auto Save to Cloud
            GameSaver.save({ money: money, high_score: score })
                .then(() => console.log('[Tetris] Database update successful.'));
        }
        const COLORS = [
            '#00d4ff', // I - Cyan
            '#ffd700', // O - Yellow
            '#9b59b6', // T - Purple
            '#2ecc71', // S - Green
            '#e74c3c', // Z - Red
            '#3498db', // J - Blue
            '#e67e22'  // L - Orange
        ];

        const SHAPES = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[0, 1, 0], [1, 1, 1]], // T
            [[0, 1, 1], [1, 1, 0]], // S
            [[1, 1, 0], [0, 1, 1]], // Z
            [[1, 0, 0], [1, 1, 1]], // J
            [[0, 0, 1], [1, 1, 1]]  // L
        ];

        let board = [];
        let currentPiece = null;
        let nextPiece = null;
        let score = 0;
        let lines = 0;
        let level = 1;
        let gameLoop = null;
        let isPaused = false;
        let isGameOver = false;

        // Multiplayer variables
        let ws = null;
        let isMultiplayer = false;
        let isOpponentConnected = false;
        let opponentBoardDiv = null;


        function init() {
            const gameBoard = document.getElementById('game-board');
            gameBoard.innerHTML = '';
            board = [];

            for (let r = 0; r < ROWS; r++) {
                board[r] = [];
                for (let c = 0; c < COLS; c++) {
                    board[r][c] = 0;
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.id = `cell-${r}-${c}`;
                    gameBoard.appendChild(cell);
                }
            }
            
            // Init opponent board if needed
            const oppBoard = document.getElementById('opponent-board');
            if (oppBoard.children.length === 0) {
                 for (let r = 0; r < ROWS; r++) {
                    for (let c = 0; c < COLS; c++) {
                        const cell = document.createElement('div');
                        cell.className = 'cell';
                        cell.id = `opp-cell-${r}-${c}`;
                        oppBoard.appendChild(cell);
                    }
                }
            }

            initNextPieceDisplay();
        }

        function initNextPieceDisplay() {
            const nextPieceDiv = document.getElementById('next-piece');
            nextPieceDiv.innerHTML = '';
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.id = `next-${r}-${c}`;
                    nextPieceDiv.appendChild(cell);
                }
            }
        }

        function createPiece() {
            const type = Math.floor(Math.random() * SHAPES.length);
            return {
                shape: SHAPES[type].map(row => [...row]),
                color: COLORS[type],
                row: 0,
                col: Math.floor((COLS - SHAPES[type][0].length) / 2)
            };
        }

        function drawBoard() {
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const cell = document.getElementById(`cell-${r}-${c}`);
                    if (board[r][c]) {
                        cell.style.background = board[r][c];
                        cell.classList.add('filled');
                    } else {
                        cell.style.background = '#1a1a2e';
                        cell.classList.remove('filled');
                    }
                }
            }
        }

        function drawPiece() {
            if (!currentPiece) return;
            const { shape, color, row, col } = currentPiece;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c] && row + r >= 0) {
                        const cell = document.getElementById(`cell-${row + r}-${col + c}`);
                        if (cell) {
                            cell.style.background = color;
                            cell.classList.add('filled');
                        }
                    }
                }
            }
        }

        function drawNextPiece() {
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    const cell = document.getElementById(`next-${r}-${c}`);
                    cell.style.background = '#1a1a2e';
                    cell.classList.remove('filled');
                }
            }

            if (!nextPiece) return;
            const { shape, color } = nextPiece;
            const offsetR = Math.floor((4 - shape.length) / 2);
            const offsetC = Math.floor((4 - shape[0].length) / 2);

            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        const cell = document.getElementById(`next-${offsetR + r}-${offsetC + c}`);
                        if (cell) {
                            cell.style.background = color;
                            cell.classList.add('filled');
                        }
                    }
                }
            }
        }

        function isValidMove(piece, newRow, newCol, newShape = null) {
            const shape = newShape || piece.shape;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        const boardRow = newRow + r;
                        const boardCol = newCol + c;
                        if (boardCol < 0 || boardCol >= COLS || boardRow >= ROWS) {
                            return false;
                        }
                        if (boardRow >= 0 && board[boardRow][boardCol]) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        function lockPiece() {
            const { shape, color, row, col } = currentPiece;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        if (row + r < 0) {
                            gameOver();
                            return;
                        }
                        board[row + r][col + c] = color;
                    }
                }
            }
            clearLines();
            spawnPiece();
            
            if (isMultiplayer && isOpponentConnected) {
                sendBoardUpdate();
            }
        }

        function clearLines() {
            let linesCleared = 0;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (board[r].every(cell => cell !== 0)) {
                    board.splice(r, 1);
                    board.unshift(Array(COLS).fill(0));
                    linesCleared++;
                    r++;
                }
            }

            if (linesCleared > 0) {
                const points = [0, 100, 300, 500, 800];
                const earned = points[linesCleared] * level;
                score += earned;
                console.log(`Lines Cleared: ${linesCleared}, Earned: ${earned}, Saving to DB...`);
                addMoney(earned);
                lines += linesCleared;
                level = Math.floor(lines / 10) + 1;
                updateDisplay();
                
                // Attack opponent in multiplayer
                if (isMultiplayer && isOpponentConnected && linesCleared > 1) {
                    // 2 lines -> 1 garbage, 3 -> 2, 4 -> 4 (bonus)
                    let garbage = linesCleared - 1;
                    if (linesCleared === 4) garbage = 4;
                    sendAttack(garbage);
                }
            }
        }

        function updateDisplay() {
            document.getElementById('score').textContent = score;
            document.getElementById('level').textContent = level;
            document.getElementById('lines').textContent = lines;
        }

        function spawnPiece() {
            currentPiece = nextPiece || createPiece();
            nextPiece = createPiece();
            drawNextPiece();

            if (!isValidMove(currentPiece, currentPiece.row, currentPiece.col)) {
                gameOver();
            }
        }

        function moveDown() {
            if (isPaused || isGameOver) return;
            if (isValidMove(currentPiece, currentPiece.row + 1, currentPiece.col)) {
                currentPiece.row++;
            } else {
                lockPiece();
            }
            render();
        }

        function moveLeft() {
            if (isPaused || isGameOver) return;
            if (isValidMove(currentPiece, currentPiece.row, currentPiece.col - 1)) {
                currentPiece.col--;
                render();
            }
        }

        function moveRight() {
            if (isPaused || isGameOver) return;
            if (isValidMove(currentPiece, currentPiece.row, currentPiece.col + 1)) {
                currentPiece.col++;
                render();
            }
        }

        function rotate() {
            if (isPaused || isGameOver) return;
            const shape = currentPiece.shape;
            const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
            if (isValidMove(currentPiece, currentPiece.row, currentPiece.col, rotated)) {
                currentPiece.shape = rotated;
                render();
            }
        }

        function hardDrop() {
            if (isPaused || isGameOver) return;
            let earned = 0;
            while (isValidMove(currentPiece, currentPiece.row + 1, currentPiece.col)) {
                currentPiece.row++;
                score += 2;
                earned += 2;
            }
            if (earned > 0) addMoney(earned);
            lockPiece();
            render();
            updateDisplay();
        }

        function togglePause() {
            if (isGameOver) return;
            isPaused = !isPaused;
            if (isPaused) {
                clearInterval(gameLoop);
            } else {
                startLoop();
            }
        }

        function render() {
            drawBoard();
            drawPiece();
        }

        function gameOver() {
            isGameOver = true;
            clearInterval(gameLoop);
            document.getElementById('final-score').textContent = score;
            document.getElementById('game-over').classList.add('show');
            
            if (isMultiplayer && isOpponentConnected) {
                ws.send(JSON.stringify({ type: 'game_over' }));
                document.getElementById('connection-status').textContent = "敗北...";
                document.getElementById('connection-status').style.color = "#ff4757";
            }
        }

        function loadMoney() {
            const saved = localStorage.getItem('webcraft_money');
            const money = saved ? parseInt(saved) : 0;
            document.getElementById('current-money').textContent = money.toLocaleString();
            return money;
        }



        function startLoop() {
            const speed = Math.max(100, 1000 - (level - 1) * 100);
            gameLoop = setInterval(() => {
                if (!isPaused && !isGameOver) {
                    moveDown();
                }
            }, speed);
        }

        function startGame() {
            document.getElementById('start-btn').textContent = 'リスタート';
            resetGame();
        }

        function resetGame() {
            clearInterval(gameLoop);
            isGameOver = false;
            isPaused = false;
            score = 0;
            lines = 0;
            level = 1;
            document.getElementById('game-over').classList.remove('show');
            init();
            updateDisplay();
            spawnPiece();
            render();
            startLoop();
        }

        document.addEventListener('keydown', (e) => {
            if (isGameOver && e.code !== 'Enter') return;

            switch (e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    moveLeft();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moveRight();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moveDown();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    rotate();
                    break;
                case 'Space':
                    e.preventDefault();
                    hardDrop();
                    break;
                case 'KeyP':
                    togglePause();
                    break;
                case 'Enter':
                    if (isGameOver) resetGame();
                    break;
            }
        });

        
        
        // --- Multiplayer Logic ---
        
        function switchMode(mode) {
            isMultiplayer = (mode === 'multi');
            document.getElementById('mode-single').classList.toggle('active', !isMultiplayer);
            document.getElementById('mode-multi').classList.toggle('active', isMultiplayer);
            
            document.getElementById('start-btn').style.display = isMultiplayer ? 'none' : 'block';
            document.getElementById('find-match-btn').style.display = isMultiplayer ? 'block' : 'none';
            document.getElementById('opponent-section').style.display = isMultiplayer ? 'flex' : 'none';
            document.getElementById('connection-status').style.display = isMultiplayer ? 'block' : 'none';
            
            resetGame();
            if (isMultiplayer) {
                document.getElementById('connection-status').textContent = "「対戦相手を探す」を押してください";
                document.getElementById('connection-status').style.color = "#ffd700";
            }
        }

        // Network / Polling Variables
        let clientId = localStorage.getItem('tetris_client_id') || 'player_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('tetris_client_id', clientId);
        
        let gameId = null;
        let opponentId = null;
        let myRole = null; // 'p1' or 'p2'
        
        let pollInterval = null;
        let lastSyncTime = 0;
        let isWaiting = false;

        async function findMatch() {
            // Reset state
            gameId = null;
            opponentId = null;
            isOpponentConnected = false;
            
            const statusEl = document.getElementById('connection-status');
            const btn = document.getElementById('find-match-btn');
            
            statusEl.textContent = "対戦相手を探しています...";
            statusEl.style.display = 'block';
            statusEl.style.color = '#ffd700';
            btn.disabled = true;
            isWaiting = true;
            
            try {
                // Initial request to join queue
                const res = await fetch(`api/tetris.php?action=find_match&client_id=${clientId}`);
                const data = await res.json();
                
                if (data.status === 'matched') {
                    handleMatchFound(data);
                } else if (data.status === 'waiting') {
                    // Start polling for status
                    statusEl.textContent = "マッチング中... (待機中)";
                    pollForMatch();
                } else {
                    throw new Error(data.message || "Unknown error");
                }
            } catch (e) {
                console.error("Matchmaking error:", e);
                statusEl.textContent = "接続エラー: " + e.message;
                statusEl.style.color = "#ff4757";
                btn.disabled = false;
                isWaiting = false;
            }
        }
        
        function pollForMatch() {
            if (!isWaiting) return;
            
            pollInterval = setInterval(async () => {
                try {
                    const res = await fetch(`api/tetris.php?action=check_status&client_id=${clientId}`);
                    const data = await res.json();
                    
                    if (data.status === 'matched') {
                        clearInterval(pollInterval);
                        handleMatchFound(data);
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                }
            }, 1000); // Poll every 1s
        }
        
        function handleMatchFound(data) {
            isWaiting = false;
            gameId = data.game_id;
            opponentId = data.opponent_id;
            myRole = data.role;
            isOpponentConnected = true;
            
            const statusEl = document.getElementById('connection-status');
            statusEl.textContent = "対戦開始！";
            statusEl.style.color = "#00d4ff";
            
            // Start Game Loop Polling
            startGame();
            startSyncLoop();
        }
        
        function startSyncLoop() {
            if (pollInterval) clearInterval(pollInterval);
            
            pollInterval = setInterval(async () => {
                if (!isMultiplayer || !isOpponentConnected || !gameId) {
                    clearInterval(pollInterval);
                    return;
                }
                
                await syncGameState();
            }, 500); // Sync every 500ms
        }
        
        async function syncGameState() {
            try {
                // Prepare outgoing data
                // We only send updates if something changed? Or always heartbeat?
                // Simplest: Always send current board/score.
                // Attacks are tricky - we need to make sure we don't send the same attack twice.
                // We'll use a queue for outgoing attacks.
                
                const payload = {
                    board: board,
                    score: score,
                    attacks_out: outgoingAttacks.length > 0 ? outgoingAttacks.shift() : null,
                    game_over: isGameOver
                };
                
                const res = await fetch(`api/tetris.php?action=sync&game_id=${gameId}&client_id=${clientId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                
                if (data.status === 'active' || data.status === 'finished') {
                    // Update Opponent View
                    if (data.opponent_state && data.opponent_state.board) {
                        drawOpponentBoard(data.opponent_state.board);
                    }
                    
                    // Handle received attacks
                    if (data.attacks_received && data.attacks_received.length > 0) {
                        data.attacks_received.forEach(lines => {
                            receiveAttack(lines);
                        });
                    }
                    
                    // Handle Game Over
                    if (data.game_status === 'finished') {
                        if (data.winner && data.winner !== clientId) {
                            // I lost (or opponent won)
                            if (!isGameOver) {
                                gameOver();
                                document.getElementById('connection-status').textContent = "敗北...";
                                document.getElementById('connection-status').style.color = "#ff4757";
                            }
                        } else if (data.winner === clientId) {
                             // I won
                             if (isGameOver) { // Wait until I see I'm waiting? No, if game is finished and I'm winner
                                 document.getElementById('connection-status').textContent = "勝利！";
                                 document.getElementById('game-over').querySelector('h2').textContent = "勝利！";
                                 document.getElementById('game-over').classList.add('show');
                             } else {
                                 // Opponent died first
                                 gameOver(); 
                                 document.getElementById('connection-status').textContent = "勝利！";
                                 document.getElementById('game-over').querySelector('h2').textContent = "勝利！";
                                 document.getElementById('game-over').classList.add('show');
                             }
                        }
                    }
                }
                
            } catch (e) {
                console.error("Sync error:", e);
            }
        }
        
        // Outgoing attack queue
        let outgoingAttacks = [];

        function sendBoardUpdate() {
            // No-op, handled by sync loop
        }

        function sendAttack(lines) {
             outgoingAttacks.push(lines);
             
             // Visual feedback
             const msg = document.createElement('div');
             msg.textContent = `${lines}ライン攻撃！`;
             msg.style.position = 'absolute';
             msg.style.top = '50%';
             msg.style.left = '50%';
             msg.style.color = 'red';
             msg.style.fontWeight = 'bold';
             msg.style.fontSize = '2rem';
             msg.style.transform = 'translate(-50%, -50%)';
             msg.style.pointerEvents = 'none';
             document.body.appendChild(msg);
             setTimeout(() => msg.remove(), 1000);
        }

        function receiveAttack(numLines) {
            console.log(`Received attack: ${numLines} lines`);
            // Add garbage lines at bottom
            for (let i = 0; i < numLines; i++) {
                // Remove top line (check for game over if it was filled)
                if (board[0].some(c => c !== 0)) {
                    gameOver();
                    return;
                }
                board.shift();
                
                // Add garbage line with one random hole
                const arr = Array(COLS).fill('#555'); // Grey garbage
                const hole = Math.floor(Math.random() * COLS);
                arr[hole] = 0;
                board.push(arr);
            }
            render();
            
             const msg = document.createElement('div');
             msg.textContent = `邪魔ブロック接近！`;
             msg.style.position = 'absolute';
             msg.style.top = '40%';
             msg.style.left = '50%';
             msg.style.color = 'yellow';
             msg.style.transform = 'translate(-50%, -50%)'; 
             document.body.appendChild(msg);
             setTimeout(() => msg.remove(), 1000);
        }

        function drawOpponentBoard(oppBoardData) {
            if (!oppBoardData || !Array.isArray(oppBoardData)) return;
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const cell = document.getElementById(`opp-cell-${r}-${c}`);
                    if (!cell) continue;
                    
                    if (oppBoardData[r] && oppBoardData[r][c]) {
                         const val = oppBoardData[r][c];
                         cell.style.background = val === 1 ? '#fff' : val; 
                         cell.classList.add('filled');
                    } else {
                        cell.style.background = '#111';
                         cell.classList.remove('filled');
                    }
                }
            }
        }

        init();
        loadMoney();
    </script>
</body>

</html>