// Original illustrated fighters, rendered with SVG portraits and articulated Canvas bodies.
// Deliberately no external imagery, licensed sprites or network dependencies.
export const DESIGNS=Object.freeze({
 kira:{species:'Humana',type:'human',skin:'#c28c73',hair:'#1b1a27',fur:'',outfit:'#582b50',trim:'#dda0c1',pants:'#29243b',boots:'#171827',build:.90,head:1,glove:'#54304c'},
 volt:{species:'Humano',type:'human',skin:'#ab7656',hair:'#c5d9df',fur:'',outfit:'#254e62',trim:'#81dbe6',pants:'#21374a',boots:'#16232c',build:1.04,head:1,glove:'#2d5a71'},
 onyx:{species:'Gorila',type:'gorilla',skin:'#876b5d',hair:'',fur:'#343942',outfit:'#554437',trim:'#ebba79',pants:'#34313c',boots:'#23242b',build:1.32,head:1.22,glove:'#41434a'},
 ember:{species:'Humana',type:'human',skin:'#ac694a',hair:'#a42b2e',fur:'',outfit:'#a9383a',trim:'#ffba78',pants:'#492c3b',boots:'#24212d',build:.95,head:1,glove:'#713942'},
 vex:{species:'Pantera',type:'panther',skin:'#3d444a',hair:'',fur:'#242f38',outfit:'#205445',trim:'#a5e6ab',pants:'#2b333b',boots:'#14252c',build:.94,head:1.08,glove:'#244d42'},
 rook:{species:'Oso',type:'bear',skin:'#c1997b',hair:'',fur:'#805646',outfit:'#28466c',trim:'#dbc6a0',pants:'#223857',boots:'#27313d',build:1.26,head:1.23,glove:'#a43b47'},
 sable:{species:'Humana',type:'human',skin:'#cfa18d',hair:'#30223a',fur:'',outfit:'#542c65',trim:'#f3b5e8',pants:'#322446',boots:'#181725',build:.90,head:1,glove:'#60385f'},
 atlas:{species:'Lobo',type:'wolf',skin:'#d4d0c4',hair:'',fur:'#93969a',outfit:'#686354',trim:'#e8d9bc',pants:'#4a4948',boots:'#292a2e',build:1.08,head:1.12,glove:'#6e6758'}
});
const faceHair={
 kira:"<path d='M72 119Q51 53 96 40Q139 18 162 58Q179 94 161 162L143 107Q141 68 99 69L83 126Z' fill='#1e1d2c'/><path d='M79 91Q113 40 157 78L137 88Q107 68 85 105Z' fill='#464155'/><path d='M75 106L64 182 79 188 89 128' fill='#1e1c2a'/><path d='M158 58Q197 71 187 130' fill='none' stroke='#302437' stroke-width='16'/>",
 volt:"<path d='M74 91Q63 53 97 43L120 35 126 45 153 39 168 70 160 89 144 68 116 80 91 66Z' fill='#afc4c9'/><path d='M88 62L124 42 111 65 153 52' stroke='#e9eef0' stroke-width='6' fill='none'/><path d='M158 112L176 108 170 135 157 133Z' fill='#2d697d' stroke='#70eaf1' stroke-width='3'/>",
 ember:"<path d='M71 111Q53 62 94 43Q108 23 119 36 153 33 170 69L161 114Q142 64 95 77Z' fill='#9a242b'/><path d='M83 74Q119 38 158 77L139 88 99 82 84 102Z' fill='#f4a154'/><path d='M155 52Q203 65 181 129' fill='none' stroke='#a92f33' stroke-width='15'/>",
 sable:"<path d='M72 103Q57 43 103 34Q155 25 171 86L171 159 152 198 146 109Q151 65 109 65L84 95 81 196 63 174Z' fill='#29213a'/><path d='M90 66Q115 42 154 69L134 82 95 79Z' fill='#694476'/><path d='M162 113Q184 168 164 200' fill='none' stroke='#83568b' stroke-width='8'/>"
};
const animalFaces={
 gorilla:"<path d='M78 104Q116 75 160 104' stroke='#23262d' stroke-width='16' fill='none'/><ellipse cx='121' cy='147' rx='47' ry='33' fill='#93766a'/><ellipse cx='123' cy='144' rx='39' ry='23' fill='#af9080'/><path d='M103 133Q120 120 148 137L141 155 103 151Z' fill='#4d403d'/><circle cx='107' cy='141' r='4' fill='#302e31'/><circle cx='137' cy='141' r='4' fill='#302e31'/><path d='M100 166Q125 179 148 165' stroke='#433331' stroke-width='4' fill='none'/>",
 panther:"<path d='M94 117Q121 109 146 124L177 149 146 169 105 162 87 145Z' fill='#5d6569'/><path d='M104 138Q137 128 162 150L139 160 116 152Z' fill='#818588'/><path d='M140 140L159 146 146 158 135 150Z' fill='#232731'/><path d='M99 157L66 146M100 165L68 169M151 162L186 163' stroke='#c4c9c1' stroke-width='2' fill='none'/>",
 bear:"<ellipse cx='129' cy='142' rx='47' ry='37' fill='#bc947b'/><ellipse cx='143' cy='145' rx='31' ry='22' fill='#d4b398'/><path d='M137 136L162 132 154 150 138 152Z' fill='#392e2b'/><path d='M141 154Q135 166 122 164' fill='none' stroke='#63463a' stroke-width='4'/>",
 wolf:"<path d='M90 131Q121 119 146 133L182 147 141 165 109 153 85 146Z' fill='#dbd6c9'/><path d='M135 140L173 147 151 159 138 150Z' fill='#f4ebd9'/><path d='M165 141L183 146 166 156 153 146Z' fill='#36383b'/><path d='M139 158L122 168 105 161' fill='none' stroke='#545052' stroke-width='3'/>"
};
export function portraitSvg(def){
 const d=DESIGNS[def.id]||DESIGNS.kira;
 const animal=d.type!=='human';
 const id='art-'+def.id;
 const defs="<defs><linearGradient id='"+id+"-skin' x2='1' y2='1'><stop stop-color='"+(animal?d.fur:d.skin)+"'/><stop offset='.6' stop-color='"+d.skin+"'/><stop offset='1' stop-color='#534345'/></linearGradient><linearGradient id='"+id+"-coat' x2='1' y2='1'><stop stop-color='"+d.trim+"'/><stop offset='.3' stop-color='"+d.outfit+"'/><stop offset='1' stop-color='#111723'/></linearGradient></defs>";
 const ears=animal?(d.type==='panther'||d.type==='wolf'
   ?"<path d='M66 101L60 17 106 52 150 21 172 97' fill='"+d.fur+"' stroke='#20262b' stroke-width='6'/><path d='M78 76L75 42 102 61M148 60L161 43 160 79' stroke='"+(d.type==='panther'?'#9b7478':'#e1b7a6')+"' stroke-width='8' fill='none'/>"
   :"<circle cx='74' cy='89' r='23' fill='"+d.fur+"'/><circle cx='166' cy='89' r='23' fill='"+d.fur+"'/><circle cx='74' cy='89' r='12' fill='#ab7f75'/><circle cx='166' cy='89' r='12' fill='#ab7f75'/>"):"";
 const head=animal
   ?ears+"<path d='M68 88Q65 46 110 45Q162 41 174 102L161 153Q125 191 82 151Z' fill='url(#"+id+"-skin)' stroke='#24252a' stroke-width='5'/><path d='M78 113Q114 93 157 109' stroke='#33343b' stroke-width='12' fill='none'/><path d='M83 115L107 111M137 110L157 112' stroke='"+(d.type==='panther'?'#b1e98c':'#fae0b1')+"' stroke-width='6' fill='none'/>"+animalFaces[d.type]
   :"<path d='M70 120Q62 55 101 55Q155 49 166 94L159 135Q150 175 123 180Q89 170 75 137Z' fill='url(#"+id+"-skin)' stroke='#60433d' stroke-width='3'/><path d='M82 112Q99 100 111 111M136 108Q149 102 161 109' stroke='#493034' stroke-width='5' fill='none'/><path d='M87 117L110 117M138 114L154 114' stroke='#17212b' stroke-width='4' fill='none'/><circle cx='104' cy='116' r='3' fill='#dbe1d7'/><circle cx='149' cy='112' r='3' fill='#dbe1d7'/><path d='M123 116L118 142 130 144' stroke='#744b40' stroke-width='3' fill='none'/><path d='M113 157Q124 161 138 153' stroke='#714a47' stroke-width='3' fill='none'/>"+faceHair[def.id];
 return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 270' role='img' aria-label='"+def.name+", "+d.species+"'>"+defs
  +"<path d='M22 271Q24 208 80 190L91 175 150 174 171 193Q224 211 238 271Z' fill='#09101d' stroke='#070b14' stroke-width='8'/>"
  +"<path d='M38 270Q39 224 84 194L116 216 152 188Q211 222 222 270Z' fill='url(#"+id+"-coat)' stroke='"+d.trim+"' stroke-width='4'/>"
  +"<path d='M90 174L105 202 119 213 148 194 147 173' fill='"+d.skin+"'/>"
  +"<path d='M61 270L91 211 118 238 129 270' fill='"+d.outfit+"' opacity='.75'/>"
  +"<path d='M186 270L153 206 129 233 113 270' fill='#111725' opacity='.58'/>"
  +head
  +"<path d='M87 187Q120 218 154 187' fill='none' stroke='"+d.trim+"' stroke-width='5'/>"
  +(def.id==='rook'?"<path d='M38 250L64 213 94 230 88 270Z' fill='#aa3944' stroke='#f4b0ac' stroke-width='5'/>":"")
  +"<path d='M55 257Q54 230 69 218' fill='none' stroke='#ffffff' stroke-opacity='.19' stroke-width='7'/>"
  +"</svg>";
}
function poly(ctx,p,fill,stroke='#0c101b',width=3){
 ctx.beginPath();ctx.moveTo(...p[0]);for(let i=1;i<p.length;i++)ctx.lineTo(...p[i]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
}
function ell(ctx,x,y,rx,ry,fill,stroke=null,width=2){
 ctx.beginPath();ctx.ellipse(x,y,Math.max(rx,1),Math.max(ry,1),0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
}
function limb(ctx,a,b,w,color){
 const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
 ctx.save();ctx.translate(a[0],a[1]);ctx.rotate(Math.atan2(dy,dx));
 const grad=ctx.createLinearGradient(0,-w*.5,0,w*.5);
 grad.addColorStop(0,'#eee6dd55');grad.addColorStop(.22,color);grad.addColorStop(.65,color);grad.addColorStop(1,'#090c16');
 ctx.fillStyle=grad;ctx.strokeStyle='#0c1019';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(0,-w/2);ctx.lineTo(length,-w*.4);ctx.quadraticCurveTo(length+w*.3,0,length,w*.45);
 ctx.lineTo(0,w/2);ctx.quadraticCurveTo(-w*.35,0,0,-w/2);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle='#ffffff27';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.18,-w*.25);ctx.lineTo(length-w*.3,-w*.16);ctx.stroke();ctx.restore();
}
function head(ctx,d,id,t){
 ctx.save();ctx.translate(0,-189);ctx.scale(d.head,d.head);
 if(d.type!=='human'){
  const pointy=d.type==='wolf'||d.type==='panther';
  if(pointy){
   poly(ctx,[[-27,-12],[-34,-71],[-5,-42],[17,-40],[36,-73],[35,-11]],d.fur,'#14191f');
   poly(ctx,[[-29,-48],[-27,-65],[-13,-47]],'#ab8184',null);
   poly(ctx,[[19,-46],[32,-65],[29,-39]],'#ab8184',null);
  }else{
   ell(ctx,-24,-31,15,17,d.fur,'#171a20',3);ell(ctx,27,-31,15,17,d.fur,'#171a20',3);
   ell(ctx,-24,-31,7,9,'#be9180');ell(ctx,27,-31,7,9,'#be9180');
  }
  ell(ctx,0,-19,d.type==='gorilla'?34:30,d.type==='bear'?37:33,d.fur,'#10141b',4);
  if(d.type==='gorilla'){
   ell(ctx,3,-11,31,23,'#41454b');ell(ctx,12,4,29,18,'#9d7b6d','#222329',3);
   ell(ctx,16,1,17,9,'#ae8776');ell(ctx,19,-4,5,4,'#3f3433');
   poly(ctx,[[0,14],[28,14],[12,20]],'#433636',null);
  }else if(d.type==='panther'){
   poly(ctx,[[0,-12],[25,-13],[47,1],[22,12],[1,7]],'#677177','#131a22',2);
   ell(ctx,39,0,10,6,'#222732');for(let k=-1;k<=1;k++){ctx.strokeStyle='#e0dbcb';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(24,6+k*5);ctx.lineTo(52,10+k*8);ctx.stroke();}
  }else if(d.type==='bear'){
   ell(ctx,17,3,27,19,'#c4a081','#51403b',3);ell(ctx,34,-2,13,8,'#4a3733');ell(ctx,39,0,5,4,'#272227');
  }else{
   poly(ctx,[[-5,-10],[17,-8],[51,5],[25,11],[3,7]],'#e1dbd0','#4d4e50',2);
   ell(ctx,45,1,10,7,'#34383c');
  }
  ctx.strokeStyle='#22262a';ctx.lineWidth=d.type==='gorilla'?8:5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-20,-27);ctx.lineTo(-2,-29);ctx.stroke();
  ell(ctx,-9,-25,5,3,d.type==='panther'?'#b6ee8d':'#f5e0b5');ell(ctx,-7,-25,2,2,'#121c20');
 }else{
  ell(ctx,-23,-12,8,12,d.skin,'#613e37',2);
  poly(ctx,[[-22,-43],[10,-48],[24,-31],[29,-6],[14,14],[-6,17],[-23,2]],d.skin,'#583b34',3);
  ell(ctx,-7,-17,18,24,'#ffffff19');
  const hair=d.hair;
  if(id==='volt'){
   poly(ctx,[[-29,-28],[-32,-49],[-10,-61],[15,-57],[28,-45],[12,-41],[-13,-38]],hair,'#364e57');
   poly(ctx,[[-22,-48],[-11,-57],[5,-53],[-10,-39]],'#f2efeb',null);
   poly(ctx,[[27,-11],[35,-10],[35,4],[26,7]],'#4b8a96','#8ce9ef');
  }else if(id==='kira'){
   poly(ctx,[[-29,-17],[-32,-53],[-3,-66],[27,-51],[25,-23],[10,-44],[-9,-41]],hair,'#0d1522');
   poly(ctx,[[-18,-48],[3,-58],[23,-48],[7,-39]],'#4d3855',null);
   limb(ctx,[-26,-51],[-64,-36+Math.sin(t*4)*7],9,hair);
  }else if(id==='ember'){
   poly(ctx,[[-27,-15],[-34,-48],[-11,-66],[20,-52],[29,-31],[11,-46],[-9,-37]],hair,'#3e1c26');
   poly(ctx,[[-24,-51],[0,-63],[11,-51],[-2,-44]],'#f6a35b',null);
   limb(ctx,[-25,-50],[-58,-39+Math.sin(t*5)*5],10,hair);
  }else{
   poly(ctx,[[-27,-17],[-30,-47],[-8,-59],[24,-53],[29,-27],[13,-42],[-11,-40]],hair,'#1b1928');
   limb(ctx,[-26,-40],[-55,-2+Math.sin(t*3)*5],12,hair);
   poly(ctx,[[-23,-43],[0,-57],[24,-48],[10,-40]],'#6b4478',null);
  }
  ctx.strokeStyle='#38272c';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-26);ctx.lineTo(18,-28);ctx.stroke();
  ell(ctx,13,-25,4,3,'#d6eee9');ell(ctx,14,-25,2,2,'#1c2731');
  ctx.strokeStyle='#754e43';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(22,-17);ctx.lineTo(30,-7);ctx.lineTo(24,-4);ctx.stroke();
  ctx.beginPath();ctx.moveTo(12,6);ctx.lineTo(24,5);ctx.stroke();
 }
 ctx.restore();
}
function clothing(ctx,d,id){
 const wide=d.build>1.2,w=wide?48:35*d.build;
 const g=ctx.createLinearGradient(-w,-157,w,-82);
 g.addColorStop(0,d.trim);g.addColorStop(.25,d.outfit);g.addColorStop(.7,d.outfit);g.addColorStop(1,'#131623');
 poly(ctx,[[-w,-147],[-w*.82,-90],[-14,-75],[18,-75],[w*.88,-92],[w,-147],[12,-163],[-11,-162]],g,'#0d111b',4);
 poly(ctx,[[-w+7,-137],[-11,-150],[5,-124],[w-7,-141],[w-9,-113],[11,-120],[-14,-112]],'#ffffff1a',null);
 poly(ctx,[[-13,-160],[-4,-134],[2,-130],[12,-160]],d.skin,null);
 if(id==='onyx'){
  poly(ctx,[[-39,-145],[-33,-110],[-14,-109],[4,-128],[22,-106],[44,-119],[42,-151]],'#393e48','#151922');
  poly(ctx,[[-29,-110],[5,-125],[34,-108],[13,-97],[-14,-96]],'#6b6b67');
 }else if(id==='rook'){
  poly(ctx,[[-25,-154],[1,-132],[19,-156],[40,-139],[31,-93],[-28,-91]],'#314f72');
  ell(ctx,6,-117,9,9,'#d5b78e','#27334d',2);
 }else if(id==='vex'){
  poly(ctx,[[-27,-148],[4,-137],[23,-157],[31,-126],[26,-97],[-31,-103]],'#215548');
  poly(ctx,[[-11,-139],[9,-134],[1,-97]],'#91cea1',null);
 }else if(id==='atlas'){
  poly(ctx,[[-37,-153],[-7,-144],[24,-154],[40,-116],[12,-81],[-34,-92]],'#938675');
  poly(ctx,[[-30,-144],[14,-120],[-9,-88]],'#e4d4ba',null);
 }else if(id==='ember'){
  poly(ctx,[[-24,-150],[4,-142],[23,-151],[29,-120],[12,-100],[-26,-107]],'#ac3d3c');
  poly(ctx,[[-10,-143],[6,-124],[24,-141],[20,-117],[-2,-112]],'#eb9258',null);
 }else if(id==='kira'){
  poly(ctx,[[-22,-151],[9,-143],[26,-149],[27,-112],[-1,-96],[-28,-109]],'#522a4c');
  poly(ctx,[[-22,-138],[10,-132],[16,-118],[-15,-117]],'#bd81a2',null);
 }else if(id==='sable'){
  poly(ctx,[[-24,-147],[16,-149],[27,-124],[11,-92],[-25,-101]],'#59316a');
  ctx.strokeStyle='#e5a6d8';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(12,-152);ctx.lineTo(-5,-122);ctx.lineTo(21,-103);ctx.stroke();
 }else{
  poly(ctx,[[-32,-150],[0,-141],[25,-152],[35,-117],[13,-93],[-30,-96]],'#24536a');
  ell(ctx,3,-117,11,11,'#99e3de','#316878',2);
 }
 poly(ctx,[[-27,-94],[29,-94],[26,-81],[-29,-81]],'#171d27','#080e16',2);
 ell(ctx,5,-87,9,6,d.trim,'#242332',2);
}
export function renderCharacter(ctx,f,t,ground){
 const d=DESIGNS[f.id]||DESIGNS.kira;
 const stride=f.y>0?9:Math.sin(f.walk)*15;
 const action=f.action;
 const active=!!(action&&action.elapsed>.06);
 const upper=active&&action.type==='uppercut';
 const punch=active&&(action.type==='punch'||upper);
 const kicking=active&&(action.type==='kick'||action.type==='sweep'||(action.type==='special'&&['ember','sable','vex'].includes(f.id)));
 const sweep=!!(action&&action.type==='sweep');
 const special=!!(action&&action.type==='special');
 const bulk=d.build>1.2?1.17:1;
 ctx.save();ctx.translate(f.x,ground+4);ell(ctx,0,0,49*d.build+f.y*.1,10,'#04080fb0');ctx.restore();
 ctx.save();ctx.translate(f.x,ground-f.y+(f.crouch?19:0));
 ctx.scale(f.face*1.27,(f.crouch||sweep)?1.02:1.27);
 if(special){ctx.globalAlpha=.17;ell(ctx,0,-130,69,120,d.trim);ctx.globalAlpha=1;}
 if(['vex','atlas'].includes(f.id)){
  ctx.strokeStyle=d.fur;ctx.lineWidth=17;ctx.lineCap='round';ctx.beginPath();
  ctx.moveTo(-17,-93);ctx.bezierCurveTo(-80,-114,-80,-34+Math.sin(t*3)*13,-39,-26);ctx.stroke();
  ctx.strokeStyle=d.trim;ctx.lineWidth=3;ctx.stroke();
 }
 limb(ctx,[-13,-84],[-24-stride*.5,-43],24*bulk,d.pants);
 limb(ctx,[-24-stride*.5,-43],[-18+stride,-14],19*bulk,d.pants);
 limb(ctx,[-18+stride,-14],[1+stride,-9],18*bulk,d.boots);
 limb(ctx,[-30*d.build,-146],[-46,-111+Math.sin(t*2)*2],24*d.build,d.type==='human'?d.skin:d.fur);
 limb(ctx,[-46,-111],[-28,-92],19*d.build,d.glove);
 ell(ctx,-28,-90,12*d.build,12,d.glove,'#111827',3);
 if(kicking){
  limb(ctx,[14,-85],[39,-61],28*bulk,d.pants);
  limb(ctx,[39,-61],[113,sweep?-30:-79],23*bulk,d.pants);
  limb(ctx,[113,sweep?-30:-79],[135,sweep?-28:-77],20*bulk,d.boots);
  if(special){ctx.globalAlpha=.45;ell(ctx,139,sweep?-28:-80,28,12,d.trim);ctx.globalAlpha=1;}
 }else{
  limb(ctx,[14,-85],[25+stride*.4,-42],28*bulk,d.pants);
  limb(ctx,[25+stride*.4,-42],[18-stride,-15],21*bulk,d.pants);
  limb(ctx,[18-stride,-15],[40-stride,-9],18*bulk,d.boots);
 }
 clothing(ctx,d,f.id);
 limb(ctx,[-1,-154],[-1,-170],25*d.head,d.skin);
 let elbow=[45,-119],hand=[36,-97];
 if(f.block){elbow=[41,-155];hand=[15,-178];}
 else if(upper){elbow=[59,-150];hand=[76,-207];}
 else if(punch||special){elbow=[63,-139];hand=[special?147:116,-136];}
 limb(ctx,[30*d.build,-150],elbow,26*d.build,d.type==='human'?d.skin:d.fur);
 limb(ctx,elbow,hand,22*d.build,d.type==='human'?d.skin:d.fur);
 ell(ctx,hand[0],hand[1],14*d.build,13*d.build,d.glove,'#111520',3);
 ctx.strokeStyle=d.trim;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(hand[0]-6,hand[1]-4);ctx.lineTo(hand[0]+8,hand[1]-2);ctx.stroke();
 head(ctx,d,f.id,t);
 if(f.id==='rook'){
  ell(ctx,hand[0]+2,hand[1],17,16,'#a73b46','#e6969b',3);
  ell(ctx,-28,-90,16,15,'#a73b46','#e6969b',3);
 }
 if(f.impact>0){ctx.globalAlpha=.2;ell(ctx,0,-139,48,99,'#fff6ee');ctx.globalAlpha=1;}
 if(special&&action.elapsed>.11&&action.elapsed<.58){
  ctx.strokeStyle=d.trim;ctx.lineWidth=7;ctx.globalAlpha=.57;ctx.beginPath();ctx.arc(42,-130,97,-1.4,.6);ctx.stroke();ctx.globalAlpha=1;
 }
 if(f.flash>0&&Math.floor(t*30)%2===0){ctx.globalAlpha=.17;ell(ctx,0,-135,46,96,'#ffffff');ctx.globalAlpha=1;}
 ctx.restore();
}
