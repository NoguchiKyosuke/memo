/**
 * WebCraft - Minecraft Clone
 * Survival Mode with Real P2P Multiplayer
 */

// ===== Block Types =====
const BLOCK_TYPES = {
    AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, WOOD: 4, LEAVES: 5,
    SAND: 6, COBBLESTONE: 7, PLANKS: 8, BRICK: 9, WATER: 10, BEDROCK: 11,
    COAL_ORE: 12, IRON_ORE: 13, GOLD_ORE: 14, DIAMOND_ORE: 15,
    SNIPER: 99, SHOTGUN: 98
};

const BLOCK_COLORS = {
    [BLOCK_TYPES.GRASS]: 0x4ade80, [BLOCK_TYPES.DIRT]: 0x854d0e,
    [BLOCK_TYPES.STONE]: 0x71717a, [BLOCK_TYPES.WOOD]: 0x78350f,
    [BLOCK_TYPES.LEAVES]: 0x22c55e, [BLOCK_TYPES.SAND]: 0xfcd34d,
    [BLOCK_TYPES.COBBLESTONE]: 0x52525b, [BLOCK_TYPES.PLANKS]: 0xa16207,
    [BLOCK_TYPES.BRICK]: 0xb91c1c, [BLOCK_TYPES.WATER]: 0x3b82f6,
    [BLOCK_TYPES.BEDROCK]: 0x1f1f1f, [BLOCK_TYPES.COAL_ORE]: 0x3f3f3f,
    [BLOCK_TYPES.IRON_ORE]: 0xd4a574, [BLOCK_TYPES.GOLD_ORE]: 0xffd700,
    [BLOCK_TYPES.DIAMOND_ORE]: 0x00ffff,
    [BLOCK_TYPES.SNIPER]: 0x333333, // Dark grey for gun
    [BLOCK_TYPES.SHOTGUN]: 0x111111 // Black for shotgun
};

// Random skin colors for players
const SKIN_COLORS = [0x8b5cf6, 0xef4444, 0x22c55e, 0xf59e0b, 0x3b82f6, 0xec4899, 0x14b8a6, 0xf97316];

// ===== Game Constants =====
const CHUNK_SIZE = 16;
const WORLD_SIZE = 6;
const WORLD_HEIGHT = 64;
const SEA_LEVEL = 20;
const GRAVITY = 28;
const JUMP_FORCE = 10;
const MOVE_SPEED = 5;
// const MOUSE_SENSITIVITY = 0.002; // Now dynamic
const MIN_ANIMALS = 50;
const PLAYER_HEIGHT = 1.8;
const PLAYER_WIDTH = 0.6;

