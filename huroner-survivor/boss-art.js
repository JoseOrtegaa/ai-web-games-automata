import { drawAnimal } from './art.js';
const INK='#14252d', IVORY='#efe1bd', GOLD='#c4a06d';
const paths=new Map();
function shape(c,d,fill,stroke=INK,width=1.4){let p=paths.get(d);if(!p){p=new Path2D(d);paths.set(d,p);}if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);}}
function oval(c,x,y,rx,ry,fill,stroke=INK){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.3;c.stroke();}}
function line(c,d,color=GOLD,w=1.3){shape(c,d,null,color,w);}
function eyes(c,x=7,y=-9){oval(c,-x,y,2.4,3,'#f5d996');oval(c,x,y,2.4,3,'#f5d996');oval(c,-x+.5,y-1,.7,1,'#fff9df',null);oval(c,x+.5,y-1,.7,1,'#fff9df',null);}

export function drawBoss(c,e,time=0){
  const scale=e.bossType==='twins'?1.7:2.05;
  if(['twins','prism','bastion','antler'].includes(e.bossType))drawAnimal(c,{...e,scale,boss:false,time});
  c.save();c.translate(e.x,e.y);c.scale(scale,scale);c.lineJoin='round';c.lineCap='round';
  const bob=Math.sin(time*3+e.id)*.6;
  if(!['twins','prism','bastion','antler'].includes(e.bossType))oval(c,0,19,24,5,'#05131988',null);
  c.translate(0,bob);
  switch(e.bossType){
    case 'twins':
      if(e.bossPart==='blade'){
        shape(c,'M-15-2L-11 10L0 14L13 7L13-3L0-7Z','#7c8184');line(c,'M-11 1L10 1M0-5L0 11',IVORY,1);
        shape(c,'M-15-15L-13-22L-2-24L11-20L14-15L5-14L-3-17Z','#79888d');
        shape(c,'M14 12L24-22L29-29L29-19L19 14Z',IVORY,GOLD);line(c,'M12 10L23 14',GOLD,3);line(c,'M16 14L13 22','#805b51',3);
        shape(c,'M-13-7L-20 7L-12 11L-7-4Z','#9c4c49');
      }else{
        shape(c,'M-13-5L-20 18L18 18L10-5Z','#62537d');line(c,'M-4-3L-9 14L7 14L3-4','#b6a7cb');
        shape(c,'M-15-12L-12-24L0-31L14-21L16-10L9-15L0-20L-8-15Z','#4e426b',GOLD,1);
        line(c,'M22 19L22-23','#b5a58b',3);oval(c,22,-24,5,7,'#8fbeea',GOLD);
        shape(c,'M-2 0L2 5L-2 10L-6 5Z','#c5b4e4');
      }break;
    case 'prism':
      shape(c,'M-13 7L-21 1L-19-5L-9-1Z','#467f90',GOLD);
      shape(c,'M-11-18L-15-34L-7-27L-2-41L3-27L13-34L11-18Z','#78cad1','#c7f1e5');
      line(c,'M-2-37L-2-21M-12-30L-7-20M9-29L5-20','#e5ffef',.8);
      oval(c,5,-13,6,6,'#1e3545',GOLD);oval(c,5,-13,3.5,3.5,'#ea99b2','#fee3d3');
      shape(c,'M-6 7L0 15L7 7L0 2Z','#88b4a7',GOLD);
      if(e.sinceHit>=3&&e.hp<e.maxHp)line(c,'M20-32L20-20M14-26L26-26','#a5e1ad',2.3);break;
    case 'bastion':
      shape(c,'M-10-17L-10-26L1-31L14-23L15-17Z','#6d8793',GOLD);line(c,'M-8-19L13-19',IVORY,1);
      shape(c,'M-29-7L-17-12L-5-7L-6 12L-17 24L-29 12Z','#3b617c',GOLD,2);
      shape(c,'M-17-6L-11 5L-17 16L-24 5Z',e.shielded?'#92dbff':'#475b66',GOLD);
      line(c,'M18-5L24 15',GOLD,4);oval(c,23,12,6,8,'#6b7b82',GOLD);
      if(e.shielded){c.setLineDash([5,3]);oval(c,0,-2,32,41,'#81cfff10','#8edbff');c.setLineDash([]);}break;
    case 'antler':
      line(c,'M-8-22L-21-36L-23-48M-19-34L-29-35L-31-42M-23-41L-15-46M7-22L20-37L24-48M19-35L30-38L31-44M23-43L17-48',GOLD,3.4);
      shape(c,'M-13-1L-8 10L6 13L15 5L10-6Z','#7d4441',GOLD);
      shape(c,'M-12-15L-9-23L7-22L13-14L5-14L-2-17Z','#8c6c53',GOLD);break;
    case 'mortar':
      oval(c,-20,14,11,6,'#74846b');oval(c,20,14,11,6,'#74846b');
      shape(c,'M-27 5Q-28-15-12-19L12-19Q29-14 28 5L21 17L-20 17Z','#748975');
      oval(c,0,8,17,10,'#b7b592');oval(c,-15,-16,9,10,'#8ea081');oval(c,15,-16,9,10,'#8ea081');eyes(c,15,-17);
      line(c,'M-15-2Q0 6 15-2','#344a44',2);line(c,'M-19 5L-26 10M20 5L27 10',IVORY);
      shape(c,'M-23-17L-28-36L-18-40L-7-21Z','#52656d',GOLD,2);oval(c,-24,-37,6,3,'#142832',GOLD);
      oval(c,22,-1,8,9,'#9b6650',GOLD);oval(c,24,-7,5,5,'#202f35',GOLD);line(c,'M25-12L28-16','#f0c37b',2);break;
    case 'weaver':
      for(const side of [-1,1])for(let i=0;i<4;i++){const y=-13+i*9;line(c,`M${side*10} ${y}L${side*(25+i%2*5)} ${y-10}L${side*(34-i)} ${y+8}`,'#8e6778',3.4);}
      oval(c,0,0,17,23,'#523f58',GOLD);oval(c,0,-17,13,12,'#716072');
      shape(c,'M0-7L9 3L0 17L-9 3Z','#cc7976');line(c,'M0-2L4 3L0 10L-4 3Z',IVORY,1);
      eyes(c,5,-20);oval(c,-9,-15,1.5,1.8,'#eeae97');oval(c,9,-15,1.5,1.8,'#eeae97');
      shape(c,'M-8-10L-12-3L-4-7M8-10L12-3L4-7',IVORY);break;
    case 'bell':
      oval(c,-20,15,9,5,'#839380');oval(c,20,15,9,5,'#839380');
      shape(c,'M-26 12Q-30-20 0-26Q30-20 26 12Z','#526f66',GOLD,2);
      line(c,'M0-25L0 10M-21-10L0-4L21-10M-22 3L-12-16M22 3L12-16','#a5ad86',1.5);
      oval(c,0,8,12,12,'#bdba91');eyes(c,5,5);line(c,'M-5 13L5 13','#53664e');
      shape(c,'M-10-29Q-10-44 0-44Q10-44 10-29L14-25L-14-25Z','#b69865',INK,2);oval(c,0,-24,12,3,'#69553c',GOLD);oval(c,0,-22,3,4,IVORY);break;
    case 'reaper':
      shape(c,'M-11-9L-34-23L-31-6L-20 5L-24 15L-9 8M11-9L29-22L29-6L20 5L22 15L9 8Z','#3f4c61',GOLD);
      shape(c,'M-13-12Q0-29 13-12L16 20L5 15L0 21L-7 16L-17 20Z','#404053');
      shape(c,'M-12-16Q0-35 12-16L8-5L-8-5Z','#66566b',GOLD);eyes(c,4,-14);
      shape(c,'M-2-10L6-8L0-3L-5-9Z','#b8a57b');
      line(c,'M22 20L22-33','#b8a98a',3);shape(c,'M22-33Q-1-40-14-20Q-4-30 23-27Z','#dbe0d5',GOLD);break;
    case 'ember':
      for(const [x,y] of [[-15,2],[-25,-7],[-20,11]])shape(c,`M-5 10Q${x-23} ${y+20} ${x-20} ${y-14}Q${x-8} ${y+3} -8-5Z`,'#a75045',GOLD);
      oval(c,0,5,14,16,'#bc7953');oval(c,1,7,8,12,'#ecd8ad');
      shape(c,'M-15-15L-17-36L-4-25L7-26L20-37L18-12L5-1Z','#c88e61');
      shape(c,'M-10-13L3-8L16-13L6 0L0 2Z','#f1dfbd');eyes(c,7,-17);oval(c,3,-7,3,2,INK);
      line(c,'M-9 15L-12 22M9 15L13 22','#725746',4);break;
    case 'storm':
      shape(c,'M-11-13L-37-5L-31 6L-21 3L-25 15L-10 8M11-13L37-5L31 6L21 3L25 15L10 8Z','#577282',GOLD);
      oval(c,0,2,17,22,'#697f8a',GOLD);oval(c,0,7,10,15,'#b7c0b1');
      shape(c,'M-17-19L-16-32L-4-25L5-25L17-32L17-17Z','#73939f',GOLD);
      oval(c,-8,-14,9,10,'#e7dfc1');oval(c,8,-14,9,10,'#e7dfc1');eyes(c,8,-14);
      shape(c,'M-3-8L3-8L0-2Z','#c2a068');line(c,'M-16-24L-8-19M16-24L8-19','#354e65',3);
      shape(c,'M-3-28L3-42L1-31L8-34L2-23Z','#aaddf2',GOLD);break;
  }
  if(e.flash>0){c.globalAlpha=.35;oval(c,0,0,17,17,'#fff8d5',null);}
  c.restore();
}
export function drawShieldKey(c,e,time=0){
  c.save();c.translate(e.x,e.y);c.lineJoin='round';
  oval(c,0,18,17,5,'#06162277',null);
  c.strokeStyle='#8bddff';c.lineWidth=1.4;c.setLineDash([3,5]);c.beginPath();c.ellipse(0,-5,25,35,0,0,Math.PI*2);c.stroke();c.setLineDash([]);
  shape(c,'M-10-12Q-19-37-10-38Q-3-35-3-14M3-14Q0-39 9-36Q14-29 10-11Z','#66bce9','#b7eeff');
  oval(c,0,3,15,17,'#419ad1','#b7eeff');oval(c,0,5,9,11,'#a0dfff',null);
  oval(c,-9,18,7,4,'#65bcec',INK);oval(c,9,18,7,4,'#65bcec',INK);
  shape(c,'M-14-11Q-10-23 5-19L14-10L8-2Q-5 1-14-11Z','#72c8ee','#d1f6ff');
  oval(c,-6,-12,2.3,3,INK);oval(c,6,-12,2.3,3,INK);oval(c,-5,-13,.6,.8,'#fff',null);oval(c,7,-13,.6,.8,'#fff',null);
  shape(c,'M-2-5L3-5L0-2Z',IVORY);shape(c,'M0-47L5-40L0-33L-5-40Z','#bdeeff','#ecfcff');
  line(c,'M-5 5L5 5M0 0L0 10','#d5faff',2);
  c.globalAlpha=.55+.25*Math.sin(time*3);line(c,'M-29-13L-23-13M-26-16L-26-10M24 10L30 10M27 7L27 13','#c7f4ff',1.4);c.restore();
}
export function drawBossHazards(c,game){
  for(const h of game.hazards){
    c.save();c.translate(h.x,h.y);const active=h.age>=0;
    c.fillStyle=active?'#f0906555':'#ca665426';c.strokeStyle=active?'#ffe4b4':'#f2bf99';c.lineWidth=active?2.5:1.5;c.setLineDash(active?[]:[5,5]);
    c.beginPath();
    if(h.kind==='beam'){c.rotate(h.angle);c.rect(0,-h.width,h.range,h.width*2);}
    else if(h.kind==='sector'){c.moveTo(0,0);c.arc(0,0,h.range,h.angle-h.half,h.angle+h.half);c.closePath();}
    else if(h.kind==='ring'){const r=h.radius+Math.max(0,h.age)*h.rate;c.arc(0,0,r,0,Math.PI*2);c.lineWidth=active?h.width*2:2;}
    else c.arc(0,0,h.radius,0,Math.PI*2);
    if(h.kind!=='ring')c.fill();c.stroke();c.setLineDash([]);
    if(h.kind==='web'){
      for(let i=0;i<6;i++){const a=i*Math.PI/3;line(c,`M0 0L${Math.cos(a)*h.radius} ${Math.sin(a)*h.radius}`,active?'#d8b8d0':'#ad8b9d',1);}
      c.beginPath();c.arc(0,0,h.radius*.5,0,Math.PI*2);c.stroke();
    }
    if(h.kind==='lightning')line(c,active?'M10-85L-6-36L10-39L-3 2':'M-7-7L7 7M7-7L-7 7',active?'#d7f3ff':'#f4c997',active?4:1.4);
    if(active&&h.kind==='beam'&&h.damage>0)line(c,`M0 0L${h.range} 0`,'#fff0d8',4);
    c.restore();
  }
}
export function drawBossProjectile(c,s){
  c.save();c.translate(s.x,s.y);
  if(s.kind==='scythe'){c.rotate(s.age*10);line(c,'M-12 0L12 0',GOLD,3);shape(c,'M10-2Q5-18-10-11Q3-13 6 2Z',IVORY,GOLD);}
  else{oval(c,0,0,6,6,'#8565a2','#d9bbef');shape(c,'M0-4L3 0L0 4L-3 0Z','#f3d7fa',null);}
  c.restore();
}
