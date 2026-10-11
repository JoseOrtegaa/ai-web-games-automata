import {WIDTH,GROUND} from './core.js';
export const STAGES=[
{id:'zenith',name:'NEON ZENITH',tag:'DISTRITO NOCTURNO',color:'#f462b7',sky:['#081128','#26214c','#702d60'],floor:['#28364a','#0d1429']},
{id:'temple',name:'TEMPLO SOLAR',tag:'ALTAR DEL OCASO',color:'#ffce7d',sky:['#24152e','#80363e','#e58859'],floor:['#6b4950','#211629']},
{id:'forge',name:'FORJA ABISAL',tag:'ACERO Y MAGMA',color:'#ff703b',sky:['#120f19','#47212c','#9c402d'],floor:['#47353a','#141a23']},
{id:'glacier',name:'BASTIÓN ÁRTICO',tag:'CIUDADELA DE HIELO',color:'#8bf4ef',sky:['#061d33','#1d526b','#498f9b'],floor:['#577a90','#152e42']},
{id:'forest',name:'BOSQUE ANCESTRAL',tag:'ÁRBOLES Y RUINAS',color:'#91cf88',sky:['#122a33','#42624f','#a0b481'],floor:['#52664b','#293f36']},
{id:'volcano',name:'CRÁTER INFERNAL',tag:'LAVA Y OBSIDIANA',color:'#ff9256',sky:['#27131a','#87392d','#ee8346'],floor:['#514049','#221b29']},
{id:'lake',name:'LAGO DE CRISTAL',tag:'HIELO Y NIEVE',color:'#c9fbff',sky:['#1c4760','#719aa6','#c2eaf0'],floor:['#8cb7c8','#366b85']},
{id:'alpine',name:'CUMBRES SAGRADAS',tag:'MONTAÑAS Y TEMPLOS',color:'#e8d9b0',sky:['#49627d','#8ba5b2','#e9c7a5'],floor:['#84878b','#414f60']}
];
const pseudo=(x,y,w,h,color,ctx)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
const poly=(ctx,pts,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.closePath();ctx.fill();};
const glow=(ctx,x,y,r,color)=>{const g=ctx.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);};
function sky(ctx,s,t){
 const g=ctx.createLinearGradient(0,0,0,GROUND);s.sky.forEach((c,i)=>g.addColorStop(i/(s.sky.length-1),c));
 ctx.fillStyle=g;ctx.fillRect(0,0,WIDTH,HEIGHT);
 const sunX=s.id==='temple'?830:s.id==='glacier'?560:735;
 const sunY=s.id==='temple'?210:120;
 const sunColor=s.id==='temple'?'#ffc988':s.id==='glacier'?'#a8e2e8':'#d0a5d6';
 glow(ctx,sunX,sunY,s.id==='temple'?310:225,s.id==='temple'?'#eea16b55':'#b278e442');
 ctx.globalAlpha=.78;ctx.fillStyle=sunColor;ctx.beginPath();ctx.arc(sunX,sunY,s.id==='temple'?75:48,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 if(s.id==='glacier'){
   for(let i=0;i<4;i++){
     ctx.strokeStyle=['#6ef4dc55','#4fc7c955','#c9b7ed42','#7baafc33'][i];ctx.lineWidth=26+i*10;
     ctx.beginPath();ctx.moveTo(-50,i*31+140);ctx.bezierCurveTo(180,10+i*23,530,240-i*21,1150,48+i*49);ctx.stroke();
   }
 }
 for(let i=0;i<90;i++){
   const x=(i*173+31)%WIDTH, y=(i*61+9)%GROUND;
   const flicker=.18+.12*Math.sin(i*9+t*.6);
   ctx.globalAlpha=flicker;ctx.fillStyle='#ffffff';ctx.fillRect(x,y,(i%3)+1,(i%3)+1);
 }
 ctx.globalAlpha=1;
}
const HEIGHT=648;
function zenith(ctx,t){
 for(let i=0;i<19;i++){
   const x=i*74-42, h=110+(i*83)%228,y=GROUND-26-h;
   pseudo(x,y,55+(i*13)%46,h+35,i%2?'#0c1931':'#13223a',ctx);
   pseudo(x+7,y+8,8,2,i%3?'#f564a8':'#5de5ea',ctx);
   for(let k=0;k<10;k++)for(let j=0;j<3;j++){
     if((i+k+j)%4)continue;
     pseudo(x+9+j*17,y+23+k*24,6,10,i%3?'#62cde782':'#ffaadd99',ctx);
   }
   if(i%4===0){
     ctx.save();ctx.translate(x+18,y+45);ctx.rotate(-.03);
     pseudo(-8,-10,49,65,'#e94d8f',ctx);pseudo(-5,-7,43,59,'#491d57',ctx);
     ctx.fillStyle='#ffc5ec';ctx.font='bold 22px sans-serif';ctx.fillText('Z',8,32);
     ctx.restore();glow(ctx,x+40,y+60,64,'#ef4d9d55');
   }
 }
 poly(ctx,[[0,410],[WIDTH,410],[WIDTH,465],[0,465]],'#18273b');
 pseudo(0,407,WIDTH,8,'#ce5cba',ctx);
 for(let i=0;i<WIDTH;i+=100){pseudo(i+15,437,52,4,'#76edeea0',ctx);}
 ctx.strokeStyle='#5bf4e733';ctx.lineWidth=2;
 for(let i=0;i<25;i++){let x=(i*127+t*160)%1300-100;ctx.beginPath();ctx.moveTo(x,100);ctx.lineTo(x-27,430);ctx.stroke();}
}
function temple(ctx,t){
 for(let z=0;z<3;z++){
  const base=380+z*20;
  for(let i=-1;i<8;i++){
   const x=i*185-40+z*33;
   poly(ctx,[[x-90,base],[x+60,240+z*34],[x+220,base]],z===0?'#543451':z===1?'#6d4050':'#804551');
  }
 }
 // ceremonial walkway, banners and roofed pavilion
 poly(ctx,[[120,365],[210,290],[930,290],[1040,365]],'#241927');
 poly(ctx,[[155,300],[230,250],[880,250],[975,300]],'#45283a');
 poly(ctx,[[180,253],[280,203],[850,203],[960,253]],'#17182b');
 pseudo(288,245,28,202,'#392238',ctx);pseudo(836,245,28,202,'#392238',ctx);
 pseudo(330,257,487,7,'#e0a267',ctx);
 for(let i=0;i<6;i++){
  const x=200+i*155;
  pseudo(x,345,10,110,'#341f35',ctx);
  glow(ctx,x+5,349,58,'#ff9c5440');
  pseudo(x-13,328,37,29,'#f7ab6a',ctx);
  poly(ctx,[[x-17,326],[x+6,311],[x+27,326]],'#481d30');
 }
 ctx.fillStyle='#ffc88d';ctx.globalAlpha=.1;
 for(let i=0;i<24;i++){const x=(i*121+t*(10+i%3*7))%WIDTH;ctx.beginPath();ctx.arc(x,230+(i*31)%240,2+i%3,0,Math.PI*2);ctx.fill();}
 ctx.globalAlpha=1;
}
function forge(ctx,t){
 glow(ctx,580,360,530,'#ef502c88');
 for(let i=0;i<10;i++){
  const x=i*130-30,h=160+(i*49)%110;
  pseudo(x,GROUND-30-h,72,h+30,i%2?'#141a27':'#27232d',ctx);
  pseudo(x+15,GROUND-h-20,38,7,'#86504b',ctx);
  pseudo(x+24,GROUND-h-65,20,55,'#111923',ctx);
  ctx.fillStyle='#fb813d';ctx.globalAlpha=.37;ctx.fillRect(x+33,GROUND-h-70,3,70);ctx.globalAlpha=1;
  glow(ctx,x+26,GROUND-h+18,55,'#fa783d55');
 }
 poly(ctx,[[0,422],[WIDTH,422],[WIDTH,495],[0,495]],'#222530');
 for(let i=0;i<12;i++){
  pseudo(i*110,431,44,9,'#a34236',ctx);
  pseudo(i*110+12,453,12,37,'#b56038',ctx);
 }
 for(let i=0;i<28;i++){
  let x=(i*79+ Math.sin(t*.7+i)*12)%WIDTH,y=470+(i*33)%110;
  glow(ctx,x,y,13,'#ff7b33bb');
  ctx.fillStyle='#ffb55d';ctx.fillRect(x,y,3,3);
 }
}
function glacier(ctx,t){
 for(let i=0;i<15;i++){
  const x=i*90-70,h=130+(i*71)%190;
  poly(ctx,[[x-50,GROUND-30],[x+33,GROUND-40-h],[x+105,GROUND-30]],i%2?'#306278':'#46768d');
  poly(ctx,[[x-13,GROUND-68-h*.55],[x+33,GROUND-40-h],[x+68,GROUND-80-h*.5]],'#d5f9f9c2');
 }
 poly(ctx,[[100,432],[250,297],[390,382],[530,303],[810,364],[1052,282],[WIDTH,421]],'#2b526a');
 ctx.strokeStyle='#bcf4fa88';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(100,432);ctx.lineTo(250,297);ctx.lineTo(390,382);ctx.lineTo(530,303);ctx.lineTo(810,364);ctx.lineTo(1052,282);ctx.stroke();
 for(let i=0;i<16;i++){
  const x=i*87-60;
  const h=32+(i*31)%60;
  poly(ctx,[[x,440],[x+15,440-h],[x+37,440]],'#a6e6eac4');
 }
 for(let i=0;i<44;i++){
   const x=(i*99+Math.sin(t*.6+i)*17)%WIDTH,y=(i*63+t*(11+i%3*8))%GROUND;
   ctx.globalAlpha=.3;ctx.fillStyle='#d6ffff';ctx.fillRect(x,y,2+i%2,2+i%2);
 }
 ctx.globalAlpha=1;
}
function natureFallback(ctx,id,t){
 if(id==='forest'){
  // Three wooded layers: distant pines, mid canopies and foreground ferns.
  for(let row=0;row<3;row++)for(let i=0;i<19;i++){
    const x=-35+i*66+row*28,y=382+row*25,h=110+((i*43+row*29)%90);
    pseudo(x-5,y-h,10,h, row===2?'#493c30':'#2a4941',ctx);
    poly(ctx,[[x-38,y-25],[x,y-h-36],[x+39,y-25]],row===0?'#26483e':row===1?'#305746':'#447453');
    poly(ctx,[[x-28,y-65],[x,y-h-45],[x+28,y-65]],row===2?'#619363':'#3a6851');
  }
  pseudo(80,433,995,30,'#647365',ctx);
  for(let i=0;i<16;i++)pseudo(110+i*58,432,28,3,i%2?'#c3a178':'#8caa73',ctx);
 }else if(id==='volcano'){
  for(let i=0;i<8;i++){
   const x=i*169-110,h=140+(i*89)%180;
   poly(ctx,[[x-80,447],[x+60,447-h],[x+200,447]],i%2?'#4b3037':'#30232d');
   poly(ctx,[[x+42,447-h*.84],[x+60,447-h],[x+76,447-h*.84]],'#fa793b');
  }
  for(let i=0;i<19;i++){
   pseudo(i*69,425+(i%2)*9,55,5,i%2?'#eb6531':'#ffa049',ctx);
   glow(ctx,i*69,434,31,'#f97d3b50');
  }
 }else if(id==='lake'){
  for(let i=0;i<12;i++){
   const x=i*111-90,h=155+(i*37)%120;
   poly(ctx,[[x-100,435],[x+10,435-h],[x+152,435]],i%2?'#5f8ba2':'#84b4bb');
   poly(ctx,[[x-32,435-h*.56],[x+10,435-h],[x+57,435-h*.56]],'#e0f5f6');
  }
  pseudo(0,427,WIDTH,40,'#92c8da',ctx);
  for(let i=0;i<35;i++)pseudo(i*47,434+(i%4)*7,26,2,'#d4f7fc',ctx);
 }else if(id==='alpine'){
  for(let row=0;row<3;row++)for(let i=0;i<10;i++){
   const x=i*141-100+row*31,h=145+(i*57+row*29)%170;
   poly(ctx,[[x-145,448],[x,448-h],[x+145,448]],row===0?'#647888':row===1?'#778d9a':'#8998a3');
   poly(ctx,[[x-47,448-h*.68],[x,448-h],[x+46,448-h*.68]],'#f5f2e9');
  }
  for(let i=0;i<12;i++)pseudo(200+i*63,421,43,11,'#b5a48f',ctx);
 }
}

function floor(ctx,s){
 const g=ctx.createLinearGradient(0,GROUND,0,HEIGHT);g.addColorStop(0,s.floor[0]);g.addColorStop(1,s.floor[1]);
 ctx.fillStyle=g;ctx.fillRect(0,GROUND,WIDTH,HEIGHT-GROUND);
 ctx.strokeStyle=s.id==='forge'?'#fc773f42':s.id==='glacier'?'#b9faff4a':s.id==='temple'?'#f6be8d3d':'#c669f047';
 ctx.lineWidth=2;
 for(let i=-11;i<=11;i++){ctx.beginPath();ctx.moveTo(WIDTH/2,GROUND-4);ctx.lineTo(WIDTH/2+i*145,HEIGHT+40);ctx.stroke();}
 for(let j=1;j<=7;j++){
   const y=GROUND+Math.pow(j/7,1.6)*(HEIGHT-GROUND);
   ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WIDTH,y);ctx.stroke();
 }
 ctx.fillStyle=s.color;ctx.globalAlpha=.62;ctx.fillRect(0,GROUND-12,WIDTH,3);ctx.globalAlpha=1;
 const shadow=ctx.createLinearGradient(0,GROUND-28,0,HEIGHT);
 shadow.addColorStop(0,'#ffffff05');shadow.addColorStop(1,'#0000003a');
 ctx.fillStyle=shadow;ctx.fillRect(0,GROUND,WIDTH,HEIGHT-GROUND);
}
export function renderStage(ctx,id,t=0){
 const s=STAGES.find(stage=>stage.id===id)||STAGES[0];
 sky(ctx,s,t);
 if(s.id==='zenith')zenith(ctx,t);
 else if(s.id==='temple')temple(ctx,t);
 else if(s.id==='forge')forge(ctx,t);
 else if(s.id==='glacier')glacier(ctx,t);
 else natureFallback(ctx,s.id,t);
 floor(ctx,s);
 // Vignette: enhances central fight contrast.
 const v=ctx.createRadialGradient(WIDTH/2,GROUND*.75,170,WIDTH/2,GROUND*.7,820);
 v.addColorStop(0,'#00000000');v.addColorStop(1,'#05060d85');
 ctx.fillStyle=v;ctx.fillRect(0,0,WIDTH,HEIGHT);
}
