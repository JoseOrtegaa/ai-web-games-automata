import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, xpNeeded, BOSS_TIME } from '../core.js';
import { BOSSES, spawnBoss, bossEncounters, stepBoss, hazardContains, stepHazards, stepBossShot } from '../bosses.js';
function scene(type, level=5) {
  const g=new Game(()=>.5);g.spawnTimer=g.pickupTimer=999;
  const e=spawnBoss(g,type,level);Object.assign(e,{x:0,y:0,speed:0,ability:0});
  Object.assign(g.player,{x:100,y:0,shield:0,shieldDelay:999});return {g,e};
}
function advance(g,time,input){for(let left=time;left>1e-8;left-=.01)g.step(Math.min(.01,left),input);}
function approx(a,b){assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);}

test('twenty bosses are split into five distinct random bosses per world',()=>{
  assert.equal(BOSSES.length,20);assert.equal(new Set(BOSSES.map(b=>b.id)).size,20);
  for(let depth=0;depth<4;depth++){
    const defs=BOSSES.filter(b=>b.depth===depth);assert.equal(defs.length,5);
    assert.equal(new Set(defs.map(b=>b.profile)).size,5);
    const chosen=new Set();
    for(let i=0;i<5;i++){const g=new Game(()=> (i+.05)/5);g.worldDepth=depth;chosen.add(spawnBoss(g).bossType);}
    assert.equal(chosen.size,5);
    const g=new Game(()=>.5);g.worldDepth=depth;let prior=null;
    for(let i=0;i<20;i++){const e=spawnBoss(g);assert.equal(e.bossTheme,depth);assert.notEqual(e.bossType,prior);prior=e.bossType;}
  }
});

test('milestones 5/10/15 create one encounter each, preserve living encounters and level scaling',()=>{
  const g=new Game(()=>.5);let hp=0;
  for(const n of [5,10,15]){
    g.state='playing';g.level=n-1;g.xp=xpNeeded(n-1);g.checkLevel();
    const groups=bossEncounters(g);assert.equal(groups.length,n/5);
    assert.equal(g.boss.bossLevel,n);assert.ok(g.boss.encounterMaxHp>hp);hp=g.boss.encounterMaxHp;
    g.checkLevel();assert.equal(bossEncounters(g).length,n/5);
  }
});

test('twins share a stable health bar, one reward and count, in either kill order',()=>{
  for(const first of ['blade','mage']){
    const {g}=scene('twins'),parts=g.enemies.filter(e=>e.boss);
    const a=parts.find(e=>e.bossPart===first),b=parts.find(e=>e!==a),max=a.encounterMaxHp;
    assert.equal(parts.length,2);assert.equal(g.events.filter(e=>e.type==='boss').length,1);
    assert.equal(bossEncounters(g)[0].hp,max);g.hit(a,1e6);
    assert.equal(g.kills,0);assert.equal(g.xp,0);assert.equal(g.gems.length,0);
    assert.equal(bossEncounters(g).length,1);assert.equal(bossEncounters(g)[0].maxHp,max);assert.equal(bossEncounters(g)[0].hp,max/2);
    g.hit(b,1e6);assert.equal(g.kills,1);assert.equal(g.xp,6);assert.equal(g.gems[0].value,14);
    assert.equal(bossEncounters(g).length,0);assert.equal(g.state,'playing');
    g.hit(a,1e6);assert.equal(g.kills,1);
  }
});

test('twins use a close sword sector and a delayed magical fan',()=>{
  const {g,e}=scene('twins');stepBoss(g,e,.01,100);
  assert.equal(g.hazards[0].kind,'sector');assert.equal(g.hazards[0].damage,e.damage);
  const mage=g.enemies.find(e=>e.bossPart==='mage');mage.ability=0;
  stepBoss(g,mage,.01,200);assert.equal(mage.pending.kind,'magic');assert.equal(g.shots.length,0);
  stepBoss(g,mage,.86,200);assert.equal(g.shots.length,3);assert.ok(g.shots.every(s=>s.kind==='magic'));
});

