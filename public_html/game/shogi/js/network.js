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
        this.isHost = true;
        const roomID = 'SHOGI' + Math.random().toString(36).substring(2, 6).toUpperCase();

        this.peer = new Peer(roomID, {
            debug: 1,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        this.peer.on('open', (id) => {
            console.log('Hosting room:', id);
            this.trigger('onConnect', { roomID: id, role: SENTE }); // Host is Sente
        });

        this.peer.on('connection', (conn) => {
            if (this.conn) {
                conn.close(); return; // Only 1 opponent
            }
            this.conn = conn;
            this.setupConnection();
        });

        this.peer.on('error', err => console.error(err));
    }

    join(roomID) {
        this.isHost = false;
        this.peer = new Peer('G_' + this.id, {
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        this.peer.on('open', () => {
            this.conn = this.peer.connect(roomID);
            this.setupConnection();
        });

        this.peer.on('error', err => {
            console.error(err);
            alert('接続エラー: ' + err.type);
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
