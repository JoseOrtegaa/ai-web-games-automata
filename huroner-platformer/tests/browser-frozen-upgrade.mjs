import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:932,height:320},hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL);await page.waitForFunction(()=>window.__ferretQA);
 await page.evaluate(()=>{
  localStorage.setItem('ferret-jump-v1',JSON.stringify({version:1,total:3000,best:100}));
  localStorage.setItem('ferret-jump-campaign-v1',JSON.stringify({version:1,completed:['1-1','1-2','1-3','2-1','2-2']}));
 });
 await page.click('#start');await page.click('#tab-shop');
 for(const id of ['mint','coral','gold','midnight','balloon-red','balloon-mint','balloon-gold'])await page.click(`[data-cosmetic="${id}"]`);
 assert.equal(await page.locator('#shop-balance').textContent(),'◆ 1900 croquetas disponibles');
 await page.reload();await page.waitForFunction(()=>window.__ferretQA);await page.click('#start');
 for(let i=3;i<6;i++){
  await page.click(`[data-level="${i}"]`);await page.waitForFunction(()=>window.__ferretQA.state().mode==='playing');
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>window.__ferretQA.scene.player.sprite.texture.key),'ferret-midnight');
  assert(await page.evaluate(()=>{const b=window.__ferretQA.scene.balloon;return b.visible&&b.texture.key==='balloon-gold'&&!b.body;}));
  await page.evaluate(()=>{const q=window.__ferretQA,s=q.state().level.secrets[0];q.teleport(s.x-35,s.y+s.height-30);q.scene.player.invulnerableUntil=1e9;});
  await page.waitForTimeout(150);await page.screenshot({path:`test-results/frozen-panel-${i}.png`});
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>window.__ferretQA.state().secrets.length===1);await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(450);
  assert(await page.evaluate(()=>window.__ferretQA.scene.panels[0].rect.alpha<.2));
  await page.evaluate(()=>{const q=window.__ferretQA,t=q.state().level.tunnel;q.teleport(t.x,t.y-30);});
  await page.waitForTimeout(250);await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>window.__ferretQA.state().inSecret);await page.keyboard.up('ArrowDown');
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>window.__ferretQA.scene.balloon.texture.key),'balloon-gold');
  await page.click('#pause');await page.click('#pause-map');
 }
 await page.click('#tab-shop');await page.click('[data-cosmetic="no-balloon"]');await page.click('#tab-worlds');
 await page.click('[data-level="0"]');await page.waitForFunction(()=>window.__ferretQA.state().mode==='playing');await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>window.__ferretQA.scene.balloon.visible),false);
 assert.deepEqual(errors,[]);
 console.log('PASS frozen improvements: grounded reveal with real movement, three crouch entrances, new coats/balloons, wallet, reload, removal and secret transitions.');
}finally{await browser.close();}
