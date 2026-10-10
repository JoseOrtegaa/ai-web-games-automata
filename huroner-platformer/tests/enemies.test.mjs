import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_RULES, pursuitDirection, projectileExpired } from '../src/enemy-rules.ts';
import { LEVELS } from '../src/level-data.ts';
test('local pursuit turns toward the ferret but respects territory and height', () => {
    assert.equal(pursuitDirection(300, 300, 220, 320, 200, 400, 280), -1);
    assert.equal(pursuitDirection(300, 300, 380, 320, 200, 400, 280), 1);
    assert.equal(pursuitDirection(300, 300, 600, 320, 200, 400, 360), 0);
    assert.equal(pursuitDirection(300, 300, 380, 100, 200, 400, 280), 0);
});
test('shots expire by travel or lifetime, independently of the player', () => {
    assert.equal(projectileExpired(100 + ENEMY_RULES.projectileRange - 1, 100, 2000), false);
    assert.equal(projectileExpired(100 + ENEMY_RULES.projectileRange, 100, 2000), true);
    assert.equal(projectileExpired(100 - ENEMY_RULES.projectileRange, 100, 2000), true);
    assert.equal(projectileExpired(100, 100, ENEMY_RULES.projectileLifetime), true);
});
test('extended levels retain sparse, supported enemy placements', () => {
    for (const level of LEVELS) {
        assert(level.enemies.length >= 6 && level.enemies.length <= 7);
        const extra = level.enemies.filter(e => e.x > 2800);
        assert.equal(extra.length, 3);
        for (let i=1; i<extra.length; i++) assert(extra[i].minX - extra[i-1].maxX > 300);
        for (const e of level.enemies.filter(e => e.kind !== 'quail')) {
            assert(level.solids.some(s => s.x <= e.minX-15 && s.x+s.width >= e.maxX+15 && s.y > e.y), e.id);
        }
    }
});
