import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, createFighter, fighterDefinition, tryAttack, stepFighter, resolveHit, keepApart, winnerByTimeout, MOVES } from '../core.js';
test('cuatro luchadores únicos y configurados', () => {
  assert.equal(ROSTER.length, 4);
  assert.equal(new Set(ROSTER.map(f => f.id)).size, 4);
  assert.ok(ROSTER.every(f => f.speed > 0 && f.power > 0));
});
test('la selección conserva el personaje solicitado', () => {
  const a = createFighter('onyx', 200);
  assert.equal(fighterDefinition(a.id).name, 'ONYX');
  assert.equal(a.health, 100);
});
test('un puñetazo alcanza y causa daño solo durante ventana activa', () => {
  const a = createFighter('kira', 300);
  const b = createFighter('volt', 370, -1);
  assert.equal(tryAttack(a, 'punch'), true);
  assert.equal(resolveHit(a, b), null);
  for (let i = 0; i < 3; i++) stepFighter(a, {}, b, .04);
  const hit = resolveHit(a, b);
  assert.ok(hit && hit.damage > 0);
  assert.equal(resolveHit(a, b), null);
});
test('fuera de alcance no se recibe daño', () => {
  const a = createFighter('kira', 100);
  const b = createFighter('volt', 900, -1);
  tryAttack(a, 'kick');
  for (let i = 0; i < 5; i++) stepFighter(a, {}, b, .04);
  assert.equal(resolveHit(a, b), null);
  assert.equal(b.health, 100);
});
test('cubrirse reduce daño respecto a golpe sin bloqueo', () => {
  const a = createFighter('ember', 300);
  const b = createFighter('volt', 365, -1);
  b.block = true;
  tryAttack(a, 'punch');
  for (let i = 0; i < 3; i++) stepFighter(a, {}, b, .04);
  const hit = resolveHit(a, b);
  assert.equal(hit.guarding, true);
  assert.ok(hit.damage < MOVES.punch.damage);
});
test('especial consume energía y no permite lanzarse sin suficiente barra', () => {
  const a = createFighter('kira', 150);
  assert.equal(tryAttack(a, 'special'), true);
  assert.equal(a.meter, 5);
  a.action = null;
  assert.equal(tryAttack(a, 'special'), false);
});
test('saltos aterrizan y los combatientes no salen de la arena', () => {
  const a = createFighter('volt', 75);
  const b = createFighter('onyx', 900, -1);
  stepFighter(a, { jump: true, left: true }, b, .04);
  assert.ok(a.y > 0);
  for (let i = 0; i < 50; i++) stepFighter(a, { left: true }, b, .04);
  assert.equal(a.y, 0);
  assert.equal(a.x, 75);
});
test('colisión separa luchadores', () => {
  const a = createFighter('kira', 500);
  const b = createFighter('onyx', 505);
  keepApart(a, b);
  assert.ok(b.x - a.x >= 63.99);
});
test('victoria por tiempo se decide con la salud restante o es empate', () => {
  const a = createFighter('kira', 250);
  const b = createFighter('volt', 800);
  assert.equal(winnerByTimeout(a, b), null);
  b.health = 25;
  assert.equal(winnerByTimeout(a, b), 0);
  a.health = 0;
  assert.equal(winnerByTimeout(a, b), 1);
});
test('salud y barra tienen límites', () => {
  const a = createFighter('onyx', 200);
  const b = createFighter('kira', 260, -1);
  for (let i = 0; i < 35; i++) {
    a.action = null; b.stun = 0; b.x = 260; a.meter = 100;
    tryAttack(a, 'special');
    a.action.elapsed = .23;
    resolveHit(a, b);
  }
  assert.equal(b.health, 0);
  assert.ok(a.meter >= 0 && a.meter <= 100);
});
