<?php
require_once 'functions.php';
requireLogin();
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Listening Game - My Dictionary</title>
    <link rel="stylesheet" href="style.css?v=<?php echo time(); ?>">
    <style>
        .game-container {
            text-align: center;
            padding: 40px 20px;
        }
        .game-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 0 auto;
        }
        .btn-large {
            font-size: 1.2rem;
            padding: 15px 30px;
            margin: 10px;
            cursor: pointer;
            border: none;
            border-radius: 8px;
            transition: transform 0.1s;
        }
        .btn-large:active {
            transform: scale(0.98);
        }
        .btn-play { background-color: #3498db; color: white; }
        .btn-show { background-color: #f39c12; color: white; }
        .btn-good { background-color: #2ecc71; color: white; }
        .btn-bad { background-color: #e74c3c; color: white; }
        
        #sentence-display {
            margin: 30px 0;
            font-size: 1.4rem;
            min-height: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .hidden-text {
            filter: blur(8px);
            user-select: none;
        }
        .revealed-text {
            filter: none;
        }
        .jp-text {
            font-size: 1.1rem;
            color: #7f8c8d;
            margin-top: 15px;
        }
        .controls {
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>My Dictionary</h1>
            <nav>
                <a href="dashboard.php">Dashboard</a>
                <a href="logout.php">Logout</a>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="game-container">
            <div class="game-card">
                <h2>Listening Practice</h2>
                <p>Listen to the sentence and guess the meaning.</p>
                
                <div id="sentence-display">
                    <div id="en-text" class="hidden-text">Loading...</div>
                    <div id="jp-text" class="jp-text" style="display: none;"></div>
                </div>

                <div class="controls">
                    <button id="btn-play" class="btn-large btn-play">▶ Play Audio</button>
                    <button id="btn-show" class="btn-large btn-show">Show Answer</button>
                    
                    <div id="feedback-controls" style="display: none;">
                        <button id="btn-good" class="btn-large btn-good">Understood</button>
                        <button id="btn-bad" class="btn-large btn-bad">Not Understood</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="game.js?v=<?php echo time(); ?>"></script>
</body>
</html>
