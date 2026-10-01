import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,UPGRADES,xpNeeded,mutationFor,BOSS_TIME} from '../core.js';
function rng(seed=123){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function nearby(g,kind='rabbit',x=40,y=0){const e=g.spawn(kind);Object.assign(e,{x,y});return e;}
test('normalized controls, fixed time ceiling and paused simulation',()=>{const g=new Game(rng());g.step(.05,{x:1,y:1});assert.ok(Math.abs(Math.hypot(g.player.x,g.player.y)-g.speed*.05)<1e-8);g.state='levelup';const snapshot=JSON.stringify(g);g.step(.05,{x:1,y:0});assert.equal(JSON.stringify(g),snapshot);});
test('manual slash targets enemies and drops collectible experience',()=>{const g=new Game(rng());g.player.face=0;let e=nearby(g);g.manualAttack();for(let i=0;i<10;i++)g.step(.05);g.manualAttack();assert.ok(e.hp<=0);assert.equal(g.kills,1);assert.ok(g.gems.length);g.gems=[{x:g.player.x,y:g.player.y,value:3}];g.step(.02);assert.equal(g.xp,3);});
test('level up offers three distinct valid choices and carries over XP',()=>{const g=new Game(rng());g.xp=xpNeeded(1)+xpNeeded(2)+2;g.checkLevel();assert.equal(g.level,2);assert.equal(g.state,'levelup');assert.equal(g.choices.length,3);assert.equal(new Set(g.choices.map(x=>x.id)).size,3);assert.equal(g.choose('invalid'),false);let id=g.choices[0].id;assert.equal(g.choose(id),true);assert.equal(g.rank(id),1);assert.equal(g.level,3);assert.equal(g.state,'levelup');assert.equal(g.xp,2);g.choose(g.choices[0].id);assert.equal(g.state,'playing');});
test('mutations affect living enemies and unlock combat abilities',()=>{const g=new Game(rng());const hare=nearby(g,'hare',150,0);const chicken=nearby(g,'chicken',200,0);let old=hare.maxHp;g.level=6;g.mutate();assert.equal(hare.tier,1);assert.ok(hare.maxHp>old);hare.ability=0;g.step(.02);assert.ok(hare.charge>0);g.level=11;g.mutate();chicken.x=70;chicken.ability=0;g.step(.02);assert.equal(chicken.specialAttack.kind,'chicken');assert.equal(mutationFor(16),3);assert.equal(mutationFor(90),3);});
test('armor mitigates damage, invulnerability prevents stacked hits and death ends run',()=>{const g=new Game(rng());g.upgrades.armor=2;g.hurt(20);assert.ok(g.player.hp>80);const hp=g.player.hp;g.hurt(20);assert.equal(g.player.hp,hp);g.player.invuln=0;g.hurt(1000);assert.equal(g.state,'dead');assert.equal(g.player.hp,0);});
test('new weapons damage foes; vitality heals and upgrades stop at caps',()=>{const g=new Game(rng());g.upgrades={lightning:1,frost:1};g.stormTimer=0;g.auraTimer=0;const e=nearby(g,'chicken',20,0);const hp=e.hp;g.step(.02);assert.ok(e.hp<hp);g.player.hp=10;g.offer();g.choices=[UPGRADES.find(u=>u.id==='vitality')];g.choose('vitality');assert.equal(g.player.maxHp,125);assert.equal(g.player.hp,45);for(const u of UPGRADES)g.upgrades[u.id]=u.max;g.offer();assert.deepEqual(g.choices.map(x=>x.id),['heal']);g.choose('heal');assert.equal(g.player.hp,125);});
test('boss appears only at ten active minutes, once, and must be killed',()=>{const g=new Game(rng());g.time=BOSS_TIME-.03;g.step(.02);assert.equal(g.bossSpawned,false);g.step(.02);assert.equal(g.bossSpawned,true);assert.equal(g.state,'playing');const id=g.boss.id;g.step(.02);assert.equal(g.boss.id,id);g.hit(g.boss,10000);assert.equal(g.state,'won');const time=g.time;g.step(.05);assert.equal(g.time,time);g.reset();assert.equal(g.time,0);assert.equal(g.level,1);assert.deepEqual(g.upgrades,{});assert.equal(g.boss,null);});
test('level bosses appear every five levels, scale, use specials and do not end the run',()=>{const g=new Game(rng());g.level=4;g.xp=xpNeeded(4);g.checkLevel();assert.equal(g.level,5);assert.ok(g.boss&&g.boss.bossLevel===5&&!g.boss.finalBoss);const hp5=g.boss.maxHp,damage5=g.boss.damage;g.hit(g.boss,1e6);assert.equal(g.state,'levelup');g.state='playing';g.level=9;g.xp=xpNeeded(9);g.checkLevel();assert.ok(g.boss.maxHp>hp5&&g.boss.damage>damage5);g.state='playing';g.boss.special='ring';g.boss.ability=0;g.step(.02);assert.ok(g.shots.length>=8);g.shots=[];g.boss.special='burst';g.boss.ability=0;g.step(.02);assert.equal(g.shots.length,5);g.boss.special='charge';g.boss.ability=0;g.step(.02);assert.ok(g.boss.charge>0);});
test('ground pickups heal and apply timed salmon-oil speed and fire damage buffs',()=>{const g=new Game(rng());g.pickupTimer=999;g.player.hp=50;let item=g.spawnPickup('meat');Object.assign(item,{x:0,y:0});g.step(.02);assert.equal(g.player.hp,53);const normalSpeed=124;item=g.spawnPickup('oil');Object.assign(item,{x:g.player.x,y:g.player.y});g.step(.02);assert.ok(g.speedBoostTimer>19);assert.ok(Math.abs(g.speed-normalSpeed*1.1)<1e-8);const normalDamage=20;item=g.spawnPickup('fire');Object.assign(item,{x:g.player.x,y:g.player.y});g.step(.02);assert.ok(g.fireTimer>14);assert.ok(Math.abs(g.damage-normalDamage*1.35)<1e-8);});
test('attacks only happen when triggered, manual follows facing and automatic aims at nearest foe',()=>{const g=new Game(rng());g.pickupTimer=999;const right=nearby(g,'rabbit',40,0);right.maxHp=right.hp=300;g.step(.02,{x:-1,y:0});assert.equal(g.effects.filter(e=>e.type==='slash').length,0);g.manualAttack();let slash=g.effects.find(e=>e.type==='slash');assert.ok(Math.abs(Math.abs(slash.angle)-Math.PI)<1e-8);assert.equal(right.hp,right.maxHp);g.effects=[];g.automaticAttack();slash=g.effects.find(e=>e.type==='slash');assert.ok(Math.abs(slash.angle)<1e-8);assert.ok(right.hp<right.maxHp);for(let i=0;i<10;i++)g.step(.05);g.effects=[];g.upgrades.twin=1;g.player.face=0;const before=right.hp;g.manualAttack();assert.equal(g.effects.filter(e=>e.type==='slash').length,2);assert.ok(right.hp<before);assert.equal(UPGRADES.find(u=>u.id==='twin').max,1);});
test('ten-minute stress simulation maintains bounded entities and finite state',()=>{const g=new Game(rng());g.upgrades={power:5,twin:1,armor:4,reach:3,orbit:3,lightning:3,frost:3,regen:3};for(let i=0;i<12005;i++){g.player.hp=100;g.player.invuln=1;if(g.state==='levelup')g.choose(g.choices[0].id);g.step(.05,{x:Math.cos(i/140),y:Math.sin(i/140)});g.events=[];assert.ok(Number.isFinite(g.player.x)&&Number.isFinite(g.player.hp));assert.ok(g.enemies.length<=171);assert.ok(g.particles.length<=200);assert.ok(g.shots.length<=150);if(g.state==='won')break;}assert.ok(g.time>=600);assert.ok(g.bossSpawned);});

test('manual attack rejects rapid taps until 450ms, including twin slashes, and resets for a new run',()=>{
  const g=new Game(rng());g.spawnTimer=999;g.player.face=0;g.upgrades.twin=1;
  const e=nearby(g);e.hp=e.maxHp=1000;e.speed=0;
  g.manualAttack();assert.equal(e.hp,960);
  for(let i=0;i<20;i++)g.manualAttack();assert.equal(e.hp,960);
  for(let i=0;i<8;i++)g.step(.05);g.step(.049);
  g.manualAttack();assert.equal(e.hp,960);
  g.step(.002);g.manualAttack();assert.equal(e.hp,920);
  g.reset();g.manualAttack();assert.equal(g.effects.filter(e=>e.type==='slash').length,1);
});

function specialScenario(kind,level=6,x=150){
  const g=new Game(rng());g.level=level;g.mutate();g.spawnTimer=g.pickupTimer=999;
  const e=nearby(g,kind,x);e.ability=0;return {g,e};
}
function advance(g,seconds,input){for(let left=seconds;left>1e-9;left-=.01)g.step(Math.min(.01,left),input);}
test('new specials unlock at level 6 and wait until in range',()=>{
  for(const kind of ['rabbit','quail','chicken']){
    const {g,e}=specialScenario(kind,5,60);g.step(.01);assert.equal(e.specialAttack,null);
    g.level=6;g.mutate();g.step(.01);assert.equal(e.specialAttack.kind,kind);
    const far=specialScenario(kind,16,400);far.g.step(.01);assert.equal(far.e.specialAttack,null);
  }
});
test('rabbit warns, jumps to its locked target, damages on landing and can be dodged',()=>{
  for(const dodge of [false,true]){
    const {g,e}=specialScenario('rabbit');g.step(.01);const target={x:e.specialAttack.x,y:e.specialAttack.y};
    advance(g,.74,dodge?{x:0,y:1}:undefined);assert.equal(e.specialAttack.phase,'warning');assert.equal(g.player.hp,100);
    advance(g,.02);assert.equal(e.specialAttack.phase,'jump');assert.equal(g.player.hp,100);
    assert.equal(e.specialAttack.x,target.x);assert.equal(e.specialAttack.y,target.y);
    advance(g,.46);assert.equal(e.specialAttack,null);assert.equal(g.player.hp,dodge?100:100-e.damage);
    assert.ok(g.effects.some(effect=>effect.type==='enemy-impact'));
  }
});
test('quail warns then fires a spaced, locked fan using existing enemy damage',()=>{
  for(const level of [6,11,16,30]){
    const {g,e}=specialScenario('quail',level,240);g.step(.01);const angle=e.specialAttack.angle;
    advance(g,.74,{x:0,y:1});assert.equal(g.shots.length,0);
    advance(g,.02);assert.equal(g.shots.length,level===6?3:5);
    const angles=g.shots.map(s=>Math.atan2(s.vy,s.vx));
    for(let i=0;i<angles.length;i++){
      const expected=angle+(i-(angles.length-1)/2)*.3;
      assert.ok(Math.abs(Math.atan2(Math.sin(angles[i]-expected),Math.cos(angles[i]-expected)))<1e-8);
      assert.equal(g.shots[i].damage,e.damage);assert.equal(g.shots[i].kind,'feather');
    }
  }
  const {g,e}=specialScenario('quail',6,120);g.step(.01);advance(g,1.7);assert.equal(g.player.hp,100-e.damage);
});
test('chicken circle has a full warning, one hit and a safe escape',()=>{
  for(const dodge of [false,true]){
    const {g,e}=specialScenario('chicken',6,60);g.step(.01);
    advance(g,.79,dodge?{x:-1,y:0}:undefined);assert.equal(g.player.hp,100);assert.equal(e.x,60);
    advance(g,.02);assert.equal(e.specialAttack,null);assert.equal(g.player.hp,dodge?100:100-e.damage);
    assert.equal(g.shots.length,0);assert.ok(e.ability>=5);
  }
});
test('tier progression changes attacks and cooldown while preserving warning duration',()=>{
  for(const kind of ['rabbit','quail','chicken']){
    const values=[6,11,16,30].map(level=>{
      const {g,e}=specialScenario(kind,level,60);g.step(.01);const attack={...e.specialAttack};
      while(e.specialAttack)g.step(.01);
      return {attack,cooldown:e.ability};
    });
    assert.equal(values[0].attack.time,values[1].attack.time);assert.equal(values[1].attack.time,values[2].attack.time);
    assert.ok(Math.abs(values[1].cooldown/values[2].cooldown-1.15)<1e-8);
    assert.deepEqual(values[2],values[3]);
    if(kind==='rabbit'){assert.equal(values[0].attack.duration,.45);assert.equal(values[1].attack.duration,.34);}
    if(kind==='chicken')assert.ok(Math.abs(values[1].attack.radius/values[0].attack.radius-1.15)<1e-8);
  }
});
test('specials pause with simulation, cancel on death and honor projectile limits',()=>{
  for(const kind of ['rabbit','quail','chicken']){
    const {g,e}=specialScenario(kind,6,60);g.step(.01);g.state='levelup';
    const before=JSON.stringify(g);advance(g,1);assert.equal(JSON.stringify(g),before);
    g.state='playing';g.hit(e,10000);advance(g,1.5);
    assert.equal(g.player.hp,100);assert.equal(g.shots.length,0);assert.ok(!g.enemies.includes(e));
  }
  const {g}=specialScenario('quail',16,240);g.step(.01);
  g.shots=Array.from({length:149},()=>({x:500,y:500,vx:0,vy:0,life:10,damage:1}));
  advance(g,.76);assert.equal(g.shots.length,150);
});
