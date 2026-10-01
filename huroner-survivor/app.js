import {Game,UPGRADES,xpNeeded,ATTACK_COOLDOWN} from './core.js';
const $=id=>document.getElementById(id);
const strings={
 genre:['PEQUEÑO HÉROE. GRAN MASACRE.','TINY HERO. BIG BLOODBATH.'],edition:['LA PRADERA MALDITA','THE CURSED MEADOW'],
 tagline:['Adorable. Hasta que saca la espada.','Adorable. Until the sword comes out.'],intro:['La pradera ha mutado. Sobrevive a la horda,<br>evoluciona tu arsenal y derrota al rey del corral.','The meadow has mutated. Survive the horde,<br>evolve your arsenal and defeat the barnyard king.'],
 minutes:['MINUTOS','MINUTES'],combos:['COMBINACIONES','COMBINATIONS'],ferret:['HURÓN','FERRET'],start:['INICIAR PARTIDA','START RUN'],controls:['Joystick · Ataque configurable en ⚙','Joystick · Configure attack in ⚙'],best:['TU MEJOR CACERÍA','YOUR BEST HUNT'],footer:['HECHO CON IA · JUGADO POR TI','MADE WITH AI · PLAYED BY YOU'],level:['NIVEL','LEVEL'],drag:['ARRASTRA PARA MOVERTE','DRAG TO MOVE'],settingsTitle:['CONFIGURACIÓN','SETTINGS'],combatControls:['CONTROLES DE COMBATE','COMBAT CONTROLS'],attackType:['TIPO DE ATAQUE','ATTACK TYPE'],automatic:['AUTOMÁTICO','AUTOMATIC'],attackButtonMode:['BOTÓN','BUTTON'],attackSide:['LADO DEL BOTÓN','BUTTON SIDE'],left:['IZQUIERDA','LEFT'],right:['DERECHA','RIGHT'],done:['LISTO','DONE'],stronger:['CADA VEZ MÁS SALVAJE','WILDER WITH EVERY LEVEL'],levelup:['¡NIVEL SUPERADO!','LEVEL UP!'],choose:['Elige una mejora para continuar.','Choose an upgrade to continue.'],paused:['UN RESPIRO','TAKE A BREATHER'],pauseText:['La horda puede esperar.','The horde can wait.'],resume:['CONTINUAR','RESUME'],toggleSound:['ACTIVAR / SILENCIAR SONIDO','TOGGLE SOUND'],quit:['VOLVER AL INICIO','RETURN TO TITLE'],retry:['OTRA CACERÍA','ANOTHER HUNT'],menu:['MENÚ PRINCIPAL','MAIN MENU']
};
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Play remains available in privacy mode. */}}
let lang=read('huroner-language',navigator.language.startsWith('es')?'es':'en');if(!['es','en'].includes(lang))lang='es';
let muted=read('huroner-muted',false),record=read('huroner-record',null),mode='home';
let attackMode=read('huroner-attack-mode','button');if(!['button','auto'].includes(attackMode))attackMode='button';
let attackSide=read('huroner-attack-side','right');if(!['left','right'].includes(attackSide))attackSide='right';
const t=(es,en)=>lang==='es'?es:en;
function formatTime(s){s=Math.floor(s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function translate(){document.documentElement.lang=lang;document.querySelectorAll('[data-i18n]').forEach(el=>el.innerHTML=strings[el.dataset.i18n][lang==='es'?0:1]);$('language').textContent=lang==='es'?'EN':'ES';$('sound').setAttribute('aria-label',t('Activar o silenciar sonido','Toggle sound'));$('pause').setAttribute('aria-label',t('Pausar','Pause'));$('config').setAttribute('aria-label',t('Configuración','Settings'));$('attack-button').setAttribute('aria-label',t('Atacar','Attack'));$('world').setAttribute('aria-label',t('Arena de Huroner Survivor','Huroner Survivor arena'));$('best').textContent=record?`${record.won?'★ ':''}${formatTime(record.time)} · ${record.kills} ${t('bajas','kills')}`:'—';renderAttackSettings();}
$('language').onclick=()=>{lang=lang==='es'?'en':'es';save('huroner-language',lang);translate();};
let audio=null,musicTimer=0,musicStep=0;
function unlock(){try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch{}}
function tone(freq,duration,volume=.04,type='sine',end){if(muted||!audio||audio.state!=='running')return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);if(end)o.frequency.exponentialRampToValueAtTime(end,audio.currentTime+duration);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}
function soundState(){$('sound').textContent=muted?'♪̸':'♫';$('sound').setAttribute('aria-pressed',String(!muted));}
function toggleSound(){muted=!muted;save('huroner-muted',muted);unlock();soundState();if(!muted)tone(523,.15);}
$('sound').onclick=toggleSound;$('pause-sound').onclick=toggleSound;
const game=new Game();const canvas=$('world'),ctx=canvas.getContext('2d',{alpha:false});let W=440,H=780,DPR=1;
function resize(){const rect=$('game-shell').getBoundingClientRect();W=rect.width;H=rect.height;DPR=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);}window.addEventListener('resize',resize);resize();
// Original canvas illustrations. No external art, fonts, assets or dependencies.
function ellipse(c,x,y,rx,ry,color,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}}
function line(c,points,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function sword(c,x,y,angle,scale=1){c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);c.fillStyle='#dce9ce';c.beginPath();c.moveTo(-4,0);c.lineTo(-5,-35);c.lineTo(0,-47);c.lineTo(5,-35);c.lineTo(4,0);c.closePath();c.fill();line(c,[[0,-40],[0,-1]],'#86afa1',1.3);line(c,[[-10,0],[10,0]],'#d6ad57',4);line(c,[[0,2],[0,13]],'#8a5e3c',5);ellipse(c,0,14,3,3,'#e5be70');c.restore();}
function ferret(c,x,y,scale=1,face=1,walk=0,armor=0){c.save();c.translate(x,y);c.scale(scale*(face<0?-1:1),scale);ellipse(c,0,22,23,7,'#030e0b55');
 c.beginPath();c.moveTo(-10,10);c.bezierCurveTo(-38,12,-40,-9,-27,-12);c.bezierCurveTo(-36,1,-17,-3,-8,0);c.fillStyle='#825d40';c.fill();
 ellipse(c,-7,18+Math.sin(walk)*2,6,7,'#614733');ellipse(c,9,18-Math.sin(walk)*2,6,7,'#614733');
 ellipse(c,0,3,16,22,'#947053','#263124');ellipse(c,2,5,10,16,'#e4d8b8');
 if(armor){c.fillStyle=armor>3?'#839b96':'#536c64';c.beginPath();c.moveTo(-13,-4);c.lineTo(13,-4);c.lineTo(11,14);c.lineTo(0,19);c.lineTo(-12,13);c.closePath();c.fill();line(c,[[-8,0],[8,0]],'#c6bc8d',2);}
 // Ears, cream face, unmistakable dark ferret mask and pink nose.
 ellipse(c,-12,-22,7,8,'#8b684a','#303729');ellipse(c,13,-22,7,8,'#8b684a','#303729');ellipse(c,-12,-22,3.5,4.5,'#ca957e');ellipse(c,13,-22,3.5,4.5,'#ca957e');
 ellipse(c,0,-14,19,17,'#e9dfc5','#354032');
 c.fillStyle='#6b513e';c.beginPath();c.moveTo(-18,-17);c.quadraticCurveTo(-10,-25,0,-15);c.quadraticCurveTo(10,-25,18,-17);c.lineTo(14,-6);c.quadraticCurveTo(6,-2,0,-12);c.quadraticCurveTo(-8,-1,-15,-7);c.closePath();c.fill();
 ellipse(c,-8,-14,3.4,4,'#172019');ellipse(c,9,-14,3.4,4,'#172019');ellipse(c,-7,-15.5,1.1,1.3,'#ffffe7');ellipse(c,10,-15.5,1.1,1.3,'#ffffe7');
 ellipse(c,1,-5,9,6,'#f5e9cb');ellipse(c,1,-7,3.7,2.6,'#8a5650');line(c,[[1,-4],[1,-2],[4,-1]],'#68523f',1);
 line(c,[[-11,-3],[-23,-6]],'#cbcca5',.8);line(c,[[12,-3],[23,-5]],'#cbcca5',.8);
 // Little crimson scarf.
 c.fillStyle='#b54f49';c.beginPath();c.moveTo(-13,-1);c.quadraticCurveTo(0,7,13,-1);c.lineTo(11,5);c.quadraticCurveTo(0,10,-11,5);c.fill();c.beginPath();c.moveTo(-11,2);c.lineTo(-24,12);c.lineTo(-12,13);c.lineTo(-5,4);c.fill();
 ellipse(c,-13,5,5,8,armor?'#71887b':'#947053');ellipse(c,15,4,5,7,'#947053');sword(c,18,4,.45,1);c.restore();}
