import { drawBoss, drawShieldKey, drawBossHazards, drawBossProjectile } from './boss-art.js';
import { drawFerret, drawAnimal } from './art.js';
import { createWorldLayer } from './world.js';
function ellipse(c,x,y,rx,ry,color,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}}
function line(c,points,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function sword(c,x,y,angle,scale=1){c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);c.fillStyle='#dce9ce';c.beginPath();c.moveTo(-4,0);c.lineTo(-5,-35);c.lineTo(0,-47);c.lineTo(5,-35);c.lineTo(4,0);c.closePath();c.fill();line(c,[[0,-40],[0,-1]],'#86afa1',1.3);line(c,[[-10,0],[10,0]],'#d6ad57',4);line(c,[[0,2],[0,13]],'#8a5e3c',5);ellipse(c,0,14,3,3,'#e5be70');c.restore();}

export function bossIndicatorGeometry(targetX,targetY,originX,originY,width,height){
  const side=Math.min(36,width*.1),top=Math.min(124,height*.2),right=width-side,bottom=height-Math.min(68,height*.11);
  if(targetX>=side&&targetX<=right&&targetY>=top&&targetY<=bottom)return null;
  const dx=targetX-originX,dy=targetY-originY;
  if(Math.hypot(dx,dy)<1)return null;
  let t=Infinity;
  if(dx>0)t=Math.min(t,(right-originX)/dx);else if(dx<0)t=Math.min(t,(side-originX)/dx);
  if(dy>0)t=Math.min(t,(bottom-originY)/dy);else if(dy<0)t=Math.min(t,(top-originY)/dy);
  if(!Number.isFinite(t)||t<=0)return null;
  t=Math.min(1,t);
  return {x:originX+dx*t,y:originY+dy*t,angle:Math.atan2(dy,dx)};
}

