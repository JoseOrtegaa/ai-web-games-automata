import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results', { recursive:true });
const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH, headless:true, args:['--no-sandbox'] });
const page = await browser.newPage({ viewport:{width:1280,height:720} });
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
try {
    await page.goto(process.env.BASE_URL||'http://127.0.0.1:8123/huroner-platformer/dist/?qa=1');
    await page.waitForFunction(()=>window.__ferretQA);
    await page.screenshot({path:'test-results/world-menu.png'});
    await page.click('#start');
    for (const [name,x,y,label] of [['house',1200,335,'Casa'],['garage',3550,280,'cochera'],['park',6720,390,'parque'],['mountain',9050,275,'montaña'],['castle',12490,245,'castillo']]) {
        await page.evaluate(([x,y])=>{const q=window.__ferretQA;q.teleport(x,y);q.scene.physics.pause();},[x,y]);
        await page.waitForTimeout(450);
        assert((await page.locator('#location').textContent()).includes(label));
        await page.screenshot({path:`test-results/world-${name}.png`});
    }
    await page.setViewportSize({width:844,height:390});
    await page.evaluate(()=>window.__ferretQA.teleport(9050,275));
    await page.waitForTimeout(400);
    assert(await page.locator('#swipe-zone').isVisible());
    const hud = await page.locator('#hud').evaluate(e=>e.scrollWidth<=e.clientWidth);
    assert(hud,'HUD fits mobile width');
    await page.screenshot({path:'test-results/world-mountain-mobile.png'});
    assert.deepEqual(errors,[]);
    console.log('PASS: five environment labels and rendered captures, mobile HUD and swipe controls, no browser errors.');
} finally { await browser.close(); }
