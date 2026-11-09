/* Pure helpers for the Immortal Zugzwang board. No three / no React, so the
   logic is unit-testable under `node --test`. */

/* Final position of Sämisch–Nimzowitsch, Copenhagen 1923 (after 25...h6).
   Ranks 8 → 1, files a → h. */
export const ZUGZWANG_FEN = '6k1/3q2p1/p2bp2p/3p1r2/1p1Pp3/3bQ1PP/PP1B1rB1/1N2R1RK';

const TYPE_BY_LETTER = {
    p: 'pawn',
    n: 'knight',
    b: 'bishop',
    r: 'rook',
    q: 'queen',
    k: 'king',
};

/* Parse the placement field of a FEN into an array of placed pieces.
   file 0=a..7=h, rank 0=rank1..7=rank8. */
export function parseFen(placement) {
    const rows = placement.split('/');
    const pieces = [];
    rows.forEach((row, rowIndex) => {
        const rank = 7 - rowIndex; // row 0 is rank 8
        let file = 0;
        for (const ch of row) {
            if (/\d/.test(ch)) {
                file += Number(ch);
                continue;
            }
            const type = TYPE_BY_LETTER[ch.toLowerCase()];
            const color = ch === ch.toUpperCase() ? 'white' : 'black';
            pieces.push({ type, color, file, rank });
            file += 1;
        }
    });
    return pieces;
}

/* Centre of a board square in scene coordinates (tile size = 1). */
export function squareToPosition(file, rank) {
    return { x: file - 3.5, z: 3.5 - rank };
}
