<?php
require_once __DIR__ . '/includes/session.php'; // Ensure session is started and configured
require_once '../includes/head.php';
require_once '../includes/common.php';

$title = 'GAME PORTAL - MEMOSITE';
$description = '3D Game Collection in Zero Gravity';
$keywords = 'game,3d,tetris,juggler,minecraft,space';

// Custom Head with Space Styles
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $title; ?></title>
    <meta name="description" content="<?php echo $description; ?>">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --space-dark: #020205;
            --space-blue: #0b1026;
            --star-white: #ffffff;
            --nebula-purple: rgba(76, 29, 149, 0.3);
            --glass-bg: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.1);
        }

        body {
            background-color: var(--space-dark);
            background-image: 
                radial-gradient(circle at 50% 50%, #1a1a2e 0%, #020205 100%),
                radial-gradient(circle at 80% 20%, var(--nebula-purple) 0%, transparent 40%);
            color: #fff;
            font-family: 'Exo 2', sans-serif;
            margin: 0;
            overflow-x: hidden;
            min-height: 100vh;
            perspective: 2000px; /* Deeper perspective for space feel */
        }

        /* Stars Background */
        body::before {
            content: "";
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: 
                radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0));
            background-repeat: repeat;
            background-size: 200px 200px;
            opacity: 0.6;
            z-index: -1;
            animation: twinkle 5s infinite alternate;
        }

        @keyframes twinkle {
            0% { opacity: 0.4; transform: translateY(0); }
            100% { opacity: 0.7; transform: translateY(-10px); }
        }

        /* Navigation Override */
        nav {
            background: rgba(2, 2, 5, 0.7) !important;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--glass-border);
        }

        .portal-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 120px 20px 80px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            transform-style: preserve-3d;
        }

        .hero-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 6rem;
            font-weight: 900;
            text-align: center;
            margin-bottom: 80px;
            letter-spacing: 10px;
            background: linear-gradient(to bottom, #fff, #aaa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 20px rgba(255,255,255,0.3));
            transform: translateZ(50px);
            animation: float-title 8s ease-in-out infinite;
        }

        @keyframes float-title {
            0%, 100% { transform: translateZ(50px) translateY(0); }
            50% { transform: translateZ(50px) translateY(-20px); }
        }

        .game-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 60px;
            width: 100%;
            perspective: 1500px;
            padding: 20px;
        }

        .game-card {
            background: var(--glass-bg);
            border-radius: 24px;
            padding: 40px 30px;
            position: relative;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform-style: preserve-3d;
            cursor: pointer;
            text-decoration: none;
            color: #fff;
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(10px);
            box-shadow: 
                0 15px 35px rgba(0,0,0,0.5),
                inset 0 0 20px rgba(255,255,255,0.05);
            animation: float-card 6s ease-in-out infinite;
        }

        /* Floating Animation with random delays */
        @keyframes float-card {
            0%, 100% { transform: translateY(0) rotateX(0); }
            50% { transform: translateY(-20px) rotateX(2deg); }
        }

        .game-card:nth-child(1) { animation-delay: 0s; }
        .game-card:nth-child(2) { animation-delay: 1s; }
        .game-card:nth-child(3) { animation-delay: 2s; }

        .game-card:hover {
            border-color: rgba(255,255,255,0.3);
            box-shadow: 
                0 30px 60px rgba(0,0,0,0.8),
                inset 0 0 30px rgba(255,255,255,0.1),
                0 0 20px rgba(255,255,255,0.2);
            z-index: 10;
            /* Animation is paused/overridden by JS tilt on hover */
            animation-play-state: paused;
        }

        .card-content {
            transform: translateZ(40px);
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .game-icon {
            font-size: 5rem;
            margin-bottom: 25px;
            display: block;
            text-align: center;
            transform: translateZ(60px);
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
            transition: transform 0.3s;
        }
        
        .game-card:hover .game-icon {
            transform: translateZ(80px) scale(1.1);
        }

        .game-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 15px;
            color: #fff;
            text-transform: uppercase;
            transform: translateZ(50px);
            letter-spacing: 2px;
            text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }

        .game-desc {
            font-size: 1rem;
            color: #ccc;
            line-height: 1.6;
            margin-bottom: 30px;
            transform: translateZ(30px);
            text-align: center;
        }

        .play-btn {
            display: inline-block;
            padding: 12px 40px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.4);
            color: #fff;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            text-transform: uppercase;
            border-radius: 50px;
            transition: all 0.3s;
            transform: translateZ(45px);
            backdrop-filter: blur(5px);
        }

        .game-card:hover .play-btn {
            background: #fff;
            color: #000;
            box-shadow: 0 0 30px rgba(255,255,255,0.5);
            transform: translateZ(60px);
        }

        /* Game Specific Accents */
        .card-tetris:hover { border-color: #00f3ff; }
        .card-tetris:hover .game-title { color: #00f3ff; text-shadow: 0 0 20px #00f3ff; }
        
        .card-juggler:hover { border-color: #ffeb3b; }
        .card-juggler:hover .game-title { color: #ffeb3b; text-shadow: 0 0 20px #ffeb3b; }

        .card-minecraft:hover { border-color: #4caf50; }
        .card-minecraft:hover .game-title { color: #4caf50; text-shadow: 0 0 20px #4caf50; }

        .card-mikami:hover { border-color: #ff4757; }
        .card-mikami:hover .game-title { color: #ff4757; text-shadow: 0 0 20px #ff4757; }

        /* Back to Home Button */
        .home-btn {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            color: #fff;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-size: 1.2rem;
        }

        .home-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            transform: scale(1.1) rotate(-90deg);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
        }

        .home-btn svg {
            width: 20px;
            height: 20px;
            fill: currentColor;
        }

    </style>
</head>
<body>

<body>

<a href="/" class="home-btn" title="Back to Home">
    <svg viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
</a>

<div class="portal-container">
    <h1 class="hero-title">GAMES</h1>

    <!-- Login Section -->
    <!-- Login Section -->
    <div id="auth-container" style="position: absolute; top: 20px; right: 20px; z-index: 1000; text-align: right;">
        <?php if (!isset($_SESSION['user_id'])): ?>
        <div id="g_id_onload"
             data-client_id="485681185238-18l5j0atohb9aubgveaucp7r5l0cfk6q.apps.googleusercontent.com"
             data-callback="handleCredentialResponse"
             data-auto_select="true"
             data-context="signin">
        </div>
        <div class="g_id_signin"
             data-type="standard"
             data-size="large"
             data-theme="outline"
             data-text="sign_in_with"
             data-shape="pill"
             data-logo_alignment="left">
        </div>
        <?php endif; ?>
        
        <div id="user-profile" style="<?php echo isset($_SESSION['user_id']) ? 'display: flex;' : 'display: none;'; ?> background: rgba(0,0,0,0.8); padding: 10px 20px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.2); align-items: center; gap: 10px;">
            <img id="user-pic" src="<?php echo $_SESSION['picture'] ?? ''; ?>" style="width: 32px; height: 32px; border-radius: 50%;">
            <span id="user-name" style="color: #fff; font-weight: bold;"><?php echo $_SESSION['name'] ?? ''; ?></span>
            <button onclick="handleSignOut()" style="background: none; border: none; color: #aaa; cursor: pointer; margin-left: 10px;">Sign Out</button>
        </div>
    </div>

    <div class="game-grid">
        <!-- Tetris Card -->
        <a href="/game/tetris/" class="game-card card-tetris">
            <div class="card-content">
                <span class="game-icon">🧱</span>
                <h2 class="game-title">TETRIS</h2>
                <p class="game-desc">Classic puzzle in zero gravity. Stack blocks in the void.</p>
                <span class="play-btn">LAUNCH</span>
            </div>
        </a>

        <!-- Juggler Card -->
        <a href="/game/juggler/" class="game-card card-juggler">
            <div class="card-content">
                <span class="game-icon">🎰</span>
                <h2 class="game-title">JUGGLER</h2>
                <p class="game-desc">Cosmic slots. Align the stars and hit the jackpot.</p>
                <span class="play-btn">LAUNCH</span>
            </div>
        </a>

        <!-- Minecraft Card -->
        <a href="/game/minecraft/index.php" class="game-card card-minecraft">
            <div class="card-content">
                <span class="game-icon">⛏️</span>
                <h2 class="game-title">WEBCRAFT</h2>
                <p class="game-desc">Build your world on a new planet. Infinite possibilities.</p>
                <span class="play-btn">LAUNCH</span>
            </div>
        </a>

        <!-- Shogi Card -->
        <a href="/game/shogi/index.php" class="game-card card-shogi" style="border-color: #d4a373;">
            <div class="card-content">
                <span class="game-icon">☗</span>
                <h2 class="game-title">WEBSHOGI</h2>
                <p class="game-desc">Strategic battles on the 9x9 board. Solo or Network play.</p>
                <span class="play-btn">LAUNCH</span>
            </div>
        </a>

        <!-- Mikami Shogi Card -->
        <a href="/game/mikami_shogi/index.php" class="game-card card-mikami" style="border-color: #ff4757;">
            <div class="card-content">
                <span class="game-icon">🌀</span>
                <h2 class="game-title">MIKAMI SHOGI</h2>
                <p class="game-desc">Chaos Mode: Nifu allowed. <br>Warning: Board Rotation Hazard.</p>
                <span class="play-btn">ENTER CHAOS</span>
            </div>
        </a>
    </div>
</div>

<!-- Google Identity Services -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
<script>
    function handleCredentialResponse(response) {
        console.log('[Google Auth] Response:', response); // Debug log
        if (!response.credential) {
            console.error('[Google Auth] No credential in response');
            alert('Login failed: No credential received from Google.');
            return;
        }

        // Send ID token to server
        fetch('/game/auth/google_login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ credential: response.credential, client_id: response.clientId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showProfile(data.user);
                
                // Perform Data Sync (Money & Worlds)
                const localMoney = localStorage.getItem('webcraft_money') || localStorage.getItem('juggler_credits') || 0;
                
                // Scan for local worlds
                const worlds = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('minecraft_host_token_')) {
                        const code = key.replace('minecraft_host_token_', '');
                        const token = localStorage.getItem(key);
                        worlds.push({ code: code, token: token });
                    }
                }
                
                fetch('/game/api/sync_data', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ money: localMoney, worlds: worlds })
                })
                .then(res => res.json())
                .then(syncRes => {
                    console.log('[Sync] Result:', syncRes);
                    if (syncRes.synced_money) {
                        localStorage.setItem('webcraft_money', syncRes.synced_money);
                        localStorage.setItem('juggler_credits', syncRes.synced_money);
                        console.log('[Sync] Money updated to:', syncRes.synced_money);
                    }
                    if (syncRes.claimed_worlds > 0) {
                        console.log('[Sync] Claimed worlds:', syncRes.claimed_worlds);
                        alert(`Account Linked! Claimed ${syncRes.claimed_worlds} worlds and synced money.`);
                    }
                })
                .catch(e => console.error('[Sync] Failed:', e));
                
            } else {
                console.error('Login failed', data.error);
            }
        })
        .catch(err => console.error('Error:', err));
    }

    function showProfile(user) {
        const btn = document.querySelector('.g_id_signin');
        if(btn) btn.style.display = 'none';
        
        const profile = document.getElementById('user-profile');
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-pic').src = user.picture;
        profile.style.display = 'flex';
    }

    function handleSignOut() {
        // Add logout logic (destroy session)
        fetch('/game/auth/logout').then(() => {
            location.reload();
        });
    }

    // Check if already logged in (optional, via PHP session check rendered into JS)
    <?php
    if (isset($_SESSION['user_id'])) {
        echo "showProfile({name: '" . $_SESSION['name'] . "', picture: '" . ($_SESSION['picture'] ?? '') . "'});"; // Picture might need storage
    }
    ?>
</script>

<script>
    // 3D Tilt Effect (Stronger for space feel)
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Increased tilt range
            const rotateX = ((y - centerY) / centerY) * -15; 
            const rotateY = ((x - centerX) / centerX) * 15;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            // Reset to empty to allow CSS animation to resume (though it might snap, so we keep a static reset)
            // Ideally we want to resume the float animation smoothly, but for now a reset is safer for the tilt logic.
            // To resume animation, we remove the inline transform.
            card.style.transform = ''; 
        });
    });
</script>

</body>
</html>
