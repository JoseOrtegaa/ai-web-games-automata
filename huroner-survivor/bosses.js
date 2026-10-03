// Encounter rules only: no canvas, DOM or wall-clock time.
export const BOSS_POOLS = [
  ['twins','prism','bastion','antler','weaver'],
  ['reaper','storm','mortar','bell','grave_hound'],
  ['granite','crystal','quarry','obsidian','stone_mortar'],
  ['ember','ash_reaper','lava_colossus','pyro_oracle','magma_ram'],
];

export const BOSSES = [
  // Surface
  {id:'twins',depth:0,profile:'twins',kind:'rabbit',form:'twins',name:['Hermanos del eclipse','Eclipse brothers'],hint:['Espada y magia · derrota a los dos','Sword and magic · defeat both']},
  {id:'prism',depth:0,profile:'prism',kind:'quail',form:'prism',name:['Codorniz prismática','Prismatic quail'],hint:['Esquiva sus haces · golpéala para frenar su cura','Dodge its beams · hit it to stop healing']},
  {id:'bastion',depth:0,profile:'bastion',kind:'chicken',form:'bastion',name:['Pollo bastión','Bastion chicken'],hint:['Mata al conejo azul para romper el escudo','Kill the blue rabbit to break the shield']},
  {id:'antler',depth:0,profile:'antler',kind:'hare',form:'antler',name:['Liebre cornuda','Antlered hare'],hint:['Apártate de la trayectoria de embestida','Step away from the charge path']},
  {id:'weaver',depth:0,profile:'weaver',kind:'quail',form:'weaver',name:['Viuda de espinas','Thorn widow'],hint:['Rodea sus telarañas · dañan al pisarlas','Go around its webs · they hurt on contact']},

  // Ossuary / underground
  {id:'reaper',depth:1,profile:'reaper',kind:'bone_swordsman',form:'bone_knight',name:['Caballero del osario','Ossuary knight'],hint:['Su hoja de hueso vuelve hacia él · esquiva ida y vuelta','Its bone blade returns · dodge both passes']},
  {id:'storm',depth:1,profile:'storm',kind:'bone_archer',form:'bone_oracle',name:['Oráculo de médula','Marrow oracle'],hint:['Marca el suelo con magia ósea · sigue moviéndote','Bone magic marks the ground · keep moving']},
  {id:'mortar',depth:1,profile:'mortar',kind:'bone_skull',form:'bone_skull',name:['Bombardero de cráneos','Skull bombardier'],hint:['Lanza cráneos malditos sobre zonas marcadas','Cursed skulls fall on marked zones']},
  {id:'bell',depth:1,profile:'bell',kind:'bone_swordsman',form:'bone_bell',name:['Campanero del sepulcro','Grave bell keeper'],hint:['Sus ondas dejan seguro el centro ya atravesado','Its waves leave the crossed center safe']},
  {id:'grave_hound',depth:1,profile:'antler',kind:'bone_rabbit',form:'bone_hound',name:['Sabueso del osario','Ossuary hound'],hint:['Carga en línea recta · rompe su trayectoria','It charges in a straight line · break its path']},

  // Deep rock
  {id:'granite',depth:2,profile:'bell',kind:'stone_boar',form:'rock_colossus',name:['Coloso de granito','Granite colossus'],hint:['Golpea la roca y crea ondas expansivas','It pounds the rock and creates shockwaves']},
  {id:'crystal',depth:2,profile:'prism',kind:'stone_archer',form:'rock_seer',name:['Vidente de cristal','Crystal seer'],hint:['Cristales y haces fijan su dirección antes de disparar','Crystals and beams lock direction before firing']},
  {id:'quarry',depth:2,profile:'antler',kind:'stone_boar',form:'rock_ram',name:['Carnero de cantera','Quarry ram'],hint:['Su embestida pétrea atraviesa un carril completo','Its stone charge crosses a full lane']},
  {id:'obsidian',depth:2,profile:'weaver',kind:'stone_rabbit',form:'rock_weaver',name:['Tejedora de obsidiana','Obsidian weaver'],hint:['Deja grietas oscuras persistentes · rodéalas','It leaves persistent dark cracks · go around them']},
  {id:'stone_mortar',depth:2,profile:'mortar',kind:'stone_swordsman',form:'rock_mortar',name:['Artillero de la falla','Rift artillery'],hint:['Bombardea posiciones fijadas con fragmentos de roca','It bombards locked positions with rock fragments']},

  // Magma
  {id:'ember',depth:3,profile:'ember',kind:'lava_beast',form:'magma_hound',name:['Sabueso del infierno','Inferno hound'],hint:['Su fuego cubre sectores · rodéalo por los costados','Its fire covers sectors · circle around its sides']},
  {id:'ash_reaper',depth:3,profile:'reaper',kind:'ash_swordsman',form:'magma_reaper',name:['Segador de ceniza','Ash reaper'],hint:['Guadañas ardientes regresan hacia su dueño','Burning scythes return to their owner']},
  {id:'lava_colossus',depth:3,profile:'bell',kind:'lava_beast',form:'magma_colossus',name:['Coloso de lava','Lava colossus'],hint:['Anillos de magma se expanden desde sus golpes','Magma rings expand from its blows']},
  {id:'pyro_oracle',depth:3,profile:'storm',kind:'ember_archer',form:'magma_oracle',name:['Oráculo piromante','Pyromancer oracle'],hint:['Invoca marcas mágicas y rayos de fuego','It summons magical marks and fire bolts']},
  {id:'magma_ram',depth:3,profile:'antler',kind:'lava_beast',form:'magma_ram',name:['Ariete volcánico','Volcanic ram'],hint:['Su carga deja muy poco margen frontal · muévete lateralmente','Its charge leaves little frontal room · move sideways']},
];

