/**
 * WebCraft - Minecraft Clone
 * Survival Mode with Real P2P Multiplayer
 */

// ===== Block Types =====
const BLOCK_TYPES = {
    AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, WOOD: 4, LEAVES: 5,
    SAND: 6, COBBLESTONE: 7, PLANKS: 8, BRICK: 9, WATER: 10, BEDROCK: 11,
    COAL_ORE: 12, IRON_ORE: 13, GOLD_ORE: 14, DIAMOND_ORE: 15
};

const BLOCK_COLORS = {
    [BLOCK_TYPES.GRASS]: 0x4ade80, [BLOCK_TYPES.DIRT]: 0x854d0e,
    [BLOCK_TYPES.STONE]: 0x71717a, [BLOCK_TYPES.WOOD]: 0x78350f,
    [BLOCK_TYPES.LEAVES]: 0x22c55e, [BLOCK_TYPES.SAND]: 0xfcd34d,
    [BLOCK_TYPES.COBBLESTONE]: 0x52525b, [BLOCK_TYPES.PLANKS]: 0xa16207,
    [BLOCK_TYPES.BRICK]: 0xb91c1c, [BLOCK_TYPES.WATER]: 0x3b82f6,
    [BLOCK_TYPES.BEDROCK]: 0x1f1f1f, [BLOCK_TYPES.COAL_ORE]: 0x3f3f3f,
    [BLOCK_TYPES.IRON_ORE]: 0xd4a574, [BLOCK_TYPES.GOLD_ORE]: 0xffd700,
    [BLOCK_TYPES.DIAMOND_ORE]: 0x00ffff
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
const MOUSE_SENSITIVITY = 0.002;
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
        this.gameMode = 'solo';

        this.chunks = new Map();
        this.blockMeshes = new Map();
        this.dirtyChunks = new Set();

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
            BLOCK_TYPES.GRASS, BLOCK_TYPES.DIRT, BLOCK_TYPES.STONE,
            BLOCK_TYPES.WOOD, BLOCK_TYPES.PLANKS, BLOCK_TYPES.COBBLESTONE,
            BLOCK_TYPES.BRICK, BLOCK_TYPES.SAND, BLOCK_TYPES.LEAVES
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

        this.highlightMesh = null;

        this.canvas = document.getElementById('game-canvas');
        this.loadingScreen = document.getElementById('loading-screen');
        this.menuScreen = document.getElementById('menu-screen');
        this.hud = document.getElementById('hud');
        this.pauseMenu = document.getElementById('pause-menu');
        this.deathScreen = document.getElementById('death-screen');

        this.init();
    }

    async init() {
        this.updateLoadingText('Initializing...');
        await this.delay(200);

        this.initThreeJS();
        this.updateLoadingText('Preparing...');
        await this.delay(100);

        this.setupControls();
        this.setupNetworkCallbacks();
        this.setupMenu();

        this.loadingScreen.style.display = 'none';
        this.menuScreen.style.display = 'flex';

        this.animate();
    }

    delay(ms) { return new Promise(r => setTimeout(r, ms)); }
    updateLoadingText(t) { document.getElementById('loading-text').textContent = t; }

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

        for (let cx = 0; cx < WORLD_SIZE; cx++) {
            for (let cz = 0; cz < WORLD_SIZE; cz++) {
                this.generateChunk(cx, cz);
            }
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

        for (const [key, arr] of Object.entries(worldData)) {
            this.chunks.set(key, new Uint8Array(arr));
        }

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
            this.keys[e.code] = true;
            if (this.isPlaying && !this.isPaused && !this.isDead) {
                if (e.code >= 'Digit1' && e.code <= 'Digit9') this.selectSlot(parseInt(e.code[5]) - 1);
                if (e.code === 'KeyT') { e.preventDefault(); this.toggleChat(); }
            }
            if (e.code === 'Escape' && this.isPlaying) this.togglePause();
        });

        document.addEventListener('keyup', e => { this.keys[e.code] = false; });

        document.addEventListener('mousemove', e => {
            if (this.isPointerLocked && !this.isDead) {
                this.player.rotation.y -= e.movementX * MOUSE_SENSITIVITY;
                this.player.rotation.x -= e.movementY * MOUSE_SENSITIVITY;
                this.player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.rotation.x));
            }
        });

        this.canvas.addEventListener('mousedown', e => {
            if (!this.isPointerLocked) { this.canvas.requestPointerLock(); return; }
            if (this.isDead) return;
            if (e.button === 0) this.breakBlock();
            else if (e.button === 2) this.placeBlock();
        });

        this.canvas.addEventListener('contextmenu', e => e.preventDefault());

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
            if (!this.isPointerLocked && this.isPlaying && !this.isPaused && !this.isDead) this.togglePause();
        });

        this.canvas.addEventListener('wheel', e => {
            if (this.isPlaying && !this.isPaused && !this.isDead) {
                let s = this.selectedSlot + (e.deltaY > 0 ? 1 : -1);
                if (s < 0) s = 8; if (s > 8) s = 0;
                this.selectSlot(s);
            }
        });
    }

    setupMenu() {
        const playBtn = document.getElementById('play-btn');
        const resumeBtn = document.getElementById('resume-btn');
        const quitBtn = document.getElementById('quit-btn');
        const respawnBtn = document.getElementById('respawn-btn');
        const nameInput = document.getElementById('player-name');
        const roomInput = document.getElementById('room-code-input');
        const joinSection = document.getElementById('join-section');
        const modeTabs = document.querySelectorAll('.mode-tab');
        const copyBtn = document.getElementById('copy-room-code');

        modeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                modeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.gameMode = tab.dataset.mode;
                joinSection.style.display = this.gameMode === 'join' ? 'block' : 'none';
            });
        });

        playBtn.addEventListener('click', () => {
            this.playerName = nameInput.value || 'Player';
            const code = roomInput.value.trim().toUpperCase();
            this.startGame(this.gameMode, code);
        });

        nameInput.addEventListener('keypress', e => { if (e.key === 'Enter') playBtn.click(); });

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const code = document.getElementById('room-code-text').textContent;
                navigator.clipboard.writeText(code).then(() => {
                    copyBtn.textContent = '✅';
                    setTimeout(() => copyBtn.textContent = '📋', 1500);
                });
            });
        }

        resumeBtn.addEventListener('click', () => this.togglePause());
        quitBtn.addEventListener('click', () => this.quitGame());
        respawnBtn.addEventListener('click', () => this.respawn());
    }

    setupNetworkCallbacks() {
        this.network.on('playerJoin', (player) => {
            console.log('[Game] Player joined:', player.name);
            this.addOtherPlayer(player);
            this.addChatMessage(`${player.name} が参加しました`, 'system');

            // If we're host, send world to new player
            if (this.network.isHost) {
                const worldData = {};
                this.chunks.forEach((chunk, key) => {
                    worldData[key] = Array.from(chunk);
                });
                this.network.sendWorldToPlayer(worldData, {
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

        this.network.on('fullWorldSync', (data) => {
            console.log('[Game] Received full world from host');
            this.loadWorldFromData(data.chunks);
            if (data.spawnPos) {
                this.player.position.set(data.spawnPos.x, data.spawnPos.y + 2, data.spawnPos.z);
            }
            this.findSpawnPosition();

            // Add host as a player we can see
            this.addHostPlayer();
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

    async startGame(mode, roomCode) {
        this.gameMode = mode;
        this.updateLoadingText('接続中...');
        this.loadingScreen.style.display = 'flex';
        this.menuScreen.style.display = 'none';

        try {
            const result = await this.network.connect(this.playerName, mode, roomCode || null);
            console.log('[Game] Connected:', result);

            // Only generate world if solo or host
            if (mode === 'solo' || mode === 'host') {
                this.updateLoadingText('ワールド生成中...');
                this.generateWorld();
                this.buildAllChunks();
            } else {
                // Guest waits for world from host
                this.updateLoadingText('ワールドを受信中...');
                // World will be received via fullWorldSync callback
            }

            await this.delay(500);

            this.isPlaying = true;
            this.isPaused = false;
            this.isDead = false;
            this.player.health = 20;
            this.player.hunger = 20;
            this.lastHungerDecrease = Date.now();

            this.loadingScreen.style.display = 'none';
            this.hud.style.display = 'block';

            if (mode !== 'join') {
                this.findSpawnPosition();
            }

            this.canvas.requestPointerLock();

        } catch (err) {
            console.error('[Game] Connection failed:', err);
            this.loadingScreen.style.display = 'none';
            this.menuScreen.style.display = 'flex';
            alert('接続に失敗しました: ' + err.message);
        }
    }

    findSpawnPosition() {
        const cx = CHUNK_SIZE * WORLD_SIZE / 2;
        const cz = CHUNK_SIZE * WORLD_SIZE / 2;

        for (let y = WORLD_HEIGHT - 1; y > 0; y--) {
            const b = this.getBlock(cx, y, cz);
            if (b !== BLOCK_TYPES.AIR && b !== BLOCK_TYPES.WATER) {
                this.player.position.set(cx + 0.5, y + 2, cz + 0.5);
                this.player.lastY = y + 2;
                this.player.velocity.set(0, 0, 0);
                break;
            }
        }
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
        this.canvas.requestPointerLock();
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
        div.appendChild(el);
        div.scrollTop = div.scrollHeight;
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 10000);
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
        const mv = new THREE.Vector3();
        if (this.keys['KeyW']) mv.z = -1;
        if (this.keys['KeyS']) mv.z = 1;
        if (this.keys['KeyA']) mv.x = -1;
        if (this.keys['KeyD']) mv.x = 1;

        if (mv.length() > 0) {
            mv.normalize();
            const cos = Math.cos(this.player.rotation.y), sin = Math.sin(this.player.rotation.y);
            const nx = mv.x * cos + mv.z * sin;
            const nz = -mv.x * sin + mv.z * cos;
            mv.x = nx; mv.z = nz;
        }

        const spd = this.keys['ShiftLeft'] ? MOVE_SPEED * 0.4 : MOVE_SPEED;
        this.player.velocity.x = mv.x * spd;
        this.player.velocity.z = mv.z * spd;

        if (this.keys['Space'] && this.player.onGround) {
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
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = Math.min(this.clock.getDelta(), 0.1);
        this.updatePlayer(dt);
        this.frameCount++;
        if (performance.now() - this.lastFpsUpdate > 1000) {
            document.getElementById('fps').textContent = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = performance.now();
        }
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => { window.game = new MinecraftGame(); });
