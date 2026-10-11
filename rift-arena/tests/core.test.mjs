import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, createFighter, fighterDefinition, tryAttack, stepFighter, resolveHit, keepApart, winnerByTimeout, MOVES } from '../core.js';
test('ocho luchadores únicos y configurados', () => {
  assert.equal(ROSTER.length, 8);
  assert.equal(new Set(ROSTER.map(f => f.id)).size, 8);
  assert.ok(ROSTER.every(f => f.speed > 0 && f.power > 0));
});
test('la selección conserva el personaje solicitado', () => {
  const a = createFighter('brute', 200);
  assert.equal(fighterDefinition(a.id).name, 'BRUTE');
  assert.equal(a.health, 100);
});
test('un puñetazo alcanza y causa daño solo durante ventana activa', () => {
  const a = createFighter('ryuzo', 300);
  const b = createFighter('drake', 370, -1);
  assert.equal(tryAttack(a, 'punch'), true);
  assert.equal(resolveHit(a, b), null);
  for (let i = 0; i < 3; i++) stepFighter(a, {}, b, .04);
  const hit = resolveHit(a, b);
  assert.ok(hit && hit.damage > 0);
  assert.equal(resolveHit(a, b), null);
});
test('fuera de alcance no se recibe daño', () => {
  const a = createFighter('ryuzo', 100);
  const b = createFighter('drake', 900, -1);
  tryAttack(a, 'kick');
  for (let i = 0; i < 5; i++) stepFighter(a, {}, b, .04);
  assert.equal(resolveHit(a, b), null);
  assert.equal(b.health, 100);
});
test('cubrirse reduce daño respecto a golpe sin bloqueo', () => {
  const a = createFighter('titan', 300);
  const b = createFighter('drake', 365, -1);
  b.block = true;
  tryAttack(a, 'punch');
  for (let i = 0; i < 3; i++) stepFighter(a, {}, b, .04);
  const hit = resolveHit(a, b);
  assert.equal(hit.guarding, true);
  assert.ok(hit.damage < MOVES.punch.damage);
});
test('especial consume energía y no permite lanzarse sin suficiente barra', () => {
  const a = createFighter('ryuzo', 150);
  assert.equal(tryAttack(a, 'special'), true);
  assert.equal(a.meter, 5);
  a.action = null;
  assert.equal(tryAttack(a, 'special'), false);
});
test('saltos aterrizan y los combatientes no salen de la arena', () => {
  const a = createFighter('drake', 75);
  const b = createFighter('brute', 900, -1);
  stepFighter(a, { jump: true, left: true }, b, .04);
  assert.ok(a.y > 0);
  for (let i = 0; i < 50; i++) stepFighter(a, { left: true }, b, .04);
  assert.equal(a.y, 0);
  assert.equal(a.x, 65);
});
test('colisión separa luchadores', () => {
  const a = createFighter('ryuzo', 500);
  const b = createFighter('brute', 505);
  keepApart(a, b);
  assert.ok(b.x - a.x >= 63.99);
});
test('victoria por tiempo se decide con la salud restante o es empate', () => {
  const a = createFighter('ryuzo', 250);
  const b = createFighter('drake', 800);
  assert.equal(winnerByTimeout(a, b), null);
  b.health = 25;
  assert.equal(winnerByTimeout(a, b), 0);
  a.health = 0;
  assert.equal(winnerByTimeout(a, b), 1);
});
test('salud y barra tienen límites', () => {
  const a = createFighter('brute', 200);
  const b = createFighter('ryuzo', 260, -1);
  for (let i = 0; i < 35; i++) {
    a.action = null; b.stun = 0; b.x = 260; a.meter = 100;
    tryAttack(a, 'special');
    a.action.elapsed = .23;
    resolveHit(a, b);
  }
  assert.equal(b.health, 0);
  assert.ok(a.meter >= 0 && a.meter <= 100);
});

test('gancho eleva al rival y habilita combos',()=>{
  const a=createFighter('ryuzo',300),b=createFighter('drake',370,-1);
  assert.equal(tryAttack(a,'uppercut'),true);
  for(let i=0;i<5;i++)stepFighter(a,{},b,.04);
  const hit=resolveHit(a,b);
  assert.equal(hit.launch,true);
  assert.ok(b.vy>0);
});
test('barrido golpea al rival que bloquea alto',()=>{
  const a=createFighter('titan',300),b=createFighter('drake',375,-1);
  b.block=true;
  assert.equal(tryAttack(a,'sweep'),true);
  for(let i=0;i<5;i++)stepFighter(a,{},b,.04);
  const hit=resolveHit(a,b);
  assert.ok(hit);
  assert.equal(hit.guarding,false);
});
test('golpes rápidos admiten encadenamiento y cambian a nuevo ataque',()=>{
  const a=createFighter('selene',300),b=createFighter('brute',500,-1);
  tryAttack(a,'punch');
  for(let i=0;i<4;i++)stepFighter(a,{},b,.04);
  assert.equal(tryAttack(a,'kick'),true);
  for(let i=0;i<12;i++)stepFighter(a,{},b,.04);
  assert.equal(a.action?.type,'kick');
});
