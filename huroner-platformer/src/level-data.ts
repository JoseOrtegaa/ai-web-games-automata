import type { LevelDef, SolidDef } from './types';

export const WORLDS = [
    { name: 'Castillo medieval', summary: 'Cruza las murallas, explora el patio y conquista la torre del homenaje.' },
    { name: 'Fortaleza congelada', summary: 'Puentes helados, salones de hielo y torres expuestas al viento.' },
    { name: 'Castillo en ruinas', summary: 'Jardines invadidos, salones derrumbados y catacumbas.' },
    { name: 'Fortaleza volcánica', summary: 'Forjas, pasarelas sobre lava y una fortaleza en las profundidades.' },
];
export const CHAPTERS = [
    { id: '1-1', name: 'Las murallas', summary: 'Almenas, fosos cortos y un pasadizo bajo el adarve.', environment: 'ramparts' },
    { id: '1-2', name: 'El patio interior', summary: 'Arcadas, fuentes y dos caminos entre los jardines del castillo.', environment: 'courtyard' },
    { id: '1-3', name: 'Torre del homenaje', summary: 'Escalinatas de piedra y galerías elevadas hasta el gran portón.', environment: 'keep' },
] as const;
const floor = (x: number, width: number, y = 430): SolidDef => ({ x, y, width, height: 540-y, surface: 'stone' });
const ledge = (x: number, y: number, width: number, oneWay = false): SolidDef => ({ x, y, width, height: oneWay ? 24 : 430-y, surface: 'stone', oneWay });
const layouts: SolidDef[][] = [
    [floor(0, 1050), floor(1130, 1050), floor(2260, 540),
     ledge(600, 380, 200), ledge(860, 350, 140), ledge(1510, 375, 150),
     ledge(1720, 365, 100), ledge(1840, 300, 300, true), ledge(2390, 380, 150)],
    [floor(0, 840), floor(920, 1080), floor(2090, 710),
     ledge(410, 380, 120), ledge(580, 315, 240, true),
     ledge(1010, 375, 100), ledge(1160, 310, 210, true),
     ledge(1530, 365, 140), ledge(1720, 300, 220, true),
     ledge(2200, 370, 150), ledge(2410, 305, 180, true)],
    [floor(0, 500), floor(500, 160, 380), floor(660, 160, 330), floor(820, 230, 280),
     floor(1130, 160, 330), floor(1290, 310), floor(1600, 160, 375),
     floor(1760, 160, 320), floor(1920, 220, 265), floor(2220, 160, 320),
     floor(2380, 160, 375), floor(2540, 260), ledge(1330, 285, 240, true)],
];
const extensions: SolidDef[][] = [
    // Broken battlements, stepping stones and a high optional bridge.
    [floor(2800,300), floor(3180,420), floor(3680,120),
     ledge(2820,375,100), ledge(2980,320,100,true), ledge(3220,365,110),
     ledge(3400,305,180,true)],
    // Two tiers of courtyard balconies above the lower route.
    [floor(2800,520), floor(3400,400),
     ledge(2850,375,120), ledge(3010,310,180,true),
     ledge(3210,255,190,true), ledge(3450,365,130), ledge(3610,300,100,true)],
    // A second staircase and a descent to the final doorway.
    [floor(2800,150,375), floor(2950,150,320), floor(3100,210,265),
     floor(3390,140,320), floor(3530,140,375), floor(3670,130),
     ledge(2890,230,150,true)],
];
// Another 30% of route, with architecture specific to each chapter.
const finalStretch: SolidDef[][] = [
    // Small battlements lead to an optional chain of raised stone bridges.
    [floor(3800,330), floor(4210,400), floor(4690,250),
     ledge(3850,370,120), ledge(4030,310,130,true), ledge(4250,375,100),
     ledge(4400,315,160,true), ledge(4590,260,120,true)],
    // Garden terraces and staggered balconies create upper and lower paths.
    [floor(3800,440), floor(4320,340), floor(4740,200),
     ledge(3820,370,120), ledge(3980,310,180,true), ledge(4190,250,140,true),
     ledge(4370,375,100), ledge(4520,315,200,true)],
    // Broad stairs climb to the gallery, then descend towards the great gate.
    [floor(3800,170,380), floor(3970,170,330), floor(4140,210,275),
     floor(4430,170,330), floor(4600,170,380), floor(4770,170),
     ledge(4020,230,160,true), ledge(4470,240,170,true)],
];
export const LEVELS: LevelDef[] = layouts.map((base, i) => {
    const tunnel = { x: 2670, y: 380 };
    const solids = [...base, ...extensions[i], ...finalStretch[i], {x:tunnel.x-46,y:tunnel.y,width:92,height:50,surface:'stone' as const}];
    // Reward trails follow reachable surfaces; every level has its own IDs and safe checkpoint.
    const collectibles = solids.flatMap((s, n) => Array.from({ length: Math.max(1, Math.floor((s.width-80)/75)) }, (_, j) => ({
        id: `${i}-k-${n}-${j}`, x: s.x+45+j*75, y: s.y-40,
    }))).filter(c => c.x > 300 && !solids.some(s => !s.oneWay && c.x>s.x && c.x<s.x+s.width && c.y>s.y && c.y<s.y+s.height));
    const enemies: LevelDef['enemies'] = i === 0 ? [
        { id:'guard', kind:'rabbit', x:950, y:320, minX:890, maxX:975 },
        { id:'watch', kind:'armored', x:2010, y:270, minX:1880, maxX:2100 },
        { id:'archer', kind:'spitter', x:2460, y:350, minX:2420, maxX:2500 },
        { id:'bird', kind:'quail', x:2330, y:290, minX:2290, maxX:2450 },
    ] : i === 1 ? [
        { id:'guard', kind:'rabbit', x:720, y:285, minX:625, maxX:785 },
        { id:'watch', kind:'spitter', x:1250, y:280, minX:1200, maxX:1315 },
        { id:'bird', kind:'quail', x:2040, y:280, minX:1980, maxX:2160 },
        { id:'gate', kind:'armored', x:2300, y:340, minX:2230, maxX:2320 },
    ] : [
        { id:'guard', kind:'armored', x:920, y:250, minX:855, maxX:1010 },
        { id:'watch', kind:'spitter', x:1460, y:255, minX:1370, maxX:1530 },
        { id:'gate', kind:'rabbit', x:2030, y:235, minX:1960, maxX:2100 },
    ];
    return {
        width:4940, height:540, spawn:{x:180,y:385}, checkpoint:{x:1420,y:402}, goal:{x:4880,y:366}, tunnel,
        sections:[{x:0, name:`${CHAPTERS[i].id} · ${CHAPTERS[i].name}`, palette:'castle'}],
        solids, collectibles, enemies,
        powerUps:[{id:'oil',kind:'oil',x:1200,y:i===2?290:390},{id:'puff',kind:'puff',x:350,y:392},{id:'meat',kind:'meat',x:1690,y:i===2?335:390}],
        secrets: i===0 ? [{id:'passage',label:'¡El pasadizo del adarve!',x:1850,y:330,width:270,height:100,surface:'stone'}]
            : i===1 ? [{id:'arcade',label:'¡La galería oculta!',x:1730,y:330,width:200,height:100,surface:'stone'}]
            : [{id:'vault',label:'¡La cámara de la torre!',x:1340,y:320,width:220,height:110,surface:'stone'}],
        scenery:[],
    };
});
export const LEVEL = LEVELS[0];

/** Shared prototype room. Each chapter run keeps its own room progress. */
export const SECRET_LEVEL: LevelDef = {
    width:1500, height:540, spawn:{x:130,y:385}, checkpoint:{x:130,y:402}, goal:{x:1410,y:366},
    sections:[{x:0,name:'Cámara secreta · Bajo el castillo',palette:'castle'}],
    solids:[floor(0,1500),ledge(330,375,140),ledge(530,310,180,true),
        ledge(800,365,130),ledge(1000,300,180,true)],
    collectibles:Array.from({length:15},(_,i)=>({id:`secret-k-${i}`,x:230+i*75,
        y:i>=2&&i<=3?335:i>=4&&i<=6?270:i>=8&&i<=9?325:i>=11&&i<=12?260:390})),
    enemies:[], powerUps:[{id:'secret-meat',kind:'meat',x:1230,y:390}],
    secrets:[], scenery:[],
};
