import { WIDTH, GROUND, ROSTER, fighterDefinition, createFighter, stepFighter, resolveHit, keepApart, winnerByTimeout, moveInfo, clamp } from './core.js';

const $ = id => document.getElementById(id);
const ui = Object.fromEntries(['app','selectScreen','gameScreen','roster','fighterInfo','portrait1','portrait2','name1','name2','enemyLabel','modeNote','startBtn','audioBtn','pauseBtn','exitBtn','resumeBtn','rematchBtn','changeBtn','pausePanel','resultPanel','winnerTitle','winnerDetails','hudName1','hudName2','hp1','hp2','mp1','mp2','score1','score2','roundNum','timer','announcement','announcementSmall','announcementText','battleTip','arena'].map(id => [id, $(id)]));
const ctx = ui.arena.getContext('2d', { alpha: false });
const HEIGHT = 648;
const chosen = ['kira', 'volt'];
let activeSide = 0;
let mode = 'cpu';
let soundEnabled = false;
let audioContext = null;
let battle = null;
let now = 0;
const held = new Set();
const tapped = new Set();
const touchHeld = new Set();
const touchTapped = new Set();
const particles = [];
let shake = 0;
const glyphs = {
  kira: "<path d='M62 63 34 10 84 43 108 0 126 48 158 16 143 82' fill='#33264a' stroke='#b98bff' stroke-width='6'/>",
  volt: "<path d='M60 49 80 18 132 18 151 50 140 82 65 82Z' fill='#125a72' stroke='#6ee8ff' stroke-width='6'/><path d='m136 8-18 28h17l-18 24' fill='none' stroke='#fff29d' stroke-width='6'/>",
  onyx: "<path d='M60 53 38 12 77 36 122 36 158 12 141 63' fill='#70431b' stroke='#ffbd6c' stroke-width='6'/>",
  ember: "<path d='M57 72q-25-48 14-73-4 32 19 15 17-23 13-38 43 44 34 73 20-20 21-35 24 43-9 76Z' fill='#ff6f8b' stroke='#ffc478' stroke-width='5'/>"
};
function avatarMarkup(f) {
  return "<svg viewBox='0 0 200 230' aria-hidden='true' focusable='false'><ellipse cx='103' cy='224' rx='77' ry='12' fill='#040912' opacity='.55'/><path d='M60 146Q40 130 22 168L0 230H200L177 169Q160 132 137 146Z' fill='"+f.shade+"' stroke='"+f.color+"' stroke-width='7'/><path d='M74 142Q101 165 128 142L146 230H57Z' fill='#101a30' stroke='"+f.color+"' stroke-width='4'/><path d='M78 138h49v34H78Z' fill='#cd997b'/><ellipse cx='102' cy='89' rx='43' ry='55' fill='#bb866d'/><path d='M61 79Q53 25 91 24h38q31 14 18 58' fill='"+f.shade+"'/>"+glyphs[f.id]+"<path d='M75 94h20m17 0h20' stroke='#eef6fa' stroke-width='6' stroke-linecap='round'/><path d='M85 94h5m32 0h5' stroke='"+f.color+"' stroke-width='5'/><path d='M91 119q11 7 23 0' fill='none' stroke='#482d3c' stroke-width='3' stroke-linecap='round'/><path d='M72 169h61' stroke='"+f.color+"' stroke-width='7' opacity='.65'/></svg>";
}
function drawRoster() {
  ui.roster.innerHTML = '';
  for (const f of ROSTER) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fighter-card' + (chosen[activeSide] === f.id ? ' selected' : '');
    button.setAttribute('aria-pressed', chosen[activeSide] === f.id ? 'true' : 'false');
    button.setAttribute('aria-label', f.name + ', ' + f.alias + ', ' + f.bio);
    button.innerHTML = "<span class='card-art' style='--fighter-color:"+f.color+"'>"+avatarMarkup(f)+"</span><span class='card-meta'><b>"+f.name+"</b><small>"+f.alias+"</small></span>";
    button.addEventListener('click', () => {
      chosen[activeSide] = f.id;
      if (activeSide === 0 && chosen[0] === chosen[1]) chosen[1] = ROSTER.find(c => c.id !== chosen[0]).id;
      drawRoster();
    });
    ui.roster.append(button);
  }
  const f = fighterDefinition(chosen[activeSide]);
  ui.fighterInfo.textContent = f.trait + ' · ' + f.bio;
  for (let side = 0; side < 2; side++) {
    const selected = fighterDefinition(chosen[side]);
    $('portrait' + (side + 1)).innerHTML = avatarMarkup(selected);
    $('portrait' + (side + 1)).style.setProperty('--fighter-color', selected.color);
    $('name' + (side + 1)).textContent = selected.name;
  }
  ui.enemyLabel.textContent = mode === 'cpu' ? 'CPU' : 'JUGADOR 2';
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b === button));
  ui.modeNote.textContent = mode === 'cpu'
    ? 'La CPU lucha sola. En móvil usa los botones táctiles; en ordenador también puedes usar el teclado.'
    : 'Dos jugadores en el mismo teclado (solo ordenador). J1 usa A/D/W/S/F/G/H; J2 usa flechas/J/K/L.';
  drawRoster();
}));
document.querySelectorAll('[data-side]').forEach(button => button.addEventListener('click', () => {
  activeSide = Number(button.dataset.side);
  document.querySelectorAll('[data-side]').forEach(b => b.classList.toggle('active', b === button));
  drawRoster();
}));
drawRoster();

function setupCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ui.arena.width = WIDTH * dpr;
  ui.arena.height = HEIGHT * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
setupCanvas();
window.addEventListener('resize', setupCanvas);
ui.arena.addEventListener('contextmenu', event => event.preventDefault());

const codes = new Set(['KeyA','KeyD','KeyW','KeyS','KeyF','KeyG','KeyH','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyJ','KeyK','KeyL','Space','Escape']);
const singles = new Set(['KeyW','KeyF','KeyG','KeyH','ArrowUp','KeyJ','KeyK','KeyL']);
window.addEventListener('keydown', e => {
  if (e.code === 'Escape' && battle && battle.phase !== 'finished') { e.preventDefault(); setPause(!battle.paused); return; }
  if (!battle || !codes.has(e.code)) return;
  if (e.code === 'Space') { e.preventDefault(); setPause(!battle.paused); return; }
  e.preventDefault();
  if (!held.has(e.code) && singles.has(e.code)) tapped.add(e.code);
  held.add(e.code);
});
window.addEventListener('keyup', e => held.delete(e.code));
window.addEventListener('blur', () => { held.clear(); tapped.clear(); touchHeld.clear(); touchTapped.clear(); if (battle && battle.phase === 'fight') setPause(true); });
document.querySelectorAll('[data-control]').forEach(button => {
  const control = button.dataset.control;
  const release = e => {
    if (e) e.preventDefault();
    touchHeld.delete(control);
    button.classList.remove('pressed');
  };
  button.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (!battle || battle.paused) return;
    button.setPointerCapture(e.pointerId);
    touchHeld.add(control);
    if (['jump','punch','kick','special'].includes(control)) touchTapped.add(control);
    button.classList.add('pressed');
  });
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
});
function playerIntent(side) {
  const keys = side === 0
    ? ['KeyA','KeyD','KeyW','KeyS','KeyF','KeyG','KeyH']
    : ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyJ','KeyK','KeyL'];
  const touch = side === 0;
  const v = {
    left: held.has(keys[0]) || (touch && touchHeld.has('left')),
    right: held.has(keys[1]) || (touch && touchHeld.has('right')),
    jump: tapped.has(keys[2]) || (touch && touchTapped.has('jump')),
    block: held.has(keys[3]) || (touch && touchHeld.has('block')),
    punch: tapped.has(keys[4]) || (touch && touchTapped.has('punch')),
    kick: tapped.has(keys[5]) || (touch && touchTapped.has('kick')),
    special: tapped.has(keys[6]) || (touch && touchTapped.has('special'))
  };
  return v;
}
function cpuIntent(ai, player, dt) {
  battle.aiClock = Math.max(0, battle.aiClock - dt);
  const gap = Math.abs(ai.x - player.x);
  const enemyAction = player.action && player.action.elapsed < .26;
  const act = {};
  if (gap > 115) {
    if (ai.x > player.x) act.left = true;
    else act.right = true;
  } else if (gap < 65 && Math.random() < .03) {
    if (ai.x > player.x) act.right = true;
    else act.left = true;
  }
  if (enemyAction && gap < 155 && !ai.action && Math.random() < .22) act.block = true;
  if (gap < 148 && battle.aiClock === 0 && !ai.action && !act.block) {
    if (ai.meter >= 40 && Math.random() < .31) act.special = true;
    else if (Math.random() < .53) act.punch = true;
    else act.kick = true;
    battle.aiClock = .34 + Math.random() * .32;
  }
  if (ai.id === 'volt' && ai.meter >= 40 && gap < 300 && gap > 160 && battle.aiClock === 0) {
    act.special = true;
    battle.aiClock = .65;
  }
  if (gap > 185 && gap < 290 && Math.random() < .005) act.jump = true;
  return act;
}