function animal(c,e,x,y,scale=1,time=0){c.save();c.translate(x,y);c.scale(scale,scale);if(e.flash>0)c.filter='brightness(1.8)';const tier=e.tier||0,phase=Math.sin(time*9+e.id)*1.5;const bird=e.kind==='chicken'||e.kind==='quail';const boss=e.boss;
 ellipse(c,0,14,18,5,'#020b0850');
 if(bird){let col=e.kind==='quail'?'#a8946e':'#eee4bc';if(tier===1)col='#bbcca0';if(tier===2)col='#b49ac1';if(tier>=3)col='#d5988d';line(c,[[-6,10],[-7,17+phase]],'#d6a347',3);line(c,[[6,10],[7,17-phase]],'#d6a347',3);ellipse(c,0,0,15,16,col,'#3c4831');ellipse(c,-8,3,6,9,tier?'#776b85':'#c9b381');ellipse(c,3,-9,11,12,col);c.fillStyle='#d9a043';c.beginPath();c.moveTo(9,-8);c.lineTo(21,-3);c.lineTo(9,0);c.fill();ellipse(c,-1,-13,2.7,3,tier?'#e45262':'#292c22');ellipse(c,-.5,-14,1,1,'#fff4d7');if(e.kind==='chicken'){ellipse(c,1,-23,4,6,'#c95750');ellipse(c,7,-22,4,6,'#d76355');ellipse(c,8,4,3.5,5,'#c95750');}else{line(c,[[0,-18],[-3,-29],[-7,-30]],'#4d4b36',3);for(let i=0;i<4;i++)ellipse(c,-7+i*4,4+i%2*5,1.2,2.5,'#665c46');}}
 else{let col=e.kind==='hare'?'#b89670':'#e2d9c2';if(tier===1)col='#a8ba94';if(tier===2)col='#a38cad';if(tier>=3)col='#cf9389';ellipse(c,-8,12+phase,6,5,col);ellipse(c,9,12-phase,6,5,col);ellipse(c,-14,4,6,6,'#efead0');ellipse(c,0,0,15,16,col,'#384533');ellipse(c,-7,-20,5,e.kind==='hare'?17:13,col,'#384533');ellipse(c,6,-21,5,e.kind==='hare'?18:14,col,'#384533');ellipse(c,-7,-20,2,9,'#c58f89');ellipse(c,6,-21,2,10,'#c58f89');ellipse(c,0,-6,15,12,col);ellipse(c,-6,-8,3,3.5,tier?'#d94660':'#282d24');ellipse(c,7,-8,3,3.5,tier?'#d94660':'#282d24');ellipse(c,-5.3,-9,1,1,'#fcf2dc');ellipse(c,7.8,-9,1,1,'#fcf2dc');ellipse(c,1,-1,2.5,2,'#b47676');if(tier){line(c,[[-4,3],[-2,8],[0,3]],'#f3e9c3',2);line(c,[[4,3],[6,8],[8,3]],'#f3e9c3',2);}}
 if(tier>=2){for(let s of [-1,1]){c.fillStyle=tier===3?'#c74759':'#7c6391';c.beginPath();c.moveTo(s*10,-15);c.lineTo(s*19,-29);c.lineTo(s*16,-6);c.fill();}}
 if(tier===3){ellipse(c,0,2,4,4,'#c54657');ellipse(c,0,2,1.5,1.5,'#f9dd8c');}
 if(boss){c.fillStyle='#e4bc68';c.beginPath();c.moveTo(-12,-23);c.lineTo(-15,-39);c.lineTo(-5,-32);c.lineTo(0,-43);c.lineTo(6,-32);c.lineTo(15,-39);c.lineTo(12,-23);c.closePath();c.fill();ellipse(c,0,-29,3,3,'#ce454f');}
 c.restore();}
