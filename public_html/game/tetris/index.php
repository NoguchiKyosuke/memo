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
            }

            #game-board {
                grid-template-columns: repeat(10, 25px);
                grid-template-rows: repeat(20, 25px);
            }

            .cell {
                width: 25px;
                height: 25px;
            }

            .mobile-controls {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(2, 1fr);
            }

            .controls {
                display: none;
            }
        }
    </style>
</head>

<body>
    <div class="game-header">
        <h1>🧱 テトリス</h1>
        <p>矢印キーで操作 / スペースでハードドロップ</p>
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
        </div>
    </div>

    <div class="mobile-controls">
        <button class="mobile-btn" onclick="moveLeft()">←</button>
        <button class="mobile-btn" onclick="rotate()">↻</button>
        <button class="mobile-btn" onclick="moveRight()">→</button>
        <button class="mobile-btn" onclick="moveDown()">↓</button>
        <button class="mobile-btn" onclick="hardDrop()">⬇</button>
        <button class="mobile-btn" onclick="togglePause()">⏸</button>
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

        init();
        loadMoney();
    </script>
</body>

</html>