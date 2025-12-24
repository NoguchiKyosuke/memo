class CPU {
    constructor(game) {
        this.game = game;
    }

    async think() {
        return new Promise(resolve => {
            setTimeout(() => {
                const move = this.getBestMove();
                resolve(move);
            }, 500); // Artificial delay
        });
    }

    getBestMove() {
        const moves = this.getAllMoves(this.game.turn);
        if (moves.length === 0) return null; // Resign

        // Simple Greedy + Randomness
        let bestScore = -Infinity;
        let bestMoves = [];

        moves.forEach(move => {
            // Simulate interaction? 
            // Since Shogi class modifies state, we'd need to clone or undo.
            // Implementing undo is good, or cloning.
            // Cloning board is cheap (9x9).

            const score = this.evaluateMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        });

        // Pick random from best
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    getAllMoves(turn) {
        const moves = [];
        const game = this.game;

        // 1. Board Moves
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const p = game.getPiece(x, y);
                if (p && p.owner === turn) {
                    const valid = game.getValidMoves(x, y);
                    valid.forEach(m => {
                        moves.push({
                            type: 'move',
                            from: { x, y },
                            to: { x: m.x, y: m.y },
                            promote: false
                        });
                        // Allow promotion if applicable
                        if (game.canPromote(m.x, m.y, p.type, turn)) {
                            moves.push({
                                type: 'move',
                                from: { x, y },
                                to: { x: m.x, y: m.y },
                                promote: true
                            });
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
                // Try dropping on empty squares
                for (let y = 0; y < 9; y++) {
                    for (let x = 0; x < 9; x++) {
                        if (!game.getPiece(x, y)) {
                            // Check rules manual simulation or use game.drop logic?
                            // Re-implement basic check here to avoid modifying game state just to check
                            if (this.canDrop(turn, type, x, y)) {
                                moves.push({
                                    type: 'drop',
                                    piece: type,
                                    to: { x, y }
                                });
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }

    canDrop(owner, type, x, y) {
        // Nifu check
        if (type === PIECE_Types.FU) {
            for (let ky = 0; ky < 9; ky++) {
                const p = this.game.getPiece(x, ky);
                if (p && p.owner === owner && p.type === PIECE_Types.FU) return false;
            }
        }
        // Last rank check
        if (owner === SENTE) {
            if (type === PIECE_Types.FU || type === PIECE_Types.KY) { if (y === 0) return false; }
            if (type === PIECE_Types.KE) { if (y <= 1) return false; }
        } else {
            if (type === PIECE_Types.FU || type === PIECE_Types.KY) { if (y === 8) return false; }
            if (type === PIECE_Types.KE) { if (y >= 7) return false; }
        }
        return true;
    }

    evaluateMove(move) {
        let score = 0;
        const game = this.game;

        if (move.type === 'move') {
            const target = game.getPiece(move.to.x, move.to.y);
            // Capture Value
            if (target) {
                score += this.getPieceValue(target.type) * 1.2; // Capture bonus
            }
            // Promotion Value
            if (move.promote) {
                const p = game.getPiece(move.from.x, move.from.y);
                score += (this.getPieceValue(game.getPromotedType(p.type)) - this.getPieceValue(p.type));
            }
            // Safety/Risk? Too complex for now
        } else {
            // Drop
            // Value depends on position?
            // Center control
            if (move.to.x >= 3 && move.to.x <= 5 && move.to.y >= 3 && move.to.y <= 5) {
                score += 10;
            }
        }

        // Random jitter
        score += Math.random() * 5;
        return score;
    }

    getPieceValue(type) {
        switch (type) {
            case PIECE_Types.FU: return 100;
            case PIECE_Types.KY: return 300;
            case PIECE_Types.KE: return 300;
            case PIECE_Types.GI: return 500;
            case PIECE_Types.KI: return 600;
            case PIECE_Types.KA: return 800;
            case PIECE_Types.HI: return 900;
            case PIECE_Types.OU: return 15000;
            case PIECE_Types.TO: return 600;
            case PIECE_Types.NY: return 600;
            case PIECE_Types.NK: return 600;
            case PIECE_Types.NG: return 600;
            case PIECE_Types.UM: return 1100; // Bishop+
            case PIECE_Types.RY: return 1300; // Rook+
        }
        return 0;
    }
}