export const bossDefinition = id => BOSSES.find(b => b.id === id);
export const bossPool = depth => {
  const index=Math.max(0,Math.min(3,Math.round(Number(depth)||0)));
  return BOSS_POOLS[index].map(bossDefinition);
};
// The existing level formula remains; the additional bonus rises from 30% to 50%.
// Snapshot at spawn: leveling up never refills a boss that is already being fought.
export const bossHealthMultiplier = level => 1.3 + Math.min(.2, Math.max(0, level - 5) * .01);
export const EXTRA_ATTACKS = {
  blade:['sword-lunge','eclipse-cleave'], mage:['rune-triad','arcane-star'],
  prism:['split-prism','crystal-burst'], bastion:['shield-wave','siege-hammer'],
  antler:['antler-quake','antler-leap'], mortar:['acid-pool','bomb-carpet'],
  weaver:['web-cross','venom-fan'], bell:['implosion','echo-triangle'],
  reaper:['twin-scythes','wing-cut'], ember:['fire-trail','ember-pounce'],
  storm:['storm-cross','lightning-cage'], king:['royal-quake','judgment']
};
export function bossEncounters(game) {
  const groups = new Map();
  for (const e of game.enemies) {
    if (!e.boss || e.hp <= 0) continue;
    const id = e.encounterId ?? e.id;
    if (!groups.has(id)) groups.set(id, {id,actor:e,hp:0,maxHp:e.encounterMaxHp ?? e.maxHp});
    groups.get(id).hp += e.hp;
  }
  return [...groups.values()];
}
export function spawnBoss(game, type = null, level = game.level) {
  const fullPool = type ? null : bossPool(game.worldDepth);
  const pool = type ? null : fullPool.filter(b => b.id !== game.lastBossType);
  const def = type ? bossDefinition(type) : (pool.length ? pool : fullPool)[Math.floor(game.random() * (pool.length ? pool.length : fullPool.length))];
  if (!def) throw new Error(`Unknown boss: ${type}`);
  game.lastBossType = def.id;
  const e = game.spawn(def.kind, true, level, false);
  Object.assign(e, {
    bossType:def.id,bossProfile:def.profile,bossTheme:def.depth,bossForm:def.form,
    encounterId:e.id,encounterMaxHp:e.maxHp,bossPart:'main',ability:1.5,castLeft:0,pending:null,sinceHit:0,shielded:false
  });
  if (def.profile === 'twins') {
    e.hp = e.maxHp = e.encounterMaxHp / 2; e.r = 30; e.bossPart = 'blade';
    const mage = game.spawn('rabbit');
    Object.assign(mage, {
      boss:true,bossType:def.id,bossProfile:def.profile,bossTheme:def.depth,bossForm:def.form,bossPart:'mage',bossLevel:level,
      encounterId:e.id,encounterMaxHp:e.encounterMaxHp,hp:e.maxHp,maxHp:e.maxHp,r:30,x:e.x+75,y:e.y+20,
      speed:e.speed*.8,damage:e.damage*.8,ability:2.2,castLeft:0,pending:null,sinceHit:0
    });
  }
  if (def.profile === 'bastion') {
    e.shielded = true;
    const key = game.spawn('rabbit'), dx=game.player.x-e.x, dy=game.player.y-e.y, d=Math.hypot(dx,dy)||1;
    Object.assign(key, {shieldOwnerId:e.id,bossTheme:def.depth,x:e.x+dx/d*100,y:e.y+dy/d*100,hp:55+level*7,maxHp:55+level*7,speed:48,damage:e.damage*.4,tier:0});
    e.shieldKeyId = key.id;
  }
  return e;
}
export function bossHit(game, e) {
  e.sinceHit = 0;
  if (e.hp > 0) return true;
  e.hp = 0;
  game.hazards = game.hazards.filter(h => h.ownerId !== e.id);
  game.shots = game.shots.filter(s => s.ownerId !== e.id);
  if (e.shieldOwnerId) {
    const owner = game.enemies.find(o => o.id === e.shieldOwnerId && o.hp > 0);
    if (owner) { owner.shielded = false; owner.flash = .3; game.emit('shieldBreak'); }
  }
  // Two targets constitute one encounter, one kill and one reward.
  const survivor = e.encounterId && game.enemies.find(o => o !== e && o.encounterId === e.encounterId && o.hp > 0);
  if (game.boss === e) game.boss = survivor || null;
  return !survivor;
}
function hazard(game, e, kind, data = {}) {
  if (game.hazards.length >= 64) return;
  game.hazards.push({ownerId:e.id,kind,x:e.x,y:e.y,angle:Math.atan2(game.player.y-e.y,game.player.x-e.x),age:-.85,duration:.25,damage:e.damage,color:e.bossTheme??0,effect:e.bossProfile,...data});
}
function projectile(game, e, angle, kind='magic', speed=145, damage=e.damage*.75) {
  if (game.shots.length >= 150) return;
  game.shots.push({ownerId:e.id,kind,x:e.x,y:e.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:3,age:0,damage,theme:e.bossTheme??0,effect:e.bossProfile});
}
function volley(game, e, angles, kind='magic', speed=145, damage=e.damage*.75) {
  for(const angle of angles)hazard(game,e,'beam',{angle,range:kind==='scythe'?270:320,width:7,damage:0,age:-1,duration:.12});
  e.pending={kind:'volley',time:1,angles,projectileKind:kind,speed,damage,x:e.x,y:e.y};
  e.castLeft=1.15;
}
function leap(game,e,p,kind='circle') {
  hazard(game,e,kind,{x:p.x,y:p.y,radius:58,age:-1.2,duration:kind==='web'?2.2:.3});
  e.pending={kind:'leap',time:.85,x:p.x,y:p.y,fromX:e.x,fromY:e.y};
  e.castLeft=1.6;
}
function extraAttack(game,e,id,angle) {
  const p=game.player;
  e.ability=3.8;e.castLeft=1.4;
  switch(id) {
    case 'sword-lunge':
      hazard(game,e,'beam',{angle,range:225,width:30,damage:0,age:-1,duration:.75});
      e.pending={kind:'charge',time:1,angle};e.castLeft=1;break;
    case 'eclipse-cleave':
      for(let i=0;i<2;i++)hazard(game,e,'sector',{angle:angle+i*Math.PI,range:145,half:1.2,age:-.9-i*.55,duration:.22});
      e.castLeft=1.8;break;
    case 'rune-triad':
      for(let i=0;i<3;i++){const a=angle+i*Math.PI*2/3;hazard(game,e,'circle',{x:p.x+Math.cos(a)*48,y:p.y+Math.sin(a)*48,radius:35,age:-1-i*.28,duration:.3});}
      e.castLeft=1.9;break;
    case 'arcane-star':volley(game,e,Array.from({length:8},(_,i)=>angle+i*Math.PI/4));break;
    case 'split-prism':
      for(const offset of [-.48,0,.48])hazard(game,e,'beam',{angle:angle+offset,range:360,width:9,age:-1.15,duration:.5});
      e.castLeft=1.7;break;
    case 'crystal-burst':volley(game,e,Array.from({length:6},(_,i)=>angle+i*Math.PI/3),'crystal',175);break;
    case 'shield-wave':
      hazard(game,e,'beam',{angle,range:300,width:28,age:-1.1,duration:.35});e.castLeft=1.5;break;
    case 'siege-hammer':
      hazard(game,e,'circle',{x:p.x,y:p.y,radius:60,age:-1.2,duration:.25});
      hazard(game,e,'ring',{x:p.x,y:p.y,radius:60,rate:90,width:10,age:-1.5,duration:1.3,damage:e.damage*.75});
      e.castLeft=1.8;break;
    case 'antler-quake':
      hazard(game,e,'ring',{radius:65,rate:130,width:15,age:-1,duration:1.6});break;
    case 'antler-leap':leap(game,e,p);break;
    case 'acid-pool':
      hazard(game,e,'web',{x:p.x,y:p.y,radius:66,age:-1.2,duration:3.2,damage:e.damage*.65});e.ability=4.6;break;
    case 'bomb-carpet':
      for(let i=0;i<4;i++)hazard(game,e,'circle',{x:e.x+Math.cos(angle)*(65+i*65),y:e.y+Math.sin(angle)*(65+i*65),radius:38,age:-.95-i*.3,duration:.25});
      e.castLeft=2.2;e.ability=4.4;break;
    case 'web-cross':
      for(let i=0;i<2;i++){const a=angle+i*Math.PI/2;hazard(game,e,'beam',{x:p.x-Math.cos(a)*140,y:p.y-Math.sin(a)*140,angle:a,range:280,width:14,age:-1.15,duration:2,damage:e.damage*.65});}
      e.ability=4.6;break;
    case 'venom-fan':volley(game,e,[-.6,-.3,0,.3,.6].map(a=>angle+a),'venom',125);break;
    case 'implosion':
      hazard(game,e,'ring',{radius:220,rate:-75,width:12,age:-1.2,duration:2.4});e.ability=4.5;break;
    case 'echo-triangle':
      for(let i=0;i<3;i++){const a=angle+i*Math.PI*2/3;hazard(game,e,'ring',{x:p.x+Math.cos(a)*100,y:p.y+Math.sin(a)*100,radius:20,rate:65,width:8,age:-1.2-i*.4,duration:1.4,damage:e.damage*.8});}
      e.castLeft=2.1;e.ability=4.6;break;
    case 'twin-scythes':volley(game,e,[angle-.35,angle+.35],'scythe',190);break;
    case 'wing-cut':
      for(const side of [-1,1])hazard(game,e,'sector',{angle:angle+side*Math.PI/2,range:180,half:.85,age:-1,duration:.45});break;
    case 'fire-trail':
      for(let i=0;i<3;i++)hazard(game,e,'web',{x:e.x+Math.cos(angle)*(70+i*65),y:e.y+Math.sin(angle)*(70+i*65),radius:36,age:-1-i*.25,duration:2,damage:e.damage*.7});
      e.castLeft=1.9;e.ability=4.2;break;
    case 'ember-pounce':leap(game,e,p,'web');e.ability=4.2;break;
    case 'storm-cross':
      for(let i=0;i<2;i++){const a=angle+Math.PI/4+i*Math.PI/2;hazard(game,e,'beam',{x:p.x-Math.cos(a)*180,y:p.y-Math.sin(a)*180,angle:a,range:360,width:13,age:-1.1,duration:.35});}
      e.castLeft=1.5;break;
    case 'lightning-cage':
      for(let i=0;i<6;i++){const a=i*Math.PI/3;hazard(game,e,'lightning',{x:p.x+Math.cos(a)*110,y:p.y+Math.sin(a)*110,radius:25,age:-1.25,duration:.25});}
      hazard(game,e,'lightning',{x:p.x,y:p.y,radius:48,age:-1.9,duration:.25});e.castLeft=2.2;e.ability=4.5;break;
    case 'royal-quake':
      for(let i=0;i<2;i++)hazard(game,e,'ring',{radius:70,rate:110,width:12,age:-1-i*.8,duration:2});
      e.castLeft=2.1;e.ability=4.2;break;
    case 'judgment':
      for(let i=0;i<4;i++)hazard(game,e,'beam',{angle:angle+i*Math.PI/2,range:310,width:20,age:-1.2,duration:.55});
      hazard(game,e,'lightning',{x:p.x,y:p.y,radius:52,age:-2,duration:.35});e.castLeft=2.4;e.ability=4.6;break;
  }
}
function finalPhaseFor(e) {
  const ratio=e.hp/e.maxHp;
  return ratio<=.35?3:ratio<=.7?2:1;
}
function finalCombo(game,e,phase,angle) {
  if(phase<2)return;
  const p=game.player;
  // Phase II layers delayed infernal marks over the king's primary attack.
  for(let i=0;i<3;i++){
    const a=angle+i*Math.PI*2/3,r=phase>=3?82:68;
    hazard(game,e,'lightning',{
      x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r,radius:phase>=3?31:27,
      age:-1.05-i*.26,duration:.24,damage:e.damage*(phase>=3?.58:.48)
    });
  }
  if(phase<3)return;
  // Phase III adds a readable expanding ring and two locked lanes, leaving escape wedges.
  hazard(game,e,'ring',{radius:52,rate:105,width:9,age:-1.2,duration:2.1,damage:e.damage*.5});
  for(const offset of [-.62,.62]){
    hazard(game,e,'beam',{angle:angle+offset,range:310,width:12,age:-1.25,duration:.32,damage:e.damage*.46});
  }
}

