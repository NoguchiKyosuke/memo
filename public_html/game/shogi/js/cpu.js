
class CPU {
    constructor(game) {
        this.game = game;
        this.level = 'weak'; // weak, normal, strong, god
        this.book = null;
        this.model = null; // Linear Model Weights (PST)
        this.loadingPromise = Promise.all([this.loadBook(), this.loadModel()]);

        // Piece Values (Base)
        this.values = {
            1: 100, // FU
            2: 300, // KY
            3: 300, // KE
            4: 600, // GI
            5: 700, // KI
            6: 800, // KA
            7: 900, // HI
            8: 99999, // OU (King) - High value to ensure Mate is prioritized
            9: 700, // TO
            10: 700, // NY
            11: 700, // NK
            12: 700, // NG
            13: 1100, // UM
            14: 1300  // RY
        };
    }

    async loadBook() {
        try {
            const response = await fetch('data/joseki.json');
            this.book = await response.json();
            console.log('Joseki Book Loaded', Object.keys(this.book).length, 'lines');
        } catch (e) {
            console.error('Failed to load Joseki Book', e);
            this.book = {}; // Fallback empty
        }
    }

    async loadModel() {
        try {
            // Load from MySQL via PHP
            const response = await fetch('get_model.php');
            const data = await response.json();
            // Data structure depends on how PHP returns it. 
            // My PHP returns just the JSON object { weights: ... } directly.
            this.model = data.weights;
            console.log('AI Model Loaded from DB');
        } catch (e) {
            console.error('Failed to load AI Model', e);
            this.model = null;
        }
    }

    setLevel(level) {
        this.level = level;
    }

    async think() {
        // Wait for book to load if needed
        if (this.loadingPromise) {
            await this.loadingPromise;
        }

        return new Promise(resolve => {
            // setTimeout to prevent UI freeze and allow render
            setTimeout(() => {
                const move = this.getBestMove();
                resolve(move);
            }, 100);
        });
    }

    getBestMove() {
        // Weak: Depth 2
        if (this.level === 'weak') {
            return this.minimaxRoot(2, this.game.turn);
        }

        // Normal: Gote Joseki + Depth 4
        if (this.level === 'normal') {
            if (this.game.turn === GOTE) {
                const bookMove = this.getJosekiMove();
                if (bookMove) {
                    console.log("Joseki Move (Normal/Gote):", bookMove);
                    return bookMove;
                }
            }
            return this.minimaxRoot(4, this.game.turn);
        }

        // Strong: Sente Joseki + Depth 5
        if (this.level === 'strong') {
            if (this.game.turn === SENTE) {
                const bookMove = this.getJosekiMove();
                if (bookMove) {
                    console.log("Joseki Move (Strong/Sente):", bookMove);
                    return bookMove;
                }
            }
            // Use Iterative Deepening for safer timing
            return this.iterativeDeepening(1500, this.game.turn); // 1.5s
        }

        // God (Super Strong): Joseki (Both) + ID (Time Limited) + DL Eval
        if (this.level === 'god') {
            const bookMove = this.getJosekiMove();
            if (bookMove) {
                console.log("Joseki Move (God):", bookMove);
                return bookMove;
            }
            console.log("Thinking with DL Model (ID)...");
            return this.iterativeDeepening(3000, this.game.turn); // 3s Max
        }

        return this.minimaxRoot(2, this.game.turn);
    }

    getJosekiMove() {
        if (!this.book) return null;
        const key = this.getHistoryKey();
        const moveStr = this.book[key];

        if (moveStr) {
            // Parse moveStr "7776" -> from, to
            const fromSuji = parseInt(moveStr[0]);
            const fromDan = parseInt(moveStr[1]);
            const toSuji = parseInt(moveStr[2]);
            const toDan = parseInt(moveStr[3]);

            const fx = 9 - fromSuji;
            const fy = fromDan - 1;
            const tx = 9 - toSuji;
            const ty = toDan - 1;

            return this.createMoveIfValid(fx, fy, tx, ty);
        }
        return null;
    }

