import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../core.js';
import { BOSSES, BOSS_POOLS, EXTRA_ATTACKS, spawnBoss, bossEncounters, stepBoss, stepHazards, hazardContains } from '../bosses.js';

function scene(key,index=1,level=5) {
  const g=new Game(()=>.5);g.spawnTimer=g.pickupTimer=999;
  let e=key==='king'?g.spawn('chicken',true,level,true):spawnBoss(g,['blade','mage'].includes(key)?'twins':key,level);
  if(key==='mage')e=g.enemies.find(e=>e.bossPart==='mage');
  for(const other of g.enemies)if(other!==e){other.x=-2000;other.ability=999;other.speed=0;}
  Object.assign(e,{x:0,y:0,speed:0,ability:0,attackIndex:index});
  Object.assign(g.player,{x:100,y:0});
  return {g,e};
}
function advance(g,seconds){for(let i=0;i<Math.round(seconds*100);i++)g.step(.01);}
const keys=Object.keys(EXTRA_ATTACKS);

test('world pools contain five environment-specific bosses and preserve reusable attack profiles',()=>{
  assert.equal(BOSS_POOLS.length,4);
  for(let depth=0;depth<4;depth++){
    assert.equal(BOSS_POOLS[depth].length,5);
    const defs=BOSS_POOLS[depth].map(id=>BOSSES.find(b=>b.id===id));
    assert.ok(defs.every(def=>def&&def.depth===depth));
    assert.equal(new Set(defs.map(def=>def.profile)).size,5);
    assert.equal(new Set(defs.map(def=>def.form)).size,5);
  }
});


test('all encounters and final receive 30–50% extra HP on top of original level scaling',()=>{
  for(const level of [1,5,10,15,20,25,50,100])for(const def of [...BOSSES,{id:'king'}]){
    const {g,e}=scene(def.id==='twins'?'blade':def.id,0,level);
    const base=def.id==='king'?Math.max(3200,1400+level*95):520+level*105;
    const expected=level<=5?1.3:level>=25?1.5:1.3+(level-5)*.01;
    const group=bossEncounters(g)[0];assert.ok(Math.abs(group.maxHp-base*expected)<1e-7);
    assert.equal(group.hp,group.maxHp);
    if(e.shieldKeyId){const key=g.enemies.find(a=>a.id===e.shieldKeyId);assert.equal(key.maxHp,55+level*7);}
    const hp=e.hp;g.level+=10;g.mutate();assert.equal(e.hp,hp,'leveling cannot heal a living boss');
  }
  const g=new Game(()=>.5);assert.equal(g.spawn('rabbit').maxHp,23);
});

test('each boss actor cycles through originals and exactly two reachable new attacks',()=>{
  const seen=new Set();
  for(const key of keys){
    const {g,e}=scene(key,0),count=key==='king'?5:3,attacks=[];
    for(let i=0;i<count*2;i++){
      Object.assign(e,{ability:0,castLeft:0,pending:null,charge:0,leap:null});
      stepBoss(g,e,.01,100);attacks.push(e.lastAttack);
    }
    assert.deepEqual(attacks.slice(0,count),attacks.slice(count),key);
    for(const id of EXTRA_ATTACKS[key]){assert.equal(attacks.filter(a=>a===id).length,2);seen.add(id);}
  }
  assert.equal(seen.size,24);
});

test('all 24 additions warn before damage, lock aim and damage only inside their geometry',()=>{
  for(const key of keys)for(let slot=0;slot<2;slot++){
    const {g,e}=scene(key,(key==='king'?3:1)+slot);
    stepBoss(g,e,.01,100);const id=e.lastAttack;
    assert.ok(g.hazards.length>0,id);assert.ok(g.hazards.every(h=>h.age<=-.75),id);
    const geometry=g.hazards.map(h=>[h.x,h.y,h.angle]);
    stepHazards(g,.7);assert.equal(g.player.hp,100,id+' early damage');
    g.player.x=900;stepHazards(g,.01);
    assert.deepEqual(g.hazards.map(h=>[h.x,h.y,h.angle]),geometry,id+' tracks player');
    for(const h of g.hazards.filter(h=>h.damage>0)){
      h.age=0;const radius=h.kind==='ring'?h.radius:h.kind==='sector'?h.range*.5:h.kind==='beam'?h.range*.5:0;
      const angle=['sector','beam'].includes(h.kind)?h.angle:0;
      const exposed={x:h.x+Math.cos(angle)*radius,y:h.y+Math.sin(angle)*radius};
      assert.ok(hazardContains(h,exposed),id+' exposed');
      assert.equal(hazardContains(h,{x:h.x+2000,y:h.y+2000}),false,id+' escape');
      Object.assign(g.player,{...exposed,hp:100,invuln:0});g.hazards=[h];stepHazards(g,.001);
      assert.ok(g.player.hp<100,id+' actual hit');
    }
  }
});

