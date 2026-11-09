import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAllGeometries, ACCESSORIES } from './chessPieceGeometry.js';

test('buildAllGeometries returns every piece geometry with vertices', () => {
    const geos = buildAllGeometries();
    const keys = ['pawn', 'rook', 'bishop', 'queen', 'king', 'knightBody', 'knightHead'];
    for (const key of keys) {
        assert.ok(geos[key], `missing geometry: ${key}`);
        assert.ok(
            geos[key].getAttribute('position').count > 0,
            `geometry ${key} has no vertices`
        );
    }
});

test('ACCESSORIES defines an entry for every piece type', () => {
    for (const type of ['pawn', 'rook', 'bishop', 'queen', 'king', 'knight']) {
        assert.ok(Array.isArray(ACCESSORIES[type]), `missing accessories: ${type}`);
    }
    assert.equal(ACCESSORIES.rook.length, 4); // four crenellation merlons
    assert.equal(ACCESSORIES.king.length, 2); // cross = vertical + horizontal bar
});
