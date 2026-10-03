const {chromium,webkit}=require('playwright');const fs=require('node:fs');const OUT=process.env.QA_OUTPUT||'/tmp/huroner-world-qa';fs.mkdirSync(OUT,{recursive:true});const assert=require('node:assert/strict');
(async()=>{const results=[];for(const [name,type] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch({executablePath:name==='chromium'?process.env.CHROMIUM_EXECUTABLE:undefined});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,ignoreHTTPSErrors:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 const base=process.env.QA_BASE_URL||'http://127.0.0.1:8000/huroner-survivor/';await page.goto(base);await page.locator('#start').click();await page.locator('#pause').click();await page.evaluate(()=>document.querySelector('#pause-screen').hidden=true);
 const result=await page.evaluate(async base=>{
  const {createRenderer}=await import(base+'render.js');const {Game}=await import(base+'core.js');const {worldStage}=await import(base+'world.js');
  const canvas=document.createElement('canvas');document.querySelector('#game-shell').append(canvas);canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:1';const renderer=createRenderer({canvas});const game=new Game(()=>.1);game.enemies=[];game.gems=[];game.pickups=[];game.effects=[];
  window.qaScene={game,renderer,canvas};const signature=()=>{const c=document.createElement('canvas');c.width=c.height=32;c.getContext('2d').drawImage(canvas,0,0,32,32);return c.toDataURL()};
  const render=(depth,level,time=20,cave=null)=>{game.worldDepth=depth;game.level=level;game.time=time;game.cave=cave;const before=JSON.stringify(game);renderer.draw(game,{reducedMotion:true});if(JSON.stringify(game)!==before)throw Error('Renderer mutated Game');return signature()};
  const surface=render(0,1),surfaceLate=render(0,25);if(surface!==surfaceLate)throw Error('Surface still changes automatically by level');
  const underground=render(1,10);if(underground===surface)throw Error('Underground layer missing');
  const deep20=render(2,20),deep25=render(2,25);if(deep20===underground||deep20===deep25)throw Error('Deep layer 20/25 evolution missing');
  const magma30=render(3,30),magma35=render(3,35);if(magma30===deep25||magma30===magma35)throw Error('Magma 30/35 evolution missing');
  const cave=render(0,5,20,{x:520,y:0,targetDepth:1,level:5});if(cave===surface)throw Error('Cave/indicator not rendered');
  const stages=[[0,1],[0,25],[1,10],[2,15],[2,20],[2,25],[3,30],[3,35]].map(([d,l])=>[d,l,worldStage(d,l)]);
  return {stages,checks:['world depth controls background','surface no longer rotates every 5 levels','deep world evolves at 20/25','magma evolves at 35','cave and guidance render','renderer does not mutate simulation']};
 },base);
 assert.deepEqual(result.stages.map(x=>x[2]),[0,0,10,20,21,22,30,31]);
 for(const [depth,level] of [[0,1],[1,10],[2,20],[2,25],[3,30],[3,35]]){await page.evaluate(([depth,level])=>{const {game,renderer}=qaScene;game.worldDepth=depth;game.level=level;game.cave=null;renderer.draw(game,{reducedMotion:true})},[depth,level]);await page.screenshot({path:OUT+`/world-${name}-d${depth}-l${level}.png`});}
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{qaScene.renderer.resize();qaScene.renderer.draw(qaScene.game,{reducedMotion:true})});await page.screenshot({path:OUT+`/world-${name}-desktop.png`});assert.deepEqual(errors,[]);results.push({browser:name,version:browser.version(),...result,errors,result:'PASS'});await browser.close();
 }fs.writeFileSync(OUT+'/'+(process.env.QA_BASE_URL?'world-public':'world-local')+'.json',JSON.stringify({date:new Date().toISOString(),results},null,2));console.log(JSON.stringify(results.map(x=>({browser:x.browser,result:x.result,checks:x.checks}))));})().catch(e=>{console.error(e);process.exit(1)});
