import test from 'node:test';
import assert from 'node:assert/strict';
import {movementFromDrag,strikeFromSwipe} from '../gestures.js';
import {STAGES} from '../stages.js';
test('pulgar izquierdo controla dirección y guardia',()=>{
  assert.equal(movementFromDrag(-55,0).left,true);
  assert.equal(movementFromDrag(55,0).right,true);
  assert.equal(movementFromDrag(0,-70).jump,true);
  assert.equal(movementFromDrag(0,70).block,true);
  assert.equal(movementFromDrag(0,70).crouch,true);
  assert.equal(movementFromDrag(8,3).left,false);
});
test('pulgar derecho reconoce puño, patada, gancho, barrido y especial',()=>{
  assert.equal(strikeFromSwipe(0,0,90),'punch');
  assert.equal(strikeFromSwipe(0,0,520),'block');
  assert.equal(strikeFromSwipe(90,6,150),'kick');
  assert.equal(strikeFromSwipe(0,-80,150),'uppercut');
  assert.equal(strikeFromSwipe(0,80,150),'sweep');
  assert.equal(strikeFromSwipe(80,-63,150),'special');
});
test('ocho escenarios tienen identidad y colores propios',()=>{
  assert.equal(STAGES.length,8);
  assert.equal(new Set(STAGES.map(x=>x.id)).size,8);
  assert.ok(STAGES.every(s=>s.name&&s.sky.length>=3&&s.color));
});
