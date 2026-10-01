// Deterministic, rendering-independent simulation. All time is active play time.
export const BOSS_TIME = 600;
export const UPGRADES = [
  {id:'power', icon:'⚔', name:['Filo salvaje','Wild edge'], desc:['+22% de daño en todos los ataques.','+22% damage to all attacks.'], max:8},
  {id:'haste', icon:'»', name:['Furia del hurón','Ferret fury'], desc:['Ataca un 12% más rápido.','Attack 12% faster.'], max:6},
  {id:'vitality', icon:'♥', name:['Corazón indomable','Wild heart'], desc:['+25 de vida máxima y cura 35.','+25 maximum health and heal 35.'], max:6},
  {id:'armor', icon:'⬡', name:['Armadura de corteza','Bark armor'], desc:['+2 de armadura. Reduce el daño recibido.','+2 armor. Reduce incoming damage.'], max:6},
  {id:'reach', icon:'⤢', name:['Espada colosal','Colossal sword'], desc:['+18% de alcance y un arco más amplio.','+18% reach and a wider slash.'], max:5},
  {id:'speed', icon:'➶', name:['Patas ligeras','Light paws'], desc:['+12% de velocidad de movimiento.','+12% movement speed.'], max:5},
  {id:'magnet', icon:'✦', name:['Imán de almas','Soul magnet'], desc:['+45% de radio para recoger experiencia.','+45% experience pickup radius.'], max:4},
  {id:'regen', icon:'✚', name:['Instinto vital','Healing instinct'], desc:['Regenera 0,7 puntos de vida por segundo.','Regenerate 0.7 health per second.'], max:4},
  {id:'orbit', icon:'✧', name:['Cuchillas lunares','Moon blades'], desc:['Añade una cuchilla que orbita a tu alrededor.','Add a blade that orbits around you.'], max:4},
  {id:'lightning', icon:'ϟ', name:['Tormenta salvaje','Wild storm'], desc:['Rayos automáticos. Cada mejora añade un objetivo.','Automatic lightning. Each upgrade adds a target.'], max:4},
  {id:'frost', icon:'❄', name:['Aliento de invierno','Winter breath'], desc:['Aura que daña y ralentiza. Mejora su radio.','A damaging, slowing aura. Upgrade its radius.'], max:4},
  {id:'leech', icon:'♦', name:['Colmillo carmesí','Crimson fang'], desc:['Cada baja tiene un 20% de curarte 2 de vida.','Each kill has a 20% chance to heal 2 health.'], max:3}
];
export const xpNeeded = level => Math.round(6 + level * 3 + level * level * .12);
export const mutationFor = level => Math.min(3, Math.floor((level - 1) / 5));
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
export class Game {
  constructor(random = Math.random) { this.random=random; this.reset(); }
  reset() {
    this.state='playing'; this.time=0; this.level=1; this.xp=0; this.kills=0;
    this.player={x:0,y:0,hp:100,maxHp:100,face:-Math.PI/2,invuln:0};
    this.upgrades={}; this.enemies=[]; this.gems=[]; this.particles=[]; this.shots=[]; this.effects=[];
    this.cooldown=.35; this.spawnTimer=.5; this.stormTimer=2; this.auraTimer=0;
    this.mutation=0; this.bossSpawned=false; this.boss=null; this.choices=[];
    this.events=[]; this.nextId=1; this.shake=0;
  }
  rank(id) {return this.upgrades[id]||0;}
  get damage() {return 20*(1+.22*this.rank('power'));}
  get reach() {return 98*(1+.18*this.rank('reach'));}
  get speed() {return 124*(1+.12*this.rank('speed'));}
  get pickup() {return 43*(1+.45*this.rank('magnet'));}
  emit(type,data={}) {this.events.push({type,...data});}
  addEffect(effect) {if(this.effects.length<140)this.effects.push(effect);}
  spawn(kind,boss=false) {
    const a=this.random()*Math.PI*2, d=430+this.random()*90;
    const types=['rabbit','hare','quail','chicken'];
    kind=kind||types[Math.floor(this.random()*types.length)];
    const hpBase={rabbit:23,hare:18,quail:14,chicken:35};
    const speedBase={rabbit:29,hare:43,quail:37,chicken:24};
    const tier=this.mutation, growth=1+this.time/340;
    const maxHp=boss?3200:hpBase[kind]*growth*(1+tier*.52);
    const e={id:this.nextId++,kind,x:this.player.x+Math.cos(a)*d,y:this.player.y+Math.sin(a)*d,
      hp:maxHp,maxHp,r:boss?43:kind==='quail'?12:17,tier,boss,
      speed:boss?36:speedBase[kind]*(1+tier*.14),damage:boss?26:9+tier*3+this.time/120,
      flash:0,slow:0,orbitCD:0,ability:2+this.random()*4,charge:0,vx:0,vy:0};
    this.enemies.push(e);
    if(boss){this.boss=e;this.bossSpawned=true;this.emit('boss');}
    return e;
  }
  mutate() {
    const tier=mutationFor(this.level);
    if(tier<=this.mutation)return;
    this.mutation=tier;
    for(const e of this.enemies){if(e.boss)continue;const ratio=e.hp/e.maxHp;e.maxHp*=1.42;e.hp=e.maxHp*ratio;e.speed*=1.14;e.tier=tier;e.damage+=3;}
    this.emit('mutation',{tier});
  }
  hit(e,damage,kx=0,ky=0) {
    if(e.hp<=0)return;
    e.hp-=damage;e.flash=.13;e.x+=kx;e.y+=ky;
    if(e.hp>0)return;
    this.kills++;this.emit('kill');
    const value=e.boss?100:e.kind==='chicken'?3:2;
    if(this.gems.length<350)this.gems.push({x:e.x,y:e.y,value,heal:false});
    else {let g=this.gems[0];g.value+=value;}
    if(this.random()<.035)this.gems.push({x:e.x+7,y:e.y+5,value:15,heal:true});
    if(this.rank('leech')&&this.random()<.2)this.player.hp=Math.min(this.player.maxHp,this.player.hp+2*this.rank('leech'));
    for(let i=0;i<8;i++){if(this.particles.length>=200)break;let a=this.random()*6.28;this.particles.push({x:e.x,y:e.y,vx:Math.cos(a)*(15+this.random()*65),vy:Math.sin(a)*(15+this.random()*65),life:.6+this.random()*.5,max:1.1,size:2+this.random()*4});}
    this.addEffect({type:'blood',x:e.x,y:e.y,r:e.r,life:5,max:5});
    if(e.boss){this.state='won';this.emit('won');}
  }
  attack() {
    const p=this.player;let target=null,best=Infinity;
    for(const e of this.enemies){if(e.hp<=0)continue;let d=Math.hypot(e.x-p.x,e.y-p.y);if(d<best){best=d;target=e;}}
    const angle=target?Math.atan2(target.y-p.y,target.x-p.x):p.face;
    const half=Math.min(2.5,1.35+this.rank('reach')*.13);
    this.addEffect({type:'slash',x:p.x,y:p.y,angle,half,r:this.reach,life:.23,max:.23});
    this.emit('slash');
    for(const e of this.enemies){const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);const a=Math.atan2(Math.sin(Math.atan2(dy,dx)-angle),Math.cos(Math.atan2(dy,dx)-angle));if(d<this.reach+e.r&&Math.abs(a)<half+.15)this.hit(e,this.damage,dx/(d||1)*10,dy/(d||1)*10);}
  }
  hurt(amount) {
    const p=this.player;if(p.invuln>0||this.state!=='playing')return;
    // Armor has diminishing returns; damage always remains meaningful.
    p.hp-=Math.max(1,amount*100/(100+this.rank('armor')*18));p.invuln=.65;this.shake=5;this.emit('hurt');
    if(p.hp<=0){p.hp=0;this.state='dead';this.emit('dead');}
  }
  offer() {
    this.state='levelup';this.choices=UPGRADES.filter(u=>this.rank(u.id)<u.max);
    for(let i=this.choices.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.choices[i],this.choices[j]]=[this.choices[j],this.choices[i]];}
    this.choices=this.choices.slice(0,3);
    if(!this.choices.length)this.choices=[{id:'heal',icon:'♥',name:['Segundo aliento','Second wind'],desc:['Recupera toda tu vida.','Restore all health.'],max:Infinity}];
    this.emit('level');
  }
  checkLevel() {
    if(this.xp>=xpNeeded(this.level)){this.xp-=xpNeeded(this.level);this.level++;this.mutate();this.offer();}
  }
  choose(id) {
    if(this.state!=='levelup'||!this.choices.some(u=>u.id===id))return false;
    if(id==='heal')this.player.hp=this.player.maxHp;
    else{this.upgrades[id]=this.rank(id)+1;if(id==='vitality'){this.player.maxHp+=25;this.player.hp=Math.min(this.player.maxHp,this.player.hp+35);}}
    this.choices=[];this.state='playing';this.checkLevel();return true;
  }
  step(dt,input={x:0,y:0}) {
    if(this.state!=='playing')return;
    dt=clamp(dt,0,.05);this.time+=dt;const p=this.player;
    p.invuln=Math.max(0,p.invuln-dt);this.shake=Math.max(0,this.shake-dt*20);
    p.hp=Math.min(p.maxHp,p.hp+this.rank('regen')*.7*dt);
    let l=Math.hypot(input.x,input.y),nx=input.x/Math.max(1,l),ny=input.y/Math.max(1,l);
    p.x+=nx*this.speed*dt;p.y+=ny*this.speed*dt;if(l>.08)p.face=Math.atan2(ny,nx);
    if(this.time>=BOSS_TIME&&!this.bossSpawned)this.spawn('chicken',true);
    this.spawnTimer-=dt;
    if(this.spawnTimer<=0){
      this.spawnTimer=Math.max(.24,1.35-this.time*.0018);
      const count=1+Math.floor(this.time/150);
      for(let i=0;i<count&&this.enemies.length<170;i++)this.spawn();
    }
    this.cooldown-=dt;if(this.cooldown<=0){this.cooldown=.9*Math.pow(.88,this.rank('haste'));this.attack();}
    for(const e of this.enemies){
      if(e.hp<=0)continue;
      e.flash=Math.max(0,e.flash-dt);e.orbitCD=Math.max(0,e.orbitCD-dt);e.slow=Math.max(0,e.slow-dt);
      const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;let speed=e.speed*(e.slow>0?.48:1);
      e.ability-=dt;
      if((e.boss||e.kind==='hare'&&e.tier>=1)&&e.ability<.65&&e.charge<=0)speed=0;
      if(e.ability<=0){
        e.ability=e.boss?3.6:4.5+this.random()*2;
        if(e.boss||e.kind==='hare'&&e.tier>=1){e.charge=.65;e.vx=dx/d*230;e.vy=dy/d*230;}
        if(e.boss||e.kind==='chicken'&&e.tier>=2){
          const n=e.boss?10:1;for(let i=0;i<n;i++){const a=e.boss?i/n*Math.PI*2:Math.atan2(dy,dx);this.shots.push({x:e.x,y:e.y,vx:Math.cos(a)*105,vy:Math.sin(a)*105,life:5});}
        }
      }
      if(e.charge>0){e.charge-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;}
      else{e.x+=dx/d*speed*dt;e.y+=dy/d*speed*dt;}
      if(d>800&&!e.boss){const a=this.random()*Math.PI*2;e.x=p.x+Math.cos(a)*480;e.y=p.y+Math.sin(a)*480;}
      if(d<e.r+13)this.hurt(e.damage);
      if(this.rank('orbit')&&e.orbitCD<=0){for(let i=0;i<this.rank('orbit');i++){const a=this.time*2.5+i/this.rank('orbit')*Math.PI*2;const ox=p.x+Math.cos(a)*72,oy=p.y+Math.sin(a)*72;if(Math.hypot(e.x-ox,e.y-oy)<e.r+17){this.hit(e,this.damage*.65);e.orbitCD=.35;break;}}}
    }
    // A sparse spatial grid keeps crowd separation approximately linear.
    const grid=new Map();for(const e of this.enemies){if(e.hp<=0)continue;const gx=Math.floor(e.x/48),gy=Math.floor(e.y/48);for(let x=gx-1;x<=gx+1;x++)for(let y=gy-1;y<=gy+1;y++)for(const o of grid.get(x+','+y)||[]){let dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy),min=(e.r+o.r)*.7;if(d>0&&d<min){let f=(min-d)*.2;e.x+=dx/d*f;e.y+=dy/d*f;o.x-=dx/d*f;o.y-=dy/d*f;}}let key=gx+','+gy;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(e);}
    this.stormTimer-=dt;if(this.rank('lightning')&&this.stormTimer<=0){this.stormTimer=2.8;let targets=this.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<350).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,this.rank('lightning')+1);for(const e of targets){this.addEffect({type:'bolt',x:e.x,y:e.y,life:.3,max:.3});this.hit(e,this.damage*2.1);}if(targets.length)this.emit('storm');}
    this.auraTimer-=dt;if(this.rank('frost')&&this.auraTimer<=0){this.auraTimer=.6;let radius=65+this.rank('frost')*15;for(const e of this.enemies)if(Math.hypot(e.x-p.x,e.y-p.y)<radius){e.slow=1;this.hit(e,this.damage*.25*this.rank('frost'));}}
    for(const s of this.shots){s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;if(Math.hypot(s.x-p.x,s.y-p.y)<17){this.hurt(14);s.life=0;}}
    this.shots=this.shots.filter(s=>s.life>0).slice(-150);
    for(const g of this.gems){let dx=p.x-g.x,dy=p.y-g.y,d=Math.hypot(dx,dy);if(d<this.pickup||g.attract){g.attract=true;g.x+=dx/(d||1)*Math.min(d,300*dt);g.y+=dy/(d||1)*Math.min(d,300*dt);if(d<16){if(g.heal)p.hp=Math.min(p.maxHp,p.hp+g.value);else this.xp+=g.value;g.taken=true;this.emit('pickup');}}}
    this.gems=this.gems.filter(g=>!g.taken);this.enemies=this.enemies.filter(e=>e.hp>0);
    for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);
    for(const q of this.particles){q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.95;q.vy*=.95;}this.particles=this.particles.filter(q=>q.life>0);
    if(this.state==='playing')this.checkLevel();
  }
}
