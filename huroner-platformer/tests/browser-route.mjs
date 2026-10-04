import { chromium } from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1280,height:720}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.BASE_URL||'http://127.0.0.1:8123/huroner-platformer/dist/?qa=1');await page.waitForFunction(()=>window.__ferretQA);await page.screenshot({path:'test-results/menu.png'});await page.click('#start');await page.screenshot({path:'test-results/gameplay.png'});
await page.keyboard.down('ArrowRight');let jumpUntil=0,lastX=180,lastProgress=Date.now(),jumped=0;let result, checkpoints=[];const began=Date.now();
while(Date.now()-began<180000){
const s=await page.evaluate(()=>window.__ferretQA.state()); result=s; const p=s.player,t=Date.now();
if(s.mode==='won')break;
if(p.x>lastX+100){lastX=p.x;lastProgress=t;if(Math.floor(p.x/1000)>checkpoints.length){checkpoints.push({x:p.x,time:s.time,health:s.health});console.log('progress',JSON.stringify(checkpoints.at(-1)));}}
if(t-lastProgress>8000){console.log('STUCK',JSON.stringify({p,health:s.health,mode:s.mode}));break;}
if(t>jumpUntil){await page.keyboard.up('Space');jumpUntil=0;}
const floor=s.level.solids.filter(v=>Math.abs(v.y-p.feet)<6&&p.x+12>v.x&&p.x-12<v.x+v.width).sort((a,b)=>b.x+b.width-a.x-a.width)[0];
const obstacle=s.level.solids.some(v=>!v.oneWay&&v.x>p.x&&v.x-p.x<90&&v.y<p.feet-10&&v.y>p.feet-105);
const edge=floor&&floor.x+floor.width-p.x<65&&!s.level.solids.some(v=>v.x<=floor.x+floor.width+1&&v.x+v.width>floor.x+floor.width+5&&v.y>=floor.y&&v.y-floor.y<90);
const enemy=s.enemies.some(e=>e.active&&e.x>p.x&&e.x-p.x<100&&Math.abs(e.y-p.y)<70);
if(p.grounded&&!jumpUntil&&(obstacle||edge||enemy)){await page.keyboard.down('Space');jumpUntil=t+550;jumped++;}
await page.waitForTimeout(35);
}
await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');await page.screenshot({path:'test-results/route-end.png'});fs.writeFileSync('test-results/route-result.json',JSON.stringify({mode:result.mode,time:result.time,player:result.player,health:result.health,kibble:result.kibble,secrets:result.secrets,checkpoint:result.checkpoint,jumped,errors,checkpoints},null,2));console.log(fs.readFileSync('test-results/route-result.json','utf8'));await browser.close();if(result.mode!=='won'||errors.length)process.exitCode=1;
