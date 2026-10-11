export const WIDTH = 1152;
export const GROUND = 508;
export const LIMITS = [65, WIDTH - 65];
export const ROSTER = [
  { id:'kira',name:'KIRA',alias:'SOMBRA CARMESÍ',color:'#bb8cff',shade:'#513078',speed:315,power:.98,defense:1,trait:'Corte espectral',bio:'Ninja acrobática de ataques veloces.',style:'shinobi' },
  { id:'volt',name:'VOLT',alias:'GUARDIÁN DEL PULSO',color:'#61e9fb',shade:'#156178',speed:260,power:1.02,defense:1,trait:'Tormenta eléctrica',bio:'Combatiente versátil con descarga a distancia.',style:'tech' },
  { id:'onyx',name:'ONYX',alias:'PUÑO DE GRANITO',color:'#ffbd71',shade:'#654224',speed:212,power:1.2,defense:.84,trait:'Golpe sísmico',bio:'Luchador pesado con enorme potencia.',style:'armor' },
  { id:'ember',name:'EMBER',alias:'FURIA ÍGNEA',color:'#ff6c80',shade:'#7c2644',speed:278,power:1.1,defense:.96,trait:'Danza de fuego',bio:'Patadas feroces y presión ofensiva.',style:'flame' },
  { id:'vex',name:'VEX',alias:'LA SERPIENTE',color:'#86ea94',shade:'#205d4b',speed:308,power:.94,defense:1.04,trait:'Colmillo verde',bio:'Especialista en esquivar y contraatacar.',style:'serpent' },
  { id:'rook',name:'ROOK',alias:'REY DE ACERO',color:'#92b8ff',shade:'#354b84',speed:230,power:1.16,defense:.87,trait:'Martillo de acero',bio:'Boxeador blindado, brutal a corta distancia.',style:'boxer' },
  { id:'sable',name:'SABLE',alias:'ECO DE LA NOCHE',color:'#fc96d8',shade:'#652c66',speed:290,power:1.04,defense:.99,trait:'Luna cortante',bio:'Artista marcial de patadas giratorias.',style:'dancer' },
  { id:'atlas',name:'ATLAS',alias:'EL ERRANTE',color:'#ded3a5',shade:'#625a44',speed:252,power:1.12,defense:.93,trait:'Impacto astral',bio:'Antiguo campeón de postura imperturbable.',style:'monk' }
];
export const MOVES = {
  punch:{start:.07,active:.11,end:.17,range:99,damage:7,push:15,height:'high'},
  kick:{start:.13,active:.15,end:.24,range:145,damage:11,push:35,height:'mid'},
  uppercut:{start:.16,active:.14,end:.32,range:118,damage:14,push:20,height:'high',launch:340},
  sweep:{start:.18,active:.16,end:.32,range:140,damage:12,push:53,height:'low'},
  special:{start:.20,active:.23,end:.39,range:183,damage:20,push:76,cost:40,height:'mid'}
};
export const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
export function fighterDefinition(id){return ROSTER.find(f=>f.id===id)||ROSTER[0];}
export function createFighter(id,x,face=1){
  return {id,x,y:0,vy:0,face,health:100,meter:45,action:null,queued:null,
    block:false,crouch:false,stun:0,flash:0,walk:0,combo:0,comboClock:0,hits:0,impact:0};
}
export function moveInfo(f){
  const base=MOVES[f.action?.type||'punch'];
  if(f.action?.type!=='special')return base;
  const overrides={
    kira:{range:215,damage:18},volt:{range:310,damage:17},onyx:{range:180,damage:26},
    ember:{range:189,damage:22},vex:{range:233,damage:18},rook:{range:143,damage:27},
    sable:{range:230,damage:20},atlas:{range:210,damage:23}
  };
  return {...base,...overrides[f.id]};
}
export function tryAttack(f,type){
  if(!MOVES[type]||f.health<=0||f.stun>0||f.block)return false;
  if(f.action){
    const m=moveInfo(f);
    if(type!=='special' && f.action.elapsed>=m.start+m.active*.55 && f.action.elapsed<m.start+m.active+m.end-.05){
      f.queued=type;
      return true;
    }
    return false;
  }
  const cost=MOVES[type].cost||0;
  if(f.meter<cost)return false;
  f.meter-=cost;
  f.action={type,elapsed:0,hit:false};
  f.queued=null;
  return true;
}
export function stepFighter(f,intent,enemy,dt){
  const d=clamp(dt,0,.05);
  f.face=enemy.x>=f.x?1:-1;
  f.flash=Math.max(0,f.flash-d);
  f.stun=Math.max(0,f.stun-d);
  f.impact=Math.max(0,f.impact-d);
  f.comboClock=Math.max(0,f.comboClock-d);
  if(f.comboClock===0)f.combo=0;
  const stunned=f.stun>0||f.health<=0;
  f.crouch=!stunned&&!f.action&&f.y===0&&!!intent.crouch;
  f.block=!stunned&&!f.action&&f.y===0&&!!intent.block;
  if(!stunned){
    if(intent.special)tryAttack(f,'special');
    else if(intent.uppercut)tryAttack(f,'uppercut');
    else if(intent.sweep)tryAttack(f,'sweep');
    else if(intent.punch)tryAttack(f,'punch');
    else if(intent.kick)tryAttack(f,'kick');
    const axis=Number(!!intent.right)-Number(!!intent.left);
    const slow=f.action?.28:f.block||f.crouch?.15:1;
    f.x=clamp(f.x+axis*fighterDefinition(f.id).speed*slow*d,...LIMITS);
    f.walk+=Math.abs(axis)*d*11;
    if(intent.jump&&f.y===0&&!f.action&&!f.crouch&&!f.block)f.vy=620;
  }
  if(f.y>0||f.vy>0){
    f.y+=f.vy*d;
    f.vy-=1550*d;
    if(f.y<=0){f.y=0;f.vy=0;}
  }
  if(f.action){
    f.action.elapsed+=d;
    const m=moveInfo(f);
    if(f.action.elapsed>m.start+m.active+m.end){
      const next=f.queued;
      f.action=null;f.queued=null;
      if(next&&!stunned)tryAttack(f,next);
    }
  }
}
export function resolveHit(attacker,defender){
  const action=attacker.action;
  if(!action||action.hit||attacker.health<=0)return null;
  const m=moveInfo(attacker);
  if(action.elapsed<m.start||action.elapsed>m.start+m.active)return null;
  const dx=defender.x-attacker.x;
  if(Math.abs(dx)>m.range||Math.abs(defender.y-attacker.y)>99||dx*attacker.face < -28)return null;
  if(defender.crouch&&m.height==='high')return null;
  action.hit=true;
  const guarding=defender.block&&defender.y===0&&defender.face===-attacker.face&&m.height!=='low';
  const raw=Math.round(m.damage*fighterDefinition(attacker.id).power*fighterDefinition(defender.id).defense);
  const damage=guarding?Math.max(1,Math.round(raw*.17)):raw;
  defender.health=clamp(defender.health-damage,0,100);
  defender.stun=guarding?.12:action.type==='uppercut'?.42:.28;
  defender.impact=.21;
  defender.flash=.17;
  if(!guarding){
    defender.action=null;defender.queued=null;
    defender.x=clamp(defender.x+attacker.face*m.push,...LIMITS);
    if(m.launch&&defender.y===0)defender.vy=m.launch;
  }
  attacker.meter=clamp(attacker.meter+(guarding?4:12),0,100);
  defender.meter=clamp(defender.meter+(guarding?3:8),0,100);
  attacker.hits++;
  attacker.combo=attacker.comboClock>0?attacker.combo+1:1;
  attacker.comboClock=1.2;
  return {x:defender.x,y:defender.y,damage,guarding,type:action.type,color:fighterDefinition(attacker.id).color,combo:attacker.combo,launch:!!m.launch};
}
export function keepApart(a,b){
  const min=70, distance=b.x-a.x;
  if(Math.abs(distance)>=min)return;
  const sign=distance<0?-1:1,shift=(min-Math.abs(distance))/2;
  a.x=clamp(a.x-sign*shift,...LIMITS);
  b.x=clamp(b.x+sign*shift,...LIMITS);
}
export function winnerByTimeout(a,b){
  if(a.health===b.health)return null;
  return a.health>b.health?0:1;
}
