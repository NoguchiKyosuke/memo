class ShogiView {
    constructor(boardElement, handElements) {
        this.boardEl = boardElement;
        this.handEls = handElements; // [senteEl, goteEl]
        this.cells = [];
        this.initBoard();
    }

    initBoard() {
        this.boardEl.innerHTML = '';
        this.cells = [];
        for (let y = 0; y < 9; y++) {
            const row = [];
            for (let x = 0; x < 9; x++) { // 9..1 (9-suji is Left, x=0)
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                // Star points (3,3), (3,6), (6,3), (6,6) -> Indices (2,2) etc?
                // Shogi coords 9-1, a-i. Star points usually at 3,3 (7,3 in array?), etc.
                // Indices (x,y): (2,2), (6,2), (2,6), (6,6) + center (4,4)
                if ((x === 2 || x === 6) && (y === 2 || y === 6) || (x === 4 && y === 4)) {
                    cell.classList.add('star');
                }

                this.boardEl.appendChild(cell);
                row[x] = cell; // Store by logic index
            }
            this.cells[y] = row;
        }
    }

    render(game, lastMove = null) {
        // Render Board
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const cell = this.cells[y][x];
                const piece = game.getPiece(x, y);
                cell.innerHTML = '';
                cell.className = 'cell'; // Reset

                // Star points
                if ((x === 2 || x === 6) && (y === 2 || y === 6) || (x === 4 && y === 4)) {
                    cell.classList.add('star');
                }

                if (lastMove && lastMove.to.x === x && lastMove.to.y === y) {
                    cell.classList.add('last-move');
                }

                if (piece) {
                    const pDiv = document.createElement('div');
                    pDiv.className = 'piece ' + (piece.owner === SENTE ? 'sente' : 'gote');
                    if (game.isPromoted(piece.type)) pDiv.classList.add('promoted');
                    pDiv.textContent = PIECE_NAMES[piece.type];
                    cell.appendChild(pDiv);
                }
            }
        }

        // Render Hands
        this.renderHand(0, game.hands[0]); // Sente
        this.renderHand(1, game.hands[1]); // Gote
    }

    renderHand(owner, hand) {
        const container = this.handEls[owner].querySelector('.komadai-slots');
        container.innerHTML = '';

        // Count pieces
        for (const [typeStr, count] of Object.entries(hand)) {
            if (count > 0) {
                const type = parseInt(typeStr);
                const el = document.createElement('div');
                el.className = 'komadai-piece';
                el.textContent = PIECE_NAMES[type];
                el.dataset.type = type;
                el.dataset.owner = owner;

                if (count > 1) {
                    const c = document.createElement('div');
                    c.className = 'count';
                    c.textContent = count;
                    el.appendChild(c);
                }
                container.appendChild(el);
            }
        }
    }

    highlightMoves(moves) {
        moves.forEach(m => {
            const cell = this.cells[m.y][m.x];
            cell.classList.add('valid-move');
        });
    }

    selectCell(x, y) {
        const cell = this.cells[y][x];
        cell.classList.add('selected');
    }

    clearHighlights() {
        // Remove valid-move, selected
        this.boardEl.querySelectorAll('.valid-move, .selected').forEach(el => {
            el.classList.remove('valid-move', 'selected');
        });
        // Komadai selection too
        document.querySelectorAll('.komadai-piece.selected').forEach(el => el.classList.remove('selected'));
    }

    selectHandPiece(owner, type) {
        // Simple DOM find
        const container = this.handEls[owner];
        const pieces = container.querySelectorAll('.komadai-piece');
        pieces.forEach(p => {
            if (parseInt(p.dataset.type) === type) p.classList.add('selected');
        });
    }
}
