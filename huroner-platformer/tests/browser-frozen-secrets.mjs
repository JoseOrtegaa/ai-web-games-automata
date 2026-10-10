import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>window.__ferretQA.state());
try {
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8123/huroner-platformer/dist/?qa=1');await page.waitForFunction(()=>window.__ferretQA);
 await page.evaluate(()=>localStorage.setItem('ferret-jump-campaign-v1',JSON.stringify({version:1,completed:['1-1','1-2','1-3','2-1','2-2']})));
 await page.click('#start');
 for(let i=3;i<6;i++){
  await page.click(`[data-level="${i}"]`);await page.waitForFunction(i=>window.__ferretQA.state().mode==='playing'&&window.__ferretQA.state().levelIndex===i,i);
  await page.evaluate(()=>{const q=window.__ferretQA,t=q.state().level.tunnel;q.teleport(t.x,t.y-30);});
  await page.waitForTimeout(240);await page.keyboard.down('ArrowDown');
  await page.waitForFunction(()=>window.__ferretQA.state().inSecret);await page.keyboard.up('ArrowDown');
  const room=(await state()).level;
  assert.equal(room.width,2820+(i-3)*160);
  assert.equal(await page.evaluate(()=>window.__ferretQA.scene.children.list.find(c=>c.type==='TileSprite'&&c.depth===-30)?.displayTexture.key),['castle-frozen-crystal','castle-frozen-lake','castle-frozen-observatory'][i-3]);
  await page.keyboard.down('ArrowRight');
  const began=Date.now();let jumpUntil=0,furthest=0,jumps=0;
  while(Date.now()-began<65000){
   const s=await state();if(!s.inSecret)break;
   const p=s.player,t=Date.now();furthest=Math.max(furthest,p.x);
   if(jumpUntil&&t>jumpUntil){await page.keyboard.up('Space');jumpUntil=0;await page.waitForTimeout(40);continue;}
   const obstacle=s.level.solids.some(v=>v.x>p.x&&v.x-p.x<100&&v.y<p.feet-15&&v.y>p.feet-115);
   const enemy=s.enemies.some(e=>e.active&&e.x>p.x&&e.x-p.x<110&&Math.abs(e.y-p.y)<85);
   if(p.grounded&&!jumpUntil&&(obstacle||enemy)){await page.keyboard.down('Space');jumpUntil=t+520;jumps++;}
   await page.waitForTimeout(35);
  }
  await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');
  const s=await state();assert(!s.inSecret,`frozen secret ${i-2} stuck at ${furthest}`);
  assert.equal(s.mode,'playing');assert(furthest>room.goal.x-150);
  assert(s.kibble>=10,'reward trail remains traversable');
  assert(s.health>0);console.log(`PASS frozen secret 2-${i-2}: ${Math.round(furthest)} px, ${jumps} jumps, ${s.kibble} kibble`);
  if(s.kibble<25){
   await page.evaluate(()=>{const q=window.__ferretQA,t=q.state().level.tunnel;q.teleport(t.x,t.y-30);});
   await page.waitForTimeout(200);await page.keyboard.down('ArrowDown');
   await page.waitForFunction(()=>window.__ferretQA.state().inSecret);await page.keyboard.up('ArrowDown');
   const chest=(await state()).level.rewards.chest;
   await page.evaluate(p=>window.__ferretQA.teleport(p.x,p.y),chest);
   await page.waitForTimeout(180);assert((await state()).kibble>=s.kibble+25,'optional chest remains collectible');
   await page.evaluate(()=>{const q=window.__ferretQA;q.teleport(q.state().level.goal.x,385);});
   await page.waitForFunction(()=>!window.__ferretQA.state().inSecret);
  }
  await page.click('#pause');await page.click('#pause-map');
 }
 assert.deepEqual(errors,[]);
} finally {await browser.close();}
