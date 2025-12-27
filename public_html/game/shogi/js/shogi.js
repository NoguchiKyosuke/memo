/**
 * Shogi Game Logic
 */

const SENTE = 0; // Black (Bottom, moving up)
const GOTE = 1;  // White (Top, moving down)

const PIECE_Types = {
    EMPTY: 0,
    FU: 1, // Pawn
    KY: 2, // Lance
    KE: 3, // Knight
    GI: 4, // Silver
    KI: 5, // Gold
    KA: 6, // Bishop
    HI: 7, // Rook
    OU: 8, // King
    // Promoted
    TO: 11, // Promoted Pawn
    NY: 12, // Promoted Lance
    NK: 13, // Promoted Knight
    NG: 14, // Promoted Silver
    UM: 16, // Dragon Horse (Promoted Bishop)
    RY: 17  // Dragon King (Promoted Rook)
};

const PIECE_NAMES = {
    [PIECE_Types.FU]: '歩',
    [PIECE_Types.KY]: '香',
    [PIECE_Types.KE]: '桂',
    [PIECE_Types.GI]: '銀',
    [PIECE_Types.KI]: '金',
    [PIECE_Types.KA]: '角',
    [PIECE_Types.HI]: '飛',
    [PIECE_Types.OU]: '王', // Sente: 玉
    [PIECE_Types.TO]: 'と',
    [PIECE_Types.NY]: '杏', // 成香
    [PIECE_Types.NK]: '圭', // 成桂
    [PIECE_Types.NG]: '全', // 成銀
    [PIECE_Types.UM]: '馬',
    [PIECE_Types.RY]: '龍'
};

class Shogi {
    constructor() {
        this.board = []; // 9x9 grid
        this.hands = [[], []]; // Capture piles
        this.turn = SENTE;
        this.history = [];
        this.winner = null;
        this.init();
    }

    init() {
        // Reset Board
        this.board = Array(9).fill(null).map(() => Array(9).fill(null));
        // Reset Hands (Map of Type -> Count)
        this.hands = [{}, {}];
        this.winner = null;

        // Helper to place
        const place = (x, y, type, owner) => {
            if (x >= 0 && x < 9 && y >= 0 && y < 9) {
                this.board[y][x] = { type, owner };
            }
        };

        // Initialize Sente (0) - Bottom Rows 6,7,8
        place(4, 8, PIECE_Types.OU, SENTE); // 59
        place(3, 8, PIECE_Types.KI, SENTE); // 69
        place(5, 8, PIECE_Types.KI, SENTE); // 49
        place(2, 8, PIECE_Types.GI, SENTE); // 79
        place(6, 8, PIECE_Types.GI, SENTE); // 39
        place(1, 8, PIECE_Types.KE, SENTE); // 89
        place(7, 8, PIECE_Types.KE, SENTE); // 29
        place(0, 8, PIECE_Types.KY, SENTE); // 99
        place(8, 8, PIECE_Types.KY, SENTE); // 19
        place(1, 7, PIECE_Types.KA, SENTE); // 88
        place(7, 7, PIECE_Types.HI, SENTE); // 28
        for (let i = 0; i < 9; i++) place(i, 6, PIECE_Types.FU, SENTE);

        // Initialize Gote (1) - Top Rows 0,1,2
        place(4, 0, PIECE_Types.OU, GOTE); // 51
        place(3, 0, PIECE_Types.KI, GOTE); // 61
        place(5, 0, PIECE_Types.KI, GOTE); // 41
        place(2, 0, PIECE_Types.GI, GOTE); // 71
        place(6, 0, PIECE_Types.GI, GOTE); // 31
        place(1, 0, PIECE_Types.KE, GOTE); // 81
        place(7, 0, PIECE_Types.KE, GOTE); // 21
        place(0, 0, PIECE_Types.KY, GOTE); // 91
        place(8, 0, PIECE_Types.KY, GOTE); // 11
        place(7, 1, PIECE_Types.KA, GOTE); // 22
        place(1, 1, PIECE_Types.HI, GOTE); // 82
        for (let i = 0; i < 9; i++) place(i, 2, PIECE_Types.FU, GOTE);

        this.turn = SENTE;
        this.history = [];
    }

    getPiece(x, y) {
        if (x < 0 || x >= 9 || y < 0 || y >= 9) return null;
        return this.board[y][x];
    }

