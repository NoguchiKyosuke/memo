<?php
// require_once __DIR__ . '/../includes/session.php';
session_start();
// WebCraft - Minecraft Clone Entry Point
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>WebCraft - MEMOSITE</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
    <!-- Three.js & Utils -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.4.0/simplex-noise.min.js"></script>
    <script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
</head>
<body>

    <!-- Menu Screen -->
    <div id="menu-screen" style="display: flex;">
        <div class="menu-content">
            <h1>WebCraft</h1>
            <div class="menu-box">
                <div class="mode-tabs">
                    <button class="mode-tab active" onclick="setMode('join')">参加する</button>
                    <button class="mode-tab" onclick="setMode('host')">ホストする</button>
                </div>

                <input type="text" id="player-name" placeholder="ニックネームを入力" value="<?php echo $_SESSION['name'] ?? 'Player'; ?>">
                
                <div id="join-section">
                    <input type="text" id="room-code-input" placeholder="ルームコード (4文字)">
                    <button onclick="joinGame()" class="menu-btn primary">ワールドに参加</button>
                </div>

                <div id="host-section" style="display: none;">
                    <button onclick="hostNewGame()" class="menu-btn primary">新規ワールド作成</button>
                    <div class="divider">または</div>
                    <input type="text" id="load-room-code" placeholder="既存のルームコード">
                    <button onclick="hostLoadGame()" class="menu-btn secondary">サーバーからロード</button>
                </div>

                <div class="divider">P2Pマルチプレイヤー接続</div>
            </div>
            
             <a href="worlds.php" class="menu-btn secondary" style="display: block; width: 100%; text-decoration: none; text-align: center; margin-top: 10px;">🌍 ワールド管理</a>
             <a href="https://memosite.jp/game" class="menu-btn secondary" style="display: block; width: 100%; text-decoration: none; text-align: center; margin-top: 10px;">🏠 ゲーム一覧へ戻る</a>

            <div class="controls-info">
                <h3>操作方法</h3>
                <ul>
                    <li><kbd>WASD</kbd> 移動</li>
                    <li><kbd>SPACE</kbd> ジャンプ</li>
                    <li><kbd>L-Click</kbd> ブロック破壊</li>
                    <li><kbd>R-Click</kbd> ブロック設置</li>
                    <li><kbd>1-9</kbd> アイテム選択</li>
                    <li><kbd>T</kbd> チャット</li>
                    <li><kbd>B</kbd> ショップ</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Simple Menu Handler -->
    <script>
        let currentMode = 'join';

        function setMode(mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            
            document.getElementById('join-section').style.display = mode === 'join' ? 'block' : 'none';
            document.getElementById('host-section').style.display = mode === 'host' ? 'block' : 'none';
        }

        function joinGame() {
            const name = document.getElementById('player-name').value;
            const room = document.getElementById('room-code-input').value;
            if(!name) return alert('ニックネームを入力してください');
            if(!room) return alert('ルームコードを入力してください');
            
            location.href = `play.php?mode=join&room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`;
        }

        function hostNewGame() {
            const name = document.getElementById('player-name').value;
            if(!name) return alert('ニックネームを入力してください');
            
            location.href = `play.php?mode=host&new=true&name=${encodeURIComponent(name)}`;
        }

        function hostLoadGame() {
            const name = document.getElementById('player-name').value;
            const room = document.getElementById('load-room-code').value;
            if(!name) return alert('ニックネームを入力してください');
            if(!room) return alert('ルームコードを入力してください');

            // Pass token if we have it locally?
            // Actually play.php/game.js will handle token retrieval from localStorage based on room code
            location.href = `play.php?mode=host&room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`;
        }
    </script>
</body>
</html>
</body>
</html>
