import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, ATTACK_COOLDOWN, xpNeeded } from '../core.js';

function scenario() {
  const game = new Game(() => .5);
  game.spawnTimer = game.pickupTimer = 999;
  game.player.shieldDelay = 999;
  game.player.shield = 0; // Isolate lethal health damage; shield behavior has its own tests.
  return game;
}
function enemy(game, x, { final = false, hp = 1 } = {}) {
  const value = game.spawn('rabbit', final, 1, final);
  Object.assign(value, { x, y: 0, hp, speed: 0, ability: 999 });
  return value;
}
function rewards(game) {
  game.gems.push({ x: 0, y: 0, value: xpNeeded(1), heal: false });
  game.pickups.push({ x: 0, y: 0, type: 'meat', taken: false });
}
function assertFrozen(game) {
  const before = JSON.stringify(game);
  game.step(.05, { x: 1, y: 1 });
  game.manualAttack(); game.automaticAttack(); game.attack();
  game.hurt(1000); game.hit(game.enemies[0], 1000);
  game.offer(); game.checkLevel();
  assert.equal(game.choose('vitality'), false);
  assert.equal(JSON.stringify(game), before);
}

test('lethal contact stops passive damage, healing and XP before they can overwrite death', () => {
  const game = scenario();
  game.player.hp = 1;
  game.upgrades = { lightning: 1, frost: 1, leech: 1 };
  game.stormTimer = game.auraTimer = 0;
  enemy(game, 0, { hp: 100 });
  const finalBoss = enemy(game, 75, { final: true });
  rewards(game); game.events = [];
  game.step(.02);
  assert.equal(game.state, 'dead');
  assert.equal(game.player.hp, 0);
  assert.equal(finalBoss.hp, 1);
  assert.equal(game.kills, 0);
  assert.equal(game.xp, 0);
  assert.equal(game.level, 1);
  assert.equal(game.pickups[0].taken, false);
  assert.deepEqual(game.events.map(event => event.type), ['hurt', 'dead']);
  assertFrozen(game);
});

test('victory from each passive weapon stops later targets, projectile damage and pickups', () => {
  for (const weapon of ['orbit', 'lightning', 'frost']) {
    const game = scenario();
    game.player.hp = 40;
    game.upgrades[weapon] = 1;
    game.stormTimer = game.auraTimer = 0;
    enemy(game, 72, { final: true });
    const survivor = enemy(game, 77, { hp: 100 });
    game.shots.push({ x: 0, y: 0, vx: 0, vy: 0, life: 1, damage: 1000 });
    rewards(game); game.events = [];
    game.step(.02);
    assert.equal(game.state, 'won', weapon);
    assert.equal(game.kills, 1, weapon);
    assert.equal(survivor.hp, 100, weapon);
    assert.equal(game.player.hp, 40, weapon);
    assert.equal(game.shots[0].life, 1, weapon);
    assert.equal(game.xp, 30, weapon); // Direct XP belongs to the winning kill, before terminal.
    assert.equal(game.pickups[0].taken, false, weapon);
    assert.deepEqual(game.events.map(event => event.type), ['kill', 'won'], weapon);
    assertFrozen(game);
  }
});

test('winning sword strike stops its target loop and the second Twin Fang slash', () => {
  const game = scenario();
  game.upgrades.twin = 1;
  enemy(game, 65, { final: true });
  const survivor = enemy(game, 70, { hp: 100 });
  game.events = [];
  game.manualAttack();
  assert.equal(game.state, 'won');
  assert.equal(survivor.hp, 100);
  assert.equal(game.effects.filter(effect => effect.type === 'slash').length, 1);
  assert.deepEqual(game.events.map(event => event.type), ['slash', 'kill', 'won']);
  assertFrozen(game);
});

test('lethal special attacks and projectiles stop subsequent healing and choices', () => {
  for (const source of ['special', 'projectile']) {
    const game = scenario(); game.player.hp = 1;
    const attacker = enemy(game, 100, { hp: 100 });
    if (source === 'special') {
      attacker.specialAttack = { kind: 'chicken', phase: 'warning', time: .01, x: 0, y: 0, radius: 65 };
    } else {
      game.shots.push({ x: 0, y: 0, vx: 0, vy: 0, life: 1, damage: 10 });
    }
    rewards(game); game.events = []; game.step(.02);
    assert.equal(game.state, 'dead', source);
    assert.equal(game.player.hp, 0, source);
    assert.equal(game.xp, 0, source);
    assert.equal(game.pickups[0].taken, false, source);
    assert.deepEqual(game.events.map(event => event.type), ['hurt', 'dead'], source);
    assertFrozen(game);
  }
});

test('manual and automatic intentions share the public cooldown, frozen during choice', () => {
  const game = scenario();
  const target = enemy(game, 65, { hp: 1000 });
  // Both app callbacks use this entry point; mode changes do not own a separate timer.
  const manual = () => game.manualAttack();
  const automatic = () => game.manualAttack();
  manual(); assert.equal(target.hp, 980);
  automatic(); assert.equal(target.hp, 980);
  assert.equal(game.manualAttackCooldown, ATTACK_COOLDOWN);
  game.offer(); const cooldown = game.manualAttackCooldown;
  game.step(.05); manual(); automatic();
  assert.equal(game.manualAttackCooldown, cooldown);
  assert.equal(target.hp, 980);
  assert.equal(game.choose(game.choices[0].id), true);
  const damage = game.damage;
  for (let i = 0; i < 4; i++) game.step(.05);
  game.step(.049); automatic(); assert.equal(target.hp, 980);
  game.step(.002); automatic(); assert.equal(target.hp, 980 - damage);
  manual(); assert.equal(target.hp, 980 - damage);
  game.reset(); assert.equal(game.manualAttackCooldown, 0);
});
