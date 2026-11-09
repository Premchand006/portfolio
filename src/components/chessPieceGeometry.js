import * as THREE from 'three';

/* Each profile is a silhouette revolved around the Y axis (LatheGeometry).
   Points are [radius, height], bottom (y=0) → top. Authored so the base ring
   rests on the board (y=0). Max radius ~0.31 keeps a piece inside one tile. */
export const PIECE_PROFILES = {
    pawn: [
        [0.00, 0.00], [0.26, 0.00], [0.26, 0.05], [0.18, 0.08],
        [0.12, 0.14], [0.10, 0.30], [0.16, 0.34], [0.10, 0.38],
        [0.16, 0.42], [0.17, 0.48], [0.13, 0.53], [0.07, 0.56], [0.00, 0.57],
    ],
    rook: [
        [0.00, 0.00], [0.28, 0.00], [0.28, 0.06], [0.20, 0.10],
        [0.16, 0.16], [0.16, 0.46], [0.22, 0.50], [0.24, 0.56],
        [0.24, 0.60], [0.16, 0.60], [0.16, 0.58], [0.00, 0.58],
    ],
    bishop: [
        [0.00, 0.00], [0.27, 0.00], [0.27, 0.06], [0.18, 0.10],
        [0.12, 0.16], [0.10, 0.40], [0.16, 0.46], [0.10, 0.50],
        [0.17, 0.56], [0.18, 0.62], [0.12, 0.70], [0.06, 0.76],
        [0.05, 0.80], [0.00, 0.81],
    ],
    queen: [
        [0.00, 0.00], [0.30, 0.00], [0.30, 0.06], [0.20, 0.11],
        [0.13, 0.18], [0.11, 0.55], [0.18, 0.62], [0.12, 0.66],
        [0.22, 0.74], [0.24, 0.82], [0.16, 0.84], [0.00, 0.85],
    ],
    king: [
        [0.00, 0.00], [0.31, 0.00], [0.31, 0.06], [0.21, 0.11],
        [0.14, 0.18], [0.12, 0.60], [0.19, 0.68], [0.13, 0.72],
        [0.22, 0.82], [0.22, 0.90], [0.15, 0.92], [0.00, 0.93],
    ],
    /* Short collar/base the knight head sits on. */
    knightBody: [
        [0.00, 0.00], [0.28, 0.00], [0.28, 0.06], [0.18, 0.11],
        [0.14, 0.18], [0.13, 0.30], [0.00, 0.30],
    ],
};

/* 2D horse-head silhouette in XY (x = forward, y = up), extruded along Z.
   Sits on top of the knight collar (placed at y = 0.28 by the renderer). */
const KNIGHT_HEAD_POINTS = [
    [-0.12, 0.00], [0.12, 0.00], [0.14, 0.18], [0.10, 0.30],
    [0.20, 0.40], [0.22, 0.46], [0.14, 0.50], [0.06, 0.52],
    [0.02, 0.62], [-0.04, 0.50], [-0.10, 0.52], [-0.14, 0.40],
    [-0.18, 0.26], [-0.16, 0.10],
];

export function buildLatheGeometry(profile, segments = 48) {
    const points = profile.map(([r, y]) => new THREE.Vector2(r, y));
    return new THREE.LatheGeometry(points, segments);
}

export function buildKnightHeadGeometry() {
    const shape = new THREE.Shape();
    KNIGHT_HEAD_POINTS.forEach(([x, y], i) => {
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    });
    shape.closePath();
    const depth = 0.18;
    const geo = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2,
        steps: 1,
    });
    geo.translate(0, 0, -depth / 2); // centre the thickness on Z
    return geo;
}

export function buildAllGeometries() {
    return {
        pawn: buildLatheGeometry(PIECE_PROFILES.pawn),
        rook: buildLatheGeometry(PIECE_PROFILES.rook),
        bishop: buildLatheGeometry(PIECE_PROFILES.bishop),
        queen: buildLatheGeometry(PIECE_PROFILES.queen),
        king: buildLatheGeometry(PIECE_PROFILES.king),
        knightBody: buildLatheGeometry(PIECE_PROFILES.knightBody),
        knightHead: buildKnightHeadGeometry(),
    };
}

/* Extra primitive meshes layered on top of the lathe body. Each entry is
   { shape: 'box'|'sphere', args, pos } consumed by <Piece> in ChessBoard3D. */
const TWO_PI = Math.PI * 2;

const rookMerlons = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * TWO_PI + Math.PI / 4;
    const R = 0.18;
    return {
        shape: 'box',
        args: [0.1, 0.09, 0.1],
        pos: [Math.cos(a) * R, 0.625, Math.sin(a) * R],
    };
});

const queenCrown = (() => {
    const arr = [];
    const R = 0.19;
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TWO_PI;
        arr.push({ shape: 'sphere', args: [0.045, 12, 10], pos: [Math.cos(a) * R, 0.87, Math.sin(a) * R] });
    }
    arr.push({ shape: 'sphere', args: [0.06, 16, 12], pos: [0, 0.92, 0] });
    return arr;
})();

export const ACCESSORIES = {
    pawn: [],
    rook: rookMerlons,
    bishop: [{ shape: 'sphere', args: [0.06, 16, 12], pos: [0, 0.84, 0] }],
    queen: queenCrown,
    king: [
        { shape: 'box', args: [0.06, 0.20, 0.06], pos: [0, 1.03, 0] }, // vertical bar
        { shape: 'box', args: [0.16, 0.06, 0.06], pos: [0, 1.00, 0] }, // horizontal bar
    ],
    knight: [],
};
