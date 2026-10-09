import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=process.env.BASE_URL||'http://127.0.0.1:8123/huroner-platformer/dist/?qa=1';
const load=async()=>{await page.goto(url);await page.waitForFunction(()=>window.__ferretQA);};
try {
    await load();
    await page.evaluate(()=>localStorage.setItem('ferret-jump-v1',JSON.stringify({version:1,total:42,best:20})));
    await page.click('#start');
    assert(await page.locator('[data-level="1"]').isDisabled());
    assert(await page.locator('[data-level="2"]').isDisabled());
    assert.equal(await page.locator('.future-world b').allTextContents().then(a=>a.join('')),'???');
    await page.screenshot({path:'test-results/castle-map-mobile.png'});
    for(let i=0;i<3;i++) {
        await page.click(`[data-level="${i}"]`);
        await page.waitForFunction(i=>window.__ferretQA.state().mode==='playing'&&window.__ferretQA.state().levelIndex===i,i);
        await page.waitForTimeout(150);
        await page.screenshot({path:`test-results/castle-${i+1}-mobile.png`});
        assert(await page.locator('#swipe-zone').isVisible());
        assert(await page.locator('#hud').evaluate(e=>e.scrollWidth<=e.clientWidth));
        await page.evaluate(()=>{const q=window.__ferretQA;q.teleport(q.state().level.goal.x,385);});
        await page.waitForFunction(()=>window.__ferretQA.state().mode==='won');
        assert((await page.locator('#win-title').textContent()).includes(i===2?'Castillo medieval':'completado'));
        await page.click('#win-map');
        assert(!(await page.locator(`[data-level="${Math.min(i+1,2)}"]`).isDisabled()));
    }
    assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('ferret-jump-v1')))).total>=42,'legacy kibble preserved');
    await load(); await page.click('#start');
    assert.equal(await page.locator('.level-node:disabled').count(),0,'unlocks persist');
    await page.screenshot({path:'test-results/castle-map-complete.png'});
    await page.click('[data-level="1"]');
    await page.waitForFunction(()=>window.__ferretQA.state().levelIndex===1&&window.__ferretQA.state().mode==='playing');
    await page.click('#pause');await page.click('#restart');
    assert.equal(await page.evaluate(()=>window.__ferretQA.state().levelIndex),1,'restart stays in selected level');
    await page.click('#pause');await page.click('#pause-map');
    await page.click('[data-level="0"]');await page.waitForFunction(()=>window.__ferretQA.state().levelIndex===0&&window.__ferretQA.state().mode==='playing');
    await page.keyboard.down('ArrowRight');await page.waitForTimeout(220);await page.keyboard.up('ArrowRight');
    assert((await page.evaluate(()=>window.__ferretQA.state())).player.x>190,'controls survive repeated scene changes');
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>window.__ferretQA.state().mode),'paused');
    await page.setViewportSize({width:844,height:390});await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>window.__ferretQA.state().mode),'playing');
    assert.deepEqual(errors,[]);
    console.log('PASS: map, locks, three doors, level transitions, persistent progress, legacy save, restart, repeated navigation, rotation and mobile HUD.');
} finally {await browser.close();}
