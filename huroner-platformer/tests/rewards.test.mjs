import test from 'node:test';
import assert from 'node:assert/strict';
import {RELICS,readRelics,discoverRelic} from '../src/rewards.ts';
import {SECRET_LEVELS} from '../src/secret-levels.ts';
test('relics persist once, reject unknown/corrupt IDs, and support unavailable storage',()=>{
 const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 assert.deepEqual(readRelics(),[]);
 assert(!discoverRelic('unknown'));assert(discoverRelic(RELICS[0].id));assert(!discoverRelic(RELICS[0].id));
 assert.deepEqual(readRelics(),[RELICS[0].id]);
 data.set('ferret-jump-relics-v1',JSON.stringify({version:1,relics:[RELICS[1].id,RELICS[1].id,'bad']}));
 assert.deepEqual(readRelics(),[RELICS[1].id]);
 localStorage.setItem=()=>{throw Error('write blocked')};
 assert(discoverRelic(RELICS[0].id));assert(readRelics().includes(RELICS[0].id),'write-only failure keeps session discovery');
 localStorage.getItem=()=>{throw Error('blocked')};
 assert(discoverRelic(RELICS[2].id));assert(readRelics().includes(RELICS[2].id));
});
test('each hidden world has a reachable upper relic and a chest before its exit',()=>{
 for(const [i,room] of SECRET_LEVELS.entries()){
  const {chest,relic}=room.rewards;assert.equal(relic.id,RELICS[i].id);
  assert(chest.x<room.goal.x-40);
  assert(room.solids.some(s=>s.oneWay&&relic.x>s.x&&relic.x<s.x+s.width&&s.y-relic.y===40));
  for(const p of [chest,relic])assert(!room.solids.some(s=>!s.oneWay&&p.x>s.x&&p.x<s.x+s.width&&p.y>s.y&&p.y<s.y+s.height));
 }
});
