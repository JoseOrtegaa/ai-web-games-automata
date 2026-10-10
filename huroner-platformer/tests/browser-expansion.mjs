import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto('http://127.0.0.1:8123/huroner-platformer/dist/?qa=1');
 await page.waitForFunction(()=>window.__ferretQA);
 await page.evaluate(()=>localStorage.setItem('ferret-jump-v1',JSON.stringify({version:1,total:500,best:65})));
 await page.click('#start');
 assert.equal(await page.locator('[data-level]').count(),6);
 assert(await page.locator('[data-level="3"]').isDisabled());
 await page.click('[data-cosmetic="beret"]');
 assert.equal(await page.locator('#shop-balance').textContent(),'◆ 420 croquetas disponibles');
 await page.click('[data-cosmetic="snow"]');
 assert.equal(await page.locator('#shop-balance').textContent(),'◆ 300 croquetas disponibles');
 for(let i=0;i<6;i++){
  await page.click(`[data-level="${i}"]`);
  await page.waitForFunction(i=>window.__ferretQA.state().mode==='playing'&&window.__ferretQA.state().levelIndex===i,i);
  const state=await page.evaluate(()=>window.__ferretQA.state());
  assert(state.level.tunnel && state.level.width>3900);
  if(i===3){
   await page.evaluate(()=>window.__ferretQA.teleport(840,340));
   await page.waitForTimeout(100);
   assert.equal(await page.evaluate(()=>window.__ferretQA.state().level.solids.some(s=>s.surface==='ice')),true);
   await page.screenshot({path:'test-results/frozen-stage.png'});
  }
  if(i===2||i===5){
   await page.evaluate(()=>{const q=window.__ferretQA;q.teleport(q.state().level.goal.x,365)});
   await page.waitForTimeout(120);
   assert.equal(await page.evaluate(()=>window.__ferretQA.state().mode),'playing','boss guards gate');
   for(let hit=0;hit<3;hit++){
    await page.evaluate(()=>{const q=window.__ferretQA,scene=q.scene;q.teleport(scene.boss.x,295);scene.player.body.setVelocityY(360);});
    await page.waitForFunction(hit=>window.__ferretQA.state().boss.hp<=2-hit,hit,{timeout:3500});
    await page.waitForTimeout(900);
   }
   assert.equal(await page.evaluate(()=>window.__ferretQA.state().boss.active),false);
  }
  await page.evaluate(()=>{const q=window.__ferretQA;q.teleport(q.state().level.goal.x,365)});
  await page.waitForFunction(()=>window.__ferretQA.state().mode==='won');
  await page.click('#win-map');
  if(i<5)assert(!(await page.locator(`[data-level="${i+1}"]`).isDisabled()));
 }
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('ferret-jump-campaign-v1')).completed.length),6);
 for(let i=3;i<6;i++){
  await page.click(`[data-level="${i}"]`);
  await page.waitForFunction(i=>window.__ferretQA.state().levelIndex===i&&window.__ferretQA.state().mode==='playing',i);
  await page.evaluate(()=>{const q=window.__ferretQA,t=q.state().level.tunnel;q.teleport(t.x,t.y-30);});
  await page.waitForTimeout(250);await page.keyboard.down('ArrowDown');
  await page.waitForFunction(()=>window.__ferretQA.state().inSecret,{timeout:3500});
  await page.keyboard.up('ArrowDown');
  const rewards=await page.evaluate(()=>window.__ferretQA.state().level.rewards);
  await page.evaluate(p=>window.__ferretQA.teleport(p.x,p.y),rewards.chest);
  await page.waitForTimeout(200);
  assert((await page.evaluate(()=>window.__ferretQA.state().kibble))>=25);
  await page.evaluate(p=>window.__ferretQA.teleport(p.x,p.y),rewards.relic);
  await page.waitForFunction(id=>JSON.parse(localStorage.getItem('ferret-jump-relics-v1')||'{}').relics?.includes(id),rewards.relic.id);
  await page.click('#pause');await page.click('#pause-map');
 }
 assert.equal(await page.locator('#relic-list .found').count(),3);
 await page.screenshot({path:'test-results/expansion-map.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: six-level map, cosmetics, saved wallet, ice, boss gates and progression.');
} finally {await browser.close();}
