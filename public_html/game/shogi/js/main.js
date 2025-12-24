/**
 * WebShogi Main Controller
 */

class GameController {
    constructor() {
        this.game = new Shogi();
        this.view = new ShogiView(
            document.getElementById('shogi-board'),
            [
                document.getElementById('komadai-sente'),
                document.getElementById('komadai-gote')
            ]
        );
        this.cpu = new CPU(this.game);
        this.network = new ShogiNetwork();

        this.mode = 'solo'; // 'solo', 'cpu', 'net'
        this.myRole = SENTE; // 0 or 1
        this.selection = null; // { type: 'board', x, y } or { type: 'hand', index, pieceType }

        // Setup Network Callbacks
        this.network.on('onConnect', (data) => this.onNetConnect(data));
        this.network.on('onData', (data) => this.onNetData(data));
        this.network.on('onDisconnect', () => this.onNetDisconnect());

        // Setup DOM Events
        this.setupEvents();

        this.render();
    }

    reset() {
        this.game.init();
        this.selection = null;
        this.render();
        document.getElementById('turn-indicator').textContent = "モードを選択してください";
        document.getElementById('game-info').style.display = 'none';
        document.getElementById('menu').style.display = 'block';
        document.getElementById('game-container').classList.remove('role-gote');
    }

    startCPU() {
        this.game.init();
        this.mode = 'cpu';
        this.myRole = SENTE; // Player is Black
        this.selection = null;
        document.getElementById('game-container').classList.remove('role-gote');
        this.showGameUI();
        this.updateTurnInfo();
    }

    showNetworkMenu() {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('network-menu').style.display = 'block';
    }

    showMainMenu() {
        document.getElementById('network-menu').style.display = 'none';
        document.getElementById('menu').style.display = 'block';
    }

    showGameUI() {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('network-menu').style.display = 'none';
        document.getElementById('game-info').style.display = 'block';
        this.render();
    }

    // --- Network Actions ---
    hostGame() {
        this.network.host();
        document.getElementById('network-status').textContent = "部屋を作成中...";
    }

    joinGame() {
        const id = document.getElementById('room-code-input').value;
        if (id) {
            this.network.join(id);
            document.getElementById('network-status').textContent = "接続中...";
        } else {
            alert('IDを入力してください');
        }
    }

    onNetConnect(data) {
        this.mode = 'net';
        this.myRole = data.role;
        this.game.init();

        if (this.myRole === GOTE) {
            document.getElementById('game-container').classList.add('role-gote');
        } else {
            document.getElementById('game-container').classList.remove('role-gote');
        }

        this.showGameUI();
        document.getElementById('room-info').style.display = 'block';
        document.getElementById('current-room-id').textContent = data.roomID;
        this.updateTurnInfo();
    }

    onNetData(data) {
        if (data.type === 'move') {
            const { from, to, promote } = data;
            this.game.move(from.x, from.y, to.x, to.y, promote);
            this.render({ from, to });
            this.updateTurnInfo();
            // Check for Game Over after remote move (e.g. they moved into checkmate or king capture - managed by postTurn logic usually, but here we just moved.)
            // Actually, we need to check if that move caused a win.
            if (this.game.winner !== null) {
                // If they made a move that set winner (e.g. captured king), the move() call would set it.
                // We should check and show result.
                const isMe = this.game.winner === this.myRole;
                this.showResult(isMe, isMe ? 'あなたの勝利です！' : 'あなたの敗北です...');
            }

        } else if (data.type === 'drop') {
            const { piece, to } = data;
            // Inverse owner for network data? No, if received, it's opponent's turn.
            // Opponent is not myRole.
            const opponent = this.myRole === SENTE ? GOTE : SENTE;
            this.game.drop(opponent, piece, to.x, to.y);
            this.render({ to: to }); // highlight drop pos
            this.updateTurnInfo();
        } else if (data.type === 'chat') {
            this.addChatMessage('相手: ' + data.message);
        } else if (data.type === 'resign') {
            this.game.winner = this.myRole; // Opponent resigned, so I win
            this.showResult(true, '相手が降参しました！');
        }
    }

    onNetDisconnect() {
        alert('接続が切れました');
        this.reset();
    }

