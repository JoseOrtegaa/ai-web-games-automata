import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level-data.ts';
import { SECRET_LEVELS } from '../src/secret-levels.ts';
for(const [index,level] of LEVELS.entries()) {
    test(`${index<3?'1':'2'}-${index%3+1}: continuous theme and traversable ground profile`,()=>{
        assert.equal(level.sections.length,1);
        assert.equal(level.sections[0].palette,'castle');
        const floors=level.solids.filter(s=>s.y+s.height===level.height && s.width>100).sort((a,b)=>a.x-b.x);
        assert.equal(floors[0].x,0);
        assert.equal(floors.at(-1).x+floors.at(-1).width,level.width);
        for(let i=1;i<floors.length;i++) {
            const gap=floors[i].x-floors[i-1].x-floors[i-1].width;
            assert(gap>=0&&gap<=90,`unsafe gap ${floors[i].x}`);
            assert(floors[i-1].y-floors[i].y<=70,`unreachable climb ${floors[i].x}`);
        }
    });
    test(`${index<3?'1':'2'}-${index%3+1}: pickups and progression markers are not buried`,()=>{
        for(const point of [...level.collectibles,...level.powerUps,level.spawn,level.checkpoint,level.goal])
            assert(!level.solids.some(s=>!s.oneWay&&point.x>s.x&&point.x<s.x+s.width&&point.y>s.y&&point.y<s.y+s.height),`buried ${point.x},${point.y}`);
    });
}
test('levels have different geometry',()=>assert.equal(new Set(LEVELS.map(l=>JSON.stringify(l.solids))).size,6));

test('secret entrances have solid landing surfaces and the room has reachable rewards',()=>{
    for(const level of LEVELS){
        assert(level.width>=4000);
        const t=level.tunnel;
        assert(level.solids.some(s=>s.y===t.y&&s.x<t.x-12&&s.x+s.width>t.x+12));
        assert(t.x<level.goal.x-500);
    }
    for(const room of SECRET_LEVELS) for(const p of [...room.collectibles,...room.powerUps,room.spawn,room.goal])
        assert(!room.solids.some(s=>!s.oneWay&&p.x>s.x&&p.x<s.x+s.width&&p.y>s.y&&p.y<s.y+s.height));
});

test('three extensive secret routes have distinct layouts and safe stairs',()=>{
    assert.equal(new Set(SECRET_LEVELS.map(l=>JSON.stringify(l.solids))).size,3);
    for(const level of SECRET_LEVELS){
        assert(level.width>=2800);
        assert(level.solids.filter(s=>s.oneWay).length>=9);
        assert(level.collectibles.length>=30);
        const floor=level.solids.filter(s=>!s.oneWay).sort((a,b)=>a.x-b.x);
        assert.equal(floor[0].x,0);
        assert.equal(floor.at(-1).x+floor.at(-1).width,level.width);
        for(let i=1;i<floor.length;i++){
            assert.equal(floor[i-1].x+floor[i-1].width,floor[i].x);
            assert(floor[i-1].y-floor[i].y<=70);
        }
    }
});
