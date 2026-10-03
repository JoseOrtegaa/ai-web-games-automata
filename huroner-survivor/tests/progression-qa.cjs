const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const OUT = process.env.QA_OUTPUT || '/tmp/huroner-progression-qa';
const BASE = process.env.QA_BASE_URL || 'http://127.0.0.1:8000/huroner-survivor/';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const results = [];
  for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
    const browser = await engine.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, locale: 'es-ES' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.route('**/huroner-survivor/app.js', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace('const game = new Game();', 'const game = window.__qaGame = new Game();') });
    });
    await page.goto(BASE);
    await page.locator('#config').click(); await page.locator('#attack-manual').click();
    await page.locator('#settings-done').click(); await page.locator('#start').click();
    await page.evaluate(() => { __qaGame.spawnTimer = __qaGame.pickupTimer = 999; });
    assert.equal(await page.locator('#shield-label').count(), 0);
    assert.equal(await page.locator('.shield-caption').count(), 0);
    await page.evaluate(() => __qaGame.hurt(15));
    await page.waitForFunction(() => document.querySelector('#hp-label').textContent === '85 / 100');
    await page.locator('#pause').click();
    const paused = await page.evaluate(() => JSON.stringify([__qaGame.time, __qaGame.player.hp]));
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => JSON.stringify([__qaGame.time, __qaGame.player.hp])), paused);
    await page.locator('#resume').click();

    // Reach a real choice using kill XP, with remaining gems out of pickup range.
    await page.evaluate(() => {
      const g = __qaGame; g.xp = 8.4;
      const enemy = g.spawn('rabbit'); Object.assign(enemy, { x: 400, y: 400 }); g.hit(enemy, 1e6);
    });
    await page.locator('#level-screen').waitFor();
    assert.equal(await page.evaluate(() => __qaGame.level), 2);
    assert.equal(await page.evaluate(() => __qaGame.xp), 0);
    assert.equal(await page.evaluate(() => __qaGame.gems[0].value), 1.4);
    await page.waitForTimeout(150);

    await page.evaluate(async base => {
      const { UPGRADES } = await import(base + 'core.js');
      for (const u of UPGRADES) __qaGame.upgrades[u.id] = u.max;
      __qaGame.upgrades.magnet = 3; __qaGame.offer();
    }, BASE);
    await page.waitForFunction(() => document.querySelectorAll('#choices button').length === 1 && document.querySelector('[data-upgrade="magnet"]'));
    assert.match(await page.locator('#choices em').textContent(), /3 \/ 4 → 4 \/ 4/);
    await page.locator('[data-upgrade="magnet"]').click();
    await page.evaluate(() => __qaGame.offer());
    await page.waitForFunction(() => document.querySelector('[data-upgrade="heal"]'));
    assert.equal(await page.locator('#choices button').count(), 1);
    await page.locator('[data-upgrade="heal"]').click();

    // Clean run checks restart, both languages, small screens and real character rendering.
    await page.locator('#pause').click(); await page.locator('#quit').click();
    await page.locator('#language').click(); await page.locator('#start').click();
    await page.evaluate(() => { __qaGame.spawnTimer = __qaGame.pickupTimer = 999; });
    assert.equal(await page.locator('.shield-caption').count(), 0);
    assert.equal(await page.locator('#shield-label').count(), 0);
    for (const [width, height, label] of [[390,844,'mobile'],[320,568,'small'],[1440,1000,'desktop']]) {
      await page.setViewportSize({ width, height }); await page.waitForTimeout(100);
      const layout = await page.evaluate(() => {
        const box = id => { const r = document.querySelector(id).getBoundingClientRect(); return { x:r.x, y:r.y, right:r.right, bottom:r.bottom }; };
        return { health:box('.health-caption'), pause:box('#pause'), shell:box('#game-shell') };
      });
      assert.ok(layout.health.y >= 0 && layout.health.right < layout.pause.x);
      assert.ok(layout.pause.right <= layout.shell.right);
      await page.screenshot({ path: `${OUT}/${name}-${label}.png` });
    }
    const art = await page.evaluate(async base => {
      const { drawFerret } = await import(base + 'art.js');
      const { createRenderer } = await import(base + 'render.js');
      const { Game } = await import(base + 'core.js');
      const canvas = document.createElement('canvas'); canvas.width = 700; canvas.height = 250;
      canvas.id = 'qa-art'; canvas.style.cssText = 'position:fixed;inset:0;z-index:100;width:700px;height:250px'; document.body.append(canvas);
      const c = canvas.getContext('2d'); c.fillStyle = '#15282d'; c.fillRect(0,0,700,250);
      [0,1,2,3].forEach((evolution,i) => drawFerret(c,{x:90+i*175,y:140,scale:2.8,face:i%2?-1:1,armor:i>1?3:0,evolution}));
      const stages=[0,1,2,3].map(i=>c.getImageData(i*175,0,175,250).data.reduce((sum,v,j)=>sum+(j%4===3?0:v),0));
      const hidden = document.createElement('canvas'); document.querySelector('#game-shell').append(hidden);
      const renderer = createRenderer({canvas:hidden}), game = new Game(() => .5);
      const before = JSON.stringify(game); renderer.draw(game); const immutable = JSON.stringify(game) === before;
      const {cameraZoomFor}=await import(base+'render.js'); renderer.destroy(); hidden.remove(); return {stages,immutable,zoom:cameraZoomFor(390)};
    }, BASE);
    assert.equal(new Set(art.stages).size,4); assert.equal(art.immutable,true); assert.ok(Math.abs(art.zoom-.84)<1e-8);
    await page.locator('#qa-art').screenshot({ path: `${OUT}/${name}-ferret-evolution.png` });
    assert.deepEqual(errors, []);
    results.push({ browser:name, version:browser.version(), result:'PASS', checks:['no player shield HUD and health damage','pause freeze','direct kill XP level-up','max-rank exclusion without shield upgrade','reset and ES/EN','390/320/1440 layouts','four ferret evolution stages','zoomed-out framing','renderer immutable'], errors });
    await browser.close();
  }
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results,null,2)); console.log(JSON.stringify(results));
})().catch(error => { console.error(error); process.exitCode = 1; });
