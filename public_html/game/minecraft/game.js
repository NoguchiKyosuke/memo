/**
 * WebCraft - Minecraft Clone Game Engine
 * Built with Three.js
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
const WORLD_SIZE = 8; // Number of chunks in each direction
const WORLD_HEIGHT = 64;
const SEA_LEVEL = 20;
const GRAVITY = 25;
const JUMP_FORCE = 10;
const MOVE_SPEED = 8;
const MOUSE_SENSITIVITY = 0.002;
const RENDER_DISTANCE = 3;
const PLAYER_HEIGHT = 1.8;
const PLAYER_WIDTH = 0.6;

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
        this.playerName = 'Player';

        // World data
        this.chunks = new Map();
        this.blockMeshes = new Map();

        // Player state
        this.player = {
            position: new THREE.Vector3(CHUNK_SIZE * WORLD_SIZE / 2, 40, CHUNK_SIZE * WORLD_SIZE / 2),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            onGround: false,
            health: 20,
            maxHealth: 20,
            hunger: 20,
            maxHunger: 20
        };

        // Controls
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
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

        // Block highlight
        this.highlightMesh = null;

        // DOM elements
        this.canvas = document.getElementById('game-canvas');
        this.loadingScreen = document.getElementById('loading-screen');
        this.menuScreen = document.getElementById('menu-screen');
        this.hud = document.getElementById('hud');
        this.pauseMenu = document.getElementById('pause-menu');

        this.init();
    }

    async init() {
        // Show loading screen
        this.updateLoadingText('Initializing engine...');
        await this.delay(500);

        // Initialize Three.js
        this.initThreeJS();
        this.updateLoadingText('Creating world...');
        await this.delay(300);

        // Generate world
        this.generateWorld();
        this.updateLoadingText('Building terrain...');
        await this.delay(300);

        // Build initial meshes
        this.buildAllChunks();
        this.updateLoadingText('Setting up controls...');
        await this.delay(200);

        // Setup controls
        this.setupControls();
        this.setupNetworkCallbacks();

        // Hide loading, show menu
        this.loadingScreen.style.display = 'none';
        this.menuScreen.style.display = 'flex';

        // Setup menu
        this.setupMenu();

        // Start render loop
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
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.copy(this.player.position);
        this.camera.position.y += PLAYER_HEIGHT - 0.2;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);

        // Block highlight
        const highlightGeo = new THREE.BoxGeometry(1.01, 1.01, 1.01);
        const highlightMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.2,
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
        // Generate chunks
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

                // Generate height using noise
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
                        if (y < SEA_LEVEL) {
                            chunk[index] = BLOCK_TYPES.SAND;
                        } else {
                            chunk[index] = BLOCK_TYPES.GRASS;
                        }
                    } else if (y < SEA_LEVEL) {
                        chunk[index] = BLOCK_TYPES.WATER;
                    } else {
                        chunk[index] = BLOCK_TYPES.AIR;
                    }
                }

                // Add trees
                if (height > SEA_LEVEL + 1 && Math.random() < 0.01) {
                    this.generateTree(chunk, x, height, z);
                }
            }
        }

        this.chunks.set(chunkKey, chunk);
    }

    getTerrainHeight(x, z) {
        const scale1 = 0.02;
        const scale2 = 0.05;
        const scale3 = 0.1;

        const noise1 = this.noise.noise2D(x * scale1, z * scale1) * 20;
        const noise2 = this.noise.noise2D(x * scale2, z * scale2) * 10;
        const noise3 = this.noise.noise2D(x * scale3, z * scale3) * 5;

        return Math.floor(SEA_LEVEL + noise1 + noise2 + noise3);
    }

    generateTree(chunk, x, baseY, z) {
        if (x < 2 || x > CHUNK_SIZE - 3 || z < 2 || z > CHUNK_SIZE - 3) return;

        const treeHeight = 4 + Math.floor(Math.random() * 3);

        // Trunk
        for (let y = 0; y < treeHeight; y++) {
            const index = x + (baseY + y) * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
            if (baseY + y < WORLD_HEIGHT) {
                chunk[index] = BLOCK_TYPES.WOOD;
            }
        }

        // Leaves
        const leafStart = baseY + treeHeight - 2;
        for (let ly = 0; ly < 3; ly++) {
            const radius = ly === 2 ? 1 : 2;
            for (let lx = -radius; lx <= radius; lx++) {
                for (let lz = -radius; lz <= radius; lz++) {
                    if (Math.abs(lx) === radius && Math.abs(lz) === radius && Math.random() > 0.5) continue;
                    const nx = x + lx;
                    const ny = leafStart + ly;
                    const nz = z + lz;
                    if (nx >= 0 && nx < CHUNK_SIZE && ny < WORLD_HEIGHT && nz >= 0 && nz < CHUNK_SIZE) {
                        const index = nx + ny * CHUNK_SIZE + nz * CHUNK_SIZE * WORLD_HEIGHT;
                        if (chunk[index] === BLOCK_TYPES.AIR) {
                            chunk[index] = BLOCK_TYPES.LEAVES;
                        }
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
            oldMesh.geometry.dispose();
        }

        // Build new mesh using instancing for performance
        const geometries = {};
        const matrices = {};

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const index = x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
                    const blockType = chunk[index];

                    if (blockType === BLOCK_TYPES.AIR || blockType === BLOCK_TYPES.WATER) continue;

                    // Check if any face is visible
                    if (!this.isBlockExposed(cx, cz, x, y, z)) continue;

                    if (!matrices[blockType]) {
                        matrices[blockType] = [];
                    }

                    const worldX = cx * CHUNK_SIZE + x;
                    const worldZ = cz * CHUNK_SIZE + z;

                    const matrix = new THREE.Matrix4();
                    matrix.setPosition(worldX + 0.5, y + 0.5, worldZ + 0.5);
                    matrices[blockType].push(matrix);
                }
            }
        }

        // Create instanced meshes
        const chunkGroup = new THREE.Group();

        for (const [blockType, matrixList] of Object.entries(matrices)) {
            if (matrixList.length === 0) continue;

            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshLambertMaterial({
                color: BLOCK_COLORS[blockType] || 0xff00ff,
                transparent: parseInt(blockType) === BLOCK_TYPES.LEAVES,
                opacity: parseInt(blockType) === BLOCK_TYPES.LEAVES ? 0.9 : 1
            });

            const instancedMesh = new THREE.InstancedMesh(geometry, material, matrixList.length);
            matrixList.forEach((matrix, i) => {
                instancedMesh.setMatrixAt(i, matrix);
            });
            instancedMesh.instanceMatrix.needsUpdate = true;
            instancedMesh.castShadow = true;
            instancedMesh.receiveShadow = true;

            chunkGroup.add(instancedMesh);
        }

        this.scene.add(chunkGroup);
        this.blockMeshes.set(chunkKey, chunkGroup);
    }

    isBlockExposed(cx, cz, x, y, z) {
        const neighbors = [
            [1, 0, 0], [-1, 0, 0],
            [0, 1, 0], [0, -1, 0],
            [0, 0, 1], [0, 0, -1]
        ];

        for (const [dx, dy, dz] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;

            if (ny < 0 || ny >= WORLD_HEIGHT) return true;

            let neighborBlock;
            if (nx < 0 || nx >= CHUNK_SIZE || nz < 0 || nz >= CHUNK_SIZE) {
                // Check neighbor chunk
                const ncx = cx + Math.floor(nx / CHUNK_SIZE);
                const ncz = cz + Math.floor(nz / CHUNK_SIZE);
                const nnx = ((nx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                const nnz = ((nz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                const neighborChunk = this.chunks.get(`${ncx},${ncz}`);
                if (!neighborChunk) return true;
                const index = nnx + ny * CHUNK_SIZE + nnz * CHUNK_SIZE * WORLD_HEIGHT;
                neighborBlock = neighborChunk[index];
            } else {
                const chunk = this.chunks.get(`${cx},${cz}`);
                const index = nx + ny * CHUNK_SIZE + nz * CHUNK_SIZE * WORLD_HEIGHT;
                neighborBlock = chunk[index];
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
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunk = this.chunks.get(`${cx},${cz}`);
        if (!chunk) return BLOCK_TYPES.AIR;

        const index = Math.floor(lx) + Math.floor(y) * CHUNK_SIZE + Math.floor(lz) * CHUNK_SIZE * WORLD_HEIGHT;
        return chunk[index];
    }

    setBlock(x, y, z, blockType) {
        if (y < 0 || y >= WORLD_HEIGHT) return;

        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunkKey = `${cx},${cz}`;
        const chunk = this.chunks.get(chunkKey);
        if (!chunk) return;

        const index = Math.floor(lx) + Math.floor(y) * CHUNK_SIZE + Math.floor(lz) * CHUNK_SIZE * WORLD_HEIGHT;
        chunk[index] = blockType;

        // Rebuild affected chunks
        this.buildChunkMesh(cx, cz);

        // Check if we need to rebuild neighbor chunks
        if (lx === 0) this.buildChunkMesh(cx - 1, cz);
        if (lx === CHUNK_SIZE - 1) this.buildChunkMesh(cx + 1, cz);
        if (lz === 0) this.buildChunkMesh(cx, cz - 1);
        if (lz === CHUNK_SIZE - 1) this.buildChunkMesh(cx, cz + 1);

        // Send to network
        this.network.sendBlockChange(x, y, z, blockType);
    }

    setupControls() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (this.isPlaying && !this.isPaused) {
                // Hotbar selection
                if (e.code >= 'Digit1' && e.code <= 'Digit9') {
                    this.selectSlot(parseInt(e.code.charAt(5)) - 1);
                }

                // Chat
                if (e.code === 'Enter' || e.code === 'KeyT') {
                    this.toggleChat();
                }
            }

            // Pause
            if (e.code === 'Escape' && this.isPlaying) {
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse
        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                this.player.rotation.y -= e.movementX * MOUSE_SENSITIVITY;
                this.player.rotation.x -= e.movementY * MOUSE_SENSITIVITY;
                this.player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.rotation.x));
            }
        });

        // Mouse click for block interaction
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.isPointerLocked) {
                this.canvas.requestPointerLock();
                return;
            }

            if (e.button === 0) {
                this.breakBlock();
            } else if (e.button === 2) {
                this.placeBlock();
            }
        });

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Pointer lock
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
            if (!this.isPointerLocked && this.isPlaying && !this.isPaused) {
                this.togglePause();
            }
        });

        // Scroll for hotbar
        this.canvas.addEventListener('wheel', (e) => {
            if (this.isPlaying && !this.isPaused) {
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
        const playerNameInput = document.getElementById('player-name');

        playBtn.addEventListener('click', () => {
            this.playerName = playerNameInput.value || 'Player';
            this.startGame();
        });

        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.playerName = playerNameInput.value || 'Player';
                this.startGame();
            }
        });

        resumeBtn.addEventListener('click', () => this.togglePause());
        quitBtn.addEventListener('click', () => this.quitGame());
    }

    setupNetworkCallbacks() {
        this.network.on('playerJoin', (player) => {
            this.addOtherPlayer(player);
            this.addChatMessage(`${player.name} がゲームに参加しました`, 'system');
        });

        this.network.on('playerLeave', (id) => {
            this.removeOtherPlayer(id);
        });

        this.network.on('playerMove', (data) => {
            this.updateOtherPlayer(data.id, data.position, data.rotation);
        });

        this.network.on('blockChange', (data) => {
            this.setBlock(data.x, data.y, data.z, data.blockType);
        });

        this.network.on('chat', (data) => {
            this.addChatMessage(`${data.name}: ${data.message}`);
        });

        this.network.on('playerCount', (count) => {
            document.getElementById('online-count').textContent = count;
            this.updatePlayerList();
        });
    }

    async startGame() {
        // Connect to server
        await this.network.connect(this.playerName);

        // Start game
        this.isPlaying = true;
        this.isPaused = false;
        this.menuScreen.style.display = 'none';
        this.hud.style.display = 'block';

        // Lock pointer
        this.canvas.requestPointerLock();

        // Find spawn position
        this.findSpawnPosition();
    }

    findSpawnPosition() {
        const centerX = CHUNK_SIZE * WORLD_SIZE / 2;
        const centerZ = CHUNK_SIZE * WORLD_SIZE / 2;

        for (let y = WORLD_HEIGHT - 1; y > 0; y--) {
            if (this.getBlock(centerX, y, centerZ) !== BLOCK_TYPES.AIR) {
                this.player.position.set(centerX + 0.5, y + 2, centerZ + 0.5);
                break;
            }
        }
    }

    togglePause() {
        if (!this.isPlaying) return;

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
        this.network.disconnect();
        this.pauseMenu.style.display = 'none';
        this.hud.style.display = 'none';
        this.menuScreen.style.display = 'flex';
        document.exitPointerLock();
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
        if (type === 'system') {
            msgEl.style.color = '#fbbf24';
        }
        messagesDiv.appendChild(msgEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Auto-remove after 10 seconds
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
        const geometry = new THREE.BoxGeometry(0.6, 1.8, 0.6);
        const material = new THREE.MeshLambertMaterial({ color: 0x8b5cf6 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;

        // Name label
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = 'white';
        ctx.font = '24px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, 128, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2, 0.5, 1);
        sprite.position.y = 1.5;
        mesh.add(sprite);

        this.scene.add(mesh);
        this.otherPlayers.set(player.id, { mesh, player });
    }

    removeOtherPlayer(id) {
        const data = this.otherPlayers.get(id);
        if (data) {
            this.scene.remove(data.mesh);
            this.otherPlayers.delete(id);
            this.addChatMessage(`${data.player.name} がゲームを離れました`, 'system');
        }
    }

    updateOtherPlayer(id, position, rotation) {
        const data = this.otherPlayers.get(id);
        if (data) {
            data.mesh.position.set(position.x, position.y + 0.9, position.z);
            data.mesh.rotation.y = rotation.y;
        }
    }

    getTargetBlock() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        // Check all blocks within range
        let closestHit = null;
        let closestDistance = Infinity;

        const playerPos = this.player.position;
        const range = 5;

        for (let x = Math.floor(playerPos.x - range); x <= Math.floor(playerPos.x + range); x++) {
            for (let y = Math.floor(playerPos.y - range); y <= Math.floor(playerPos.y + range); y++) {
                for (let z = Math.floor(playerPos.z - range); z <= Math.floor(playerPos.z + range); z++) {
                    const blockType = this.getBlock(x, y, z);
                    if (blockType === BLOCK_TYPES.AIR || blockType === BLOCK_TYPES.WATER) continue;

                    // Create temporary box for intersection test
                    const box = new THREE.Box3(
                        new THREE.Vector3(x, y, z),
                        new THREE.Vector3(x + 1, y + 1, z + 1)
                    );

                    const intersection = this.raycaster.ray.intersectBox(box, new THREE.Vector3());
                    if (intersection) {
                        const distance = intersection.distanceTo(this.camera.position);
                        if (distance < closestDistance && distance < 5) {
                            closestDistance = distance;

                            // Calculate face normal
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

                            closestHit = {
                                position: { x, y, z },
                                normal: faceNormal,
                                blockType
                            };
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

            // Check if placement position is not inside player
            const playerBox = new THREE.Box3(
                new THREE.Vector3(
                    this.player.position.x - PLAYER_WIDTH / 2,
                    this.player.position.y,
                    this.player.position.z - PLAYER_WIDTH / 2
                ),
                new THREE.Vector3(
                    this.player.position.x + PLAYER_WIDTH / 2,
                    this.player.position.y + PLAYER_HEIGHT,
                    this.player.position.z + PLAYER_WIDTH / 2
                )
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
        if (!this.isPlaying || this.isPaused) return;

        const moveDirection = new THREE.Vector3();

        // Get movement input
        if (this.keys['KeyW']) moveDirection.z -= 1;
        if (this.keys['KeyS']) moveDirection.z += 1;
        if (this.keys['KeyA']) moveDirection.x -= 1;
        if (this.keys['KeyD']) moveDirection.x += 1;

        // Rotate movement direction based on camera
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            const angle = this.player.rotation.y;
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const newX = moveDirection.x * cos - moveDirection.z * sin;
            const newZ = moveDirection.x * sin + moveDirection.z * cos;
            moveDirection.x = newX;
            moveDirection.z = newZ;
        }

        // Apply movement
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

        // Apply velocity with collision
        this.moveWithCollision(deltaTime);

        // Update camera position
        this.camera.position.copy(this.player.position);
        this.camera.position.y += PLAYER_HEIGHT - 0.2;
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.x = this.player.rotation.x;
        this.camera.rotation.y = this.player.rotation.y;

        // Update block highlight
        const target = this.getTargetBlock();
        if (target) {
            this.highlightMesh.position.set(
                target.position.x + 0.5,
                target.position.y + 0.5,
                target.position.z + 0.5
            );
            this.highlightMesh.visible = true;
        } else {
            this.highlightMesh.visible = false;
        }

        // Send position to server
        this.network.sendPosition(this.player.position, this.player.rotation);

        // Update HUD
        this.updateHUD();
    }

    moveWithCollision(deltaTime) {
        const velocity = this.player.velocity.clone();
        const position = this.player.position.clone();

        // X axis
        position.x += velocity.x * deltaTime;
        if (this.checkCollision(position)) {
            position.x = this.player.position.x;
            this.player.velocity.x = 0;
        }

        // Y axis
        position.y += velocity.y * deltaTime;
        if (this.checkCollision(position)) {
            if (velocity.y < 0) {
                this.player.onGround = true;
            }
            position.y = this.player.position.y;
            this.player.velocity.y = 0;
        } else {
            this.player.onGround = false;
        }

        // Z axis
        position.z += velocity.z * deltaTime;
        if (this.checkCollision(position)) {
            position.z = this.player.position.z;
            this.player.velocity.z = 0;
        }

        this.player.position.copy(position);

        // Fall off world
        if (this.player.position.y < -10) {
            this.findSpawnPosition();
            this.player.velocity.set(0, 0, 0);
        }
    }

    checkCollision(position) {
        const halfWidth = PLAYER_WIDTH / 2;
        const corners = [
            [position.x - halfWidth, position.y, position.z - halfWidth],
            [position.x + halfWidth, position.y, position.z - halfWidth],
            [position.x - halfWidth, position.y, position.z + halfWidth],
            [position.x + halfWidth, position.y, position.z + halfWidth],
            [position.x - halfWidth, position.y + PLAYER_HEIGHT, position.z - halfWidth],
            [position.x + halfWidth, position.y + PLAYER_HEIGHT, position.z - halfWidth],
            [position.x - halfWidth, position.y + PLAYER_HEIGHT, position.z + halfWidth],
            [position.x + halfWidth, position.y + PLAYER_HEIGHT, position.z + halfWidth],
        ];

        for (const [x, y, z] of corners) {
            const blockType = this.getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
            if (blockType !== BLOCK_TYPES.AIR && blockType !== BLOCK_TYPES.WATER) {
                return true;
            }
        }

        return false;
    }

    updateHUD() {
        // Update coordinates
        document.getElementById('coord-x').textContent = Math.floor(this.player.position.x);
        document.getElementById('coord-y').textContent = Math.floor(this.player.position.y);
        document.getElementById('coord-z').textContent = Math.floor(this.player.position.z);

        // Update health & hunger bars
        document.getElementById('health-bar').style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
        document.getElementById('hunger-bar').style.width = `${(this.player.hunger / this.player.maxHunger) * 100}%`;
        document.getElementById('health-text').textContent = `${this.player.health}/${this.player.maxHealth}`;
        document.getElementById('hunger-text').textContent = `${this.player.hunger}/${this.player.maxHunger}`;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = Math.min(this.clock.getDelta(), 0.1);

        // Update player
        this.updatePlayer(deltaTime);

        // FPS counter
        this.frameCount++;
        if (performance.now() - this.lastFpsUpdate > 1000) {
            document.getElementById('fps').textContent = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = performance.now();
        }

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new MinecraftGame();
});
