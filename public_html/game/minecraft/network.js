/**
 * WebCraft Network Client
 * TRUE P2P Multiplayer using PeerJS (WebRTC)
 * - Host creates world and shares it
 * - Guests receive host's world
 * - Real-time sync of players and blocks
 */

class NetworkClient {
    constructor() {
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
            onFullWorldSync: () => { }
        };
    }

    generateRoomCode() {
        return 'WC' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    connect(playerName, mode = 'solo', roomCodeToJoin = null) {
        return new Promise((resolve, reject) => {
            this.playerName = playerName;
            this.playerId = 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
            this.gameMode = mode;

            console.log(`[Network] Starting in ${mode} mode, player: ${playerName}`);

            if (mode === 'solo') {
                this.connected = true;
                this.callbacks.onConnect();
                resolve({ mode: 'solo' });
                return;
            }

            this.initPeer(playerName, mode, roomCodeToJoin, resolve, reject);
        });
    }

    initPeer(playerName, mode, roomCodeToJoin, resolve, reject) {
        this.isHost = (mode === 'host');

        if (this.isHost) {
            this.roomCode = this.generateRoomCode();
        } else {
            this.roomCode = roomCodeToJoin;
        }

        const myPeerId = this.isHost ? this.roomCode : `guest_${this.playerId}`;

        console.log(`[Network] Creating peer: ${myPeerId}, isHost: ${this.isHost}`);

        this.peer = new Peer(myPeerId, {
            debug: 1,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' }
                ]
            }
        });

        this.peer.on('open', (id) => {
            console.log(`[Network] Peer opened: ${id}`);
            this.connected = true;

            if (this.isHost) {
                console.log(`[Network] Hosting room: ${this.roomCode}`);
                this.callbacks.onRoomCreated(this.roomCode);
                this.callbacks.onConnect();
                resolve({ mode: 'host', roomCode: this.roomCode });
            } else {
                console.log(`[Network] Connecting to host: ${this.roomCode}`);
                const conn = this.peer.connect(this.roomCode, {
                    reliable: true,
                    serialization: 'json'
                });

                conn.on('open', () => {
                    console.log('[Network] Connected to host!');
                    this.hostConnection = conn;
                    this.setupGuestConnection(conn);
                    this.callbacks.onConnect();
                    resolve({ mode: 'guest', roomCode: this.roomCode });
                });

                conn.on('error', (err) => {
                    console.error('[Network] Connection error:', err);
                    reject(err);
                });
            }
        });

        // Host receives connections
        this.peer.on('connection', (conn) => {
            console.log('[Network] Incoming connection:', conn.peer);
            this.setupHostConnection(conn);
        });

        this.peer.on('error', (error) => {
            console.error('[Network] Peer error:', error);
            if (error.type === 'unavailable-id') {
                alert('このルームコードは既に使用中です');
                reject(error);
            } else if (error.type === 'peer-unavailable') {
                alert('ルームが見つかりません: ' + this.roomCode);
                reject(error);
            } else {
                reject(error);
            }
        });

        // Timeout
        setTimeout(() => {
            if (!this.connected) {
                console.log('[Network] Connection timeout');
                reject(new Error('Connection timeout'));
            }
        }, 15000);
    }

    // When HOST receives a connection from a guest
    setupHostConnection(conn) {
        conn.on('open', () => {
            console.log('[Network] Guest connected:', conn.peer);
            this.connections.set(conn.peer, conn);

            // Wait a bit then request player info
            setTimeout(() => {
                conn.send({ type: 'requestInfo' });
            }, 500);
        });

        conn.on('data', (data) => {
            this.handleHostMessage(data, conn);
        });

        conn.on('close', () => {
            console.log('[Network] Guest disconnected:', conn.peer);
            const player = this.players.get(conn.peer);
            this.connections.delete(conn.peer);
            this.players.delete(conn.peer);
            if (player) {
                this.callbacks.onPlayerLeave(conn.peer, player);
                // Notify other guests
                this.broadcastToGuests({ type: 'playerLeave', peerId: conn.peer }, conn.peer);
            }
            this.callbacks.onPlayerCount(this.players.size);
        });
    }

    // When GUEST connects to host
    setupGuestConnection(conn) {
        conn.on('data', (data) => {
            this.handleGuestMessage(data);
        });

        conn.on('close', () => {
            console.log('[Network] Disconnected from host');
            this.callbacks.onDisconnect();
        });
    }

    // Messages received by HOST from guests
    handleHostMessage(data, conn) {
        switch (data.type) {
            case 'playerInfo':
                const player = {
                    id: data.player.id,
                    name: data.player.name,
                    peerId: conn.peer,
                    position: data.player.position || { x: 64, y: 40, z: 64 },
                    rotation: data.player.rotation || { x: 0, y: 0 }
                };
                this.players.set(conn.peer, player);

                // Send existing players to new player
                const existingPlayers = [];
                this.players.forEach((p, peerId) => {
                    if (peerId !== conn.peer) {
                        existingPlayers.push(p);
                    }
                });
                conn.send({ type: 'playerList', players: existingPlayers });

                // Notify others about new player
                this.broadcastToGuests({ type: 'playerJoin', player }, conn.peer);

                // Request world data from game
                this.callbacks.onPlayerJoin(player);
                this.callbacks.onPlayerCount(this.players.size);

                // Send world to new player (game.js will call sendWorldToPlayer)
                this.pendingWorldRequest = conn.peer;
                break;

            case 'move':
                const p = this.players.get(conn.peer);
                if (p) {
                    p.position = data.position;
                    p.rotation = data.rotation;
                    this.callbacks.onPlayerMove({ id: conn.peer, position: data.position, rotation: data.rotation });
                    // Relay to other guests
                    this.broadcastToGuests({ type: 'playerMove', peerId: conn.peer, position: data.position, rotation: data.rotation }, conn.peer);
                }
                break;

            case 'blockChange':
                this.callbacks.onBlockChange(data);
                // Relay to other guests
                this.broadcastToGuests(data, conn.peer);
                break;

            case 'chat':
                const chatData = { id: conn.peer, name: data.name, message: data.message };
                this.callbacks.onChat(chatData);
                this.broadcastToGuests({ type: 'chat', ...chatData }, conn.peer);
                break;
        }
    }

    // Messages received by GUEST from host
    handleGuestMessage(data) {
        switch (data.type) {
            case 'requestInfo':
                this.hostConnection.send({
                    type: 'playerInfo',
                    player: {
                        id: this.playerId,
                        name: this.playerName,
                        position: { x: 64, y: 40, z: 64 },
                        rotation: { x: 0, y: 0 }
                    }
                });
                break;

            case 'worldData':
                console.log('[Network] Received world data from host');
                this.callbacks.onFullWorldSync(data);
                break;

            case 'playerList':
                data.players.forEach(p => {
                    this.players.set(p.peerId, p);
                    this.callbacks.onPlayerJoin(p);
                });
                this.callbacks.onPlayerCount(this.players.size);
                break;

            case 'playerJoin':
                this.players.set(data.player.peerId, data.player);
                this.callbacks.onPlayerJoin(data.player);
                this.callbacks.onPlayerCount(this.players.size);
                break;

            case 'playerLeave':
                const player = this.players.get(data.peerId);
                this.players.delete(data.peerId);
                if (player) this.callbacks.onPlayerLeave(data.peerId, player);
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

            case 'blockChange':
                this.callbacks.onBlockChange(data);
                break;

            case 'chat':
                this.callbacks.onChat(data);
                break;

            case 'hostPosition':
                // Host's position
                this.callbacks.onPlayerMove({ id: 'host', position: data.position, rotation: data.rotation });
                break;
        }
    }

    broadcastToGuests(data, excludePeerId = null) {
        this.connections.forEach((conn, peerId) => {
            if (peerId !== excludePeerId && conn.open) {
                try {
                    conn.send(data);
                } catch (e) {
                    console.error('[Network] Send error:', e);
                }
            }
        });
    }

    // Called by game when a new player needs world data
    sendWorldToPlayer(chunks, spawnPos) {
        if (this.pendingWorldRequest) {
            const conn = this.connections.get(this.pendingWorldRequest);
            if (conn && conn.open) {
                // Convert chunks to sendable format
                const worldData = {};
                chunks.forEach((chunk, key) => {
                    worldData[key] = Array.from(chunk);
                });

                conn.send({
                    type: 'worldData',
                    chunks: worldData,
                    spawnPos: spawnPos
                });
                console.log('[Network] Sent world to:', this.pendingWorldRequest);
            }
            this.pendingWorldRequest = null;
        }
    }

    disconnect() {
        if (this.peer) {
            this.peer.destroy();
        }
    }

    // Send position (for both host and guest)
    sendPosition(position, rotation) {
        if (this.gameMode === 'solo') return;

        const data = {
            type: this.isHost ? 'hostPosition' : 'move',
            position: { x: position.x, y: position.y, z: position.z },
            rotation: { x: rotation.x, y: rotation.y }
        };

        if (this.isHost) {
            this.broadcastToGuests(data);
        } else if (this.hostConnection && this.hostConnection.open) {
            this.hostConnection.send(data);
        }
    }

    sendBlockChange(x, y, z, blockType) {
        if (this.gameMode === 'solo') return;

        const data = { type: 'blockChange', x, y, z, blockType };

        if (this.isHost) {
            this.broadcastToGuests(data);
        } else if (this.hostConnection && this.hostConnection.open) {
            this.hostConnection.send(data);
        }
    }

    sendChat(message) {
        if (this.gameMode === 'solo') return;

        const data = { type: 'chat', name: this.playerName, message };

        if (this.isHost) {
            this.broadcastToGuests(data);
        } else if (this.hostConnection && this.hostConnection.open) {
            this.hostConnection.send(data);
        }
    }

    on(event, callback) {
        const key = 'on' + event.charAt(0).toUpperCase() + event.slice(1);
        if (this.callbacks.hasOwnProperty(key)) {
            this.callbacks[key] = callback;
        }
    }

    getRoomCode() {
        return this.roomCode;
    }
}

window.NetworkClient = NetworkClient;
