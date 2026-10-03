import { spawnBoss, bossHit, stepBoss, stepHazards, stepBossShot, bossHealthMultiplier } from './bosses.js';
import { enemyRoster, enemyDefinition, enemyEvolutionTier, enemyAttackStyle, enemyAttackOptions } from './enemies.js';
// Deterministic, rendering-independent simulation. All time is active play time.
export const BOSS_TIME = 600;
export const ATTACK_COOLDOWN = .25;
export const FINAL_ARENA_RADIUS = 285;
const INITIAL_HP = 100;
export const UPGRADES = [
  {id:'power', icon:'⚔', name:['Filo salvaje','Wild edge'], desc:['+22% de daño en todos los ataques.','+22% damage to all attacks.'], max:8},
  {id:'twin', icon:'⚔', name:['Colmillo gemelo','Twin fang'], desc:['Cada ataque lanza dos espadazos.','Each attack unleashes two sword slashes.'], max:1},
  {id:'vitality', icon:'♥', name:['Corazón indomable','Wild heart'], desc:['+25 de vida máxima y cura 35.','+25 maximum health and heal 35.'], max:6},
  {id:'armor', icon:'⬡', name:['Armadura de corteza','Bark armor'], desc:['Reduce el daño: divisor +0,18 por rango.','Reduce damage: divisor +0.18 per rank.'], max:6},
  {id:'reach', icon:'⤢', name:['Espada colosal','Colossal sword'], desc:['+18% de alcance y un arco más amplio.','+18% reach and a wider slash.'], max:5},
  {id:'speed', icon:'➶', name:['Patas ligeras','Light paws'], desc:['+12% de velocidad de movimiento.','+12% movement speed.'], max:5},
  {id:'magnet', icon:'✦', name:['Imán de almas','Soul magnet'], desc:['+45% de radio para recoger experiencia.','+45% experience pickup radius.'], max:4},
  {id:'regen', icon:'✚', name:['Instinto vital','Healing instinct'], desc:['Regenera 0,7 puntos de vida por segundo.','Regenerate 0.7 health per second.'], max:4},
  {id:'orbit', icon:'✧', name:['Cuchillas lunares','Moon blades'], desc:['Añade una cuchilla que orbita a tu alrededor.','Add a blade that orbits around you.'], max:4},
  {id:'lightning', icon:'ϟ', name:['Tormenta salvaje','Wild storm'], desc:['Rayos a 2 objetivos; +1 por rango posterior.','Lightning hits 2 targets; +1 per later rank.'], max:4},
  {id:'frost', icon:'❄', name:['Aliento de invierno','Winter breath'], desc:['Aura que daña y ralentiza. Mejora su radio.','A damaging, slowing aura. Upgrade its radius.'], max:4},
  {id:'leech', icon:'♦', name:['Colmillo carmesí','Crimson fang'], desc:['Cada baja tiene un 20% de curarte 2 de vida.','Each kill has a 20% chance to heal 2 health.'], max:3}
];
export const xpNeeded = level => Math.round(6 + level * 3 + level * level * .12);
export const mutationFor = level => enemyEvolutionTier(0,level);
export const ferretEvolutionFor = level => Number(level)>=30?3:Number(level)>=20?2:Number(level)>=10?1:0;
export const spawnRateFor = (level,time=0) => {
  const l=Math.max(1,Number(level)||1);
  const early=Math.min(14,l-1),mid=Math.min(15,Math.max(0,l-15)),late=Math.max(0,l-30);
  return Math.min(7.5,.82+early*.105+mid*.08+late*.105+Math.min(600,Math.max(0,Number(time)||0))*.0026);
};
export const spawnIntervalFor = (level,time=0) => 1/spawnRateFor(level,time);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const TAU = Math.PI * 2;
const CROWD_SECTORS = 8;
const CROWD_CELL = 56;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const SPECIAL_RANGES = {jump:220,fan:280,burst:110,lunge:175,shot:330,ram:195,explode:115};
const AIM_ERROR = {
  jump:{min:46,max:92},
  fan:{min:38,max:96},
  lunge:{min:16,max:42},
  shot:{min:24,max:70},
  ram:{min:22,max:56},
};
export class Game {
  constructor(random = Math.random) { this.random=random; this.reset(); }
  reset() {
    this.state='playing'; this.time=0; this.level=1; this.xp=0; this.kills=0;
    this.player={x:0,y:0,hp:INITIAL_HP,maxHp:INITIAL_HP,face:-Math.PI/2,invuln:0};
    this.upgrades={}; this.enemies=[]; this.gems=[]; this.pickups=[]; this.particles=[]; this.shots=[]; this.effects=[]; this.combatTexts=[];
    this.manualAttackCooldown=0; this.hazards=[]; this.lastBossType=null;
    this.spawnTimer=.5; this.pickupTimer=5; this.stormTimer=2; this.auraTimer=0;
    this.mutation=0; this.bossSpawned=false; this.boss=null; this.lastLevelBoss=0; this.choices=[];
    this.worldDepth=0; this.descentPlan=[this.random()<.5?5:10,15,30]; this.cave=null; this.defeatedBossLevels=[];
    this.finalArena=false; this.finalGateOpened=false;
    this.speedBoostTimer=0; this.fireTimer=0; this.healTextPending=0; this.healTextTimer=0; this.events=[]; this.nextId=1; this.shake=0;
  }
  rank(id) {return this.upgrades[id]||0;}
  get damage() {return 20*(1+.22*this.rank('power'))*(this.fireTimer>0?1.35:1);}
  get reach() {return 98*(1+.18*this.rank('reach'));}
  get speed() {return 124*(1+.12*this.rank('speed'))*(this.speedBoostTimer>0?1.1:1);}
  get pickup() {return 56*(1+.45*this.rank('magnet'));}
  get nextDescentLevel() {return this.descentPlan[this.worldDepth]??null;}
  get canEnterCave() {return !!this.cave&&Math.hypot(this.player.x-this.cave.x,this.player.y-this.cave.y)<=70;}
  get finalBossPhase() {if(!this.boss?.finalBoss)return 0;const ratio=this.boss.hp/this.boss.maxHp;return ratio<=.35?3:ratio<=.7?2:1;}
  openCave(level) {
    if(this.cave||this.worldDepth>=3||level!==this.nextDescentLevel)return false;
    const angle=(level*GOLDEN_ANGLE+this.worldDepth*1.71)%TAU,distance=245,p=this.player;
    this.cave={x:p.x+Math.cos(angle)*distance,y:p.y+Math.sin(angle)*distance,targetDepth:this.worldDepth+1,level};
    this.emit('caveOpen',{level,depth:this.cave.targetDepth});return this.cave;
  }
  tryOpenCave() {
    const level=this.nextDescentLevel;
    return level!=null&&this.defeatedBossLevels.includes(level)?this.openCave(level):false;
  }
  openFinalGate() {
    if(this.finalArena||this.finalGateOpened||this.bossSpawned)return false;
    const p=this.player,angle=(this.time*.013+1.7)%TAU,distance=225;
    this.cave={x:p.x+Math.cos(angle)*distance,y:p.y+Math.sin(angle)*distance,final:true};
    this.finalGateOpened=true;this.emit('finalGateOpen');return this.cave;
  }
  enterFinalArena() {
    if(this.state!=='playing'||!this.cave?.final||!this.canEnterCave)return false;
    this.finalArena=true;this.cave=null;
    this.enemies=[];this.gems=[];this.pickups=[];this.particles=[];this.shots=[];this.effects=[];this.combatTexts=[];this.hazards=[];
    this.healTextPending=0;this.healTextTimer=0;
    this.boss=null;this.lastBossType=null;this.spawnTimer=3.4;this.pickupTimer=999;
    this.player.x=0;this.player.y=155;this.player.face=-Math.PI/2;
    const king=this.spawn('chicken',true,this.level,true);
    king.x=0;king.y=-95;king.r=54;king.speed=Math.max(36,king.speed*.92);king.damage*=.92;
    king.maxHp*=1.18;king.hp=king.maxHp;king.bossType='final_king';king.bossProfile='king';king.bossTheme=4;king.bossForm='underworld_king';
    king.encounterId=king.id;king.encounterMaxHp=king.maxHp;king.ability=1.2;king.attackIndex=0;king.finalPhase=1;
    this.emit('finalArenaEnter');return king;
  }
  debugFinalArena() {
    if(this.state==='dead'||this.state==='won')return false;
    this.finalGateOpened=true;this.cave={x:this.player.x,y:this.player.y,final:true};
    return this.enterFinalArena();
  }