    // --- Interaction ---
    setupEvents() {
        // Board Clicks
        const board = document.getElementById('shogi-board');
        board.addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                this.handleBoardClick(x, y);
            }
        });

        // Hand Clicks
        [0, 1].forEach(owner => {
            const container = document.getElementById(owner === 0 ? 'komadai-sente' : 'komadai-gote');
            container.addEventListener('click', (e) => {
                const pieceEl = e.target.closest('.komadai-piece');
                if (pieceEl) {
                    const type = parseInt(pieceEl.dataset.type);
                    const pieceOwner = parseInt(pieceEl.dataset.owner);
                    this.handleHandClick(pieceOwner, type);
                }
            });
        });

        // Chat
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const msg = e.target.value;
                if (msg) {
                    this.addChatMessage('あなた: ' + msg);
                    if (this.mode === 'net') this.network.send({ type: 'chat', message: msg });
                    e.target.value = '';
                }
            }
        });
    }

    handleBoardClick(x, y) {
        if (this.mode === 'cpu' && this.game.turn !== this.myRole) return; // Wait for CPU
        if (this.mode === 'net' && this.game.turn !== this.myRole) return;

        const piece = this.game.getPiece(x, y);

        // 1. Move Execution (if selected)
        if (this.selection) {
            // Check if clicked self piece -> Change selection
            if (piece && piece.owner === this.game.turn) {
                this.selectPiece(x, y);
                return;
            }

            // Attempt Move
            if (this.selection.type === 'board') {
                const moves = this.game.getValidMoves(this.selection.x, this.selection.y);
                const valid = moves.find(m => m.x === x && m.y === y);
                if (valid) {
                    this.tryMove(this.selection.x, this.selection.y, x, y);
                } else {
                    // Clicked invalid empty or enemy -> Deselect
                    this.deselect();
                }
            } else if (this.selection.type === 'hand') {
                // Attempt Drop
                if (!piece) { // Empty
                    if (this.game.drop(this.game.turn, this.selection.pieceType, x, y)) {
                        // Success Drop
                        if (this.mode === 'net') {
                            this.network.send({
                                type: 'drop',
                                piece: this.selection.pieceType,
                                to: { x, y }
                            });
                        }
                        this.selection = null;
                        this.postTurn();
                    }
                } else {
                    this.deselect();
                }
            }
            return;
        }

        // 2. Select Piece
        if (piece && piece.owner === this.game.turn) {
            this.selectPiece(x, y);
        }
    }

    handleHandClick(owner, type) {
        if (owner !== this.game.turn) return;
        if (this.mode === 'cpu' && this.game.turn !== this.myRole) return;
        if (this.mode === 'net' && this.game.turn !== this.myRole) return;

        this.view.clearHighlights();
        this.selection = { type: 'hand', pieceType: type };
        this.view.selectHandPiece(owner, type);
    }

    selectPiece(x, y) {
        this.selection = { type: 'board', x, y };
        this.view.clearHighlights();
        this.view.selectCell(x, y);
        const moves = this.game.getValidMoves(x, y);
        this.view.highlightMoves(moves);
    }

    deselect() {
        this.selection = null;
        this.view.clearHighlights();
    }

    // Move Logic Flow (including Promotion)
    tryMove(fx, fy, tx, ty) {
        const piece = this.game.getPiece(fx, fy);
        const canPromote = this.game.canPromote(fx, fy, piece.type, this.game.turn) ||
            this.game.canPromote(tx, ty, piece.type, this.game.turn); // Check TO pos too
        const mustPromote = this.game.mustPromote(ty, piece.type, this.game.turn);

        if (mustPromote) {
            this.executeMove(fx, fy, tx, ty, true);
        } else if (canPromote) {
            // Show Modal
            this.pendingMove = { fx, fy, tx, ty };
            document.getElementById('promotion-modal').classList.add('active');
        } else {
            this.executeMove(fx, fy, tx, ty, false);
        }
    }

    confirmPromotion(doPromote) {
        document.getElementById('promotion-modal').classList.remove('active');
        if (this.pendingMove) {
            const { fx, fy, tx, ty } = this.pendingMove;
            this.executeMove(fx, fy, tx, ty, doPromote);
            this.pendingMove = null;
        }
    }

    executeMove(fx, fy, tx, ty, promote) {
        const success = this.game.move(fx, fy, tx, ty, promote);
        if (success) {
            if (this.mode === 'net') {
                this.network.send({
                    type: 'move',
                    from: { x: fx, y: fy },
                    to: { x: tx, y: ty },
                    promote: promote
                });
            }
            this.selection = null;
            this.postTurn({ to: { x: tx, y: ty } });
        }
    }

    postTurn(lastMove = null) {
        this.view.clearHighlights();
        this.render(lastMove);
        this.updateTurnInfo();

        if (this.game.winner !== null) {
            const isMe = this.game.winner === this.myRole;
            this.showResult(isMe, isMe ? 'あなたの勝利です！' : 'あなたの敗北です...');
            return;
        }

        if (this.mode === 'cpu' && this.game.turn !== this.myRole) {
            // CPU Turn (with delay)
            this.cpu.think().then(move => {
                if (move) {
                    if (move.type === 'move') {
                        this.game.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote);
                        this.postTurn({ to: move.to });
                    } else {
                        // Correct owner for CPU drops
                        this.game.drop(this.game.turn, move.piece, move.to.x, move.to.y);
                        this.postTurn({ to: move.to });
                    }
                } else {
                    // CPU Resign
                    this.showResult(true, 'CPUが投了しました');
                }
            });
        }
    }

    surrender() {
        if (confirm('本当に降参しますか？')) {
            this.game.winner = (this.myRole === SENTE ? GOTE : SENTE); // Opponent wins
            this.showResult(false, '降参しました...');
            // If network, send resignation? (Not implemented in protocol yet, simplistic)
            // Ideally we send a 'resign' message.
            if (this.mode === 'net') {
                this.network.send({ type: 'resign' });
            }
        }
    }

    showResult(isWin, msg) {
        const overlay = document.getElementById('result-overlay');
        const title = document.getElementById('result-title');
        const message = document.getElementById('result-message');

        overlay.className = isWin ? 'result-win' : 'result-lose';
        title.textContent = isWin ? 'VICTORY' : 'DEFEAT';
        message.textContent = msg;

        overlay.style.display = 'flex';

        // Sound effect? (Optional)
    }

    closeResult() {
        document.getElementById('result-overlay').style.display = 'none';
        this.reset();
    }

    render(lastMove) {
        this.view.render(this.game, lastMove);
    }

    updateTurnInfo() {
        const turnText = this.game.turn === SENTE ? '先手' : '後手';
        const isMyTurn = this.game.turn === this.myRole;
        const ind = document.getElementById('turn-indicator');
        ind.textContent = `${turnText} の番です ${isMyTurn ? '(あなた)' : ''} `;
        ind.style.color = isMyTurn ? '#fbbf24' : '#fff';
    }

    addChatMessage(msg) {
        const div = document.getElementById('chat-messages');
        const p = document.createElement('div');
        p.textContent = msg;
        div.appendChild(p);
        div.scrollTop = div.scrollHeight;
    }
}

// Start
const game = new GameController();
const network = game.network; // Expose for HTML buttons
window.game = game; // Expose for HTML buttons
window.network = network;
