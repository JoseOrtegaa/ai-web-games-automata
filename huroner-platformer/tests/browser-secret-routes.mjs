import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8123/huroner-platformer/dist/?qa=1');
 await page.waitForFunction(()=>window.__ferretQA); await page.click('#start');
 const state=()=>page.evaluate(()=>window.__ferretQA.state());
 const summaries=[];
 for(let i=0;i<3;i++){
  await page.click(`[data-level="${i}"]`);
  await page.waitForFunction(i=>window.__ferretQA.state().levelIndex===i&&window.__ferretQA.state().mode==='playing',i);
  await page.evaluate(()=>{const qa=window.__ferretQA,t=qa.state().level.tunnel;qa.teleport(t.x,t.y-30);});
  await page.waitForTimeout(200); await page.keyboard.down('ArrowDown');
  await page.waitForFunction(()=>window.__ferretQA.state().inSecret); await page.keyboard.up('ArrowDown');
  await page.waitForTimeout(150); const room=(await state()).level;
  assert.equal(room.width,2800+i*200);
  assert.equal(await page.evaluate(()=>window.__ferretQA.scene.children.list.find(c=>c.type==='TileSprite'&&c.depth===-30)?.displayTexture.key),['castle-cistern','castle-roots','castle-treasury'][i]);
  await page.screenshot({path:`test-results/secret-new-${i+1}.png`});
  await page.keyboard.down('ArrowRight');
  const began=Date.now(),upper=new Set(); let heldUntil=0,jumps=0,furthest=130,detail;
  while(Date.now()-began<45000){
   const s=await state(); detail=s; if(!s.inSecret)break;
   const p=s.player,t=Date.now(); furthest=Math.max(furthest,p.x);
   for(const [n,solid] of s.level.solids.entries()) if(solid.oneWay&&p.grounded&&Math.abs(p.feet-solid.y)<5&&p.x>solid.x&&p.x<solid.x+solid.width)upper.add(n);
   if(heldUntil&&t>heldUntil){await page.keyboard.up('Space');heldUntil=0;await page.waitForTimeout(50);continue;}
   const obstacle=s.level.solids.some(v=>v.x>p.x&&v.x-p.x<95&&v.y<p.feet-15&&v.y>p.feet-120);
   const enemy=s.enemies.some(e=>e.active&&e.x>p.x&&e.x-p.x<110&&Math.abs(e.y-p.y)<85);
   if(p.grounded&&!heldUntil&&(obstacle||enemy)){await page.keyboard.down('Space');heldUntil=t+550;jumps++;}
   if(p.x>room.width/2 && !summaries[i]?.screenshot){
    summaries[i]={screenshot:true};await page.screenshot({path:`test-results/secret-mid-${i+1}.png`});
   }
   await page.waitForTimeout(35);
  }
  await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');
  const s=await state(); assert(!s.inSecret,`secret ${i+1} stuck at ${detail.player.x}`);
  assert.equal(s.mode,'playing');assert(s.kibble>10);assert(upper.size>=2,`no upper route visited: ${upper.size}`);
  assert(s.health>0,'secret route must remain survivable');
  summaries[i]={level:i+1,width:room.width,jumps,upperLandings:upper.size,kibble:s.kibble,furthest};
  console.log('SECRET ROUTE PASS',summaries[i]);
  await page.evaluate(()=>{const qa=window.__ferretQA;qa.teleport(qa.state().level.goal.x,385);});
  await page.waitForFunction(()=>window.__ferretQA.state().mode==='won'); await page.click('#win-map');
 }
 assert.deepEqual(errors,[]);fs.writeFileSync('test-results/secret-routes.json',JSON.stringify(summaries,null,2));
} finally {await browser.close();}