function hash(x,y){let v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v);}
function ground(c,w,h,camX,camY){c.fillStyle='#263c2b';c.fillRect(0,0,w,h);const tile=86;let sx=Math.floor(camX/tile)-1,sy=Math.floor(camY/tile)-1;
 for(let tx=sx;tx<(camX+w)/tile+1;tx++)for(let ty=sy;ty<(camY+h)/tile+1;ty++){let n=hash(tx,ty),x=tx*tile-camX,y=ty*tile-camY;c.fillStyle=n>.5?'#2b412c':'#293e2b';c.beginPath();c.ellipse(x+43,y+40,50,39,n*3,0,6.28);c.fill();for(let i=0;i<4;i++){let px=x+hash(tx+i,ty+8)*80,py=y+hash(tx+9,ty+i)*80;line(c,[[px-3,py],[px-5,py-5],[px,py+1],[px+2,py-6]],n>.55?'#49604470':'#1b342770',1.3);}if(n>.83){ellipse(c,x+27,y+25,5,3,'#475043');ellipse(c,x+26,y+23,4,3,'#707561');}if(n<.09){ellipse(c,x+50,y+55,3,2,'#d9b97388');ellipse(c,x+56,y+48,2,2,'#d9b97388');}}
}
function paintHero(){const c=$('hero-art').getContext('2d');c.clearRect(0,0,600,390);let glow=c.createRadialGradient(300,215,10,300,215,180);glow.addColorStop(0,'#a1c57820');glow.addColorStop(1,'#a1c57800');c.fillStyle=glow;c.fillRect(0,0,600,390);
 c.strokeStyle='#bbcf8628';c.lineWidth=1;c.beginPath();c.ellipse(300,292,202,41,0,0,6.28);c.stroke();ellipse(c,300,297,164,30,'#05151055');
 for(let i=0;i<26;i++){let x=95+hash(i,3)*415,y=250+hash(i,7)*76;line(c,[[x,y],[x-3,y-10],[x+2,y-2],[x+5,y-15]],'#6a855c',2);}
 animal(c,{kind:'rabbit',tier:1,id:1},134,264,1.8);animal(c,{kind:'chicken',tier:2,id:2},455,267,1.7);animal(c,{kind:'quail',tier:0,id:3},405,309,1.0);
 // Sword trail behind the hero.
 c.beginPath();c.arc(305,206,121,-1.1,.6);c.strokeStyle='#dec68728';c.lineWidth=24;c.stroke();c.beginPath();c.arc(305,206,127,-1.1,.6);c.strokeStyle='#e5be70aa';c.lineWidth=2;c.stroke();
 ferret(c,292,213,3.5,1,0,1);for(let i=0;i<16;i++){const x=140+hash(i,12)*330,y=65+hash(i,9)*255;ellipse(c,x,y,1.2,1.2,'#e2bd6580');}
}
function renderAttackSettings(){
 const manual=attackMode==='button';
 $('attack-auto').classList.toggle('selected',!manual);$('attack-manual').classList.toggle('selected',manual);
 $('attack-left').classList.toggle('selected',attackSide==='left');$('attack-right').classList.toggle('selected',attackSide==='right');
 $('attack-side-group').hidden=!manual;
}
function syncAttackButton(){
 const b=$('attack-button'),show=mode==='playing'&&game.state==='playing'&&attackMode==='button';
 b.hidden=!show;b.classList.toggle('left',attackSide==='left');b.classList.toggle('right',attackSide==='right');
}
function setTouchHint(){
 $('touch-hint').textContent=attackMode==='auto'?t('ARRASTRA PARA MOVERTE · ATAQUE AUTOMÁTICO','DRAG TO MOVE · AUTOMATIC ATTACK'):t('ARRASTRA PARA MOVERTE · USA ⚔ PARA ATACAR','DRAG TO MOVE · USE ⚔ TO ATTACK');
}
paintHero();translate();soundState();
const input={x:0,y:0},keys=new Set();let pointer=null,origin={x:0,y:0};
function resetInput(){pointer=null;input.x=input.y=0;keys.clear();$('joystick').style.display='none';$('stick').style.transform='';}
const shell=$('game-shell');shell.addEventListener('pointerdown',e=>{if(mode!=='playing'||game.state!=='playing'||e.target.closest('button')||pointer!==null)return;pointer=e.pointerId;shell.setPointerCapture(e.pointerId);const r=shell.getBoundingClientRect();origin={x:e.clientX-r.left,y:e.clientY-r.top};$('joystick').style.cssText=`display:block;left:${origin.x}px;top:${origin.y}px`;$('touch-hint').hidden=true;unlock();});
shell.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;const r=shell.getBoundingClientRect(),dx=e.clientX-r.left-origin.x,dy=e.clientY-r.top-origin.y,d=Math.hypot(dx,dy),f=Math.min(1,40/(d||1));input.x=dx*f/40;input.y=dy*f/40;$('stick').style.transform=`translate(${dx*f}px,${dy*f}px)`;});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])shell.addEventListener(ev,e=>{if(e.pointerId===pointer)resetInput();});
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key==='Escape'){if(mode==='playing'&&game.state==='playing')pause();else if(mode==='paused')resume();}});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
function show(id){for(const name of ['home','settings-screen','level-screen','pause-screen','end-screen'])$(name).hidden=name!==id;}
let autoAttackTimer=0;
function start(){unlock();game.reset();mode='playing';musicTimer=0;musicStep=0;autoAttackTimer=0;resetInput();show(null);$('hud').hidden=false;$('touch-hint').hidden=false;$('boss-hud').hidden=true;setTouchHint();syncAttackButton();toast(t('La cacería comienza','The hunt begins'));}
function pause(){if(mode!=='playing'||game.state!=='playing')return;mode='paused';resetInput();show('pause-screen');}
function resume(){if(mode!=='paused')return;mode='playing';show(null);unlock();}
function home(){keepRecord(false);mode='home';resetInput();show('home');$('hud').hidden=true;$('touch-hint').hidden=true;translate();}
$('start').onclick=start;$('retry').onclick=start;$('pause').onclick=pause;$('resume').onclick=resume;$('quit').onclick=home;$('back').onclick=home;
$('config').onclick=()=>{renderAttackSettings();show('settings-screen');};
$('settings-done').onclick=()=>{show('home');};
$('attack-auto').onclick=()=>{attackMode='auto';save('huroner-attack-mode',attackMode);renderAttackSettings();};
$('attack-manual').onclick=()=>{attackMode='button';save('huroner-attack-mode',attackMode);renderAttackSettings();};
$('attack-left').onclick=()=>{attackSide='left';save('huroner-attack-side',attackSide);renderAttackSettings();};
$('attack-right').onclick=()=>{attackSide='right';save('huroner-attack-side',attackSide);renderAttackSettings();};
$('attack-button').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(mode==='playing'&&game.state==='playing'&&attackMode==='button'){unlock();game.manualAttack();}});
for(const ev of ['gesturestart','gesturechange'])document.addEventListener(ev,e=>{if(mode==='playing')e.preventDefault();},{passive:false});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();if(audio)audio.suspend();}else if(audio&&mode==='playing')audio.resume().catch(()=>{});});window.addEventListener('blur',()=>{resetInput();pause();});
let toastTimer=0;
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');toastTimer=3;}
function keepRecord(won){const r={time:Math.floor(game.time),kills:game.kills,level:game.level,won};const score=v=>(v.won?1e7:Math.min(v.time,600)*1000)+v.kills;if(!record||score(r)>score(record)){record=r;save('huroner-record',record);}}
function end(won){mode='end';resetInput();keepRecord(won);show('end-screen');$('touch-hint').hidden=true;$('end-kicker').textContent=won?t('LA PRADERA ES TUYA','THE MEADOW IS YOURS'):t('LA HORDA NO PERDONA','THE HORDE SHOWS NO MERCY');$('end-title').textContent=won?t('¡REY DE LA CACERÍA!','KING OF THE HUNT!'):t('HASTA AQUÍ LLEGASTE','THE HUNT IS OVER');$('end-copy').textContent=won?t('El rey del corral ha caído. Un hurón nunca se rinde.','The barnyard king has fallen. Never underestimate a ferret.'):t('Afila la espada. Tu próxima partida empieza de cero.','Sharpen your sword. Your next run starts fresh.');$('end-stats').innerHTML=`<div><b>${formatTime(game.time)}</b><small>${t('TIEMPO','TIME')}</small></div><div><b>${game.kills}</b><small>${t('BAJAS','KILLS')}</small></div><div><b>${game.level}</b><small>${t('NIVEL','LEVEL')}</small></div>`;}
function levelMenu(){resetInput();show('level-screen');$('level-summary').textContent=`${t('Nivel','Level')} ${game.level} · ${t('Tu instinto se hace más fuerte.','Your instincts grow stronger.')}`;const list=$('choices');list.replaceChildren();for(const u of game.choices){const b=document.createElement('button');b.className='upgrade';b.dataset.upgrade=u.id;b.innerHTML=`<span class="icon">${u.icon}</span><span><strong>${u.name[lang==='es'?0:1]}</strong><small>${u.desc[lang==='es'?0:1]}</small><em>${game.rank(u.id)?t('MEJORA','UPGRADE'):t('NUEVO','NEW')} · ${game.rank(u.id)+1} / ${u.max===Infinity?'∞':u.max}</em></span>`;b.onclick=()=>{if(game.choose(u.id)){tone(660,.16,.045,'sine',990);if(game.state==='levelup')levelMenu();else show(null);}};list.append(b);}}
function bossName(e){if(e.finalBoss)return t('EL REY DEL CORRAL','THE BARNYARD KING');const names={rabbit:['CONEJO ASESINO','KILLER RABBIT'],hare:['LIEBRE FURIOSA','FURIOUS HARE'],quail:['CODORNIZ ATERRADORA','TERRIFYING QUAIL'],chicken:['POLLO DEMONÍACO','DEMON CHICKEN']};return (names[e.kind]||['BESTIA MUTANTE','MUTANT BEAST'])[lang==='es'?0:1];}
function hud(){const p=game.player;$('level').textContent=game.level;$('timer').textContent=formatTime(game.time);$('timer-label').textContent=game.bossSpawned?t('DERROTA AL JEFE','DEFEAT THE BOSS'):t('SOBREVIVE · 10:00','SURVIVE · 10:00');$('xp-fill').style.width=Math.min(100,game.xp/xpNeeded(game.level)*100)+'%';$('xp-label').textContent=`${game.xp} / ${xpNeeded(game.level)} XP`;$('mutation-label').textContent=t('MUTACIÓN ','MUTATION ')+['I','II','III','IV'][game.mutation];$('hp-fill').style.width=p.hp/p.maxHp*100+'%';$('hp-label').textContent=`${Math.ceil(p.hp)} / ${p.maxHp}`;$('kills').textContent=`✧ ${game.kills} ${t('bajas','kills')}`;$('equipment').textContent='⚔'+(game.rank('armor')?'⬡':'')+(game.rank('orbit')?'✧':'')+(game.rank('lightning')?'ϟ':'')+(game.rank('frost')?'❄':'');if(game.boss){$('boss-hud').hidden=false;$('boss-name').textContent=bossName(game.boss);$('boss-fill').style.width=Math.max(0,game.boss.hp/game.boss.maxHp*100)+'%';}else $('boss-hud').hidden=true;}
function draw(){const p=game.player;const active=mode!=='home';const zoom=Math.min(1.18,W/390);const viewW=W/zoom,viewH=H/zoom;const cx=active?p.x:0,cy=active?p.y:0;const camX=cx-viewW/2,camY=cy-viewH*.51;
 ctx.save();ctx.scale(zoom,zoom);ground(ctx,viewW,viewH,camX,camY);ctx.translate(-camX,-camY);
 if(active){
 for(const item of game.pickups){if(Math.abs(item.x-cx)>viewW||Math.abs(item.y-cy)>viewH)continue;ctx.save();ctx.translate(item.x,item.y);if(item.type==='meat'){ellipse(ctx,0,1,9,6,'#b95a55','#f0c9a1');line(ctx,[[-7,-2],[7,3]],'#f4e2be',3);ellipse(ctx,-8,-3,2.5,2.5,'#f4e2be');ellipse(ctx,8,4,2.5,2.5,'#f4e2be');}else if(item.type==='oil'){ellipse(ctx,0,0,7,10,'#d6a94e','#f0d681');ellipse(ctx,-2,-3,2,4,'#fff1b180');}else{ellipse(ctx,0,2,8,11,'#dc6737','#f2ad52');ellipse(ctx,0,4,4,7,'#ffd36a');}ctx.restore();}
 for(const e of game.effects){if(e.type==='blood'){ctx.globalAlpha=Math.min(.42,e.life/4);ellipse(ctx,e.x,e.y,e.r*1.3,e.r*.8,'#812e39');ctx.globalAlpha=1;}}
 for(const g of game.gems){if(Math.abs(g.x-cx)>viewW||Math.abs(g.y-cy)>viewH)continue;ctx.save();ctx.translate(g.x,g.y);if(g.heal){ellipse(ctx,0,0,6,6,'#e9917f');line(ctx,[[-3,0],[3,0]],'#ffe6bc',2);line(ctx,[[0,-3],[0,3]],'#ffe6bc',2);}else{
  const pulse=.5+.5*Math.sin(game.time*2.4+g.x*.13+g.y*.17),color=g.value>4?'#e7be71':'#a8c98b';
  ctx.rotate(Math.PI/4);ctx.fillStyle=color;ctx.fillRect(-3.5,-3.5,7,7);
  // Light up the gem itself, keeping the shimmer inside its diamond silhouette.
  ctx.globalAlpha=.08+Math.pow(pulse,3)*.55;ctx.fillStyle='#fffbe5';ctx.fillRect(-3.5,-3.5,7,7);
  ctx.globalAlpha=1;ctx.fillStyle='#fff6d5';ctx.fillRect(-3,-3,2,2);
 }ctx.restore();}
 if(game.rank('frost')){const r=65+game.rank('frost')*15;ellipse(ctx,p.x,p.y,r,r,'#87d8d610');ctx.strokeStyle='#b1e8e44a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,r,0,6.28);ctx.stroke();}
 for(const e of game.enemies){const a=e.specialAttack;if(!a)continue;
  ctx.save();ctx.lineWidth=2;ctx.strokeStyle='#ffd18b';
  if(a.kind==='quail'){
   ctx.setLineDash([5,5]);for(let i=0;i<a.count;i++){const angle=a.angle+(i-(a.count-1)/2)*.3;line(ctx,[[a.x,a.y],[a.x+Math.cos(angle)*150,a.y+Math.sin(angle)*150]],'#ffd18baa',2);}
  }else{
   ellipse(ctx,a.x,a.y,a.radius,a.radius,'#e66d4938');ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(a.x,a.y,a.radius,0,Math.PI*2);ctx.stroke();
   line(ctx,[[a.x-7,a.y],[a.x+7,a.y]],'#ffe4ad',2);line(ctx,[[a.x,a.y-7],[a.x,a.y+7]],'#ffe4ad',2);
  }ctx.restore();
 }
 for(const e of game.effects){if(e.type==='enemy-impact'){ctx.save();ctx.globalAlpha=e.life/e.max;ellipse(ctx,e.x,e.y,e.r,e.r,'#f49c5555','#ffd18b');ctx.restore();}}
 const entities=[...game.enemies,{player:true,y:p.y}].sort((a,b)=>a.y-b.y);
 for(const e of entities){if(e.player){ctx.globalAlpha=p.invuln>0?.5+Math.sin(game.time*45)*.3:1;ferret(ctx,p.x,p.y,1,Math.cos(p.face)<-.05?-1:1,game.time*(Math.hypot(input.x,input.y)>.1?14:3),game.rank('armor'));ctx.globalAlpha=1;}else{if(Math.abs(e.x-cx)>viewW/2+80||Math.abs(e.y-cy)>viewH*.6+80)continue;if((e.kind==='hare'&&e.tier>=1||e.boss&&e.special==='charge')&&e.ability<.65){ctx.setLineDash([4,6]);line(ctx,[[e.x,e.y],[p.x,p.y]],'#e9ae7a65',2);ctx.setLineDash([]);}const jump=e.specialAttack?.phase==='jump'?Math.sin(Math.PI*(1-e.specialAttack.time/e.specialAttack.duration))*32:0;animal(ctx,e,e.x,e.y-jump,e.boss?2.7:1+e.tier*.1,game.time);if(e.hp<e.maxHp&&!e.boss){ctx.fillStyle='#071410';ctx.fillRect(e.x-13,e.y-40,26,3);ctx.fillStyle='#dba77a';ctx.fillRect(e.x-13,e.y-40,26*e.hp/e.maxHp,3);}}}
 for(let i=0;i<game.rank('orbit');i++){let a=game.time*2.5+i/game.rank('orbit')*Math.PI*2;sword(ctx,p.x+Math.cos(a)*72,p.y+Math.sin(a)*72,a,.65);}
 for(const s of game.shots){if(s.kind==='feather'){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.atan2(s.vy,s.vx));ellipse(ctx,0,0,9,3,'#ead8ac','#a97550');line(ctx,[[-7,0],[8,0]],'#fff2cf',1);ctx.restore();}else{ellipse(ctx,s.x,s.y,4,7,'#e8a070');ellipse(ctx,s.x,s.y,2,3,'#f8e2b2');}}
 for(const e of game.effects){let life=e.life/e.max;if(e.type==='slash'){ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=life;ctx.beginPath();ctx.arc(0,0,e.r,e.angle-e.half,e.angle+e.half);ctx.strokeStyle=e.fire?'#e56f36b5':'#dcecc873';ctx.lineWidth=19;ctx.stroke();ctx.beginPath();ctx.arc(0,0,e.r+8,e.angle-e.half,e.angle+e.half);ctx.strokeStyle=e.fire?'#ffd36f':'#fff5c3';ctx.lineWidth=3;ctx.stroke();ctx.restore();}if(e.type==='bolt'){ctx.globalAlpha=life;line(ctx,[[e.x+15,e.y-200],[e.x-12,e.y-90],[e.x+15,e.y-95],[e.x,e.y]],'#d6edff',4);ellipse(ctx,e.x,e.y,17,8,'#c8e5ef80');ctx.globalAlpha=1;}}
 for(const q of game.particles){ctx.globalAlpha=Math.min(1,q.life*2);ellipse(ctx,q.x,q.y,q.size,q.size*.7,'#ba4e59');}ctx.globalAlpha=1;
 }ctx.restore();}
