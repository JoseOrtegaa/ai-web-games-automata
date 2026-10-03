import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,UPGRADES,xpNeeded,mutationFor,spawnRateFor,spawnIntervalFor,BOSS_TIME} from '../core.js';
function rng(seed=123){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function nearby(g,kind='rabbit',x=40,y=0){const e=g.spawn(kind);Object.assign(e,{x,y});return e;}
test('normalized controls, fixed time ceiling and paused simulation',()=>{const g=new Game(rng());g.step(.05,{x:1,y:1});assert.ok(Math.abs(Math.hypot(g.player.x,g.player.y)-g.speed*.05)<1e-8);g.state='levelup';const snapshot=JSON.stringify(g);g.step(.05,{x:1,y:0});assert.equal(JSON.stringify(g),snapshot);});
test('manual slash targets enemies and drops collectible experience',()=>{const g=new Game(rng());g.player.face=0;let e=nearby(g);g.manualAttack();for(let i=0;i<10;i++)g.step(.05);g.manualAttack();assert.ok(e.hp<=0);assert.equal(g.kills,1);assert.ok(g.gems.length);g.gems=[{x:g.player.x,y:g.player.y,value:3}];g.step(.02);assert.equal(g.xp,3.6);});
test('level up offers three distinct valid choices and carries over XP',()=>{const g=new Game(rng());g.xp=xpNeeded(1)+xpNeeded(2)+2;g.checkLevel();assert.equal(g.level,2);assert.equal(g.state,'levelup');assert.equal(g.choices.length,3);assert.equal(new Set(g.choices.map(x=>x.id)).size,3);assert.equal(g.choose('invalid'),false);let id=g.choices[0].id;assert.equal(g.choose(id),true);assert.equal(g.rank(id),1);assert.equal(g.level,3);assert.equal(g.state,'levelup');assert.equal(g.xp,2);g.choose(g.choices[0].id);assert.equal(g.state,'playing');});
test('level-up XP remainder stays rounded to one decimal',()=>{const g=new Game(rng());g.level=10;g.xp=xpNeeded(10)+.2;g.checkLevel();assert.equal(g.level,11);assert.equal(g.xp,.2);assert.equal(String(g.xp),'0.2');});
test('enemy spawn pressure rises smoothly with every level and active time',()=>{
  const early=spawnRateFor(1,0),world2=spawnRateFor(5,60),mid=spawnRateFor(15,220),deep=spawnRateFor(25,380),late=spawnRateFor(35,520);
  assert.ok(early<world2&&world2<mid&&mid<deep&&deep<late);
  for(let level=1;level<40;level++)assert.ok(spawnRateFor(level+1,180)>spawnRateFor(level,180),`level ${level}`);
  assert.ok(spawnRateFor(10,181)>spawnRateFor(10,180));
  assert.ok(spawnIntervalFor(15,220)<spawnIntervalFor(5,60));
});
test('spawn cadence creates one enemy at a time instead of burst jumps',()=>{
  const g=new Game(()=>.1);g.level=20;g.time=300;g.spawnTimer=0;g.pickupTimer=999;g.enemies=[];
  g.step(.01);assert.equal(g.enemies.filter(e=>!e.boss).length,1);
  const interval=g.spawnTimer;assert.ok(interval>0&&interval<.35);
  g.step(.01);assert.equal(g.enemies.filter(e=>!e.boss).length,1);
});

test('surface enemies have a single evolution that unlocks their combat abilities',()=>{const g=new Game(rng());const hare=nearby(g,'hare',150,0);const chicken=nearby(g,'chicken',70,0);let old=hare.maxHp;g.level=5;g.mutate();assert.equal(hare.tier,1);assert.ok(hare.maxHp>old);hare.ability=0;g.step(.02);assert.equal(hare.specialAttack.kind,'ram');g.level=20;g.mutate();assert.equal(g.mutation,1);assert.equal(mutationFor(16),1);assert.equal(mutationFor(90),1);chicken.ability=0;g.step(.02);assert.equal(chicken.specialAttack.kind,'burst');});
test('armor mitigates damage, invulnerability prevents stacked hits and death ends run',()=>{const g=new Game(rng());g.upgrades.armor=2;g.player.shield=0;g.hurt(20);assert.ok(g.player.hp>80);const hp=g.player.hp;g.hurt(20);assert.equal(g.player.hp,hp);g.player.invuln=0;g.hurt(1000);assert.equal(g.state,'dead');assert.equal(g.player.hp,0);});
test('new weapons damage foes; vitality heals and upgrades stop at caps',()=>{const g=new Game(rng());g.upgrades={lightning:1,frost:1};g.stormTimer=0;g.auraTimer=0;const e=nearby(g,'chicken',20,0);const hp=e.hp;g.step(.02);assert.ok(e.hp<hp);g.player.hp=10;g.offer();g.choices=[UPGRADES.find(u=>u.id==='vitality')];g.choose('vitality');assert.equal(g.player.maxHp,125);assert.equal(g.player.hp,45);for(const u of UPGRADES)g.upgrades[u.id]=u.max;g.offer();assert.deepEqual(g.choices.map(x=>x.id),['heal']);g.choose('heal');assert.equal(g.player.hp,125);});
test('ten active minutes open the final descent; the king spawns only after entering the arena',()=>{const g=new Game(rng());g.time=BOSS_TIME-.03;g.step(.02);assert.equal(g.finalGateOpened,false);g.step(.02);assert.equal(g.finalGateOpened,true);assert.ok(g.cave?.final);assert.equal(g.bossSpawned,false);assert.equal(g.boss,null);Object.assign(g.player,{x:g.cave.x,y:g.cave.y});const king=g.enterCave();assert.ok(king?.finalBoss);assert.equal(g.finalArena,true);assert.equal(g.bossSpawned,true);assert.equal(g.boss.bossType,'final_king');const id=g.boss.id;g.step(.02);assert.equal(g.boss.id,id);g.hit(g.boss,1e9);assert.equal(g.state,'won');const time=g.time;g.step(.05);assert.equal(g.time,time);g.reset();assert.equal(g.time,0);assert.equal(g.level,1);assert.equal(g.finalArena,false);assert.equal(g.finalGateOpened,false);assert.equal(g.boss,null);});
test('level bosses appear every five levels, scale, use specials and do not end the run',()=>{const g=new Game(rng());g.level=4;g.xp=xpNeeded(4);g.checkLevel();assert.equal(g.level,5);assert.ok(g.boss&&g.boss.bossLevel===5&&!g.boss.finalBoss);const hp5=g.boss.maxHp,damage5=g.boss.damage;g.hit(g.boss,1e6);assert.equal(g.state,'levelup');g.state='playing';g.level=9;g.xp=xpNeeded(9);g.checkLevel();assert.ok(g.boss.maxHp>hp5&&g.boss.damage>damage5);g.state='playing';g.boss=g.spawn('chicken',true,10,true);Object.assign(g.boss,{x:100,y:0,speed:0});g.player.invuln=99;for(const [index,count] of [[1,10],[2,5],[0,0]]){g.shots=[];Object.assign(g.boss,{attackIndex:index,ability:0,castLeft:0,pending:null,charge:0});g.step(.02);assert.equal(g.shots.length,0);assert.ok(g.boss.pending);for(let i=0;i<21;i++)g.step(.05);if(count)assert.equal(g.shots.length,count);else assert.ok(g.boss.charge>0);}});
test('ground pickups heal and apply timed salmon-oil speed and fire damage buffs',()=>{const g=new Game(rng());g.pickupTimer=999;g.player.hp=50;let item=g.spawnPickup('meat');Object.assign(item,{x:0,y:0});g.step(.02);assert.equal(g.player.hp,53);const normalSpeed=124;item=g.spawnPickup('oil');Object.assign(item,{x:g.player.x,y:g.player.y});g.step(.02);assert.ok(g.speedBoostTimer>19);assert.ok(Math.abs(g.speed-normalSpeed*1.1)<1e-8);const normalDamage=20;item=g.spawnPickup('fire');Object.assign(item,{x:g.player.x,y:g.player.y});g.step(.02);assert.ok(g.fireTimer>14);assert.ok(Math.abs(g.damage-normalDamage*1.35)<1e-8);});
test('manual and automatic attacks target the nearest living enemy regardless of movement',()=>{
  for(const attack of ['manualAttack','automaticAttack']){
    const g=new Game(rng());g.spawnTimer=g.pickupTimer=999;
    const far=nearby(g,'rabbit',-90,0),near=nearby(g,'rabbit',40,0),dead=nearby(g,'rabbit',0,-20);
    far.hp=far.maxHp=near.hp=near.maxHp=300;dead.hp=0;
    g.step(.02,{x:-1,y:0});assert.equal(g.effects.filter(e=>e.type==='slash').length,0);
    g[attack]();assert.ok(Math.abs(g.effects.find(e=>e.type==='slash').angle)<1e-8);
    assert.equal(near.hp,280);assert.equal(far.hp,300);
    for(let i=0;i<6;i++)g.step(.05);
    g.effects=[];g.upgrades.twin=1;g.player.face=Math.PI;
    const before=near.hp;g[attack]();assert.equal(g.effects.filter(e=>e.type==='slash').length,2);assert.equal(near.hp,before-40);
    g.reset();g.player.face=1.2;g[attack]();assert.equal(g.effects.find(e=>e.type==='slash').angle,1.2);
  }
  assert.equal(UPGRADES.find(u=>u.id==='twin').max,1);
});
test('developer controls set level, selected upgrades, healing and boss level without normal level-up flow',()=>{
  const g=new Game(rng(321));g.spawnTimer=g.pickupTimer=999;
  const ordinary=nearby(g,'rabbit',120,0);
  g.state='levelup';g.choices=[UPGRADES[0]];
  assert.equal(g.debugSetLevel(25),25);
  assert.equal(g.level,25);assert.equal(g.xp,0);assert.equal(g.mutation,1);assert.equal(g.state,'playing');assert.deepEqual(g.choices,[]);
  assert.ok(!g.enemies.includes(ordinary));
  assert.equal(g.debugSetUpgrade('power',999),8);assert.equal(g.rank('power'),8);
  assert.equal(g.debugSetUpgrade('regen',2),2);assert.equal(g.rank('regen'),2);
  assert.equal(g.debugSetUpgrade('armor',6),false);assert.equal(g.rank('armor'),0);
  g.player.hp=1;g.player.shield=0;g.debugHeal();assert.equal(g.player.hp,g.player.maxHp);assert.equal(g.player.shield,g.maxShield);
  const boss=g.debugSpawnBoss();assert.ok(boss&&boss.bossLevel===25);assert.equal(g.level,25);
  assert.equal(g.debugSetLevel(120),99);assert.equal(g.debugSetLevel(-5),1);
});

test('ordinary spawns avoid sectors that are already locally saturated',()=>{
  const g=new Game(rng(77));g.spawnTimer=g.pickupTimer=999;
  g.enemies=Array.from({length:40},(_,i)=>({id:1000+i,hp:1,boss:false,x:450,y:(i-20)*2}));
  const e=g.spawn('rabbit');
  const angle=(Math.atan2(e.y-g.player.y,e.x-g.player.x)+Math.PI*2)%(Math.PI*2);
  const sector=Math.floor(angle/(Math.PI*2/8));
  assert.ok(sector!==0&&sector!==7,'spawn should avoid the crowded east sectors');
});

test('crowd steering spreads a dense melee pack instead of collapsing it into one stack',()=>{
  const g=new Game(rng(91));g.spawnTimer=g.pickupTimer=999;g.player.invuln=999;
  g.enemies=[];
  for(let i=0;i<36;i++){
    const e=g.spawn('rabbit');Object.assign(e,{x:105,y:0,speed:30,ability:999,hp:100,maxHp:100,tier:0});
  }
  for(let i=0;i<100;i++)g.step(.05);
  const buckets=new Map();
  for(const e of g.enemies){
    const key=Math.floor(e.x/18)+','+Math.floor(e.y/18);
    buckets.set(key,(buckets.get(key)||0)+1);
  }
  assert.ok(Math.max(...buckets.values())<=4,'no 18px area should contain a large sprite stack');
  const radii=g.enemies.map(e=>Math.hypot(e.x-g.player.x,e.y-g.player.y));
  assert.ok(Math.max(...radii)-Math.min(...radii)>25,'the pack should occupy multiple local lanes');
});

test('ten-minute stress simulation reaches final arena and maintains bounded finite state',()=>{const g=new Game(rng());g.upgrades={power:5,twin:1,armor:4,reach:3,orbit:3,lightning:3,frost:3,regen:3};for(let i=0;i<12400;i++){g.player.hp=100;g.player.invuln=1;if(g.state==='levelup')g.choose(g.choices[0].id);if(g.cave?.final){Object.assign(g.player,{x:g.cave.x,y:g.cave.y});g.enterCave();}g.step(.05,{x:Math.cos(i/140),y:Math.sin(i/140)});g.events=[];assert.ok(Number.isFinite(g.player.x)&&Number.isFinite(g.player.hp));assert.ok(g.enemies.length<=171);assert.ok(g.particles.length<=200);assert.ok(g.shots.length<=150);if(g.state==='won')break;}assert.ok(g.time>=600);assert.equal(g.finalArena,true);assert.ok(g.bossSpawned);});

test('manual attack rejects rapid taps until 250ms, including twin slashes, and resets for a new run',()=>{
  const g=new Game(rng());g.spawnTimer=999;g.player.face=0;g.upgrades.twin=1;
  const e=nearby(g);e.hp=e.maxHp=1000;e.speed=0;
  g.manualAttack();assert.equal(e.hp,960);
  for(let i=0;i<20;i++)g.manualAttack();assert.equal(e.hp,960);
  for(let i=0;i<4;i++)g.step(.05);g.step(.049);
  g.manualAttack();assert.equal(e.hp,960);
  g.step(.002);g.manualAttack();assert.equal(e.hp,920);
  g.reset();g.manualAttack();assert.equal(g.effects.filter(e=>e.type==='slash').length,1);
});

function specialScenario(kind,level=6,x=150){
  const g=new Game(rng());g.player.shield=0;g.player.shieldDelay=999;g.level=level;g.mutate();g.spawnTimer=g.pickupTimer=999;
  const e=nearby(g,kind,x);e.ability=0;return {g,e};
}
function advance(g,seconds,input){for(let left=seconds;left>1e-9;left-=.01)g.step(Math.min(.01,left),input);}
test('surface specials unlock at the single level-5 evolution and wait until in range',()=>{
  for(const [kind,attack] of [['rabbit','jump'],['quail','fan'],['chicken','burst']]){
    const {g,e}=specialScenario(kind,4,60);g.step(.01);assert.equal(e.specialAttack,null);
    g.level=5;g.mutate();g.step(.01);assert.equal(e.specialAttack.kind,attack);
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
test('quail keeps one evolved fan pattern with three locked feathers',()=>{
  for(const level of [5,11,16,30]){
    const {g,e}=specialScenario('quail',level,240);g.step(.01);const angle=e.specialAttack.angle;
    advance(g,.74,{x:0,y:1});assert.equal(g.shots.length,0);advance(g,.02);assert.equal(g.shots.length,3);
    const angles=g.shots.map(s=>Math.atan2(s.vy,s.vx));
    for(let i=0;i<angles.length;i++){
      const expected=angle+(i-(angles.length-1)/2)*.3;
      assert.ok(Math.abs(Math.atan2(Math.sin(angles[i]-expected),Math.cos(angles[i]-expected)))<1e-8);
      assert.equal(g.shots[i].damage,e.damage);assert.equal(g.shots[i].kind,'feather');
    }
  }
});
test('chicken circle has a full warning, one hit and a safe escape',()=>{
  for(const dodge of [false,true]){
    const {g,e}=specialScenario('chicken',6,60);g.step(.01);
    advance(g,.79,dodge?{x:-1,y:0}:undefined);assert.equal(g.player.hp,100);assert.equal(e.x,60);
    advance(g,.02);assert.equal(e.specialAttack,null);assert.equal(g.player.hp,dodge?100:100-e.damage);
    assert.equal(g.shots.length,0);assert.ok(e.ability>=5);
  }
});
test('surface evolution is capped at one tier instead of escalating every five levels',()=>{
  for(const kind of ['rabbit','hare','quail','chicken']){
    const values=[5,10,20,40].map(level=>{const {g,e}=specialScenario(kind,level,60);return {tier:e.tier,attack:e.attackStyle};});
    assert.deepEqual(values.map(v=>v.tier),[1,1,1,1]);
    assert.equal(new Set(values.map(v=>v.attack)).size,1);
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