function release(game, e, action) {
  if (action.kind === 'magic') for(let i=-1;i<=1;i++)projectile(game,e,action.angle+i*.26);
  if (action.kind === 'scythe') projectile(game,e,action.angle,'scythe',210);
  if (action.kind === 'charge') {e.charge=action.duration??.75;e.vx=Math.cos(action.angle)*(action.speed??285);e.vy=Math.sin(action.angle)*(action.speed??285);}
  if (action.kind === 'volley') for(const angle of action.angles)projectile(game,{...e,x:action.x,y:action.y},angle,action.projectileKind,action.speed,action.damage);
  if (action.kind === 'leap') e.leap={...action,age:0,duration:.35};
}
export function stepBoss(game, e, dt, distance) {
  const p=game.player;
  if(e.finalBoss){const phase=finalPhaseFor(e);if(phase!==(e.finalPhase||1)){e.finalPhase=phase;game.emit('finalPhase',{phase});}}
  if(e.leap) {
    e.leap.age=Math.min(e.leap.duration,e.leap.age+dt);
    const t=e.leap.age/e.leap.duration;
    e.x=e.leap.fromX+(e.leap.x-e.leap.fromX)*t;e.y=e.leap.fromY+(e.leap.y-e.leap.fromY)*t;
    if(t>=1)e.leap=null;
    return true;
  }
  if(e.bossProfile==='prism') {
    const before=e.sinceHit;e.sinceHit+=dt;
    const healTime=Math.max(0,e.sinceHit-Math.max(3,before));
    e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.018*healTime);
  }
  if(e.pending) {e.pending.time-=dt;if(e.pending.time<=0){release(game,e,e.pending);e.pending=null;}}
  e.castLeft=Math.max(0,(e.castLeft||0)-dt);
  if(e.charge>0)return false;
  if(e.castLeft>0)return true;
  e.ability-=dt;
  const index=e.attackIndex||0;
  const melee=index===0&&(e.bossProfile==='bastion'||(e.bossProfile==='twins'&&e.bossPart==='blade'));
  if(e.ability>0||distance>(melee?135:330))return false;
  const angle=Math.atan2(p.y-e.y,p.x-e.x);
  e.ability=3.4;e.castLeft=1.1;
  const key=e.finalBoss?'king':e.bossProfile==='twins'?e.bossPart:e.bossProfile;
  const originalCount=e.finalBoss?3:1;
  e.attackIndex=(index+1)%(originalCount+2);
  if(index>=originalCount){
    e.lastAttack=EXTRA_ATTACKS[key][index-originalCount];
    extraAttack(game,e,e.lastAttack,angle);
    if(e.finalBoss){const phase=finalPhaseFor(e);finalCombo(game,e,phase,angle);e.ability=phase===3?2.15:phase===2?2.55:3.15;}
    return true;
  }
  e.lastAttack=e.finalBoss?['charge','ring','burst'][index]:'original';
  if(e.finalBoss){
    const phase=finalPhaseFor(e);
    if(index===0){
      const speed=230+Math.min(70,e.bossLevel*3);
      hazard(game,e,'beam',{angle,range:speed*.65,width:43,damage:0,age:-1,duration:.65});
      e.pending={kind:'charge',time:1,angle,speed,duration:.65};e.castLeft=1;
    }else if(index===1){
      const count=Math.min(16,8+Math.floor(e.bossLevel/5));
      volley(game,e,Array.from({length:count},(_,i)=>i/count*Math.PI*2),'magic',115,Math.max(14,e.damage*.65));
    }else volley(game,e,[-2,-1,0,1,2].map(i=>angle+i*.16),'magic',145,Math.max(14,e.damage*.72));
    finalCombo(game,e,phase,angle);
    e.ability=phase===3?2.15:phase===2?2.55:3.15;return true;
  }
  switch(e.bossProfile) {
    case 'twins':
      if(e.bossPart==='blade')hazard(game,e,'sector',{range:115,half:1.05,angle});
      else {hazard(game,e,'beam',{range:390,width:7,damage:0,duration:.1,angle});e.pending={kind:'magic',time:.85,angle};}
      break;
    case 'prism':
      hazard(game,e,'beam',{range:420,width:12,age:-1,duration:.7,angle});e.castLeft=1.7;e.ability=3.8;
      break;
    case 'bastion':
      hazard(game,e,'circle',{radius:100,duration:.22});e.ability=3;
      break;
    case 'antler':
      hazard(game,e,'beam',{range:250,width:32,damage:0,age:-.9,duration:.75,angle});
      e.pending={kind:'charge',time:.9,angle};e.castLeft=.9;e.ability=3.2;
      break;
    case 'mortar':
      for(let i=0;i<3;i++)hazard(game,e,'circle',{x:p.x+(i-1)*70,y:p.y+(i%2)*55,radius:44,age:-1.1-i*.22,duration:.3});
      e.castLeft=1.8;e.ability=4.4;break;
    case 'weaver':
      for(let i=0;i<3;i++){const a=angle+(i-1)*1.4;hazard(game,e,'web',{x:p.x+Math.cos(a)*65,y:p.y+Math.sin(a)*65,radius:39,age:-1,duration:3,damage:e.damage*.65});}
      e.castLeft=1;e.ability=4.6;break;
    case 'bell':
      hazard(game,e,'ring',{radius:48,rate:100,width:12,age:-1,duration:2.4});e.castLeft=1.2;e.ability=4.3;break;
    case 'reaper':
      hazard(game,e,'beam',{range:270,width:16,damage:0,age:-.85,duration:.1,angle});e.pending={kind:'scythe',time:.85,angle};e.ability=3.8;break;
    case 'ember':
      hazard(game,e,'sector',{range:180,half:.62,age:-1,duration:1.3,angle,damage:e.damage*.7});e.castLeft=2.3;e.ability=3.6;break;
    case 'storm':
      for(let i=0;i<3;i++)hazard(game,e,'lightning',{x:p.x+(i-1)*68,y:p.y-(i%2)*60,radius:33,age:-.9-i*.35,duration:.25});
      e.castLeft=1.9;e.ability=4;break;
  }
  return true;
}
export function hazardContains(h, p) {
  const dx=p.x-h.x,dy=p.y-h.y,d=Math.hypot(dx,dy);
  if(h.kind==='beam') {const along=dx*Math.cos(h.angle)+dy*Math.sin(h.angle),side=-dx*Math.sin(h.angle)+dy*Math.cos(h.angle);return along>=-13&&along<=h.range+13&&Math.abs(side)<h.width+13;}
  if(h.kind==='sector') {const angle=Math.atan2(Math.sin(Math.atan2(dy,dx)-h.angle),Math.cos(Math.atan2(dy,dx)-h.angle));return d<h.range+13&&(d<13||Math.abs(angle)<h.half);}
  if(h.kind==='ring')return Math.abs(d-(h.radius+Math.max(0,h.age)*h.rate))<h.width+13;
  return d<h.radius+13;
}
export function stepHazards(game, dt) {
  game.hazards=game.hazards.filter(h=>game.enemies.some(e=>e.id===h.ownerId&&e.hp>0));
  for(const h of game.hazards) {
    h.age+=dt;
    if(h.age>=0&&h.age<=h.duration&&h.damage>0&&hazardContains(h,game.player))game.hurt(h.damage);
    if(game.state!=='playing')return;
  }
  game.hazards=game.hazards.filter(h=>h.age<=h.duration);
}
export function stepBossShot(game,s,dt) {
  if(!s.ownerId)return;
  const owner=game.enemies.find(e=>e.id===s.ownerId&&e.hp>0);
  if(!owner){s.life=0;return;}
  s.age+=dt;
  if(s.kind==='scythe'&&s.age>.8) {
    const dx=owner.x-s.x,dy=owner.y-s.y,d=Math.hypot(dx,dy)||1;
    s.vx=dx/d*230;s.vy=dy/d*230;if(d<owner.r)s.life=0;
  }
}
