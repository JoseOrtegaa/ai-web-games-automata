// Original roster palette and angular portraits. Canvas fallback shares the same designs.
import {fighterPose} from './poses.js';
const design=(species,type,skin,hair,fur,outfit,trim,pants,build,shoulder,depth,fist,exposed=false)=>({species,type,skin,hair,fur,outfit,trim,pants,build,shoulder,depth,fist,exposed,boots:'#24262a',glove:trim,leather:'#34302c',metal:'#92948d',head:1});
export const DESIGNS=Object.freeze({
 ryuzo:design('Humano','human','#b58768','#15171a','','#b8b7aa','#ded9c6','#8c908a',1,.53,.29,.19),
 drake:design('Humano','human','#a5795e','#29241f','','#a5795e','#773c35','#242930',1.13,.60,.32,.27,true),
 selene:design('Humana','human','#bb967f','#26221e','','#30474c','#779697','#233138',.88,.47,.26,.17),
 titan:design('Humano','human','#976e55','#312824','','#51463b','#95836b','#383a3a',1.35,.70,.39,.27,true),
 razor:design('Pantera','panther','#525450','','#242b2c','#293231','#9f9363','#282d2c',1.02,.56,.30,.21,true),
 fang:design('Lobo','wolf','#a8aaa2','','#626968','#434e4d','#a7a291','#343e3e',1.11,.60,.34,.23),
 brute:design('Gorila','gorilla','#766a5a','','#353b37','#444942','#88795c','#303631',1.52,.85,.45,.34,true),
 ursus:design('Oso','bear','#a88a66','','#62513e','#6e5c45','#90543e','#394039',1.44,.76,.43,.30,true)
});
export function portraitSvg(def){
 const d=DESIGNS[def.id]||DESIGNS.ryuzo,animal=d.type!=='human',c=animal?d.fur:d.skin;
 const id='portrait-'+def.id;
 const bulky=['titan','brute','ursus'].includes(def.id);
 const shape=(path,fill)=>`<path d="${path}" fill="${fill}"/>`;
 let face=shape('M78 72 L110 49 146 57 165 92 156 139 132 163 100 156 79 125Z',c);
 face+=shape('M110 49L146 57 158 100 135 130 132 163 156 139 165 92Z',animal?d.outfit:'#87654f');
 face+=shape('M79 91L97 83 109 114 100 146 79 125Z',animal?d.skin:'#c9a083');
 if(animal){
  face+=d.type==='wolf'?shape('M77 91L65 30 106 64 144 61 174 30 164 100Z',d.fur):shape('M76 82L63 67 58 81 72 104 157 98 179 86 174 67 155 77Z',d.fur);
  const end=d.type==='wolf'?184:165;
  face+=shape(`M106 108L142 106 ${end} 127 154 148 114 145 95 127Z`,d.skin);
  face+=shape(`M145 116L${end} 123 ${end-12} 136 149 132Z`,'#222725');
  face+=shape('M113 142L149 143 140 147 118 148Z','#272521');
  for(let i=0;i<4;i++)face+=shape(`M${75-i*2} ${105+i*9}L${60-i*3} ${110+i*9} ${82-i*2} ${123+i*9}Z`,d.fur);
  if(def.id==='razor')face+=shape('M90 89L97 86 108 127 101 130Z M145 87L150 87 148 108 141 111Z',d.trim);
 }else{
  face+=shape('M80 94L73 66 93 44 127 39 155 54 164 77 147 74 129 61 100 66Z',d.hair);
  face+=shape('M123 98L119 123 131 127 135 122Z','#8c644d');
  face+=shape('M114 140L139 138 130 143 118 144Z','#503b32');
  if(def.id==='selene')face+=shape('M148 51L182 66 171 184 159 173 165 76Z',d.hair);
 }
 face+=shape('M86 89L110 96 113 100 90 96Z M136 96L156 89 153 96 134 100Z',animal?d.fur:d.hair);
 face+=shape('M91 103L111 101 108 105 95 106Z M135 101L152 103 149 106 138 105Z','#111916');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 270" role="img" aria-label="${def.name}, ${d.species}"><defs><linearGradient id="${id}" x2="1" y2="1"><stop stop-color="${d.outfit}"/><stop offset="1" stop-color="#11191d"/></linearGradient></defs>
 ${shape('M0 270L25 204 85 175 97 157 142 156 164 182 213 209 240 270Z',`url(#${id})`)}
 ${shape('M95 157L97 185 119 203 144 182 143 157Z',c)}
 ${shape('M27 219L87 182 112 210 93 266 21 270Z',d.outfit)}
 ${shape('M147 181L210 216 233 270 138 270 128 210Z',d.outfit)}
 ${shape('M88 185L105 186 92 270 79 270Z M148 188L157 191 175 270 163 270Z',d.leather)}
 ${shape('M32 225L80 204 76 211 34 232Z M171 213L208 230 208 235 170 221Z',d.trim)}<g transform="translate(${bulky?-17:0} 0) scale(${bulky?1.14:1} 1)">${face}</g>
 <path d="M8 8H54M8 8V50M232 220V260H190" stroke="${d.trim}" stroke-width="2" fill="none"/><path d="M78 179L113 206 143 185" stroke="${d.trim}" stroke-width="3" fill="none"/></svg>`;
}
function poly(ctx,points,c){ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fillStyle=c;ctx.fill();ctx.strokeStyle='#141a1c';ctx.lineWidth=1.5;ctx.stroke();}
function limb(ctx,a,b,w,c){const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1,u=-dy/n*w,v=dx/n*w;poly(ctx,[[a[0]+u,a[1]+v],[b[0]+u*.62,b[1]+v*.62],[b[0]-u*.62,b[1]-v*.62],[a[0]-u,a[1]-v]],c);}
export function renderCharacter(ctx,f,t,ground){
 const d=DESIGNS[f.id]||DESIGNS.ryuzo,p=fighterPose(f,t),c=d.type==='human'?d.skin:d.fur,w=d.shoulder*60;
 ctx.save();ctx.translate(f.x,ground-f.y);ctx.scale(f.face*1.26,1.26);ctx.translate(-p.hurt*12,p.crouch?27:0);ctx.rotate(p.fallen?-1.45:p.lean*.2);
 for(const [hip,knee,foot] of [[p.rearHip,p.rearKnee,p.rearAnkle],[p.frontHip,p.frontKnee,p.frontAnkle]]){
  limb(ctx,hip,knee,14*d.build,d.pants);limb(ctx,knee,foot,10*d.build,d.pants);limb(ctx,foot,[foot[0]+22,foot[1]],9,d.boots);
 }
 poly(ctx,[[-w,-149],[-w*.9,-123],[-22,-82],[23,-82],[w*.9,-125],[w,-149],[14,-163],[-14,-163]],d.outfit);
 for(const s of [-1,1]){
  poly(ctx,[[s*5,-149],[s*w,-145],[s*(w-3),-122],[s*6,-127]],d.exposed?c:d.trim);
  for(let i=0;i<2;i++)poly(ctx,[[s*4,-121+i*13],[s*16,-120+i*13],[s*15,-111+i*13],[s*4,-112+i*13]],d.trim);
 }
 limb(ctx,[-w,-145],p.rearElbow,12*d.build,c);limb(ctx,p.rearElbow,p.rearHand,10*d.build,c);
 limb(ctx,[w,-145],p.frontElbow,13*d.build,c);limb(ctx,p.frontElbow,p.frontHand,11*d.build,c);
 for(const hand of [p.frontHand,p.rearHand])poly(ctx,[[hand[0]-12,hand[1]-10],[hand[0]+12,hand[1]-10],[hand[0]+14,hand[1]+8],[hand[0]-10,hand[1]+10]],d.glove);
 limb(ctx,[0,-158],[0,-175],9,c);
 poly(ctx,[[-21,-89],[24,-89],[24,-81],[-21,-81]],d.leather);
 poly(ctx,[[-4,-88],[7,-88],[7,-82],[-4,-82]],d.metal);
 poly(ctx,[[-15,-208],[8,-214],[22,-202],[23,-180],[10,-165],[-10,-168],[-19,-186]],c);
 poly(ctx,[[-16,-210],[8,-216],[21,-207],[12,-199],[-12,-199]],d.hair||d.fur);
 if(d.type!=='human'){
  poly(ctx,[[0,-189],[21,-192],[39,-181],[24,-173],[0,-175]],d.skin);
  for(const s of [-1,1])poly(ctx,[[s*12,-207],[s*24,-224],[s*23,-198]],d.fur);
 }
 poly(ctx,[[0,-197],[17,-195],[15,-191],[1,-193]],'#171c1b');
 poly(ctx,[[5,-174],[17,-177],[15,-173],[7,-171]],'#45362f');
 ctx.restore();
}
