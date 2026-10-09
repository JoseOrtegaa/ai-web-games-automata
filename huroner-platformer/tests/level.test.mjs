import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVEL } from '../src/level-data.ts';

test('five connected environments have different materials and traversable ground profiles', () => {
    assert.deepEqual(LEVEL.sections.map(s => s.palette), ['house','garage','park','mountain','castle']);
    const floors = LEVEL.solids.filter(s => s.y+s.height === LEVEL.height).sort((a,b) => a.x-b.x);
    assert.equal(floors[0].x, 0);
    assert.equal(floors.at(-1).x+floors.at(-1).width, LEVEL.width);
    for (let i=1; i<floors.length; i++) {
        const gap = floors[i].x-floors[i-1].x-floors[i-1].width;
        assert(gap>=0 && gap<=100, `unsafe ground gap at ${floors[i].x}`);
        assert(floors[i-1].y-floors[i].y<=75, `unreachable climb at ${floors[i].x}`);
    }
    const mountain = floors.filter(s => s.x>=8400&&s.x<11200);
    const castle = floors.filter(s => s.x>=11200);
    assert(new Set(mountain.map(s=>s.y)).size>=3);
    assert(new Set(castle.map(s=>s.y)).size>=4);
    assert(LEVEL.solids.some(s=>s.surface==='metal'&&s.width>=500&&s.oneWay));
    assert(LEVEL.solids.filter(s=>s.surface==='bark').length>=4);
});

test('pickups and spawn/checkpoint/goal are not buried in solid geometry', () => {
    for (const p of [...LEVEL.collectibles,...LEVEL.powerUps,LEVEL.spawn,LEVEL.checkpoint,LEVEL.goal]) {
        assert(!LEVEL.solids.some(s=>!s.oneWay&&p.x>s.x&&p.x<s.x+s.width&&p.y>s.y&&p.y<s.y+s.height), `buried point ${p.x},${p.y}`);
    }
});