    // Check if move promotes
    canPromote(x, y, type, owner) {
        if (this.isPromoted(type)) return false;
        if (type === PIECE_Types.OU || type === PIECE_Types.KI) return false;

        // Promotion zone is rows 0-2 (Sente) or 6-8 (Gote)
        // Wait, y=0 is Top.
        // Sente moves UP (y decreases). Promote at y=0,1,2.
        // Gote moves DOWN (y increases). Promote at y=6,7,8.
        if (owner === SENTE && y <= 2) return true;
        if (owner === GOTE && y >= 6) return true;
        return false;
    }

    // Must promote? (e.g. Pawn/Lance at last rank)
    mustPromote(y, type, owner) {
        if (owner === SENTE) {
            if (type === PIECE_Types.FU || type === PIECE_Types.KY) return y === 0;
            if (type === PIECE_Types.KE) return y <= 1;
        } else {
            if (type === PIECE_Types.FU || type === PIECE_Types.KY) return y === 8;
            if (type === PIECE_Types.KE) return y >= 7;
        }
        return false;
    }

    isPromoted(type) {
        return type > 10;
    }

    getPromotedType(type) {
        if (this.isPromoted(type)) return type;
        switch (type) {
            case PIECE_Types.FU: return PIECE_Types.TO;
            case PIECE_Types.KY: return PIECE_Types.NY;
            case PIECE_Types.KE: return PIECE_Types.NK;
            case PIECE_Types.GI: return PIECE_Types.NG;
            case PIECE_Types.KA: return PIECE_Types.UM;
            case PIECE_Types.HI: return PIECE_Types.RY;
        }
        return type;
    }

    getDemotedType(type) {
        if (!this.isPromoted(type)) return type;
        switch (type) {
            case PIECE_Types.TO: return PIECE_Types.FU;
            case PIECE_Types.NY: return PIECE_Types.KY;
            case PIECE_Types.NK: return PIECE_Types.KE;
            case PIECE_Types.NG: return PIECE_Types.GI;
            case PIECE_Types.UM: return PIECE_Types.KA;
            case PIECE_Types.RY: return PIECE_Types.HI;
        }
        return type;
    }

    // Get all valid moves for a piece at x,y
    getValidMoves(x, y) {
        const piece = this.getPiece(x, y);
        if (!piece) return [];
        if (piece.owner !== this.turn) return []; // Not your turn

        const moves = [];
        const owner = piece.owner;
        const forward = owner === SENTE ? -1 : 1; // Sente y--

        // Helper to add move if valid
        const check = (tx, ty) => {
            if (tx < 0 || tx >= 9 || ty < 0 || ty >= 9) return;
            const target = this.getPiece(tx, ty);
            if (target && target.owner === owner) return; // Blocked by self
            moves.push({ x: tx, y: ty, capture: !!target });
        };

        const checkLine = (dx, dy) => {
            let tx = x + dx, ty = y + dy;
            while (true) {
                if (tx < 0 || tx >= 9 || ty < 0 || ty >= 9) break;
                const target = this.getPiece(tx, ty);
                if (target) {
                    if (target.owner !== owner) moves.push({ x: tx, y: ty, capture: true });
                    break;
                }
                moves.push({ x: tx, y: ty, capture: false });
                tx += dx; ty += dy;
            }
        };

        const type = piece.type;

        // Definition of moves
        // Gold Generals (and promoted pieces)
        const goldMoves = [
            [0, forward], [1, forward], [-1, forward], // Front 3
            [1, 0], [-1, 0], // Side 2
            [0, -forward] // Back 1
        ];

        switch (type) {
            case PIECE_Types.FU: // Pawn
                check(x, y + forward);
                break;

            case PIECE_Types.KY: // Lance
                checkLine(0, forward);
                break;

            case PIECE_Types.KE: // Knight
                check(x - 1, y + forward * 2);
                check(x + 1, y + forward * 2);
                break;

            case PIECE_Types.GI: // Silver
                check(x, y + forward);
                check(x - 1, y + forward);
                check(x + 1, y + forward);
                check(x - 1, y - forward);
                check(x + 1, y - forward);
                break;

            case PIECE_Types.KI: // Gold
            case PIECE_Types.TO:
            case PIECE_Types.NY:
            case PIECE_Types.NK:
            case PIECE_Types.NG:
                goldMoves.forEach(m => check(x + m[0], y + m[1]));
                break;

            case PIECE_Types.KA: // Bishop
                checkLine(1, 1); checkLine(1, -1);
                checkLine(-1, 1); checkLine(-1, -1);
                break;

            case PIECE_Types.UM: // Dragon Horse
                checkLine(1, 1); checkLine(1, -1);
                checkLine(-1, 1); checkLine(-1, -1);
                [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(m => check(x + m[0], y + m[1]));
                break;

            case PIECE_Types.HI: // Rook
                checkLine(1, 0); checkLine(-1, 0);
                checkLine(0, 1); checkLine(0, -1);
                break;

            case PIECE_Types.RY: // Dragon King
                checkLine(1, 0); checkLine(-1, 0);
                checkLine(0, 1); checkLine(0, -1);
                [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(m => check(x + m[0], y + m[1]));
                break;

            case PIECE_Types.OU: // King
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (dx === 0 && dy === 0) continue;
                        check(x + dx, y + dy);
                    }
                }
                break;
        }

        return moves;
    }

