import { spawnBoss, bossHit, stepBoss, stepHazards, stepBossShot, bossHealthMultiplier } from './bosses.js';
// Deterministic, rendering-independent simulation. All time is active play time.
export const BOSS_TIME = 600;
export const ATTACK_COOLDOWN = .25;
const INITIAL_HP = 100;
const SHIELD_STEP = INITIAL_HP * .2;
export const UPGRADES = [
  {id:'power', icon:'⚔', name:['Filo salvaje','Wild edge'], desc:['+22% de daño en todos los ataques.','+22% damage to all attacks.'], max:8},
  {id:'twin', icon:'⚔', name:['Colmillo gemelo','Twin fang'], desc:['Cada ataque lanza dos espadazos.','Each attack unleashes two sword slashes.'], max:1},
  {id:'vitality', icon:'♥', name:['Corazón indomable','Wild heart'], desc:['+25 de vida máxima y cura 35.','+25 maximum health and heal 35.'], max:6},
  {id:'armor', icon:'⬡', name:['Armadura de corteza','Bark armor'], desc:['Reduce el daño: divisor +0,18 por rango.','Reduce damage: divisor +0.18 per rank.'], max:6},
  {id:'shield', icon:'◇', name:['Escudo del claro','Glade shield'], desc:['+20 de escudo. Se recarga tras 6 s sin daño.','+20 shield. Recharges after 6 s without damage.'], max:5},
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
export const mutationFor = level => Math.min(3, Math.floor((level - 1) / 5));
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const TAU = Math.PI * 2;
const CROWD_SECTORS = 8;
const CROWD_CELL = 56;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
export class Game {
  constructor(random = Math.random) { this.random=random; this.reset(); }
  reset() {
    this.state='playing'; this.time=0; this.level=1; this.xp=0; this.kills=0;
    this.player={x:0,y:0,hp:INITIAL_HP,maxHp:INITIAL_HP,shield:SHIELD_STEP,shieldDelay:0,face:-Math.PI/2,invuln:0};
    this.upgrades={}; this.enemies=[]; this.gems=[]; this.pickups=[]; this.particles=[]; this.shots=[]; this.effects=[];
    this.manualAttackCooldown=0; this.hazards=[]; this.lastBossType=null;
    this.spawnTimer=.5; this.pickupTimer=5; this.stormTimer=2; this.auraTimer=0;
    this.mutation=0; this.bossSpawned=false; this.boss=null; this.lastLevelBoss=0; this.choices=[];
    this.speedBoostTimer=0; this.fireTimer=0; this.events=[]; this.nextId=1; this.shake=0;
  }
  rank(id) {return this.upgrades[id]||0;}
  get damage() {return 20*(1+.22*this.rank('power'))*(this.fireTimer>0?1.35:1);}
  get reach() {return 98*(1+.18*this.rank('reach'));}
  get speed() {return 124*(1+.12*this.rank('speed'))*(this.speedBoostTimer>0?1.1:1);}
  get pickup() {return 56*(1+.45*this.rank('magnet'));}
  get maxShield() {return SHIELD_STEP*(1+this.rank('shield'));}
  debugSetLevel(value) {
    if(this.state==='dead'||this.state==='won')return false;
    const level=clamp(Math.round(Number(value)||1),1,99);
    this.level=level;this.xp=0;this.mutation=mutationFor(level);this.lastLevelBoss=Math.floor(level/5)*5;
    this.choices=[];if(this.state==='levelup')this.state='playing';
    // Remove stale ordinary enemies so fresh spawns use the selected mutation tier.
    this.enemies=this.enemies.filter(e=>e.boss||e.shieldOwnerId);
    return level;
  }
  debugSetUpgrade(id,value) {
    if(!['power','regen'].includes(id))return false;
    const upgrade=UPGRADES.find(u=>u.id===id),rank=clamp(Math.round(Number(value)||0),0,upgrade.max);
    this.upgrades[id]=rank;return rank;
  }
  debugHeal() {this.player.hp=this.player.maxHp;this.player.shield=this.maxShield;return true;}
  debugSpawnBoss() {return this.state==='playing'?spawnBoss(this,null,this.level):null;}
  gainXp(amount) {this.xp=Math.round((this.xp+amount)*10)/10;}
  emit(type,data={}) {this.events.push({type,...data});}
  addEffect(effect) {if(this.effects.length<140)this.effects.push(effect);}
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
    const a=boss?this.random()*TAU:this.chooseSpawnAngle(), d=430+this.random()*90;
    const types=['rabbit','hare','quail','chicken'];
    kind=kind||types[Math.floor(this.random()*types.length)];
    const hpBase={rabbit:23,hare:18,quail:14,chicken:35};
    const speedBase={rabbit:29,hare:43,quail:37,chicken:24};
    const tier=this.mutation, growth=1+this.time/340;
    const maxHp=boss?(finalBoss?Math.max(3200,1400+bossLevel*95):520+bossLevel*105)*bossHealthMultiplier(bossLevel):hpBase[kind]*growth*(1+tier*.52);
    const id=this.nextId++,crowdAngle=id*GOLDEN_ANGLE,crowdRadius=8+(id*17)%23;
    const e={id,kind,x:this.player.x+Math.cos(a)*d,y:this.player.y+Math.sin(a)*d,
      hp:maxHp,maxHp,r:boss?43:kind==='quail'?12:17,tier,boss,bossLevel:boss?bossLevel:0,finalBoss,crowdAngle,crowdRadius,
      speed:boss?34+Math.min(10,bossLevel*.35):speedBase[kind]*(1+tier*.14),
      damage:boss?(finalBoss?Math.max(26,16+bossLevel):14+bossLevel*1.15):9+tier*3+this.time/120,
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
    const tier=mutationFor(this.level);
    if(tier<=this.mutation)return;
    this.mutation=tier;
    for(const e of this.enemies){if(e.boss||e.shieldOwnerId)continue;const ratio=e.hp/e.maxHp;e.maxHp*=1.42;e.hp=e.maxHp*ratio;e.speed*=1.14;e.tier=tier;e.damage+=3;}
    this.emit('mutation',{tier});
  }
  hit(e,damage,kx=0,ky=0) {
    if(this.state==='dead'||this.state==='won'||e.hp<=0)return;
    if(e.shielded){e.flash=.1;return;}
    e.hp-=damage;e.flash=.13;e.x+=kx;e.y+=ky;
    const rewarded=bossHit(this,e);
    if(e.hp>0||!rewarded)return;
    this.kills++;this.emit('kill');
    const value=e.finalBoss?100:e.boss?20:e.kind==='chicken'?3:2;
    this.gainXp(value*.3);
    const dropped=Math.round(value*.7*10)/10;
    const xpGem=this.gems.length>=350?this.gems.find(g=>!g.heal&&!g.taken):null;
    if(this.gems.length<350||!xpGem)this.gems.push({x:e.x,y:e.y,value:dropped,heal:false});
    else xpGem.value=Math.round((xpGem.value+dropped)*10)/10;
    if(this.random()<.035)this.gems.push({x:e.x+7,y:e.y+5,value:15,heal:true});
    if(this.rank('leech')&&this.random()<.2)this.player.hp=Math.min(this.player.maxHp,this.player.hp+2*this.rank('leech'));
    for(let i=0;i<8;i++){if(this.particles.length>=200)break;let a=this.random()*6.28;this.particles.push({x:e.x,y:e.y,vx:Math.cos(a)*(15+this.random()*65),vy:Math.sin(a)*(15+this.random()*65),life:.6+this.random()*.5,max:1.1,size:2+this.random()*4});}
    this.addEffect({type:'blood',x:e.x,y:e.y,r:e.r,life:5,max:5});
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
  stepEnemySpecial(e,dt,distance) {
    const p=this.player;
    if(!e.specialAttack){
      e.ability=Math.max(0,e.ability-dt);
      const radius=e.kind==='chicken'?65*(e.tier>=2?1.15:1):30;
      const range=e.kind==='chicken'?radius+35:e.kind==='rabbit'?220:280;
      if(e.tier<1||e.ability>0||distance>range)return false;
      // Lock the target when the warning starts; moving away always works.
      e.specialAttack={kind:e.kind,phase:'warning',time:e.kind==='chicken'?.8:.75,
        x:e.kind==='rabbit'?p.x:e.x,y:e.kind==='rabbit'?p.y:e.y,radius,
        angle:Math.atan2(p.y-e.y,p.x-e.x),count:e.tier>=2?5:3,
        duration:e.tier>=2?.34:.45};
      return true;
    }
    const a=e.specialAttack;
    a.time=Math.max(0,a.time-dt);
    if(a.phase==='jump'){
      const progress=1-a.time/a.duration;
      e.x=a.fromX+(a.x-a.fromX)*progress;e.y=a.fromY+(a.y-a.fromY)*progress;
      if(a.time>0)return true;
    }else{
      if(a.time>0)return true;
      if(a.kind==='rabbit'){
        a.phase='jump';a.time=a.duration;a.fromX=e.x;a.fromY=e.y;
        return true;
      }
    }
    if(a.kind==='quail'){
      for(let i=0;i<a.count&&this.shots.length<150;i++){
        const angle=a.angle+(i-(a.count-1)/2)*.3;
        this.shots.push({kind:'feather',x:a.x,y:a.y,vx:Math.cos(angle)*120,vy:Math.sin(angle)*120,life:3,damage:e.damage});
      }
    }else{
      if(Math.hypot(p.x-a.x,p.y-a.y)<a.radius+13)this.hurt(e.damage);
      if(this.state!=='playing')return true;
      this.addEffect({type:'enemy-impact',x:a.x,y:a.y,r:a.radius,life:.25,max:.25});
    }
    e.specialAttack=null;
    e.ability=(5+this.random()*2)/(e.tier>=3?1.15:1);
    return true;
  }
  hurt(amount) {
    const p=this.player;if(p.invuln>0||this.state!=='playing')return;
    // Armor has diminishing returns; damage always remains meaningful.
    const damage=Math.max(1,amount*100/(100+this.rank('armor')*18));
    const absorbed=Math.min(p.shield,damage);
    p.shield-=absorbed;p.hp-=damage-absorbed;p.shieldDelay=6;
    p.invuln=.65;this.shake=5;this.emit('hurt');
    if(p.hp<=0){p.hp=0;this.state='dead';this.emit('dead');}
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
      this.xp-=xpNeeded(this.level);this.level++;this.mutate();
      if(this.level%5===0&&this.level>this.lastLevelBoss){this.lastLevelBoss=this.level;spawnBoss(this,null,this.level);}
      this.offer();
    }
  }
  choose(id) {
    if(this.state!=='levelup'||!this.choices.some(u=>u.id===id))return false;
    const upgrade=UPGRADES.find(u=>u.id===id);
    if(id!=='heal'&&(!upgrade||this.rank(id)>=upgrade.max))return false;
    if(id==='heal')this.player.hp=this.player.maxHp;
    else{this.upgrades[id]=this.rank(id)+1;if(id==='vitality'){this.player.maxHp+=25;this.player.hp=Math.min(this.player.maxHp,this.player.hp+35);}if(id==='shield')this.player.shield+=SHIELD_STEP;}
    this.choices=[];this.state='playing';this.checkLevel();return true;
  }
  step(dt,input={x:0,y:0}) {
    if(this.state!=='playing')return;
    dt=clamp(dt,0,.05);this.time+=dt;const p=this.player;
    this.manualAttackCooldown=Math.max(0,this.manualAttackCooldown-dt);
    p.invuln=Math.max(0,p.invuln-dt);this.shake=Math.max(0,this.shake-dt*20);
    const rechargeTime=Math.max(0,dt-p.shieldDelay);
    p.shieldDelay=Math.max(0,p.shieldDelay-dt);
    p.shield=Math.min(this.maxShield,p.shield+this.maxShield*.1*rechargeTime);
    this.speedBoostTimer=Math.max(0,this.speedBoostTimer-dt);this.fireTimer=Math.max(0,this.fireTimer-dt);
    p.hp=Math.min(p.maxHp,p.hp+this.rank('regen')*.7*dt);
    let l=Math.hypot(input.x,input.y),nx=input.x/Math.max(1,l),ny=input.y/Math.max(1,l);
    p.x+=nx*this.speed*dt;p.y+=ny*this.speed*dt;if(l>.08)p.face=Math.atan2(ny,nx);
    this.pickupTimer-=dt;if(this.pickupTimer<=0){this.pickupTimer=8+this.random()*5;if(this.pickups.length<8)this.spawnPickup();}
    if(this.time>=BOSS_TIME&&!this.bossSpawned)this.spawn('chicken',true,this.level,true);
    this.spawnTimer-=dt;
    if(this.spawnTimer<=0){
      this.spawnTimer=Math.max(.24,1.35-this.time*.0018);
      const count=1+Math.floor(this.time/150);
      for(let i=0;i<count&&this.enemies.length<170;i++)this.spawn();
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
      const usesSpecial=!e.boss&&!e.shieldOwnerId&&e.kind!=='hare';
      const busy=e.bossType||e.finalBoss?stepBoss(this,e,dt,d):usesSpecial&&this.stepEnemySpecial(e,dt,d);
      if(this.state!=='playing')return;
      if(busy)speed=0;
      if(!usesSpecial&&!e.bossType&&!e.finalBoss&&!e.shieldOwnerId){
        e.ability-=dt;
        if(((e.boss&&e.special==='charge')||(!e.boss&&e.kind==='hare'&&e.tier>=1))&&e.ability<.65&&e.charge<=0)speed=0;
        if(e.ability<=0){
          if(e.boss){
            const special=e.special;e.ability=e.finalBoss?3.1:3.8;
            if(special==='charge'){e.charge=.65;e.vx=dx/d*(230+Math.min(70,e.bossLevel*3));e.vy=dy/d*(230+Math.min(70,e.bossLevel*3));}
            else if(special==='ring'){const n=Math.min(16,8+Math.floor(e.bossLevel/5));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;this.shots.push({x:e.x,y:e.y,vx:Math.cos(a)*115,vy:Math.sin(a)*115,life:5,damage:Math.max(14,e.damage*.65)});}}
            else{const base=Math.atan2(dy,dx);for(let i=-2;i<=2;i++){const a=base+i*.16;this.shots.push({x:e.x,y:e.y,vx:Math.cos(a)*145,vy:Math.sin(a)*145,life:4,damage:Math.max(14,e.damage*.72)});}}
            e.special=['charge','ring','burst'][Math.floor(this.random()*3)];
          }else{
            e.ability=4.5+this.random()*2;
            if(e.kind==='hare'&&e.tier>=1){e.charge=.65;e.vx=dx/d*230;e.vy=dy/d*230;}
          }
        }
      }
      if(e.charge>0){e.charge-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;}
      else{e.x+=moveDx/moveD*speed*dt;e.y+=moveDy/moveD*speed*dt;}
      if(d>800&&!e.boss){const a=this.chooseSpawnAngle();e.x=p.x+Math.cos(a)*480;e.y=p.y+Math.sin(a)*480;}
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
    for(const item of this.pickups){if(item.taken)continue;const d=Math.hypot(item.x-p.x,item.y-p.y);if(d<18){if(item.type==='meat')p.hp=Math.min(p.maxHp,p.hp+3);if(item.type==='oil')this.speedBoostTimer=Math.max(this.speedBoostTimer,20);if(item.type==='fire')this.fireTimer=Math.max(this.fireTimer,15);item.taken=true;this.emit('item',{kind:item.type});}}
    this.pickups=this.pickups.filter(item=>!item.taken);
    for(const g of this.gems){let dx=p.x-g.x,dy=p.y-g.y,d=Math.hypot(dx,dy);if(d<this.pickup||g.attract){g.attract=true;const travel=Math.min(d,Math.max(300,this.speed*1.25)*dt);g.x+=dx/(d||1)*travel;g.y+=dy/(d||1)*travel;if(d-travel<16){if(g.heal)p.hp=Math.min(p.maxHp,p.hp+g.value);else this.gainXp(g.value);g.taken=true;this.emit('pickup');}}}
    this.gems=this.gems.filter(g=>!g.taken);this.enemies=this.enemies.filter(e=>e.hp>0);
    for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);
    for(const q of this.particles){q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.95;q.vy*=.95;}this.particles=this.particles.filter(q=>q.life>0);
    if(this.state==='playing')this.checkLevel();
  }
}
