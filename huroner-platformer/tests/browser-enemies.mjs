import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
try {
 const page = await browser.newPage({viewport:{width:1280,height:720}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL || 'http://127.0.0.1:8123/huroner-platformer/dist/?qa=1');
 await page.waitForFunction(()=>window.__ferretQA);
 await page.click('#start'); await page.click('[data-level="0"]');
 await page.waitForFunction(()=>window.__ferretQA.state().mode==='playing');
 const result=await page.evaluate(()=>{
  const scene=window.__ferretQA.scene, enemies=scene.enemies;
  scene.physics.pause();
  const ground=enemies.list.find(e=>e.def.kind==='rabbit');
  enemies.update(0,ground.sprite.x-50,ground.sprite.y);
  const groundLeft=ground.sprite.body.velocity.x;
  enemies.update(0,ground.sprite.x+20,ground.sprite.y);
  const groundRight=ground.sprite.body.velocity.x;
  const bird=enemies.list.find(e=>e.def.kind==='quail');
  enemies.update(0,bird.sprite.x-60,bird.sprite.y+40);
  const flight={vx:bird.sprite.body.velocity.x,vy:bird.sprite.body.velocity.y,gravity:bird.sprite.body.allowGravity};
  // Bring two bodies together to exercise yielding, then restore their placements.
  const other=enemies.list.find(e=>e!==ground&&e.def.kind!=='quail');
  other.sprite.setPosition(ground.sprite.x+40,ground.sprite.y);
  enemies.update(0,ground.sprite.x+60,ground.sprite.y);
  const yielding=ground.sprite.body.velocity.x;
  other.sprite.setPosition(other.def.x,other.def.y);
  const shooter=enemies.list.find(e=>e.def.kind==='spitter');
  enemies.projectiles.clear(true,true);
  enemies.update(5000,shooter.sprite.x-150,shooter.sprite.y);
  const shot=enemies.projectiles.getChildren().find(p=>p.active);
  if(!shot) throw Error('No actual enemy shot');
  const start=shot.getData('startX');
  shot.x=start-419; enemies.update(5001,shot.x,100); const before=shot.active;
  shot.x=start-421; enemies.update(5002,shot.x,100); const removed=!shot.active;
  enemies.projectiles.clear(true,true);
  enemies.update(10000,shooter.sprite.x-150,shooter.sprite.y);
  const timed=enemies.projectiles.getChildren().find(p=>p.active);
  if(!timed) throw Error('No lifetime test shot');
  enemies.update(12801,0,100); const timedOut=!timed.active;
  return {groundLeft,groundRight,flight,yielding,before,removed,timedOut};
 });
 assert(result.groundLeft<0&&result.groundRight>0);
 assert(result.flight.vx<0&&result.flight.vy>0&&!result.flight.gravity);
 assert.equal(result.yielding,0);
 assert(result.before&&result.removed&&result.timedOut);
 assert.deepEqual(errors,[]);
 console.log('Enemy pursuit, spacing and actual projectile range/lifetime: PASS',result);
} finally { await browser.close(); }
