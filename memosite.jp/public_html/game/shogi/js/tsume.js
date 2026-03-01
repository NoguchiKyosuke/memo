/**
 * Tsume Shogi Generator (Generate & Verify)
 */
class TsumeGenerator {
    constructor(game) {
        this.game = game;
    }

    // Main Entry
    async generate(moves) {
        let problem = null;
        let attempt = 0;

        console.log(`Generating Tsume Problem (${moves} moves)...`);

        // Infinite loop (until success) as requested
        while (true) {
            attempt++;
            this.setupRandomBoard(moves);

            // Yield to UI thread every 10 attempts to prevent freeze
            if (attempt % 10 === 0) await new Promise(r => setTimeout(r, 0));

            // Check if 1-move mate exists (Too easy for 3-moves)
            if (moves > 1) {
                if (await this.verifyMate(1)) continue;
            }

            // Check if Mate in N exists
            if (await this.verifyMate(moves)) {
                console.log(`Problem Found! Attempt ${attempt}`);
                problem = {
                    board: JSON.parse(JSON.stringify(this.game.board)),
                    hands: JSON.parse(JSON.stringify(this.game.hands)),
                    moves: moves
                };
                break;
            }
        }

        this.loadProblem(problem);
        return problem;
    }

    setupRandomBoard(moves) {
        // Clear
        this.game.init();
        const board = Array(9).fill(null).map(() => Array(9).fill(null));
        this.game.board = board;
        this.game.hands = { 0: {}, 1: {} };

        // 1. Place Gote King (Strict Corner 0-1)
        const kx = Math.floor(Math.random() * 2);
        const ky = Math.floor(Math.random() * 2);
        board[ky][kx] = { type: 8, owner: 1 };

        // 2. Add Defenders (Gote) 
        const numDef = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numDef; i++) {
            this.placePieceNear(kx, ky, 1, [1, 2, 5, 9]);
        }

        // 3. Add Attackers (Sente) - On board
        if (Math.random() > 0.5) this.placePieceNear(kx, ky, 0, [9, 5, 4]);

        // 4. Give Sente Hand
        // Tuned for 3-move: One major piece or 2 minors
        if (moves >= 3) {
            const set = Math.random();
            if (set < 0.33) { this.game.hands[0][5] = 1; this.game.hands[0][4] = 1; } // Kin Gin
            else if (set < 0.66) { this.game.hands[0][5] = 1; this.game.hands[0][2] = 1; } // Kin Kyo
            else { this.game.hands[0][7] = 1; } // Hisha
        } else {
            // 1 move
            this.game.hands[0][5] = 1; // Kin
        }
    }

    placePieceNear(cx, cy, owner, validTypes) {
        // Try nearby empty spot
        for (let i = 0; i < 10; i++) {
            const dx = Math.floor(Math.random() * 3) - 1;
            const dy = Math.floor(Math.random() * 3) - 1;
            const x = cx + dx;
            const y = cy + dy;
            if (x >= 0 && x < 9 && y >= 0 && y < 9 && (dx !== 0 || dy !== 0)) {
                if (!this.game.board[y][x]) {
                    const t = validTypes[Math.floor(Math.random() * validTypes.length)];
                    this.game.board[y][x] = { type: t, owner: owner };
                    return;
                }
            }
        }
    }

    async verifyMate(moves) {
        if (!this.game.cpu) return false;

        const searchDepth = moves + 1;

        // Use sync minimax (fastest)
        const res = this.game.cpu.minimaxRoot(searchDepth, 0, false);

        if (res.score > 80000) return true;
        return false;
    }

    loadProblem(prob) {
        this.game.init();
        this.game.board = Array(9).fill(null).map(() => Array(9).fill(null));
        if (prob.board && Array.isArray(prob.board[0])) {
            prob.board.forEach((row, y) => {
                if (Array.isArray(row)) {
                    row.forEach((p, x) => {
                        if (p) this.game.board[y][x] = { type: p.type, owner: p.owner };
                    });
                }
            });
        }
        this.game.hands = JSON.parse(JSON.stringify(prob.hands));
    }
}

// Attach to global game object or logic?
// Ideally `GameController` uses this.