function drawCave(ctx,cave,time){
  ctx.save();ctx.translate(cave.x,cave.y);
  const pulse=.85+Math.sin(time*2.4)*.08;
  ctx.globalAlpha=.22;ellipse(ctx,0,9,64,28,'#000');ctx.globalAlpha=1;
  ellipse(ctx,0,3,47,29,'#171414','#6f5c49');
  ellipse(ctx,0,8,37,20,'#020304');
  for(let i=0;i<9;i++){const a=Math.PI+(i/8)*Math.PI,r=43;const x=Math.cos(a)*r,y=8+Math.sin(a)*25;ellipse(ctx,x,y,7+(i%3),5+(i%2),'#4b4036','#756553');}
  ctx.save();ctx.scale(pulse,pulse);line(ctx,[[-15,10],[0,19],[15,10]],'#b99562aa',2);line(ctx,[[-11,3],[0,10],[11,3]],'#87c9bf80',1.5);ctx.restore();
  ctx.restore();
}
export function createRenderer({canvas, heroCanvas}) {
  const ctx=canvas.getContext('2d',{alpha:false});
  let W=440,H=780,DPR=1, mist;
  const world = createWorldLayer();
  function resize(){
    const rect=canvas.parentElement.getBoundingClientRect();W=rect.width;H=rect.height;DPR=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);
    mist=ctx.createRadialGradient(W*.5,H*.48,W*.14,W*.5,H*.48,H*.65);
    mist.addColorStop(0,'#07192000');mist.addColorStop(.65,'#789b9c08');mist.addColorStop(1,'#06171b77');
  }
  function fog(){ctx.fillStyle=mist;ctx.fillRect(0,0,W,H);}
  function drawBossIndicator(game,boss,camX,camY,zoom){
    const targetX=(boss.x-camX)*zoom,targetY=(boss.y-camY)*zoom;
    const originX=(game.player.x-camX)*zoom,originY=(game.player.y-camY)*zoom;
    const marker=bossIndicatorGeometry(targetX,targetY,originX,originY,W,H);
    if(!marker)return;
    ctx.save();ctx.translate(marker.x,marker.y);ctx.rotate(marker.angle);
    const pulse=1+Math.sin(game.time*5)*.08;ctx.scale(pulse,pulse);
    ctx.fillStyle='#071410cc';ctx.beginPath();ctx.arc(0,0,17,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f0cf78';ctx.strokeStyle='#fff1bd';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-7,-9);ctx.lineTo(-2,0);ctx.lineTo(-7,9);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.restore();
  }
  function drawCaveIndicator(game,cave,camX,camY,zoom){
    const targetX=(cave.x-camX)*zoom,targetY=(cave.y-camY)*zoom;
    const originX=(game.player.x-camX)*zoom,originY=(game.player.y-camY)*zoom;
    const marker=bossIndicatorGeometry(targetX,targetY,originX,originY,W,H);
    if(!marker)return;
    ctx.save();ctx.translate(marker.x,marker.y);ctx.rotate(marker.angle);
    const pulse=1+Math.sin(game.time*4.2)*.1;ctx.scale(pulse,pulse);
    ctx.fillStyle='#071410dd';ctx.beginPath();ctx.arc(0,0,19,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#87c9bf';ctx.strokeStyle='#e9fff6';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(-7,-10);ctx.lineTo(-2,0);ctx.lineTo(-7,10);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.restore();
  }
function draw(game, {active = true, moving = false, reducedMotion = false, bossId = null} = {}) {const p=game.player;const zoom=Math.min(1.18,W/390);const viewW=W/zoom,viewH=H/zoom;const cx=active?p.x:0,cy=active?p.y:0;const shake=active&&!reducedMotion?game.shake:0;const camX=cx-viewW/2+Math.sin(game.time*83)*shake,camY=cy-viewH*.51+Math.cos(game.time*71)*shake;
 ctx.save();ctx.scale(zoom,zoom);world.draw(ctx,viewW,viewH,camX,camY,{depth:active?game.worldDepth:0,level:active?game.level:1,time:game.time,reducedMotion});ctx.translate(-camX,-camY);
 if(active){
 if(game.cave)drawCave(ctx,game.cave,game.time);
 for(const item of game.pickups){if(Math.abs(item.x-cx)>viewW||Math.abs(item.y-cy)>viewH)continue;ctx.save();ctx.translate(item.x,item.y);if(item.type==='meat'){ellipse(ctx,0,1,9,6,'#b95a55','#f0c9a1');line(ctx,[[-7,-2],[7,3]],'#f4e2be',3);ellipse(ctx,-8,-3,2.5,2.5,'#f4e2be');ellipse(ctx,8,4,2.5,2.5,'#f4e2be');}else if(item.type==='oil'){ellipse(ctx,0,0,7,10,'#d6a94e','#f0d681');ellipse(ctx,-2,-3,2,4,'#fff1b180');}else{ellipse(ctx,0,2,8,11,'#dc6737','#f2ad52');ellipse(ctx,0,4,4,7,'#ffd36a');}ctx.restore();}
 for(const e of game.effects){if(e.type==='blood'){ctx.globalAlpha=Math.min(.42,e.life/4);ellipse(ctx,e.x,e.y,e.r*1.3,e.r*.8,e.color||'#812e39');ctx.globalAlpha=1;}}
 for(const g of game.gems){if(Math.abs(g.x-cx)>viewW||Math.abs(g.y-cy)>viewH)continue;ctx.save();ctx.translate(g.x,g.y);if(g.heal){ellipse(ctx,0,0,6,6,'#e9917f');line(ctx,[[-3,0],[3,0]],'#ffe6bc',2);line(ctx,[[0,-3],[0,3]],'#ffe6bc',2);}else{
  const pulse=.5+.5*Math.sin(game.time*3.2+g.x*.13+g.y*.17),sparkle=Math.max(0,(pulse-.72)/.28),color=g.value>4?'#e7be71':'#87c9bf';
  ctx.rotate(Math.PI/4);ctx.fillStyle=color;ctx.fillRect(-3.5,-3.5,7,7);
  ctx.globalAlpha=.08+sparkle*.85;ctx.fillStyle='#fffef0';ctx.fillRect(-3.5,-3.5,7,7);
  ctx.globalAlpha=1;ctx.fillStyle='#fff6d5';ctx.fillRect(-3,-3,2,2);
  // A brief four-point glint makes the gem visibly shine without a ground halo.
  if(sparkle>0){
   ctx.rotate(-Math.PI/4);ctx.globalAlpha=sparkle;ctx.fillStyle='#fffef0';
   const tip=5+sparkle*3;ctx.beginPath();ctx.moveTo(0,-tip);ctx.lineTo(1.2,-1.2);ctx.lineTo(tip,0);ctx.lineTo(1.2,1.2);ctx.lineTo(0,tip);ctx.lineTo(-1.2,1.2);ctx.lineTo(-tip,0);ctx.lineTo(-1.2,-1.2);ctx.closePath();ctx.fill();
  }
 }ctx.restore();}
 if(game.rank('frost')){const r=65+game.rank('frost')*15;ellipse(ctx,p.x,p.y,r,r,'#87d8d610');ctx.strokeStyle='#b1e8e44a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,r,0,6.28);ctx.stroke();}
 for(const e of game.effects){if(e.type==='enemy-impact'){ctx.save();ctx.globalAlpha=e.life/e.max;ellipse(ctx,e.x,e.y,e.r,e.r,'#f49c5555','#f0dfbf');ctx.restore();}}
 const entities=[...game.enemies,{player:true,y:p.y}].sort((a,b)=>a.y-b.y);
 drawBossHazards(ctx,game);
 for(const e of entities){if(e.player){ctx.globalAlpha=p.invuln>0?.5+Math.sin(game.time*45)*.3:1;drawFerret(ctx,{x:p.x,y:p.y,scale:1,face:Math.cos(p.face)<-.05?-1:1,walk:reducedMotion?0:game.time*(moving?14:3),armor:game.rank('armor'),shield:p.shield/game.maxShield});ctx.globalAlpha=1;}else{if(Math.abs(e.x-cx)>viewW/2+80||Math.abs(e.y-cy)>viewH*.6+80)continue;if(e.boss&&e.special==='charge'&&e.ability<.65){ctx.setLineDash([4,6]);line(ctx,[[e.x,e.y],[p.x,p.y]],'#e9ae7a65',2);ctx.setLineDash([]);}const jump=e.specialAttack?.phase==='jump'?Math.sin(Math.PI*(1-e.specialAttack.time/e.specialAttack.duration))*32:0;if(e.bossType)drawBoss(ctx,e.leap?{...e,y:e.y-Math.sin(Math.PI*e.leap.age/e.leap.duration)*38}:e,reducedMotion?0:game.time);else if(e.shieldOwnerId)drawShieldKey(ctx,e,reducedMotion?0:game.time);else drawAnimal(ctx,{...e,x:e.x,y:e.y-jump,scale:e.boss?2.15:1+e.tier*.1,time:reducedMotion?0:game.time});if(e.hp<e.maxHp&&!e.boss){ctx.fillStyle='#071410';ctx.fillRect(e.x-13,e.y-40,26,3);ctx.fillStyle='#dba77a';ctx.fillRect(e.x-13,e.y-40,26*e.hp/e.maxHp,3);}}}
 for(let i=0;i<game.rank('orbit');i++){let a=game.time*2.5+i/game.rank('orbit')*Math.PI*2;sword(ctx,p.x+Math.cos(a)*72,p.y+Math.sin(a)*72,a,.65);}
 for(const e of game.effects){let life=e.life/e.max;if(e.type==='slash'){ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=life;ctx.beginPath();ctx.arc(0,0,e.r,e.angle-e.half,e.angle+e.half);ctx.strokeStyle=e.fire?'#e56f36b5':'#dcecc873';ctx.lineWidth=19;ctx.stroke();ctx.beginPath();ctx.arc(0,0,e.r+8,e.angle-e.half,e.angle+e.half);ctx.strokeStyle=e.fire?'#ffd36f':'#fff5c3';ctx.lineWidth=3;ctx.stroke();ctx.restore();}if(e.type==='bolt'){ctx.globalAlpha=life;line(ctx,[[e.x+15,e.y-200],[e.x-12,e.y-90],[e.x+15,e.y-95],[e.x,e.y]],'#d6edff',4);ellipse(ctx,e.x,e.y,17,8,'#c8e5ef80');ctx.globalAlpha=1;}}
 for(const q of game.particles){ctx.globalAlpha=Math.min(1,q.life*2);ellipse(ctx,q.x,q.y,q.size,q.size*.7,q.color||'#a35453');}ctx.globalAlpha=1;
 for(const e of game.enemies){const a=e.specialAttack;if(!a||a.phase!=='warning')continue;
  ctx.save();ctx.lineWidth=2;ctx.strokeStyle='#f0dfbf';
  if(a.kind==='fan'||a.kind==='shot'){
   ctx.setLineDash([5,5]);const count=a.kind==='fan'?a.count:1;
   for(let i=0;i<count;i++){const angle=a.angle+(i-(count-1)/2)*(a.kind==='fan'?.3:0);line(ctx,[[e.x,e.y],[e.x+Math.cos(angle)*190,e.y+Math.sin(angle)*190]],a.kind==='shot'?'#d8c9a4cc':'#f0dfbfc0',2);}
  }else if(a.kind==='lunge'||a.kind==='ram'){
   ctx.setLineDash([6,5]);line(ctx,[[e.x,e.y],[a.x,a.y]],a.kind==='ram'?'#e0b38ac0':'#f0dfbfc0',3);
  }else{
   const warning=a.kind==='explode'?'#e65e3348':'#cb655540';
   ellipse(ctx,a.x,a.y,a.radius,a.radius,warning);ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(a.x,a.y,a.radius,0,Math.PI*2);ctx.stroke();
   line(ctx,[[a.x-7,a.y],[a.x+7,a.y]],'#ffe4ad',2);line(ctx,[[a.x,a.y-7],[a.x,a.y+7]],'#ffe4ad',2);
  }ctx.restore();
 }
 for(const s of game.shots){
  if(s.ownerId){drawBossProjectile(ctx,s);}
  else if(s.kind==='feather'){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.atan2(s.vy,s.vx));ellipse(ctx,0,0,9,3,'#f0dfbf','#cb6555');line(ctx,[[-7,0],[8,0]],'#fff2cf',1);ctx.restore();}
  else if(s.kind==='bone'){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.atan2(s.vy,s.vx));line(ctx,[[-8,0],[8,0]],'#d8c9a4',4);ellipse(ctx,-8,0,2.8,2.8,'#d8c9a4');ellipse(ctx,8,0,2.8,2.8,'#d8c9a4');ctx.restore();}
  else if(s.kind==='rock'){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.atan2(s.vy,s.vx));ctx.fillStyle='#77706a';ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(-4,-5);ctx.lineTo(-8,3);ctx.closePath();ctx.fill();ctx.restore();}
  else if(s.kind==='ember'){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.atan2(s.vy,s.vx));ellipse(ctx,0,0,8,4,'#e96530','#ffb052');ellipse(ctx,3,0,3,2,'#ffd36f');ctx.restore();}
  else{ellipse(ctx,s.x,s.y,4,7,'#f0dfbf');ellipse(ctx,s.x,s.y,2,3,'#cb6555');}
 }
 }ctx.restore();fog();
 const boss=bossId==null?null:game.enemies.find(e=>e.hp>0&&e.boss&&(e.encounterId??e.id)===bossId);
 if(active&&boss)drawBossIndicator(game,boss,camX,camY,zoom);
 if(active&&game.cave)drawCaveIndicator(game,game.cave,camX,camY,zoom);
}

  const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
  return {resize,draw,drawHero(){if(!heroCanvas)return;const c=heroCanvas.getContext('2d');c.clearRect(0,0,heroCanvas.width,heroCanvas.height);drawFerret(c,{x:heroCanvas.width/2,y:heroCanvas.height/2,scale:3,face:1,walk:0,armor:0});},destroy(){observer.disconnect();}};
}
