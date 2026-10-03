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
    assert.equal(await page.locator('#shield-label').textContent(), '20 / 20');
    assert.equal(await page.locator('.shield-caption').textContent(), '◇ ESCUDO20 / 20');
    await page.evaluate(() => __qaGame.hurt(15));
    await page.waitForFunction(() => document.querySelector('#shield-label').textContent === '5 / 20');
    assert.equal(await page.locator('#hp-label').textContent(), '100 / 100');
    assert.equal(await page.locator('#shield-fill').evaluate(e => e.style.width), '25%');
    await page.locator('#pause').click();
    const paused = await page.evaluate(() => JSON.stringify([__qaGame.time, __qaGame.player.shield, __qaGame.player.shieldDelay]));
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => JSON.stringify([__qaGame.time, __qaGame.player.shield, __qaGame.player.shieldDelay])), paused);
    await page.locator('#resume').click();
    await page.evaluate(() => { __qaGame.player.shieldDelay = 0; });
    await page.waitForFunction(() => __qaGame.player.shield > 5.1);

    // Reach a real choice using kill XP, with remaining gems out of pickup range.
    await page.evaluate(() => {
      const g = __qaGame; g.xp = 8.4;
      const enemy = g.spawn('rabbit'); Object.assign(enemy, { x: 400, y: 400 }); g.hit(enemy, 1e6);
    });
    await page.locator('#level-screen').waitFor();
    assert.equal(await page.evaluate(() => __qaGame.level), 2);
    assert.equal(await page.evaluate(() => __qaGame.xp), 0);
    assert.equal(await page.evaluate(() => __qaGame.gems[0].value), 1.4);
    const frozenShield = await page.evaluate(() => __qaGame.player.shield);
    await page.waitForTimeout(150); assert.equal(await page.evaluate(() => __qaGame.player.shield), frozenShield);

    await page.evaluate(async base => {
      const { UPGRADES } = await import(base + 'core.js');
      for (const u of UPGRADES) __qaGame.upgrades[u.id] = u.max;
      __qaGame.upgrades.shield = 4; __qaGame.offer();
    }, BASE);
    await page.waitForFunction(() => document.querySelectorAll('#choices button').length === 1 && document.querySelector('[data-upgrade="shield"]'));
    assert.match(await page.locator('#choices em').textContent(), /4 \/ 5 → 5 \/ 5/);
    await page.screenshot({ path: `${OUT}/${name}-shield-choice.png` });
    await page.locator('[data-upgrade="shield"]').click();
    await page.waitForFunction(() => document.querySelector('#shield-label').textContent.endsWith('/ 120'));
    await page.evaluate(() => __qaGame.offer());
    await page.waitForFunction(() => document.querySelector('[data-upgrade="heal"]'));
    assert.equal(await page.locator('#choices button').count(), 1);
    await page.locator('[data-upgrade="heal"]').click();

    // Clean run checks restart, both languages, small screens and real character rendering.
    await page.locator('#pause').click(); await page.locator('#quit').click();
    await page.locator('#language').click(); await page.locator('#start').click();
    await page.evaluate(() => { __qaGame.spawnTimer = __qaGame.pickupTimer = 999; });
    assert.match(await page.locator('.shield-caption').textContent(), /SHIELD/);
    assert.equal(await page.locator('#shield-label').textContent(), '20 / 20');
    for (const [width, height, label] of [[390,844,'mobile'],[320,568,'small'],[1440,1000,'desktop']]) {
      await page.setViewportSize({ width, height }); await page.waitForTimeout(100);
      const layout = await page.evaluate(() => {
        const box = id => { const r = document.querySelector(id).getBoundingClientRect(); return { x:r.x, y:r.y, right:r.right, bottom:r.bottom }; };
        return { shield:box('.shield-caption'), health:box('.health-caption'), pause:box('#pause'), shell:box('#game-shell') };
      });
      assert.ok(layout.shield.y >= 0 && layout.shield.bottom <= layout.health.y);
      assert.ok(layout.shield.right < layout.pause.x && layout.pause.right <= layout.shell.right);
      await page.screenshot({ path: `${OUT}/${name}-${label}.png` });
    }
    const art = await page.evaluate(async base => {
      const { drawFerret } = await import(base + 'art.js');
      const { createRenderer } = await import(base + 'render.js');
      const { Game } = await import(base + 'core.js');
      const canvas = document.createElement('canvas'); canvas.width = 700; canvas.height = 250;
      canvas.id = 'qa-art'; canvas.style.cssText = 'position:fixed;inset:0;z-index:100;width:700px;height:250px'; document.body.append(canvas);
      const c = canvas.getContext('2d'); c.fillStyle = '#15282d'; c.fillRect(0,0,700,250);
      [1,-1,1,-1].forEach((face,i) => drawFerret(c,{x:90+i*175,y:140,scale:2.8,face,armor:i>1?3:0,shield:i%2?0:1}));
      const sample = (x,y) => Array.from(c.getImageData(x,y,1,1).data);
      const charged = sample(90-16*2.8,140+5*2.8), depleted = sample(265+16*2.8,140+5*2.8);
      const hidden = document.createElement('canvas'); document.querySelector('#game-shell').append(hidden);
      const renderer = createRenderer({canvas:hidden}), game = new Game(() => .5);
      const before = JSON.stringify(game); renderer.draw(game); const immutable = JSON.stringify(game) === before;
      renderer.destroy(); hidden.remove(); return {charged,depleted,immutable};
    }, BASE);
    assert.notDeepEqual(art.charged, art.depleted); assert.equal(art.immutable, true);
    await page.locator('#qa-art').screenshot({ path: `${OUT}/${name}-ferret-shield.png` });
    assert.deepEqual(errors, []);
    results.push({ browser:name, version:browser.version(), result:'PASS', checks:['shield HUD and damage','pause and choice freeze recharge','direct kill XP level-up','max-rank exclusion and shield upgrade','reset and ES/EN','390/320/1440 layouts','shield art both directions and armor','renderer immutable'], errors });
    await browser.close();
  }
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results,null,2)); console.log(JSON.stringify(results));
})().catch(error => { console.error(error); process.exitCode = 1; });
