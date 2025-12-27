<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Swipe Rush - Short Video Game</title>
    <link rel="stylesheet" href="style.css?v=<?php echo time(); ?>">
    <!-- Google Fonts for UI icons/text -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        /* Embed critical CSS or link external */
    </style>
</head>
<body>

    <div id="game-container">
        <!-- Feed Container -->
        <div id="feed">
            <!-- Slides will be generated here -->
            <div class="slide intro-slide">
                <h1>Swipe Rush</h1>
                <p>制限時間: 10秒</p>
                <p>スワイプして動画を次へ！</p>
                <p class="instruction">
                    【特別ルール】<br>
                    <span style="color:#ff4444;">「新人社員の踊ってみた」</span>動画を見たら<br>
                    <i class="material-icons">thumb_down</i> 低評価を押せ！<br>
                    (+3秒延長)
                </p>
                <button id="start-btn" onclick="game.start()">START</button>
                <br><br>
                <a href="/game/index.php" class="btn-secondary">ゲーム一覧に戻る</a>
            </div>
        </div>

        <!-- UI Overlay -->
        <div id="ui-overlay" style="display:none;">
            <div class="top-bar">
                <div class="timer">Time: <span id="time-display">15</span></div>
                <div class="score">Score: <span id="score-display">0</span></div>
            </div>

            <!-- Side Action Bar (Right) -->
            <div class="action-bar">
                <div class="action-btn" id="btn-like">
                    <i class="material-icons">favorite</i>
                    <span class="count">1.2M</span>
                </div>
                <div class="action-btn" id="btn-comment">
                    <i class="material-icons">chat_bubble</i>
                    <span class="count">45k</span>
                </div>
                <!-- Functional Dislike Button -->
                <div class="action-btn functional" id="btn-dislike" onclick="game.onDislike()">
                    <i class="material-icons">thumb_down</i>
                    <span class="bad-label">Bad</span>
                </div>
                <div class="action-btn">
                    <i class="material-icons">share</i>
                    <span class="count">Share</span>
                </div>
            </div>
            
            <!-- Video Info (Bottom Left) -->
            <div class="video-info">
                <div class="author">@user_1234</div>
                <div class="description">Look at this dance! #dance #viral</div>
                <div class="music">♫ Original Sound - kyoto-sound</div>
            </div>
        </div>
        
        <!-- Game Over Screen -->
        <div id="game-over" style="display:none;">
            <h2>TIME UP!</h2>
            <p>Score: <span id="final-score">0</span> Videos</p>
            <button onclick="game.start()">RETRY</button>
            <button onclick="game.resetToTitle()" class="home-link-btn">ホームへ (Title)</button>
        </div>
    </div>

    <script src="main.js?v=<?php echo time(); ?>"></script>
</body>
</html>