    getHistoryKey() {
        return this.game.history.map(m => {
            if (m.drop) {
                return `D${m.piece}${9 - m.to.x}${m.to.y + 1}`;
            }
            return `${9 - m.from.x}${m.from.y + 1}${9 - m.to.x}${m.to.y + 1}`;
        }).join('');
    }

    createMoveIfValid(fx, fy, tx, ty) {
        const moves = this.getAllMoves(this.game.turn);
        const matches = moves.filter(m => m.type === 'move' && m.from.x === fx && m.from.y === fy && m.to.x === tx && m.to.y === ty);

        if (matches.length === 0) return null;

        const promoted = matches.find(m => m.promote);
        if (promoted) return promoted;

        return matches[0];
    }

    // --- Iterative Deepening with Time Management ---
    iterativeDeepening(maxTimeMs, turn) {
        this.searchStartTime = Date.now();
        this.timeLimit = maxTimeMs;
        this.shouldStop = false;

        let bestMove = null;
        let bestScore = -Infinity;

        // Try Depth 3, 4, 5, 6...
        // Start from 3 because 1-2 are instant anyway.
        for (let d = 2; d <= 20; d++) {
            try {
                // Pass bestMove from previous iteration to helper?
                // For simplicity, we just rely on `minimaxRoot` to search.
                // Ideally we pass PV to sort moves.
                // We'll set `this.pvMove` for `orderMoves` to use.
                if (bestMove) this.pvMove = bestMove;

                // Run Search
                const result = this.minimaxRoot(d, turn, true); // true = use timer

                if (this.shouldStop) {
                    console.log(`ID: Stopped at depth ${d} due to timeout.`);
                    break;
                }

                bestMove = result.move;
                bestScore = result.score;

                console.log(`ID: Depth ${d} done. Score: ${bestScore}`, bestMove);

                // Early Exit on Mate
                if (bestScore > 80000 || bestScore < -80000) {
                    break;
                }

                // Check Time: If we used > 50% of time, next depth likely timeouts.
                if ((Date.now() - this.searchStartTime) > (maxTimeMs * 0.5)) {
                    break;
                }

            } catch (e) {
                console.log("ID Interrupted", e);
                break;
            }
        }
        return bestMove || this.minimaxRoot(2, turn, false).move; // Fallback
    }

