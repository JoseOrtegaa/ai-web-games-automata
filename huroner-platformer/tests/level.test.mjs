import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level-data.ts';
for(const [index,level] of LEVELS.entries()) {
    test(`1-${index+1}: continuous theme and traversable ground profile`,()=>{
        assert.equal(level.sections.length,1);
        assert.equal(level.sections[0].palette,'castle');
        const floors=level.solids.filter(s=>s.y+s.height===level.height).sort((a,b)=>a.x-b.x);
        assert.equal(floors[0].x,0);
        assert.equal(floors.at(-1).x+floors.at(-1).width,level.width);
        for(let i=1;i<floors.length;i++) {
            const gap=floors[i].x-floors[i-1].x-floors[i-1].width;
            assert(gap>=0&&gap<=90,`unsafe gap ${floors[i].x}`);
            assert(floors[i-1].y-floors[i].y<=70,`unreachable climb ${floors[i].x}`);
        }
    });
    test(`1-${index+1}: pickups and progression markers are not buried`,()=>{
        for(const point of [...level.collectibles,...level.powerUps,level.spawn,level.checkpoint,level.goal])
            assert(!level.solids.some(s=>!s.oneWay&&point.x>s.x&&point.x<s.x+s.width&&point.y>s.y&&point.y<s.y+s.height),`buried ${point.x},${point.y}`);
    });
}
test('levels have different geometry',()=>assert.equal(new Set(LEVELS.map(l=>JSON.stringify(l.solids))).size,3));
