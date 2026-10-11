// Original PS2-era-inspired 3D fighting character models, fully procedural and skinned
// through articulated joints. Meshes are rendered every frame in actual WebGL 3D.
import {DESIGNS} from './characters.js';
import {fighterPose} from './poses.js';
import {trs,multiply} from './arena3d.js';
const scale2=.018;
const at=(p,z=0)=>[p[0]*scale2,-p[1]*scale2,z];
const dcolor=(d,key)=>d[key]||'#cccccc';
const skin=(d)=>d.type==='human'?d.skin:d.fur;
const bodyColors={
 kira:{dark:'#1a1e2a',metal:'#c5a3c3',bright:'#8c426e',belt:'#d5aaa8',eye:'#91d6d8'},
 volt:{dark:'#182d3a',metal:'#7ad9ea',bright:'#356c85',belt:'#c0cfd2',eye:'#b7edf4'},
 onyx:{dark:'#2b2d35',metal:'#d7a861',bright:'#655247',belt:'#d8ab68',eye:'#caa37e'},
 ember:{dark:'#251e2a',metal:'#e5b183',bright:'#b64a35',belt:'#f7ca83',eye:'#dbbeab'},
 vex:{dark:'#141c20',metal:'#a4d5a6',bright:'#2f7163',belt:'#b0bb99',eye:'#a5f7a1'},
 rook:{dark:'#1b2b45',metal:'#e4b46e',bright:'#3b638c',belt:'#e7b87a',eye:'#ffe5aa'},
 sable:{dark:'#221b33',metal:'#e7b2d7',bright:'#814d9a',belt:'#e8c4e1',eye:'#c9e3e5'},
 atlas:{dark:'#333438',metal:'#c9bda5',bright:'#918675',belt:'#e2d2b0',eye:'#ecddae'}
};
function getDraw(r,root) {
 return {
  ball:(x,y,z,rx,ry,rz,c,ryaw=0)=>r.primitive('sphere',x,y,z,rx,ry,rz,c,ryaw,0,root),
  box:(x,y,z,sx,sy,sz,c,ryaw=0)=>r.primitive('box',x,y,z,sx,sy,sz,c,ryaw,0,root),
  cone:(x,y,z,sx,sy,sz,c,ryaw=0,tilt=0)=>r.primitive('cone',x,y,z,sx,sy,sz,c,ryaw,tilt,root),
  cylinder:(x,y,z,sx,sy,sz,c)=>r.primitive('cylinder',x,y,z,sx,sy,sz,c,0,0,root),
  bone:(a,b,radius,c)=>r.segment(a,b,radius,c,root)
 };
}
function link(d,a,b,r,c){
 d.bone(a,b,r,c);d.ball(...a,r*1.05,r*1.05,r*.98,c);d.ball(...b,r*.92,r*.9,r*.93,c);
}
function face3D(r,root,def,t){
 const d=DESIGNS[def]||DESIGNS.kira,colors=bodyColors[def],draw=getDraw(r,root);
 const animal=d.type!=='human',c=skin(d);
 const width=def==='onyx'||def==='rook'?.51:.385;
 draw.ball(0,0,0,width,animal?.45:.43,animal?.39:.34,c);
 // Cheekbones and ears occupy real depth, never 2D billboards.
 if(animal){
  if(['gorilla','bear'].includes(d.type)){
   for(const sign of [-1,1]){
    draw.ball(sign*width*.89,.24,-.015,.15,.18,.12,d.fur);
    draw.ball(sign*width*.92,.25,.088,.075,.086,.045,d.skin);
   }
  }else{
   for(const sign of [-1,1]){
    draw.cone(sign*.29,.56,-.04,.19,.43,.19,d.fur);
    draw.cone(sign*.29,.56,.14,.094,.21,.055,def==='vex'?'#7d6567':'#d0b9b4');
   }
  }
  // Separate muzzle and bridge: gorilla, bear, feline and lupine each have a recognizable head.
  if(def==='onyx'){
   draw.ball(0,-.10,.34,.39,.29,.35,'#82706a');
   draw.ball(0,-.21,.61,.26,.14,.20,'#a38b7b');
   draw.ball(0,-.10,.79,.13,.08,.07,'#322d2d');
  }else if(def==='rook'){
   draw.ball(0,-.13,.38,.38,.30,.33,'#b38c74');
   draw.ball(0,-.23,.64,.28,.20,.26,'#d5ad8f');
   draw.ball(0,-.12,.90,.16,.10,.085,'#473433');
  }else if(def==='vex'){
   draw.ball(0,-.14,.40,.28,.19,.26,'#515861');
   draw.ball(0,-.20,.57,.20,.15,.23,'#778084');
   draw.ball(0,-.095,.79,.105,.08,.08,'#293036');
  }else{
   draw.ball(0,-.14,.42,.30,.20,.30,'#aab2b3');
   draw.ball(0,-.18,.63,.20,.13,.30,'#d6dbd3');
   draw.ball(0,-.105,.88,.12,.075,.10,'#343a3d');
  }
  for(const sign of [-1,1]){
   draw.ball(sign*.18,.09,.33,.12,.072,.06,'#22252c');
   draw.ball(sign*.18,.09,.385,.064,.045,.03,colors.eye);
   draw.ball(sign*.18+.015,.086,.411,.020,.033,.014,'#12202b');
   draw.box(sign*.19,.185,.357,.135,.034,.042,d.fur);
   // Wolf and panther whisker roots / gorilla brows.
   if(def==='vex'||def==='atlas')for(let i=0;i<2;i++)draw.box(sign*(.23+i*.065),-.21+i*.07,.55+i*.045,.065,.009,.012,'#d8e2d8');
  }
  draw.box(0,-.35,.43,.27,.026,.047,'#403334');
  if(['atlas','vex'].includes(def))for(const sign of [-1,1]){
    draw.cone(sign*.20,-.35,.56,.045,.16,.05,'#f2e8d3',0,Math.PI);
  }
  if(def==='onyx'||def==='rook'){
   for(let i=-2;i<=2;i++)draw.cone(i*.13,.44,-.12,.075,.17,.09,def==='rook'?'#8d604c':'#38404a');
  }
 }else{
  // Jaw, temples, ears, nostrils, eyelids and eyebrows.
  draw.ball(0,-.27,.105,.288,.20,.31,d.skin);
  for(const sign of [-1,1]){
   draw.ball(sign*.375,-.025,0,.086,.145,.075,d.skin);
   draw.ball(sign*.145,.067,.302,.108,.066,.051,'#f0dbc4');
   draw.ball(sign*.145,.067,.355,.046,.046,.022,colors.eye);
   draw.ball(sign*.145,.065,.376,.021,.034,.012,'#1e2730');
   draw.box(sign*.143,.17,.325,.132,.029,.055,d.hair);
   draw.ball(sign*.048,-.155,.37,.038,.025,.034,'#6f473d');
  }
  draw.ball(0,-.12,.355,.087,.15,.12,d.skin);
  draw.box(0,-.275,.339,.16,.016,.035,'#653f3e');
  draw.ball(0,-.35,.31,.14,.045,.055,'#9f665e');
  if(def==='kira'){
   draw.ball(0,.34,-.055,.38,.22,.33,'#211d30');
   for(let i=0;i<7;i++){
    const x=(i-3)*.115;
    draw.cone(x,.53+Math.sin(i*2)*.1,-.05,.16,.29,.18,'#211c2a',0,i*.14);
   }
   draw.bone([-.31,.2,-.1],[-.67,-.20,-.30],.13,'#2a2235');
  }else if(def==='volt'){
   draw.ball(0,.38,-.04,.38,.21,.34,'#b9d8de');
   for(let i=0;i<6;i++)draw.cone((i-2.5)*.13,.57,-.09,.115,.19,.13,i%2?'#dfefee':'#92bcc6');
   draw.box(0,.28,.25,.37,.066,.13,'#d9e6e4');
  }else if(def==='ember'){
   draw.ball(0,.38,-.015,.4,.23,.31,'#a83534');
   for(let i=0;i<6;i++)draw.cone((i-2.5)*.14,.52,-.03,.13,.27,.14,i%2?'#b63036':'#d96b43');
   draw.bone([-.25,.31,-.24],[-.69,-.35,-.40],.145,'#9b2d31');
  }else{
   draw.ball(0,.35,0,.37,.24,.30,'#332642');
   for(let i=0;i<5;i++)draw.cone((i-2)*.18,.53,-.02,.12,.25,.13,'#573960');
   draw.bone([-.3,.19,-.2],[-.45,-.59,-.31],.13,'#392743');
  }
 }
 // Neck and jaw highlights define the head volume at PS2-like resolution.
 draw.ball(0,-.39,-.11,.20,.115,.25,d.type==='human'?d.skin:d.fur);
}
export function drawFighter3D(r,f,t){
 const d=DESIGNS[f.id]||DESIGNS.kira,C=bodyColors[f.id]||bodyColors.kira,p=fighterPose(f,t);
 const feetX=(f.x-576)*.014;
 const root=trs(feetX,f.y*.014,0,1,1,1,f.face===1?.92:-.92);
 const dr=getDraw(r,root);
 const k=p.intensity,impact=Math.max(0,f.impact||0);
 const build=d.build;
 const ball=(x,y,z,rx,ry,rz,c)=>dr.ball(x,y,z,rx,ry,rz,c);
 const box=(x,y,z,sx,sy,sz,c)=>dr.box(x,y,z,sx,sy,sz,c);
 const bone=(a,b,w,c)=>link(dr,a,b,w,c);
 const rearHip=at(p.rearHip,-.10),frontHip=at(p.frontHip,.13);
 const rearKnee=at(p.rearKnee,-.10),frontKnee=at(p.frontKnee,.13);
 const rearAnkle=at(p.rearAnkle,-.1),frontAnkle=at(p.frontAnkle,.13);
 const rearElbow=at(p.rearElbow,-.21),frontElbow=at(p.frontElbow,.20);
 const rearHand=at(p.rearHand,-.1),frontHand=at(p.frontHand,.26);
 // Contact shadow, depth-sorted behind feet. Soft fake shadow layered over the 3D floor.
 for(let i=4;i>=0;i--)ball(0,.013+i*.001,-.03,.94+i*.13,.006,.42+i*.09,i%2?'#1b1e27':'#24242b');
 // Animated tail: four segments with soft joins and different thickness.
 if(f.id==='vex'||f.id==='atlas'){
   const tailColor=d.fur;
   const rootTail=[-.17,1.52,-.40],swing=Math.sin(t*3.3+f.x*.015)*.25;
   const a=[-.55,1.46,-.78],b=[-.9,1.24+swing,-1.07],c=[-1.04,1.36+swing*1.4,-1.34];
   bone(rootTail,a,f.id==='atlas'?.15:.105,tailColor);
   bone(a,b,.105,tailColor);bone(b,c,.083,f.id==='atlas'?'#d0d1c8':d.fur);
 }
 // Walking legs, hips, boots and textile folds follow the same hitbox simulation.
 const leg=build>1.2?1.08:1;
 for(const [hip,knee,ankle,zOff] of [[rearHip,rearKnee,rearAnkle,-.1],[frontHip,frontKnee,frontAnkle,.13]]){
   bone(hip,knee,.205*leg,d.pants);bone(knee,ankle,.166*leg,d.pants);
   ball(...knee,.192*leg,.19*leg,.18*leg,C.dark);
   ball(...ankle,.167*leg,.155*leg,.17*leg,d.boots);
   ball(ankle[0]+.19,Math.max(.18,ankle[1]-.02),zOff+.11,.29*leg,.11,.24,d.boots);
   // shin guard and upper boot panel
   const sy=(knee[1]+ankle[1])*.5,sx=(knee[0]+ankle[0])*.5;
   ball(sx,sy,zOff+.18,.175*leg,.29*leg,.09,C.dark);
   box(sx,sy+.04,zOff+.272,.145,.075,.025,C.metal);
 }
 // Pelvis and heavy overlapping belt/cloth, not a line-art stick torso.
 ball(0,1.52,0,.51*build,.30,.34,d.pants);
 ball(0,1.79,-.02,.50*build,.48,.32,d.outfit);
 box(0,1.70,.23,.45*build,.105,.20,C.belt);
 box(.10,1.70,.35,.14,.13,.045,C.metal);
 // Armoured torso / sculpted chest and back; shoulders differ for large animals.
 ball(0,2.28,-.015,.59*build,.64,.35,d.outfit);
 ball(0,2.16,.22,.50*build,.45,.21,C.dark);
 const exposed=['onyx','rook'].includes(f.id);
 const torsoSkin=exposed?d.fur:d.outfit;
 for(const s of [-1,1]){
   ball(s*.29*build,2.43,.19,.31*build,.34,.22,torsoSkin);
   ball(s*.52*build,2.55,-.03,.24*build,.29,.29,exposed?d.fur:C.bright);
 }
 // Character-specific high-poly-ish costume layers and identifying gear.
 if(f.id==='kira'){
   for(const s of [-1,1]){
     box(s*.29,2.31,.35,.18,.40,.035,'#ad6d96');
     box(s*.17,2.18,.405,.09,.36,.02,C.metal);
   }
   box(0,1.43,.22,.36,.36,.10,'#38223d');
 }else if(f.id==='volt'){
   for(const s of [-1,1]){
     ball(s*.35,2.35,.38,.21,.37,.08,'#2d667b');
     box(s*.33,2.34,.47,.16,.085,.03,C.metal);
     box(s*.53,2.58,.17,.22,.14,.25,'#4e91a1');
   }
   ball(0,2.28,.44,.16,.16,.10,'#b5fff2');
 }else if(f.id==='onyx'){
   for(const s of [-1,1]){
     box(s*.39,2.18,.37,.20,.07,.09,C.metal);
     ball(s*.60,2.60,.10,.23,.18,.32,'#5b6268');
   }
   box(0,1.75,.4,.32,.12,.10,'#d4a467');
 }else if(f.id==='ember'){
   box(0,2.26,.385,.26,.59,.065,'#c46b49');
   for(const s of [-1,1])box(s*.30,2.40,.35,.13,.26,.045,'#d08a65');
   box(0,1.71,.35,.48,.095,.13,'#e8b76a');
 }else if(f.id==='vex'){
   box(0,2.21,.37,.16,.55,.085,'#60b38b');
   for(const s of [-1,1])box(s*.37,2.33,.29,.11,.40,.06,'#7bcba3');
 }else if(f.id==='rook'){
   box(0,2.35,.34,.22,.47,.075,'#dcb27c');
   for(const s of [-1,1]){
     box(s*.59,2.49,.11,.24,.12,.30,'#d7b589');
   }
   box(0,1.69,.38,.54,.13,.10,'#b9b0a2');
 }else if(f.id==='sable'){
   for(const s of [-1,1])box(s*.31,2.39,.36,.17,.35,.04,'#b77bc3');
   box(0,1.42,.22,.33,.42,.09,'#58336d');
 }else{
   box(0,2.20,.40,.32,.57,.07,'#a89d86');
   for(const s of [-1,1])box(s*.34,2.40,.35,.13,.34,.045,'#d0bc9d');
   box(0,1.72,.35,.49,.105,.12,'#ded0b5');
 }
 // Ribs and seams create a consistent surface under direct stage light.
 for(let i=0;i<3;i++)box(0,2.0+i*.13,.35,.34*build,.023,.028,i%2?C.bright:C.dark);
 // Back arm first; weight follows elbow and fist, guard raises both gloves.
 const rShoulder=[-.53*build,2.54,-.2];
 bone(rShoulder,rearElbow,.225*build,exposed?d.fur:d.outfit);
 bone(rearElbow,rearHand,.165*build,exposed?d.fur:d.outfit);
 ball(...rearHand,.22*build,.19*build,.23*build,d.glove);
 // Front arm, with strong punch, hook and uppercut silhouettes.
 const fShoulder=[.53*build,2.55,.17];
 bone(fShoulder,frontElbow,.242*build,exposed?d.fur:d.outfit);
 bone(frontElbow,frontHand,.18*build,exposed?d.fur:d.outfit);
 ball(...frontHand,.21*build,.18*build,.235*build,d.glove);
 for(let i=0;i<3;i++){
   ball(frontHand[0]+(i-1)*.105,frontHand[1]+.035,frontHand[2]+.20,.068,.09,.06,C.metal);
 }
 if(f.id==='rook'){
   ball(...frontHand,.29,.245,.29,'#a1424d');
   ball(...rearHand,.27,.23,.27,'#a1424d');
 }
 // Face and head are independent 3D models with subtle yaw/roll motion.
 const neck=[0,2.83,0];
 bone(neck,[0,3.06,0],.24,d.type==='human'?d.skin:d.fur);
 const headRoot=multiply(root,trs(0,3.37+(p.breathing*.011),.045,1,1,1,
     p.hurt*.05,p.headAngle+p.lean*.14));
 face3D(r,headRoot,f.id,t);
 // Front ponytails, hood scarf and earrings can sway in stance.
 if(f.id==='kira'||f.id==='ember'||f.id==='sable'){
   const tail= f.id==='sable'?'#51355a':f.id==='ember'?'#ab342e':'#272033';
   bone([-.26,3.67,-.21],[-.65,3.02+Math.sin(t*3)*.11,-.31],.11,tail);
 }
 // Blocking and impact: flashing material and energy arc occupy the 3D scene.
 if(impact>.01)ball(0,2.30,.0,.58*build,.80,.52,'#bb8979');
 if(p.isSpecial&&k>.16){
   const hand=frontHand;
   ball(hand[0],hand[1],hand[2],.27+.24*k,.27+.24*k,.27+.24*k,C.metal);
   for(let i=0;i<4;i++)ball(hand[0]+(i-2)*.24,hand[1]+Math.sin(i*3+t*12)*.14,
     hand[2]+.14,.095,.11,.09,C.bright);
 }
 // Thin strike streaks briefly underline the real pose animation.
 if(k>.60&&p.kicking){
   const x=frontAnkle[0],y=frontAnkle[1];
   bone([x-.44,y+.20,.16],[x+.30,y+.04,.18],.06,C.metal);
 }
 if(p.fallen){
   ball(0,.55,0,.80,.12,.53,'#44383b');
 }
}
