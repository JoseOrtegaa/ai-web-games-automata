// Deterministic, game-state-driven skeletal poses. Canvas rendering is a separate layer.
import { MOVES, clamp } from './core.js';

const smooth=t=>t*t*(3-2*t);
const blend=(a,b,t)=>a+(b-a)*t;
const point=(x,y)=>[x,y];
export function attackIntensity(f){
 const a=f.action;
 if(!a||!MOVES[a.type]) return 0;
 const move=MOVES[a.type],start=move.start,active=move.active,total=start+active+move.end;
 const elapsed=clamp(a.elapsed,0,total);
 if(elapsed<start)return 0;
 if(elapsed<start+active)return Math.max(0,blend(-.18,1,Math.min(1,(elapsed-start)/(active*.35))));
 return 1-smooth((elapsed-start-active)/move.end);
}
export function fighterPose(f,t=0){
 const moving=clamp(f.motion??0,0,1);
 const stride=Math.sin((f.walk||0)*1.35)*moving;
 const breathing=Math.sin(t*2.8+f.x*.012);
 const intensity=Math.max(0,attackIntensity(f));
 const anticipation=f.action&&f.action.elapsed<MOVES[f.action.type].start?Math.sin(f.action.elapsed/MOVES[f.action.type].start*Math.PI)*.10:0;
 const kind=f.action?.type;
 const airborne=(f.y||0)>4;
 const crouch=!!f.crouch || (!!f.action&&kind==='sweep'&&intensity>.55);
 const guard=!!f.block;
 const hurt=clamp((f.recoil||0)/.32,0,1);
 const fallen=(f.health||0)<=0;
 const upper=kind==='uppercut';
 const punch=kind==='punch';
 const kick=kind==='kick';
 const sweep=kind==='sweep';
 const special=kind==='special';
 const ranged=special&&['drake','razor'].includes(f.id);
 const kicking=kick||sweep||(special&&['titan','selene','razor'].includes(f.id));
 const striking=punch||upper||special;
 const heavy=['brute','ursus'].includes(f.id);
 let bob=breathing*.4+Math.abs(stride)*1.8;
 let lean=(moving*.05+breathing*.003)-anticipation;
 let pivot=0;
 let rearHip=point(-15,-84),frontHip=point(14,-83);
 let rearKnee=point(-26-stride*14,-43+Math.abs(stride)*5),rearAnkle=point(-17+stride*24,-11);
 let frontKnee=point(25+stride*13,-43+Math.abs(stride)*5),frontAnkle=point(36-stride*21,-11);
 let rearElbow=point(-46,-112+breathing*.5),rearHand=point(-12,-151+breathing*.5);
 let frontElbow=point(47,-127+breathing*.5),frontHand=point(39,-168+breathing*.6);

 if(airborne){
   bob=-2;lean+=.04;
   rearKnee=point(-38,-67);rearAnkle=point(-47,-42);
   frontKnee=point(45,-72);frontAnkle=point(53,-47);
   rearElbow=point(-50,-130);rearHand=point(-38,-170);
   frontElbow=point(51,-147);frontHand=point(43,-182);
 }
 if(guard){
   bob=-1;lean=-.04;
   rearElbow=point(-30,-151);rearHand=point(8,-165);
   frontElbow=point(50,-158);frontHand=point(22,-190);
 }
 if(crouch&&!sweep){
   rearKnee=point(-50,-50);rearAnkle=point(-29,-12);
   frontKnee=point(60,-49);frontAnkle=point(41,-12);
   frontElbow=point(50,-143);frontHand=point(16,-178);
 }
 if(kicking && intensity>0){
   lean=blend(lean,-.19,intensity);
   const tx=sweep?150:(heavy?126:152),ty=sweep?-24:-97;
   frontKnee=point(blend(frontKnee[0],54,intensity),blend(frontKnee[1],sweep?-47:-91,intensity));
   frontAnkle=point(blend(frontAnkle[0],tx,intensity),blend(frontAnkle[1],ty,intensity));
   rearAnkle=point(-28,-9);rearKnee=point(-34,-43);
   rearElbow=point(-46,-139);rearHand=point(-35,-168);
   frontElbow=point(42,-137);frontHand=point(14,-176);
   pivot=sweep?intensity*.05:0;
 }
 if(striking && intensity>0){
   lean=blend(lean,upper?-.13:.13,intensity);
   frontElbow=point(blend(frontElbow[0],upper?52:70,intensity),blend(frontElbow[1],upper?-159:-147,intensity));
   frontHand=point(blend(frontHand[0],upper?91:ranged?161:special?152:145,intensity),
     blend(frontHand[1],upper?-222:special?-144:-151,intensity));
   rearElbow=point(-44,-134);rearHand=point(-15,-156);
   frontKnee=point(blend(frontKnee[0],43,intensity),-44);
 }
 if(hurt>0){
   lean-=hurt*.22;
   frontHand=point(blend(frontHand[0],-7,hurt),blend(frontHand[1],-188,hurt));
   rearHand=point(-56,-156);
   bob+=hurt*7;
 }
 if(fallen){
   lean=-.63; pivot=-.43;bob=14;
   rearKnee=point(-70,-35);rearAnkle=point(-106,-11);
   frontKnee=point(64,-35);frontAnkle=point(104,-11);
   frontElbow=point(48,-112);frontHand=point(93,-92);
   rearElbow=point(-70,-123);rearHand=point(-86,-89);
 }
 return {
  bob,lean,pivot,breathing,intensity,kicking,striking,crouch,guard,airborne,hurt,fallen,
  rootScale:crouch?.79:1,
  rearHip,frontHip,rearKnee,rearAnkle,frontKnee,frontAnkle,
  rearElbow,rearHand,frontElbow,frontHand,
  headAngle:fallen?-.24:hurt?-.14*hurt:Math.sin(t*1.6)*.011,
  shoulderAngle:lean*.4,
  isSpecial:special&&intensity>.15,
  kickPeak:kicking&&intensity>.75
 };
}
