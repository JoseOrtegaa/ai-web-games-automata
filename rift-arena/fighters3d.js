// Eight original faceted arcade fighters. No licensed models or remote assets.
import {DESIGNS} from './characters.js';
import {fighterPose} from './poses.js';
import {trs,multiply} from './arena3d.js';
const at=(p,z)=>[p[0]*.018,-p[1]*.018,z];
// Two-bone inverse kinematics: rigid lengths, never elastic attack limbs.
export function solveLimb(start,target,l1,l2,bend=1){
 const dx=target[0]-start[0],dy=target[1]-start[1],raw=Math.hypot(dx,dy)||.001;
 const dist=Math.max(Math.abs(l1-l2)+.001,Math.min(raw,l1+l2-.001));
 const ux=dx===0&&dy===0?1:dx/raw,uy=dy/raw,a=(l1*l1-l2*l2+dist*dist)/(2*dist),h=Math.sqrt(Math.max(0,l1*l1-a*a));
 return [[start[0]+ux*a-uy*h*bend,start[1]+uy*a+ux*h*bend,start[2]],
 [start[0]+ux*dist,start[1]+uy*dist,start[2]]];
}
export function drawFighter3D(r,f,t){
 const d=DESIGNS[f.id]||DESIGNS.ryuzo,p=fighterPose(f,t),animal=d.type!=='human';
 const heavy=d.build,w=d.shoulder,body=animal?d.fur:d.skin;
 const gait=Math.sin((f.walk||0)*1.35)*(f.motion||0);
 const yaw=(f.face===1?.76:-.76)+gait*.035;
 const root=trs((f.x-576)*.014,f.y*.014,0,1,1,1,yaw);
 // KO rotates the entire skeleton onto the floor; crouch bends stance without squash.
 const height=p.fallen?.55:p.crouch?-.48:0;
 const pivot=trs(-p.hurt*.23,height+p.bob*.008,0,1,1,1,0,p.fallen?-1.48:p.lean*.45);
 const rig=multiply(root,pivot);
 const mesh=(kind,x,y,z,sx,sy,sz,c,rot=0,tilt=0)=>r.primitive(kind,x,y,z,sx,sy,sz,c,rot,tilt,rig);
 const part=(kind,xyz,size,c)=>mesh(kind,...xyz,...size,c);
 const box=(xyz,size,c)=>part('box',xyz,size,c);
 const bone=(a,b,width,c,kind='muscle')=>r.segment(a,b,width,c,rig,kind);
 r.primitive('sphere',0,.016,0,.8*heavy,.009,.42,'#171a20',0,0,root);
 const hipY=p.crouch?1.35:1.57;
 mesh('pelvis',0,hipY,0,.44*heavy,.26,.30,d.pants);
 mesh('torso',0,2.19,0,w,.60,d.depth,d.outfit);
 // Pectoral and abdominal planes, with a broad back rather than intersecting balls.
 for(const s of [-1,1]){
  mesh('muscle',s*w*.42,2.43,.23,.30*heavy,.31,.13,d.exposed?body:d.outfit,0,s*.18);
  mesh('muscle',s*w*.85,2.54,0,.24*heavy,.23,.24,body,0,s*.22);
  for(let i=0;i<2;i++)box([s*.15*heavy,2.05+i*.17,.30],[.14*heavy,.075,.035],d.exposed?body:d.trim);
 }
 box([0,1.72,.03],[.46*heavy,.062,.32],d.leather);
 box([.08,1.72,.36],[.09,.073,.035],d.metal);
 // Identifying costume and restrained cloth folds.
 if(f.id==='ryuzo'){
  for(const s of [-1,1])bone([s*.22,2.68,.26],[s*.12,2.12,.34],.065,'#a5a29a','calf');
  box([0,1.49,.32],[.13,.19,.028],d.leather);
 }else if(f.id==='titan'||f.id==='brute'||f.id==='fang'){
  bone([-.42*heavy,2.70,.22],[.28*heavy,1.84,.33],.10,d.leather,'calf');
  for(const s of [-1,1])box([s*w*.75,2.57,.13],[.22,.13,.22],d.metal);
 }else if(f.id==='selene'){
  box([0,2.24,.34],[.06,.36,.024],d.trim);
  for(const s of [-1,1])box([s*.32,2.36,.30],[.08,.17,.03],d.leather);
 }else if(f.id==='razor'){
  for(const s of [-1,1])bone([s*.45,2.65,.20],[s*.24,1.9,.30],.07,d.leather,'calf');
 }else if(f.id==='ursus'){
  mesh('torso',0,2.00,.13,.68,.46,.39,d.fur);
 }
 for(const [side,z] of [[-1,-.14],[1,.19]]){
  const hip=[side*.24*heavy,hipY,z];
  const target=at(side<0?p.rearAnkle:p.frontAnkle,z);
  if(!p.kicking&&!p.airborne)target[1]+=Math.max(0,gait*side)*.12;
  const [knee,foot]=solveLimb(hip,target,.78,.79,side<0?-1:1);
  bone(hip,knee,.24*heavy,d.pants);
  bone(knee,foot,.19*heavy,d.pants,'calf');
  mesh('skull',...knee,.14*heavy,.14,.145,d.leather);
  // Boots and soles retain angular toes and a readable planted heel.
  box([foot[0]+.10,foot[1]-.015,z+.045],[.23*heavy,.105,.19*heavy],d.boots);
  box([foot[0]+.10,foot[1]-.10,z+.045],[.24*heavy,.03,.20*heavy],'#151719');
  if(['drake','titan','selene'].includes(f.id))bone(knee,[foot[0],foot[1]+.17,z+.08],.14,d.leather,'calf');
  for(let i=0;i<2;i++)box([hip[0],hipY-.22-i*.14,z+.19],[.12,.018,.025],d.trim);
 }
 for(const [side,z] of [[-1,-.21],[1,.24]]){
  const shoulder=[side*w*.84,2.52,z];
  let target=at(side<0?p.rearHand:p.frontHand,z);
  if(f.id==='brute'){target=[target[0]*1.06,target[1]-.18,z];}
  const len=f.id==='brute'?1.04:.76;
  const [elbow,hand]=solveLimb(shoulder,target,len,len*.93,side<0?1:-1);
  bone(shoulder,elbow,.23*heavy,d.exposed?body:d.outfit);
  bone(elbow,hand,(f.id==='brute'?.28:.19)*heavy,body,'calf');
  mesh('skull',...elbow,.13*heavy,.13,.13,body);
  mesh('fist',...hand,d.fist,.19*heavy,.19*heavy,d.glove);
  box([hand[0]-.09,hand[1]-.055,z+.12],[.08,.085,.07],d.glove);
  for(let i=0;i<3;i++)box([hand[0]-.09+i*.09,hand[1]+.10,z+.16],[.035,.04,.02],d.trim);
  bone([hand[0]-.10,hand[1],z],[hand[0]-.22,hand[1]-.03,z],.14,d.leather,'calf');
  if(f.id==='razor')for(let i=0;i<3;i++)mesh('cone',hand[0]+.21,hand[1]+.08-i*.07,z+.15,.035,.21,.03,d.metal,0,-1.57);
 }
 bone([0,2.68,0],[0,2.96,0],.18*heavy,body);
 const hy=f.id==='brute'?3.13:3.20;
 const hw=animal?.31*heavy:f.id==='selene'?.235:f.id==='titan'?.30:.265;
 mesh('skull',0,hy,.015,hw,animal?.36:.35,animal?.30:.255,body);
 // Brow ridges, cheek planes and a squared jaw; eye apertures remain small.
 mesh('skull',0,hy-.22,.11,hw*.83,.13,.22,animal?d.skin:d.skin);
 for(const s of [-1,1]){
  box([s*hw*.48,hy+.045,.24],[.065,.017,.018],'#17181a');
  box([s*hw*.48,hy+.11,.245],[.082,.033,.038],animal?d.fur:d.hair);
  mesh('skull',s*hw*.70,hy-.07,.15,.09,.09,.10,body);
  if(animal){
   if(d.type==='wolf')mesh('cone',s*.24,hy+.37,-.04,.14,.30,.12,d.fur);
   else mesh('skull',s*hw*.88,hy+.22,0,.11,.12,.08,d.fur);
  }else mesh('skull',s*hw,hy-.03,0,.045,.085,.048,d.skin);
 }
 if(animal){
  const snout=d.type==='wolf'?.39:d.type==='gorilla'?.17:.25;
  mesh('skull',0,hy-.13,.28,hw*.76,.14,snout,d.skin);
  box([0,hy-.08,.28+snout],[.09,.05,.045],'#17191b');
  box([0,hy-.24,.30+snout*.5],[.13,.016,.025],'#292323');
  if(f.id==='razor')for(const s of [-1,1])box([s*.22,hy+.02,.27],[.025,.16,.02],d.trim);
  if(f.id==='fang'||f.id==='ursus'||f.id==='brute')for(const s of [-1,1])for(let i=0;i<3;i++)mesh('fur',s*(hw+.035),hy-.04-i*.12,-.025,.08,.17,.13,i%2?d.fur:d.outfit,0,s*.3);
 }else{
  mesh('skull',0,hy-.035,.265,.055,.10,.065,d.skin);
  box([0,hy-.19,.24],[.08,.012,.025],'#513a32');
  mesh('skull',0,hy+.24,-.025,hw*1.015,f.id==='drake'?.065:.13,.255,d.hair);
  if(f.id==='selene'){
   bone([0,hy+.21,-.25],[-.14,hy-.40,-.30],.085,d.hair,'calf');
   box([0,hy+.20,-.24],[.10,.035,.055],d.trim);
  }
 }
 if(animal)for(const s of [-1,1])for(let i=0;i<4;i++)mesh('fur',s*w*.8,2.5-i*.10,-.18,.10,.18,.13,i%2?d.fur:d.outfit,0,s*.5);
 if(f.id==='razor'||f.id==='fang'){
  bone([-.12,1.6,-.24],[-.45,1.16,-.64],.095,d.fur,'calf');
  bone([-.45,1.16,-.64],[-.73,1.04+Math.sin(t*2)*.08,-.90],.065,d.fur,'calf');
 }
 if(p.isSpecial&&p.intensity>.7)mesh('cone',1.12,2.28,.1,.11,.55,.10,d.trim,0,-1.57);
}
