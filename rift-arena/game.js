import { WIDTH, GROUND, ROSTER, fighterDefinition, createFighter, stepFighter, resolveHit, keepApart, winnerByTimeout, moveInfo, clamp } from './core.js';
import { STAGES, renderStage } from './stages.js';
import { DESIGNS, portraitSvg, renderCharacter } from './characters.js';
import { movementFromDrag, strikeFromSwipe } from './gestures.js';
import { createArena3D } from './arena3d.js';
import { installZoomGuard } from './touch-safety.js';

// Catch Safari double-tap zoom before it disrupts the two-thumb control layout.
installZoomGuard(document);
const $ = id => document.getElementById(id);
const ui = Object.fromEntries(['app','selectScreen','gameScreen','roster','fighterInfo','portrait1','portrait2','name1','name2','enemyLabel','modeNote','startBtn','audioBtn','pauseBtn','exitBtn','resumeBtn','rematchBtn','changeBtn','pausePanel','resultPanel','winnerTitle','winnerDetails','hudName1','hudName2','hp1','hp2','mp1','mp2','score1','score2','roundNum','timer','announcement','announcementSmall','announcementText','battleTip','arena'].map(id => [id, $(id)]));
const arena3d = createArena3D(ui.arena);
const ctx = arena3d ? null : ui.arena.getContext('2d', { alpha: false });
ui.arena.dataset.renderer = arena3d ? 'webgl3d' : 'canvas2d';
const HEIGHT = 648;
const chosen = ['kira', 'volt'];
let activeSide = 0;
let selectedStage = 'zenith';
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
function drawRoster() {
  ui.roster.innerHTML = '';
  for (const f of ROSTER) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fighter-card' + (chosen[activeSide] === f.id ? ' selected' : '');
    button.setAttribute('aria-pressed', chosen[activeSide] === f.id ? 'true' : 'false');
    button.setAttribute('aria-label', f.name + ', ' + DESIGNS[f.id].species + ', ' + f.alias + ', ' + f.bio);
    button.innerHTML = "<span class='card-art' style='--fighter-color:"+f.color+"'>"+portraitSvg(f)+"</span><span class='card-meta'><b>"+f.name+"</b><small>"+f.alias+"</small></span>";
    button.addEventListener('click', () => {
      chosen[activeSide] = f.id;
      if (activeSide === 0 && chosen[0] === chosen[1]) chosen[1] = ROSTER.find(c => c.id !== chosen[0]).id;
      drawRoster();
    });
    ui.roster.append(button);
  }
  const f = fighterDefinition(chosen[activeSide]);
  ui.fighterInfo.textContent = DESIGNS[f.id].species + ' · ' + f.trait + ' · ' + f.bio;
  for (let side = 0; side < 2; side++) {
    const selected = fighterDefinition(chosen[side]);
    $('portrait' + (side + 1)).innerHTML = portraitSvg(selected);
    $('portrait' + (side + 1)).style.setProperty('--fighter-color', selected.color);
    $('name' + (side + 1)).textContent = selected.name;
  }
  ui.enemyLabel.textContent = mode === 'cpu' ? 'CPU' : 'JUGADOR 2';
  document.querySelectorAll('[data-side]').forEach(b=>b.textContent=b.dataset.side==='0'?'JUGADOR 1':mode==='cpu'?'CPU':'JUGADOR 2');
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b === button));
  ui.modeNote.textContent = mode === 'cpu'
    ? 'MÓVIL: desliza con el pulgar izquierdo para moverte y el derecho para atacar. Gira el teléfono en horizontal.'
    : 'VERSUS LOCAL: dos jugadores en el mismo teclado. El control con gestos del móvil se reserva para jugar contra la CPU.';
  drawRoster();
}));
document.querySelectorAll('[data-side]').forEach(button => button.addEventListener('click', () => {
  activeSide = Number(button.dataset.side);
  document.querySelectorAll('[data-side]').forEach(b => b.classList.toggle('active', b === button));
  drawRoster();
}));
drawRoster();
// Escenarios originales, accesibles antes de cada duelo.
const stageChooser=document.createElement('div');
stageChooser.id='stageChoices';
stageChooser.className='stage-chooser';
stageChooser.setAttribute('role','group');
stageChooser.setAttribute('aria-label','Seleccionar escenario');
for(const s of STAGES){
  const b=document.createElement('button');
  b.type='button';b.className='stage-tile';b.dataset.stage=s.id;
  b.style.setProperty('--stage-color',s.color);
  b.innerHTML='<span class="stage-tile-art"></span><b>'+s.name+'</b>';
  b.setAttribute('aria-label','Escenario '+s.name);
  b.addEventListener('click',()=>{
    selectedStage=s.id;
    document.querySelectorAll('[data-stage]').forEach(btn=>{
      btn.classList.toggle('chosen',btn.dataset.stage===selectedStage);
      btn.setAttribute('aria-pressed',String(btn.dataset.stage===selectedStage));
    });
    const field=document.querySelector('.match-settings span:last-child');
    if(field)field.innerHTML='<b>ESCENARIO</b> · '+s.name;
  });
  stageChooser.append(b);
}
ui.startBtn.before(stageChooser);
stageChooser.querySelector('[data-stage="zenith"]').click();

