import test from 'node:test';
import assert from 'node:assert/strict';
import {FROZEN_LEVELS,FROZEN_SECRETS} from '../src/frozen-levels.ts';
import {RELICS} from '../src/rewards.ts';
test('frozen stages offer ice, high bridges, sparse fauna and a guarded final door',()=>{
 assert.equal(FROZEN_LEVELS.length,3);
 for(const [i,level] of FROZEN_LEVELS.entries()){
  assert(level.solids.filter(s=>s.surface==='ice').length>=5);
  assert(level.solids.filter(s=>s.oneWay).length>=5);
  assert(level.enemies.length<=6);
  assert(level.tunnel.x<level.goal.x-400);
  assert.equal(Boolean(level.boss),i===2);
 }
});
test('three frozen secret routes have reachable rewards and distinct relics',()=>{
 assert.equal(FROZEN_SECRETS.length,3);
 for(const [i,level] of FROZEN_SECRETS.entries()){
  const {chest,relic}=level.rewards;
  assert.equal(relic.id,RELICS[i+3].id);
  assert(level.solids.some(s=>s.oneWay&&relic.x>s.x&&relic.x<s.x+s.width&&s.y-relic.y===40));
  assert(chest.x<level.goal.x);
  assert(level.enemies.length===3);
  for(let n=1;n<3;n++)assert(level.enemies[n].minX-level.enemies[n-1].maxX>300);
 }
});
