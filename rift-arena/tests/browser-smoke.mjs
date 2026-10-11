import { createServer } from 'node:http';
import { readFile, mkdtemp, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const root=resolve(process.cwd());
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=createServer(async (req,res)=>{
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname.endsWith('/')) pathname += 'index.html';
  const file=resolve(root,'.'+pathname);
  if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}
  try{
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});
    res.end(data);
  }catch{res.writeHead(404).end('Not found');}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin='http://127.0.0.1:'+server.address().port;
let binary;
for(const file of [process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium']) {
  if(!file)continue;
  try{await access(file);binary=file;break;}catch{}
}
if(!binary)throw Error('Chromium/Chrome necesario para el smoke test');
const userData=await mkdtemp(join(tmpdir(),'rift-chrome-'));
let port=null;
const browser=spawn(binary,['--headless=new','--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage','--no-first-run','--remote-allow-origins=*','--remote-debugging-port=0,'--user-data-dir='+userData,'about:blank'],{stdio:'ignore'});
let ws;
try {
  let targets;
  for(let n=0;n<120;n++){
    if(browser.exitCode!==null)throw Error('El navegador se cerró inesperadamente');
    try{
      // Chromium chooses its own free DevTools port: parallel CI runs cannot collide.
      if(!port){
        const chromePortFile=await readFile(join(userData,'DevToolsActivePort'),'utf8');
        port=Number(chromePortFile.trim().split(/\s+/)[0]);
      }
      if(port){
        const resp=await fetch('http://127.0.0.1:'+port+'/json');
        targets=await resp.json();
        if(targets.some(t=>t.type==='page'&&t.webSocketDebuggerUrl))break;
      }
    }catch{}
    await new Promise(r=>setTimeout(r,120));
  }
  const target=targets?.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  assert.ok(target,'No se encontró la pestaña de Chromium');
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done,fail)=>{ws.onopen=done;ws.onerror=fail;});
  let counter=0;
  const pending=new Map();
  ws.onmessage=e=>{
    const msg=JSON.parse(e.data);
    if(!msg.id)return;
    const item=pending.get(msg.id);
    if(!item)return;
    pending.delete(msg.id);
    if(msg.error)item.reject(Error(JSON.stringify(msg.error)));
    else item.resolve(msg.result);
  };
  function call(method,params={}){
    const id=++counter;
    return new Promise((resolve,reject)=>{
      pending.set(id,{resolve,reject});
      ws.send(JSON.stringify({id,method,params}));
    });
  }
  async function evaluate(expression){
    const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails)throw Error('Browser JS error: '+JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  await call('Page.enable');
  await call('Page.navigate',{url:origin+'/rift-arena/'});
  let count=0;
  for(let i=0;i<75;i++){
    try{count=await evaluate("document.getElementById('roster')?.children.length||0");}catch{}
    if(count===8)break;
    await new Promise(r=>setTimeout(r,120));
  }
  assert.equal(count,8,'Los ocho personajes deben renderizarse');
  const portraits=await evaluate("Array.from(document.querySelectorAll('.fighter-card svg')).map(svg=>svg.getAttribute('aria-label'))");
  assert.equal(portraits.length,8);
  assert.ok(portraits.some(label=>label.includes('Gorila')),'Debe haber un gorila visible en el selector');
  assert.ok(portraits.some(label=>label.includes('Pantera')),'Debe haber una pantera visible en el selector');
  assert.ok(portraits.some(label=>label.includes('Oso')),'Debe haber un oso visible en el selector');
  assert.ok(portraits.some(label=>label.includes('Lobo')),'Debe haber un lobo visible en el selector');

  const choice=await evaluate("(()=>{document.querySelector('[data-side=\"1\"]').click();document.querySelectorAll('.fighter-card')[3].click();return document.getElementById('name2').textContent})()");
  assert.equal(choice,'EMBER');
  const local=await evaluate("(()=>{document.querySelector('[data-mode=\"local\"]').click();return document.getElementById('enemyLabel').textContent})()");
  assert.equal(local,'JUGADOR 2');
  const stage=await evaluate(`(()=>{document.querySelector('[data-stage="temple"]').click();return document.querySelector('.stage-tile.chosen')?.dataset.stage})()`);
  assert.equal(stage,'temple','Seleccionar escenario debe funcionar');

  const eight=await evaluate("Array.from(document.querySelectorAll('[data-stage]')).map(node=>node.dataset.stage)");
  assert.deepEqual(eight,['zenith','temple','forge','glacier','forest','volcano','lake','alpine']);
  const stageCards=await evaluate("Array.from(document.querySelectorAll('.stage-tile')).every(node=>node.querySelector('.stage-tile-art')&&node.querySelector('small')?.textContent)");
  assert.equal(stageCards,true,'Each field must have distinct stage art and subtitle');
  const volcano=await evaluate('(()=>{document.querySelector("[data-stage=volcano]").click();return document.querySelector(".stage-tile.chosen")?.dataset.stage})()');
  assert.equal(volcano,'volcano','The volcanic battleground must be selectable');
  const forest=await evaluate('(()=>{document.querySelector("[data-stage=forest]").click();return document.querySelector(".stage-tile.chosen")?.dataset.stage})()');
  assert.equal(forest,'forest','The forest must be selectable');
  const lake=await evaluate('(()=>{document.querySelector("[data-stage=lake]").click();return document.querySelector(".stage-tile.chosen")?.dataset.stage})()');
  assert.equal(lake,'lake','The frozen lake must be selectable');

  const livePreview=await evaluate(`(async()=>{
    await new Promise(done=>setTimeout(done,320));
    const preview=document.getElementById('versus3d');
    const gl=preview?.getContext('webgl');
    return {renderer:preview?.dataset.renderer,hasWebgl:!!gl,width:preview?.width||0,visible:preview?.getBoundingClientRect().width>0};
  })()`);
  assert.equal(livePreview.renderer,'webgl3d','Character selector should have real 3D preview');
  assert.ok(livePreview.hasWebgl&&livePreview.width>100&&livePreview.visible);
  await evaluate(`document.querySelector('[data-mode="cpu"]').click()`);
  const start=await evaluate("(()=>{document.getElementById('startBtn').click();return !document.getElementById('gameScreen').hidden&&document.getElementById('arena').width>0})()");
  const zoomGuard=await evaluate(`(async()=>{
    const ev=(type,detail)=>{const e=new Event(type,{cancelable:true,bubbles:true});if(detail){Object.defineProperty(e,'touches',{value:[]});Object.defineProperty(e,'changedTouches',{value:[{clientX:150,clientY:190}]});}document.dispatchEvent(e);return e.defaultPrevented;};
    const single=ev('touchend',true);
    // Dispatch consecutively: busy software WebGL may delay timers beyond 340ms.
    const double=ev('touchend',true);
    const dbl=ev('dblclick',false);
    return {single,double,dbl,touchAction:getComputedStyle(document.querySelector('#arena')).touchAction};
  })()`);
  assert.equal(zoomGuard.single,false,'Single taps remain interactive');
  assert.equal(zoomGuard.double,true,'iOS double tap should be cancelled');
  assert.equal(zoomGuard.dbl,true,'Native doubleclick should be cancelled');
  assert.equal(zoomGuard.touchAction,'none','Active arena must not native zoom');

  assert.equal(start,true,'La partida debe arrancar con canvas');
  // WebGL must draw actual opaque 3D pixels, not a flat 2D approximation.
  const scene3d=await evaluate(`(async()=>{
    const c=document.getElementById('arena');
    await new Promise(resolve=>setTimeout(resolve,500));
    const mode=c.dataset.renderer;
    let sample=null,error=null,uniqueColors=0,brightnessRange=0;
    if(mode==='webgl3d'){
      const gl=c.getContext('webgl');
      if(gl){
        const px=new Uint8Array(4),seen=new Set(),brightness=[];
        for(let y=1;y<=6;y++)for(let x=1;x<=9;x++){
          gl.readPixels(Math.floor(c.width*x/10),Math.floor(c.height*y/7),1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
          seen.add(Array.from(px).slice(0,3).join(','));
          brightness.push(px[0]+px[1]+px[2]);
        }
        uniqueColors=seen.size;
        brightnessRange=Math.max(...brightness)-Math.min(...brightness);
        gl.readPixels(Math.floor(c.width*.5),Math.floor(c.height*.42),1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
        sample=Array.from(px);error=gl.getError();
      }
    }
    return {mode,width:c.width,height:c.height,sample,error,uniqueColors,brightnessRange};
  })()`);
  assert.equal(scene3d.mode,'webgl3d','Chromium SwiftShader should run real WebGL 3D');
  assert.ok(scene3d.width>300&&scene3d.height>200);
  assert.equal(scene3d.sample?.[3],255,'Opaque 3D arena pixels required');
  assert.equal(scene3d.error,0,'WebGL context must not report an error');
  console.log('WebGL sample metrics:',JSON.stringify(scene3d));
  assert.ok(scene3d.uniqueColors>=4,'3D scene must show different surfaces and lighting');
  assert.ok(scene3d.brightnessRange>=40,'3D arena should have lighting contrast');
  console.log('WebGL visual sample:',scene3d.uniqueColors,'colors, brightness span',scene3d.brightnessRange);
  const touchSurfaces=await evaluate("Boolean(document.getElementById('swipeMove') && document.getElementById('swipeStrike'))");
  assert.equal(touchSurfaces,true,'Controles gestuales montados en escena');
  const paused=await evaluate("(()=>{document.getElementById('pauseBtn').click();return !document.getElementById('pausePanel').hidden})()");
  assert.equal(paused,true,'La pausa debe funcionar');
  const returned=await evaluate("(()=>{document.getElementById('resumeBtn').click();document.getElementById('exitBtn').click();return !document.getElementById('selectScreen').hidden})()");
  assert.equal(returned,true,'Debe poderse salir al selector');
  console.log('Browser smoke OK: WebGL 3D pixels, 8 luchadores, 8 escenarios, gestos, VS local, pausa y menú');
}finally{
  if(ws)ws.close();
  browser.kill('SIGKILL');
  server.close();
  await rm(userData,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