function setupCanvas() {
  if (arena3d) {
    const fighting=document.body.classList.contains('in-battle');
    const w=fighting?(ui.arena.clientWidth||window.innerWidth):WIDTH;
    const h=fighting?(ui.arena.clientHeight||window.innerHeight):HEIGHT;
    // Prevent huge backing textures on older iPhones while keeping high-resolution fighters.
    const maxPixels=1600*900;
    const ratio=Math.min(window.devicePixelRatio||1,1.6,Math.sqrt(maxPixels/(w*h)));
    const pw=Math.max(2,Math.round(w*ratio)),ph=Math.max(2,Math.round(h*ratio));
    if(ui.arena.width!==pw||ui.arena.height!==ph){ui.arena.width=pw;ui.arena.height=ph;}
    arena3d.resize(pw,ph);
    return;
  }
  const dpr=Math.min(window.devicePixelRatio||1,2);
  ui.arena.width=WIDTH*dpr;ui.arena.height=HEIGHT*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
setupCanvas();
window.addEventListener('resize', setupCanvas);
window.addEventListener('orientationchange',()=>requestAnimationFrame(setupCanvas));
ui.arena.addEventListener('contextmenu', event => event.preventDefault());

const codes = new Set(['KeyA','KeyD','KeyW','KeyS','KeyF','KeyG','KeyH','KeyR','KeyT','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyJ','KeyK','KeyL','KeyU','KeyI','Space','Escape']);
const singles = new Set(['KeyW','KeyF','KeyG','KeyH','KeyR','KeyT','ArrowUp','KeyJ','KeyK','KeyL','KeyU','KeyI']);
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
// Controles de dos pulgares: funcionan con Pointer Events y multitáctil.
// La izquierda es un joystick de arrastre; la derecha reconoce gestos de golpes.
const leftSurface=document.createElement('div');
const rightSurface=document.createElement('div');
leftSurface.id='swipeMove';rightSurface.id='swipeStrike';
leftSurface.className='swipe-surface swipe-move';
rightSurface.className='swipe-surface swipe-strike';
leftSurface.setAttribute('aria-label','Zona izquierda: deslizar para caminar, saltar o cubrir');
rightSurface.setAttribute('aria-label','Zona derecha: tocar para puño, deslizar para ataques');
leftSurface.innerHTML='<div class="swipe-label"><b>◯</b><span>MOVER / CUBRIR</span></div><div class="swipe-knob"></div>';
rightSurface.innerHTML='<div class="swipe-label"><b>✦</b><span>TOCAR / GOLPEAR</span></div><div class="swipe-knob"></div>';
ui.arena.parentElement.append(leftSurface,rightSurface);
let movePointer=null;
let strikePointer=null;
function resetSwipe(){
  movePointer=null;strikePointer=null;
  for(const k of ['left','right','jump','crouch','block'])touchHeld.delete(k);
  for(const el of [leftSurface,rightSurface]){el.classList.remove('active');el.style.setProperty('--dx','0px');el.style.setProperty('--dy','0px');}
}
leftSurface.addEventListener('pointerdown',e=>{
  if(!battle||battle.paused||battle.phase!=='fight'||mode!=='cpu'||movePointer)return;
  e.preventDefault();
  movePointer={id:e.pointerId,x:e.clientX,y:e.clientY,jumped:false};
  if(e.isPrimary||e.pointerType==='touch')leftSurface.setPointerCapture(e.pointerId);
  leftSurface.classList.add('active');
});
leftSurface.addEventListener('pointermove',e=>{
  if(!movePointer||movePointer.id!==e.pointerId)return;
  e.preventDefault();
  const dx=e.clientX-movePointer.x,dy=e.clientY-movePointer.y;
  const direction=movementFromDrag(dx,dy);
  for(const key of ['left','right','crouch','block']){
    if(direction[key])touchHeld.add(key);else touchHeld.delete(key);
  }
  if(direction.jump&&!movePointer.jumped){touchTapped.add('jump');movePointer.jumped=true;}
  leftSurface.style.setProperty('--dx',clamp(dx,-45,45)+'px');
  leftSurface.style.setProperty('--dy',clamp(dy,-35,35)+'px');
});
function releaseMove(e){
  if(!movePointer||movePointer.id!==e.pointerId)return;
  e.preventDefault();
  movePointer=null;
  for(const key of ['left','right','crouch','block'])touchHeld.delete(key);
  leftSurface.classList.remove('active');
  leftSurface.style.setProperty('--dx','0px');leftSurface.style.setProperty('--dy','0px');
}
leftSurface.addEventListener('pointerup',releaseMove);
leftSurface.addEventListener('pointercancel',releaseMove);
leftSurface.addEventListener('lostpointercapture',releaseMove);
rightSurface.addEventListener('pointerdown',e=>{
  if(!battle||battle.paused||battle.phase!=='fight'||mode!=='cpu'||strikePointer)return;
  e.preventDefault();
  strikePointer={id:e.pointerId,x:e.clientX,y:e.clientY,start:performance.now(),fired:false};
  if(e.isPrimary||e.pointerType==='touch')rightSurface.setPointerCapture(e.pointerId);
  rightSurface.classList.add('active');
});
rightSurface.addEventListener('pointermove',e=>{
  if(!strikePointer||strikePointer.id!==e.pointerId)return;
  e.preventDefault();
  const dx=e.clientX-strikePointer.x,dy=e.clientY-strikePointer.y;
  if(!strikePointer.fired&&Math.hypot(dx,dy)>75){
    touchTapped.add(strikeFromSwipe(dx,dy,performance.now()-strikePointer.start));
    strikePointer.fired=true;
  }
  rightSurface.style.setProperty('--dx',clamp(dx,-35,35)+'px');
  rightSurface.style.setProperty('--dy',clamp(dy,-35,35)+'px');
});
function releaseStrike(e){
  if(!strikePointer||strikePointer.id!==e.pointerId)return;
  e.preventDefault();
  const dx=e.clientX-strikePointer.x,dy=e.clientY-strikePointer.y;
  if(!strikePointer.fired && battle?.phase==='fight'&&!battle.paused){
    const move=strikeFromSwipe(dx,dy,performance.now()-strikePointer.start);
    if(move!=='block')touchTapped.add(move);
  }
  strikePointer=null;touchHeld.delete('block');
  rightSurface.classList.remove('active');
  rightSurface.style.setProperty('--dx','0px');rightSurface.style.setProperty('--dy','0px');
}
rightSurface.addEventListener('pointerup',releaseStrike);
rightSurface.addEventListener('pointercancel',releaseStrike);
rightSurface.addEventListener('lostpointercapture',releaseStrike);

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
    crouch: held.has(keys[3]) || (touch && touchHeld.has('crouch')),
    punch: tapped.has(keys[4]) || (touch && touchTapped.has('punch')),
    kick: tapped.has(keys[5]) || (touch && touchTapped.has('kick')),
    special: tapped.has(keys[6]) || (touch && touchTapped.has('special')),
    uppercut: tapped.has(side===0?'KeyR':'KeyU') || (touch && touchTapped.has('uppercut')),
    sweep: tapped.has(side===0?'KeyT':'KeyI') || (touch && touchTapped.has('sweep'))
  };
  return v;
}
function cpuIntent(ai, player, dt) {
  battle.aiClock=Math.max(0,battle.aiClock-dt);
  const gap=Math.abs(ai.x-player.x);
  const threat=player.action && player.action.elapsed < .28;
  const act={};
  if(gap>114){
    if(ai.x>player.x)act.left=true;else act.right=true;
  }else if(gap<72&&Math.random()<.07){
    if(ai.x>player.x)act.right=true;else act.left=true;
  }
  if(threat&&gap<150&&!ai.action&&Math.random()<.42)act.block=true;
  if(gap<153&&battle.aiClock===0&&!ai.action&&!act.block){
    const r=Math.random();
    if(ai.meter>=40&&r<.19)act.special=true;
    else if(r<.43)act.punch=true;
    else if(r<.69)act.kick=true;
    else if(r<.84)act.sweep=true;
    else act.uppercut=true;
    battle.aiClock=.31+Math.random()*.34;
  }
  if((ai.id==='volt'||ai.id==='vex')&&ai.meter>=40&&gap<288&&gap>155&&battle.aiClock===0){
    act.special=true;battle.aiClock=.65;
  }
  if(gap>176&&gap<280&&Math.random()<.003)act.jump=true;
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
  battle.time = 60;
  battle.aiClock = .8;
  battle.phase = 'ready';
  battle.phaseClock = 1.5;
  showAnnouncement('ROUND ' + battle.round, 'PREPÁRATE');
  ui.roundNum.textContent = String(battle.round);
  updateHud();
}
function startMatch() {
  held.clear(); tapped.clear(); touchHeld.clear(); touchTapped.clear(); particles.length = 0;
  battle = { fighters: [], round: 0, scores: [0,0], time: 60, phase: 'ready', phaseClock: 0, aiClock: .7, paused: false, matchWinner: null, stage:selectedStage };
  ui.selectScreen.hidden = true;
  document.body.classList.add('in-battle');
  setupCanvas();
  resetSwipe();
  ui.gameScreen.hidden = false;
  ui.resultPanel.hidden = true;
  ui.pausePanel.hidden = true;
  ui.hudName1.textContent = fighterDefinition(chosen[0]).name;
  ui.hudName2.textContent = fighterDefinition(chosen[1]).name;
  ui.battleTip.textContent = mode === 'cpu'
    ? 'IZQUIERDA: MOVER / CUBRIR · DERECHA: TOCAR, DESLIZAR, COMBO'
    : 'J1: A/D/W/S/F/G/H   ·   J2: FLECHAS/J/K/L';
  resetRound();
  window.scrollTo(0, 0);
  if(window.matchMedia('(pointer:coarse)').matches && screen.orientation?.lock){screen.orientation.lock('landscape').catch(()=>{});}
}
function leaveMatch() {
  battle = null;
  document.body.classList.remove('in-battle');
  resetSwipe();
  held.clear(); tapped.clear(); touchHeld.clear(); touchTapped.clear();
  document.querySelectorAll('.hit-pop').forEach(node=>node.remove());
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
  resetSwipe();
}
ui.startBtn.addEventListener('click', startMatch);
ui.rematchBtn.addEventListener('click', startMatch);
ui.changeBtn.addEventListener('click', leaveMatch);
ui.exitBtn.addEventListener('click', leaveMatch);
$('rotateExit').addEventListener('click', leaveMatch);
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
  if(arena3d){
    const impact=document.createElement('span');
    impact.className='hit-pop'+(hit.guarding?' guarding':'');
    impact.style.left=clamp((x/WIDTH)*100,8,92)+'%';
    impact.style.top=clamp((y/HEIGHT)*100-8,20,75)+'%';
    impact.textContent=hit.guarding?'GUARDIA':hit.combo>1?hit.combo+' HITS':'-'+hit.damage;
    ui.arena.parentElement.append(impact);
    impact.addEventListener('animationend',()=>impact.remove(),{once:true});
  }
  shake = hit.guarding ? 3 : hit.type === 'special' ? 15 : 8;
  const count = hit.type === 'special' ? 22 : 13;
  for (let i = 0; i < count; i++) {
    const rad = Math.random() * Math.PI * 2;
    const force = 70 + Math.random() * 240;
    particles.push({ x, y, vx: Math.cos(rad)*force, vy: Math.sin(rad)*force, life: .35 + Math.random()*.2, max: .55, color: hit.guarding ? '#d8e8ff' : hit.color, size: 2+Math.random()*5 });
  }
  particles.push({ x, y:y-30, vx:5, vy:-47, life:.75, max:.75, text:hit.guarding ? 'BLOQUEO' : String(hit.damage), color:hit.guarding?'#dee9ff':'#fff7e1', size:hit.guarding?17:29 });
  if(hit.combo>=2&&!hit.guarding)particles.push({x:WIDTH/2,y:185,vx:0,vy:-30,life:.85,max:.85,text:hit.combo+' HITS COMBO',color:'#ffcc78',size:46});
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
  if(strikePointer&&!strikePointer.fired && performance.now()-strikePointer.start>350)touchHeld.add('block');
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
function fighterPaint(f,t){renderCharacter(ctx,f,t,GROUND);}
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
    if (arena3d) {
      arena3d.render(battle.fighters,battle.stage,now,shake);
    } else if(ctx) {
      ctx.save();ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake*.6);
      renderStage(ctx,battle.stage,now);
      for(const f of battle.fighters) fighterPaint(f,now);
      if(!battle.paused) paintParticles(dt);else paintParticles(0);
      ctx.restore();
    }
    shake=Math.max(0,shake-dt*50);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
