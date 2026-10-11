// Four fully procedural 3D arenas. All geometry and colors are original.
import {MeshBuilder} from './arena3d.js';
import {enhanceStage,EXTRA_STAGE_IDS} from './stage-scenes.js';

const palettes={
 zenith:{sky:[.075,.115,.24],fog:[.16,.20,.34],light:[1.13,1.04,1.18],floor:['#26374a','#102034','#385267'],accent:'#58dff4'},
 temple:{sky:[.63,.43,.39],fog:[.61,.40,.38],light:[1.17,1.05,.91],floor:['#6d5044','#382d34','#9b6b53'],accent:'#ffd3a0'},
 forge:{sky:[.31,.19,.19],fog:[.42,.22,.17],light:[1.19,.88,.73],floor:['#3a3439','#1b242f','#785451'],accent:'#fb9b4c'},
 glacier:{sky:[.22,.45,.58],fog:[.27,.52,.60],light:[.93,1.12,1.24],floor:['#64899d','#3b617a','#8bbdcb'],accent:'#b9e9f3'},
 forest:{sky:[.12,.28,.24],fog:[.17,.31,.27],light:[.91,1.11,.93],floor:['#536149','#384f3f','#657056','#716958'],accent:'#9bbb76'},
 volcano:{sky:[.40,.16,.13],fog:[.49,.19,.14],light:[1.30,.88,.70],floor:['#40363b','#272630','#534142','#392a2d'],accent:'#f2773c'},
 lake:{sky:[.39,.62,.71],fog:[.47,.69,.74],light:[.96,1.13,1.23],floor:['#96c6d2','#71a5b7','#b0d8dc','#83b6c6'],accent:'#e6fcf7'},
 alpine:{sky:[.53,.64,.70],fog:[.59,.67,.71],light:[1.12,1.09,1.04],floor:['#8f9591','#777d83','#9b9b94','#686f75'],accent:'#e6e0c7'}
};
const p=(b,x,y,z,sx,sy,sz,c)=>b.box(x,y,z,sx,sy,sz,c);
function floor(b,scene,id){
 const {floor,accent}=scene,cols=30,rows=18;
 for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
  const x=(i-cols/2+.5)*1.2,z=(j-rows/2+.5)*1.18;
  const shade=floor[(i*17+j*3+(i*j)%3)%floor.length];
  const rustic=id==='forest'||id==='alpine'||id==='volcano';
  const tileOffset=rustic ? ((i*13+j*7)%5)*.004 : 0;
  p(b,x,-.11+tileOffset,z,.594,.10,.585,shade);
  // Each field has a visually different floor, but the physics plane stays flat.
  if(id==='forest'){
   if((i*5+j*3)%7===0)p(b,x+.17,-.002,z-.13,.20,.008,.18,'#7c9064');
   if((i+j*4)%13===0)p(b,x,.008,z,.31,.008,.026,'#a69c67');
  }else if(id==='volcano'){
   if((i*2+j*5)%9===0){
    p(b,x,-.002,z,.40,.008,.055,'#c75a35');
    p(b,x+.18,.005,z+.15,.055,.008,.25,'#ef8b46');
   }
  }else if(id==='lake'){
   if((i+j*7)%7===0){
    p(b,x,.004,z,.48,.006,.027,'#e0f4f1');
    p(b,x+.12,.005,z+.16,.024,.006,.24,'#c8eaf0');
   }
  }else if(id==='alpine'){
   if((i+j*4)%6===0)p(b,x,.002,z,.39,.007,.034,'#d0d1c7');
  }else{
   if((i+j)%5===0)p(b,x,-.001,z,.52,.012,.014,accent);
   if((i*3+j)%17===0)p(b,x,-.008,z,.014,.009,.50,'#c0bcab');
  }
 }
 // Decorated near and far rail edges.
 p(b,0,-.045,-10.72,18,.06,.13,'#101c26');
 p(b,0,-.044,10.72,18,.08,.12,'#0a1925');
 for(let x=-17;x<=17;x+=1.2){
  p(b,x,-.025,-10.7,.34,.018,.12,accent);
  p(b,x,-.03,10.7,.35,.018,.11,accent);
 }
}
function mountains(b,primary,secondary,scene){
 const shift=scene==='glacier'?0:3;
 for(let i=0;i<16;i++){
  const x=-37+i*5.3,z=-30-(i%4)*2;
  const h=4+(i*23)%9;
  b.cone(x,h*.50-1,z,2.5+((i*7)%4),h,2.1, i%3===0?secondary:primary);
  if(scene==='glacier')b.cone(x,h*.81-1,z,1.12,h*.33,1.15,'#e3f7f7');
 }
}
function skyBackdrop(b,scene){
 const sky={zenith:'#12233f',temple:'#aa6b67',forge:'#4e2c2d',glacier:'#5493a9',forest:'#28504d',volcano:'#722d29',lake:'#80bdca',alpine:'#a2bbc7'}[scene];
 // Large vertical far background, never camera-facing 2D fighters.
 p(b,0,11,-72,78,15,.2,sky);
 const colorTop={zenith:'#2a3b61',temple:'#dc8e75',forge:'#854134',glacier:'#89bece',forest:'#83a48b',volcano:'#bd5a3e',lake:'#d2f0f1',alpine:'#d5e0df'}[scene];
 p(b,0,3.5,-71.7,78,1.8,.13,colorTop);
 const sun={zenith:'#c8c6ef',temple:'#ffdeb5',forge:'#fa8f5a',glacier:'#f4fcfa',forest:'#f7dc9c',volcano:'#ffad61',lake:'#fffefd',alpine:'#f6f1e4'}[scene];
 b.ball(16,14,-63,2.8,2.8,.32,sun);
 b.ball(16,14,-62.55,2.25,2.25,.29,sun);
 if(scene==='zenith'){
  for(let i=0;i<75;i++){
   const x=((i*47)%131)-65,y=4+((i*31)%40)*.45;
   b.ball(x,y,-68,.065,.07,.05,i%3===0?'#9fd9ec':'#eff1ff');
  }
 }
}
function city(b){
 mountains(b,'#252f46','#283a52','zenith');
 // Tall towers: double row, recessed windows, signage, bridges.
 for(let row=0;row<2;row++)for(let i=0;i<24;i++){
  const x=-36+i*3.05+row*.9,z=-24-row*7;
  const h=3+((i*41+row*25)%14)*.6;
  p(b,x,h*.5,z,1.15,h,1.05,i%3===0?'#23364d':'#1a2d46');
  p(b,x,h,z,1.18,.14,1.17,'#101e32');
  for(let j=0;j<7;j++){
   const y=.6+j*.88;if(y>=h-.3)break;
   for(let k=0;k<3;k++){
    if((i*3+j+k)%3===0)continue;
    const c=k===1?'#5fb9d3':'#bd7eab';
    p(b,x-.8+k*.79,y,z+.54,.13,.25,.02,c);
   }
  }
  if(i%5===0){
   p(b,x,h-1,z+1.09,.58,.64,.06,i%2?'#7b3e8b':'#276c87');
   p(b,x,h-1,z+1.14,.35,.12,.025,'#a1f1eb');
  }
 }
 // Rear decorative glass railing and poles.
 for(let i=0;i<=23;i++){
  const x=-17.25+i*1.5;
  p(b,x,1.05,-7.55,.065,1.05,.09,'#758aa0');
  p(b,x,.2,-7.50,.65,.05,.04,'#7f9aa3');
 }
 p(b,0,1.87,-7.55,18,.06,.09,'#bbd0d2');
 p(b,0,1.10,-7.60,18,.047,.06,'#7b9bae');
 p(b,0,.34,-7.58,18,.035,.06,'#cd92b7');
 // Stadium floodlights and visual depth.
 for(const x of [-14,14]){
  p(b,x,5.0,-9,.16,5,.16,'#303c4c');
  p(b,x,9.96,-9,1.35,.17,.28,'#7acbd9');
  for(let k=-2;k<=2;k++)b.ball(x+k*.26,9.91,-8.68,.095,.095,.07,'#d1eef0');
 }
}
function temple(b){
 mountains(b,'#854955','#b46f6a','temple');
 for(let i=0;i<10;i++){
  const x=-21+i*4.7,z=-25-(i%2)*6;
  b.cone(x,7,z,1.2,12,1.2,'#4f313f');
  b.ball(x,12.5,z,1.1,1.4,1.0,'#f1a06e');
 }
 // Large ornate pagoda, tiled roofs layered toward vanishing distance.
 for(const x of [-12,12]){
  for(const z of [-16,-23]){
   p(b,x,2.9,z,.46,2.8,.52,'#4e262a');
   p(b,x,5.7,z,.50,.35,.52,'#b4785b');
   p(b,x,1.2,z,.72,.24,.72,'#b39476');
  }
 }
 for(let level=0;level<3;level++){
  const y=4.2+level*2.0,w=14-level*1.9;
  p(b,0,y,-20,w,.31,4,'#4f2836');
  p(b,0,y+.42,-20,w+1,.20,4.3,'#ad644e');
  for(let k=-4;k<=4;k++){
   p(b,k*(w*.19),y+.35,-17.8,.10,.24,.25,'#d2a47b');
  }
  p(b,0,y-.5,-20,w*.8,.5,3.5,level%2?'#412333':'#53313f');
 }
 for(const x of [-9,9]){
  for(let z=-8;z>-16;z-=2){
   p(b,x,1.9,z,.23,1.9,.23,'#873b3b');
   p(b,x,3.73,z,.68,.17,.66,'#deab78');
   b.ball(x,4.15,z,.39,.34,.36,'#ffc796');
  }
 }
 // Ornamental gate in rear arena, bright lanterns.
 for(let x=-7;x<=7;x+=3.5){
  p(b,x,2.6,-8.9,.35,2.6,.35,'#5d323c');
  p(b,x,4.35,-8.9,.54,.16,.58,'#c28e6c');
  b.ball(x,3.4,-8.5,.34,.43,.31,'#f9cc90');
 }
 p(b,0,5.28,-8.9,8,.27,.6,'#682f40');
 p(b,0,5.71,-8.9,8.7,.14,.72,'#ca8c5b');
}
function forge(b){
 mountains(b,'#482d31','#783a34','forge');
 // Foundry gantries, pipes, boilers, fire chambers.
 for(let i=0;i<10;i++){
  const x=-24+i*5.2,z=-17-(i%2)*8;
  const h=7+(i*5)%6;
  p(b,x,h*.5,z,1.55,h,1.48,'#30343b');
  p(b,x,h,z,1.73,.33,1.67,'#141b24');
  for(let j=0;j<4;j++){
   p(b,x-1.5,h*.32+j*.89,z+1.4,.08,.30,.07,j%2?'#e27a45':'#864c3c');
  }
  p(b,x,h+2,z,.48,2.15,.48,'#232a31');
  p(b,x,h+4.3,z,.75,.20,.75,'#49505b');
  b.ball(x,h+5.8,z,.85,.80,.85,'#7a5857');
 }
 for(const z of [-8.5,-13.5]){
  p(b,0,4.9,z,19,.17,.21,'#626065');
  for(let i=0;i<=22;i++)p(b,-17+i*1.5,2.4,z,.18,2.5,.22,'#424851');
 }
 for(let i=0;i<20;i++){
  const x=-17+i*1.8;
  p(b,x,-.01,-7,.43,.03,.65,'#ad5941');
  p(b,x,-.005,-6.4,.28,.03,.2,'#f4ae61');
 }
 for(const x of [-15,15]){
  p(b,x,1.55,-6.9,.65,1.55,.63,'#343c42');
  b.ball(x,3.2,-6.9,.66,.82,.63,'#d98652');
  b.ball(x,3.4,-6.9,.33,.38,.33,'#ffd18a');
 }
}
function glacier(b){
 mountains(b,'#467488','#86b7c7','glacier');
 for(let i=0;i<16;i++){
  const x=-32+i*4.7,z=-18-(i%3)*8,h=5+(i*37)%9;
  b.cone(x,h*.5,z,1.45,h,1.65,i%2?'#98cfd4':'#b2e0dd');
  b.cone(x,h*.83,z,1.1,h*.28,1.1,'#e0f1ec');
 }
 // Ancient frozen fortress with layered walls and blue glass windows.
 for(let k=0;k<5;k++){
  const x=-16+k*8;
  p(b,x,4,-15,2.6,4,2.5,'#668b9f');
  p(b,x,8.4,-15,3.1,.50,3,'#afd9d6');
  for(let j=0;j<4;j++)p(b,x,1.0+j*1.7,-12.4,.60,.57,.09,'#274e74');
  b.cone(x,10.3,-15,3.1,2.4,3,'#9bc5cf');
 }
 p(b,0,2.4,-13,19,2.4,2.5,'#3f6b86');
 for(let x=-19;x<=19;x+=2.25)p(b,x,5.15,-13,.60,.42,.86,'#a0d3d5');
 for(let i=0;i<20;i++){
  const x=-18+i*1.9;
  p(b,x,.10,-8,.18,.04,.27,'#b7e6ed');
 }
 // Clustered crystal formations bordering the floor.
 for(const side of [-1,1])for(let i=0;i<8;i++){
  const x=side*(11+i*.90),z=-5.8-(i%3)*1.3;
  b.cone(x,1.1+(i%3)*.33,z,.48,2.1+(i%3)*.72,.47,i%2?'#a8dce3':'#78afb5');
 }
}
export function buildStage3D(name){
 const scene=palettes[name]||palettes.zenith;
 const batch=new MeshBuilder();
 skyBackdrop(batch,name);
 floor(batch,scene,name);
 if(name==='temple')temple(batch);
 else if(name==='forge')forge(batch);
 else if(name==='glacier')glacier(batch);
 else if(name==='zenith')city(batch);
 // Existing and new fields receive their own scenery layers and safe foreground edges.
 enhanceStage(batch,name);
 return {batch,palette:scene};
}
export const STAGE_IDS=Object.freeze(Object.keys(palettes));
export const NEW_STAGE_IDS=EXTRA_STAGE_IDS;
