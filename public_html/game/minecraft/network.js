/**
 * WebCraft Network Client
 * TRUE P2P Multiplayer using PeerJS
 */

class NetworkClient {
    constructor(gameMode, roomCode, playerName) {
        console.log('[Network] Initializing NetworkClient v1.1 (Fixed sendPosition)');
        this.gameMode = gameMode;
        this.roomCode = roomCode;
        this.playerName = playerName;
        this.peer = null;
        this.connections = new Map();
        this.connected = false;
        this.playerId = null;
        this.playerName = '';
        this.players = new Map();
        this.isHost = false;
        this.roomCode = null;
        this.gameMode = 'solo';
        this.hostConnection = null;

        this.callbacks = {
            onConnect: () => { },
            onDisconnect: () => { },
            onPlayerJoin: () => { },
            onPlayerLeave: () => { },
            onPlayerMove: () => { },
            onBlockChange: () => { },
            onChat: () => { },
            onWorldData: () => { },
            onPlayerCount: () => { },
            onRoomCreated: () => { },
            onFullWorldSync: () => { },
            onWorldStart: () => { },
            onChunkData: () => { },
            onChunkData: () => { },
            onWorldEnd: () => { },
            onAnimalUpdate: () => { }
        };
    }

    generateRoomCode() {
        return 'WC' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    connect(playerName, mode, roomCodeToJoin) {
        return new Promise((resolve, reject) => {
            this.playerName = playerName;
            this.playerId = 'p_' + Math.random().toString(36).substring(2, 8);
            this.gameMode = mode;

            console.log('[Network] ===== CONNECT =====');
            console.log('[Network] Mode:', mode);
            console.log('[Network] Room code to join:', roomCodeToJoin);
            console.log('[Network] Player:', playerName);

            if (mode === 'solo') {
                console.log('[Network] Solo mode - no networking');
                this.connected = false; // Solo mode is NOT "connected" to valid peer, but logic treats !connected as host
                this.isHost = true;
                this.callbacks.onConnect();
                resolve({ mode: 'solo' });
                return;
            }

            if (mode === 'join') {
                if (!roomCodeToJoin || roomCodeToJoin.length < 4) {
                    alert('ルームコードを入力してください');
                    reject(new Error('No room code'));
                    return;
                }
                this.isHost = false;
                this.roomCode = roomCodeToJoin.toUpperCase().replace(/[^A-Z0-9]/g, '');
                console.log('[Network] JOIN mode - connecting to room:', this.roomCode);
            } else {
                // Host mode
                this.isHost = true;
                if (roomCodeToJoin && roomCodeToJoin.length >= 4) {
                    // Use provided code (e.g. loading saved world)
                    this.roomCode = roomCodeToJoin.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    console.log('[Network] HOST mode - reusing room:', this.roomCode);
                } else {
                    // Generate new
                    this.roomCode = this.generateRoomCode();
                    console.log('[Network] HOST mode - creating room:', this.roomCode);
                }
            }

            this.initPeer(resolve, reject);
        });
    }

    initPeer(resolve, reject) {
        // For host, use the room code as peer ID
        // For guest, use a random ID
        const myPeerId = this.isHost ? this.roomCode : ('G_' + this.playerId);

        console.log('[Network] Creating peer ID:', myPeerId);
        console.log('[Network] Is Host:', this.isHost);

        this.peer = new Peer(myPeerId, {
            debug: 1,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        this.peer.on('open', (id) => {
            console.log('[Network] Peer opened with ID:', id);
            this.connected = true;

            if (this.isHost) {
                console.log('[Network] ★★★ HOSTING room:', this.roomCode);
                this.callbacks.onRoomCreated(this.roomCode);
                this.callbacks.onConnect();
                resolve({ mode: 'host', roomCode: this.roomCode });
            } else {
                // Guest - connect to host
                console.log('[Network] ★★★ JOINING room:', this.roomCode);
                this.connectToHost(resolve, reject);
            }
        });

        // Host receives incoming connections
        if (this.isHost) {
            this.peer.on('connection', (conn) => {
                console.log('[Network] Incoming guest connection:', conn.peer);
                this.handleGuestConnection(conn);
            });
        }

        this.peer.on('error', (error) => {
            console.error('[Network] Peer error:', error.type, error);
            if (error.type === 'unavailable-id') {
                alert('このルームは既に存在します');
            } else if (error.type === 'peer-unavailable') {
                alert('ルームが見つかりません: ' + this.roomCode);
            }
            reject(error);
        });

        this.peer.on('disconnected', () => {
            console.log('[Network] Peer disconnected');
        });

        // Timeout
        setTimeout(() => {
            if (!this.connected) {
                console.log('[Network] Connection timeout');
                reject(new Error('Timeout'));
            }
        }, 15000);
    }

    // Guest connects to host
    connectToHost(resolve, reject) {
        console.log('[Network] Connecting to host:', this.roomCode);

        const conn = this.peer.connect(this.roomCode, {
            reliable: true,
            serialization: 'json'
        });

        conn.on('open', () => {
            console.log('[Network] ✓ Connected to host!');
            this.hostConnection = conn;

            // Send our info to host
            conn.send({
                type: 'join',
                player: {
                    id: this.playerId,
                    name: this.playerName
                }
            });

            this.callbacks.onConnect();
            resolve({ mode: 'join', roomCode: this.roomCode });
        });

        conn.on('data', (data) => {
            this.handleMessageFromHost(data);
        });

        conn.on('close', () => {
            console.log('[Network] Disconnected from host');
            this.callbacks.onDisconnect();
        });

        conn.on('error', (err) => {
            console.error('[Network] Connection to host failed:', err);
            reject(err);
        });
    }

    // Host handles a guest connection
    handleGuestConnection(conn) {
        conn.on('open', () => {
            console.log('[Network] Guest connection opened:', conn.peer);
            this.connections.set(conn.peer, conn);
        });

        conn.on('data', (data) => {
            this.handleMessageFromGuest(data, conn);
        });

        conn.on('close', () => {
            console.log('[Network] Guest disconnected:', conn.peer);
            const player = this.players.get(conn.peer);
            this.connections.delete(conn.peer);
            this.players.delete(conn.peer);
            if (player) {
                this.callbacks.onPlayerLeave(conn.peer, player);
                this.broadcastToGuests({ type: 'playerLeft', peerId: conn.peer });
            }
            this.callbacks.onPlayerCount(this.players.size);
        });
    }

    // Host receives message from guest
    handleMessageFromGuest(data, conn) {
        console.log('[Network] From guest:', data.type);

        switch (data.type) {
            case 'join':
                const player = {
                    id: data.player.id,
                    name: data.player.name,
                    peerId: conn.peer,
                    position: { x: 64, y: 40, z: 64 },
                    rotation: { x: 0, y: 0 }
                };
                this.players.set(conn.peer, player);

                // Send existing players to new guest
                const playerList = [];
                this.players.forEach((p, pid) => {
                    if (pid !== conn.peer) playerList.push(p);
                });
                conn.send({ type: 'playerList', players: playerList });

                // Mark that we need to send world to this player - BEFORE callback
                this.pendingWorldPeer = conn.peer;

                // Notify game to send world
                this.callbacks.onPlayerJoin(player);
                this.callbacks.onPlayerCount(this.players.size);

                // Notify other guests
                this.broadcastToGuests({ type: 'playerJoined', player }, conn.peer);
                break;

            case 'move':
                const p = this.players.get(conn.peer);
                if (p) {
                    p.position = data.position;
                    p.rotation = data.rotation;
                }
                this.callbacks.onPlayerMove({ id: conn.peer, position: data.position, rotation: data.rotation });
                this.broadcastToGuests({ type: 'playerMove', peerId: conn.peer, position: data.position, rotation: data.rotation }, conn.peer);
                break;

            case 'blockChange':
                console.log('[Network] Block change from guest:', data.x, data.y, data.z, data.blockType);
                this.callbacks.onBlockChange(data);
                this.broadcastToGuests(data, conn.peer);
                break;

            case 'chat':
                this.callbacks.onChat({ name: data.name, message: data.message });
                this.broadcastToGuests({ type: 'chat', name: data.name, message: data.message }, conn.peer);
                break;
        }
    }

    // Guest receives message from host
    handleMessageFromHost(data) {
        // console.log('[Network] From host:', data.type); // Comment out to reduce spam

        switch (data.type) {
            case 'worldData':
                console.log('[Network] Received legacy world data from host');
                this.callbacks.onFullWorldSync(data);
                break;

            case 'worldStart':

                console.log('[Network] World sync started');
                this.callbacks.onWorldStart(data);
                break;

            case 'chunkData':
                this.callbacks.onChunkData(data);
                break;

            case 'worldEnd':
                console.log('[Network] World sync finished');
                this.callbacks.onWorldEnd();
                break;

            case 'animalUpdate':
                this.callbacks.onAnimalUpdate(data);
                break;

            case 'playerList':
                data.players.forEach(p => {
                    this.players.set(p.peerId, p);
                    this.callbacks.onPlayerJoin(p);
                });
                this.callbacks.onPlayerCount(this.players.size);
                break;

            case 'playerJoined':
                this.players.set(data.player.peerId, data.player);
                this.callbacks.onPlayerJoin(data.player);
                this.callbacks.onPlayerCount(this.players.size);
                break;

            case 'playerLeft':
                const pl = this.players.get(data.peerId);
                this.players.delete(data.peerId);
                if (pl) this.callbacks.onPlayerLeave(data.peerId, pl);
                this.callbacks.onPlayerCount(this.players.size);
                break;

            case 'playerMove':
                const p = this.players.get(data.peerId);
                if (p) {
                    p.position = data.position;
                    p.rotation = data.rotation;
                }
                this.callbacks.onPlayerMove({ id: data.peerId, position: data.position, rotation: data.rotation });
                break;

            case 'hostMove':
                this.callbacks.onPlayerMove({ id: 'host', position: data.position, rotation: data.rotation });
                break;

            case 'blockChange':
                console.log('[Network] Block change from host:', data.x, data.y, data.z);
                this.callbacks.onBlockChange(data);
                break;

            case 'chat':
                this.callbacks.onChat({ name: data.name, message: data.message });
                break;

            case 'animalUpdate':
                this.callbacks.onAnimalUpdate(data);
                break;
        }
    }

    broadcastToGuests(data, excludePeer = null) {
        this.connections.forEach((conn, peerId) => {
            if (peerId !== excludePeer && conn.open) {
                try { conn.send(data); } catch (e) { }
            }
        });
    }

    // Called by game when a new guest needs world data
    async sendWorldToGuest(chunks, spawnPos) {
        try {
            if (!this.pendingWorldPeer) {
                console.warn('[Network] No pending guest to send world to');
                return;
            }


            const conn = this.connections.get(this.pendingWorldPeer);
            if (conn && conn.open) {
                console.log('[Network] Starting chunked world sync to:', this.pendingWorldPeer);

                // 1. Start
                conn.send({
                    type: 'worldStart',
                    spawnPos: spawnPos,
                    totalChunks: chunks.size
                });

                // 2. Chunks
                let chunkCount = 0;
                const chunkEntries = Array.from(chunks.entries());
                console.log(`[Network] Sending ${chunkEntries.length} chunks to ${this.pendingWorldPeer}`);

                for (const [key, chunk] of chunkEntries) {
                    // RLE Compression
                    const rle = [];
                    let rleCurrentCount = 0;
                    let last = null;
                    for (let i = 0; i < chunk.length; i++) {
                        const val = chunk[i];
                        if (last === null) { last = val; rleCurrentCount = 1; }
                        else if (val === last) { rleCurrentCount++; }
                        else { rle.push(rleCurrentCount, last); last = val; rleCurrentCount = 1; }
                    }
                    rle.push(rleCurrentCount, last);

                    // Debug: check compression ratio
                    if (chunkCount === 0) { // Only log for first chunk to avoid spam
                        const originalSize = chunk.length;
                        const compressedSize = rle.length * 2; // approx bytes in JSON
                        console.log(`[Network] Chunk ${key} compressed: ${originalSize} -> ~${compressedSize} items (Ratio: ${(originalSize / compressedSize).toFixed(1)}x)`);
                    }

                    conn.send({
                        type: 'chunkData',
                        key: key,
                        data: rle,
                        isCompressed: true
                    });
                    chunkCount++;
                    // Small delay to prevent flooding the connection
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                console.log(`[Network] Sent ${chunkCount} chunks`);

                // 3. World End
                conn.send({ type: 'worldEnd' });
                this.pendingWorldPeer = null;

            }
        } catch (err) {
            console.error('[Network] Error sending world:', err);
        }
    }

    disconnect() {
        if (this.peer) this.peer.destroy();
    }

    sendPosition(position, rotation) {
        if (this.gameMode === 'solo') return;

        const data = {
            position: { x: position.x, y: position.y, z: position.z },
            rotation: { x: rotation.x, y: rotation.y }
        };

        if (this.isHost) {
            this.broadcastToGuests({ type: 'hostMove', ...data });
        } else if (this.hostConnection?.open) {
            this.hostConnection.send({ type: 'move', ...data });
        }
    }

    sendBlockChange(x, y, z, blockType) {
        if (this.gameMode === 'solo') return;

        const data = { type: 'blockChange', x, y, z, blockType };

        if (this.isHost) {
            this.broadcastToGuests(data);
        } else if (this.hostConnection?.open) {
            this.hostConnection.send(data);
        }
    }

    sendChat(message) {
        if (this.gameMode === 'solo') return;

        const data = { type: 'chat', name: this.playerName, message };

        if (this.isHost) {
            this.broadcastToGuests(data);
        } else if (this.hostConnection?.open) {
            this.hostConnection.send(data);
        }
    }

    sendAnimalUpdate(data) {
        if (!this.isHost) return;
        this.broadcastToGuests({
            type: 'animalUpdate',
            ...data
        });
    }

    on(event, callback) {
        const key = 'on' + event.charAt(0).toUpperCase() + event.slice(1);
        if (this.callbacks.hasOwnProperty(key)) {
            this.callbacks[key] = callback;
        }
    }

    getRoomCode() { return this.roomCode; }

    // ===== Database Persistence =====

    async saveWorldToDB(roomCode, hostToken, worldData) {
        try {
            const response = await fetch('/game/minecraft/api/save_world.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room_code: roomCode, host_token: hostToken, world_data: worldData })
            });
            const res = await response.json();
            return res;
        } catch (e) {
            console.error('Save failed:', e);
            return { error: e.message };
        }
    }

    async loadWorldFromDB(roomCode) {
        try {
            const response = await fetch(`/game/minecraft/api/load_world.php?room_code=${encodeURIComponent(roomCode)}`);
            if (response.status === 404) return null;
            const res = await response.json();
            return res.world_data;
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    }

    async deleteWorldFromDB(roomCode, hostToken) {
        console.log(`[Network] deleteWorldFromDB called for ${roomCode}`);
        try {
            const url = '/game/minecraft/api/delete_world.php';
            console.log(`[Network] Fetching ${url}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room_code: roomCode, host_token: hostToken })
            });
            console.log(`[Network] Response status: ${response.status}`);

            const res = await response.json();
            console.log('[Network] Response JSON:', res);
            return res;
        } catch (e) {
            console.error('[Network] Delete failed exception:', e);
            return { error: e.message };
        }
    }
}

window.NetworkClient = NetworkClient;
