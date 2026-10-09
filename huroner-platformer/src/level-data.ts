import type { LevelDef, SolidDef, CollectibleDef, Surface } from './types';
const solids: SolidDef[] = [];
const ground = (x: number, width: number, surface: Surface, y = 430) => solids.push({ x, y, width, height: 540 - y, surface });
const ledge = (x: number, y: number, width: number, surface: Surface, height = 32, oneWay = false) => solids.push({ x, y, width, height, surface, oneWay });

// CASA: suelo seguro, muebles bajos y una estantería con pasadizo inferior.
ground(0, 1760, 'wood'); ground(1840, 960, 'wood');
ledge(660, 380, 230, 'cushion', 50);
ledge(1110, 372, 180, 'book', 58);
ledge(1430, 350, 210, 'cardboard', 80);
ledge(1880, 340, 110, 'book', 90);
ledge(2010, 270, 370, 'wood', 25, true);
ledge(2460, 380, 190, 'cushion', 50);

// COCHERA: cajas, banco largo, paso bajo vigas y foso de mantenimiento.
ground(2800, 1040, 'concrete'); ground(3930, 1670, 'concrete');
ledge(2940, 395, 100, 'cardboard', 35);
ledge(3080, 360, 160, 'metal', 70);
ledge(3240, 320, 590, 'metal', 30, true);
ledge(4100, 390, 100, 'concrete', 40);
ledge(4200, 350, 120, 'metal', 80);
ledge(4390, 390, 310, 'concrete', 40);
ledge(4730, 365, 100, 'metal', 65);
ledge(4860, 300, 420, 'metal', 24, true);
ledge(5360, 390, 90, 'cardboard', 40);

// PARQUE: claros largos, troncos aislados y sendero opcional por las ramas.
ground(5600, 530, 'grass'); ground(6230, 1440, 'grass'); ground(7770, 630, 'grass');
ledge(5830, 385, 230, 'bark', 45);
ledge(6330, 365, 100, 'bark', 65);
ledge(6490, 305, 190, 'bark', 24, true);
ledge(6750, 250, 360, 'bark', 22, true);
ledge(7260, 380, 120, 'rock', 50);
ledge(7440, 335, 170, 'bark', 26, true);
ledge(7980, 375, 160, 'rock', 55);

// MONTAÑA: terreno escalonado real, crestas y una cueva bajo un saliente.
// Las subidas obligatorias son de 55–65 px; huecos de 90 px con recepción amplia.
ground(8400, 240, 'rock'); ground(8640, 250, 'rock', 370);
ground(8890, 310, 'rock', 310); ground(9200, 260, 'rock', 370);
ground(9460, 360, 'rock'); ground(9910, 590, 'rock');
ground(10500, 270, 'rock', 370); ground(10860, 340, 'rock');
ledge(9860, 365, 80, 'rock', 30, true);
ledge(9980, 335, 80, 'rock', 30, true);
ledge(10080, 275, 340, 'rock', 26, true);

// CASTILLO: escalinatas, murallas anchas y almenas sobre pasos abovedados.
ground(11200, 120, 'stone'); ground(11320, 160, 'stone', 390);
ground(11480, 160, 'stone', 350); ground(11640, 180, 'stone', 310);
ground(11820, 240, 'stone', 350); ground(12150, 240, 'stone', 350);
ground(12390, 280, 'stone', 280); ground(12670, 180, 'stone', 350);
ground(12850, 230, 'stone', 390); ground(13080, 920, 'stone');
ledge(13120, 375, 210, 'stone', 55);

const collectibles: CollectibleDef[] = [];
const trail = (x: number, y: number, count: number, step = 38) => {
    for (let i = 0; i < count; i++) collectibles.push({ id: `k-${collectibles.length}`, x: x + i * step, y });
};
// Las recompensas dibujan el relieve de cada lugar, incluidas las rutas opcionales.
trail(360, 385, 5); trail(700, 340, 4); trail(1140, 332, 3); trail(1460, 310, 4);
trail(1760, 320, 3, 40); trail(1900, 300, 2); trail(2050, 230, 8); trail(2050, 390, 8); trail(2490, 340, 4);
trail(2960, 355, 2); trail(3100, 320, 3); trail(3300, 280, 12); trail(3845, 320, 3);
trail(4220, 310, 2); trail(4430, 350, 6); trail(4890, 260, 9); trail(5380, 350, 2);
trail(5860, 345, 5); trail(6135, 320, 3); trail(6350, 325, 2); trail(6520, 265, 4);
trail(6790, 210, 7); trail(6730, 385, 4); trail(7460, 295, 3); trail(7675, 320, 3); trail(8010, 335, 3);
trail(8680, 330, 4); trail(8930, 270, 6); trail(9240, 330, 4); trail(9510, 390, 4);
trail(9825, 320, 3); trail(10110, 235, 7); trail(10110, 390, 7); trail(10540, 330, 4); trail(10775, 290, 3); trail(10920, 390, 4);
trail(11350, 350, 3); trail(11510, 310, 3); trail(11680, 270, 3); trail(11860, 310, 4);
trail(12065, 245, 3); trail(12200, 310, 3); trail(12420, 240, 6); trail(12700, 310, 3); trail(13150, 335, 4); trail(13520, 385, 4);

