import { createServer } from 'node:http';
import { readFile, mkdtemp, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const root=resolve(process.cwd());
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=createServer(async (req,res)=>{
  const file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
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
const port=19384;
const browser=spawn(binary,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--remote-allow-origins=*','--remote-debugging-port='+port,'--user-data-dir='+userData,'about:blank'],{stdio:'ignore'});
let ws;
try {
  let targets;
  for(let n=0;n<80;n++){
    if(browser.exitCode!==null)throw Error('El navegador se cerró inesperadamente');
    try{
      const resp=await fetch('http://127.0.0.1:'+port+'/json');
      targets=await resp.json();
      if(targets.some(t=>t.type==='page'&&t.webSocketDebuggerUrl))break;
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
    if(count===4)break;
    await new Promise(r=>setTimeout(r,120));
  }
  assert.equal(count,4,'Los cuatro personajes deben renderizarse');
  const choice=await evaluate("(()=>{document.querySelector('[data-side=\"1\"]').click();document.querySelectorAll('.fighter-card')[3].click();return document.getElementById('name2').textContent})()");
  assert.equal(choice,'EMBER');
  const local=await evaluate("(()=>{document.querySelector('[data-mode=\"local\"]').click();return document.getElementById('enemyLabel').textContent})()");
  assert.equal(local,'JUGADOR 2');
  const start=await evaluate("(()=>{document.getElementById('startBtn').click();return !document.getElementById('gameScreen').hidden&&document.getElementById('arena').width>0})()");
  assert.equal(start,true,'La partida debe arrancar con canvas');
  const paused=await evaluate("(()=>{document.getElementById('pauseBtn').click();return !document.getElementById('pausePanel').hidden})()");
  assert.equal(paused,true,'La pausa debe funcionar');
  const returned=await evaluate("(()=>{document.getElementById('resumeBtn').click();document.getElementById('exitBtn').click();return !document.getElementById('selectScreen').hidden})()");
  assert.equal(returned,true,'Debe poderse salir al selector');
  console.log('Browser smoke OK: selector, personajes, VS local, inicio, pausa, reanudar y salir');
}finally{
  if(ws)ws.close();
  browser.kill('SIGKILL');
  server.close();
  await rm(userData,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
