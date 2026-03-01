const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Waiting player queue
let waitingPlayer = null;

// Store game sessions { p1: ws, p2: ws }
const games = new Map();

console.log('Tetris WebSocket Server started on port 8080');

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.isAlive = true;

    ws.on('pong', () => { ws.isAlive = true; });

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (e) {
            console.error('Invalid JSON:', e);
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        handleDisconnect(ws);
    });

    // Matchmaking logic
    if (waitingPlayer) {
        // Pair with waiting player
        const opponent = waitingPlayer;
        waitingPlayer = null;

        // Create game session
        const gameId = Date.now().toString();
        ws.gameId = gameId;
        opponent.gameId = gameId;
        ws.opponent = opponent;
        opponent.opponent = ws;

        // Notify both players
        const startMsg = { type: 'match_found', gameId: gameId };

        // Determine player roles (optional, mostly for consistency if needed)
        // Send "start" to both
        ws.send(JSON.stringify({ ...startMsg, role: 'p2' }));
        opponent.send(JSON.stringify({ ...startMsg, role: 'p1' }));

        console.log(`Match found: ${gameId}`);
    } else {
        // Join waiting queue
        waitingPlayer = ws;
        ws.send(JSON.stringify({ type: 'waiting' }));
        console.log('Player added to waiting queue');
    }
});

function handleMessage(ws, data) {
    if (!ws.opponent) return;

    // Relay messages to opponent
    switch (data.type) {
        case 'board_update':
            // Relay board state (compressed or full)
            ws.opponent.send(JSON.stringify({
                type: 'opponent_board',
                board: data.board, // Expecting 2D array or compressed format
                score: data.score
            }));
            break;

        case 'attack':
            // Send garbage lines to opponent
            ws.opponent.send(JSON.stringify({
                type: 'receive_attack',
                lines: data.lines
            }));
            break;

        case 'game_over':
            // Notify opponent they won
            ws.opponent.send(JSON.stringify({
                type: 'opponent_game_over',
                win: true
            }));
            break;

        case 'chat': // Optional
            ws.opponent.send(JSON.stringify({
                type: 'chat',
                message: data.message
            }));
            break;
    }
}

function handleDisconnect(ws) {
    if (waitingPlayer === ws) {
        waitingPlayer = null;
        console.log('Waiting player removed from queue');
    }

    if (ws.opponent) {
        // Notify opponent of disconnection (automatic win)
        if (ws.opponent.readyState === WebSocket.OPEN) {
            ws.opponent.send(JSON.stringify({
                type: 'opponent_disconnected',
                win: true
            }));
        }
        ws.opponent.opponent = null;
        ws.opponent.gameId = null;
        ws.opponent = null;
    }
}

// Keep-alive interval
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});
