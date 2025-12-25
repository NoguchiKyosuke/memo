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
        // Initialize CPU menu content here, as per user's intended edit location
        // Initialize CPU menu content here, as per user's intended edit location
        // REMOVED to allow index.php customization
        // document.getElementById('cpu-menu').innerHTML = ...;
        this.cpu = new CPU(this.game);
        this.network = new ShogiNetwork();

        this.mode = 'solo'; // 'solo', 'cpu', 'net'
        // Setup Network Callbacks
        this.network.on('onConnect', (data) => this.onNetConnect(data));
        this.network.on('onData', (data) => this.onNetData(data));
        this.network.on('onDisconnect', () => this.onNetDisconnect());

        // BGM
        this.bgm = new Audio('assets/sound/bgm.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.3; // Not too loud

        // Setup DOM Events
        this.setupEvents();

        this.mode = 'solo'; // 'solo', 'cpu', 'net'
        this.myRole = SENTE; // 0 or 1
        this.selection = null; // { type: 'board', x, y } or { type: 'hand', index, pieceType }

        this.render();
        this.chaosProbability = 0; // Mikami
    }

    reset() {
        this.game.init();
        this.selection = null;
        this.chaosProbability = 0;
        document.body.classList.remove('mikami-inverted');
        this.render();
        document.getElementById('turn-indicator').textContent = "モードを選択してください";

        // Hide all specific menus/infos
        document.getElementById('game-info').style.display = 'none';
        document.getElementById('cpu-menu').style.display = 'none';
        document.getElementById('network-menu').style.display = 'none';

        // Show Main Menu
        document.getElementById('menu').style.display = 'block';

        document.getElementById('game-container').classList.remove('role-gote');
        // Reset labels to default Sente=You, Gote=Opponent
        this.myPlayerName = null;
        this.netOpponentName = null;
        this.updatePlayerLabels();
    }

    startCPU(level = 'weak') {
        this.game.init();
        this.mode = 'cpu';
        this.isPlaying = true;
        this.selection = null;

        if (this.bgm) {
            this.bgm.play().catch(e => console.log('BGM Play Blocked', e));
        }

        this.cpu.setLevel(level);

        // Always User = Sente, CPU = Gote (except Watch mode)
        this.myRole = SENTE;
        document.getElementById('game-container').classList.remove('role-gote');

        this.showGameUI();
        this.updateTurnInfo();

        // User is Sente, so just wait for user move.
        // if (this.myRole === GOTE) { this.playCPUTurn(); }
    }

    startCPUWatch() {
        this.game.init();
        this.mode = 'cpu_watch';
        this.isPlaying = true;
        this.selection = null;
        this.myRole = -1; // Observer

        if (this.bgm) {
            this.bgm.play().catch(e => console.log('BGM Play Blocked', e));
        }

        // Configure Asymmetric Levels: Strong vs God
        this.watchModeLevels = {
            [SENTE]: 'strong',
            [GOTE]: 'god'
        };

        // Initialize CPU with Sente's level
        this.cpu.setLevel(this.watchModeLevels[SENTE]);

        document.getElementById('game-container').classList.remove('role-gote'); // Default view
        this.showGameUI();

        // Start Loop
        this.updateTurnInfo();
        this.playCPUTurn();
    }

    showNetworkMenu() {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('cpu-menu').style.display = 'none';
        document.getElementById('game-info').style.display = 'none';
        document.getElementById('network-menu').style.display = 'block';
    }

    showCpuMenu() {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('network-menu').style.display = 'none';
        document.getElementById('game-info').style.display = 'none';
        document.getElementById('cpu-menu').style.display = 'block';
    }


    showMainMenu() {
        document.getElementById('network-menu').style.display = 'none';
        document.getElementById('cpu-menu').style.display = 'none';
        document.getElementById('game-info').style.display = 'none';
        document.getElementById('menu').style.display = 'block';
    }

    showGameUI() {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('network-menu').style.display = 'none';
        document.getElementById('cpu-menu').style.display = 'none';
        document.getElementById('game-info').style.display = 'block';
        this.render();
    }

    // --- Network Actions ---
    hostGame() {
        const name = document.getElementById('player-name-input').value.trim();
        if (!name) { alert("名前を入力してください。"); return; }
        this.myPlayerName = name; // Store my name

        this.network.host();
        document.getElementById('network-status').textContent = "部屋を作成中...";
    }

    joinGame() {
        const name = document.getElementById('player-name-input').value.trim();
        if (!name) { alert("名前を入力してください。"); return; }
        this.myPlayerName = name; // Store my name

        const id = document.getElementById('room-code-input').value;
        if (id) {
            this.network.join(id);
            document.getElementById('network-status').textContent = "接続中...";
        } else {
            alert('IDを入力してください');
        }
    }

    async showRanking() {
        try {
            const res = await fetch('get_ranking.php');
            const data = await res.json();

            const list = document.getElementById('ranking-list');
            list.innerHTML = "";

            if (data.length === 0) {
                list.innerHTML = "<p>データがありません</p>";
            } else {
                const table = document.createElement('table');
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';
                table.innerHTML = `<tr style="border-bottom:1px solid #555;">
                    <th style="text-align:left; padding:5px;">順位</th>
                    <th style="text-align:left; padding:5px;">名前</th>
                    <th style="text-align:right; padding:5px;">レート</th>
                    <th style="text-align:right; padding:5px;">勝/負</th>
                </tr>`;

                data.forEach((user, i) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="padding:5px;">#${i + 1}</td>
                        <td style="padding:5px;">${user.username}</td>
                        <td style="padding:5px; text-align:right;">${user.rate}</td>
                        <td style="padding:5px; text-align:right;">${user.wins}/${user.losses}</td>
                    `;
                    table.appendChild(tr);
                });
                list.appendChild(table);
            }

            document.getElementById('ranking-modal').classList.add('active');

        } catch (e) {
            console.error(e);
            alert("ランキング取得失敗");
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
        } else if (data.type === 'hello') { // Handshake
            if (data.name) {
                this.netOpponentName = data.name;
                console.log("Opponent Name:", this.netOpponentName);
                if (this.mode === 'net') this.updatePlayerLabels(); // Update labels with name

                // If I am Host, I should reply with my name immediately if I haven't?
                // Actually peer onConnect sends 'hello'. Client receiving it should send back logic?
                // Or standard handshake: Both send 'hello' on connect?
                // Let's ensure we send name if we haven't already logic? 
                // Currently setupConnection sends 'hello'. 
            }
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
                        const droppedPiece = this.selection.pieceType;
                        this.selection = null;
                        // Pass move info for Chaos Check
                        this.postTurn({ to: { x, y }, drop: true, piece: droppedPiece });
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
        this.view.clearHighlights();
        this.render(lastMove);
        this.updateTurnInfo();

        // Mikami Shogi Chaos
        this.checkChaos(lastMove);

        if (this.game.winner !== null) {
            let msg = '';
            let isWin = true;

            if (this.mode === 'cpu_watch') {
                msg = (this.game.winner === SENTE ? '先手' : '後手') + 'の勝利です！';
            } else {
                const isMe = this.game.winner === this.myRole;
                msg = isMe ? 'あなたの勝利です！' : 'あなたの敗北です...';
                isWin = isMe;
            }
            this.showResult(isWin, msg);
            return;
        }

        if ((this.mode === 'cpu' && this.game.turn !== this.myRole) || this.mode === 'cpu_watch') {
            // CPU Turn
            this.playCPUTurn();
        }
    }

    checkChaos(lastMove) {
        if (!lastMove) return;

        // 1. Nifu Detection (Deterministic)
        if (lastMove.drop && lastMove.to) {
            const x = lastMove.to.x;
            const y = lastMove.to.y;
            const piece = this.game.getPiece(x, y);

            // If it's a Pawn (Type 1), count pawns on this file
            if (piece && piece.type === 1) { // FU
                let count = 0;
                for (let ry = 0; ry < 9; ry++) {
                    const p = this.game.getPiece(x, ry);
                    if (p && p.owner === piece.owner && p.type === 1) count++;
                }

                if (count >= 2) {
                    console.log("Nifu Detected! Triggering Inversion.");
                    this.triggerInversion();
                    return; // Deterministic trigger, skip random chaos
                }
            }
        }

        // 2. Random Chaos (Accumulate probability for other moves if desired)
        // Currently only Nifu logic uses this heavily effectively?
        // Or if we want to keep the "Chaos Probability" mechanic for non-Nifu moves:
        if (this.chaosProbability > 0) {
            // Compound increase
            this.chaosProbability = Math.min(1.0, this.chaosProbability * 1.5);

            console.log("Chaos Probability Check:", this.chaosProbability);
            if (Math.random() < this.chaosProbability) {
                // Trigger Inversion
                this.triggerInversion();
                this.chaosProbability = 0; // Reset
            }
        }
    }

    triggerInversion() {
        console.log("INVERSION TRIGGERED!");
        const body = document.body;
        alert("天地明察！盤面反転！"); // Debug Alert

        if (body.classList.contains('mikami-inverted')) {
            body.classList.remove('mikami-inverted');
        } else {
            body.classList.add('mikami-inverted');
        }

        // Swap Role and Turn Logic
        // 1. Swap My Role (I become the other side)
        this.myRole = (this.myRole === SENTE) ? GOTE : SENTE;

        // 2. Swap Game Turn (Flip it back to the OTHER side)
        // Since drop() just set it to Opponent (relative to old role), 
        // and we became Opponent, now it is OUR turn.
        // But rule says "Next is Opponent's turn".
        // So we flip it to the NEW Opponent (who is Sente).
        this.game.turn = (this.game.turn === SENTE) ? GOTE : SENTE;

        this.updatePlayerLabels();
        this.updateTurnInfo();
    }

    updatePlayerLabels() {
        const senteLabel = document.querySelector('#komadai-sente .komadai-label');
        const goteLabel = document.querySelector('#komadai-gote .komadai-label');

        let senteName = "先手";
        let goteName = "後手";

        if (this.mode === 'net') {
            // Determine names based on roles
            if (this.myRole === SENTE) {
                senteName = this.myPlayerName ? `${this.myPlayerName} (あなた)` : "先手 (あなた)";
                goteName = this.netOpponentName ? `${this.netOpponentName} (相手)` : "後手 (相手)";
            } else {
                goteName = this.myPlayerName ? `${this.myPlayerName} (あなた)` : "後手 (あなた)";
                senteName = this.netOpponentName ? `${this.netOpponentName} (相手)` : "先手 (相手)";
            }
        } else {
            // Solo/CPU
            if (this.myRole === SENTE) {
                senteName = "先手 (あなた)";
                goteName = "後手 (相手)";
            } else {
                // Inverted or swapped views logic?
                senteName = "先手 (相手)";
                goteName = "後手 (あなた)";
            }
        }

        senteLabel.textContent = senteName;
        goteLabel.textContent = goteName;
    }

    // Helper to execute CPU move (handling drops correctly)
    // Wait, executeMove in main.js line 290 only handles board moves?
    // Let's refactor CPU handling block to be safer.

    async playCPUTurn() {
        if (!this.isPlaying) return;
        if (this.mode !== 'cpu' && this.mode !== 'cpu_watch') return;

        // In 'cpu' mode, ensure valid turn. In 'cpu_watch', always runs.
        if (this.mode === 'cpu' && this.game.turn === this.myRole) return;

        if (this.game.winner !== null) return;

        // Dynamic Level Switching for Watch Mode
        if (this.mode === 'cpu_watch' && this.watchModeLevels) {
            const level = this.watchModeLevels[this.game.turn];
            if (level) {
                this.cpu.setLevel(level);
            }
        }

        this.view.setThinking(true);

        // Add visual delay for watch mode
        const delay = (this.mode === 'cpu_watch') ? 800 : 50;
        await new Promise(resolve => setTimeout(resolve, delay));

        const move = await this.cpu.think();
        this.view.setThinking(false);

        if (!move || move.resign) {
            this.game.winner = (this.game.turn === SENTE ? GOTE : SENTE);
            const winnerName = (this.game.winner === SENTE ? '先手' : '後手');
            const loserName = (this.game.winner === SENTE ? '後手' : '先手');

            this.showResult(true, `${loserName}が投了しました。\n${winnerName}の勝利です！`);
            return;
        }

        if (move.type === 'drop') {
            if (this.game.drop(this.game.turn, move.piece, move.to.x, move.to.y)) {
                this.postTurn({ to: move.to, drop: true });
            }
        } else {
            // Move
            if (this.game.move(move.from.x, move.from.y, move.to.x, move.to.y, move.promote)) {
                this.postTurn({ to: move.to });
            }
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

    async showResult(isWin, message) {
        this.isPlaying = false;
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }

        // Fix: Use correct ID and display method matching CSS
        const overlay = document.getElementById('result-overlay');
        const title = document.getElementById('result-title');
        const msg = document.getElementById('result-message');
        const actionBtn = document.querySelector('.result-action-btn');

        // CPU Training Overlay
        if (this.mode === 'cpu') {
            overlay.style.display = 'flex';
            overlay.className = 'active'; // Just base

            title.style.display = 'none'; // Hide Victory/Defeat initially
            msg.textContent = "AIモデルを訓練中... (そのままお待ちください)";
            msg.style.color = "#FFD700";
            actionBtn.style.display = 'none';

            // Train
            try {
                const winner = isWin ? this.myRole : (this.myRole === 0 ? 1 : 0);
                await this.cpu.train(this.game.history, winner);
            } catch (e) {
                console.error("Training error", e);
            }

            // Show Final Result
            title.style.display = 'block';
            overlay.className = isWin ? 'result-win' : 'result-lose';
            title.textContent = isWin ? 'VICTORY' : 'DEFEAT';
            msg.textContent = message + "\n(訓練が完了しました)";
            msg.style.color = "";

            actionBtn.disabled = false;
            actionBtn.style.display = 'inline-block';
        } else {
            // Normal
            overlay.style.display = 'flex';
            overlay.className = isWin ? 'result-win' : 'result-lose';
            title.textContent = isWin ? 'VICTORY' : 'DEFEAT';
            msg.textContent = message;
            title.style.display = 'block';
            title.style.display = 'block';
            actionBtn.style.display = 'inline-block';

            // Rank Match Update
            if (this.mode === 'net' && this.myPlayerName && this.netOpponentName && isWin) {
                // Only Winner reports to avoid double submission or conflict?
                // To be safe, Winner reports.
                // Assuming 'isWin' means I am the winner.
                const reportData = {
                    winner: this.myPlayerName,
                    loser: this.netOpponentName
                };

                // Trigger AI Training (Background)
                this.cpu.train(this.game.history, this.myRole).then(() => {
                    msg.textContent += "\n[AI] 対局データから学習しました";
                }).catch(e => console.error(e));

                fetch('report_result.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reportData)
                })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            const newMsg = `レート更新: ${res.winner.old_rate} -> ${res.winner.new_rate}`;
                            msg.textContent = message + "\n" + newMsg;
                        } else {
                            console.error("Rate update failed", res);
                        }
                    })
                    .catch(err => console.error("Rate update error", err));
            }
        }
    }

    closeResult() {
        document.getElementById('result-overlay').style.display = 'none';
        this.showMainMenu();
    }

    render(lastMove) {
        this.view.render(this.game, lastMove);
    }

    updateTurnInfo() {
        const turnText = this.game.turn === SENTE ? '先手' : '後手';
        const isMyTurn = this.game.turn === this.myRole;
        const ind = document.getElementById('turn-indicator');
        if (ind) {
            ind.textContent = `${turnText} の番です ${isMyTurn ? '(あなた)' : ''} `;
            ind.style.color = isMyTurn ? '#fbbf24' : '#fff';
        }
    }

    addChatMessage(msg) {
        const div = document.getElementById('chat-messages');
        const p = document.createElement('div');
        p.textContent = msg;
        div.appendChild(p);
        div.scrollTop = div.scrollHeight;
    }
}
window.GameController = GameController; // Export

// Start
const game = new GameController();
const network = game.network; // Expose for HTML buttons
window.game = game; // Expose for HTML buttons
window.network = network;
