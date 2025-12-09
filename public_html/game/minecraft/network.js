/**
 * WebCraft Network Client
 * Handles WebSocket communication for multiplayer
 */

class NetworkClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.playerId = null;
        this.playerName = '';
        this.players = new Map();
        this.callbacks = {
            onConnect: () => { },
            onDisconnect: () => { },
            onPlayerJoin: () => { },
            onPlayerLeave: () => { },
            onPlayerMove: () => { },
            onBlockChange: () => { },
            onChat: () => { },
            onWorldData: () => { },
            onPlayerCount: () => { }
        };

        // Server URL - change this to your WebSocket server address
        this.serverUrl = this.getServerUrl();
    }

    getServerUrl() {
        // Auto-detect server URL based on current location
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        // Default WebSocket port
        const port = 8080;
        return `${protocol}//${host}:${port}`;
    }

    connect(playerName) {
        return new Promise((resolve, reject) => {
            this.playerName = playerName;

            try {
                console.log(`Connecting to ${this.serverUrl}...`);
                this.socket = new WebSocket(this.serverUrl);

                this.socket.onopen = () => {
                    console.log('WebSocket connected');
                    this.connected = true;

                    // Send join message
                    this.send({
                        type: 'join',
                        name: this.playerName
                    });

                    this.callbacks.onConnect();
                    resolve();
                };

                this.socket.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.connected = false;
                    this.callbacks.onDisconnect();
                };

                this.socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    // Continue in offline mode
                    resolve();
                };

                this.socket.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data));
                };

                // Timeout after 3 seconds, continue offline
                setTimeout(() => {
                    if (!this.connected) {
                        console.log('Connection timeout, continuing offline');
                        resolve();
                    }
                }, 3000);

            } catch (error) {
                console.error('Failed to connect:', error);
                resolve(); // Continue offline
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }

    send(data) {
        if (this.connected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'welcome':
                this.playerId = data.id;
                console.log('Assigned player ID:', this.playerId);
                break;

            case 'playerJoin':
                this.players.set(data.player.id, data.player);
                this.callbacks.onPlayerJoin(data.player);
                this.callbacks.onPlayerCount(this.players.size);
                break;

            case 'playerLeave':
                this.players.delete(data.id);
                this.callbacks.onPlayerLeave(data.id);
                this.callbacks.onPlayerCount(this.players.size);
                break;

            case 'playerMove':
                const player = this.players.get(data.id);
                if (player) {
                    player.position = data.position;
                    player.rotation = data.rotation;
                }
                this.callbacks.onPlayerMove(data);
                break;

            case 'blockChange':
                this.callbacks.onBlockChange(data);
                break;

            case 'chat':
                this.callbacks.onChat(data);
                break;

            case 'worldData':
                this.callbacks.onWorldData(data);
                break;

            case 'playerList':
                this.players.clear();
                data.players.forEach(p => this.players.set(p.id, p));
                this.callbacks.onPlayerCount(this.players.size);
                break;
        }
    }

    // Send player position update
    sendPosition(position, rotation) {
        this.send({
            type: 'move',
            position: { x: position.x, y: position.y, z: position.z },
            rotation: { x: rotation.x, y: rotation.y }
        });
    }

    // Send block change
    sendBlockChange(x, y, z, blockType) {
        this.send({
            type: 'blockChange',
            x, y, z,
            blockType
        });
    }

    // Send chat message
    sendChat(message) {
        this.send({
            type: 'chat',
            message
        });
    }

    // Set callback handlers
    on(event, callback) {
        if (this.callbacks.hasOwnProperty('on' + event.charAt(0).toUpperCase() + event.slice(1))) {
            this.callbacks['on' + event.charAt(0).toUpperCase() + event.slice(1)] = callback;
        }
    }
}

// Export for use in game.js
window.NetworkClient = NetworkClient;