    // New Root
    minimaxRoot(depth, turn, useTimer = false) {
        this.nodesCount = 0; // Debug

        const moves = this.getAllMoves(turn);
        if (moves.length === 0) return { resign: true, startMove: null };

        // Sorting
        this.orderMoves(moves); // Uses this.pvMove if available

        let bestMove = null;
        let alpha = -Infinity;
        let beta = Infinity;
        let bestScore = (turn === SENTE) ? -Infinity : Infinity;
        const MATE_SCORE = 90000;

        for (const move of moves) {
            const undo = this.makeMove(move);

            // Call minimax
            const score = this.minimax(depth - 1, alpha, beta, turn === GOTE, useTimer);

            this.undoMove(undo);

            // Timeout Check at Root (Safe to break, partial results ok? No, unsafe partial)
            if (this.shouldStop) return { move: bestMove || moves[0], score: bestScore };

            if (turn === SENTE) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, score);
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                beta = Math.min(beta, score);
            }
            // Root Alpha-Beta pruning?
            // Usually valid if we just want *A* good move, but Root needs best.
            // With alpha-beta, we still find the best move (within bounds).
            // But if we broke, we might miss better moves if window wasn't full.
            // Here window is -Inf to Inf, so normal A/B logic holds.
            if (turn === SENTE && score >= beta) break;
            if (turn === GOTE && score <= alpha) break;
        }

        if (turn === SENTE && bestScore < -MATE_SCORE) return { resign: true };
        if (turn === GOTE && bestScore > MATE_SCORE) return { resign: true };

        // Return object for ID, but just move for compatibility
        if (useTimer) return { move: bestMove || moves[0], score: bestScore };
        return bestMove || moves[0];
    }

    minimax(depth, alpha, beta, isSenteTurn, useTimer) {
        if (useTimer) {
            this.nodesCount++;
            if ((this.nodesCount & 1023) === 0) { // Check every 1024 nodes
                if (Date.now() - this.searchStartTime > this.timeLimit) {
                    this.shouldStop = true;
                }
            }
            if (this.shouldStop) return isSenteTurn ? alpha : beta; // Return dummy safe value
        }

        if (depth === 0) return this.evaluate();

        const turn = isSenteTurn ? SENTE : GOTE;
        const moves = this.getAllMoves(turn);

        if (moves.length === 0) return isSenteTurn ? -100000 : 100000;

        this.orderMoves(moves); // Recursively sort? (Killers etc). For now just captures.

        if (isSenteTurn) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const undo = this.makeMove(move);
                const evalScore = this.minimax(depth - 1, alpha, beta, false, useTimer);
                this.undoMove(undo);

                if (this.shouldStop) return alpha;

                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const undo = this.makeMove(move);
                const evalScore = this.minimax(depth - 1, alpha, beta, true, useTimer);
                this.undoMove(undo);

                if (this.shouldStop) return beta;

                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    // --- Fast Board Simulation (No cloning) ---
    makeMove(move) {
        const board = this.game.board;
        let undo = {};

        if (move.type === 'move') {
            const piece = board[move.from.y][move.from.x];
            const target = board[move.to.y][move.to.x];

            undo = {
                type: 'move',
                fx: move.from.x, fy: move.from.y,
                tx: move.to.x, ty: move.to.y,
                piece: piece,
                target: target,
                originalType: piece.type
            };

            if (target) {
                // Remove from board logic is implicit.
                // Add to hand:
                const capType = this.game.getDemotedType(target.type);
                if (!this.game.hands[piece.owner][capType]) this.game.hands[piece.owner][capType] = 0;
                this.game.hands[piece.owner][capType]++;
            }

            board[move.to.y][move.to.x] = piece;
            board[move.from.y][move.from.x] = null;

            if (move.promote) piece.type = this.game.getPromotedType(piece.type);

        } else {
            // Drop
            const pieceType = move.piece;
            undo = {
                type: 'drop',
                tx: move.to.x, ty: move.to.y,
                owner: this.game.turn,
                piece: pieceType
            };

            this.game.hands[this.game.turn][pieceType]--;
            board[move.to.y][move.to.x] = { type: pieceType, owner: this.game.turn };
        }

        // Flip turn
        this.game.turn = (this.game.turn === SENTE) ? GOTE : SENTE;

        return undo;
    }

    undoMove(undo) {
        const board = this.game.board;
        // Undo Turn Flip
        this.game.turn = (this.game.turn === SENTE) ? GOTE : SENTE;

        if (undo.type === 'move') {
            const p = undo.piece;
            p.type = undo.originalType;
            board[undo.fy][undo.fx] = p;
            board[undo.ty][undo.tx] = undo.target;

            if (undo.target) {
                const capType = this.game.getDemotedType(undo.target.type);
                this.game.hands[p.owner][capType]--;
            }
        } else {
            // Undo Drop
            board[undo.ty][undo.tx] = null;
            this.game.hands[undo.owner][undo.piece]++;
        }
    }

    orderMoves(moves) {
        moves.sort((a, b) => {
            // PV Move First (for ID)
            // PV Move First (for ID)
            if (this.pvMove) {
                // Determine equality based on move type
                let isPVA = false;
                let isPVB = false;

                if (this.pvMove.type === 'move') {
                    if (a.type === 'move') {
                        isPVA = (a.from.x === this.pvMove.from.x && a.from.y === this.pvMove.from.y && a.to.x === this.pvMove.to.x && a.to.y === this.pvMove.to.y);
                    }
                    if (b.type === 'move') {
                        isPVB = (b.from.x === this.pvMove.from.x && b.from.y === this.pvMove.from.y && b.to.x === this.pvMove.to.x && b.to.y === this.pvMove.to.y);
                    }
                } else if (this.pvMove.type === 'drop') {
                    if (a.type === 'drop') {
                        isPVA = (a.piece === this.pvMove.piece && a.to.x === this.pvMove.to.x && a.to.y === this.pvMove.to.y);
                    }
                    if (b.type === 'drop') {
                        isPVB = (b.piece === this.pvMove.piece && b.to.x === this.pvMove.to.x && b.to.y === this.pvMove.to.y);
                    }
                }

                if (isPVA) return -1;
                if (isPVB) return 1;
            }

            // Capture/Promote first
            let scoreA = 0;
            if (a.type === 'move') {
                if (this.game.board[a.to.y][a.to.x]) scoreA += 1000; // Capture
                if (a.promote) scoreA += 500;
            }
            let scoreB = 0;
            if (b.type === 'move') {
                if (this.game.board[b.to.y][b.to.x]) scoreB += 1000;
                if (b.promote) scoreB += 500;
            }
            return scoreB - scoreA;
        });
    }

    evaluate() {
        // Use Model if available and in God mode? 
        // Or always use model if available?
        // Let's use model if 'god' level.
        if (this.level === 'god' && this.model) {
            return this.evaluateDL();
        }

        let score = 0;
        const board = this.game.board;

        // Board Material & Position
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const p = board[y][x];
                if (p) {
                    let val = this.values[p.type] || 0;

                    // Sente (Up) advancing is good
                    if (p.owner === SENTE && y < 4) val += 30;
                    if (p.owner === GOTE && y > 4) val += 30;

                    if (p.owner === SENTE) score += val;
                    else score -= val;
                }
            }
        }

        // Hand Material
        [SENTE, GOTE].forEach(owner => {
            const hand = this.game.hands[owner];
            for (const typeStr in hand) {
                const count = hand[typeStr];
                if (count > 0) {
                    const val = (this.values[parseInt(typeStr)] || 0) * 1.1;
                    if (owner === SENTE) score += val * count;
                    else score -= val * count;
                }
            }
        });

        return score;
    }

    evaluateDL() {
        let score = 0;
        const board = this.game.board;

        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const p = board[y][x];
                if (p) {
                    // Base Material
                    let val = this.values[p.type] || 0;

                    // Positional Encoding (PST) from Model
                    // Mapping: model['FU'][y][x]
                    // If Gote, we must flip coordinates? 
                    // Usually PST is defined from Black's perspective.
                    // For Gote, y' = 8-y, x' = 8-x.

                    const pName = this.getPieceNameCode(p.type);
                    if (this.model[pName]) {
                        if (p.owner === SENTE) {
                            val += this.model[pName][y][x];
                        } else {
                            // Flip for Gote
                            val += this.model[pName][8 - y][8 - x];
                        }
                    }

                    if (p.owner === SENTE) score += val;
                    else score -= val;
                }
            }
        }

        [SENTE, GOTE].forEach(owner => {
            const hand = this.game.hands[owner];
            for (const typeStr in hand) {
                const count = hand[typeStr];
                if (count > 0) {
                    const val = (this.values[parseInt(typeStr)] || 0) * 1.15; // Slightly higher value in DL
                    if (owner === SENTE) score += val * count;
                    else score -= val * count;
                }
            }
        });

        return score;
    }

    getPieceNameCode(type) {
        const map = {
            1: 'FU', 2: 'KY', 3: 'KE', 4: 'GI', 5: 'KI', 6: 'KA', 7: 'HI', 8: 'OU',
            11: 'FU', 12: 'KY', 13: 'KE', 14: 'GI', 16: 'KA', 17: 'HI' // Promoted use base PST? Or just High value?
            // For now map Promoted to Base for PST positional, but Base Value is high.
        };
        // Actually, promoted pieces need their own PST or fallback.
        // Simplified: Use Gold PST for Promoted Gen?
        // JSON has no TO/NY.
        if (type === 11 || type === 12 || type === 13 || type === 14) return 'KI'; // Treat as Gold
        return map[type];
    }

    // --- Training (Reinforcement Learning Lite) ---
    async train(history, winner) {
        if (this.loadingPromise) await this.loadingPromise;
        if (!this.model) return; // Cannot train without model

        console.log("Training started...");

        // Configuration
        const LEARNING_RATE = 2; // Value change per move
        const MAX_CHANGE = 100; // Cap updates

        // Logic:
        // Iterate through history.
        // If move was by WINNER -> Reinforce that position (Good move)
        // If move was by LOSER -> Penalize that position (Bad move)
        // We only update the PST for the destination square.

        history.forEach(record => {
            if (!record.drop && record.to) { // Board moves only for now
                const pieceType = record.piece;
                const pName = this.getPieceNameCode(pieceType);

                // Owner of the move
                // History doesn't explicit store owner, but we can deduce?
                // Actually shogi.js history DOES store 'owner' for drops, but for moves we depend on turn logic?
                // Wait, Shogi.js history (move) structure: { from, to, piece, promoted, captured }
                // It does NOT store who moved. But strict alternation means:
                // Move 0: Sente, Move 1: Gote...

                // Let's assume we pass the full game instance or rely on alternating index.
                // But history is just array.
            }
        });

        // Re-iterate correctly:
        // We need to know who made each move.
        // Since history is pushed sequentially from start (Sente), even indices are Sente, odd are Gote.

        history.forEach((record, index) => {
            if (record.gameOver) return; // Skip game over marker if any

            const isSenteMove = (index % 2 === 0);
            const moveOwner = isSenteMove ? SENTE : GOTE;
            const isWinner = (moveOwner === winner);

            const direction = isWinner ? 1 : -1;
            const delta = LEARNING_RATE * direction;

            if (record.drop) {
                // Drop training? Maybe later.
            } else {
                if (!record.to) return;
                const type = record.piece;
                const pName = this.getPieceNameCode(type);

                // Target Coordinates
                const tx = record.to.x;
                const ty = record.to.y;

                // Update Model
                // If Sente played, use [ty][tx].
                // If Gote played, use [8-ty][8-tx] (Model is Sente-relative).

                let my = ty;
                let mx = tx;
                if (isSenteMove) {
                    // As is
                } else {
                    my = 8 - ty;
                    mx = 8 - tx;
                }

                if (this.model[pName]) {
                    this.model[pName][my][mx] += delta;
                }
            }
        });

        // Simulate "Deep Learning" time (for UX) and Network Save
        await new Promise(r => setTimeout(r, 2000)); // 2 seconds dummy wait
        await this.saveModel();
    }

    async saveModel() {
        try {
            const payload = { weights: this.model };
            const res = await fetch('save_model.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                console.log("Model saved to server.");
            } else {
                console.error("Server save failed.");
            }
        } catch (e) {
            console.error("Save error", e);
        }
    }

    getAllMoves(turn) {
        const moves = [];
        const game = this.game;

        // 1. Board Moves
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const p = game.board[y][x]; // Direct access
                if (p && p.owner === turn) {
                    const valid = game.getValidMoves(x, y);
                    valid.forEach(m => {
                        // Check Shogi Promotion Rules:
                        // 1. Can promote if Moving TO zone OR Moving FROM zone.
                        const canPromote = game.canPromote(m.x, m.y, p.type, turn) || game.canPromote(x, y, p.type, turn);
                        // 2. Must promote if piece cannot move further (e.g. Pawn/Lance at end).
                        const mustPromote = game.mustPromote(m.y, p.type, turn);

                        if (!mustPromote) {
                            moves.push({ type: 'move', from: { x, y }, to: { x: m.x, y: m.y }, promote: false });
                        }
                        if (canPromote) {
                            moves.push({ type: 'move', from: { x, y }, to: { x: m.x, y: m.y }, promote: true });
                        }
                    });
                }
            }
        }

        // 2. Drops
        const hand = game.hands[turn];
        for (const typeStr in hand) {
            if (hand[typeStr] > 0) {
                const type = parseInt(typeStr);
                for (let y = 0; y < 9; y++) {
                    for (let x = 0; x < 9; x++) {
                        if (!game.board[y][x]) {
                            // Minimal legal check relying on Game logic would be slow if we call full game.drop check.
                            // Re-implement simplified checks: Nifu, Rank limits.
                            if (this.canDrop(turn, type, x, y)) {
                                moves.push({ type: 'drop', piece: type, to: { x, y } });
                            }
                        }
                    }
                }
            }
        }
        const safeMoves = moves.filter(move => {
            const undo = this.makeMove(move);
            // Check if Own King is under attack
            const safe = !this.isKingInCheck(turn);
            this.undoMove(undo);
            return safe;
        });

        return safeMoves;
    }

    isKingInCheck(turn) {
        // Find King
        let kx = -1, ky = -1;
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const p = this.game.board[y][x];
                if (p && p.owner === turn && p.type === 8) { // OU = 8
                    kx = x; ky = y;
                    break;
                }
            }
            if (kx !== -1) break;
        }

        if (kx === -1) return true; // King missing = Effectively checked/mate

        const opponent = (turn === SENTE) ? GOTE : SENTE;
        return this.isSquareAttacked(kx, ky, opponent);
    }

    isSquareAttacked(tx, ty, attacker) {
        const board = this.game.board;
        const forward = (attacker === SENTE) ? -1 : 1;

        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const p = board[y][x];
                if (p && p.owner === attacker) {
                    if (this.canPieceAttack(p.type, x, y, tx, ty, forward)) return true;
                }
            }
        }
        return false;
    }

    canPieceAttack(type, fx, fy, tx, ty, forward) {
        const dx = tx - fx;
        const dy = ty - fy;

        // Simplified based on Shogi types
        switch (type) {
            case 1: // FU
                return dx === 0 && dy === forward;
            case 2: // KY
                if (dx !== 0) return false;
                if (forward === -1 && dy >= 0) return false; // Sente must move up (dy < 0)
                if (forward === 1 && dy <= 0) return false; // Gote must move down (dy > 0)
                return this.isPathClear(fx, fy, tx, ty);
            case 3: // KE
                return Math.abs(dx) === 1 && dy === forward * 2;
            case 4: // GI
                if (dy === forward) return Math.abs(dx) <= 1;
                if (dy === -forward) return Math.abs(dx) === 1;
                return false;
            case 5: case 9: case 10: case 11: case 12: // KI & Promoted (except Dragon/Horse)
                // Gold move: Front 3, Side 2, Back 1 (straight back)
                if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return false;
                if (dy === forward) return true; // Front 3
                if (dy === 0) return true; // Side 2
                if (dy === -forward) return dx === 0; // Back 1
                return false;
            case 6: // KA
                if (Math.abs(dx) !== Math.abs(dy)) return false;
                return this.isPathClear(fx, fy, tx, ty);
            case 7: // HI
                if (dx !== 0 && dy !== 0) return false;
                return this.isPathClear(fx, fy, tx, ty);
            case 8: // OU
                return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
            case 13: // UM (Dragon Horse) - Bishop + King
                if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return true;
                if (Math.abs(dx) !== Math.abs(dy)) return false;
                return this.isPathClear(fx, fy, tx, ty);
            case 14: // RY (Dragon King) - Rook + King
                if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return true;
                if (dx !== 0 && dy !== 0) return false;
                return this.isPathClear(fx, fy, tx, ty);
        }
        return false;
    }

    isPathClear(fx, fy, tx, ty) {
        let dx = Math.sign(tx - fx);
        let dy = Math.sign(ty - fy);
        let x = fx + dx;
        let y = fy + dy;
        while (x !== tx || y !== ty) {
            if (this.game.board[y][x]) return false;
            x += dx;
            y += dy;
        }
        return true;
    }

    canDrop(owner, type, x, y) {
        // Nifu - Allowed in Mikami Shogi
        /*
        if (type === 1) { // FU
            for (let ky = 0; ky < 9; ky++) {
                const p = this.game.board[ky][x];
                if (p && p.owner === owner && p.type === 1) return false;
            }
        }
        */
        // Rank Limits
        if (owner === SENTE) {
            if ((type === 1 || type === 2) && y === 0) return false; // FU, KY
            if (type === 3 && y <= 1) return false; // KE
        } else {
            if ((type === 1 || type === 2) && y === 8) return false;
            if (type === 3 && y >= 7) return false;
        }
        return true;
    }
}
