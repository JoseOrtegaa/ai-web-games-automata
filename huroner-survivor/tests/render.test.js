import test from 'node:test';
import assert from 'node:assert/strict';
import { bossIndicatorGeometry, cameraZoomFor } from '../render.js';

test('boss direction indicator stays hidden while the boss is safely visible', () => {
  assert.equal(bossIndicatorGeometry(220, 390, 220, 390, 440, 780), null);
  assert.equal(bossIndicatorGeometry(300, 300, 220, 390, 440, 780), null);
});

test('boss direction indicator clamps to the viewport edge and keeps direction', () => {
  const right = bossIndicatorGeometry(900, 390, 220, 390, 440, 780);
  assert.ok(right); assert.ok(Math.abs(right.x - 404) < 1e-8); assert.ok(Math.abs(right.angle) < 1e-8);

  const up = bossIndicatorGeometry(220, -500, 220, 390, 440, 780);
  assert.ok(up); assert.ok(Math.abs(up.y - 124) < 1e-8); assert.ok(Math.abs(up.angle + Math.PI / 2) < 1e-8);

  const downLeft = bossIndicatorGeometry(-500, 1200, 220, 390, 440, 780);
  assert.ok(downLeft); assert.ok(downLeft.x >= 36 && downLeft.x <= 404); assert.ok(downLeft.y <= 712);
  assert.ok(downLeft.angle > Math.PI / 2);
});


test('camera zoom shows roughly thirty percent more field than the previous framing',()=>{
  assert.ok(Math.abs(cameraZoomFor(390)-(.84/1.3))<1e-8);
  assert.ok(Math.abs(cameraZoomFor(430)-(.9261538461538461/1.3))<1e-8);
  assert.ok(Math.abs(cameraZoomFor(540)-(.99/1.3))<1e-8);
  assert.ok(cameraZoomFor(320)>=.52&&cameraZoomFor(320)<.54);
});
