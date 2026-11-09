import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZUGZWANG_FEN, parseFen, squareToPosition } from './chessPosition.js';

test('parseFen returns 25 pieces for the Zugzwang position', () => {
    const pieces = parseFen(ZUGZWANG_FEN);
    assert.equal(pieces.length, 25);
});

test('parseFen counts 12 pawns', () => {
    const pawns = parseFen(ZUGZWANG_FEN).filter((p) => p.type === 'pawn');
    assert.equal(pawns.length, 12);
});

test('parseFen places the white knight on b1 (file 1, rank 0)', () => {
    const pieces = parseFen(ZUGZWANG_FEN);
    const knight = pieces.find((p) => p.type === 'knight');
    assert.deepEqual(knight, { type: 'knight', color: 'white', file: 1, rank: 0 });
});

test('parseFen places the black king on g8 (file 6, rank 7)', () => {
    const king = parseFen(ZUGZWANG_FEN).find(
        (p) => p.type === 'king' && p.color === 'black'
    );
    assert.deepEqual(king, { type: 'king', color: 'black', file: 6, rank: 7 });
});

test('parseFen places the white king on h1 (file 7, rank 0)', () => {
    const king = parseFen(ZUGZWANG_FEN).find(
        (p) => p.type === 'king' && p.color === 'white'
    );
    assert.deepEqual(king, { type: 'king', color: 'white', file: 7, rank: 0 });
});

test('squareToPosition maps the four corners correctly', () => {
    assert.deepEqual(squareToPosition(0, 0), { x: -3.5, z: 3.5 });   // a1
    assert.deepEqual(squareToPosition(7, 0), { x: 3.5, z: 3.5 });    // h1
    assert.deepEqual(squareToPosition(0, 7), { x: -3.5, z: -3.5 });  // a8
    assert.deepEqual(squareToPosition(7, 7), { x: 3.5, z: -3.5 });   // h8
});
