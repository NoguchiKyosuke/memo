<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebCraft - Worlds Management</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            overflow-y: auto;
        }

        .worlds-container {
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }

        .world-card {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .world-info h3 {
            color: var(--primary);
            margin-bottom: 5px;
        }

        .world-info p {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin: 0;
        }

        .world-actions {
            display: flex;
            gap: 10px;
        }

        .btn-sm {
            padding: 8px 16px;
            font-size: 0.9rem;
        }
    </style>
</head>

<body>
    <div class="worlds-container">
        <h1 style="text-align: center; margin-bottom: 30px;">🌍 作成したワールドの管理</h1>
        <div id="worlds-list"></div>
        <div style="text-align: center; margin-top: 30px;">
            <a href="index.php" class="menu-btn secondary"
                style="display: inline-block; width: auto; text-decoration: none;">↩️ メニューに戻る</a>
        </div>
    </div>

    <script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
    <script src="network.js?v=<?php echo time(); ?>"></script>
    <script>
        const network = new NetworkClient();
        const listDiv = document.getElementById('worlds-list');

        async function loadWorlds() {
            listDiv.innerHTML = '<p style="text-align: center;">Loading...</p>';

            // 1. Get Local Worlds
            const localWorlds = new Map();
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('minecraft_host_token_')) {
                    const roomCode = key.replace('minecraft_host_token_', '');
                    const token = localStorage.getItem(key);
                    localWorlds.set(roomCode, { code: roomCode, token: token, source: 'local' });
                }
            }

            // 2. Get Server Worlds
            let userName = 'Player';
            try {
                const res = await fetch('/game/api/get_user_worlds.php');
                const data = await res.json();

                if (data.success) {
                    userName = data.user_name || 'Player';
                    if (data.worlds) {
                        data.worlds.forEach(w => {
                            // Server matches take precedence
                            localWorlds.set(w.room_code, {
                                code: w.room_code,
                                token: w.host_token,
                                source: 'account',
                                created_at: w.created_at,
                                userName: userName
                            });
                        });
                    }
                }
            } catch (e) {
                console.error('Failed to fetch server worlds:', e);
            }

            listDiv.innerHTML = '';

            if (localWorlds.size === 0) {
                listDiv.innerHTML = '<p style="text-align: center; color: var(--text-muted);">作成したワールドはありません。</p>';
                return;
            }

            // Convert to array and sort?
            const sortedWorlds = Array.from(localWorlds.values()).reverse(); // Rough reverse sort

            sortedWorlds.forEach(t => {
                const div = document.createElement('div');
                div.className = 'world-card';
                // Show "Cloud" icon if from account
                const sourceIcon = t.source === 'account' ? '☁️' : '💻';

                div.innerHTML = `
                    <div class="world-info">
                        <h3>${sourceIcon} Code: ${t.code}</h3>
                        <p>Owner Token: ${t.token.substring(0, 8)}...</p>
                    </div>
                    <div class="world-actions">
                         <button class="menu-btn primary btn-sm" onclick="playWorld('${t.code}', '${t.token}', '${t.userName || 'Player'}')">▶️ Host</button>
                        <button class="menu-btn danger btn-sm" onclick="deleteWorld('${t.code}', '${t.token}')">🗑️ 削除</button>
                    </div>
                `;
                listDiv.appendChild(div);
            });
        }

        function playWorld(code, token, name) {
            // Auto-host via URL params (New play.php structure)
            const url = `play.php?mode=host&room=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}`;
            location.href = url;
        }

        window.deleteWorld = async (code, token) => {
            console.log(`[Worlds] Attempting to delete world: ${code}`);
            // Removed confirm to debug "hanging" issue
            // if (!confirm(...)) return;

            try {
                // Ensure token is passed
                if (!token || token === 'undefined') {
                    alert('エラー: ホストトークンが不足しています。');
                    return;
                }

                const res = await network.deleteWorldFromDB(code, token);
                console.log('Delete response:', res);
                // Alert raw response for debugging
                // alert('Debug: ' + JSON.stringify(res)); 

                if (res.success) {
                    localStorage.removeItem('minecraft_host_token_' + code);
                    alert(`ワールド ${code} を削除しました。`);
                    loadWorlds();
                } else {
                    let msg = '削除できませんでした。';
                    const err = res.error || '不明なエラー';

                    if (err.includes('Invalid host token')) {
                        msg += '\n理由: ホスト権限（トークン）が一致しません。別のブラウザや端末で作成された可能性があります。';
                    } else if (err.includes('World not found')) {
                        msg += '\n理由: ワールドが既に削除されているか、存在しません。';
                        if (confirm('サーバー上にワールドが見つかりません。ローカルの保存リストから削除しますか？')) {
                            localStorage.removeItem('minecraft_host_token_' + code);
                            loadWorlds();
                            return;
                        }
                    } else {
                        msg += `\n理由: ${err}`;
                    }
                    alert(msg);
                }
            } catch (err) {
                alert('通信エラーが発生しました。\n理由: ' + err.message);
                console.error('Delete Exception:', err);
            }
        };

        loadWorlds();
    </script>
</body>

</html>
