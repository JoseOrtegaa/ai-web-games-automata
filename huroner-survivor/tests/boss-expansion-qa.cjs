const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const BASE=process.env.QA_BASE_URL||'http://127.0.0.1:8000/huroner-survivor/';
const OUT=process.env.QA_OUTPUT||'/tmp/huroner-boss-expansion';fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const results=[];
 for(const [name,type] of [['chromium',chromium],['webkit',webkit]]){
  if(process.env.QA_BROWSERS&&!process.env.QA_BROWSERS.split(',').includes(name))continue;
  const browser=await type.launch();const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,locale:'es-ES',ignoreHTTPSErrors:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  await page.route('**/huroner-survivor/app.js',async route=>{
   const response=await route.fetch();let body=await response.text();
   body=body.replace('const game = new Game();','const game = window.__qaGame = new Game();');
   body=body.replace("if (mode === 'playing' && game.state === 'playing') {","if (mode === 'playing' && game.state === 'playing' && !window.__qaFreeze) {");
   await route.fulfill({response,body});
  });
  await page.goto(BASE);await page.locator('#config').click();await page.locator('#attack-manual').click();await page.locator('#settings-done').click();await page.locator('#start').click();
  const cases=await page.evaluate(async base=>{
   const {EXTRA_ATTACKS}=await import(base+'bosses.js');
   window.__qaSheets={};for(const phase of ['warning','active']){const c=document.createElement('canvas');c.width=1200;c.height=2760;__qaSheets[phase]=c;}
   return Object.entries(EXTRA_ATTACKS).flatMap(([key,ids])=>ids.map((id,slot)=>({key,id,index:(key==='king'?3:1)+slot})));
  },BASE);
  for(const [n,entry] of cases.entries()){
   await page.evaluate(async({base,key,index})=>{
    const {spawnBoss}=await import(base+'bosses.js');const g=__qaGame;__qaFreeze=true;g.reset();g.level=15;g.spawnTimer=g.pickupTimer=999;g.player.invuln=999;
    let e=key==='king'?g.spawn('chicken',true,15,true):spawnBoss(g,['blade','mage'].includes(key)?'twins':key,15);
    if(key==='mage')e=g.enemies.find(a=>a.bossPart==='mage');
    for(const other of g.enemies)if(other!==e){other.x=1000;other.speed=0;other.ability=999;}
    Object.assign(e,{x:0,y:-110,speed:0,ability:0,attackIndex:index});g.step(.01);
   },{base:BASE,...entry});
   await page.waitForFunction(()=>!document.querySelector('#boss-hud').hidden);
   for(const phase of ['warning','active']){
    if(phase==='active')await page.evaluate(()=>{for(let i=0;i<132;i++)__qaGame.step(.01)});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const state=await page.evaluate(async({base,n,id,phase})=>{
     const {createRenderer}=await import(base+'render.js');const g=__qaGame;
     const c=document.createElement('canvas');document.querySelector('#game-shell').append(c);
     const r=createRenderer({canvas:c}),before=JSON.stringify(g);r.draw(g);const immutable=before===JSON.stringify(g);r.destroy();c.remove();
     const ctx=__qaSheets[phase].getContext('2d'),x=n%4*300,y=Math.floor(n/4)*460;
     ctx.fillStyle='#132832';ctx.fillRect(x,y,300,460);ctx.drawImage(document.querySelector('#world'),x,y+28,300,432);
     ctx.fillStyle='#fff0ce';ctx.font='16px sans-serif';ctx.fillText(id,x+8,y+20);
     return {immutable,hazards:g.hazards.length,shots:g.shots.length,last:g.enemies.find(e=>e.boss&&e.x<500)?.lastAttack};
    },{base:BASE,n,id:entry.id,phase});
    assert.ok(state.immutable,entry.id);assert.ok(state.hazards<=64&&state.shots<=150,entry.id);
   }
  }
  for(const phase of ['warning','active']){
   const data=await page.evaluate(phase=>__qaSheets[phase].toDataURL().split(',')[1],phase);
   fs.writeFileSync(`${OUT}/${name}-${phase}.png`,Buffer.from(data,'base64'));
  }
  // Pause is an actual UI action; the test-only freeze is disabled here.
  await page.evaluate(()=>{__qaFreeze=false;__qaGame.player.invuln=999});await page.locator('#pause').click();
  const frozen=await page.evaluate(()=>JSON.stringify(__qaGame));await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>JSON.stringify(__qaGame)),frozen);
  assert.deepEqual(errors,[]);results.push({browser:name,version:browser.version(),result:'PASS',attacks:cases.map(c=>c.id),checks:['24 warning/active renders','renderer immutable','bounded effects','real UI pause'],errors});await browser.close();
 }
 fs.writeFileSync(`${OUT}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exit(1)});
