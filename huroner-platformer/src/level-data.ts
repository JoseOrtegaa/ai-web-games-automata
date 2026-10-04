import type { LevelDef, SolidDef, CollectibleDef } from './types';
const solids: SolidDef[] = [];
const ground = (x: number, width: number, surface: SolidDef['surface'] = 'wood') => solids.push({ x, y: 430, width, height: 110, surface });
const ledge = (x: number, y: number, width: number, surface: SolidDef['surface'], height = 36, oneWay = false) => solids.push({ x, y, width, height, surface, oneWay });
// Safe landing aprons surround every early lesson; later gaps never exceed 100px.
[[0, 1760], [1840, 1940], [3880, 1470], [5440, 1540], [7080, 1290], [8470, 1390], [9950, 1520], [11560, 2440]].forEach(([x, w]) => ground(x, w, x >= 9950 ? 'tile' : 'wood'));
// Hand-authored main-route landmarks, never a procedural obstacle sequence.
ledge(660, 380, 230, 'cushion', 50);
ledge(1110, 372, 180, 'book', 58);
ledge(1430, 350, 210, 'cardboard', 80);
ledge(2150, 380, 200, 'book', 50);
ledge(2420, 315, 180, 'book');
ledge(2680, 260, 390, 'wood', 30, true);
ledge(3120, 350, 160, 'cardboard', 80);
ledge(3410, 370, 210, 'cushion', 60);
ledge(4000, 380, 180, 'cushion', 50);
ledge(4260, 310, 240, 'cushion', 35);
ledge(4580, 255, 400, 'wood', 28, true);
ledge(5050, 335, 180, 'book', 95);
ledge(5620, 375, 300, 'cardboard', 55);
ledge(5980, 315, 190, 'book', 115);
ledge(6250, 250, 310, 'wood', 25, true);
ledge(7140, 375, 170, 'cushion', 55);
ledge(7400, 320, 160, 'book', 30);
ledge(7640, 260, 320, 'wood', 24, true);
ledge(8020, 340, 210, 'cushion', 90);
ledge(8650, 380, 210, 'cardboard', 50);
ledge(8940, 315, 190, 'cardboard', 115);
ledge(9220, 255, 260, 'pipe', 28, true);
ledge(9530, 345, 160, 'book', 85);
ledge(10120, 375, 160, 'tile', 55);
ledge(10360, 310, 180, 'tile', 120);
ledge(10620, 255, 340, 'pipe', 26, true);
ledge(11050, 330, 200, 'tile', 100);
ledge(11740, 375, 200, 'cardboard', 55);
ledge(12020, 315, 160, 'tile', 115);
ledge(12260, 250, 390, 'wood', 25, true);
ledge(12760, 330, 180, 'tile', 100);
ledge(13100, 375, 200, 'cushion', 55);
const collectibles: CollectibleDef[] = [];
const trail = (x: number, y: number, count: number, step = 38) => {
    for (let i = 0; i < count; i++)
        collectibles.push({ id: `k-${collectibles.length}`, x: x + i * step, y });
};
trail(360, 385, 5);
trail(700, 340, 4);
trail(1140, 332, 3);
trail(1460, 310, 4);
trail(1760, 320, 3, 40);
trail(2190, 340, 3);
trail(2450, 275, 3);
trail(2710, 220, 8);
trail(2750, 390, 7);
trail(3440, 330, 4);
trail(3800, 322, 3, 38);
trail(4040, 340, 3);
trail(4310, 270, 4);
trail(4620, 215, 8);
trail(5110, 295, 3);
trail(5360, 320, 3, 38);
trail(5660, 335, 4);
trail(6020, 275, 3);
trail(6300, 210, 6);
trail(6730, 385, 4);
trail(6990, 320, 3, 40);
trail(7170, 335, 3);
trail(7440, 280, 3);
trail(7680, 220, 6);
trail(8050, 300, 4);
trail(8380, 320, 3, 38);
trail(8690, 340, 4);
trail(8980, 275, 3);
trail(9260, 215, 5);
trail(9870, 320, 3, 38);
trail(10150, 335, 3);
trail(10400, 270, 3);
trail(10660, 215, 6);
trail(10700, 385, 6);
trail(11475, 320, 3, 38);
trail(11780, 335, 4);
trail(12050, 275, 3);
trail(12300, 210, 7);
trail(12800, 290, 3);
trail(13140, 335, 4);
export const LEVEL: LevelDef = {
    width: 14000, height: 540,
    spawn: { x: 180, y: 385 }, checkpoint: { x: 6830, y: 402 }, goal: { x: 13700, y: 366 },
    sections: [
        { x: 0, name: '01 · El nido', palette: 'nest' },
        { x: 2050, name: '02 · Entre libros', palette: 'nest' },
        { x: 3980, name: '03 · El mar de cojines', palette: 'lounge' },
        { x: 6950, name: '04 · La gran travesía', palette: 'lounge' },
        { x: 9970, name: '05 · Aromas de cocina', palette: 'kitchen' },
    ], solids, collectibles,
    enemies: [
        { id: 'e1', kind: 'rabbit', x: 1980, y: 400, minX: 1880, maxX: 2090 },
        { id: 'e2', kind: 'rabbit', x: 3320, y: 402, minX: 3290, maxX: 3400 },
        { id: 'e3', kind: 'armored', x: 4120, y: 350, minX: 4040, maxX: 4150 },
        { id: 'e4', kind: 'quail', x: 4750, y: 337, minX: 4550, maxX: 4920 },
        { id: 'e5', kind: 'rabbit', x: 5780, y: 345, minX: 5660, maxX: 5810 },
        { id: 'e6', kind: 'spitter', x: 6420, y: 220, minX: 6350, maxX: 6510 },
        { id: 'e7', kind: 'rabbit', x: 7250, y: 345, minX: 7180, maxX: 7300 },
        { id: 'e8', kind: 'quail', x: 7820, y: 330, minX: 7590, maxX: 7970 },
        { id: 'e9', kind: 'armored', x: 8790, y: 350, minX: 8690, maxX: 8820 },
        { id: 'e10', kind: 'spitter', x: 9360, y: 225, minX: 9280, maxX: 9450 },
        { id: 'e11', kind: 'rabbit', x: 10220, y: 345, minX: 10155, maxX: 10245 },
        { id: 'e12', kind: 'quail', x: 10800, y: 330, minX: 10580, maxX: 11000 },
        { id: 'e13', kind: 'armored', x: 11850, y: 345, minX: 11780, maxX: 11910 },
        { id: 'e14', kind: 'spitter', x: 12490, y: 220, minX: 12350, maxX: 12590 },
        { id: 'e15', kind: 'rabbit', x: 13220, y: 345, minX: 13140, maxX: 13270 },
    ],
    powerUps: [
        { id: 'p1', kind: 'oil', x: 1510, y: 319 },
        { id: 'p2', kind: 'puff', x: 2920, y: 389 },
        { id: 'p3', kind: 'meat', x: 3530, y: 338 },
        { id: 'p4', kind: 'puff', x: 4370, y: 275 },
        { id: 'p5', kind: 'meat', x: 6740, y: 394 },
        { id: 'p6', kind: 'oil', x: 7760, y: 225 },
        { id: 'p7', kind: 'meat', x: 9700, y: 395 },
        { id: 'p8', kind: 'puff', x: 10820, y: 390 },
        { id: 'p9', kind: 'meat', x: 13040, y: 395 },
    ],
    secrets: [
        { id: 'secret-books', label: '¡El pasadizo de los libros!', x: 2690, y: 295, width: 370, height: 135 },
        { id: 'secret-vent', label: '¡La despensa secreta!', x: 10630, y: 294, width: 325, height: 136 },
    ],
    scenery: [
        { kind: 'cage', x: 130, y: 430, scale: 1.4 },
        { kind: 'sock', x: 270, y: 430, scale: 1.6 },
        { kind: 'window', x: 900, y: 300, scale: 1.8 },
        { kind: 'plant', x: 1750, y: 430, scale: 1.4 },
        { kind: 'picture', x: 2400, y: 250, scale: 1.6 },
        { kind: 'bookshelf', x: 2840, y: 430, scale: 1.9 },
        { kind: 'lamp', x: 3740, y: 430, scale: 1.7 },
        { kind: 'sofa', x: 4490, y: 430, scale: 2.2 },
        { kind: 'picture', x: 5000, y: 190, scale: 1.6 },
        { kind: 'plant', x: 5450, y: 430, scale: 1.5 },
        { kind: 'drawers', x: 6350, y: 430, scale: 1.5 },
        { kind: 'sock', x: 6810, y: 430, scale: 1.7 },
        { kind: 'window', x: 7350, y: 245, scale: 1.8 },
        { kind: 'sofa', x: 7800, y: 430, scale: 1.7 },
        { kind: 'lamp', x: 8480, y: 430, scale: 1.4 },
        { kind: 'drawers', x: 9150, y: 430, scale: 1.9 },
        { kind: 'plant', x: 9810, y: 430, scale: 1.3 },
        { kind: 'mug', x: 10300, y: 430, scale: 2.2 },
        { kind: 'cabinet', x: 10780, y: 430, scale: 1.6 },
        { kind: 'kettle', x: 11400, y: 430, scale: 1.8 },
        { kind: 'window', x: 12000, y: 250, scale: 2 },
        { kind: 'cabinet', x: 12500, y: 430, scale: 1.6 },
        { kind: 'plant', x: 13400, y: 430, scale: 1.5 },
    ],
};
