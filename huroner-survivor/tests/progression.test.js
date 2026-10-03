import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, UPGRADES, xpNeeded } from '../core.js';

function game() {
  const g = new Game(() => .5);
  g.spawnTimer = g.pickupTimer = 999;
  return g;
}
function advance(g, seconds, input) {
  for (let left = seconds; left > 1e-9; left -= .05) g.step(Math.min(left, .05), input);
}
function close(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} ≠ ${expected}`); }
function kill(g, kind = 'rabbit', boss = false, final = false) {
  const e = g.spawn(kind, boss, g.level, final);
  Object.assign(e, { x: 400, y: 400 });
  g.hit(e, 1e9);
  return e;
}

test('every enemy splits the same total XP 30/70, including bosses, only once', () => {
  for (const [kind, boss, final, xp] of [['rabbit',false,false,2],['hare',false,false,2],['quail',false,false,2],['chicken',false,false,3],['rabbit',true,false,20],['chicken',true,true,100]]) {
    const g = game(), e = kill(g, kind, boss, final);
    close(g.xp, xp * .3); close(g.gems[0].value, xp * .7);
    close(g.xp + g.gems[0].value, xp);
    g.hit(e, 1e9); assert.equal(g.kills, 1);
  }
});

test('retreating can level from kills alone without rounding loss, gems retain the remainder', () => {
  const g = game();
  for (let i = 0; i < 15; i++) kill(g);
  assert.equal(g.xp, xpNeeded(1));
  close(g.gems.reduce((sum, gem) => sum + gem.value, 0), 21);
  g.step(.01, { x: -1, y: 0 });
  assert.equal(g.level, 2); assert.equal(g.xp, 0); assert.equal(g.state, 'levelup');
});

test('crowded ground preserves fractional XP and never merges it into a healing gem', () => {
  const g = game();
  g.gems = Array.from({ length: 350 }, (_, i) => ({ x: 300, y: 300, value: i ? 1.4 : 15, heal: !i }));
  for (let i = 0; i < 10; i++) kill(g, 'chicken');
  assert.equal(g.gems.length, 350); assert.equal(g.gems[0].value, 15);
  close(g.gems[1].value, 22.4); assert.equal(g.xp, 9);
});

test('wider pickup locks onto gems and catches a retreating player even with all speed buffs', () => {
  const g = game(); g.upgrades.speed = 5; g.speedBoostTimer = 20;
  g.gems = [{ x: -50, y: 0, value: 1.4 }, { x: -200, y: 0, value: 2 }];
  g.step(.01, { x: 1, y: 0 }); assert.equal(g.gems[0].attract, true);
  advance(g, 1.5, { x: 1, y: 0 });
  assert.equal(g.xp, 1.4); assert.equal(g.gems.length, 1);
  assert.equal(g.gems[0].attract, undefined);
});

test('shield absorbs mitigated damage, overflows to health and respects invulnerability', () => {
  const g = game(); assert.equal(g.player.shield, 20); assert.equal(g.maxShield, 20);
  g.hurt(12); assert.equal(g.player.shield, 8); assert.equal(g.player.hp, 100);
  g.hurt(50); assert.equal(g.player.shield, 8); assert.equal(g.player.shieldDelay, 6);
  g.player.invuln = 0; g.hurt(13);
  assert.equal(g.player.shield, 0); assert.equal(g.player.hp, 95);
  const armored = game(); armored.upgrades.armor = 2; armored.hurt(40);
  close(armored.player.hp, 120 - 40 / 1.36); assert.equal(armored.player.shield, 0);
});

test('shield waits six active seconds, recharges 10% per second, restarts on damage and caps', () => {
  const g = game(); g.hurt(20);
  advance(g, 6); close(g.player.shield, 0);
  advance(g, 1); close(g.player.shield, 2);
  g.hurt(1); close(g.player.shield, 1);
  advance(g, 5.95); close(g.player.shield, 1);
  advance(g, .15); close(g.player.shield, 1.2);
  advance(g, 12); assert.equal(g.player.shield, 20); assert.equal(g.player.hp, 100);
});

test('choice freezes shield recharge; five upgrades add fixed capacity, vitality does not scale it', () => {
  const g = game(); g.hurt(20); g.offer();
  advance(g, 7); assert.equal(g.player.shieldDelay, 6); assert.equal(g.player.shield, 0);
  for (let i = 1; i <= 5; i++) {
    g.offer(); g.choices = [UPGRADES.find(u => u.id === 'shield')];
    assert.equal(g.choose('shield'), true);
    assert.equal(g.maxShield, 20 + 20 * i); assert.equal(g.player.shield, 20 * i);
  }
  g.offer(); g.choices = [UPGRADES.find(u => u.id === 'vitality')]; g.choose('vitality');
  assert.equal(g.player.maxHp, 125); assert.equal(g.maxShield, 120);
  advance(g, 7); close(g.player.shield, 112);
  g.reset(); assert.equal(g.player.shield, 20); assert.equal(g.maxShield, 20); assert.equal(g.player.shieldDelay, 0);
});

test('maxed upgrades disappear, last available rank works, stale caps reject, exhausted pool heals', () => {
  const g = game();
  for (const u of UPGRADES) g.upgrades[u.id] = u.max;
  g.upgrades.magnet = 3; g.offer();
  assert.deepEqual(g.choices.map(u => u.id), ['magnet']);
  assert.equal(g.choose('magnet'), true); assert.equal(g.rank('magnet'), 4);
  g.offer(); assert.deepEqual(g.choices.map(u => u.id), ['heal']);
  g.choices = [UPGRADES.find(u => u.id === 'magnet')];
  assert.equal(g.choose('magnet'), false); assert.equal(g.rank('magnet'), 4);
  g.offer(); g.player.hp = 10; assert.equal(g.choose('heal'), true); assert.equal(g.player.hp, 100);
});