export const LEVEL: LevelDef = {
    width: 14000, height: 540,
    spawn: { x: 180, y: 385 }, checkpoint: { x: 6830, y: 402 }, goal: { x: 13700, y: 366 },
    sections: [
        { x: 0, name: '01 · Casa por dentro', palette: 'house' },
        { x: 2800, name: '02 · La cochera', palette: 'garage' },
        { x: 5600, name: '03 · El parque', palette: 'park' },
        { x: 8400, name: '04 · La montaña', palette: 'mountain' },
        { x: 11200, name: '05 · El castillo', palette: 'castle' },
    ], solids, collectibles,
    enemies: [
        { id: 'e1', kind: 'rabbit', x: 2420, y: 400, minX: 2395, maxX: 2440 },
        { id: 'e2', kind: 'rabbit', x: 2510, y: 350, minX: 2490, maxX: 2600 },
        { id: 'e3', kind: 'armored', x: 3160, y: 330, minX: 3110, maxX: 3210 },
        { id: 'e4', kind: 'quail', x: 4050, y: 305, minX: 3980, maxX: 4200 },
        { id: 'e5', kind: 'rabbit', x: 4500, y: 360, minX: 4430, maxX: 4650 },
        { id: 'e6', kind: 'spitter', x: 5110, y: 270, minX: 5030, maxX: 5230 },
        { id: 'e7', kind: 'rabbit', x: 5990, y: 355, minX: 5870, maxX: 6020 },
        { id: 'e8', kind: 'quail', x: 7100, y: 290, minX: 7020, maxX: 7350 },
        { id: 'e9', kind: 'armored', x: 8050, y: 345, minX: 8005, maxX: 8105 },
        { id: 'e10', kind: 'spitter', x: 9340, y: 340, minX: 9270, maxX: 9410 },
        { id: 'e11', kind: 'rabbit', x: 10220, y: 400, minX: 10120, maxX: 10330 },
        { id: 'e12', kind: 'quail', x: 10860, y: 280, minX: 10790, maxX: 11010 },
        { id: 'e13', kind: 'armored', x: 11710, y: 280, minX: 11675, maxX: 11765 },
        { id: 'e14', kind: 'spitter', x: 12510, y: 250, minX: 12430, maxX: 12620 },
        { id: 'e15', kind: 'rabbit', x: 13220, y: 345, minX: 13150, maxX: 13290 },
    ],
    powerUps: [
        { id: 'p1', kind: 'oil', x: 1510, y: 319 },
        { id: 'p2', kind: 'puff', x: 2210, y: 389 },
        { id: 'p3', kind: 'meat', x: 3710, y: 287 },
        { id: 'p4', kind: 'puff', x: 4940, y: 267 },
        { id: 'p5', kind: 'meat', x: 6740, y: 394 },
        { id: 'p6', kind: 'oil', x: 7000, y: 217 },
        { id: 'p7', kind: 'meat', x: 9700, y: 395 },
        { id: 'p8', kind: 'puff', x: 10350, y: 390 },
        { id: 'p9', kind: 'meat', x: 12970, y: 355 },
    ],
    secrets: [
        { id: 'secret-books', label: '¡El pasadizo de los libros!', x: 2020, y: 300, width: 350, height: 130, surface: 'wood' },
        { id: 'secret-vent', label: '¡La gruta escondida!', x: 10090, y: 305, width: 320, height: 125, surface: 'rock' },
    ],
    scenery: [
        { kind: 'cage', x: 130, y: 430, scale: 1.2 },
        { kind: 'sock', x: 270, y: 430, scale: 1.3 },
    ],
};
