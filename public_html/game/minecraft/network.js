/**
 * WebCraft Network Client
 * P2P Multiplayer using PeerJS (WebRTC) + localStorage for world persistence
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
        this.gameMode = 'solo'; // 'solo', 'host', 'join'

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
            onRoomCreated: () => { }
        };

        // World changes storage
        this.worldChanges = this.loadWorldChanges();
    }

    // Generate random room code
    generateRoomCode() {
        return 'WC' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // Load world changes from localStorage
    loadWorldChanges() {
        try {
            const saved = localStorage.getItem('webcraft_world');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    // Save world changes to localStorage
    saveWorldChanges() {
        try {
            if (this.worldChanges.length > 50000) {
                this.worldChanges = this.worldChanges.slice(-50000);
            }
            localStorage.setItem('webcraft_world', JSON.stringify(this.worldChanges));
        } catch (e) {
            console.warn('Failed to save world:', e);
        }
    }

    connect(playerName, mode = 'solo', roomCodeToJoin = null) {
        return new Promise((resolve, reject) => {
            this.playerName = playerName;
            this.playerId = 'p_' + Math.random().toString(36).substring(2, 9);
            this.gameMode = mode;

            // Solo mode - no networking
            if (mode === 'solo') {
                console.log('Starting in single-player mode');
                this.connected = true;
                this.callbacks.onConnect();

                // Apply saved world changes
                if (this.worldChanges.length > 0) {
                    setTimeout(() => {
                        this.callbacks.onWorldData({ changes: this.worldChanges });
                    }, 100);
                }

                resolve();
                return;
            }

            // Host or Join mode
            this.initPeer(playerName, mode, roomCodeToJoin, resolve);
        });
    }

    initPeer(playerName, mode, roomCodeToJoin, resolve) {
        if (mode === 'host') {
            // Generate a new room code
            this.roomCode = this.generateRoomCode();
            this.isHost = true;
        } else if (mode === 'join') {
            // Use the provided room code
            this.roomCode = roomCodeToJoin;
            this.isHost = false;
        }

        // Create peer with unique ID
        const myPeerId = mode === 'host' ? this.roomCode : (this.playerId + '_' + Date.now());

        console.log('Creating peer with ID:', myPeerId);

        this.peer = new Peer(myPeerId, {
            debug: 2,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        this.peer.on('open', (id) => {
            console.log('Peer connected with ID:', id);
            this.connected = true;

            if (this.isHost) {
                console.log('Hosting room:', this.roomCode);
                this.callbacks.onRoomCreated(this.roomCode);
            } else {
                // Connect to host
                console.log('Connecting to host:', this.roomCode);
                const conn = this.peer.connect(this.roomCode, { reliable: true });
                this.setupConnection(conn, true);
            }

            this.callbacks.onConnect();
            resolve();
        });

        this.peer.on('connection', (conn) => {
            console.log('Incoming connection from:', conn.peer);
            this.setupConnection(conn, false);
        });

        this.peer.on('error', (error) => {
            console.error('PeerJS error:', error);
            if (error.type === 'unavailable-id') {
                alert('このルームコードは既に使用されています。別のコードを試してください。');
            } else if (error.type === 'peer-unavailable') {
                alert('ルームが見つかりません。コードを確認してください。');
            }
            this.connected = true; // Continue offline
            resolve();
        });

        this.peer.on('disconnected', () => {
            console.log('Peer disconnected, attempting to reconnect...');
            this.peer.reconnect();
        });

        // Timeout
        setTimeout(() => {
            if (!this.connected) {
                console.log('P2P timeout, continuing offline');
                this.connected = true;
                resolve();
            }
        }, 10000);
    }

    setupConnection(conn, isOutgoing) {
        conn.on('open', () => {
            console.log('Connection opened with:', conn.peer);
            this.connections.set(conn.peer, conn);

            // Send our player info
            conn.send({
                type: 'playerJoin',
                player: {
                    id: this.playerId,
                    name: this.playerName,
                    position: { x: 64, y: 40, z: 64 },
                    rotation: { x: 0, y: 0 }
                }
            });

            // If host, send world data to new player
            if (this.isHost && this.worldChanges.length > 0) {
                conn.send({
                    type: 'worldData',
                    changes: this.worldChanges
                });
            }

            this.callbacks.onPlayerCount(this.connections.size);
        });

        conn.on('data', (data) => {
            this.handleMessage(data, conn.peer);
        });

        conn.on('close', () => {
            console.log('Connection closed:', conn.peer);
            const player = this.players.get(conn.peer);
            this.connections.delete(conn.peer);
            this.players.delete(conn.peer);
            if (player) {
                this.callbacks.onPlayerLeave(conn.peer, player);
            }
            this.callbacks.onPlayerCount(this.connections.size);
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
        });
    }

    disconnect() {
        if (this.peer) {
            this.peer.destroy();
        }
        this.saveWorldChanges();
    }

    broadcast(data) {
        this.connections.forEach((conn, id) => {
            if (conn.open) {
                try {
                    conn.send(data);
                } catch (e) {
                    console.error('Send error:', e);
                }
            }
        });
    }

    handleMessage(data, fromId) {
        switch (data.type) {
            case 'playerJoin':
                data.player.peerId = fromId;
                this.players.set(fromId, data.player);
                this.callbacks.onPlayerJoin(data.player);
                this.callbacks.onPlayerCount(this.players.size);
                break;

            case 'playerMove':
                const player = this.players.get(fromId);
                if (player) {
                    player.position = data.position;
                    player.rotation = data.rotation;
                }
                this.callbacks.onPlayerMove({ id: fromId, position: data.position, rotation: data.rotation });
                break;

            case 'blockChange':
                this.worldChanges.push({
                    x: data.x,
                    y: data.y,
                    z: data.z,
                    blockType: data.blockType
                });
                this.callbacks.onBlockChange(data);
                // Relay to other peers (if we're the host)
                if (this.isHost) {
                    this.connections.forEach((conn, id) => {
                        if (id !== fromId && conn.open) {
                            conn.send(data);
                        }
                    });
                }
                break;

            case 'chat':
                this.callbacks.onChat({ id: fromId, name: data.name, message: data.message });
                // Relay chat if host
                if (this.isHost) {
                    this.connections.forEach((conn, id) => {
                        if (id !== fromId && conn.open) {
                            conn.send(data);
                        }
                    });
                }
                break;

            case 'worldData':
                if (data.changes) {
                    this.worldChanges = data.changes;
                    this.callbacks.onWorldData(data);
                }
                break;
        }
    }

    // Send player position update
    sendPosition(position, rotation) {
        this.broadcast({
            type: 'playerMove',
            position: { x: position.x, y: position.y, z: position.z },
            rotation: { x: rotation.x, y: rotation.y }
        });
    }

    // Send block change - also save locally
    sendBlockChange(x, y, z, blockType) {
        const change = { x, y, z, blockType };
        this.worldChanges.push(change);
        this.saveWorldChanges();

        this.broadcast({
            type: 'blockChange',
            ...change
        });
    }

    // Send chat message
    sendChat(message) {
        this.broadcast({
            type: 'chat',
            name: this.playerName,
            message
        });
    }

    // Set callback handlers
    on(event, callback) {
        const key = 'on' + event.charAt(0).toUpperCase() + event.slice(1);
        if (this.callbacks.hasOwnProperty(key)) {
            this.callbacks[key] = callback;
        }
    }

    // Get room code for sharing
    getRoomCode() {
        return this.roomCode;
    }

    // Clear saved world
    clearWorld() {
        this.worldChanges = [];
        localStorage.removeItem('webcraft_world');
    }
}

// Export for use in game.js
window.NetworkClient = NetworkClient;