test('prismatic quail laser locks direction, warns, hurts in beam and allows lateral escape',()=>{
  for(const dodge of [false,true]){
    const {g,e}=scene('prism');stepBoss(g,e,.01,100);const h=g.hazards[0];
    assert.equal(h.kind,'beam');assert.equal(h.angle,0);assert.ok(h.age<=-1);
    stepHazards(g,.9);assert.equal(g.player.hp,100);
    if(dodge)g.player.y=90;
    stepHazards(g,.11);assert.equal(h.angle,0);assert.equal(g.player.hp,dodge?100:100-e.damage);
  }
});

test('quail heals only after three active seconds without hits, resets on any weapon hit, never exceeds cap',()=>{
  const {g,e}=scene('prism');e.hp-=100;e.ability=999;g.player.x=500;
  for(let i=0;i<60;i++)stepBoss(g,e,.05,500);approx(e.hp,e.maxHp-100);
  for(let i=0;i<20;i++)stepBoss(g,e,.05,500);approx(e.hp,e.maxHp-100+e.maxHp*.018);
  g.hit(e,1);const hp=e.hp;
  for(let i=0;i<40;i++)stepBoss(g,e,.05,500);approx(e.hp,hp);
  for(let i=0;i<500;i++)stepBoss(g,e,.05,500);assert.equal(e.hp,e.maxHp);
});

test('bastion blocks all damage until its own blue rabbit dies, permanently and without cross-unlocking',()=>{
  const {g,e}=scene('bastion');const other=spawnBoss(g,'bastion',10);const hp=e.hp;
  g.hit(e,1e9);assert.equal(e.hp,hp);assert.equal(g.kills,0);
  const key=g.enemies.find(k=>k.id===e.shieldKeyId);assert.ok(key.shieldOwnerId===e.id&&!key.boss);
  g.hit(key,1e6);assert.equal(e.shielded,false);assert.equal(other.shielded,true);
  assert.equal(g.events.filter(e=>e.type==='shieldBreak').length,1);
  g.hit(e,30);assert.equal(e.hp,hp-30);advance(g,.1);assert.equal(e.shielded,false);
});

test('antler charge waits for warning then follows locked direction',()=>{
  const {g,e}=scene('antler');stepBoss(g,e,.01,100);
  assert.equal(e.charge,0);assert.equal(e.pending.kind,'charge');assert.equal(g.hazards[0].damage,0);
  g.player.y=150;stepBoss(g,e,.91,180);
  assert.equal(e.charge,.75);approx(e.vx,285);approx(e.vy,0);
});

test('bombardier and storm create staggered fixed zones; spider leaves persistent web hazards',()=>{
  for(const [type,kind,duration] of [['mortar','circle',.3],['storm','lightning',.25],['weaver','web',3]]){
    const {g,e}=scene(type);stepBoss(g,e,.01,100);assert.equal(g.hazards.length,3);
    assert.ok(g.hazards.every(h=>h.kind===kind&&h.age<=-.9&&h.duration===duration));
    const coords=g.hazards.map(h=>[h.x,h.y]);g.player.x=999;stepHazards(g,.5);
    assert.deepEqual(g.hazards.map(h=>[h.x,h.y]),coords);assert.equal(g.player.hp,100);
    if(type!=='weaver')assert.ok(g.hazards[0].age>g.hazards[1].age&&g.hazards[1].age>g.hazards[2].age);
  }
});

test('bell wave grows with a safe interior; fire fox uses a locked sustained cone',()=>{
  const bell=scene('bell');stepBoss(bell.g,bell.e,.01,100);const ring=bell.g.hazards[0];ring.age=1;
  assert.equal(hazardContains(ring,{x:148,y:0}),true);assert.equal(hazardContains(ring,{x:0,y:0}),false);
  const fox=scene('ember');stepBoss(fox.g,fox.e,.01,100);const cone=fox.g.hazards[0];
  assert.equal(cone.duration,1.3);assert.equal(hazardContains(cone,{x:100,y:0}),true);
  assert.equal(hazardContains(cone,{x:-100,y:0}),false);assert.equal(hazardContains(cone,{x:0,y:100}),false);
});

test('reaper scythe returns toward its living owner and ends when caught',()=>{
  const {g,e}=scene('reaper');stepBoss(g,e,.01,100);assert.equal(g.shots.length,0);
  stepBoss(g,e,.86,100);const s=g.shots[0];assert.equal(s.kind,'scythe');assert.ok(s.vx>0);
  s.x=150;stepBossShot(g,s,.81);assert.ok(s.vx<0);
  s.x=10;stepBossShot(g,s,.1);assert.equal(s.life,0);
});

