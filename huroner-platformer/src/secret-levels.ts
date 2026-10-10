import type { LevelDef, SolidDef, Surface } from './types';
import { RELICS } from './rewards.ts';

export const SECRET_CHAPTERS = [
    {name:'La cisterna del adarve', environment:'cistern'},
    {name:'El jardín de las raíces', environment:'roots'},
    {name:'La cámara del tesoro', environment:'treasury'},
] as const;
const floor = (x: number, width: number, y = 430, surface: Surface = 'stone'): SolidDef =>
    ({x,y,width,height:540-y,surface});
const balcony = (x: number, y: number, width: number, surface: Surface = 'stone'): SolidDef =>
    ({x,y,width,height:24,surface,oneWay:true});

// Each lower route is safe and continuous. Optional upper galleries reward exploration.
const routes: SolidDef[][] = [
    [floor(0,620),floor(620,170,375),floor(790,170,320),floor(960,280,265),
     floor(1240,180,325),floor(1420,180,380),floor(1600,400),
     floor(2000,180,375),floor(2180,180,320),floor(2360,180,375),floor(2540,260),
     balcony(330,365,150),balcony(510,300,150),balcony(700,235,170),
     balcony(1000,175,170),balcony(1470,285,160),balcony(1680,225,190),
     balcony(1910,285,150),balcony(2230,220,160),balcony(2460,300,170)],
    [floor(0,470,430,'grass'),floor(470,160,375,'grass'),floor(630,180,320,'grass'),
     floor(810,180,375,'grass'),floor(990,440,430,'grass'),floor(1430,180,375,'grass'),
     floor(1610,230,310,'grass'),floor(1840,180,370,'grass'),floor(2020,440,430,'grass'),
     floor(2460,170,375,'grass'),floor(2630,370,430,'grass'),
     balcony(280,365,130,'bark'),balcony(490,275,130,'bark'),
     balcony(860,255,160,'bark'),balcony(1100,320,160,'bark'),
     balcony(1300,255,170,'bark'),balcony(1580,205,200,'bark'),
     balcony(2040,320,140,'bark'),balcony(2240,255,160,'bark'),
     balcony(2490,195,170,'bark'),balcony(2720,305,130,'bark')],
    [floor(0,520),floor(520,180,370),floor(700,180,310),floor(880,240,250),
     floor(1120,180,310),floor(1300,180,370),floor(1480,430),
     floor(1910,170,370),floor(2080,170,310),floor(2250,260,250),
     floor(2510,170,310),floor(2680,170,370),floor(2850,350),
     balcony(300,350,130,'metal'),balcony(570,265,130,'metal'),
     balcony(930,160,170,'metal'),balcony(1320,265,130,'metal'),
     balcony(1510,310,160,'metal'),balcony(1720,245,160,'metal'),
     balcony(1960,185,180,'metal'),balcony(2310,155,160,'metal'),
     balcony(2730,265,140,'metal'),balcony(2920,325,130,'metal')],
];
// Three isolated encounters per room. Patrols remain on their own safe surfaces.
const inhabitants: LevelDef['enemies'][] = [
    [{id:'cistern-rat',kind:'rat',x:1070,y:235,minX:990,maxX:1210},
     {id:'cistern-bat',kind:'bat',x:1750,y:275,minX:1670,maxX:1830},
     {id:'cistern-rat-2',kind:'rat',x:2260,y:290,minX:2210,maxX:2325}],
    [{id:'roots-beetle',kind:'beetle',x:700,y:290,minX:660,maxX:780},
     {id:'roots-moth',kind:'moth',x:1670,y:150,minX:1580,maxX:1760},
     {id:'roots-beetle-2',kind:'beetle',x:2350,y:400,minX:2290,maxX:2410}],
    [{id:'treasury-mimic',kind:'mimic',x:985,y:220,minX:920,maxX:1080},
     {id:'treasury-ghost',kind:'ghost',x:1800,y:170,minX:1700,maxX:1900},
     {id:'treasury-mimic-2',kind:'mimic',x:2360,y:220,minX:2290,maxX:2470}],
];
export const SECRET_LEVELS: LevelDef[] = routes.map((solids,i) => {
    const width = [2800,3000,3200][i];
    const collectibles = solids.flatMap((s,n) => Array.from({length:Math.max(1,Math.floor((s.width-60)/65))},(_,j) =>
        ({id:`secret-${i}-k-${n}-${j}`,x:s.x+40+j*65,y:s.y-40})))
        .filter(p => p.x>200 && p.x<width-160 && !solids.some(s => !s.oneWay &&
            p.x>s.x && p.x<s.x+s.width && p.y>s.y && p.y<s.y+s.height));
    return {
        width,height:540,spawn:{x:130,y:385},checkpoint:{x:130,y:402},goal:{x:width-90,y:366},
        sections:[{x:0,name:`${i+1} · ${SECRET_CHAPTERS[i].name}`,palette:'castle'}],
        solids,collectibles,enemies:inhabitants[i],
        rewards:{chest:{id:`secret-${i}-chest`,x:width-160,y:405},
            relic:{id:RELICS[i].id,x:[1050,2540,2390][i],y:[135,155,115][i]}},
        powerUps:[{id:`secret-${i}-meat`,kind:'meat',x:width-230,y:390}],
        secrets:[],scenery:[],
    };
});