let last=performance.now(),hudTimer=0;
function frame(now){let dt=Math.min((now-last)/1000,.05);last=now;
 if(mode==='playing'&&game.state==='playing'){
  if(pointer===null){input.x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));input.y=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));}
  game.step(dt,input);if(attackMode==='auto'){autoAttackTimer-=dt;if(autoAttackTimer<=0){autoAttackTimer=ATTACK_COOLDOWN;game.automaticAttack();}}musicTimer-=dt;if(musicTimer<=0){musicTimer=.38;let notes=[146.83,0,220,174.61,0,196,130.81,0,146.83,220,0,261.63,196,0,174.61,130.81];let n=notes[musicStep++%notes.length];if(n)tone(n,.28,.018,'triangle');}
 }
 let picked=false;for(const e of game.events){if(e.type==='slash')tone(170,.09,.023,'triangle',55);if(e.type==='hurt')tone(90,.15,.065,'sawtooth',35);if(e.type==='pickup'&&!picked){tone(850,.06,.013);picked=true;}if(e.type==='level'){tone(523,.25,.05);tone(784,.4,.035);levelMenu();}if(e.type==='mutation')toast(t('MUTACIÓN ','MUTATION ')+['I','II','III','IV'][e.tier]+t(' · La horda evoluciona',' · The horde evolves'));if(e.type==='item'){if(e.kind==='meat')toast(t('+3 VIDA · Pedacito de carne','+3 HP · Meat snack'));if(e.kind==='oil')toast(t('+10% VELOCIDAD · Aceite de salmón · 20s','+10% SPEED · Salmon oil · 20s'));if(e.kind==='fire')toast(t('+35% DAÑO · Fuego · 15s','+35% DAMAGE · Fire · 15s'));tone(740,.09,.025);}if(e.type==='boss'){toast(e.final?t('¡EL REY DEL CORRAL HA LLEGADO!','THE BARNYARD KING HAS ARRIVED!'):`${t('¡JEFE NIVEL','LEVEL BOSS')} ${e.level}!`);tone(65,.9,.08,'sawtooth');}if(e.type==='storm')tone(260,.18,.04,'sawtooth',40);if(e.type==='dead')end(false);if(e.type==='won')end(true);}game.events=[];
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.remove('show');}
 syncAttackButton();hudTimer-=dt;if(hudTimer<=0&&mode!=='home'){hudTimer=.08;hud();}draw();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
