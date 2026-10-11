// Detailed multi-layer scenery shared by the eight original Rift Arena fields.
// Only static meshes are cached; animated atmosphere uses a small fixed draw budget.
// Z depth bands: far relief (-50), forests/buildings (-30), architecture (-16),
// near edge decorations (-8), fighters (0), and lateral foreground outside combat.
const box=(b,x,y,z,sx,sy,sz,c)=>b.box(x,y,z,sx,sy,sz,c);
const ball=(b,x,y,z,sx,sy,sz,c)=>b.ball(x,y,z,sx,sy,sz,c);
const cone=(b,x,y,z,sx,sy,sz,c)=>b.cone(x,y,z,sx,sy,sz,c);
const cyl=(b,x,y,z,sx,sy,sz,c)=>b.cylinder(x,y,z,sx,sy,sz,c);
const fract=n=>n-Math.floor(n);
const noise=n=>fract(Math.sin(n*123.789+4.72)*43758.5453);

function fir(b,x,z,height,tint,snow=false){
 const h=height;
 cyl(b,x,h*.25,z,.17*h,.50*h,.16*h,'#46372e');
 for(let j=0;j<4;j++){
   const a=1-j*.16;
   cone(b,x,h*(.43+j*.17),z,h*.26*a,h*.55*a,h*.26*a,j%2?tint:'#2e5a4a');
   if(snow && j%2===0)cone(b,x,h*(.54+j*.17),z,h*.16*a,h*.19*a,h*.16*a,'#d4eef0');
 }
}
function oak(b,x,z,h,shade){
 cyl(b,x,h*.32,z,.19*h,.63*h,.18*h,'#594332');
 // Three dense but individually lit canopy masses and a wide crown silhouette.
 ball(b,x,h*.78,z,.43*h,.29*h,.39*h,shade);
 ball(b,x-h*.22,h*.73,z+.02,.28*h,.25*h,.30*h,'#456b4a');
 ball(b,x+h*.27,h*.82,z-.13,.30*h,.26*h,.33*h,'#335b46');
 ball(b,x,h*.99,z-.13,.29*h,.23*h,.31*h,'#50845b');
}
function rock(b,x,z,s,color='#63666b'){
 const n=noise(x*4+z*3),height=s*(.65+n*.38);
 ball(b,x,height*.38,z,s*.95,height*.52,s*.71,color);
 ball(b,x+s*.22,height*.63,z-.10,s*.44,height*.36,s*.50,'#868b91');
}
function farRidges(b,base,highlight,snow=false){
 for(let row=0;row<3;row++){
  const z=-46+row*8;
  for(let i=0;i<19;i++){
   const x=-52+i*5.8+(row%2)*2;
   const h=5+(i*31+row*17)%12;
   cone(b,x,h*.47-1,z,2.9+noise(i+row)*3,h,2.6+row*.4,row===0?base:row===1?highlight:base);
   if(snow)cone(b,x,h*.83-.6,z,1.12,h*.28,1.12,'#edf8f6');
  }
 }
}
function fire(b,x,y,z,size=1){
 // Fire body is intentionally placed outside the combat lane.
 ball(b,x,y,z,.50*size,.37*size,.38*size,'#ea4d28');
 cone(b,x,y+.44*size,z,.33*size,.90*size,.32*size,'#ff9e40');
 cone(b,x,y+.65*size,z,.16*size,.53*size,.15*size,'#ffe7a0');
}
function forest(b){
 farRidges(b,'#29463f','#3b5d4c',false);
 // Deep, middle and near tree lines give pronounced perspective depth.
 for(let row=0;row<3;row++){
  const z=-35+row*10;
  for(let i=0;i<19;i++){
   const x=-34+i*3.9+(row%2)*1.5;
   const h=(row===0?7:row===1?9:5.6)+noise(i*5+row)*4;
   if((i+row)%3===0)oak(b,x,z,h,row===0?'#315540':'#326a4b');
   else fir(b,x,z,h*.87,row%2?'#346a50':'#2f6253');
  }
 }
 // Ancient mossy fighting dais with tiered stone steps and carved corner posts.
 box(b,0,-.35,-1.1,11.2,.26,7.2,'#3d4943');
 box(b,0,-.19,-1.1,10.7,.11,6.7,'#56635b');
 for(let x=-9;x<=9;x+=1.8){
  box(b,x,.005,-6.4,.89,.025,.20,'#929282');
  box(b,x,.006,4.2,.88,.023,.17,'#677b6a');
 }
 for(const sign of [-1,1]){
  for(const z of [-6.3,4.6]){
   box(b,sign*10.7,.63,z,.56,.68,.53,'#586963');
   cone(b,sign*10.7,1.35,z,.61,.85,.60,'#4a6255');
   ball(b,sign*10.7,1.7,z,.15,.13,.15,'#e3c47e');
  }
  for(let i=0;i<8;i++){
   const x=sign*(12+noise(i*2+sign)*4),z=-5.2+i*1.45;
   rock(b,x,z,.4+noise(i*9)*.36,i%2?'#4d5d54':'#596c58');
   if(i%2)oak(b,x+sign*.4,z,3.3+noise(i*3)*1.7,'#4a7a4f');
  }
 }
 // Fallen leaves and fern clusters bordering the field.
 for(let i=0;i<85;i++){
  const x=-16+noise(i*7.1)*32,z=-8+noise(i*5.2)*16;
  if(Math.abs(x)<10 && z>-6 && z<5)continue;
  ball(b,x,.045,z,.17,.023,.09,i%3?'#a2a65d':'#a98340');
  if(i%6===0)cone(b,x,.31,z,.31,.56,.35,'#5c905f');
 }
}
function volcano(b){
 farRidges(b,'#442f35','#5c3430',false);
 // Giant active crater in far distance; irregular black rocks, open glowing mouth.
 for(let k=0;k<5;k++){
  const x=-13+k*6.5,h=14+(k%3)*4,z=-31-(k%2)*3;
  cone(b,x,h*.38,z,3.9,h*.82,4.0,'#3e3035');
  cone(b,x,h*.74,z,2.7,h*.29,2.9,k%2?'#8f3f2d':'#9e4930');
  cone(b,x,h*.85,z,1.9,h*.18,1.6,'#f38b3c');
  for(let t=-1;t<=1;t++)cyl(b,x+t*.64,h*.42-t*1.5,z+3,.21,4.5,.24,'#da5334');
 }
 // Two distinct lava streams wrap the safe basalt fighting plateau.
 for(const sign of [-1,1]){
  for(let i=0;i<14;i++){
   const x=sign*(12.1+i*.38),z=-9.9+i*.81;
   box(b,x,-.02,z,1.05,.10,.43,i%3?'#dc4722':'#f4a343');
   box(b,x,-.06,z-.23,.92,.09,.07,'#4e2930');
  }
  for(let i=0;i<11;i++){
   const x=sign*(11.5+i*.8),z=-9+(i%5)*3.2;
   rock(b,x,z,.75+noise(i*8+sign)*.55,i%2?'#302d36':'#4c3432');
  }
  // Black volcanic cliffs and pyres near the rear arena.
  for(let i=0;i<6;i++){
   const x=sign*(11+i*2.6);
   cone(b,x,3.2,-11-i*.7,1.2,6.7,1.4,'#363039');
   if(i%2===0)fire(b,x,2.1,-11-i*.7,.82);
  }
 }
 for(let i=0;i<56;i++){
  const x=-16+noise(i*5)*32,z=-8+noise(i*7)*16;
  if(Math.abs(x)<10 && z>-6 && z<5)continue;
  cone(b,x,.19,z,.13,.35,.14,i%4?'#3f3537':'#a84a30');
 }
}
function frozenLake(b){
 farRidges(b,'#477687','#77a5b7',true);
 // A wide mirrored lake and crystalline cracks outside the stable combat ring.
 box(b,0,-.23,-5.3,18,.10,13,'#5a91a8');
 box(b,0,-.16,-5.2,17.6,.034,12.6,'#86b6c7');
 for(let i=0;i<58;i++){
   const x=-16+noise(i*9)*32,z=-9+noise(i*4)*14;
   if(Math.abs(x)<9 && z>-5 && z<4)continue;
   box(b,x,-.085,z,.35,.012,.022,i%3?'#d6f5f4':'#d0eafa');
 }
 // Rear evergreen tree belt and snowdrifts in clearly separate depth layers.
 for(let row=0;row<2;row++)for(let i=0;i<17;i++){
  const x=-34+i*4.3+row*1.2,z=-24+row*11,h=6+noise(i*7+row)*6;
  fir(b,x,z,h*.8,'#37656d',true);
 }
 for(const sign of [-1,1]){
  for(let i=0;i<12;i++){
   const x=sign*(11+i*.52),z=-8+(i%6)*2.4;
   cone(b,x,1+(i%4)*.52,z,.48,1.9+(i%4),.5,i%2?'#b9f4f1':'#8ec4d5');
   cone(b,x+sign*.2,.45,z+.25,.22,.7,.22,'#e9fcfa');
  }
  // Ice pillars frame each side of the stadium.
  box(b,sign*11.8,1.7,-5.5,.67,1.7,.55,'#91c7d6');
  cone(b,sign*11.8,3.7,-5.5,.65,2.0,.60,'#dffafa');
 }
 for(let i=0;i<22;i++){
  const x=-17+i*1.6,z=-10-(i%3)*.7;
  rock(b,x,z,.60,i%2?'#a8c8d1':'#d5e9eb');
 }
}
function alpine(b){
 farRidges(b,'#5a7287','#879cae',true);
 // Massive mountain faces and snow caps at staggered distances.
 for(let row=0;row<2;row++)for(let i=0;i<9;i++){
   const x=-28+i*7.5+row*2,z=-23-row*9,h=8+noise(i*2+row)*12;
   cone(b,x,h*.42,z,3.1,h,3.8,i%2?'#677484':'#53677d');
   cone(b,x,h*.79,z,1.36,h*.34,1.6,'#f0f2ea');
 }
 // Cliffside monastery and suspension bridge hang across deep distant ravine.
 for(const sign of [-1,1]){
  const x=sign*15;
  box(b,x,1.6,-13,3.0,1.7,3.3,'#61656a');
  box(b,x,3.2,-13,3.1,.14,3.7,'#ac9a7c');
  for(let k=0;k<4;k++)box(b,x+(k-1.5)*1.6,4.3,-13,.27,.96,.24,'#817466');
  cone(b,x,5.2,-13,3.2,.97,3.6,'#b39e86');
 }
 box(b,0,.3,-13,12,.13,1.4,'#796958');
 for(let i=0;i<20;i++){
  const x=-13+i*1.35;
  box(b,x,.44,-13,.52,.035,.52,'#b29d77');
  box(b,x,.80,-13.65,.055,.45,.065,'#7b746b');
  box(b,x,.80,-12.35,.055,.45,.065,'#7b746b');
 }
 for(const sign of [-1,1]){
  for(let k=0;k<7;k++){
   const x=sign*(12+k*.9),z=-8+(k%3)*2.3;
   rock(b,x,z,1.3+noise(k*3)*.8,'#777b81');
   if(k%2===0)fir(b,x+sign*.4,z-.8,3.6+noise(k)*1.5,'#3f5e59',true);
  }
  // Prayer flags and weathered poles outside the fight bounds.
  for(let i=0;i<3;i++){
   const x=sign*(11+i*2);
   cyl(b,x,1.75,-7.5,.07,1.75,.07,'#665d54');
   box(b,x+sign*.37,3.15,-7.5,.38,.23,.03,i%2?'#df9268':'#81a8ac');
  }
 }
 for(let i=0;i<48;i++){
  const x=-16+noise(i*9)*32,z=-9+noise(i*19)*16;
  if(Math.abs(x)<10 && z>-6 && z<5)continue;
  ball(b,x,.08,z,.26,.07,.19,i%2?'#e1e6e4':'#727d80');
 }
}
function upgradeClassic(b,id){
 if(id==='zenith'){
  for(let i=0;i<18;i++){
   const x=-18+i*2.08;
   if(i%2===0)box(b,x,2.4,-10,.36,.72,.10,i%3?'#468c9d':'#b45e9a');
   box(b,x,.12,-7.8,.32,.07,.08,'#65bcc6');
  }
  for(const x of [-12,12]){
   box(b,x,4,-9,.55,2.7,.6,'#34495c');
   ball(b,x,7.0,-8.65,.32,.35,.28,'#78ddf0');
  }
 }else if(id==='temple'){
  for(let i=0;i<15;i++){
   const x=-15+i*2.1;
   box(b,x,-.002,-7.3,.60,.018,.09,i%2?'#e8c087':'#b27862');
   if(i%3===0)ball(b,x,.18,-7.6,.23,.13,.18,'#bd765f');
  }
 }else if(id==='forge'){
  for(let i=0;i<18;i++){
   const x=-16+i*1.8;
   box(b,x,.12,-7.2,.64,.09,.2,i%2?'#7d4740':'#3f4650');
   if(i%3===0)fire(b,x,1,-9.0,.55);
  }
 }else if(id==='glacier'){
  for(let i=0;i<15;i++){
   const x=-16+i*2.2;
   cone(b,x,.5,-8,.22,1.0,.20,i%2?'#b4e8e5':'#94cbd4');
   box(b,x,-.015,5.4,.60,.013,.10,'#b2edf4');
  }
 }
}
export function enhanceStage(b,id){
 if(id==='forest')forest(b);
 else if(id==='volcano')volcano(b);
 else if(id==='lake')frozenLake(b);
 else if(id==='alpine')alpine(b);
 else upgradeClassic(b,id);
}
export const EXTRA_STAGE_IDS=['forest','volcano','lake','alpine'];
export function stageAtmosphere(r,id,t){
 // Moving background-only accents. Fixed draw count; no heavy rebuild per frame.
 if(id==='forest'){
  for(let i=0;i<15;i++){
   const x=-14+noise(i*3.11)*28,y=1.5+noise(i*8.4)*5,z=-9-noise(i*6.1)*12;
   r.primitive('sphere',x+Math.sin(t*.65+i)*.28,y+Math.sin(t*1.6+i*2)*.28,z,.047,.047,.047,i%3?'#badc83':'#ffe6a2');
  }
 }else if(id==='volcano'||id==='forge'){
  for(let i=0;i<17;i++){
   const x=-16+noise(i*4.3)*32,z=-11-noise(i*8)*3;
   const y=.65+(t*(.45+i%4*.19)+i*1.1)%4;
   r.primitive('sphere',x,y,z,.08,.08,.07,i%3?'#f89a4a':'#ffd59a');
  }
 }else if(id==='lake'||id==='glacier'||id==='alpine'){
  for(let i=0;i<20;i++){
   const x=-17+noise(i*5.1)*34+(t*.11)%1.3;
   const y=.8+((i*1.6+t*(.45+i%4*.08))%7.5);
   const z=-7-noise(i*9)*13;
   r.primitive('sphere',x,y,z,.06,.07,.07,'#dceef2');
  }
 }else if(id==='temple'){
  for(let i=0;i<11;i++){
   const x=-14+noise(i*8)*28+Math.sin(t*.6+i)*.35;
   const y=1.3+((t*.22+i*.8)%4.5);
   r.primitive('sphere',x,y,-7-noise(i*2)*9,.07,.04,.06,'#f6b78a');
  }
 }
}
