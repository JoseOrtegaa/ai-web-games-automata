import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8123/huroner-platformer/dist/?qa=1');
 await page.waitForFunction(()=>window.__ferretQA);await page.click('#start');
 const state=()=>page.evaluate(()=>window.__ferretQA.state());
 const enter=async()=>{
  await page.evaluate(()=>{const q=window.__ferretQA,t=q.state().level.tunnel;q.teleport(t.x,t.y-30);});
  await page.waitForTimeout(200);await page.keyboard.down('ArrowDown');
  await page.waitForFunction(()=>window.__ferretQA.state().inSecret);await page.keyboard.up('ArrowDown');await page.waitForTimeout(150);
 };
 for(let i=0;i<3;i++){
  await page.click(`[data-level="${i}"]`);
  await page.waitForFunction(i=>window.__ferretQA.state().levelIndex===i&&window.__ferretQA.state().mode==='playing',i);
  await enter();assert.equal((await state()).enemies.length,3);
  const kinds=[...new Set((await state()).enemies.map(e=>e.kind))];
  for(const kind of kinds){
   const target=(await state()).enemies.find(e=>e.kind===kind);
   await page.evaluate(({x,y})=>window.__ferretQA.teleport(x,y-60),target);
   await page.waitForTimeout(500);
   let e=(await state()).enemies.find(e=>e.id===target.id);
   assert.equal(e.hp,kind==='mimic'?1:0,`stomp ${kind}`);
   if(kind==='mimic'){
    await page.waitForTimeout(350);
    e=(await state()).enemies.find(e=>e.id===target.id);
    await page.evaluate(({x,y})=>window.__ferretQA.teleport(x,y-60),e);await page.waitForTimeout(500);
    assert.equal((await state()).enemies.find(e=>e.id===target.id).hp,0);
   }
   console.log(`PASS real stomp: ${kind}`);
  }
  await page.screenshot({path:`test-results/inhabitants-${i+1}.png`});
  await page.evaluate(()=>{const q=window.__ferretQA;q.teleport(q.state().level.goal.x,385);});
  await page.waitForFunction(()=>!window.__ferretQA.state().inSecret);
  await enter();
  for(const kind of kinds)assert.equal((await state()).enemies.find(e=>e.kind===kind).hp,0,'defeated enemies remain defeated on reentry');
  // A fresh chapter run restores the species' correct HP.
  await page.click('#pause');await page.click('#restart');await page.waitForFunction(()=>!window.__ferretQA.state().inSecret);
  await enter();for(const e of (await state()).enemies)assert.equal(e.hp,e.kind==='mimic'?2:1);
  await page.evaluate(()=>{const q=window.__ferretQA;q.teleport(q.state().level.goal.x,385);});
  await page.waitForFunction(()=>!window.__ferretQA.state().inSecret);
  await page.evaluate(()=>{const q=window.__ferretQA;q.teleport(q.state().level.goal.x,385);});
  await page.waitForFunction(()=>window.__ferretQA.state().mode==='won');await page.click('#win-map');
 }
 assert.deepEqual(errors,[]);console.log('PASS secret enemy persistence, HP reset and console');
}finally{await browser.close();}
