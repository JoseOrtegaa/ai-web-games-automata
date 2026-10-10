import { defeatBoss } from './boss-helper.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.BASE_URL||'http://127.0.0.1:8123/huroner-platformer/dist/?qa=1';
 await page.goto(url);await page.waitForFunction(()=>window.__ferretQA);await page.click('#start');
 const state=()=>page.evaluate(()=>window.__ferretQA.state());
 const tele=async p=>{await page.evaluate(p=>window.__ferretQA.teleport(p.x,p.y),p);await page.waitForTimeout(180);};
 const enter=async()=>{
  const t=(await state()).level.tunnel;await tele({x:t.x,y:t.y-30});await page.keyboard.down('ArrowDown');
  await page.waitForFunction(()=>window.__ferretQA.state().inSecret);await page.keyboard.up('ArrowDown');await page.waitForTimeout(180);
 };
 const leave=async()=>{await tele({x:(await state()).level.goal.x,y:385});await page.waitForFunction(()=>!window.__ferretQA.state().inSecret);};
 for(let i=0;i<3;i++){
  await page.click(`[data-level="${i}"]`);await page.waitForFunction(i=>window.__ferretQA.state().levelIndex===i&&window.__ferretQA.state().mode==='playing',i);
  await enter();const rewards=(await state()).level.rewards;
  const before=(await state()).kibble;await tele(rewards.chest);const after=(await state()).kibble;
  await page.screenshot({path:`test-results/reward-chest-${i+1}.png`});
  assert(after>=before+25,'chest reward');await page.waitForTimeout(350);assert.equal((await state()).kibble,after,'overlap cannot repeat');
  await tele(rewards.relic);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('ferret-jump-relics-v1')));assert(saved.relics.includes(rewards.relic.id));
  await leave();const returned=(await state()).kibble;
  await enter();await tele(rewards.chest);assert.equal((await state()).kibble,returned,'reentry cannot farm chest');
  assert(await page.evaluate(()=>window.__ferretQA.scene.pickups.getChildren().filter(p=>p.getData('reward')==='relic').length===0),'permanent relic must not respawn');
  // Dying keeps the run's claimed chest and croquettes.
  await page.evaluate(()=>{const s=window.__ferretQA.scene;s.status.shield=false;for(let n=0;n<3;n++)s.damage(s.player.sprite.x,true);});
  await page.waitForFunction(()=>window.__ferretQA.state().mode==='playing'&&window.__ferretQA.state().health===3);
  await tele(rewards.chest);assert.equal((await state()).kibble,returned,'death cannot farm chest');
  await leave();if(i===2)await defeatBoss(page);await tele({x:(await state()).level.goal.x,y:385});await page.waitForFunction(()=>window.__ferretQA.state().mode==='won');await page.click('#win-map');
  assert.equal(await page.locator('#relic-list .found').count(),i+1);
  await page.screenshot({path:`test-results/collection-${i+1}.png`});
  await page.reload();await page.waitForFunction(()=>window.__ferretQA);await page.click('#start');
  assert.equal(await page.locator('#relic-list .found').count(),i+1,'reload retains collection');
  // Restarting a fresh run grants one new chest, but never a duplicate relic.
  await page.click(`[data-level="${i}"]`);await page.waitForFunction(()=>window.__ferretQA.state().mode==='playing');await enter();
  const fresh=(await state()).kibble;await tele(rewards.chest);assert((await state()).kibble>=fresh+25,'fresh run chest');
  await page.click('#pause');await page.click('#pause-map');
  console.log(`PASS rewards 1-${i+1}: chest, no farming, death, permanent relic, map, reload, fresh run`);
 }
 assert.deepEqual(errors,[]);
 // The collection remains usable in a narrow portrait viewport.
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'test-results/collection-portrait.png'});
}finally{await browser.close();}
