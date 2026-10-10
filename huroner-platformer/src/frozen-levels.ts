import type { LevelDef, SolidDef, EnemyDef } from './types';
const ice=(x:number,width:number,y=430):SolidDef=>({x,y,width,height:540-y,surface:'ice'});
const stone=(x:number,width:number,y=430):SolidDef=>({x,y,width,height:540-y,surface:'stone'});
const platform=(x:number,y:number,width:number):SolidDef=>({x,y,width,height:22,surface:'ice',oneWay:true});
const layouts:SolidDef[][]=[
    [stone(0,630),ice(710,600),stone(1390,560),ice(2030,530),stone(2640,610),ice(3330,410),stone(3740,300),platform(820,335,170),platform(1040,280,150),platform(1520,340,170),platform(2250,330,190),platform(2800,335,180),platform(3500,315,170)],
    [stone(0,520),ice(600,480,395),ice(1160,510),stone(1750,550),ice(2380,500,385),stone(2960,510),ice(3550,490),platform(640,300,160),platform(1210,330,180),platform(1490,275,180),platform(1880,325,190),platform(2440,285,180),platform(3120,330,180),platform(3620,310,170)],
    [stone(0,600),ice(680,520),stone(1280,480,390),ice(1840,530,350),stone(2450,490,390),ice(3020,510),stone(3610,430),platform(760,325,180),platform(1350,305,170),platform(1960,260,170),platform(2550,315,160),platform(3140,315,170)],
];
const names=['El puente de escarcha','El salón de los espejos','La torre de la ventisca'];
const enemySets:EnemyDef[][]=[
    [{id:'snow-1',kind:'snowhare',x:870,y:345,minX:790,maxX:995},{id:'owl-1',kind:'owl',x:1710,y:270,minX:1590,maxX:1840},{id:'bug-1',kind:'frostbug',x:2370,y:340,minX:2270,maxX:2450},{id:'snow-2',kind:'snowhare',x:3100,y:370,minX:2980,maxX:3200},{id:'owl-2',kind:'owl',x:3550,y:270,minX:3450,maxX:3640}],
    [{id:'owl-1',kind:'owl',x:850,y:280,minX:720,maxX:990},{id:'snow-1',kind:'snowhare',x:1430,y:370,minX:1320,maxX:1560},{id:'bug-1',kind:'frostbug',x:2100,y:390,minX:1970,maxX:2210},{id:'owl-2',kind:'owl',x:2750,y:245,minX:2630,maxX:2870},{id:'snow-2',kind:'snowhare',x:3340,y:370,minX:3260,maxX:3460}],
    [{id:'bug-1',kind:'frostbug',x:930,y:370,minX:820,maxX:1080},{id:'owl-1',kind:'owl',x:1590,y:260,minX:1460,maxX:1730},{id:'snow-1',kind:'snowhare',x:2170,y:300,minX:2060,maxX:2300},{id:'bug-2',kind:'frostbug',x:2800,y:350,minX:2710,maxX:2890},{id:'owl-2',kind:'owl',x:3370,y:275,minX:3250,maxX:3500}],
];
export const FROZEN_LEVELS:LevelDef[]=layouts.map((solids,i)=>{
    const tunnel={x: i===0?2910:i===1?3090:2630,y:i===1?385:390};
    solids.push({x:tunnel.x-46,y:tunnel.y,width:92,height:540-tunnel.y,surface:'ice'});
    return {width:4040,height:540,spawn:{x:140,y:385},checkpoint:{x:i===2?3120:1810,y:385},goal:{x:3970,y:365},tunnel,
        sections:[{x:0,name:`2-${i+1} · ${names[i]}`,palette:'castle'}],solids,
        collectibles:solids.flatMap((s,n)=>Array.from({length:Math.max(1,Math.floor((s.width-100)/92))},(_,j)=>({id:`f${i}-${n}-${j}`,x:s.x+50+j*92,y:s.y-40}))).filter(p=>p.x>250 && !solids.some(s=>!s.oneWay&&p.x>s.x&&p.x<s.x+s.width&&p.y>s.y&&p.y<s.y+s.height)),
        enemies:enemySets[i],powerUps:[{id:'f-puff',kind:'puff',x:420,y:380},{id:'f-meat',kind:'meat',x:1840,y:320}],
        secrets:[{id:`f-secret-${i}`,label:'¡Un rincón bajo el hielo!',x:1450,y:315,width:170,height:105,surface:'ice'}],scenery:[],
        ...(i===2?{boss:{name:'Reina Ventisca',x:3750,minX:3620,maxX:3880,color:0x9fe9ef}}:{}),
    };
});
const secretNames=['Gruta de los cristales','Galería del lago azul','Observatorio de nieve'];
export const FROZEN_SECRETS:LevelDef[]=secretNames.map((name,i)=>{
    const width=2820+i*160;
    const solids:SolidDef[]=[];
    for(let x=0;x<width;x+=320)solids.push((x/320+i)%3===0?stone(x,Math.min(320,width-x)):ice(x,Math.min(320,width-x),x>1200&&x<1800?390:430));
    for(let x=310;x<width-200;x+=255)solids.push(platform(x,330-(Math.floor(x/255)%3)*42,145));
    const enemies:EnemyDef[]=[
        {id:`f${i}-hare`,kind:'snowhare',x:620,y:380,minX:550,maxX:720},
        {id:`f${i}-owl`,kind:'owl',x:1470,y:290,minX:1360,maxX:1600},
        {id:`f${i}-bug`,kind:'frostbug',x:2310,y:365,minX:2200,maxX:2390},
    ];
    return {width,height:540,spawn:{x:115,y:385},checkpoint:{x:1300,y:360},goal:{x:width-80,y:365},sections:[{x:0,name:`Oculto · ${name}`,palette:'castle'}],solids,enemies,
        collectibles:solids.flatMap((s,n)=>Array.from({length:2},(_,j)=>({id:`fs${i}-${n}-${j}`,x:s.x+60+j*80,y:s.y-40}))),
        powerUps:[{id:'fs-puff',kind:'puff',x:500,y:385}],secrets:[],scenery:[],
        rewards:{chest:{id:`f-chest-${i}`,x:width-240,y:385},relic:{id:['crystal','mirror','snowstar'][i],x:solids.filter(s=>s.oneWay).at(-2)!.x+75,y:solids.filter(s=>s.oneWay).at(-2)!.y-40}},
    };
});
