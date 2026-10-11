import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL);await page.waitForFunction(()=>window.__ferretQA);
 await page.evaluate(()=>localStorage.setItem('ferret-jump-v1',JSON.stringify({version:1,total:500,best:65})));
 await page.click('#start');
 assert(await page.locator('#panel-worlds').isVisible());assert(!(await page.locator('#panel-shop').isVisible()));
 const cdp=await page.context().newCDPSession(page);
 const swipe=async(selector)=>{
  const overflow=await page.locator('#map-content').evaluate(e=>e.scrollHeight-e.clientHeight);
  if(overflow<=30)return; // A fully visible collection needs no scrolling.
  await page.locator(selector).scrollIntoViewIfNeeded();
  const box=await page.locator(selector).boundingBox();
  const viewport=page.viewportSize();
  const x=box.x+box.width/2,y=Math.min(box.y+box.height/2,viewport.height-20);
  const before=await page.locator('#map-content').evaluate(e=>e.scrollTop);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=6;i++){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*18}]});await page.waitForTimeout(30);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);
  assert((await page.locator('#map-content').evaluate(e=>e.scrollTop))>before+30,'swipe over a card must scroll');
 };
 await swipe('[data-level="0"]');
 assert.equal(await page.evaluate(()=>window.__ferretQA.state().mode),'menu','drag cannot launch a level');
 await page.click('#tab-shop');await swipe('[data-cosmetic="none"]');
 assert.equal(await page.locator('#shop-balance').textContent(),'◆ 500 croquetas disponibles','scroll cannot buy');
 await page.click('[data-cosmetic="crown"]');await page.click('[data-cosmetic="snow"]');
 assert.equal(await page.locator('#shop-balance').textContent(),'◆ 220 croquetas disponibles');
 assert(await page.locator('[data-cosmetic="crown"]').isDisabled());
 await page.click('[data-cosmetic="none"]');await page.click('[data-cosmetic="crown"]');
 assert.equal(await page.locator('#shop-balance').textContent(),'◆ 220 croquetas disponibles','owned item equip is free');
 await page.locator('#map-content').evaluate(e=>e.scrollTop=0);
 await page.screenshot({path:'test-results/menu-shop.png'});
 await page.click('#tab-relics');assert(await page.locator('#panel-relics').isVisible());
 await swipe('.relic-card:first-child');await page.locator('#map-content').evaluate(e=>e.scrollTop=0);await page.screenshot({path:'test-results/menu-raros.png'});
 await page.click('#tab-worlds');await page.locator('#map-content').focus();
 await page.keyboard.press('ArrowDown');await page.waitForTimeout(200);
 assert((await page.locator('#map-content').evaluate(e=>e.scrollTop))>0,'keyboard scroll is not consumed by gameplay');
 await page.locator('#map-content').evaluate(e=>e.scrollTop=0);
 await page.screenshot({path:'test-results/menu-worlds.png'});
 await page.setViewportSize({width:667,height:375});
 assert(await page.locator('#map-content').evaluate(e=>e.scrollWidth<=e.clientWidth));
 await page.click('[data-level="0"]');await page.waitForFunction(()=>window.__ferretQA.state().mode==='playing');
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(220);await page.keyboard.up('ArrowRight');
 assert((await page.evaluate(()=>window.__ferretQA.state().player.x))>190);
 await page.click('#pause');await page.click('#pause-map');assert(await page.locator('#panel-worlds').isVisible());
 await page.reload();await page.waitForFunction(()=>window.__ferretQA);await page.click('#start');await page.click('#tab-shop');
 assert(await page.locator('[data-cosmetic="crown"]').isDisabled());
 assert.equal(await page.locator('#shop-balance').textContent(),'◆ 220 croquetas disponibles');
 // Reduced heights reproduce the space left by Safari's address/tab bars.
 for(const viewport of [{width:932,height:280},{width:932,height:320},{width:844,height:300}]){
  await page.setViewportSize(viewport);await page.click('#tab-worlds');
  const layout=await page.evaluate(()=>{
   const content=document.getElementById('map-content'),nav=document.querySelector('.map-tabs');
   const c=content.getBoundingClientRect(),n=nav.getBoundingClientRect();
   return {height:c.height,width:c.width,left:c.left,navRight:n.right,overflow:content.scrollWidth>content.clientWidth};
  });
  assert(layout.height>=viewport.height-30,'content uses almost all available height');
  assert(layout.left>=layout.navRight,'navigation sits beside the content');
  assert(layout.width>viewport.width*.68&&!layout.overflow,'wide readable content with no horizontal overflow');
  for(const tab of ['worlds','shop','relics']){
   await page.click(`#tab-${tab}`);
   await swipe(tab==='worlds'?'[data-level="0"]':tab==='shop'?'[data-cosmetic="none"]':'.relic-card:first-child');
   await page.locator('#map-content').evaluate(e=>e.scrollTop=0);
   const bounds=await page.locator(`#tab-${tab}`).boundingBox();assert(bounds.height>=44);
   await page.screenshot({path:`test-results/menu-short-${viewport.width}-${viewport.height}-${tab}.png`});
  }
 }
 await page.setViewportSize({width:1280,height:800});await page.click('#tab-worlds');
 const desktop=await page.evaluate(()=>({nav:document.querySelector('.map-tabs').getBoundingClientRect().bottom,content:document.getElementById('map-content').getBoundingClientRect().top}));
 assert(desktop.content>=desktop.nav,'tall screens retain horizontal navigation');
 assert.deepEqual(errors,[]);
 console.log('PASS menu: real touch swipes over cards and equipped buttons, tabs, wallet, equip, reload and playable controls.');
} finally {await browser.close();}
