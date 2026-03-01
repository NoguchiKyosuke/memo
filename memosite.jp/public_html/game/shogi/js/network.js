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

    host() {
        if (this.peer) this.peer.destroy();
        this.isHost = true;
        this.createRoom();
    }

    createRoom() {
        // 4 char random ID
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();
        const roomID = 'MEMO_SHOGI_' + code;

        this.peer = new Peer(roomID, {
            debug: 1,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        this.peer.on('open', (id) => {
            console.log('Hosting room:', id);
            // Display only the code part
            this.trigger('onConnect', { roomID: code, role: SENTE });
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
            // If Guest, we are Gote
            const role = this.isHost ? SENTE : GOTE;
            if (!this.isHost) this.trigger('onConnect', { roomID: this.conn.peer, role: GOTE });

            // Send Hello?
            this.send({ type: 'hello', from: this.id });
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