// ===== Main Game Class =====
class MinecraftGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.isPlaying = false;
        this.isPaused = false;
        this.isDead = false;
        this.playerName = 'Player';
        this.gameMode = 'join';

        this.chunks = new Map();
        this.blockMeshes = new Map();
        this.dirtyChunks = new Set();
        this.entities = [];

        this.player = {
            position: new THREE.Vector3(CHUNK_SIZE * WORLD_SIZE / 2, 50, CHUNK_SIZE * WORLD_SIZE / 2),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: { x: 0, y: 0 },
            onGround: false,
            health: 20,
            maxHealth: 20,
            hunger: 20,
            maxHunger: 20,
            lastY: 50,
            skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)]
        };

        this.keys = {};
        this.isPointerLocked = false;
        this.selectedSlot = 0;
        this.hotbarBlocks = [
            BLOCK_TYPES.SHOTGUN, BLOCK_TYPES.WOOD, BLOCK_TYPES.COBBLESTONE, BLOCK_TYPES.PLANKS, BLOCK_TYPES.BRICK, BLOCK_TYPES.LEAVES, BLOCK_TYPES.SAND, 'BOW', 'ROCKET', BLOCK_TYPES.SNIPER
        ];

        this.raycaster = new THREE.Raycaster();
        this.network = new NetworkClient();
        this.otherPlayers = new Map();
        this.hostPlayer = null; // For guests to see the host

        this.noise = new SimplexNoise();
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.lastPositionUpdate = 0;
        this.lastHungerDecrease = 0;

        this.animals = new Map();
        this.nextAnimalId = 1;
        this.lastAnimalUpdate = 0;

        this.money = 0;
        this.loadMoney();

        this.money = 0;
        this.loadMoney();

        this.projectiles = [];
        this.highlightMesh = null;

        this.canvas = document.getElementById('game-canvas');
        this.loadingScreen = document.getElementById('loading-screen');
        this.menuScreen = document.getElementById('menu-screen');
        this.hud = document.getElementById('hud');
        this.pauseMenu = document.getElementById('pause-menu');
        this.pauseMenu = document.getElementById('pause-menu');
        this.deathScreen = document.getElementById('death-screen');

        this.mobileInput = {
            active: false,
            moveVector: { x: 0, y: 0 },
            lookVector: { x: 0, y: 0 },
            jump: false,
            attack: false,
            place: false,
            attackTimer: 0
        };

        // Weapon State
        this.lastFireTime = 0;
        this.isScoped = false;
        this.defaultFOV = 75;
        this.scopeFOV = 30; // 30 is better than 15

        // Settings
        this.mouseSensitivity = parseFloat(localStorage.getItem('minecraft_sensitivity')) || 0.002;

        this.init();
    }

    async init() {
        // SAFETY CHECK: Prevent running on menu page (index.php) in case of file mismatch
        if (window.location.pathname.endsWith('index.php') ||
            (window.location.pathname.endsWith('/') && !window.location.search.includes('mode='))) {
            console.log('[Game] Running on Menu Page. Initialization aborted.');
            return;
        }

        // Parse URL Parameters
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode'); // 'join' or 'host'
        const roomCode = params.get('room');
        const name = params.get('name');
        const isNew = params.get('new') === 'true'; // string check

        console.log(`[Game] Init: Mode=${mode}, Room=${roomCode}, Name=${name}`);

        if (!name || (!roomCode && !isNew) || (mode !== 'join' && mode !== 'host')) {
            alert('不正なアクセスです。メニューに戻ります。');
            location.href = 'index.php';
            return;
        }

        this.playerName = name;
        this.gameMode = mode;
        this.network.roomCode = roomCode;

        this.updateLoadingText('初期化中...');
        this.loadingScreen.style.display = 'flex';

        this.initThreeJS();
        this.setupControls();
        this.setupMobileControls();
        this.setupNetworkCallbacks();

        // Setup Quit Button (Pause Menu)
        const quitBtn = document.getElementById('quit-btn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                console.log('[Game] Quit button clicked. Redirecting to menu...');
                document.exitPointerLock();
                // Force redirect for EVERYONE (Disable confirm temporarily to fix bug)
                window.location.href = '/game/minecraft/index.php';
            });
        }

        // Setup Save Button (Pause Menu)
        const saveBtn = document.getElementById('save-world-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                if (!this.network.roomCode) {
                    alert('ルームコードがないため保存できません');
                    return;
                }
                const originalText = saveBtn.textContent;
                saveBtn.textContent = '保存中...';
                saveBtn.disabled = true;

                const data = this.serializeWorld();
                const res = await this.network.saveWorldToDB(this.network.roomCode, this.hostToken || '', data);

                if (res.success) {
                    saveBtn.textContent = '保存完了!';
                    setTimeout(() => { saveBtn.textContent = originalText; saveBtn.disabled = false; }, 2000);
                } else {
                    alert('保存失敗: ' + (res.error || 'Unknown error'));
                    saveBtn.textContent = originalText;
                    saveBtn.disabled = false;
                }
            });
        }

        // Setup HUD buttons which were in setupMenu
        const cpBtn = document.getElementById('copy-room-code');
        if (cpBtn) cpBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(this.network.roomCode);
            alert('ルームコードをコピーしました');
        });
        const respawnBtn = document.getElementById('respawn-btn');
        if (respawnBtn) respawnBtn.addEventListener('click', () => { this.respawn(); });

        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) resumeBtn.addEventListener('click', () => { this.togglePause(); });


        // Start Game Logic
        if (mode === 'host') {
            if (isNew) {
                // Generate new world
                this.updateLoadingText('地形を生成中...');
                const newCode = this.network.generateRoomCode();
                this.hostToken = 'ht_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
                localStorage.setItem('minecraft_host_token_' + newCode, this.hostToken);

                this.startGame();
                this.network.roomCode = newCode;

                // Connect
                await this.network.connect(this.playerName, 'host', newCode);
                this.updateUIForHost();

                // Save initial
                const data = this.serializeWorld();
                this.network.saveWorldToDB(newCode, this.hostToken, data);

            } else {
                // Load existing
                this.updateLoadingText('ワールドをロード中...');
                const token = localStorage.getItem('minecraft_host_token_' + roomCode);
                this.hostToken = token; // Can be null if different browser, but allows play

                const data = await this.network.loadWorldFromDB(roomCode);
                if (!data) {
                    alert('ワールドが見つかりません');
                    location.href = 'index.php';
                    return;
                }

                this.startGame(false);
                this.deserializeWorld(data);

                await this.network.connect(this.playerName, 'host', roomCode);
                this.updateUIForHost();
            }
        } else {
            // Join
            this.updateLoadingText('サーバーに接続中...');
            await this.network.connect(this.playerName, 'join', roomCode);
            this.hud.style.display = 'block';
            this.loadingScreen.style.display = 'none';
            document.getElementById('save-control').style.display = 'block'; // Guests can save locally context? No, save button triggers DB save.

            // Show room code in pause
            document.getElementById('pause-room-code').style.display = 'block';
            document.getElementById('pause-room-code-text').textContent = roomCode;
        }

        // Ensure pointer lock request after load
        // animate() called in startGame or updateUIForHost?
        // updateUIForHost calls animate.
        // Join path ...
        if (mode === 'join') {
            this.hud.style.display = 'block';
            this.animate();
        }
    }


    delay(ms) { return new Promise(r => setTimeout(r, ms)); }
    updateLoadingText(text) {
        const el = document.getElementById('loading-text');
        if (el) el.textContent = text;
    }

    updateProgressBar(percent) {
        const bar = document.getElementById('loading-progress-bar');
        const container = document.getElementById('loading-progress-container');
        if (bar && container) {
            container.style.display = 'block';
            bar.style.width = `${percent}%`;
        }
    }
    initThreeJS() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 40, 120);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 0.6);
        sun.position.set(50, 100, 50);
        this.scene.add(sun);

        // Block highlight
        const hlGeo = new THREE.BoxGeometry(1.02, 1.02, 1.02);
        const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, wireframe: true });
        this.highlightMesh = new THREE.Mesh(hlGeo, hlMat);
        this.highlightMesh.visible = false;
        this.scene.add(this.highlightMesh);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    generateWorld() {
        console.log('[Game] Generating fresh world...');
        this.chunks.clear();
        this.blockMeshes.forEach(m => this.scene.remove(m));
        this.blockMeshes.clear();

        try {
            for (let cx = 0; cx < WORLD_SIZE; cx++) {
                for (let cz = 0; cz < WORLD_SIZE; cz++) {
                    this.generateChunk(cx, cz);
                }
            }
            console.log(`[Game] World generation complete. Chunks: ${this.chunks.size}`);
        } catch (e) {
            console.error('[Game] World generation failed:', e);
        }
    }

    generateChunk(cx, cz) {
        const key = `${cx},${cz}`;
        const chunk = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const wx = cx * CHUNK_SIZE + x;
                const wz = cz * CHUNK_SIZE + z;
                const height = this.getTerrainHeight(wx, wz);

                for (let y = 0; y < WORLD_HEIGHT; y++) {
                    const idx = x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;

                    if (y === 0) {
                        chunk[idx] = BLOCK_TYPES.BEDROCK;
                    } else if (y < height - 4) {
                        // Stone with ores
                        chunk[idx] = BLOCK_TYPES.STONE;
                        if (y < 20 && Math.random() < 0.02) chunk[idx] = BLOCK_TYPES.COAL_ORE;
                        if (y < 15 && Math.random() < 0.015) chunk[idx] = BLOCK_TYPES.IRON_ORE;
                        if (y < 10 && Math.random() < 0.005) chunk[idx] = BLOCK_TYPES.GOLD_ORE;
                        if (y < 8 && Math.random() < 0.002) chunk[idx] = BLOCK_TYPES.DIAMOND_ORE;
                    } else if (y < height - 1) {
                        chunk[idx] = BLOCK_TYPES.DIRT;
                    } else if (y < height) {
                        chunk[idx] = y < SEA_LEVEL ? BLOCK_TYPES.SAND : BLOCK_TYPES.GRASS;
                    } else if (y < SEA_LEVEL) {
                        chunk[idx] = BLOCK_TYPES.WATER;
                    } else {
                        chunk[idx] = BLOCK_TYPES.AIR;
                    }
                }

                // Trees
                if (height > SEA_LEVEL + 1 && Math.random() < 0.008) {
                    this.generateTree(chunk, x, height, z);
                }
            }
        }

        this.chunks.set(key, chunk);
    }

    getTerrainHeight(x, z) {
        const n1 = this.noise.noise2D(x * 0.02, z * 0.02) * 12;
        const n2 = this.noise.noise2D(x * 0.05, z * 0.05) * 6;
        return Math.floor(SEA_LEVEL + 5 + n1 + n2);
    }

    generateTree(chunk, x, baseY, z) {
        if (x < 2 || x > CHUNK_SIZE - 3 || z < 2 || z > CHUNK_SIZE - 3) return;
        const h = 4 + Math.floor(Math.random() * 2);

        for (let y = 0; y < h; y++) {
            const idx = x + (baseY + y) * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
            if (baseY + y < WORLD_HEIGHT) chunk[idx] = BLOCK_TYPES.WOOD;
        }

        const leafY = baseY + h - 2;
        for (let ly = 0; ly < 3; ly++) {
            const r = ly === 2 ? 1 : 2;
            for (let lx = -r; lx <= r; lx++) {
                for (let lz = -r; lz <= r; lz++) {
                    if (Math.abs(lx) === r && Math.abs(lz) === r && Math.random() > 0.5) continue;
                    const nx = x + lx, ny = leafY + ly, nz = z + lz;
                    if (nx >= 0 && nx < CHUNK_SIZE && ny < WORLD_HEIGHT && nz >= 0 && nz < CHUNK_SIZE) {
                        const idx = nx + ny * CHUNK_SIZE + nz * CHUNK_SIZE * WORLD_HEIGHT;
                        if (chunk[idx] === BLOCK_TYPES.AIR) chunk[idx] = BLOCK_TYPES.LEAVES;
                    }
                }
            }
        }
    }

    loadWorldFromData(worldData) {
        console.log('[Game] Loading world from host...');
        this.chunks.clear();
        this.blockMeshes.forEach(m => this.scene.remove(m));
        this.blockMeshes.clear();

        let loadedChunks = 0;
        for (const [key, arr] of Object.entries(worldData)) {
            const chunk = new Uint8Array(arr);
            if (loadedChunks === 0) {
                const nonZero = chunk.some(b => b !== 0);
                console.log(`[Game] First loaded chunk ${key} size: ${chunk.length}, hasData: ${nonZero}`);
            }
            this.chunks.set(key, chunk);
            loadedChunks++;
        }
        console.log(`[Game] Loaded ${loadedChunks} chunks into map.`);

        this.buildAllChunks();
        console.log('[Game] World loaded!');
    }

    buildAllChunks() {
        for (let cx = 0; cx < WORLD_SIZE; cx++) {
            for (let cz = 0; cz < WORLD_SIZE; cz++) {
                this.buildChunkMesh(cx, cz);
            }
        }
    }

    buildChunkMesh(cx, cz) {
        const key = `${cx},${cz}`;
        const chunk = this.chunks.get(key);
        if (!chunk) return;

        const old = this.blockMeshes.get(key);
        if (old) {
            this.scene.remove(old);
            old.children.forEach(c => { c.geometry?.dispose(); c.material?.dispose(); });
        }

        const matrices = {};

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const idx = x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
                    const bt = chunk[idx];
                    if (bt === BLOCK_TYPES.AIR || bt === BLOCK_TYPES.WATER) continue;
                    if (!this.isBlockExposed(cx, cz, x, y, z)) continue;

                    if (!matrices[bt]) matrices[bt] = [];
                    const m = new THREE.Matrix4();
                    m.setPosition(cx * CHUNK_SIZE + x + 0.5, y + 0.5, cz * CHUNK_SIZE + z + 0.5);
                    matrices[bt].push(m);
                }
            }
        }

        const group = new THREE.Group();

        for (const [bt, mlist] of Object.entries(matrices)) {
            if (!mlist.length) continue;
            const geo = new THREE.BoxGeometry(1, 1, 1);
            const isLeaves = parseInt(bt) === BLOCK_TYPES.LEAVES;
            const mat = new THREE.MeshLambertMaterial({
                color: BLOCK_COLORS[bt] || 0xff00ff,
                transparent: isLeaves,
                opacity: isLeaves ? 0.85 : 1
            });
            const inst = new THREE.InstancedMesh(geo, mat, mlist.length);
            mlist.forEach((m, i) => inst.setMatrixAt(i, m));
            inst.instanceMatrix.needsUpdate = true;
            group.add(inst);
        }

        this.scene.add(group);
        this.blockMeshes.set(key, group);
    }

    isBlockExposed(cx, cz, x, y, z) {
        const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
        for (const [dx, dy, dz] of dirs) {
            const nx = x + dx, ny = y + dy, nz = z + dz;
            if (ny < 0 || ny >= WORLD_HEIGHT) return true;

            let nb;
            if (nx < 0 || nx >= CHUNK_SIZE || nz < 0 || nz >= CHUNK_SIZE) {
                const ncx = cx + (nx < 0 ? -1 : nx >= CHUNK_SIZE ? 1 : 0);
                const ncz = cz + (nz < 0 ? -1 : nz >= CHUNK_SIZE ? 1 : 0);
                const nnx = ((nx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                const nnz = ((nz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                const nc = this.chunks.get(`${ncx},${ncz}`);
                if (!nc) return true;
                nb = nc[nnx + ny * CHUNK_SIZE + nnz * CHUNK_SIZE * WORLD_HEIGHT];
            } else {
                nb = this.chunks.get(`${cx},${cz}`)[nx + ny * CHUNK_SIZE + nz * CHUNK_SIZE * WORLD_HEIGHT];
            }
            if (nb === BLOCK_TYPES.AIR || nb === BLOCK_TYPES.WATER || nb === BLOCK_TYPES.LEAVES) return true;
        }
        return false;
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= WORLD_HEIGHT) return BLOCK_TYPES.AIR;
        const cx = Math.floor(x / CHUNK_SIZE), cz = Math.floor(z / CHUNK_SIZE);
        const lx = ((Math.floor(x) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((Math.floor(z) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const c = this.chunks.get(`${cx},${cz}`);
        return c ? c[lx + Math.floor(y) * CHUNK_SIZE + lz * CHUNK_SIZE * WORLD_HEIGHT] : BLOCK_TYPES.AIR;
    }

    setBlock(x, y, z, bt, fromNetwork = false) {
        if (y < 0 || y >= WORLD_HEIGHT) return;
        x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);

        const cx = Math.floor(x / CHUNK_SIZE), cz = Math.floor(z / CHUNK_SIZE);
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const key = `${cx},${cz}`;
        const c = this.chunks.get(key);
        if (!c) return;

        c[lx + y * CHUNK_SIZE + lz * CHUNK_SIZE * WORLD_HEIGHT] = bt;

        // Rebuild affected chunks
        this.buildChunkMesh(cx, cz);
        if (lx === 0) this.buildChunkMesh(cx - 1, cz);
        if (lx === CHUNK_SIZE - 1) this.buildChunkMesh(cx + 1, cz);
        if (lz === 0) this.buildChunkMesh(cx, cz - 1);
        if (lz === CHUNK_SIZE - 1) this.buildChunkMesh(cx, cz + 1);

        if (!fromNetwork) {
            this.network.sendBlockChange(x, y, z, bt);
        }
    }

    setupControls() {
        document.addEventListener('keydown', e => {
            const chatInput = document.getElementById('chat-input');
            const isChatOpen = chatInput.style.display === 'block';

            if (isChatOpen) {
                if (e.key === 'Enter') this.toggleChat();
                if (e.key === 'Escape') this.toggleChat(); // Allow closing chat with ESC
                return; // Ignore other keys while chatting
            }

            this.keys[e.code] = true;
            if (this.isPlaying && !this.isPaused && !this.isDead) {
                if (e.code >= 'Digit1' && e.code <= 'Digit9') this.selectSlot(parseInt(e.code[5]) - 1);
                if (e.code === 'KeyT') { e.preventDefault(); this.toggleChat(); }
                if (e.code === 'KeyB') { this.openShop(); } // B for Buy/Shop
            }
            if (e.code === 'Escape' && this.isPlaying) this.togglePause();
        });

        document.addEventListener('keyup', e => { this.keys[e.code] = false; });

        document.addEventListener('mousemove', e => {
            if (this.isPointerLocked && !this.isDead) {
                this.player.rotation.y -= e.movementX * this.mouseSensitivity;
                this.player.rotation.x -= e.movementY * this.mouseSensitivity;
                this.player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.rotation.x));
            }
        });

        // Sensitivity Slider
        const sensSlider = document.getElementById('sensitivity-slider');
        const sensVal = document.getElementById('sens-val');
        if (sensSlider && sensVal) {
            sensSlider.value = this.mouseSensitivity;
            sensVal.textContent = this.mouseSensitivity.toFixed(4);

            sensSlider.addEventListener('input', (e) => {
                this.mouseSensitivity = parseFloat(e.target.value);
                sensVal.textContent = this.mouseSensitivity.toFixed(4);
                localStorage.setItem('minecraft_sensitivity', this.mouseSensitivity);
            });
        }

        this.canvas.addEventListener('mousedown', e => {
            if (!this.isPointerLocked) { this.canvas.requestPointerLock(); return; }
            if (this.isDead) return;

            if (e.button === 0) { // Left Click
                const item = this.hotbarBlocks[this.selectedSlot];
                if (item === BLOCK_TYPES.SNIPER) {
                    this.shootSniper();
                } else if (item === BLOCK_TYPES.SHOTGUN) {
                    this.shootShotgun();
                } else {
                    this.breakBlock(); // Keep mining
                    this.attackEntity(); // Try attacking
                }
            }
            else if (e.button === 2) { // Right Click
                const item = this.hotbarBlocks[this.selectedSlot];
                if (item === 'BOW') {
                    this.shootArrow();
                } else if (item === 'ROCKET') {
                    this.shootRocket();
                } else if (item === BLOCK_TYPES.SNIPER) {
                    this.toggleScope();
                } else {
                    this.placeBlock();
                }
            }
        });

        this.canvas.addEventListener('contextmenu', e => e.preventDefault());

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;

            // Do not pause if chat is open
            const isChatOpen = document.getElementById('chat-input').style.display === 'block';
            if (!this.isPointerLocked && this.isPlaying && !this.isPaused && !this.isDead && !isChatOpen) {
                this.togglePause();
            }
        });

        this.canvas.addEventListener('wheel', e => {
            if (this.isPlaying && !this.isPaused && !this.isDead) {
                let s = this.selectedSlot + (e.deltaY > 0 ? 1 : -1);
                if (s < 0) s = 8; if (s > 8) s = 0;
                this.selectSlot(s);
            }
        });
    }

    setupMobileControls() {
        if (!('ontouchstart' in window)) return;

        console.log('[Game] Touch detected, enabling mobile controls');
        this.mobileInput.active = true;

        // Joystick
        const joystickZone = document.getElementById('joystick-zone');
        const knob = document.getElementById('joystick-knob');

        if (!joystickZone || !knob) {
            console.warn('[Game] Mobile controls HTML elements not found. Skipping setup.');
            return;
        }

        let joystickId = null;
        let startX = 0, startY = 0;
        const maxRadius = 40;

        joystickZone.addEventListener('touchstart', e => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            joystickId = touch.identifier;
            startX = touch.clientX;
            startY = touch.clientY;
            knob.style.transform = `translate(-50%, -50%)`; // Center
        }, { passive: false });

        joystickZone.addEventListener('touchmove', e => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === joystickId) {
                    const touch = e.changedTouches[i];
                    let dx = touch.clientX - startX;
                    let dy = touch.clientY - startY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > maxRadius) {
                        const ratio = maxRadius / dist;
                        dx *= ratio;
                        dy *= ratio;
                    }

                    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

                    // Normalize -1 to 1
                    this.mobileInput.moveVector.x = dx / maxRadius; // Right/Left
                    this.mobileInput.moveVector.y = dy / maxRadius; // Back/Forward
                    break;
                }
            }
        }, { passive: false });

        const endJoystick = (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === joystickId) {
                    joystickId = null;
                    knob.style.transform = `translate(-50%, -50%)`;
                    this.mobileInput.moveVector.x = 0;
                    this.mobileInput.moveVector.y = 0;
                    break;
                }
            }
        };
        joystickZone.addEventListener('touchend', endJoystick);
        joystickZone.addEventListener('touchcancel', endJoystick);

        // Buttons
        const bindBtn = (id, key) => {
            const btn = document.getElementById(id);
            btn.addEventListener('touchstart', e => {
                e.preventDefault();
                this.mobileInput[key] = true;
                btn.style.backgroundColor = 'rgba(74, 222, 128, 0.8)';
            }, { passive: false });

            const endBtn = (e) => {
                e.preventDefault();
                this.mobileInput[key] = false;
                btn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            };
            btn.addEventListener('touchend', endBtn);
            btn.addEventListener('touchcancel', endBtn);
        };

        bindBtn('btn-jump', 'jump');

        // Attack/Place need special handling (click simulation)
        const btnAttack = document.getElementById('btn-break');
        btnAttack.addEventListener('touchstart', e => {
            e.preventDefault();
            this.mobileInput.attack = true;

            // Check weapon
            const item = this.hotbarBlocks[this.selectedSlot];
            if (item === BLOCK_TYPES.SNIPER) {
                this.shootSniper();
            } else if (item === BLOCK_TYPES.SHOTGUN) {
                this.shootShotgun();
            } else {
                this.attackEntity(); // Try immediate
                this.breakBlock();
            }

            btnAttack.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
        }, { passive: false });
        btnAttack.addEventListener('touchend', e => {
            this.mobileInput.attack = false;
            btnAttack.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        });

        const btnPlace = document.getElementById('btn-place');
        btnPlace.addEventListener('touchstart', e => {
            e.preventDefault();
            // Logic from Right Click
            const item = this.hotbarBlocks[this.selectedSlot];
            if (item === 'BOW') {
                this.shootArrow();
            } else if (item === 'ROCKET') {
                this.shootRocket();
            } else if (item === BLOCK_TYPES.SNIPER) {
                this.toggleScope();
            } else {
                this.placeBlock();
            }
            btnPlace.style.backgroundColor = 'rgba(59, 130, 246, 0.8)';
        }, { passive: false });
        btnPlace.addEventListener('touchend', e => {
            btnPlace.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        });

        // Touch Look (Right side of screen, excluding buttons)
        let lastLookX = 0, lastLookY = 0;
        let lookId = null;

        document.addEventListener('touchstart', e => {
            // Ignore if on joystick or buttons
            if (e.target.closest('#mobile-controls')) return;

            // Allow looking if touching right half? Or anywhere not UI.
            // Simple: Any touch not on UI is look.
            // But we need to handle multiple touches.

            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                // Should avoid left side (joystick area) if not explicitly on joystick?
                if (t.clientX > window.innerWidth / 3) {
                    lookId = t.identifier;
                    lastLookX = t.clientX;
                    lastLookY = t.clientY;
                    break;
                }
            }
        }, { passive: false });

        document.addEventListener('touchmove', e => {
            // Check for look touch
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === lookId) {
                    const t = e.changedTouches[i];
                    const dx = t.clientX - lastLookX;
                    const dy = t.clientY - lastLookY;

                    this.player.rotation.y -= dx * 0.005;
                    this.player.rotation.x -= dy * 0.005;
                    this.player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.rotation.x));

                    lastLookX = t.clientX;
                    lastLookY = t.clientY;
                    break;
                }
            }
        }, { passive: false });

        const endLook = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === lookId) {
                    lookId = null;
                }
            }
        };
        document.addEventListener('touchend', endLook);
        document.addEventListener('touchcancel', endLook);
    }


    // setupMenu removed

    setupNetworkCallbacks() {
        this.network.on('playerJoin', (player) => {
            console.log('[Game] Player joined:', player.name);
            this.addOtherPlayer(player);
            this.addChatMessage(`${player.name} が参加しました`, 'system');

            // If we're host, send world to new player
            if (this.network.isHost) {
                console.log(`[Game] Sending world to new guest... (Chunks: ${this.chunks.size})`);

                if (this.chunks.size === 0) {
                    console.error('[Game] CRITICAL: Chunks are empty! Regenerating world...');
                    this.generateWorld();
                    this.buildAllChunks();
                }

                this.network.sendWorldToGuest(this.chunks, {
                    x: this.player.position.x,
                    y: this.player.position.y,
                    z: this.player.position.z
                });
            }

        });

        this.network.on('playerLeave', (id, player) => {
            this.removeOtherPlayer(id);
            if (player) this.addChatMessage(`${player.name} が退出しました`, 'system');
        });

        this.network.on('playerMove', (data) => {
            if (data.id === 'host') {
                this.updateHostPlayer(data.position, data.rotation);
            } else {
                this.updateOtherPlayer(data.id, data.position, data.rotation);
            }
        });

        this.network.on('blockChange', (data) => {
            this.setBlock(data.x, data.y, data.z, data.blockType, true);
        });

        this.network.on('chat', (data) => {
            this.addChatMessage(`${data.name}: ${data.message}`);
        });

        this.network.on('playerCount', (count) => {
            document.getElementById('online-count').textContent = count + 1;
            this.updatePlayerList();
        });

        this.network.on('roomCreated', (code) => {
            this.showRoomCode(code);
        });

        this.network.on('worldStart', (data) => {
            console.log('[Game] World sync started');
            this.tempWorldChunks = {};
            this.spawnPos = data.spawnPos;
            this.totalChunksToReceive = data.totalChunks || 0;
            this.receivedChunksCount = 0;
            this.updateLoadingText('ワールドデータ受信中... (0%)');
            this.updateProgressBar(0);
        });

        this.network.on('chunkData', (data) => {
            let chunkData;
            if (data.isCompressed) {
                // RLE Decompression
                chunkData = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);
                let offset = 0;
                const rle = data.data;
                for (let i = 0; i < rle.length; i += 2) {
                    const count = rle[i];
                    const val = rle[i + 1];
                    for (let j = 0; j < count; j++) {
                        chunkData[offset++] = val;
                    }
                }
            } else {
                chunkData = new Uint8Array(data.data);
            }

            this.tempWorldChunks[data.key] = chunkData;
            this.receivedChunksCount++;
            if (this.totalChunksToReceive > 0) {
                const percent = Math.floor((this.receivedChunksCount / this.totalChunksToReceive) * 100);
                this.updateLoadingText(`ワールドデータ受信中... (${percent}%)`);
                this.updateProgressBar(percent);
            }
        });

        this.network.on('worldEnd', () => {
            console.log('[Game] World sync complete');
            this.updateProgressBar(100);
            this.loadWorldFromData(this.tempWorldChunks);
            if (this.spawnPos) {
                this.player.position.set(this.spawnPos.x, this.spawnPos.y + 2, this.spawnPos.z);
            } else {
                this.findSpawnPosition();
            }

            // Add host as a player we can see
            this.addHostPlayer();

            // Start the game loop now that we have the world
            this.startGameLoop();
        });

        this.network.on('fullWorldSync', (data) => {
            console.log('[Game] Received legacy full world from host');
            this.loadWorldFromData(data.chunks);
            if (data.spawnPos) {
                this.player.position.set(data.spawnPos.x, data.spawnPos.y + 2, data.spawnPos.z);
            } else {
                this.findSpawnPosition();
            }
            this.addHostPlayer();
            this.startGameLoop();
        });

        this.network.on('animalUpdate', (data) => {
            this.handleAnimalUpdate(data);
        });
    }

    showRoomCode(code) {
        const display = document.getElementById('room-code-display');
        const text = document.getElementById('room-code-text');
        if (display) display.style.display = 'flex';
        if (text) text.textContent = code;
        const pauseCode = document.getElementById('pause-room-code');
        const pauseText = document.getElementById('pause-room-code-text');
        if (pauseCode) pauseCode.style.display = 'block';
        if (pauseText) pauseText.textContent = code;
    }

    async startGame(generate = true) {
        console.log('[Game] ===== START GAME =====');
        console.log('[Game] Player:', this.playerName);

        if (this.gameMode === 'solo' && !this.network.connected) {
            await this.network.connect(this.playerName, 'solo');
        }

        this.updateLoadingText('ワールド準備中...');
        this.loadingScreen.style.display = 'flex';
        this.loadingScreen.style.display = 'flex';
        // this.menuScreen.style.display = 'none'; // REMOVED: No menu in play.php

        // Ensure ThreeJS init
        if (!this.scene) this.initThreeJS();

        if (generate) {
            this.generateWorld();
            this.buildAllChunks();

            // Spawn animals
            if (!this.network.connected || this.network.isHost) {
                this.spawnAnimals();
            }
        }

        await this.delay(500);
        this.loadingScreen.style.display = 'none';
        this.hud.style.display = 'block';

        this.generateHotbar(); // Init Hotbar
        this.startGameLoop();
    }

    generateHotbar() {
        const container = document.getElementById('hotbar');
        if (!container) return;
        container.innerHTML = '';

        this.hotbarBlocks.forEach((type, i) => {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot' + (i === this.selectedSlot ? ' selected' : '');

            const icon = document.createElement('div');
            icon.className = 'block-icon';

            if (typeof type === 'number') {
                // Block
                if (type === BLOCK_TYPES.WOOD) icon.classList.add('wood');
                else if (type === BLOCK_TYPES.COBBLESTONE) icon.classList.add('cobblestone');
                else if (type === BLOCK_TYPES.PLANKS) icon.classList.add('planks');
                else if (type === BLOCK_TYPES.BRICK) icon.classList.add('brick');
                else if (type === BLOCK_TYPES.LEAVES) icon.classList.add('leaves');
                else if (type === BLOCK_TYPES.SAND) icon.classList.add('sand');
                else if (type === BLOCK_TYPES.SNIPER) {
                    icon.classList.add('sniper');
                    icon.style.background = '#333';
                    icon.style.border = '2px solid #555';
                    icon.textContent = '🔭';
                    icon.style.display = 'flex';
                    icon.style.alignItems = 'center';
                    icon.style.justifyContent = 'center';
                    icon.style.fontSize = '20px';
                }
                else if (type === BLOCK_TYPES.SHOTGUN) {
                    icon.classList.add('shotgun');
                    icon.style.background = '#000';
                    icon.style.border = '2px solid #333';
                    icon.textContent = '🔫';
                    icon.style.display = 'flex';
                    icon.style.alignItems = 'center';
                    icon.style.justifyContent = 'center';
                    icon.style.fontSize = '20px';
                }
                else icon.classList.add('grass'); // Default
            } else {
                // Item string
                if (type === 'BOW') icon.classList.add('bow');
                else if (type === 'ROCKET') icon.classList.add('rocket');
            }

            slot.appendChild(icon);
            slot.onclick = () => this.selectSlot(i);
            container.appendChild(slot);
        });
    }

    updateUIForHost() {
        if (!this.network.connected) return;
        const actualCode = this.network.roomCode;
        if (document.getElementById('room-code-text')) document.getElementById('room-code-text').textContent = actualCode;
        if (document.getElementById('room-code-display')) document.getElementById('room-code-display').style.display = 'flex';
        if (document.getElementById('pause-room-code')) document.getElementById('pause-room-code').style.display = 'block';
        if (document.getElementById('pause-room-code-text')) document.getElementById('pause-room-code-text').textContent = actualCode;
        if (document.getElementById('save-control')) document.getElementById('save-control').style.display = 'block';
        if (this.hostToken && document.getElementById('host-controls')) document.getElementById('host-controls').style.display = 'block';

        this.loadingScreen.style.display = 'none';
        this.hud.style.display = 'block';
        this.generateHotbar(); // Init Hotbar for Host
        if (!this.isPlaying) this.startGameLoop();
    }

    startGameLoop() {
        this.isPlaying = true;
        this.isPaused = false;
        this.isDead = false;
        this.player.health = 20;
        this.player.hunger = 20;
        this.lastHungerDecrease = Date.now();

        this.loadingScreen.style.display = 'none';
        this.hud.style.display = 'block';

        if (this.gameMode !== 'join') {
            this.findSpawnPosition();
        }

        // Start Render Loop
        this.animate();

        // Try pointer lock, ignore if blocked (user needs to click)
        try {
            this.canvas.requestPointerLock();
        } catch (e) {
            console.log('[Game] Auto-pointer lock blocked (waiting for click)');
        }
    }

    findSpawnPosition() {
        console.log('[Game] Finding spawn position...');
        const center = (CHUNK_SIZE * WORLD_SIZE) / 2;
        const searchRadius = 48; // Increased radius

        // Try to find highest block in a spiral outward from center
        for (let r = 0; r < searchRadius; r += 4) {
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                const cx = Math.floor(center + Math.cos(angle) * r);
                const cz = Math.floor(center + Math.sin(angle) * r);

                for (let y = WORLD_HEIGHT - 1; y > 0; y--) {
                    const b = this.getBlock(cx, y, cz);
                    if (b !== BLOCK_TYPES.AIR && b !== BLOCK_TYPES.WATER) {
                        console.log(`[Game] Spawn found at ${cx}, ${y + 2}, ${cz}`);
                        this.player.position.set(cx + 0.5, y + 2, cz + 0.5);
                        this.player.lastY = y + 2;
                        this.player.velocity.set(0, 0, 0);
                        return;
                    }
                }
            }
        }

        // Fallback if no block found
        console.warn('[Game] No spawn block found! Defaulting to high position.');

        // Use initial spawn pos if available
        if (this.spawnPos) {
            console.log('[Game] Using initial spawnPos as fallback');
            this.player.position.set(this.spawnPos.x, this.spawnPos.y + 2, this.spawnPos.z);
        } else {
            this.player.position.set(center, WORLD_HEIGHT + 10, center);
        }
        this.player.velocity.set(0, 0, 0);
    }


    togglePause() {
        if (!this.isPlaying || this.isDead) return;
        this.isPaused = !this.isPaused;
        this.pauseMenu.style.display = this.isPaused ? 'flex' : 'none';
        if (this.isPaused) document.exitPointerLock();
        else this.canvas.requestPointerLock();
    }

    quitGame() {
        this.isPlaying = false;
        this.network.disconnect();
        this.pauseMenu.style.display = 'none';
        this.deathScreen.style.display = 'none';
        this.hud.style.display = 'none';
        this.menuScreen.style.display = 'flex';
        document.getElementById('room-code-display').style.display = 'none';

        // Clear other players
        this.otherPlayers.forEach((data, id) => {
            this.scene.remove(data.mesh);
        });
        this.otherPlayers.clear();
        if (this.hostPlayer) {
            this.scene.remove(this.hostPlayer.mesh);
            this.hostPlayer = null;
        }

        document.exitPointerLock();
    }

    respawn() {
        this.isDead = false;
        this.deathScreen.style.display = 'none';
        this.player.health = 20;
        this.player.hunger = 20;
        this.findSpawnPosition();
        try { this.canvas.requestPointerLock(); } catch (e) { }
    }

    die(msg) {
        this.isDead = true;
        this.deathScreen.style.display = 'flex';
        document.getElementById('death-message').textContent = msg;
        document.exitPointerLock();
    }

    takeDamage(amt, msg = 'ダメージ') {
        this.player.health = Math.max(0, this.player.health - amt);
        if (this.player.health <= 0) this.die(msg);
    }

    selectSlot(s) {
        this.selectedSlot = s;
        document.querySelectorAll('.hotbar-slot').forEach((el, i) => el.classList.toggle('selected', i === s));
    }

    toggleChat() {
        const input = document.getElementById('chat-input');
        if (input.style.display === 'none') {
            input.style.display = 'block';
            input.focus();
            document.exitPointerLock();
        } else {
            if (input.value.trim()) {
                this.network.sendChat(input.value);
                this.addChatMessage(`${this.playerName}: ${input.value}`);
            }
            input.value = '';
            input.style.display = 'none';
            this.canvas.requestPointerLock();
        }
    }

    addChatMessage(msg, type = 'normal') {
        const div = document.getElementById('chat-messages');
        const el = document.createElement('div');
        el.className = 'message';
        el.textContent = msg;
        if (type === 'system') el.style.color = '#fbbf24';
        if (type === 'error') el.style.color = '#ef4444'; // Red for errors

        div.appendChild(el);

        // Remove old messages if more than 5
        while (div.children.length > 5) {
            div.removeChild(div.firstChild);
        }

        div.scrollTop = div.scrollHeight;
        // No timeout for removal
    }

    updatePlayerList() {
        const list = document.getElementById('players');
        list.innerHTML = `<li style="color:#4ade80">${this.playerName} (あなた)</li>`;

        if (this.hostPlayer && this.gameMode === 'join') {
            const li = document.createElement('li');
            li.textContent = 'Host';
            li.style.color = '#f59e0b';
            list.appendChild(li);
        }

        this.network.players.forEach(p => {
            const li = document.createElement('li');
            li.textContent = p.name;
            list.appendChild(li);
        });
    }

    // Create player mesh with visible body, head, arms, legs
    createPlayerMesh(name, color) {
        const group = new THREE.Group();

        // Body
        const bodyGeo = new THREE.BoxGeometry(0.5, 0.7, 0.25);
        const bodyMat = new THREE.MeshLambertMaterial({ color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.35;
        group.add(body);

        // Head
        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.9;
        group.add(head);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.15, 0.6, 0.15);
        const armMat = new THREE.MeshLambertMaterial({ color });
        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.35, 0.35, 0);
        group.add(leftArm);
        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.35, 0.35, 0);
        group.add(rightArm);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const legMat = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(-0.12, -0.3, 0);
        group.add(leftLeg);
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(0.12, -0.3, 0);
        group.add(rightLeg);

        // Name label
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, 128, 42);
        const tex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: tex });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(2, 0.5, 1);
        sprite.position.y = 1.4;
        group.add(sprite);

        return group;
    }

    addOtherPlayer(player) {
        console.log('[Game] Adding player mesh:', player.name);
        const color = SKIN_COLORS[Math.abs(player.name.charCodeAt(0)) % SKIN_COLORS.length];
        const mesh = this.createPlayerMesh(player.name, color);

        if (player.position) {
            mesh.position.set(player.position.x, player.position.y + 0.9, player.position.z);
        }

        this.scene.add(mesh);
        this.otherPlayers.set(player.peerId || player.id, { mesh, player });
    }

    addHostPlayer() {
        if (this.hostPlayer) return;
        console.log('[Game] Adding host player mesh');

        const mesh = this.createPlayerMesh('Host', 0xf59e0b);
        mesh.position.set(64, 30, 64);
        this.scene.add(mesh);
        this.hostPlayer = { mesh };
    }

    removeOtherPlayer(id) {
        const data = this.otherPlayers.get(id);
        if (data) {
            this.scene.remove(data.mesh);
            this.otherPlayers.delete(id);
        }
    }

    updateOtherPlayer(id, pos, rot) {
        const data = this.otherPlayers.get(id);
        if (data && pos) {
            data.mesh.position.set(pos.x, pos.y + 0.9, pos.z);
            if (rot) data.mesh.rotation.y = rot.y;
        }
    }

    updateHostPlayer(pos, rot) {
        if (this.hostPlayer && pos) {
            this.hostPlayer.mesh.position.set(pos.x, pos.y + 0.9, pos.z);
            if (rot) this.hostPlayer.mesh.rotation.y = rot.y;
        }
    }

    getTargetBlock() {
        const dir = new THREE.Vector3(0, 0, -1);
        dir.applyQuaternion(this.camera.quaternion);
        this.raycaster.set(this.camera.position, dir);
        this.raycaster.far = 5;

        let closest = null, minDist = Infinity;
        const pp = this.player.position;

        for (let x = Math.floor(pp.x - 5); x <= Math.floor(pp.x + 5); x++) {
            for (let y = Math.floor(pp.y - 5); y <= Math.floor(pp.y + 5); y++) {
                for (let z = Math.floor(pp.z - 5); z <= Math.floor(pp.z + 5); z++) {
                    const bt = this.getBlock(x, y, z);
                    if (bt === BLOCK_TYPES.AIR || bt === BLOCK_TYPES.WATER) continue;

                    const box = new THREE.Box3(new THREE.Vector3(x, y, z), new THREE.Vector3(x + 1, y + 1, z + 1));
                    const hit = this.raycaster.ray.intersectBox(box, new THREE.Vector3());
                    if (hit) {
                        const d = hit.distanceTo(this.camera.position);
                        if (d < minDist && d < 5) {
                            minDist = d;
                            const c = new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5);
                            const diff = hit.clone().sub(c);
                            const fn = new THREE.Vector3();
                            const ax = Math.abs(diff.x), ay = Math.abs(diff.y), az = Math.abs(diff.z);
                            if (ax > ay && ax > az) fn.x = Math.sign(diff.x);
                            else if (ay > az) fn.y = Math.sign(diff.y);
                            else fn.z = Math.sign(diff.z);
                            closest = { position: { x, y, z }, normal: fn, blockType: bt };
                        }
                    }
                }
            }
        }
        return closest;
    }

    breakBlock() {
        const t = this.getTargetBlock();
        if (t && t.blockType !== BLOCK_TYPES.BEDROCK) {
            this.setBlock(t.position.x, t.position.y, t.position.z, BLOCK_TYPES.AIR);
        }
    }

    placeBlock() {
        const blockToPlace = this.hotbarBlocks[this.selectedSlot];
        if (blockToPlace === 'BOW' || blockToPlace === 'ROCKET') return;

        const t = this.getTargetBlock();
        if (t) {
            const px = t.position.x + t.normal.x;
            const py = t.position.y + t.normal.y;
            const pz = t.position.z + t.normal.z;

            const pBox = new THREE.Box3(
                new THREE.Vector3(this.player.position.x - PLAYER_WIDTH / 2, this.player.position.y, this.player.position.z - PLAYER_WIDTH / 2),
                new THREE.Vector3(this.player.position.x + PLAYER_WIDTH / 2, this.player.position.y + PLAYER_HEIGHT, this.player.position.z + PLAYER_WIDTH / 2)
            );
            const bBox = new THREE.Box3(new THREE.Vector3(px, py, pz), new THREE.Vector3(px + 1, py + 1, pz + 1));
            if (!pBox.intersectsBox(bBox)) {
                this.setBlock(px, py, pz, this.hotbarBlocks[this.selectedSlot]);
            }
        }
    }

    updatePlayer(dt) {
        if (!this.isPlaying || this.isPaused || this.isDead) return;

        const now = Date.now();

        // Hunger
        if (now - this.lastHungerDecrease > 45000) {
            this.player.hunger = Math.max(0, this.player.hunger - 1);
            this.lastHungerDecrease = now;
        }
        if (this.player.hunger <= 0 && now % 5000 < 100) {
            this.takeDamage(1, '餓死');
        }

        // Movement
        // Movement
        let finalX = 0;
        let finalZ = 0;

        // Keyboard
        if (this.keys['KeyW']) finalZ = -1;
        if (this.keys['KeyS']) finalZ = 1;
        if (this.keys['KeyA']) finalX = -1;
        if (this.keys['KeyD']) finalX = 1;

        // Normalize Keyboard Input if Diagonal
        if (finalX !== 0 || finalZ !== 0) {
            const len = Math.sqrt(finalX * finalX + finalZ * finalZ);
            finalX /= len;
            finalZ /= len;
        }

        // Mobile Joystick add-on
        if (this.mobileInput.active) {
            // Joystick y: -1 (Forward/Up) to 1 (Back/Down).
            // Matches standard WASD W=-1, S=1.
            finalX += this.mobileInput.moveVector.x;
            finalZ += this.mobileInput.moveVector.y;

            // Clamp to 1.0 max magnitude
            const len = Math.sqrt(finalX * finalX + finalZ * finalZ);
            if (len > 1.0) {
                finalX /= len;
                finalZ /= len;
            }
        }


        const spd = MOVE_SPEED;

        if (finalX !== 0 || finalZ !== 0) {
            const cos = Math.cos(this.player.rotation.y);
            const sin = Math.sin(this.player.rotation.y);

            // Rotate input by Camera Yaw
            // x moves (cos, -sin) direction relative to camera? No.
            // Forward (Z=-1) -> moves in -sin, -cos direction? 
            // Let's rely on standard rotation formula:
            // worldX = inputX * cos - inputZ * sin   (or similar)
            // Standard First Person:
            //   Forward (z < 0) moves along look vector.
            //   Right (x > 0) moves along right vector.

            const worldX = finalX * cos - (-finalZ) * sin; // Wait, Z is forward/back. 
            // Standard: 
            // Forward: dx = -sin(theta), dz = -cos(theta)
            // Right:   dx =  cos(theta), dz = -sin(theta)

            // mv.x (Right/Left), mv.z (Back/Forward)
            // x=1 (Right) -> dx=cos, dz=-sin
            // z=1 (Back)  -> dx=sin, dz=cos

            const dx = finalX * cos + finalZ * sin;
            const dz = finalX * (-sin) + finalZ * cos;

            // Apply
            this.player.velocity.x = dx * spd;
            this.player.velocity.z = dz * spd;
        } else {
            this.player.velocity.x = 0;
            this.player.velocity.z = 0;
        }

        // Jump
        if ((this.keys['Space'] || this.mobileInput.jump) && (this.player.onGround || this.flyMode)) {
            this.player.velocity.y = JUMP_FORCE;
            this.player.onGround = false;
        }


        this.player.velocity.y -= GRAVITY * dt;
        this.moveWithCollision(dt);

        // Fall damage
        if (this.player.onGround) {
            const fall = this.player.lastY - this.player.position.y;
            if (fall > 3) this.takeDamage(Math.floor((fall - 3) * 2), '落下ダメージ');
            this.player.lastY = this.player.position.y;
        } else if (this.player.velocity.y > 0) {
            this.player.lastY = this.player.position.y;
        }

        // Camera
        this.camera.position.copy(this.player.position);
        this.camera.position.y += PLAYER_HEIGHT - 0.2;
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.x = this.player.rotation.x;
        this.camera.rotation.y = this.player.rotation.y;

        // Highlight
        const tgt = this.getTargetBlock();
        if (tgt) {
            this.highlightMesh.position.set(tgt.position.x + 0.5, tgt.position.y + 0.5, tgt.position.z + 0.5);
            this.highlightMesh.visible = true;
        } else {
            this.highlightMesh.visible = false;
        }

        // Network position
        if (now - this.lastPositionUpdate > 50) {
            this.network.sendPosition(this.player.position, this.player.rotation);
            this.lastPositionUpdate = now;
        }

        this.updateHUD();
    }

    moveWithCollision(dt) {
        const v = this.player.velocity, p = this.player.position.clone();

        p.x += v.x * dt;
        if (this.checkCollision(p)) { p.x = this.player.position.x; v.x = 0; }

        p.y += v.y * dt;
        if (this.checkCollision(p)) {
            if (v.y < 0) this.player.onGround = true;
            p.y = this.player.position.y; v.y = 0;
        } else { this.player.onGround = false; }

        p.z += v.z * dt;
        if (this.checkCollision(p)) { p.z = this.player.position.z; v.z = 0; }

        this.player.position.copy(p);
        if (p.y < -20) this.die('奈落に落ちた');
    }

    checkCollision(pos) {
        const hw = PLAYER_WIDTH / 2;
        const pts = [
            [pos.x - hw, pos.y + 0.1, pos.z - hw],
            [pos.x + hw, pos.y + 0.1, pos.z - hw],
            [pos.x - hw, pos.y + 0.1, pos.z + hw],
            [pos.x + hw, pos.y + 0.1, pos.z + hw],
            [pos.x - hw, pos.y + PLAYER_HEIGHT - 0.1, pos.z - hw],
            [pos.x + hw, pos.y + PLAYER_HEIGHT - 0.1, pos.z - hw],
            [pos.x - hw, pos.y + PLAYER_HEIGHT - 0.1, pos.z + hw],
            [pos.x + hw, pos.y + PLAYER_HEIGHT - 0.1, pos.z + hw],
        ];
        for (const [x, y, z] of pts) {
            const b = this.getBlock(x, y, z);
            if (b !== BLOCK_TYPES.AIR && b !== BLOCK_TYPES.WATER) return true;
        }
        return false;
    }

    updateHUD() {
        document.getElementById('coord-x').textContent = Math.floor(this.player.position.x);
        document.getElementById('coord-y').textContent = Math.floor(this.player.position.y);
        document.getElementById('coord-z').textContent = Math.floor(this.player.position.z);
        document.getElementById('health-bar').style.width = `${(this.player.health / 20) * 100}%`;
        document.getElementById('hunger-bar').style.width = `${(this.player.hunger / 20) * 100}%`;
        document.getElementById('health-text').textContent = `${Math.ceil(this.player.health)}/20`;
        document.getElementById('hunger-text').textContent = `${Math.ceil(this.player.hunger)}/20`;

        // Update Money
        document.getElementById('money-val').textContent = this.money.toLocaleString();
    }

    // Money System
    async loadMoney() {
        // Try global loader first
        if (window.GameSaver) {
            await GameSaver.init('minecraft');
            const data = await GameSaver.load();
            if (data && data.money !== undefined) {
                this.money = data.money;
                localStorage.setItem('webcraft_money', this.money); // Sync local
            } else {
                // Fallback to local
                const saved = localStorage.getItem('webcraft_money');
                this.money = saved ? parseInt(saved) : 0;
            }
        } else {
            const saved = localStorage.getItem('webcraft_money');
            this.money = saved ? parseInt(saved) : 0;
        }

        document.getElementById('money-val').textContent = this.money.toLocaleString();
        if (document.getElementById('shop-money-val')) {
            document.getElementById('shop-money-val').textContent = this.money.toLocaleString();
        }
    }

    addMoney(amount) {
        console.log(`[Game] addMoney called. Current: ${this.money}, Adding: ${amount}`);
        this.money += amount;
        this.saveMoney();
        this.addChatMessage(`+${amount}G を獲得しました！`, 'system');
    }

    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.saveMoney();
            return true;
        }
        return false;
    }

    saveMoney() {
        localStorage.setItem('webcraft_money', this.money);

        console.log(`[Minecraft] saveMoney called. Amount: ${this.money}`);

        // Save to server
        if (window.GameSaver) {
            // console.log('[Minecraft] GameSaver found, saving to server...');
            GameSaver.save({ money: this.money })
                .then(() => { }) // Silent success
                .catch(e => console.error('[Minecraft] Save failed:', e));
        } else {
            console.warn('[Minecraft] GameSaver NOT found. Cannot save to server.');
        }
        this.updateHUD(); // Immediate update
    }

    openShop() {
        if (this.isDead) return;
        this.isPaused = true;
        document.exitPointerLock();

        if (this.mobileInput.active) {
            const mc = document.getElementById('mobile-controls');
            if (mc) mc.style.display = 'none';
        }

        document.getElementById('shop-screen').style.display = 'flex';
        document.getElementById('shop-money-val').textContent = this.money.toLocaleString();
    }

    closeShop() {
        document.getElementById('shop-screen').style.display = 'none';
        this.isPaused = false;

        if (this.mobileInput.active) {
            const mc = document.getElementById('mobile-controls');
            if (mc) mc.style.display = 'block';
        } else {
            this.canvas.requestPointerLock();
        }
    }

    buyFood(cost, hungerRestore) {
        console.log(`[Game] buyFood called. Cost: ${cost}, Current Money: ${this.money}`);
        if (this.spendMoney(cost)) {
            // Restore Hunger
            const oldHunger = this.player.hunger;
            this.player.hunger = Math.min(this.player.maxHunger, this.player.hunger + hungerRestore);

            this.updateHUD();
            document.getElementById('shop-money-val').textContent = this.money.toLocaleString();

            const restored = this.player.hunger - oldHunger;
            this.addChatMessage(`食料を購入しました！ (空腹度 +${restored})`, 'system');
        } else {
            console.log('[Game] Not enough money to buy food.');
            this.addChatMessage('お金が足りません！', 'error');
        }
    }

    serializeWorld() {
        const chunks = {};
        for (const [key, chunk] of this.chunks) {
            chunks[key] = Array.from(chunk);
        }

        return {
            spawnPos: { ...this.player.position },
            chunks: chunks,
            animals: Array.from(this.animals.values()).map(a => ({
                id: a.id,
                type: a.type,
                x: a.position.x,
                y: a.position.y,
                z: a.position.z
            }))
        };
    }

    deserializeWorld(data) {
        // Clear current
        this.chunks.clear();
        this.dirtyChunks.clear();
        this.blockMeshes.forEach(mesh => this.scene.remove(mesh));
        this.blockMeshes.clear();

        // Remove entities
        this.animals.forEach(a => this.scene.remove(a.mesh));
        this.animals.clear();
        this.entities = []; // clear legacy

        // Restore Chunks
        for (const key in data.chunks) {
            this.chunks.set(key, new Int8Array(data.chunks[key]));
            this.dirtyChunks.add(key);
        }

        // Restore Animals
        if (data.animals && data.animals.length > 0) {
            console.log(`[Game] Restoring ${data.animals.length} animals from save...`);
            data.animals.forEach(d => {
                const animal = new Animal(d.id, d.type, d.x, d.y, d.z);
                this.animals.set(animal.id, animal);
                this.scene.add(animal.mesh);
                if (d.id >= this.nextAnimalId) this.nextAnimalId = d.id + 1;
            });
        } else {
            // Backward compatibility: Spawn new if none found
            console.log('[Game] No animals in save, spawning new ones...');
            this.spawnAnimals();
        }

        // Restore Player (if host)
        if (data.spawnPos) {
            this.player.position.set(data.spawnPos.x, data.spawnPos.y, data.spawnPos.z);
            this.camera.position.copy(this.player.position);
        }

        // Rebuild all chunks
        this.buildAllChunks();
    }

    spawnAnimals() {
        console.log(`[Game] spawnAnimals() called. MIN_ANIMALS: ${MIN_ANIMALS}`);
        for (let i = 0; i < MIN_ANIMALS; i++) {
            const x = Math.floor(Math.random() * WORLD_SIZE * CHUNK_SIZE);
            const z = Math.floor(Math.random() * WORLD_SIZE * CHUNK_SIZE);
            const y = WORLD_HEIGHT; // Start high, let gravity work

            // Random type
            const types = ['pig', 'cow', 'sheep'];
            const type = types[Math.floor(Math.random() * types.length)];

            console.log(`[Game] Spawning animal ${i}: ${type} at ${x},${y},${z}`);
            const animal = new Animal(this.nextAnimalId++, type, x, y, z);
            this.animals.set(animal.id, animal);
            this.scene.add(animal.mesh);
        }
        console.log(`[Game] Total animals spawned: ${this.animals.size}`);
    }

    updateAnimals(dt) {
        const isHost = (!this.network.connected) || this.network.isHost;
        const animalsList = Array.from(this.animals.values()); // Array for indexed access

        // Debug log periodically
        if (this.frameCount % 300 === 0) {
            console.log(`[Game] Updating ${this.animals.size} animals. IsHost: ${isHost}`);
        }

        for (const animal of this.animals.values()) {
            animal.update(dt, this, isHost);
        }

        const MAX_ANIMALS = 300;

        // Reproduction Logic (Host Only)
        if (isHost && this.animals.size < MAX_ANIMALS) {
            for (let i = 0; i < animalsList.length; i++) {
                const a1 = animalsList[i];
                if (a1.reproductionTimer > 0 || !a1.mesh.visible) continue; // Not ready or dead

                for (let j = i + 1; j < animalsList.length; j++) {
                    const a2 = animalsList[j];
                    if (a2.reproductionTimer > 0 || !a2.mesh.visible) continue;
                    if (a1.type !== a2.type) continue; // Same species only

                    const distSq = a1.position.distanceToSquared(a2.position);
                    if (distSq < 1.0) { // Bump
                        // Reproduce!
                        const babyPos = a1.position.clone().lerp(a2.position, 0.5);
                        const baby = new Animal(this.nextAnimalId++, a1.type, babyPos.x, babyPos.y, babyPos.z);
                        baby.mesh.scale.set(0.5, 0.5, 0.5); // Baby is small initially? Logic not in class yet, but fine.

                        // Add to world
                        this.animals.set(baby.id, baby);
                        this.scene.add(baby.mesh);

                        // Reset timers
                        a1.reproductionTimer = 15.0;
                        a2.reproductionTimer = 15.0;
                        baby.reproductionTimer = 20.0; // Babies take longer

                        console.log(`[Game] Reproduction! ${a1.type} baby born. Total: ${this.animals.size}`);

                        if (this.network.connected) {
                            // Sync new animal
                            this.network.sendAnimalUpdate({
                                id: baby.id,
                                type: baby.type,
                                x: baby.position.x,
                                y: baby.position.y,
                                z: baby.position.z,
                                ry: baby.rotation.y
                            });
                        }

                        // Limit one baby per frame per parent to avoid explosion
                        break;
                    }
                }
            }
        }

        if (isHost && this.network.connected) {
            const now = Date.now();
            if (now - this.lastAnimalUpdate > 100) { // 10Hz updates
                this.animals.forEach(animal => {
                    this.network.sendAnimalUpdate({
                        id: animal.id,
                        type: animal.type,
                        x: animal.position.x,
                        y: animal.position.y,
                        z: animal.position.z,
                        ry: animal.rotation.y
                    });
                });
                this.lastAnimalUpdate = now;
            }
        }
    }

    handleAnimalUpdate(data) {
        let animal = this.animals.get(data.id);

        // Handle Damage/Death event
        if (data.type === 'damage') {
            if (animal) animal.flashRed();
            return;
        }
        if (data.type === 'kill') {
            if (animal) {
                this.scene.remove(animal.mesh);
                this.animals.delete(data.id);
                // Particles?
            }
            return;
        }

        if (!animal) {
            // Create if not exists
            animal = new Animal(data.id, data.type, data.x, data.y, data.z);
            this.animals.set(data.id, animal);
            this.scene.add(animal.mesh);
        }

        // Update target pos
        animal.position.set(data.x, data.y, data.z);
        animal.rotation.y = data.ry;
        // animal.mesh.position is updated in animal.update
    }

    damageAnimal(animal, amount) {
        // Can only damage if Host, or send request to Host?
        // Simpler: Client predicts/shows flash, notifies Host 'I hit X'. Host validates.
        // For now: Host Authority.
        if (this.network.isHost || !this.network.connected) {
            animal.health -= amount;
            animal.flashRed();

            // Broadcast damage
            if (this.network.connected) {
                this.network.sendAnimalUpdate({ type: 'damage', id: animal.id });
            }

            if (animal.health <= 0) {
                this.killAnimal(animal);
            }
        } else {
            // Client sends attack request
            this.network.sendAnimalUpdate({ type: 'attack', id: animal.id, amount: amount });
        }
    }

    killAnimal(animal) {
        console.log(`[Game] Animal ${animal.id} killed!`);
        this.scene.remove(animal.mesh);
        this.animals.delete(animal.id);

        this.addMoney(100);

        if (this.network.connected && this.network.isHost) {
            this.network.sendAnimalUpdate({ type: 'kill', id: animal.id });
        }
    }

    toggleScope() {
        this.isScoped = !this.isScoped;
        const overlay = document.getElementById('scope-overlay');
        const crosshair = document.getElementById('crosshair');

        if (this.isScoped) {
            this.camera.fov = this.scopeFOV;
            if (overlay) overlay.style.display = 'block';
            if (crosshair) crosshair.style.display = 'none';
        } else {
            this.camera.fov = this.defaultFOV;
            if (overlay) overlay.style.display = 'none';
            if (crosshair) crosshair.style.display = 'block';
        }
        this.camera.updateProjectionMatrix();
    }

    shootShotgun() {
        if (Date.now() - this.lastFireTime < 800) return;
        this.lastFireTime = Date.now();
        console.log('[Game] Shotgun fired!');

        // Pellets
        const pelletCount = 8;
        const spreadAmt = 0.08;
        const range = 30;

        for (let i = 0; i < pelletCount; i++) {
            // Random spread vector
            const spread = new THREE.Vector3(
                (Math.random() - 0.5) * spreadAmt,
                (Math.random() - 0.5) * spreadAmt,
                (Math.random() - 0.5) * spreadAmt
            );

            // Raycaster setup
            const raycaster = new THREE.Raycaster();
            // Start from camera
            raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

            // Apply spread to ray direction
            raycaster.ray.direction.add(spread).normalize();
            raycaster.far = range;

            // Targets
            const meshes = [];
            this.animals.forEach(a => { if (a.mesh) meshes.push(a.mesh); });
            this.otherPlayers.forEach(p => { if (p.mesh) meshes.push(p.mesh); });

            const intersects = raycaster.intersectObjects(meshes, true);

            let endPoint;

            if (intersects.length > 0) {
                endPoint = intersects[0].point;
                const hit = intersects[0];

                // Find Entity
                let hitAnimal = null;
                for (const animal of this.animals.values()) {
                    let current = hit.object;
                    while (current) {
                        if (current === animal.mesh) {
                            hitAnimal = animal;
                            break;
                        }
                        current = current.parent;
                    }
                    if (hitAnimal) break;
                }

                if (hitAnimal) {
                    // console.log('[Game] Shotgun hit entity:', hitAnimal.id);
                    // Damage per pellet
                    const dmg = 4;
                    if (this.network.isHost || !this.network.connected) {
                        // Host
                        hitAnimal.health -= dmg;
                        hitAnimal.flashRed();
                        if (this.network.connected) this.network.sendAnimalUpdate({ type: 'damage', id: hitAnimal.id, amount: dmg });
                        if (hitAnimal.health <= 0) this.killAnimal(hitAnimal);
                    } else {
                        // Client
                        if (this.network.connected) this.network.sendAnimalUpdate({ type: 'damage', id: hitAnimal.id, amount: dmg });
                    }
                }

            } else {
                // Miss point
                endPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.multiplyScalar(range));
            }

            // Visual Tracer
            const startPoint = this.player.position.clone().add(new THREE.Vector3(0, 1.3, 0));
            // Slight offset right/down
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
            startPoint.add(right.multiplyScalar(0.2));

            const material = new THREE.LineBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.6 });
            const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
            const line = new THREE.Line(geometry, material);
            this.scene.add(line);

            setTimeout(() => {
                this.scene.remove(line);
                geometry.dispose();
                material.dispose();
            }, 80);
        }
    }

    shootSniper() {
        if (Date.now() - this.lastFireTime < 1000) return;
        this.lastFireTime = Date.now();
        console.log('[Game] Sniper shot!');

        // Raycasting
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        raycaster.far = 200;

        const meshes = [];
        // Add Animals (Fix: verify we are adding the Group mesh)
        this.animals.forEach(animal => {
            if (animal.mesh) meshes.push(animal.mesh);
        });
        // Add Players
        this.otherPlayers.forEach(p => {
            if (p.mesh) meshes.push(p.mesh);
        });

        // Add block meshes for wall collisions
        // Getting all blocks is too heavy. We should use the generic getTargetBlock or a simplified check.
        // For visual tracer, we'll just check entities + max distance for now.

        // Recursive: true is important because animal mesh is a Group containing parts
        const intersects = raycaster.intersectObjects(meshes, true);

        // Calculate end point for tracer
        let endPoint;
        if (intersects.length > 0) {
            endPoint = intersects[0].point;

            // Handle Hit
            const hit = intersects[0];
            // Find root object (Animal Mesh Group)
            let obj = hit.object;
            // Traverse up until we find the object directly inside the Scene (which is the animal.mesh group)
            // Or until we find an object that matches an animal's mesh

            // Optimization: Map lookups
            let hitAnimal = null;
            // Iterate all animals to find which one owns this mesh
            // (Since obj.parent climbing might be tricky if structure changes)
            for (const animal of this.animals.values()) {
                // Check if obj is the animal mesh or a child of it
                let current = obj;
                while (current) {
                    if (current === animal.mesh) {
                        hitAnimal = animal;
                        break;
                    }
                    current = current.parent;
                }
                if (hitAnimal) break;
            }

            const entity = hitAnimal; // Compatible with previous variable name
            if (entity) {
                console.log('[Game] Sniped entity:', entity.id);
                if (typeof entity.takeDamage === 'function') {
                    const remainingHealth = entity.takeDamage(20);

                    // Host logic: check for death immediately
                    if (this.network.isHost || !this.network.connected) {
                        if (remainingHealth <= 0) {
                            this.killAnimal(entity);
                        } else {
                            if (this.network.connected) this.network.sendAnimalUpdate({ type: 'damage', id: entity.id, amount: 20 });
                        }
                    } else {
                        // Client logic: just tell host we hit it
                        if (this.network.connected) {
                            this.network.sendAnimalUpdate({ type: 'damage', id: entity.id, amount: 20 });
                        }
                    }
                }
            }
        } else {
            // Miss - point far away
            const dir = new THREE.Vector3();
            this.camera.getWorldDirection(dir);
            endPoint = this.camera.position.clone().add(dir.multiplyScalar(100));
        }

        // Draw Tracer (Yellow Beam)
        const startPoint = this.player.position.clone().add(new THREE.Vector3(0, 1.4, 0)); // Slightly below eyes
        // Adjust start point to be slightly roughly where a gun would be (right side)
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        startPoint.add(right.multiplyScalar(0.2));

        const material = new THREE.LineBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.8 });
        const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);

        // Remove after 100ms
        setTimeout(() => {
            this.scene.remove(line);
            geometry.dispose();
            material.dispose();
        }, 100);
    }

    shootArrow() {
        const vel = new THREE.Vector3(0, 0, -1);
        vel.applyQuaternion(this.camera.quaternion);
        vel.multiplyScalar(20); // Arrow Speed

        const p = new Projectile(
            this.player.position.x,
            this.player.position.y + 1.5,
            this.player.position.z,
            vel,
            this.network.playerId,
            'arrow'
        );
        this.projectiles.push(p);
        this.scene.add(p.mesh);

        // TODO: Sync projectiles? For now local only (but hits register on Host if implemented right)
        // Actually, if Client shoots, Client detects hit -> sends 'attack' to Host.
    }

    shootRocket() {
        if (Date.now() - this.lastFireTime < 1000) return;
        this.lastFireTime = Date.now();

        const vel = new THREE.Vector3(0, 0, -1);
        vel.applyQuaternion(this.camera.quaternion);
        vel.multiplyScalar(15); // Slower than Arrow

        const p = new Projectile(
            this.player.position.x,
            this.player.position.y + 1.5,
            this.player.position.z,
            vel,
            this.network.playerId,
            'rocket'
        );
        this.projectiles.push(p);
        this.scene.add(p.mesh);
    }

    explode(pos, radius = 4) {
        console.log(`[Game] Boom at ${pos.x}, ${pos.y}, ${pos.z}`);
        // Remove blocks
        const cx = Math.floor(pos.x);
        const cy = Math.floor(pos.y);
        const cz = Math.floor(pos.z);
        const r = Math.floor(radius);

        for (let x = -r; x <= r; x++) {
            for (let y = -r; y <= r; y++) {
                for (let z = -r; z <= r; z++) {
                    if (x * x + y * y + z * z <= r * r) {
                        this.setBlock(cx + x, cy + y, cz + z, BLOCK_TYPES.AIR);
                    }
                }
            }
        }

        // Damage Entities (High damage)
        for (const animal of this.animals.values()) {
            if (animal.position.distanceTo(pos) < radius + 2) {
                this.damageAnimal(animal, 20); // Boom!
            }
        }
    }

    attackEntity() {
        // Raycast for melee
        const dir = new THREE.Vector3(0, 0, -1);
        dir.applyQuaternion(this.camera.quaternion);
        this.raycaster.set(this.camera.position, dir);
        this.raycaster.far = 3.0; // Reach

        for (const animal of this.animals.values()) {
            // Simple box check or distance
            const dist = this.player.position.distanceTo(animal.position);
            if (dist < 3.5) {
                // Check if looking at it
                const lookAt = animal.position.clone().sub(this.camera.position).normalize();
                const angle = dir.angleTo(lookAt);
                if (angle < 0.5) { // ~30 degrees
                    const dmg = this.selectedSlot === 0 ? 5 : 1; // Slot 0 is Sword (Sword icon at 0?)
                    // Check hotbar config: Sword is slot separate? 
                    // In setupControls: 1-9 keys map to 0-8 slots.
                    // Slot 0 is Sword icon in index.php? Yes.

                    this.damageAnimal(animal, dmg);

                    // Attack animation?
                    return;
                }
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Debug: Log every 60 frames to confirm loop is running
        if (this.frameCount % 60 === 0) {
            // console.log(`[Game] Animate loop running. Paused: ${this.isPaused}, PointerLocked: ${this.isPointerLocked}`);
        }

        const dt = Math.min(this.clock.getDelta(), 0.1);

        if (!this.isPaused) {
            this.updatePlayer(dt);
            this.updateAnimals(dt);

            // Update Projectiles
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const p = this.projectiles[i];
                p.update(dt, this);
                if (!p.active) {
                    this.scene.remove(p.mesh);
                    this.projectiles.splice(i, 1);
                }
            }
        }

        this.frameCount++;
        if (performance.now() - this.lastFpsUpdate > 1000) {
            document.getElementById('fps').textContent = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = performance.now();
        }
        this.renderer.render(this.scene, this.camera);
    }
}