function playTone(frequency = 250, duration = .09, shape = 'square', volume = .025) {
  if (!soundEnabled) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    audioContext ||= new Audio();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = shape;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(45, frequency * .6), audioContext.currentTime + duration);
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch { /* Audio is optional. */ }
}
ui.audioBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  ui.audioBtn.textContent = soundEnabled ? '♪ ON' : '♪ OFF';
  ui.audioBtn.setAttribute('aria-label', soundEnabled ? 'Silenciar sonido' : 'Activar sonido');
  if (soundEnabled) playTone(500, .07, 'sine');
});

function resetRound() {
  battle.round++;
  battle.fighters = [createFighter(chosen[0], 300, 1), createFighter(chosen[1], 850, -1)];
  battle.time = 75;
  battle.aiClock = .8;
  battle.phase = 'ready';
  battle.phaseClock = 1.5;
  showAnnouncement('ROUND ' + battle.round, 'PREPÁRATE');
  ui.roundNum.textContent = String(battle.round);
  updateHud();
}
function startMatch() {
  held.clear(); tapped.clear(); touchHeld.clear(); touchTapped.clear(); particles.length = 0;
  battle = { fighters: [], round: 0, scores: [0,0], time: 75, phase: 'ready', phaseClock: 0, aiClock: .7, paused: false, matchWinner: null };
  ui.selectScreen.hidden = true;
  ui.gameScreen.hidden = false;
  ui.resultPanel.hidden = true;
  ui.pausePanel.hidden = true;
  ui.hudName1.textContent = fighterDefinition(chosen[0]).name;
  ui.hudName2.textContent = fighterDefinition(chosen[1]).name;
  ui.battleTip.textContent = mode === 'cpu'
    ? 'PUÑO · PATADA · ESPECIAL (CON BARRA DE ENERGÍA)'
    : 'J1: A/D/W/S/F/G/H   ·   J2: FLECHAS/J/K/L';
  resetRound();
  window.scrollTo(0, 0);
}
function leaveMatch() {
  battle = null;
  held.clear(); tapped.clear(); touchHeld.clear(); touchTapped.clear();
  ui.gameScreen.hidden = true;
  ui.selectScreen.hidden = false;
  ui.pausePanel.hidden = true;
  ui.resultPanel.hidden = true;
  drawRoster();
}
function setPause(paused) {
  if (!battle || battle.phase === 'finished') return;
  battle.paused = paused;
  ui.pausePanel.hidden = !paused;
  ui.pauseBtn.textContent = paused ? 'SEGUIR' : 'PAUSA';
  held.clear(); tapped.clear(); touchHeld.clear(); touchTapped.clear();
}
ui.startBtn.addEventListener('click', startMatch);
ui.rematchBtn.addEventListener('click', startMatch);
ui.changeBtn.addEventListener('click', leaveMatch);
ui.exitBtn.addEventListener('click', leaveMatch);
ui.pauseBtn.addEventListener('click', () => battle && setPause(!battle.paused));
ui.resumeBtn.addEventListener('click', () => setPause(false));