test('every boss attack can damage an exposed player after its warning and be avoided outside its shape',()=>{
  for(const def of BOSSES){
    const {g,e}=scene(def.id);stepBoss(g,e,.01,100);
    const damaging=g.hazards.find(h=>h.damage>0);
    if(damaging){
      stepHazards(g,.2);assert.equal(g.player.hp,100,def.id+' warning');
      Object.assign(g.player,{x:damaging.x,y:damaging.y,invuln:0});
      if(damaging.kind==='ring')g.player.x+=damaging.radius+damaging.rate*.01;
      damaging.age=-.001;stepHazards(g,.011);assert.ok(g.player.hp<100,def.id+' damage');
      assert.equal(hazardContains(damaging,{x:damaging.x+2000,y:damaging.y+2000}),false);
    }else assert.ok(e.pending,def.id+' delayed projectile/charge');
  }
});

test('pause/choice freeze boss timers, healing, hazards and projectiles; reset clears encounter state',()=>{
  const {g,e}=scene('prism');e.hp-=100;stepBoss(g,e,.01,100);g.offer();
  const frozen=JSON.stringify(g);advance(g,5);assert.equal(JSON.stringify(g),frozen);
  g.reset();assert.equal(g.hazards.length,0);assert.equal(g.lastBossType,null);assert.equal(bossEncounters(g).length,0);
});

test('dead owners cancel hazards/shots, terminal damage prevents later pickups and cannot reverse victory',()=>{
  const {g,e}=scene('prism');stepBoss(g,e,.01,100);g.hit(e,1e9);assert.equal(g.hazards.length,0);
  const crow=spawnBoss(g,'reaper');crow.ability=0;stepBoss(g,crow,.01,100);stepBoss(g,crow,.86,100);
  assert.ok(g.shots.length);g.hit(crow,1e9);assert.equal(g.shots.length,0);
  const {g:f,e:b}=scene('prism');stepBoss(f,b,.01,100);f.player.hp=1;f.hazards[0].age=0;
  f.gems.push({x:100,y:0,value:100});f.step(.01);assert.equal(f.state,'dead');assert.equal(f.xp,0);
  const before=JSON.stringify(f);advance(f,1);assert.equal(JSON.stringify(f),before);
  const v=new Game(()=>.5);v.time=BOSS_TIME;v.player.invuln=999;v.step(.01);v.hit(v.boss,1e9);
  assert.equal(v.state,'won');const snap=JSON.stringify(v);v.step(.05);assert.equal(JSON.stringify(v),snap);
});

test('coexisting bosses remain bounded over sustained combat and preserve finite state',()=>{
  const g=new Game(()=>.5);g.spawnTimer=g.pickupTimer=999;g.player.invuln=999;
  for(const def of BOSSES){const e=spawnBoss(g,def.id,20);Object.assign(e,{x:100,y:0});}
  for(let i=0;i<2400;i++){
    g.step(.05,{x:Math.cos(i/200)*.3,y:Math.sin(i/200)*.3});g.events=[];
    assert.ok(g.hazards.length<=64);assert.ok(g.shots.length<=150);assert.ok(g.enemies.length<=25);
    assert.ok(g.enemies.every(e=>Number.isFinite(e.hp)&&Number.isFinite(e.x)&&Number.isFinite(e.y)));
  }
});

test('charge and both projectile attacks really hit after their warnings and miss a lateral dodge',()=>{
  for(const type of ['antler','reaper','twins'])for(const dodge of [false,true]){
    const {g,e}=scene(type);let attacker=e;
    if(type==='twins'){
      g.hit(e,1e9);attacker=g.enemies.find(e=>e.bossPart==='mage');Object.assign(attacker,{x:0,y:0,speed:0,ability:0});
    }
    g.step(.01);advance(g,.7);assert.equal(g.player.hp,100,type+' early');
    if(dodge)g.player.y=170;
    advance(g,.85);
    assert.equal(g.player.hp<100,!dodge,type+(dodge?' dodge':' impact'));
  }
});
