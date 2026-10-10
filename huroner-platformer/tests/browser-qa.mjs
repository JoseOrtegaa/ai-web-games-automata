// End-to-end suite. Starts a local static server unless BASE_URL already points to one.
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
fs.mkdirSync('test-results',{recursive:true});
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const files=['browser-route.mjs','browser-enemies.mjs','browser-cases.mjs','browser-controls.mjs','browser-crouch.mjs','browser-worlds.mjs','browser-tunnels.mjs','browser-secret-routes.mjs','browser-hidden-enemies.mjs','browser-rewards.mjs','browser-expansion.mjs','browser-frozen-secrets.mjs','browser-visual.mjs'];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json','.txt':'text/plain; charset=utf-8'};
let server;
if(!process.env.BASE_URL){
 server=createServer(async(req,res)=>{
  try {
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   let target=path.resolve(repo,`.${pathname}`);
   if(target!==repo&&!target.startsWith(repo+path.sep)){res.writeHead(403).end();return;}
   if((await stat(target)).isDirectory())target=path.join(target,'index.html');
   res.writeHead(200,{'content-type':mime[path.extname(target)]||'application/octet-stream'}).end(await readFile(target));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
}
const base=process.env.BASE_URL||`http://127.0.0.1:${server.address().port}/huroner-platformer/dist/?qa=1`;
const runs=[];
try{
 for(const file of files){
  const result=await new Promise(resolve=>{
   const child=spawn(process.execPath,[`tests/${file}`],{stdio:'inherit',env:{...process.env,BASE_URL:base}});
   const timer=setTimeout(()=>child.kill('SIGTERM'),360000);
   child.on('error',error=>{clearTimeout(timer);resolve({status:1,error:error.message});});
   child.on('exit',(status,signal)=>{clearTimeout(timer);resolve({status:status??1,signal});});
  });
  runs.push({file,...result});
 }
}finally{await new Promise(resolve=>server?.close(resolve)??resolve());}
fs.writeFileSync('test-results/summary.json',JSON.stringify(runs,null,2));
console.log('QA SUMMARY',JSON.stringify(runs));
if(runs.some(r=>r.status!==0))process.exitCode=1;