function showAnnouncement(title, sub) {
  ui.announcement.hidden = false;
  ui.announcementText.textContent = title;
  ui.announcementSmall.textContent = sub;
}
function awardRound(index, reason) {
  if (battle.phase !== 'fight') return;
  if (index !== null) battle.scores[index]++;
  battle.phase = 'between';
  battle.phaseClock = 2.1;
  battle.matchWinner = index !== null && battle.scores[index] >= 2 ? index : null;
  const title = index === null ? 'EMPATE' : reason === 'time' ? 'TIEMPO' : 'K.O.';
  const sub = index === null ? 'SIN VENCEDOR' : fighterDefinition(battle.fighters[index].id).name + ' GANA LA RONDA';
  showAnnouncement(title, sub);
  if (index !== null) playTone(115, .3, 'sawtooth', .045);
  updateHud();
}
function showMatchResult() {
  battle.phase = 'finished';
  ui.announcement.hidden = true;
  const victor = battle.matchWinner;
  const name = fighterDefinition(battle.fighters[victor].id).name;
  ui.winnerTitle.textContent = name + ' ¡VICTORIA!';
  ui.winnerDetails.textContent = 'Resultado final: ' + battle.scores[0] + ' - ' + battle.scores[1] + ' · ¿Listo para una revancha?';
  ui.resultPanel.hidden = false;
}
function processHit(a, b) {
  const hit = resolveHit(a,b);
  if (!hit) return;
  const x = hit.x, y = GROUND - 132 - hit.y;
  shake = hit.guarding ? 3 : hit.type === 'special' ? 15 : 8;
  const count = hit.type === 'special' ? 22 : 13;
  for (let i = 0; i < count; i++) {
    const rad = Math.random() * Math.PI * 2;
    const force = 70 + Math.random() * 240;
    particles.push({ x, y, vx: Math.cos(rad)*force, vy: Math.sin(rad)*force, life: .35 + Math.random()*.2, max: .55, color: hit.guarding ? '#d8e8ff' : hit.color, size: 2+Math.random()*5 });
  }
  particles.push({ x, y:y-30, vx:5, vy:-47, life:.75, max:.75, text:hit.guarding ? 'BLOQUEO' : String(hit.damage), color:hit.guarding?'#dee9ff':'#fff7e1', size:hit.guarding?17:29 });
  playTone(hit.guarding ? 330 : hit.type === 'special' ? 160 : 210, hit.type === 'special' ? .2 : .085, 'triangle', .045);
}

function tick(dt) {
  if (!battle || battle.paused) return;
  if (battle.phase === 'ready') {
    battle.phaseClock -= dt;
    if (battle.phaseClock <= 0) { battle.phase = 'fight'; ui.announcement.hidden = true; playTone(620,.1,'sine'); }
    return;
  }
  if (battle.phase === 'between') {
    battle.phaseClock -= dt;
    if (battle.phaseClock <= 0) {
      if (battle.matchWinner !== null) showMatchResult();
      else resetRound();
    }
    return;
  }
  if (battle.phase !== 'fight') return;
  const [a,b] = battle.fighters;
  const p1 = playerIntent(0);
  const p2 = mode === 'cpu' ? cpuIntent(b,a,dt) : playerIntent(1);
  stepFighter(a,p1,b,dt);
  stepFighter(b,p2,a,dt);
  keepApart(a,b);
  processHit(a,b);
  processHit(b,a);
  tapped.clear(); touchTapped.clear();
  battle.time = Math.max(0, battle.time - dt);
  if (a.health <= 0 || b.health <= 0) {
    const winner = a.health <= 0 && b.health <= 0 ? null : a.health <= 0 ? 1 : 0;
    awardRound(winner,'ko');
  } else if (battle.time === 0) awardRound(winnerByTimeout(a,b),'time');
  updateHud();
}
function updateHud() {
  if (!battle) return;
  const [a,b] = battle.fighters;
  for (let i = 0; i < 2; i++) {
    const f = battle.fighters[i], n = i+1;
    $('hp' + n).style.width = f.health + '%';
    $('hp' + n).classList.toggle('low', f.health <= 30);
    $('mp' + n).style.width = f.meter + '%';
    $('score' + n).innerHTML = [0,1].map(k=>"<i class='round-pip"+(battle.scores[i]>k?" won":"")+"'></i>").join('');
  }
  ui.timer.textContent = String(Math.ceil(battle.time));
}