  enterCave() {
    if(this.state!=='playing'||!this.canEnterCave)return false;
    if(this.cave.final)return this.enterFinalArena();
    this.worldDepth=this.cave.targetDepth;this.cave=null;this.mutation=enemyEvolutionTier(this.worldDepth,this.level);
    this.enemies=[];this.gems=[];this.pickups=[];this.particles=[];this.shots=[];this.effects=[];this.combatTexts=[];this.hazards=[];
    this.healTextPending=0;this.healTextTimer=0;
    this.boss=null;this.lastBossType=null;this.spawnTimer=.15;this.pickupTimer=5;
    this.player.x=0;this.player.y=0;this.player.face=-Math.PI/2;
    this.emit('worldDescent',{depth:this.worldDepth});this.tryOpenCave();return this.worldDepth;
  }
  debugSetLevel(value) {
    if(this.state==='dead'||this.state==='won')return false;
    const level=clamp(Math.round(Number(value)||1),1,99);
    this.level=level;this.xp=0;this.lastLevelBoss=Math.floor(level/5)*5;
    this.worldDepth=level>=30?3:level>=15?2:level>=this.descentPlan[0]?1:0;this.mutation=enemyEvolutionTier(this.worldDepth,level);this.cave=null;this.defeatedBossLevels=[];this.finalArena=false;this.finalGateOpened=false;
    this.choices=[];if(this.state==='levelup')this.state='playing';
    // Level jumps start a clean combat scenario; fresh spawns use the selected tier/world.
    this.enemies=[];this.gems=[];this.pickups=[];this.particles=[];this.effects=[];this.combatTexts=[];this.hazards=[];this.shots=[];this.boss=null;this.lastBossType=null;this.healTextPending=0;this.healTextTimer=0;
    return level;
  }
  debugSetUpgrade(id,value) {
    if(!['power','regen'].includes(id))return false;
    const upgrade=UPGRADES.find(u=>u.id===id),rank=clamp(Math.round(Number(value)||0),0,upgrade.max);
    this.upgrades[id]=rank;return rank;
  }
  debugHeal() {this.player.hp=this.player.maxHp;return true;}
  debugSpawnBoss() {return this.state==='playing'?spawnBoss(this,null,this.level):null;}
  gainXp(amount) {this.xp=Math.round((this.xp+amount)*10)/10;}
  emit(type,data={}) {this.events.push({type,...data});}
  addEffect(effect) {if(this.effects.length<140)this.effects.push(effect);}
  addCombatText(kind,amount,x,y,targetId=null) {
    amount=Math.max(0,Number(amount)||0);if(amount<=0)return false;
    const existing=this.combatTexts.find(t=>t.kind===kind&&t.targetId===targetId&&t.merge>0);
    if(existing){
      existing.amount+=amount;existing.x=x;existing.y=y;existing.life=existing.max;existing.merge=.22;return existing;
    }
    if(this.combatTexts.length>=10){
      let oldest=0;
      for(let i=1;i<this.combatTexts.length;i++)if(this.combatTexts[i].life<this.combatTexts[oldest].life)oldest=i;
      this.combatTexts.splice(oldest,1);
    }
    const text={kind,amount,x,y,targetId,life:.68,max:.68,merge:.22};
    this.combatTexts.push(text);return text;
  }
  flushHealText() {
    if(this.healTextPending<=.05)return false;
    const amount=this.healTextPending;this.healTextPending=0;this.healTextTimer=0;
    return this.addCombatText('heal',amount,this.player.x,this.player.y-22,'player');
  }
  heal(amount,immediate=false) {
    const p=this.player,actual=Math.max(0,Math.min(Number(amount)||0,p.maxHp-p.hp));
    if(actual<=0)return 0;
    p.hp+=actual;this.healTextPending+=actual;
    if(immediate)this.flushHealText();
    else if(this.healTextTimer<=0)this.healTextTimer=.9;
    return actual;
  }
  chooseSpawnAngle() {
    const counts=Array(CROWD_SECTORS).fill(0),p=this.player,sectorWidth=TAU/CROWD_SECTORS;
    for(const e of this.enemies){
      if(e.hp<=0||e.boss||e.shieldOwnerId)continue;
      const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
      if(d<220||d>620)continue;
      const angle=(Math.atan2(dy,dx)+TAU)%TAU;
      counts[Math.floor(angle/sectorWidth)%CROWD_SECTORS]++;
    }
    const min=Math.min(...counts);
    const candidates=[];
    for(let i=0;i<CROWD_SECTORS;i++)if(counts[i]<=min+1)candidates.push(i);
    const sector=candidates[Math.floor(this.random()*candidates.length)]??0;
    return sector*sectorWidth+sectorWidth*.5+(this.random()-.5)*sectorWidth*.7;
  }
  spawn(kind,boss=false,bossLevel=this.level,finalBoss=false) {
    const a=boss?this.random()*TAU:this.chooseSpawnAngle(),spawnDepth=this.finalArena&&!boss?3:this.worldDepth;
    const d=this.finalArena&&!boss?235+this.random()*30:430+this.random()*90;
    const roster=enemyRoster(spawnDepth);
    kind=kind||roster[Math.floor(this.random()*roster.length)];
    const def=enemyDefinition(kind),tier=boss?this.mutation:enemyEvolutionTier(spawnDepth,this.level),growth=1+this.time/340;
    const maxHp=boss?(finalBoss?Math.max(3200,1400+bossLevel*95):520+bossLevel*105)*bossHealthMultiplier(bossLevel):def.hp*growth*(1+tier*.28);
    const id=this.nextId++,crowdAngle=id*GOLDEN_ANGLE,crowdRadius=8+(id*17)%23;
    const e={id,kind,x:this.player.x+Math.cos(a)*d,y:this.player.y+Math.sin(a)*d,
      hp:maxHp,maxHp,r:boss?43:def.r,tier,boss,bossLevel:boss?bossLevel:0,finalBoss,crowdAngle,crowdRadius,
      speed:boss?34+Math.min(10,bossLevel*.35):def.speed*(1+tier*.08),
      damage:boss?(finalBoss?Math.max(26,16+bossLevel):14+bossLevel*1.15):9+spawnDepth*2.2+tier*2+this.time/120,
      xpValue:def.xp,attackStyle:enemyAttackStyle(kind,tier),specialTier:def.specialTier??0,projectileKind:def.projectile||null,
      stainColor:def.stain,deathColor:def.death,worldDepth:spawnDepth,
      flash:0,slow:0,orbitCD:0,ability:2+this.random()*3,charge:0,vx:0,vy:0,specialAttack:null,
      special:boss?['charge','ring','burst'][Math.floor(this.random()*3)]:null};
    this.enemies.push(e);
    if(boss){
      this.boss=e;
      if(finalBoss)this.bossSpawned=true;
      this.emit('boss',{level:bossLevel,final:finalBoss});
    }
    return e;
  }
  spawnPickup(type) {
    const types=['meat','oil','fire'];type=type||types[Math.floor(this.random()*types.length)];
    const a=this.random()*Math.PI*2,d=100+this.random()*180;
    const item={id:this.nextId++,type,x:this.player.x+Math.cos(a)*d,y:this.player.y+Math.sin(a)*d,taken:false};
    this.pickups.push(item);return item;
  }
  mutate() {
    const tier=enemyEvolutionTier(this.worldDepth,this.level);
    if(tier<=this.mutation)return;
    this.mutation=tier;
    for(const e of this.enemies){
      if(e.boss||e.shieldOwnerId)continue;
      const ratio=e.hp/e.maxHp;e.maxHp*=1.28;e.hp=e.maxHp*ratio;e.speed*=1.08;e.tier=tier;e.damage+=2;
      e.attackStyle=enemyAttackStyle(e.kind,tier);
    }
    this.emit('mutation',{tier});
  }
  hit(e,damage,kx=0,ky=0) {
    if(this.state==='dead'||this.state==='won'||e.hp<=0)return;
    if(e.shielded){e.flash=.1;return;}
    const applied=Math.max(0,Math.min(Number(damage)||0,e.hp));
    e.hp-=damage;e.flash=.13;e.x+=kx;e.y+=ky;
    this.addCombatText('damage',applied,e.x,e.y-e.r-8,e.id);
    const rewarded=bossHit(this,e);
    if(e.hp>0||!rewarded)return;
    this.kills++;this.emit('kill');
    const value=e.finalBoss?100:e.boss?20:(e.xpValue??(e.kind==='chicken'?3:2));
    this.gainXp(value*.3);
    const dropped=Math.round(value*.7*10)/10;
    const xpGem=this.gems.length>=350?this.gems.find(g=>!g.heal&&!g.taken):null;
    if(this.gems.length<350||!xpGem)this.gems.push({x:e.x,y:e.y,value:dropped,heal:false});
    else xpGem.value=Math.round((xpGem.value+dropped)*10)/10;
    if(this.random()<.035)this.gems.push({x:e.x+7,y:e.y+5,value:15,heal:true});
    if(this.rank('leech')&&this.random()<.2)this.heal(2*this.rank('leech'),true);
    for(let i=0;i<8;i++){if(this.particles.length>=200)break;let a=this.random()*6.28;this.particles.push({x:e.x,y:e.y,vx:Math.cos(a)*(15+this.random()*65),vy:Math.sin(a)*(15+this.random()*65),life:.6+this.random()*.5,max:1.1,size:2+this.random()*4,color:e.deathColor});}
    this.addEffect({type:'blood',x:e.x,y:e.y,r:e.r,life:5,max:5,color:e.stainColor});
    if(e.boss&&!e.finalBoss){
      if(!this.defeatedBossLevels.includes(e.bossLevel))this.defeatedBossLevels.push(e.bossLevel);
      this.tryOpenCave();
    }
    if(e.finalBoss){this.state='won';this.emit('won');}
    else if(e.boss&&this.boss===e)this.boss=null;
  }
  attack(aimAngle=null) {
    if(this.state!=='playing')return;
    const p=this.player;let target=null,best=Infinity;
    for(const e of this.enemies){if(e.hp<=0)continue;let d=Math.hypot(e.x-p.x,e.y-p.y);if(d<best){best=d;target=e;}}
    const angle=aimAngle??(target?Math.atan2(target.y-p.y,target.x-p.x):p.face);
    const half=Math.min(2.5,1.35+this.rank('reach')*.13);
    this.addEffect({type:'slash',x:p.x,y:p.y,angle,half,r:this.reach,life:.23,max:.23,fire:this.fireTimer>0});
    this.emit('slash');
    for(const e of this.enemies){const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);const a=Math.atan2(Math.sin(Math.atan2(dy,dx)-angle),Math.cos(Math.atan2(dy,dx)-angle));if(d<this.reach+e.r&&Math.abs(a)<half+.15)this.hit(e,this.damage,dx/(d||1)*10,dy/(d||1)*10);if(this.state!=='playing')return;}
  }
  manualAttack() {
    if(this.state!=='playing'||this.manualAttackCooldown>0)return;
    this.manualAttackCooldown=ATTACK_COOLDOWN;
    this.automaticAttack();
  }
  automaticAttack() {
    if(this.state!=='playing')return;
    if(this.rank('twin')){this.attack();if(this.state==='playing')this.attack();}
    else this.attack();
  }
  chooseEnemySpecialStyle(e,distance) {
    if(distance>(SPECIAL_RANGES[e.attackStyle]||180))return null;
    const options=enemyAttackOptions(e.kind,e.tier).filter(style=>distance<=(SPECIAL_RANGES[style]||180));
    if(!options.length)return null;
    const primary=e.attackStyle,alternatives=options.filter(style=>style!==primary);
    let style=options.includes(primary)?primary:options[0];
    const count=e.specialCount||0;
    if(alternatives.length&&count===0&&e.id%4===0){
      style=alternatives[Math.floor(e.id/4)%alternatives.length];
    }else if(count>0&&alternatives.length&&this.random()<.38){
      const varied=options.filter(candidate=>candidate!==e.lastAttackKind);
      if(varied.length)style=varied[Math.floor(this.random()*varied.length)];
    }
    if(style===e.lastAttackKind&&(e.attackRepeat||0)>=2){
      const different=options.filter(candidate=>candidate!==e.lastAttackKind);
      if(different.length)style=different[Math.floor(this.random()*different.length)];
    }
    return style;
  }
  imperfectEnemyAim(e,p,style) {
    const error=AIM_ERROR[style];
    if(!error)return {x:p.x,y:p.y,angle:Math.atan2(p.y-e.y,p.x-e.x)};
    const personality=.85+(e.id%7)*.045;
    const radius=(error.min+(error.max-error.min)*this.random())*personality,offset=this.random()*TAU;
    const x=p.x+Math.cos(offset)*radius,y=p.y+Math.sin(offset)*radius;
    return {x,y,angle:Math.atan2(y-e.y,x-e.x)};
  }
  stepEnemySpecial(e,dt,distance) {
    const p=this.player;
    if(!e.attackStyle)return false;
    if(!e.specialAttack){
      e.ability=Math.max(0,e.ability-dt);
      if(e.tier<(e.specialTier??0)||e.ability>0)return false;
      const style=this.chooseEnemySpecialStyle(e,distance);
      if(!style)return false;
      const aim=this.imperfectEnemyAim(e,p,style),angle=aim.angle;
      if(style==='jump')e.specialAttack={kind:'jump',phase:'warning',time:.75,x:aim.x,y:aim.y,radius:31,angle,duration:.45};
      else if(style==='fan')e.specialAttack={kind:'fan',phase:'warning',time:.75,x:e.x,y:e.y,radius:30,angle,count:3,spread:.34+this.random()*.14,jitter:.055+this.random()*.055,projectileKind:e.projectileKind||'feather'};
      else if(style==='burst')e.specialAttack={kind:'burst',phase:'warning',time:.8,x:e.x,y:e.y,radius:65,angle};
      else if(style==='shot')e.specialAttack={kind:'shot',phase:'warning',time:.7,x:e.x,y:e.y,radius:24,angle,count:1,projectileKind:e.projectileKind||'bone'};
      else if(style==='explode')e.specialAttack={kind:'explode',phase:'warning',time:.88,x:e.x,y:e.y,radius:74,angle};
      else e.specialAttack={kind:style,phase:'warning',time:style==='ram'?.5:.58,x:aim.x,y:aim.y,radius:28,angle,duration:style==='ram'?.36:.4,hit:false};
      e.specialCount=(e.specialCount||0)+1;
      e.attackRepeat=style===e.lastAttackKind?(e.attackRepeat||0)+1:1;
      e.lastAttackKind=style;
      return true;
    }
    const a=e.specialAttack;a.time=Math.max(0,a.time-dt);
    if(a.phase==='jump'){
      const progress=1-a.time/a.duration;
      e.x=a.fromX+(a.x-a.fromX)*progress;e.y=a.fromY+(a.y-a.fromY)*progress;
      if(a.time>0)return true;
    }else if(a.phase==='dash'){
      const progress=1-a.time/a.duration;
      e.x=a.fromX+(a.x-a.fromX)*progress;e.y=a.fromY+(a.y-a.fromY)*progress;
      const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;
      if(!a.hit&&d<e.r+14){
        const landed=this.hurt(e.damage);
        if(a.kind==='ram'&&landed){p.x+=dx/d*34;p.y+=dy/d*34;}
        a.hit=true;
        if(this.state!=='playing')return true;
      }
      if(a.time>0)return true;
    }else{
      if(a.time>0)return true;
      if(a.kind==='jump'){a.phase='jump';a.time=a.duration;a.fromX=e.x;a.fromY=e.y;return true;}
      if(a.kind==='lunge'||a.kind==='ram'){
        const dx=a.x-e.x,dy=a.y-e.y,d=Math.hypot(dx,dy)||1,extra=a.kind==='ram'?65:45;
        a.x+=dx/d*extra;a.y+=dy/d*extra;a.phase='dash';a.time=a.duration;a.fromX=e.x;a.fromY=e.y;return true;
      }
    }
    if(a.kind==='fan'||a.kind==='shot'){
      const count=a.kind==='fan'?a.count:1;
      for(let i=0;i<count&&this.shots.length<150;i++){
        const spread=a.kind==='fan'?(a.spread??.3):0;
        const jitter=a.kind==='fan'?(this.random()-.5)*2*(a.jitter??0):0;
        const angle=a.angle+(i-(count-1)/2)*spread+jitter;
        const projectileKind=a.projectileKind||(a.kind==='fan'?'feather':e.projectileKind||'bone');
        this.shots.push({kind:projectileKind,x:e.x,y:e.y,vx:Math.cos(angle)*(a.kind==='fan'?120:150),vy:Math.sin(angle)*(a.kind==='fan'?120:150),life:3,damage:e.damage});
      }
    }else if(a.kind==='explode'){
      if(Math.hypot(p.x-e.x,p.y-e.y)<a.radius+13)this.hurt(e.damage*1.15);
      this.addEffect({type:'enemy-impact',x:e.x,y:e.y,r:a.radius,life:.32,max:.32,color:e.deathColor});
      e.hp=0;
    }else if(a.kind!=='lunge'&&a.kind!=='ram'){
      if(Math.hypot(p.x-a.x,p.y-a.y)<a.radius+13)this.hurt(e.damage);
      if(this.state!=='playing')return true;
      this.addEffect({type:'enemy-impact',x:a.x,y:a.y,r:a.radius,life:.25,max:.25,color:e.deathColor});
    }
    e.specialAttack=null;e.ability=5+this.random()*2;
    return true;
  }
  hurt(amount) {
    const p=this.player;if(p.invuln>0||this.state!=='playing')return false;
    // Armor has diminishing returns; damage always remains meaningful.
    const damage=Math.max(1,amount*100/(100+this.rank('armor')*18));
    p.hp-=damage;
    p.invuln=.65;this.shake=5;this.emit('hurt');
    if(p.hp<=0){p.hp=0;this.state='dead';this.emit('dead');}
    return true;
  }
  offer() {
    if(this.state==='dead'||this.state==='won')return;
    this.state='levelup';this.choices=UPGRADES.filter(u=>this.rank(u.id)<u.max);
    for(let i=this.choices.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.choices[i],this.choices[j]]=[this.choices[j],this.choices[i]];}
    this.choices=this.choices.slice(0,3);
    if(!this.choices.length)this.choices=[{id:'heal',icon:'♥',name:['Segundo aliento','Second wind'],desc:['Recupera toda tu vida.','Restore all health.'],max:Infinity}];
    this.emit('level');
  }
  checkLevel() {
    if(this.state!=='playing')return;
    if(this.xp>=xpNeeded(this.level)){
      this.xp=Math.round((this.xp-xpNeeded(this.level))*10)/10;this.level++;this.mutate();
      if(this.level%5===0&&this.level>this.lastLevelBoss){this.lastLevelBoss=this.level;spawnBoss(this,null,this.level);}
      this.offer();
    }
  }
  choose(id) {
    if(this.state!=='levelup'||!this.choices.some(u=>u.id===id))return false;
    const upgrade=UPGRADES.find(u=>u.id===id);
    if(id!=='heal'&&(!upgrade||this.rank(id)>=upgrade.max))return false;
    if(id==='heal')this.heal(this.player.maxHp,true);
    else{this.upgrades[id]=this.rank(id)+1;if(id==='vitality'){this.player.maxHp+=25;this.heal(35,true);}}
    this.choices=[];this.state='playing';this.checkLevel();return true;
  }
  step(dt,input={x:0,y:0}) {
    if(this.state!=='playing')return;
    dt=clamp(dt,0,.05);this.time+=dt;const p=this.player;
    this.manualAttackCooldown=Math.max(0,this.manualAttackCooldown-dt);
    p.invuln=Math.max(0,p.invuln-dt);this.shake=Math.max(0,this.shake-dt*20);
    this.speedBoostTimer=Math.max(0,this.speedBoostTimer-dt);this.fireTimer=Math.max(0,this.fireTimer-dt);
    this.heal(this.rank('regen')*.7*dt);
    this.healTextTimer=Math.max(0,this.healTextTimer-dt);if(this.healTextTimer<=0&&this.healTextPending>.05)this.flushHealText();
    let l=Math.hypot(input.x,input.y),nx=input.x/Math.max(1,l),ny=input.y/Math.max(1,l);
    p.x+=nx*this.speed*dt;p.y+=ny*this.speed*dt;if(l>.08)p.face=Math.atan2(ny,nx);
    if(this.finalArena){const d=Math.hypot(p.x,p.y);if(d>FINAL_ARENA_RADIUS-18){p.x=p.x/d*(FINAL_ARENA_RADIUS-18);p.y=p.y/d*(FINAL_ARENA_RADIUS-18);}}
    this.pickupTimer-=dt;if(this.pickupTimer<=0){this.pickupTimer=8+this.random()*5;if(this.pickups.length<8)this.spawnPickup();}
    if(this.time>=BOSS_TIME&&!this.bossSpawned&&!this.finalArena)this.openFinalGate();
    this.spawnTimer-=dt;
    if(this.spawnTimer<=0){
      if(this.finalArena){
        this.spawnTimer=4.2;
        const minions=this.enemies.filter(e=>!e.boss&&!e.shieldOwnerId&&e.hp>0).length;
        if(minions<4)this.spawn();
      }else{
        this.spawnTimer=spawnIntervalFor(this.level,this.time);
        if(this.enemies.length<170)this.spawn();
      }
    }
    const crowdNearPlayer=this.enemies.reduce((count,e)=>count+(!e.boss&&!e.shieldOwnerId&&e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<180?1:0),0);
    for(const e of this.enemies){
      if(e.hp<=0)continue;
      e.flash=Math.max(0,e.flash-dt);e.orbitCD=Math.max(0,e.orbitCD-dt);e.slow=Math.max(0,e.slow-dt);
      const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;
      let moveDx=dx,moveDy=dy,moveD=d;
      if(!e.boss&&!e.shieldOwnerId&&crowdNearPlayer>=6){
        const influence=clamp((220-d)/160,0,1);
        if(influence>0){
          const radius=(e.crowdRadius||0)*influence;
          const tx=p.x+Math.cos(e.crowdAngle||0)*radius,ty=p.y+Math.sin(e.crowdAngle||0)*radius;
          moveDx=tx-e.x;moveDy=ty-e.y;moveD=Math.hypot(moveDx,moveDy)||1;
        }
      }
      let speed=e.speed*(e.slow>0?.48:1);
      const usesSpecial=!e.boss&&!e.shieldOwnerId&&!!e.attackStyle;
      const busy=e.bossType||e.finalBoss?stepBoss(this,e,dt,d):usesSpecial&&this.stepEnemySpecial(e,dt,d);
      if(this.state!=='playing')return;
      if(busy)speed=0;
      if(e.charge>0){e.charge-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;}
      else{e.x+=moveDx/moveD*speed*dt;e.y+=moveDy/moveD*speed*dt;}
      if(this.finalArena){const ed=Math.hypot(e.x,e.y),limit=e.boss?FINAL_ARENA_RADIUS-48:FINAL_ARENA_RADIUS-25;if(ed>limit){e.x=e.x/ed*limit;e.y=e.y/ed*limit;}}
      else if(d>800&&!e.boss){const a=this.chooseSpawnAngle();e.x=p.x+Math.cos(a)*480;e.y=p.y+Math.sin(a)*480;}
      if(!busy&&d<e.r+13)this.hurt(e.damage);
      if(this.state!=='playing')return;
      if(this.rank('orbit')&&e.orbitCD<=0){for(let i=0;i<this.rank('orbit');i++){const a=this.time*2.5+i/this.rank('orbit')*Math.PI*2;const ox=p.x+Math.cos(a)*72,oy=p.y+Math.sin(a)*72;if(Math.hypot(e.x-ox,e.y-oy)<e.r+17){this.hit(e,this.damage*.65);if(this.state!=='playing')return;e.orbitCD=.35;break;}}}
    }
    // Soft crowd steering keeps hordes dense without letting sprites collapse into one stack.
    const grid=new Map();
    for(const e of this.enemies){
      if(e.hp<=0)continue;
      const gx=Math.floor(e.x/CROWD_CELL),gy=Math.floor(e.y/CROWD_CELL);
      for(let x=gx-1;x<=gx+1;x++)for(let y=gy-1;y<=gy+1;y++)for(const o of grid.get(x+','+y)||[]){
        const protectedE=!!(e.boss||e.shieldOwnerId),protectedO=!!(o.boss||o.shieldOwnerId);
        if(protectedE&&protectedO)continue;
        let dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy);
        const min=e.r+o.r+(protectedE||protectedO?6:12);
        if(d>=min)continue;
        if(d<.001){const a=(e.id-o.id)*GOLDEN_ANGLE;dx=Math.cos(a);dy=Math.sin(a);d=1;}
        const push=Math.min(8,(min-d)*.35),ux=dx/d,uy=dy/d;
        if(protectedE){o.x-=ux*push;o.y-=uy*push;}
        else if(protectedO){e.x+=ux*push;e.y+=uy*push;}
        else{const half=push*.5;e.x+=ux*half;e.y+=uy*half;o.x-=ux*half;o.y-=uy*half;}
      }
      const key=gx+','+gy;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(e);
    }
    this.stormTimer-=dt;if(this.rank('lightning')&&this.stormTimer<=0){this.stormTimer=2.8;let targets=this.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<350).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,this.rank('lightning')+1);for(const e of targets){this.addEffect({type:'bolt',x:e.x,y:e.y,life:.3,max:.3});this.hit(e,this.damage*2.1);if(this.state!=='playing')return;}if(targets.length)this.emit('storm');}
    this.auraTimer-=dt;if(this.rank('frost')&&this.auraTimer<=0){this.auraTimer=.6;let radius=65+this.rank('frost')*15;for(const e of this.enemies)if(Math.hypot(e.x-p.x,e.y-p.y)<radius){e.slow=1;this.hit(e,this.damage*.25*this.rank('frost'));if(this.state!=='playing')return;}}
    for(const s of this.shots){stepBossShot(this,s,dt);if(s.life<=0)continue;s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;if(Math.hypot(s.x-p.x,s.y-p.y)<17){this.hurt(s.damage||14);if(this.state!=='playing')return;s.life=0;}}
    this.shots=this.shots.filter(s=>s.life>0).slice(-150);
    stepHazards(this,dt);if(this.state!=='playing')return;
    for(const item of this.pickups){if(item.taken)continue;const d=Math.hypot(item.x-p.x,item.y-p.y);if(d<18){if(item.type==='meat')this.heal(3,true);if(item.type==='oil')this.speedBoostTimer=Math.max(this.speedBoostTimer,20);if(item.type==='fire')this.fireTimer=Math.max(this.fireTimer,15);item.taken=true;this.emit('item',{kind:item.type});}}
    this.pickups=this.pickups.filter(item=>!item.taken);
    for(const g of this.gems){let dx=p.x-g.x,dy=p.y-g.y,d=Math.hypot(dx,dy);if(d<this.pickup||g.attract){g.attract=true;const travel=Math.min(d,Math.max(300,this.speed*1.25)*dt);g.x+=dx/(d||1)*travel;g.y+=dy/(d||1)*travel;if(d-travel<16){if(g.heal)this.heal(g.value,true);else this.gainXp(g.value);g.taken=true;this.emit('pickup');}}}
    this.gems=this.gems.filter(g=>!g.taken);this.enemies=this.enemies.filter(e=>e.hp>0);
    for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);
    for(const t of this.combatTexts){t.life-=dt;t.merge=Math.max(0,t.merge-dt);}this.combatTexts=this.combatTexts.filter(t=>t.life>0);
    for(const q of this.particles){q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.95;q.vy*=.95;}this.particles=this.particles.filter(q=>q.life>0);
    if(this.state==='playing')this.checkLevel();
  }
}