class Projectile {
    constructor(x, y, z, velocity, ownerId, type = 'arrow') {
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = velocity;
        this.ownerId = ownerId;
        this.type = type; // 'arrow' or 'rocket'
        this.active = true;
        this.lifeTime = 5.0; // seconds

        // Mesh
        const geometry = type === 'rocket' ?
            new THREE.BoxGeometry(0.2, 0.2, 0.4) :
            new THREE.BoxGeometry(0.1, 0.1, 0.5);
        const color = type === 'rocket' ? 0xFF0000 : 0xFFFFFF;

        this.mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ color: color })
        );
        this.mesh.position.copy(this.position);
        this.mesh.lookAt(this.position.clone().add(this.velocity));
    }

    update(dt, world) {
        if (!this.active) return;

        this.lifeTime -= dt;
        if (this.lifeTime <= 0) {
            this.active = false;
            return;
        }

        // Gravity (Less for rocket?)
        this.velocity.y -= 9.8 * dt;

        // Move
        const nextPos = this.position.clone().add(this.velocity.clone().multiplyScalar(dt));

        // Collision Check (Block)
        if (world.getBlock(Math.floor(nextPos.x), Math.floor(nextPos.y), Math.floor(nextPos.z)) > 0) {
            this.active = false;
            if (this.type === 'rocket') {
                world.explode(nextPos);
            }
            return; // Stuck in block
        }

        // Entity Collision (Animals)
        if (world.animals) {
            for (const animal of world.animals.values()) {
                const dist = nextPos.distanceTo(animal.position);
                if (dist < 1.0) { // Hit
                    if (this.type === 'rocket') {
                        world.explode(nextPos);
                    } else {
                        // Arrow
                        world.damageAnimal(animal, 5);
                    }
                    this.active = false;
                    return;
                }
            }
        }

        this.position.copy(nextPos);
        this.mesh.position.copy(this.position);
        this.mesh.lookAt(this.position.clone().add(this.velocity));
    }
}

window.addEventListener('DOMContentLoaded', () => { window.game = new MinecraftGame(); });