const stars = Array.from({length:85}, (_,i) => ({x:(i*193+41)%WIDTH,y:(i*71+23)%335,r:1+(i%3)*.5}));
const buildings = Array.from({length:23}, (_,i) => ({x:i*57-20,w:37+(i*17)%35,h:75+(i*47)%155,light:i%4===0}));
function renderBackground(t) {
  const sky = ctx.createLinearGradient(0,0,0,HEIGHT);
  sky.addColorStop(0,'#091126'); sky.addColorStop(.45,'#37244e'); sky.addColorStop(.77,'#5c3453'); sky.addColorStop(1,'#131d33');
  ctx.fillStyle = sky; ctx.fillRect(0,0,WIDTH,HEIGHT);
  ctx.fillStyle='#ffffffa2';
  for(const star of stars){ctx.globalAlpha=.25+.25*Math.sin(t+star.x);ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;
  const halo=ctx.createRadialGradient(590,180,10,590,180,265);
  halo.addColorStop(0,'#eeb8ca5e');halo.addColorStop(1,'#be569700');
  ctx.fillStyle=halo;ctx.fillRect(320,-100,580,560);
  ctx.fillStyle='#eac5dd';ctx.beginPath();ctx.arc(580,180,95,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#8b7197';ctx.beginPath();ctx.arc(609,162,94,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#111e39';
  for(let i=0;i<WIDTH;i+=145){ctx.beginPath();ctx.moveTo(i-140,395);ctx.lineTo(i+100,270+(i%4)*25);ctx.lineTo(i+340,395);ctx.fill();}
  buildings.forEach((b,i)=>{
    const by=GROUND-35-b.h;
    ctx.fillStyle = i%2 ? '#172035' : '#1c233c';
    ctx.fillRect(b.x,by,b.w,b.h+35);
    if(b.light){ctx.fillStyle='#aa4b83aa';ctx.fillRect(b.x+6,by+13,b.w-12,3);}
    for(let iy=by+22;iy<GROUND-45;iy+=19)for(let ix=b.x+8;ix<b.x+b.w-7;ix+=15){
      if((ix*3+iy+i)%5<2){ctx.fillStyle= i%2?'#7ed4e185':'#f8a86d85';ctx.fillRect(ix,iy,5,8);}
    }
  });
  ctx.fillStyle='#101728';ctx.fillRect(0,GROUND-24,WIDTH,HEIGHT-GROUND+24);
  ctx.fillStyle='#5b607e';ctx.fillRect(0,GROUND-25,WIDTH,5);
  ctx.fillStyle='#ad5c9d';ctx.fillRect(0,GROUND-22,WIDTH,2);
  const floor=ctx.createLinearGradient(0,GROUND,0,HEIGHT);floor.addColorStop(0,'#29324b');floor.addColorStop(1,'#0a1222');
  ctx.fillStyle=floor;ctx.fillRect(0,GROUND,WIDTH,HEIGHT-GROUND);
  ctx.strokeStyle='#8b6caa42';ctx.lineWidth=1;
  for(let i=-9;i<=9;i++){
    ctx.beginPath();ctx.moveTo(WIDTH/2,GROUND);ctx.lineTo(WIDTH/2+i*145,HEIGHT);ctx.stroke();
  }
  for(let y=GROUND+22;y<HEIGHT;y+=Math.max(11,(y-GROUND)*.25)){
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WIDTH,y);ctx.stroke();
  }
  ctx.fillStyle='#d1a2e338';ctx.fillRect(0,GROUND-20,WIDTH,4);
  for(let i=0;i<8;i++){
    const x=95+i*150;
    ctx.fillStyle='#935dba40';ctx.fillRect(x,GROUND-9,19,3);
  }
}
function segment(x1,y1,x2,y2,width,color) {
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle='#080d1d';ctx.lineWidth=width+7;ctx.lineCap='round';ctx.stroke();
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function fighterPaint(f,t) {
  const def=fighterDefinition(f.id);
  ctx.save();ctx.translate(f.x,GROUND+4);
  ctx.fillStyle='#070a16a0';ctx.beginPath();ctx.ellipse(0,0,49+f.y*.1,11,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
  ctx.save();ctx.translate(f.x,GROUND-f.y);
  ctx.scale(f.face,1);
  const idle=Math.sin(t*3+f.walk)*2;
  const stride=f.y>0 ? 11 : Math.sin(f.walk)*14;
  const attack=f.action;
  const phase=attack ? attack.elapsed : 0;
  const isActive=attack && phase > .07;
  const punching=isActive && attack.type==='punch';
  const kicking=isActive && (attack.type==='kick'||(attack.type==='special'&&f.id==='ember'));
  const aura=attack?.type==='special' ? .4+.2*Math.sin(t*18):.08;
  ctx.globalAlpha=aura;ctx.fillStyle=def.color;ctx.beginPath();ctx.ellipse(0,-94,65,117,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  if(attack?.type==='special'){
    ctx.strokeStyle=def.color;ctx.lineWidth=4;
    for(let i=0;i<3;i++){ctx.globalAlpha=.32;ctx.beginPath();ctx.arc(0,-92,48+16*i+Math.sin(t*14+i)*3,0,Math.PI*2);ctx.stroke();}
    ctx.globalAlpha=1;
  }
  const flash=f.flash>0 && Math.floor(t*28)%2===0;
  const armor=flash?'#fff9f1':def.shade;
  const bright=flash?'#ffffff':def.color;
  // rear leg and boot
  segment(-12,-75,-22-stride*.4,-38,23,'#293149');
  segment(-22-stride*.4,-38,-15+stride,-12,19,armor);
  segment(-15+stride,-12,2+stride,-7,17,'#0b1121');
  // rear arm
  segment(-26,-126,-36,-88+idle,20,armor);
  segment(-36,-88+idle,-28,-71,18,'#b98d7d');
  // front leg, with kick extension
  if(kicking){
    segment(12,-78,34,-56,24,armor);
    segment(34,-56,109,-76,22,armor);
    segment(109,-76,131,-74,20,bright);
    ctx.fillStyle=bright;ctx.globalAlpha=.45;ctx.fillRect(116,-81,65,8);ctx.globalAlpha=1;
  } else {
    segment(14,-75,23+stride*.45,-37,24,armor);
    segment(23+stride*.45,-37,19-stride,-11,21,armor);
    segment(19-stride,-10,39-stride,-7,17,'#0b1121');
  }
  // torso
  ctx.fillStyle='#090d1d';ctx.beginPath();ctx.moveTo(-33,-136);ctx.lineTo(27,-139);ctx.lineTo(37,-79);ctx.lineTo(-30,-78);ctx.closePath();ctx.fill();
  ctx.fillStyle=armor;ctx.beginPath();ctx.moveTo(-27,-135);ctx.lineTo(25,-137);ctx.lineTo(31,-88);ctx.lineTo(-27,-85);ctx.closePath();ctx.fill();
  ctx.strokeStyle=bright;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-20,-126);ctx.lineTo(0,-112);ctx.lineTo(24,-130);ctx.stroke();
  ctx.fillStyle='#0c172e';ctx.fillRect(-28,-91,57,14);
  ctx.fillStyle=bright;ctx.fillRect(2,-91,13,12);
  // shoulder and leading arm
  ctx.fillStyle=bright;ctx.beginPath();ctx.arc(27,-122,18,0,Math.PI*2);ctx.fill();
  if(f.block){
    segment(28,-121,40,-155,19,armor);segment(40,-155,16,-165,18,'#bc8b74');
    segment(-27,-125,-7,-155,18,armor);
  } else if(punching || (attack?.type==='special' && f.id!=='ember')){
    segment(27,-121,61,-111,21,armor);
    segment(61,-111,111+(attack.type==='special'?28:0),-122,18,'#bf9183');
    ctx.fillStyle=bright;ctx.beginPath();ctx.arc(117+(attack.type==='special'?28:0),-120,13,0,Math.PI*2);ctx.fill();
    if(attack.type==='special'){ctx.globalAlpha=.5;ctx.fillRect(121,-132,80,20);ctx.globalAlpha=1;}
  } else {
    segment(29,-123,40,-92,20,armor);
    segment(40,-92,32,-83,17,'#bc8b74');
  }
  // neck
  ctx.fillStyle='#bd8c79';ctx.fillRect(-12,-150,27,23);
  // head
  ctx.fillStyle='#050917';ctx.beginPath();ctx.ellipse(0,-177,28,33,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=flash?'#fff3df':'#c08e78';ctx.beginPath();ctx.ellipse(0,-179,24,30,0,0,Math.PI*2);ctx.fill();
  // hairstyle / mask by fighter
  if(f.id==='kira'){
    ctx.fillStyle='#3e2d65';ctx.beginPath();ctx.moveTo(-26,-180);ctx.lineTo(-43,-219);ctx.lineTo(-12,-208);ctx.lineTo(0,-236);ctx.lineTo(14,-207);ctx.lineTo(35,-224);ctx.lineTo(23,-183);ctx.closePath();ctx.fill();
    ctx.fillStyle=bright;ctx.beginPath();ctx.moveTo(-26,-147);ctx.lineTo(-82+Math.sin(t*5)*7,-165);ctx.lineTo(-45,-152);ctx.fill();
  } else if(f.id==='volt'){
    ctx.fillStyle='#15516b';ctx.beginPath();ctx.arc(0,-187,27,Math.PI,Math.PI*2);ctx.lineTo(26,-179);ctx.lineTo(-27,-179);ctx.fill();
    ctx.fillStyle=bright;ctx.fillRect(-23,-190,49,11);
    ctx.fillStyle='#071d37';ctx.fillRect(-21,-187,46,7);
  } else if(f.id==='onyx'){
    ctx.fillStyle='#6b4129';ctx.beginPath();ctx.moveTo(-30,-177);ctx.lineTo(-33,-225);ctx.lineTo(-13,-208);ctx.lineTo(14,-208);ctx.lineTo(35,-226);ctx.lineTo(29,-172);ctx.closePath();ctx.fill();
    ctx.fillStyle=bright;ctx.fillRect(-35,-159,68,12);
    ctx.fillStyle='#452c29';ctx.fillRect(-17,-166,34,9);
  } else {
    ctx.fillStyle='#f06e82';ctx.beginPath();ctx.moveTo(-27,-179);ctx.lineTo(-35,-212);ctx.lineTo(-17,-203);ctx.lineTo(-10,-239);ctx.lineTo(5,-215);ctx.lineTo(21,-231);ctx.lineTo(29,-177);ctx.closePath();ctx.fill();
    ctx.fillStyle=bright;ctx.beginPath();ctx.moveTo(-28,-156);ctx.lineTo(-65,-166);ctx.lineTo(-32,-142);ctx.fill();
  }
  ctx.strokeStyle='#101527';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(3,-181);ctx.lineTo(20,-183);ctx.stroke();
  ctx.fillStyle=bright;ctx.fillRect(12,-183,7,3);
  ctx.strokeStyle='#583746';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(10,-167);ctx.lineTo(18,-168);ctx.stroke();
  // special move's colored arc
  if(attack?.type==='special'&&phase>.11&&phase<.55){
    ctx.strokeStyle=bright;ctx.lineWidth=8;ctx.globalAlpha=.6;
    ctx.beginPath();ctx.arc(28,-108,99,-1.3,.85);ctx.stroke();ctx.globalAlpha=1;
    if(f.id==='volt') for(let i=0;i<4;i++){
      const x=115+i*48;ctx.strokeStyle=i%2?'#ffffff':bright;ctx.lineWidth=7;
      ctx.beginPath();ctx.moveTo(x,-132);ctx.lineTo(x+13,-102);ctx.lineTo(x+26,-140);ctx.stroke();
    }
  }
  ctx.restore();
}
function paintParticles(dt) {
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.life-=dt;
    if(p.life<=0){particles.splice(i,1);continue;}
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.text?0:360)*dt;
    ctx.save();ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;
    if(p.text){ctx.font='900 '+p.size+'px Impact,Arial,sans-serif';ctx.textAlign='center';ctx.strokeStyle='#13192b';ctx.lineWidth=5;ctx.strokeText(p.text,p.x,p.y);ctx.fillText(p.text,p.x,p.y);}
    else{ctx.fillRect(p.x,p.y,p.size,p.size);}
    ctx.restore();
  }
}
let previous = performance.now();
function frame(timestamp){
  const dt=Math.min(.035,Math.max(0,(timestamp-previous)/1000));
  previous=timestamp;now=timestamp/1000;
  if(battle) {
    if(!battle.paused) tick(dt);
    ctx.save();ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake*.6);
    renderBackground(now);
    for(const f of battle.fighters) fighterPaint(f,now);
    if(!battle.paused) paintParticles(dt); else paintParticles(0);
    ctx.restore();
    shake=Math.max(0,shake-dt*50);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
