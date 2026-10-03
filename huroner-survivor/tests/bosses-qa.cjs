const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const BASE=process.env.QA_BASE_URL||'http://127.0.0.1:8000/huroner-survivor/';
const OUT=process.env.QA_OUTPUT||'/tmp/huroner-bosses-qa';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const results=[];
for(const [name,type] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch();const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,locale:'es-ES',ignoreHTTPSErrors:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.route('**/huroner-survivor/app.js',async route=>{const response=await route.fetch();let body=await response.text();body=body.replace('const game = new Game();','const game = window.__qaGame = new Game();');body=body.replace("if (mode === 'playing' && game.state === 'playing') {","if (mode === 'playing' && game.state === 'playing' && !window.__qaFreeze) {");await route.fulfill({response,body});});
 await page.goto(BASE);await page.locator('#config').click();await page.locator('#attack-manual').click();await page.locator('#settings-done').click();await page.locator('#start').click();
 const catalog=await page.evaluate(async base=>(await import(base+'bosses.js')).BOSSES,BASE);
 for(const def of catalog){
   await page.evaluate(async({base,id})=>{
     const {spawnBoss}=await import(base+'bosses.js');const g=__qaGame;window.__qaFreeze=true;g.reset();g.spawnTimer=g.pickupTimer=999;g.player.invuln=999;g.level=5;
     const e=spawnBoss(g,id,5);Object.assign(e,{x:0,y:-125,speed:0,ability:0});
     for(const a of g.enemies){if(a.bossPart==='mage')Object.assign(a,{x:95,y:-110,speed:0,ability:0});if(a.shieldOwnerId)Object.assign(a,{x:75,y:-25,speed:0});}
     g.step(.02);
   },{base:BASE,id:def.id});
   await page.waitForFunction(name=>document.querySelector('#boss-name').textContent.startsWith(name),def.name[0]);
   assert.equal(await page.locator('#boss-count').textContent(),'');assert.equal(await page.locator('#boss-hint').textContent(),def.hint[0]);
   assert.ok(await page.evaluate(()=>__qaGame.hazards.length)>0,def.id+' warning');
   await page.screenshot({path:`${OUT}/${name}-${def.id}-warning.png`});
   await page.evaluate(()=>{const g=__qaGame;for(let i=0;i<115;i++)g.step(.01);});
   await page.waitForTimeout(80);await page.screenshot({path:`${OUT}/${name}-${def.id}-active.png`});
 }
 // A single HUD bar stays at 50% when one twin dies; second kill ends encounter.
 await page.evaluate(async base=>{const {spawnBoss}=await import(base+'bosses.js');const g=__qaGame;g.reset();g.spawnTimer=g.pickupTimer=999;const e=spawnBoss(g,'twins');g.hit(e,1e9)},BASE);
 await page.waitForFunction(()=>document.querySelector('#boss-fill').style.width==='50%');
 assert.equal(await page.locator('#boss-count').textContent(),'');
 await page.evaluate(()=>{const alive=__qaGame.enemies.find(e=>e.boss&&e.hp>0);__qaGame.hit(alive,1e9)});
 await page.waitForFunction(()=>document.querySelector('#boss-hud').hidden);
 assert.equal(await page.evaluate(()=>__qaGame.kills),1);
 // Physical shield key, collision-independent mechanic and translated feedback.
 await page.evaluate(async base=>{const {spawnBoss}=await import(base+'bosses.js');const g=__qaGame;g.reset();g.spawnTimer=g.pickupTimer=999;const e=spawnBoss(g,'bastion');Object.assign(e,{x:0,y:-110});const k=g.enemies.find(x=>x.shieldOwnerId);Object.assign(k,{x:70,y:-20});g.hit(k,1e9)},BASE);
 await page.waitForFunction(()=>document.querySelector('#boss-hint').textContent.startsWith('Escudo roto'));
 // Use real time for actual pause behavior instead of the screenshot freeze hook.
 await page.evaluate(()=>{window.__qaFreeze=false;__qaGame.player.invuln=999});await page.locator('#pause').click();
 const snapshot=await page.evaluate(()=>JSON.stringify(__qaGame));await page.waitForTimeout(180);assert.equal(await page.evaluate(()=>JSON.stringify(__qaGame)),snapshot);
 await page.locator('#quit').click();await page.locator('#language').click();await page.locator('#start').click();
 await page.evaluate(async base=>{window.__qaFreeze=true;const {spawnBoss}=await import(base+'bosses.js');const g=__qaGame;g.spawnTimer=g.pickupTimer=999;spawnBoss(g,'prism',25)},BASE);
 await page.waitForFunction(()=>document.querySelector('#boss-name').textContent.startsWith('Prismatic quail'));
 assert.match(await page.locator('#boss-hint').textContent(),/healing/);
 // Small and desktop HUD layouts with a long hint and simultaneous encounters.
 for(const [width,height,label] of [[320,568,'small'],[1440,1000,'desktop']]){
   await page.setViewportSize({width,height});await page.waitForTimeout(100);
   const bounds=await page.locator('#boss-hud').boundingBox();const buffTop=await page.locator('#buffs').evaluate(e=>e.getBoundingClientRect().top);await page.screenshot({path:`${OUT}/${name}-${label}.png`});assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width&&bounds.y+bounds.height<buffTop,JSON.stringify({bounds,buffTop,width}));
   await page.screenshot({path:`${OUT}/${name}-${label}.png`});
 }
 // Render all unique silhouettes plus the blue rabbit, without changing the simulation.
 const sheet=await page.evaluate(async base=>{
   const {drawBoss,drawShieldKey}=await import(base+'boss-art.js');const {BOSSES,spawnBoss}=await import(base+'bosses.js');const {Game}=await import(base+'core.js');const {createRenderer}=await import(base+'render.js');
   const c=document.createElement('canvas');c.id='boss-sheet';c.width=1080;c.height=810;c.style.cssText='position:fixed;inset:0;z-index:99;width:1080px;height:810px';document.body.append(c);const ctx=c.getContext('2d');ctx.fillStyle='#172b33';ctx.fillRect(0,0,1080,810);
   const actors=[];for(const d of BOSSES){const g=new Game(()=>.5);spawnBoss(g,d.id);actors.push(...g.enemies.filter(e=>e.boss));if(d.id==='bastion')actors.push(g.enemies.find(e=>e.shieldOwnerId));}
   actors.forEach((e,i)=>{e.x=135+(i%4)*270;e.y=155+Math.floor(i/4)*270;e.flash=0;e.shieldOwnerId?drawShieldKey(ctx,e,2):drawBoss(ctx,e,2);ctx.fillStyle='#eaddbf';ctx.font='16px Georgia';ctx.textAlign='center';ctx.fillText(e.shieldOwnerId?'Conejo del escudo':BOSSES.find(b=>b.id===e.bossType).name[0]+(e.bossPart==='blade'?' · espada':e.bossPart==='mage'?' · magia':''),e.x,e.y+75);});
   const canvas=document.createElement('canvas');document.querySelector('#game-shell').append(canvas);const renderer=createRenderer({canvas});const g=__qaGame,before=JSON.stringify(g);renderer.draw(g);const immutable=JSON.stringify(g)===before;renderer.destroy();canvas.remove();return {count:actors.length,immutable};
 },BASE);
 assert.equal(sheet.count,12);assert.ok(sheet.immutable);await page.locator('#boss-sheet').screenshot({path:`${OUT}/${name}-catalog.png`});assert.deepEqual(errors,[]);
 results.push({browser:name,version:browser.version(),result:'PASS',bosses:catalog.map(b=>b.id),checks:['all ten warning/active scenes','twin grouped bar and reward','shield rabbit unlock and hint','real pause','ES/EN names/hints','small/desktop HUD','12 silhouettes','renderer immutable'],errors});await browser.close();
}
fs.writeFileSync(`${OUT}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));})().catch(e=>{console.error(e);process.exit(1)});
