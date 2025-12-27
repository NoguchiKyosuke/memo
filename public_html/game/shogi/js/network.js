class ShogiNetwork {
    constructor() {
        this.peer = null;
        this.conn = null;
        this.isHost = false;
        this.id = 'p_' + Math.random().toString(36).substring(2, 6);
        this.callbacks = {};
    }

    // Callbacks: onConnect, onData, onDisconnect
    on(event, cb) { this.callbacks[event] = cb; }
    trigger(event, data) { if (this.callbacks[event]) this.callbacks[event](data); }

    host(isRankMatch = false) {
        if (this.peer) this.peer.destroy();
        this.isHost = true;
        this.isRankMatch = isRankMatch; // Flag to delay game start
        this.createRoom();
    }

    createRoom() {
        // 4 char random ID
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.roomCode = code; // Store for later
        const roomID = 'MEMO_SHOGI_' + code;

        this.peer = new Peer(roomID, {
            debug: 1,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        this.peer.on('open', (id) => {
            console.log('Hosting room:', id);
            // If Rank Match, we DON'T start game yet. We wait for connection.
            if (!this.isRankMatch) {
                this.trigger('onConnect', { roomID: code, role: SENTE });
            }
        });

        this.peer.on('connection', (conn) => {
            if (this.conn) {
                conn.close(); return; // Only 1 opponent
            }
            this.conn = conn;
            this.setupConnection();
        });

        this.peer.on('error', err => {
            console.error(err);
            if (err.type === 'unavailable-id') {
                // Formatting collision? Retry automatically
                console.log('ID Collision, retrying...');
                this.peer.destroy();
                setTimeout(() => this.createRoom(), 500);
            }
        });
    }

    join(inputCode) {
        if (this.peer) this.peer.destroy();
        this.isHost = false;
        this.isRankMatch = false; // Joiner is never the "Waiting Host" logic

        // Regenerate my ID
        const myID = 'MEMO_GUEST_' + Math.random().toString(36).substring(2, 8);

        this.peer = new Peer(myID, {
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        const targetID = 'MEMO_SHOGI_' + inputCode.trim().toUpperCase();

        this.peer.on('open', () => {
            this.conn = this.peer.connect(targetID);
            this.setupConnection();
        });

        this.peer.on('error', err => {
            console.error(err);
            if (err.type === 'peer-unavailable') {
                if (!this.retryCount) this.retryCount = 0;
                if (this.retryCount < 3) {
                    this.retryCount++;
                    console.log(`Peer unavailable, retrying (${this.retryCount}/3)...`);
                    setTimeout(() => {
                        this.conn = this.peer.connect(targetID);
                        this.setupConnection();
                    }, 1000);
                    return;
                }
            }
            alert('接続エラー: ' + err.type + '\n（相手が見つかりません。IDを確認するか、相手が再接続してください）');
        });
    }

    setupConnection() {
        this.conn.on('open', () => {
            console.log('Connected!');

            // Trigger Game Start
            // 1. If Guest (!isHost) -> Always trigger (Role GOTE)
            // 2. If Host AND RankMatch (Delay) -> Trigger now (Role SENTE)
            if (!this.isHost) {
                this.trigger('onConnect', { roomID: this.conn.peer, role: GOTE });
            } else if (this.isHost && this.isRankMatch) {
                this.trigger('onConnect', { roomID: this.roomCode, role: SENTE });
            }

            // Standard Host (Room Match) already triggered on 'open', so don't trigger again.

            // Send Hello with Name
            // Need to access game controller's name?
            // Bad coupling. Better to expose a way or pass it in.
            // Simplification: accessing global 'game' object if available, or just standard payload.
            const name = window.game ? window.game.myPlayerName : 'Guest';
            this.send({ type: 'hello', from: this.id, name: name });
        });

        this.conn.on('data', (data) => {
            console.log('Received:', data);
            this.trigger('onData', data);
        });

        this.conn.on('close', () => {
            this.trigger('onDisconnect');
        });

        this.conn.on('error', err => console.error(err));
    }

    send(data) {
        if (this.conn && this.conn.open) {
            this.conn.send(data);
        }
    }
}
