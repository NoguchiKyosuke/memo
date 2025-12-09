/**
 * WebCraft - Minecraft Clone Game Engine
 * Built with Three.js
 * Survival Mode with P2P Multiplayer
 */

// ===== Block Types =====
const BLOCK_TYPES = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    SAND: 6,
    COBBLESTONE: 7,
    PLANKS: 8,
    BRICK: 9,
    WATER: 10,
    BEDROCK: 11
};

const BLOCK_COLORS = {
    [BLOCK_TYPES.GRASS]: 0x4ade80,
    [BLOCK_TYPES.DIRT]: 0x854d0e,
    [BLOCK_TYPES.STONE]: 0x71717a,
    [BLOCK_TYPES.WOOD]: 0x78350f,
    [BLOCK_TYPES.LEAVES]: 0x22c55e,
    [BLOCK_TYPES.SAND]: 0xfcd34d,
    [BLOCK_TYPES.COBBLESTONE]: 0x52525b,
    [BLOCK_TYPES.PLANKS]: 0xa16207,
    [BLOCK_TYPES.BRICK]: 0xb91c1c,
    [BLOCK_TYPES.WATER]: 0x3b82f6,
    [BLOCK_TYPES.BEDROCK]: 0x1f1f1f
};

// ===== Game Constants =====
const CHUNK_SIZE = 16;
const WORLD_SIZE = 8;
const WORLD_HEIGHT = 64;
const SEA_LEVEL = 20;
const GRAVITY = 25;
const JUMP_FORCE = 10;
const MOVE_SPEED = 6;
const MOUSE_SENSITIVITY = 0.002;
const PLAYER_HEIGHT = 1.8;
const PLAYER_WIDTH = 0.6;

// Survival constants
const HUNGER_DECREASE_INTERVAL = 30000; // 30 seconds
const HUNGER_DAMAGE_INTERVAL = 5000; // 5 seconds when starving
const FALL_DAMAGE_THRESHOLD = 4; // blocks
const FALL_DAMAGE_MULTIPLIER = 2; // damage per block

// ===== Main Game Class =====
class MinecraftGame {
    constructor() {
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Game state
        this.isPlaying = false;
        this.isPaused = false;
        this.isDead = false;
        this.playerName = 'Player';
        this.gameMode = 'solo';

        // World data
        this.chunks = new Map();
        this.blockMeshes = new Map();

        // Player state
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
            fallDistance: 0
        };

        // Controls
        this.keys = {};
        this.isPointerLocked = false;
        this.selectedSlot = 0;
        this.hotbarBlocks = [
            BLOCK_TYPES.GRASS,
            BLOCK_TYPES.DIRT,
            BLOCK_TYPES.STONE,
            BLOCK_TYPES.WOOD,
            BLOCK_TYPES.LEAVES,
            BLOCK_TYPES.SAND,
            BLOCK_TYPES.COBBLESTONE,
            BLOCK_TYPES.PLANKS,
            BLOCK_TYPES.BRICK
        ];

        // Raycaster for block interaction
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 5;

        // Network
        this.network = new NetworkClient();
        this.otherPlayers = new Map();

        // Noise generator for terrain
        this.noise = new SimplexNoise();

        // Performance
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.lastPositionUpdate = 0;

        // Survival timers
        this.lastHungerDecrease = 0;
        this.lastStarvingDamage = 0;

        // Block highlight
        this.highlightMesh = null;

        // DOM elements
        this.canvas = document.getElementById('game-canvas');
        this.loadingScreen = document.getElementById('loading-screen');
        this.menuScreen = document.getElementById('menu-screen');
        this.hud = document.getElementById('hud');
        this.pauseMenu = document.getElementById('pause-menu');
        this.deathScreen = document.getElementById('death-screen');

