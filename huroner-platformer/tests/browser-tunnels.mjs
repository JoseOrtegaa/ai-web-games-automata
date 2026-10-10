import { defeatBoss } from './boss-helper.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>window.__ferretQA.state());
const tele=async(x,y)=>{await page.evaluate(({x,y})=>window.__ferretQA.teleport(x,y),{x,y});await page.waitForTimeout(180);};
const enter=async()=>{
 const t=(await state()).level.tunnel;
 await tele(t.x,t.y-30);await page.waitForFunction(()=>window.__ferretQA.state().player.grounded);
 await page.keyboard.down('ArrowDown');
 await page.waitForFunction(()=>window.__ferretQA.state().inSecret);
 await page.keyboard.up('ArrowDown');await page.waitForTimeout(180);
};
const leave=async()=>{
 await tele((await state()).level.goal.x,385);
 await page.waitForFunction(()=>!window.__ferretQA.state().inSecret);
 await page.waitForTimeout(200);
};
try{
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8123/huroner-platformer/dist/?qa=1');
 await page.waitForFunction(()=>window.__ferretQA);await page.click('#start');
 for(let i=0;i<3;i++){
  await page.click(`[data-level="${i}"]`);
  await page.waitForFunction(i=>window.__ferretQA.state().levelIndex===i&&window.__ferretQA.state().mode==='playing',i);
  assert((await state()).level.width>=4940);
  await tele(1420,385);
  await page.evaluate(()=>{const s=window.__ferretQA.scene;s.status.health=2;const e=s.enemies.list[0];e.hp=0;e.sprite.disableBody(true,true);});
  const t=(await state()).level.tunnel;
  await tele(t.x-80,400);await page.keyboard.down('ArrowDown');await page.waitForTimeout(150);
  assert(!(await state()).inSecret,'crouching beside tunnel must not enter');await page.keyboard.up('ArrowDown');
  await enter();let s=await state();assert.equal(s.health,2);assert.equal(s.mode,'playing');
  const initial=s.kibble;
  const coin=s.level.collectibles[0];await tele(coin.x,coin.y);assert((await state()).kibble>initial);
  const collected=(await state()).kibble;
  await page.screenshot({path:`test-results/secret-${i+1}.png`});
  await leave();s=await state();assert.equal(s.kibble,collected);assert(s.checkpoint);assert.equal(s.enemies[0].hp,0);
  assert(Math.abs(s.player.x-t.x)<3);assert.equal(s.health,2);
  assert.equal(await page.locator('#win').isVisible(),false,'secret exit cannot complete chapter');
  await page.waitForTimeout(600);assert(!(await state()).inSecret,'no automatic reentry');
  await enter();await tele(coin.x,coin.y);assert.equal((await state()).kibble,collected,'no duplicate secret rewards');
  await leave();
  if(i===2)await defeatBoss(page);await tele((await state()).level.goal.x,385);await page.waitForFunction(()=>window.__ferretQA.state().mode==='won');
  await page.click('#win-map');
 }
 // Wheel entry, then restarting from the room resets the parent chapter.
 await page.click('[data-level="0"]');await page.waitForFunction(()=>window.__ferretQA.state().mode==='playing');
 const t=(await state()).level.tunnel;await tele(t.x,t.y-30);
 await page.mouse.wheel(0,140);await page.waitForFunction(()=>window.__ferretQA.state().inSecret);
 await page.click('#pause');await page.click('#restart');
 await page.waitForFunction(()=>!window.__ferretQA.state().inSecret&&window.__ferretQA.state().mode==='playing');
 assert.equal((await state()).kibble,0);assert((await state()).player.x<250);
 assert.deepEqual(errors,[]);
 console.log('PASS: all three tunnels, side rejection, secret rewards, return, preserved health/checkpoint/enemies, no farming or accidental reentry, wheel and restart.');
}finally{await browser.close();}