    // Execute Move
    move(fx, fy, tx, ty, promote = false) {
        if (this.winner !== null) return false;

        const piece = this.getPiece(fx, fy);
        if (!piece) return false;

        // Capture?
        const target = this.getPiece(tx, ty);
        if (target) {
            // Check for King Capture -> Game Over
            if (target.type === PIECE_Types.OU) {
                this.winner = this.turn;
                // Don't add King to hand, just end game.
                this.board[ty][tx] = piece;
                this.board[fy][fx] = null;
                this.history.push({
                    from: { x: fx, y: fy },
                    to: { x: tx, y: ty },
                    piece: piece.type,
                    promoted: promote,
                    captured: target.type,
                    gameOver: true
                });
                return true;
            }

            // Add to hand (Un-promote if needed)
            const rawType = this.getDemotedType(target.type);
            this.addToHand(this.turn, rawType);
        }

        // Update Board
        this.board[ty][tx] = piece;
        this.board[fy][fx] = null;

        // Promote Logic
        if (promote) {
            this.board[ty][tx].type = this.getPromotedType(piece.type);
        }

        // Record History
        this.history.push({
            from: { x: fx, y: fy },
            to: { x: tx, y: ty },
            piece: piece.type,
            promoted: promote,
            captured: target ? target.type : null
        });

        // Switch turn
        this.turn = this.turn === SENTE ? GOTE : SENTE;
        return true;
    }

    addToHand(owner, type) {
        if (!this.hands[owner][type]) this.hands[owner][type] = 0;
        this.hands[owner][type]++;
    }

    getFromHand(owner, type) {
        if (!this.hands[owner][type] || this.hands[owner][type] <= 0) return false;
        this.hands[owner][type]--;
        return true;
    }

    // Drop
    drop(owner, type, tx, ty) {
        if (this.turn !== owner) return false;
        if (this.getPiece(tx, ty)) return false; // Occupied

        // Check Rules
        // 1. Two Pawns (Nifu) - ALLOWED in Mikami Shogi, BANNED in Standard
        if (type === PIECE_Types.FU) {
            for (let y = 0; y < 9; y++) {
                const p = this.getPiece(tx, y);
                if (p && p.owner === owner && p.type === PIECE_Types.FU) return false;
            }
        }
        // 2. Drop Pawn mate (Uchifuzume) - Too complex to check perfectly here? Skip for now.
        // 3. No drop where valid move impossible (e.g. Pawn on last rank)
        if (owner === SENTE) {
            if (type === PIECE_Types.FU || type === PIECE_Types.KY) { if (ty === 0) return false; }
            if (type === PIECE_Types.KE) { if (ty <= 1) return false; }
        } else {
            if (type === PIECE_Types.FU || type === PIECE_Types.KY) { if (ty === 8) return false; }
            if (type === PIECE_Types.KE) { if (ty >= 7) return false; }
        }

        // Execute drop
        if (this.getFromHand(owner, type)) {
            this.board[ty][tx] = { type, owner };
            this.history.push({ drop: true, to: { x: tx, y: ty }, piece: type, owner });
            this.turn = this.turn === SENTE ? GOTE : SENTE;
            return true;
        }
        return false;
    }
}
