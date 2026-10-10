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
    for (const level of LEVELS.slice(0,3)) {
        assert(level.enemies.length >= 6 && level.enemies.length <= 7);
        const extra = level.enemies.filter(e => e.x > 2800);
        assert.equal(extra.length, 3);
        for (let i=1; i<extra.length; i++) assert(extra[i].minX - extra[i-1].maxX > 300);
        for (const e of level.enemies.filter(e => e.kind !== 'quail')) {
            assert(level.solids.some(s => s.x <= e.minX-15 && s.x+s.width >= e.maxX+15 && s.y > e.y), e.id);
        }
    }
});
test('frozen routes use spaced local wildlife',()=>{
    for(const level of LEVELS.slice(3)) {
        assert(level.enemies.length>=4 && level.enemies.length<=6);
        assert(level.enemies.every(e=>['snowhare','owl','frostbug'].includes(e.kind)));
        for(let i=1;i<level.enemies.length;i++)assert(level.enemies[i].minX-level.enemies[i-1].maxX>200);
    }
});

test('hidden habitats have three separated enemies on supported patrols', async () => {
    const { SECRET_LEVELS } = await import('../src/secret-levels.ts');
    const { ENEMY_PROFILES } = await import('../src/enemy-catalog.ts');
    const expected=[['rat','bat'],['beetle','moth'],['mimic','ghost']];
    for(const [i,room] of SECRET_LEVELS.entries()){
        assert.equal(room.enemies.length,3);
        assert.deepEqual([...new Set(room.enemies.map(e=>e.kind))].sort(),expected[i].sort());
        for(const [n,e] of room.enemies.entries()){
            assert(e.minX>room.spawn.x+400&&e.maxX<room.goal.x-200);
            if(n) assert(e.minX-room.enemies[n-1].maxX>350);
            if(!ENEMY_PROFILES[e.kind].flying)
                assert(room.solids.some(s=>!s.oneWay&&s.x<=e.minX-15&&s.x+s.width>=e.maxX+15&&s.y>e.y));
        }
    }
});