test('new projectiles, lunge and leaps hit after warning and miss a lateral escape',()=>{
  for(const [key,index,angle] of [['blade',1,0],['mage',2,0],['prism',2,0],['weaver',2,0],['reaper',1,.35],['antler',2,0],['ember',2,0]]){
    for(const dodge of [false,true]){
      const {g,e}=scene(key,index);g.step(.01);advance(g,.7);assert.equal(g.player.hp,100,key+' early');
      if(dodge)Object.assign(g.player,{x:-300,y:300});
      else if(angle)Object.assign(g.player,{x:100*Math.cos(angle),y:100*Math.sin(angle)});
      advance(g,1.2);assert.equal(g.player.hp<100,!dodge,key+(dodge?' escape':' hit'));
    }
  }
});

test('new attacks freeze during choices, cancel on death, and never release dead-owner projectiles',()=>{
  for(const key of keys)for(let slot=0;slot<2;slot++){
    const {g,e}=scene(key,(key==='king'?3:1)+slot);g.step(.01);g.offer();
    const before=JSON.stringify(g);advance(g,2);assert.equal(JSON.stringify(g),before);
    g.state='playing';e.shielded=false;g.hit(e,1e9);
    assert.ok(g.hazards.every(h=>h.ownerId!==e.id));advance(g,2);
    assert.ok(g.shots.every(s=>s.ownerId!==e.id));
  }
});

test('new and final attacks obey shared hazard and projectile limits',()=>{
  for(const key of keys)for(let slot=0;slot<2;slot++){
    const {g,e}=scene(key,(key==='king'?3:1)+slot);
    g.hazards=Array.from({length:63},()=>({ownerId:e.id,kind:'circle',radius:1,x:900,y:900,age:-10,duration:1,damage:0}));
    g.shots=Array.from({length:149},()=>({ownerId:e.id,kind:'magic',x:900,y:900,vx:0,vy:0,life:3,age:0}));
    stepBoss(g,e,.01,100);stepBoss(g,e,1.1,100);
    assert.ok(g.hazards.length<=64);assert.ok(g.shots.length<=150);
  }
});


test('final arena king gains HP and escalates into overlapping but warned phases',()=>{
  const g=new Game(()=>.5);g.level=35;const king=g.debugFinalArena();
  assert.ok(king.finalBoss);assert.equal(king.bossType,'final_king');assert.equal(king.bossTheme,4);assert.equal(king.finalPhase,1);
  const direct=new Game(()=>.5);direct.level=35;const base=direct.spawn('chicken',true,35,true);
  assert.ok(king.maxHp>base.maxHp);

  Object.assign(g.player,{x:100,y:0});
  king.x=0;king.y=0;king.speed=0;king.ability=0;king.attackIndex=0;
  stepBoss(g,king,.01,100);
  const phase1Hazards=g.hazards.length;assert.ok(phase1Hazards>=1);

  g.hazards=[];g.shots=[];king.pending=null;king.castLeft=0;king.charge=0;king.hp=king.maxHp*.69;king.ability=0;king.attackIndex=0;
  stepBoss(g,king,.01,100);assert.equal(king.finalPhase,2);assert.ok(g.hazards.length>phase1Hazards);assert.ok(g.hazards.every(h=>h.age<0));

  g.hazards=[];g.shots=[];king.pending=null;king.castLeft=0;king.charge=0;king.hp=king.maxHp*.34;king.ability=0;king.attackIndex=0;
  stepBoss(g,king,.01,100);assert.equal(king.finalPhase,3);assert.ok(g.hazards.some(h=>h.kind==='ring'));assert.ok(g.hazards.filter(h=>h.kind==='beam').length>=3);assert.ok(g.hazards.every(h=>h.age<0));
});

test('final arena limits normal enemies and clamps combatants inside its boundary',()=>{
  const g=new Game(()=>.5);g.level=35;const king=g.debugFinalArena();g.player.invuln=999;
  g.spawnTimer=0;
  for(let i=0;i<1200;i++)g.step(.05,{x:1,y:1});
  const minions=g.enemies.filter(e=>!e.boss&&!e.shieldOwnerId&&e.hp>0);
  assert.ok(minions.length<=4);assert.ok(Math.hypot(g.player.x,g.player.y)<=267.000001);
  assert.ok(Math.hypot(king.x,king.y)<=237.000001);
});
