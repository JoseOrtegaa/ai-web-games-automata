import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../core.js';

function killEncounter(game, level) {
  game.level = level;
  const actor = game.debugSpawnBoss();
  const encounterId = actor.encounterId ?? actor.id;
  for (const enemy of [...game.enemies]) {
    if ((enemy.encounterId ?? enemy.id) === encounterId && enemy.hp > 0) game.hit(enemy, 1e9);
  }
}

test('first descent threshold is chosen per run between level 5 and 10', () => {
  assert.equal(new Game(() => .1).descentPlan[0], 5);
  assert.equal(new Game(() => .9).descentPlan[0], 10);
});

test('boss completion opens a cave but world changes only after nearby interaction', () => {
  const game = new Game(() => .1);
  game.spawnTimer = game.pickupTimer = 999;
  killEncounter(game, 5);
  assert.ok(game.cave);
  assert.equal(game.worldDepth, 0);
  assert.equal(game.canEnterCave, false);

  game.player.x = game.cave.x;
  game.player.y = game.cave.y;
  assert.equal(game.canEnterCave, true);
  assert.equal(game.enterCave(), 1);
  assert.equal(game.worldDepth, 1);
  assert.equal(game.cave, null);
  assert.equal(game.player.x, 0);
  assert.equal(game.player.y, 0);
});

test('later descents unlock after level 15 and 30 bosses', () => {
  const game = new Game(() => .1);
  game.spawnTimer = game.pickupTimer = 999;

  killEncounter(game, 5);
  Object.assign(game.player, { x: game.cave.x, y: game.cave.y });
  game.enterCave();

  killEncounter(game, 15);
  assert.ok(game.cave);
  Object.assign(game.player, { x: game.cave.x, y: game.cave.y });
  assert.equal(game.enterCave(), 2);

  killEncounter(game, 30);
  assert.ok(game.cave);
  Object.assign(game.player, { x: game.cave.x, y: game.cave.y });
  assert.equal(game.enterCave(), 3);
  assert.equal(game.nextDescentLevel, null);
});

test('delayed cave entry cannot permanently skip a later descent', () => {
  const game = new Game(() => .1);
  killEncounter(game, 5);
  killEncounter(game, 15);
  assert.ok(game.cave);
  Object.assign(game.player, { x: game.cave.x, y: game.cave.y });
  assert.equal(game.enterCave(), 1);
  assert.ok(game.cave);
  assert.equal(game.cave.level, 15);
});

test('developer level jumps place the run in the representative world layer', () => {
  const game = new Game(() => .1);
  for (const [level, depth] of [[1,0],[5,1],[14,1],[15,2],[20,2],[25,2],[30,3],[35,3]]) {
    game.debugSetLevel(level);
    assert.equal(game.worldDepth, depth, `level ${level}`);
    assert.equal(game.cave, null);
  }
});
