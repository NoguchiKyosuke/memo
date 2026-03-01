/**
 * WebCraft Multiplayer Server
 * WebSocket server for real-time game synchronization
 */

const WebSocket = require('ws');
const http = require('http');

// Configuration
const PORT = process.env.PORT || 8080;
const HEARTBEAT_INTERVAL = 30000;

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebCraft Server Running');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Game state
const players = new Map();
const worldChanges = []; // Store block changes
let nextPlayerId = 1;

console.log('🎮 WebCraft Server Starting...');

// Handle new connections
wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`New connection from ${clientIP}`);

    let player = null;

    // Heartbeat to keep connection alive
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // Handle messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleMessage(ws, message, player, (p) => { player = p; });
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    // Handle disconnect
    ws.on('close', () => {
        if (player) {
            console.log(`Player ${player.name} (${player.id}) disconnected`);
            players.delete(player.id);

            // Notify other players
            broadcast({
                type: 'playerLeave',
                id: player.id
            }, player.id);
        }
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function handleMessage(ws, message, player, setPlayer) {
    switch (message.type) {
        case 'join':
            // Create new player
            const newPlayer = {
                id: nextPlayerId++,
                name: message.name || `Player${nextPlayerId}`,
                position: { x: 64, y: 40, z: 64 },
                rotation: { x: 0, y: 0 },
                ws: ws
            };

            players.set(newPlayer.id, newPlayer);
            setPlayer(newPlayer);

            console.log(`Player ${newPlayer.name} (${newPlayer.id}) joined`);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'welcome',
                id: newPlayer.id
            }));

            // Send existing players list
            const playerList = [];
            players.forEach((p, id) => {
                if (id !== newPlayer.id) {
                    playerList.push({
                        id: p.id,
                        name: p.name,
                        position: p.position,
                        rotation: p.rotation
                    });
                }
            });

            ws.send(JSON.stringify({
                type: 'playerList',
                players: playerList
            }));

            // Send world changes
            if (worldChanges.length > 0) {
                ws.send(JSON.stringify({
                    type: 'worldData',
                    changes: worldChanges
                }));
            }

            // Notify other players
            broadcast({
                type: 'playerJoin',
                player: {
                    id: newPlayer.id,
                    name: newPlayer.name,
                    position: newPlayer.position,
                    rotation: newPlayer.rotation
                }
            }, newPlayer.id);
            break;

        case 'move':
            if (player) {
                player.position = message.position;
                player.rotation = message.rotation;

                // Broadcast to other players
                broadcast({
                    type: 'playerMove',
                    id: player.id,
                    position: message.position,
                    rotation: message.rotation
                }, player.id);
            }
            break;

        case 'blockChange':
            // Store and broadcast block change
            const change = {
                x: message.x,
                y: message.y,
                z: message.z,
                blockType: message.blockType
            };

            worldChanges.push(change);

            // Limit stored changes
            if (worldChanges.length > 10000) {
                worldChanges.shift();
            }

            // Broadcast to all other players
            if (player) {
                broadcast({
                    type: 'blockChange',
                    ...change,
                    playerId: player.id
                }, player.id);
            }
            break;

        case 'chat':
            if (player) {
                broadcast({
                    type: 'chat',
                    id: player.id,
                    name: player.name,
                    message: message.message
                }, player.id);
            }
            break;
    }
}

// Broadcast message to all players except sender
function broadcast(message, excludeId = null) {
    const data = JSON.stringify(message);
    players.forEach((player) => {
        if (player.id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(data);
        }
    });
}

// Heartbeat check
const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, HEARTBEAT_INTERVAL);

wss.on('close', () => {
    clearInterval(heartbeatInterval);
});

// Start server
server.listen(PORT, () => {
    console.log(`✅ WebCraft Server running on port ${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}`);
    console.log(`👥 Waiting for players...`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    wss.clients.forEach((ws) => {
        ws.close();
    });
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