        this.init();
    }

    async init() {
        this.updateLoadingText('Initializing engine...');
        await this.delay(300);

        this.initThreeJS();
        this.updateLoadingText('Creating world...');
        await this.delay(200);

        this.generateWorld();
        this.updateLoadingText('Building terrain...');
        await this.delay(200);

        this.buildAllChunks();
        this.updateLoadingText('Setting up controls...');
        await this.delay(100);

        this.setupControls();
        this.setupNetworkCallbacks();
        this.setupMenu();

        this.loadingScreen.style.display = 'none';
        this.menuScreen.style.display = 'flex';

        this.animate();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateLoadingText(text) {
        document.getElementById('loading-text').textContent = text;
    }

    initThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 150);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
        this.camera.position.copy(this.player.position);
        this.camera.position.y += PLAYER_HEIGHT - 0.2;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        this.scene.add(directionalLight);

        // Block highlight
        const highlightGeo = new THREE.BoxGeometry(1.02, 1.02, 1.02);
        const highlightMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        this.highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
        this.highlightMesh.visible = false;
        this.scene.add(this.highlightMesh);

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    generateWorld() {
        for (let cx = 0; cx < WORLD_SIZE; cx++) {
            for (let cz = 0; cz < WORLD_SIZE; cz++) {
                this.generateChunk(cx, cz);
            }
        }
    }

    generateChunk(cx, cz) {
        const chunkKey = `${cx},${cz}`;
        const chunk = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = cx * CHUNK_SIZE + x;
                const worldZ = cz * CHUNK_SIZE + z;
                const height = this.getTerrainHeight(worldX, worldZ);

                for (let y = 0; y < WORLD_HEIGHT; y++) {
                    const index = x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;

                    if (y === 0) {
                        chunk[index] = BLOCK_TYPES.BEDROCK;
                    } else if (y < height - 4) {
                        chunk[index] = BLOCK_TYPES.STONE;
                    } else if (y < height - 1) {
                        chunk[index] = BLOCK_TYPES.DIRT;
                    } else if (y < height) {
                        chunk[index] = y < SEA_LEVEL ? BLOCK_TYPES.SAND : BLOCK_TYPES.GRASS;
                    } else if (y < SEA_LEVEL) {
                        chunk[index] = BLOCK_TYPES.WATER;
                    } else {
                        chunk[index] = BLOCK_TYPES.AIR;
                    }
                }

                // Trees
                if (height > SEA_LEVEL + 1 && Math.random() < 0.008) {
                    this.generateTree(chunk, x, height, z);
                }
            }
        }

        this.chunks.set(chunkKey, chunk);
    }

    getTerrainHeight(x, z) {
        const scale1 = 0.02;
        const scale2 = 0.05;
        const noise1 = this.noise.noise2D(x * scale1, z * scale1) * 15;
        const noise2 = this.noise.noise2D(x * scale2, z * scale2) * 8;
        return Math.floor(SEA_LEVEL + 5 + noise1 + noise2);
    }

    generateTree(chunk, x, baseY, z) {
        if (x < 2 || x > CHUNK_SIZE - 3 || z < 2 || z > CHUNK_SIZE - 3) return;

        const treeHeight = 4 + Math.floor(Math.random() * 2);

        // Trunk
        for (let y = 0; y < treeHeight; y++) {
            const index = x + (baseY + y) * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
            if (baseY + y < WORLD_HEIGHT) chunk[index] = BLOCK_TYPES.WOOD;
        }

        // Leaves
        const leafStart = baseY + treeHeight - 2;
        for (let ly = 0; ly < 3; ly++) {
            const radius = ly === 2 ? 1 : 2;
            for (let lx = -radius; lx <= radius; lx++) {
                for (let lz = -radius; lz <= radius; lz++) {
                    if (Math.abs(lx) === radius && Math.abs(lz) === radius && Math.random() > 0.5) continue;
                    const nx = x + lx, ny = leafStart + ly, nz = z + lz;
                    if (nx >= 0 && nx < CHUNK_SIZE && ny < WORLD_HEIGHT && nz >= 0 && nz < CHUNK_SIZE) {
                        const index = nx + ny * CHUNK_SIZE + nz * CHUNK_SIZE * WORLD_HEIGHT;
                        if (chunk[index] === BLOCK_TYPES.AIR) chunk[index] = BLOCK_TYPES.LEAVES;
                    }
                }
            }
        }
    }

    buildAllChunks() {
        for (let cx = 0; cx < WORLD_SIZE; cx++) {
            for (let cz = 0; cz < WORLD_SIZE; cz++) {
                this.buildChunkMesh(cx, cz);
            }
        }
    }

    buildChunkMesh(cx, cz) {
        const chunkKey = `${cx},${cz}`;
        const chunk = this.chunks.get(chunkKey);
        if (!chunk) return;

        // Remove old mesh
        const oldMesh = this.blockMeshes.get(chunkKey);
        if (oldMesh) {
            this.scene.remove(oldMesh);
            if (oldMesh.children) {
                oldMesh.children.forEach(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
            }
        }

        const matrices = {};

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const index = x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
                    const blockType = chunk[index];

                    if (blockType === BLOCK_TYPES.AIR || blockType === BLOCK_TYPES.WATER) continue;
                    if (!this.isBlockExposed(cx, cz, x, y, z)) continue;

                    if (!matrices[blockType]) matrices[blockType] = [];

                    const worldX = cx * CHUNK_SIZE + x;
                    const worldZ = cz * CHUNK_SIZE + z;

                    const matrix = new THREE.Matrix4();
                    matrix.setPosition(worldX + 0.5, y + 0.5, worldZ + 0.5);
                    matrices[blockType].push(matrix);
                }
            }
        }

        const chunkGroup = new THREE.Group();

        for (const [blockType, matrixList] of Object.entries(matrices)) {
            if (matrixList.length === 0) continue;

            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const isLeaves = parseInt(blockType) === BLOCK_TYPES.LEAVES;
            const material = new THREE.MeshLambertMaterial({
                color: BLOCK_COLORS[blockType] || 0xff00ff,
                transparent: isLeaves,
                opacity: isLeaves ? 0.85 : 1
            });

            const instancedMesh = new THREE.InstancedMesh(geometry, material, matrixList.length);
            matrixList.forEach((matrix, i) => instancedMesh.setMatrixAt(i, matrix));
            instancedMesh.instanceMatrix.needsUpdate = true;

            chunkGroup.add(instancedMesh);
        }

        this.scene.add(chunkGroup);
        this.blockMeshes.set(chunkKey, chunkGroup);
    }

    isBlockExposed(cx, cz, x, y, z) {
        const neighbors = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

        for (const [dx, dy, dz] of neighbors) {
            const nx = x + dx, ny = y + dy, nz = z + dz;
            if (ny < 0 || ny >= WORLD_HEIGHT) return true;

            let neighborBlock;
            if (nx < 0 || nx >= CHUNK_SIZE || nz < 0 || nz >= CHUNK_SIZE) {
                const ncx = cx + (nx < 0 ? -1 : nx >= CHUNK_SIZE ? 1 : 0);
                const ncz = cz + (nz < 0 ? -1 : nz >= CHUNK_SIZE ? 1 : 0);
                const nnx = ((nx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                const nnz = ((nz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                const neighborChunk = this.chunks.get(`${ncx},${ncz}`);
                if (!neighborChunk) return true;
                neighborBlock = neighborChunk[nnx + ny * CHUNK_SIZE + nnz * CHUNK_SIZE * WORLD_HEIGHT];
            } else {
                neighborBlock = this.chunks.get(`${cx},${cz}`)[nx + ny * CHUNK_SIZE + nz * CHUNK_SIZE * WORLD_HEIGHT];
            }

            if (neighborBlock === BLOCK_TYPES.AIR || neighborBlock === BLOCK_TYPES.WATER || neighborBlock === BLOCK_TYPES.LEAVES) {
                return true;
            }
        }
        return false;
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= WORLD_HEIGHT) return BLOCK_TYPES.AIR;
        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const lx = ((Math.floor(x) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((Math.floor(z) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const chunk = this.chunks.get(`${cx},${cz}`);
        if (!chunk) return BLOCK_TYPES.AIR;
        return chunk[lx + Math.floor(y) * CHUNK_SIZE + lz * CHUNK_SIZE * WORLD_HEIGHT];
    }

    setBlock(x, y, z, blockType, fromNetwork = false) {
        if (y < 0 || y >= WORLD_HEIGHT) return;

        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const lx = ((Math.floor(x) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((Math.floor(z) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunkKey = `${cx},${cz}`;
        const chunk = this.chunks.get(chunkKey);
        if (!chunk) return;

        const index = lx + Math.floor(y) * CHUNK_SIZE + lz * CHUNK_SIZE * WORLD_HEIGHT;
        chunk[index] = blockType;

        // Rebuild this chunk and neighbors
        this.buildChunkMesh(cx, cz);
        if (lx === 0) this.buildChunkMesh(cx - 1, cz);
        if (lx === CHUNK_SIZE - 1) this.buildChunkMesh(cx + 1, cz);
        if (lz === 0) this.buildChunkMesh(cx, cz - 1);
        if (lz === CHUNK_SIZE - 1) this.buildChunkMesh(cx, cz + 1);

        // Send to network (only if not from network)
        if (!fromNetwork) {
            this.network.sendBlockChange(Math.floor(x), Math.floor(y), Math.floor(z), blockType);
        }
    }

    setupControls() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (this.isPlaying && !this.isPaused && !this.isDead) {
                if (e.code >= 'Digit1' && e.code <= 'Digit9') {
                    this.selectSlot(parseInt(e.code.charAt(5)) - 1);
                }
                if (e.code === 'KeyT') {
                    e.preventDefault();
                    this.toggleChat();
                }
            }

            if (e.code === 'Escape' && this.isPlaying) {
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse movement - FIXED direction
        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked && !this.isDead) {
                this.player.rotation.y -= e.movementX * MOUSE_SENSITIVITY;
                this.player.rotation.x -= e.movementY * MOUSE_SENSITIVITY;
                this.player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.rotation.x));
            }
        });

        // Mouse click
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.isPointerLocked) {
                this.canvas.requestPointerLock();
                return;
            }
            if (this.isDead) return;

            if (e.button === 0) this.breakBlock();
            else if (e.button === 2) this.placeBlock();
        });

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
            if (!this.isPointerLocked && this.isPlaying && !this.isPaused && !this.isDead) {
                this.togglePause();
            }
        });

        // Scroll for hotbar
        this.canvas.addEventListener('wheel', (e) => {
            if (this.isPlaying && !this.isPaused && !this.isDead) {
                let newSlot = this.selectedSlot + (e.deltaY > 0 ? 1 : -1);
                if (newSlot < 0) newSlot = 8;
                if (newSlot > 8) newSlot = 0;
                this.selectSlot(newSlot);
            }
        });
    }

    setupMenu() {
        const playBtn = document.getElementById('play-btn');
        const resumeBtn = document.getElementById('resume-btn');
        const quitBtn = document.getElementById('quit-btn');
        const respawnBtn = document.getElementById('respawn-btn');
        const playerNameInput = document.getElementById('player-name');
        const roomCodeInput = document.getElementById('room-code-input');
        const joinSection = document.getElementById('join-section');
        const modeTabs = document.querySelectorAll('.mode-tab');
        const copyBtn = document.getElementById('copy-room-code');

        // Mode tabs
        modeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                modeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.gameMode = tab.dataset.mode;
                joinSection.style.display = this.gameMode === 'join' ? 'block' : 'none';
            });
        });

        // Play button
        playBtn.addEventListener('click', () => {
            this.playerName = playerNameInput.value || 'Player';
            const roomCode = roomCodeInput.value.trim().toUpperCase();
            this.startGame(this.gameMode, roomCode);
        });

        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                playBtn.click();
            }
        });

        // Copy room code
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
            this.addOtherPlayer(player);
            this.addChatMessage(`${player.name} が参加しました`, 'system');
        });

        this.network.on('playerLeave', (id, player) => {
            this.removeOtherPlayer(id);
            if (player) {
                this.addChatMessage(`${player.name} が退出しました`, 'system');
            }
        });

        this.network.on('playerMove', (data) => {
            this.updateOtherPlayer(data.id, data.position, data.rotation);
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

        this.network.on('worldData', (data) => {
            if (data.changes) {
                data.changes.forEach(change => {
                    this.setBlock(change.x, change.y, change.z, change.blockType, true);
                });
            }
        });
    }

    showRoomCode(code) {
        const display = document.getElementById('room-code-display');
        const text = document.getElementById('room-code-text');
        const pauseCode = document.getElementById('pause-room-code');
        const pauseCodeText = document.getElementById('pause-room-code-text');

        if (display && text) {
            display.style.display = 'flex';
            text.textContent = code;
        }
        if (pauseCode && pauseCodeText) {
            pauseCode.style.display = 'block';
            pauseCodeText.textContent = code;
        }
    }

    async startGame(mode, roomCode) {
        this.gameMode = mode;

        // Connect to network
        await this.network.connect(this.playerName, mode, roomCode || null);

        // Start game
        this.isPlaying = true;
        this.isPaused = false;
        this.isDead = false;
        this.menuScreen.style.display = 'none';
        this.hud.style.display = 'block';

        // Reset player
        this.player.health = 20;
        this.player.hunger = 20;
        this.lastHungerDecrease = Date.now();

        // Find spawn
        this.findSpawnPosition();

        // Lock pointer
        this.canvas.requestPointerLock();
    }

    findSpawnPosition() {
        const centerX = CHUNK_SIZE * WORLD_SIZE / 2;
        const centerZ = CHUNK_SIZE * WORLD_SIZE / 2;

        for (let y = WORLD_HEIGHT - 1; y > 0; y--) {
            if (this.getBlock(centerX, y, centerZ) !== BLOCK_TYPES.AIR &&
                this.getBlock(centerX, y, centerZ) !== BLOCK_TYPES.WATER) {
                this.player.position.set(centerX + 0.5, y + 2, centerZ + 0.5);
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

        if (this.isPaused) {
            document.exitPointerLock();
        } else {
            this.canvas.requestPointerLock();
        }
    }

    quitGame() {
        this.isPlaying = false;
        this.isPaused = false;
        this.isDead = false;
        this.network.disconnect();
        this.pauseMenu.style.display = 'none';
        this.deathScreen.style.display = 'none';
        this.hud.style.display = 'none';
        this.menuScreen.style.display = 'flex';
        document.getElementById('room-code-display').style.display = 'none';
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

    die(message) {
        this.isDead = true;
        this.deathScreen.style.display = 'flex';
        document.getElementById('death-message').textContent = message;
        document.exitPointerLock();
    }

    takeDamage(amount, message = 'ダメージ') {
        this.player.health = Math.max(0, this.player.health - amount);
        if (this.player.health <= 0) {
            this.die(message);
        }
    }

    selectSlot(slot) {
        this.selectedSlot = slot;
        document.querySelectorAll('.hotbar-slot').forEach((el, i) => {
            el.classList.toggle('selected', i === slot);
        });
    }

    toggleChat() {
        const chatInput = document.getElementById('chat-input');
        if (chatInput.style.display === 'none') {
            chatInput.style.display = 'block';
            chatInput.focus();
            document.exitPointerLock();
        } else {
            if (chatInput.value.trim()) {
                this.network.sendChat(chatInput.value);
                this.addChatMessage(`${this.playerName}: ${chatInput.value}`);
            }
            chatInput.value = '';
            chatInput.style.display = 'none';
            this.canvas.requestPointerLock();
        }
    }

    addChatMessage(message, type = 'normal') {
        const messagesDiv = document.getElementById('chat-messages');
        const msgEl = document.createElement('div');
        msgEl.className = 'message';
        msgEl.textContent = message;
        if (type === 'system') msgEl.style.color = '#fbbf24';
        messagesDiv.appendChild(msgEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        setTimeout(() => {
            msgEl.style.opacity = '0';
            setTimeout(() => msgEl.remove(), 300);
        }, 10000);
    }

    updatePlayerList() {
        const playersList = document.getElementById('players');
        playersList.innerHTML = `<li>${this.playerName} (あなた)</li>`;
        this.network.players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player.name;
            playersList.appendChild(li);
        });
    }

    addOtherPlayer(player) {
        // Create player mesh - visible purple box
        const geometry = new THREE.BoxGeometry(0.6, 1.8, 0.6);
        const material = new THREE.MeshLambertMaterial({ color: 0x8b5cf6 });
        const mesh = new THREE.Mesh(geometry, material);

        // Add head
        const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.15;
        mesh.add(head);

        // Name label
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 28px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, 128, 42);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2, 0.5, 1);
        sprite.position.y = 1.8;
        mesh.add(sprite);

        if (player.position) {
            mesh.position.set(player.position.x, player.position.y + 0.9, player.position.z);
        }

        this.scene.add(mesh);
        this.otherPlayers.set(player.peerId || player.id, { mesh, player });
    }

    removeOtherPlayer(id) {
        const data = this.otherPlayers.get(id);
        if (data) {
            this.scene.remove(data.mesh);
            this.otherPlayers.delete(id);
        }
    }

    updateOtherPlayer(id, position, rotation) {
        const data = this.otherPlayers.get(id);
        if (data && position) {
            data.mesh.position.set(position.x, position.y + 0.9, position.z);
            if (rotation) data.mesh.rotation.y = rotation.y;
        }
    }

    getTargetBlock() {
        // Update raycaster from camera
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        this.raycaster.set(this.camera.position, direction);

        let closestHit = null;
        let closestDistance = Infinity;

        const playerPos = this.player.position;
        const range = 5;

        for (let x = Math.floor(playerPos.x - range); x <= Math.floor(playerPos.x + range); x++) {
            for (let y = Math.floor(playerPos.y - range); y <= Math.floor(playerPos.y + range); y++) {
                for (let z = Math.floor(playerPos.z - range); z <= Math.floor(playerPos.z + range); z++) {
                    const blockType = this.getBlock(x, y, z);
                    if (blockType === BLOCK_TYPES.AIR || blockType === BLOCK_TYPES.WATER) continue;

                    const box = new THREE.Box3(
                        new THREE.Vector3(x, y, z),
                        new THREE.Vector3(x + 1, y + 1, z + 1)
                    );

                    const intersection = this.raycaster.ray.intersectBox(box, new THREE.Vector3());
                    if (intersection) {
                        const distance = intersection.distanceTo(this.camera.position);
                        if (distance < closestDistance && distance < 5) {
                            closestDistance = distance;

                            const center = new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5);
                            const diff = intersection.clone().sub(center);
                            let faceNormal = new THREE.Vector3();

                            const absX = Math.abs(diff.x);
                            const absY = Math.abs(diff.y);
                            const absZ = Math.abs(diff.z);

                            if (absX > absY && absX > absZ) {
                                faceNormal.x = Math.sign(diff.x);
                            } else if (absY > absZ) {
                                faceNormal.y = Math.sign(diff.y);
                            } else {
                                faceNormal.z = Math.sign(diff.z);
                            }

                            closestHit = { position: { x, y, z }, normal: faceNormal, blockType };
                        }
                    }
                }
            }
        }

        return closestHit;
    }

    breakBlock() {
        const target = this.getTargetBlock();
        if (target && target.blockType !== BLOCK_TYPES.BEDROCK) {
            this.setBlock(target.position.x, target.position.y, target.position.z, BLOCK_TYPES.AIR);
        }
    }

    placeBlock() {
        const target = this.getTargetBlock();
        if (target) {
            const placeX = target.position.x + target.normal.x;
            const placeY = target.position.y + target.normal.y;
            const placeZ = target.position.z + target.normal.z;

            // Check collision with player
            const playerBox = new THREE.Box3(
                new THREE.Vector3(this.player.position.x - PLAYER_WIDTH / 2, this.player.position.y, this.player.position.z - PLAYER_WIDTH / 2),
                new THREE.Vector3(this.player.position.x + PLAYER_WIDTH / 2, this.player.position.y + PLAYER_HEIGHT, this.player.position.z + PLAYER_WIDTH / 2)
            );

            const blockBox = new THREE.Box3(
                new THREE.Vector3(placeX, placeY, placeZ),
                new THREE.Vector3(placeX + 1, placeY + 1, placeZ + 1)
            );

            if (!playerBox.intersectsBox(blockBox)) {
                this.setBlock(placeX, placeY, placeZ, this.hotbarBlocks[this.selectedSlot]);
            }
        }
    }

    updatePlayer(deltaTime) {
        if (!this.isPlaying || this.isPaused || this.isDead) return;

        const now = Date.now();

        // Survival mechanics
        // Hunger decreases over time
        if (now - this.lastHungerDecrease > HUNGER_DECREASE_INTERVAL) {
            this.player.hunger = Math.max(0, this.player.hunger - 1);
            this.lastHungerDecrease = now;
        }

        // Starving damage
        if (this.player.hunger <= 0 && now - this.lastStarvingDamage > HUNGER_DAMAGE_INTERVAL) {
            this.takeDamage(1, '餓死');
            this.lastStarvingDamage = now;
        }

        // Movement - FIXED direction
        const moveDirection = new THREE.Vector3();

        if (this.keys['KeyW']) moveDirection.z = -1;
        if (this.keys['KeyS']) moveDirection.z = 1;
        if (this.keys['KeyA']) moveDirection.x = -1;
        if (this.keys['KeyD']) moveDirection.x = 1;

        if (moveDirection.length() > 0) {
            moveDirection.normalize();

            // Rotate by player Y rotation
            const cos = Math.cos(this.player.rotation.y);
            const sin = Math.sin(this.player.rotation.y);
            const newX = moveDirection.x * cos + moveDirection.z * sin;
            const newZ = -moveDirection.x * sin + moveDirection.z * cos;
            moveDirection.x = newX;
            moveDirection.z = newZ;
        }

        const speed = this.keys['ShiftLeft'] ? MOVE_SPEED * 0.5 : MOVE_SPEED;
        this.player.velocity.x = moveDirection.x * speed;
        this.player.velocity.z = moveDirection.z * speed;

        // Jump
        if (this.keys['Space'] && this.player.onGround) {
            this.player.velocity.y = JUMP_FORCE;
            this.player.onGround = false;
        }

        // Gravity
        this.player.velocity.y -= GRAVITY * deltaTime;

        // Move with collision
        this.moveWithCollision(deltaTime);

        // Fall damage
        if (this.player.onGround) {
            const fallDistance = this.player.lastY - this.player.position.y;
            if (fallDistance > FALL_DAMAGE_THRESHOLD) {
                const damage = Math.floor((fallDistance - FALL_DAMAGE_THRESHOLD) * FALL_DAMAGE_MULTIPLIER);
                this.takeDamage(damage, '落下ダメージ');
            }
            this.player.lastY = this.player.position.y;
        } else if (this.player.velocity.y > 0) {
            this.player.lastY = this.player.position.y;
        }

        // Update camera
        this.camera.position.copy(this.player.position);
        this.camera.position.y += PLAYER_HEIGHT - 0.2;
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.x = this.player.rotation.x;
        this.camera.rotation.y = this.player.rotation.y;

        // Block highlight
        const target = this.getTargetBlock();
        if (target) {
            this.highlightMesh.position.set(target.position.x + 0.5, target.position.y + 0.5, target.position.z + 0.5);
            this.highlightMesh.visible = true;
        } else {
            this.highlightMesh.visible = false;
        }

        // Send position to network (throttled)
        if (now - this.lastPositionUpdate > 50) {
            this.network.sendPosition(this.player.position, this.player.rotation);
            this.lastPositionUpdate = now;
        }

        this.updateHUD();
    }

    moveWithCollision(deltaTime) {
        const velocity = this.player.velocity;
        const position = this.player.position.clone();

        // X
        position.x += velocity.x * deltaTime;
        if (this.checkCollision(position)) {
            position.x = this.player.position.x;
            this.player.velocity.x = 0;
        }

        // Y
        position.y += velocity.y * deltaTime;
        if (this.checkCollision(position)) {
            if (velocity.y < 0) this.player.onGround = true;
            position.y = this.player.position.y;
            this.player.velocity.y = 0;
        } else {
            this.player.onGround = false;
        }

        // Z
        position.z += velocity.z * deltaTime;
        if (this.checkCollision(position)) {
            position.z = this.player.position.z;
            this.player.velocity.z = 0;
        }

        this.player.position.copy(position);

        // Fall out of world
        if (this.player.position.y < -10) {
            this.die('奈落に落ちた');
        }
    }

    checkCollision(position) {
        const hw = PLAYER_WIDTH / 2;
        const corners = [
            [position.x - hw, position.y + 0.1, position.z - hw],
            [position.x + hw, position.y + 0.1, position.z - hw],
            [position.x - hw, position.y + 0.1, position.z + hw],
            [position.x + hw, position.y + 0.1, position.z + hw],
            [position.x - hw, position.y + PLAYER_HEIGHT - 0.1, position.z - hw],
            [position.x + hw, position.y + PLAYER_HEIGHT - 0.1, position.z - hw],
            [position.x - hw, position.y + PLAYER_HEIGHT - 0.1, position.z + hw],
            [position.x + hw, position.y + PLAYER_HEIGHT - 0.1, position.z + hw],
        ];

        for (const [x, y, z] of corners) {
            const blockType = this.getBlock(x, y, z);
            if (blockType !== BLOCK_TYPES.AIR && blockType !== BLOCK_TYPES.WATER) {
                return true;
            }
        }
        return false;
    }

    updateHUD() {
        document.getElementById('coord-x').textContent = Math.floor(this.player.position.x);
        document.getElementById('coord-y').textContent = Math.floor(this.player.position.y);
        document.getElementById('coord-z').textContent = Math.floor(this.player.position.z);

        document.getElementById('health-bar').style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
        document.getElementById('hunger-bar').style.width = `${(this.player.hunger / this.player.maxHunger) * 100}%`;
        document.getElementById('health-text').textContent = `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;
        document.getElementById('hunger-text').textContent = `${Math.ceil(this.player.hunger)}/${this.player.maxHunger}`;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = Math.min(this.clock.getDelta(), 0.1);

        this.updatePlayer(deltaTime);

        // FPS
        this.frameCount++;
        if (performance.now() - this.lastFpsUpdate > 1000) {
            document.getElementById('fps').textContent = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = performance.now();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Start game
window.addEventListener('DOMContentLoaded', () => {
    window.game = new MinecraftGame();
});
