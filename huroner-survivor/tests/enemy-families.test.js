import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../core.js';
import { ENEMY_ROSTERS, enemyRoster, enemyEvolutionTier, enemyAttackStyle } from '../enemies.js';

function game(depth=0,level=1,random=()=>.01){
  const g=new Game(random);g.worldDepth=depth;g.level=level;g.mutation=enemyEvolutionTier(depth,level);
  g.spawnTimer=g.pickupTimer=999;return g;
}
function advance(g,seconds,input){
  for(let left=seconds;left>1e-9;left-=.01)g.step(Math.min(.01,left),input);
}

test('each world has a distinct four-enemy roster',()=>{
  assert.deepEqual(enemyRoster(0),['rabbit','hare','quail','chicken']);
  assert.deepEqual(enemyRoster(1),['bone_skull','bone_swordsman','bone_archer','bone_rabbit']);
  assert.deepEqual(enemyRoster(2),['stone_swordsman','stone_archer','stone_rabbit','stone_boar']);
  assert.deepEqual(enemyRoster(3),['ash_swordsman','ember_archer','lava_beast','magma_skull']);
  assert.equal(new Set(ENEMY_ROSTERS.flat()).size,16);
});

test('automatic spawns switch family with world depth',()=>{
  for(const [depth,expected] of [[0,'rabbit'],[1,'bone_skull'],[2,'stone_swordsman'],[3,'ash_swordsman']]){
    const g=game(depth,depth?15:1);const e=g.spawn();assert.equal(e.kind,expected);assert.equal(e.worldDepth,depth);
  }
});

test('surface mutation is capped once and later worlds use their own evolution thresholds',()=>{
  assert.equal(enemyEvolutionTier(0,1),0);assert.equal(enemyEvolutionTier(0,5),1);assert.equal(enemyEvolutionTier(0,50),1);
  assert.equal(enemyEvolutionTier(1,11),0);assert.equal(enemyEvolutionTier(1,12),1);
  assert.equal(enemyEvolutionTier(2,24),0);assert.equal(enemyEvolutionTier(2,25),1);
  assert.equal(enemyEvolutionTier(3,34),0);assert.equal(enemyEvolutionTier(3,35),1);
});

test('bone humans keep their attacks while the skull evolves from ram to explosion',()=>{
  assert.equal(enemyAttackStyle('bone_swordsman',0),'lunge');assert.equal(enemyAttackStyle('bone_swordsman',1),'lunge');
  assert.equal(enemyAttackStyle('bone_archer',0),'shot');assert.equal(enemyAttackStyle('bone_archer',1),'shot');
  assert.equal(enemyAttackStyle('bone_skull',0),'ram');assert.equal(enemyAttackStyle('bone_skull',1),'explode');

  const g=game(1,11),skull=g.spawn('bone_skull');const before=skull.maxHp;
  g.level=12;g.mutate();
  assert.equal(skull.tier,1);assert.equal(skull.attackStyle,'explode');assert.ok(skull.maxHp>before);
});

test('bone archer telegraphs and fires a bone projectile',()=>{
  const g=game(1,10),e=g.spawn('bone_archer');Object.assign(e,{x:150,y:0,ability:0,speed:0});
  g.step(.01);assert.equal(e.specialAttack.kind,'shot');assert.equal(e.specialAttack.projectileKind,'bone');
  advance(g,.71);assert.equal(g.shots.length,1);assert.equal(g.shots[0].kind,'bone');assert.equal(g.shots[0].damage,e.damage);
});

test('bone skull ram pushes the player before its explosive evolution',()=>{
  const g=game(1,10),e=g.spawn('bone_skull');Object.assign(e,{x:60,y:0,ability:0,speed:0});
  g.step(.01);assert.equal(e.specialAttack.kind,'ram');
  advance(g,.9);
  assert.ok(g.player.x<0,'ram should push the player away from the skull');
  assert.ok(g.player.hp<g.player.maxHp||g.player.shield<g.maxShield);
});

test('evolved bone skull and magma skull explode instead of using contact-only attacks',()=>{
  for(const [depth,level,kind] of [[1,12,'bone_skull'],[3,35,'magma_skull']]){
    const g=game(depth,level),e=g.spawn(kind);Object.assign(e,{x:55,y:0,ability:0,speed:0});
    g.step(.01);assert.equal(e.specialAttack.kind,'explode');
    advance(g,.9);assert.equal(e.hp,0);assert.ok(g.effects.some(effect=>effect.type==='enemy-impact'));
  }
});

test('rock and magma ranged families use world-specific projectiles',()=>{
  const rock=game(2,20).spawn('stone_archer'),ember=game(3,30).spawn('ember_archer');
  assert.equal(rock.attackStyle,'shot');assert.equal(rock.projectileKind,'rock');
  assert.equal(ember.attackStyle,'shot');assert.equal(ember.projectileKind,'ember');
});
