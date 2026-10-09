import Phaser from 'phaser';

type Ctx = CanvasRenderingContext2D;
const WIDTH = 2800;
const HEIGHT = 540;

// Original, deterministic canvas scenery. Large silhouettes establish the place;
// subdued values and fine grain leave the bright collision edges easy to read.
function rect(c: Ctx, color: string, x: number, y: number, w: number, h: number) {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function poly(c: Ctx, color: string, points: number[]) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
    c.closePath();
    c.fill();
}
function line(c: Ctx, color: string, points: number[], width = 2) {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
    c.stroke();
}
function ellipse(c: Ctx, color: string, x: number, y: number, rx: number, ry: number) {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fill();
}
function gradient(c: Ctx, colors: string[], y = 0, h = HEIGHT) {
    const g = c.createLinearGradient(0, y, 0, y + h);
    colors.forEach((color, i) => g.addColorStop(i / (colors.length - 1), color));
    c.fillStyle = g;
    c.fillRect(0, y, WIDTH, h);
}
function random(seed: number) {
    return () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
}
function grain(c: Ctx, seed: number, count = 4700) {
    const rand = random(seed);
    for (let i = 0; i < count; i++) {
        const x = Math.floor(rand() * WIDTH / 2) * 2;
        const y = Math.floor(rand() * HEIGHT / 2) * 2;
        rect(c, i % 2 ? 'rgba(255,246,218,0.035)' : 'rgba(9,17,24,0.04)', x, y, 2 + rand() * 5, 2);
    }
}
function texture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void) {
    if (scene.textures.exists(key)) return;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const c = canvas.getContext('2d')!;
    c.imageSmoothingEnabled = false;
    draw(c);
    scene.textures.addCanvas(key, canvas);
}
function masonry(c: Ctx, x: number, y: number, w: number, h: number, cellW: number, cellH: number, dark: string, light: string) {
    c.save();
    c.beginPath();
    c.rect(x, y, w, h);
    c.clip();
    for (let row = 0; row < h / cellH; row++) {
        const yy = y + row * cellH;
        rect(c, dark, x, yy, w, 2);
        for (let xx = x - (row % 2) * cellW / 2; xx < x + w; xx += cellW) {
            rect(c, dark, xx, yy, 2, cellH);
            rect(c, light, xx + 4, yy + 4, cellW - 8, 1);
        }
    }
    c.restore();
}
function arch(c: Ctx, color: string, x: number, y: number, w: number, h: number) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(x, y + h);
    c.lineTo(x, y + w / 2);
    c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
    c.lineTo(x + w, y + h);
    c.closePath();
    c.fill();
}

function house(c: Ctx) {
    gradient(c, ['#55514b', '#777164', '#60594e']);
    // Plaster, restrained wallpaper seams, deep timber ceiling and wainscot.
    for (let x = 0; x < WIDTH; x += 144) {
        rect(c, 'rgba(215,202,171,0.075)', x, 30, 2, 352);
        for (let y = 58; y < 330; y += 62) {
            poly(c, 'rgba(213,196,165,0.055)', [x + 67, y, x + 73, y + 11, x + 67, y + 22, x + 61, y + 11]);
        }
    }
    rect(c, '#373833', 0, 0, WIDTH, 30);
    rect(c, '#89806c', 0, 30, WIDTH, 5);
    rect(c, '#393d38', 0, 363, WIDTH, 177);
    for (let x = 0; x < WIDTH; x += 150) {
        rect(c, '#56564a', x + 10, 387, 126, 110);
        rect(c, '#42483f', x + 15, 392, 117, 105);
    }
    rect(c, '#87785c', 0, 361, WIDTH, 7);
    rect(c, '#2f342e', 0, 372, WIDTH, 6);
    for (const x of [260, 1090, 2030]) {
        rect(c, '#393c37', x - 14, 58, 224, 251);
        rect(c, '#9a927c', x - 8, 64, 212, 238);
        const g = c.createLinearGradient(0, 73, 0, 288);
        g.addColorStop(0, '#a4b4b0'); g.addColorStop(1, '#b3b59a');
        c.fillStyle = g; c.fillRect(x, 73, 195, 216);
        poly(c, '#7d8e7e', [x, 243, x + 34, 206, x + 58, 217, x + 99, 175, x + 144, 218, x + 170, 199, x + 195, 230, x + 195, 289, x, 289]);
        rect(c, '#454c42', x + 93, 72, 8, 219);
        rect(c, '#d1c5a0', x + 91, 72, 3, 219);
        rect(c, '#4c5348', x, 174, 195, 7);
        rect(c, '#bfb69b', x - 17, 299, 231, 8);
        poly(c, '#585344', [x - 28, 58, x + 19, 58, x + 10, 117, x - 2, 203, x - 19, 281, x - 35, 278]);
        poly(c, '#78715d', [x - 25, 59, x - 7, 59, x - 13, 167, x - 26, 254]);
        poly(c, '#555043', [x + 177, 58, x + 224, 58, x + 229, 280, x + 207, 285, x + 191, 192]);
        // Window light has direction and falloff, with no animated particles.
        poly(c, 'rgba(233,216,160,0.075)', [x + 12, 180, x + 190, 180, x + 390, 487, x + 124, 487]);
        poly(c, 'rgba(233,216,160,0.035)', [x + 18, 187, x + 76, 187, x + 273, 483, x + 182, 483]);
    }
    // A low sofa, a portrait, a radiator and reading nook are background props.
    rect(c, '#433e34', 632, 107, 182, 129);
    rect(c, '#a18b67', 637, 112, 172, 119);
    rect(c, '#414d49', 646, 121, 154, 101);
    poly(c, '#667161', [646, 204, 679, 155, 713, 186, 754, 142, 800, 196, 800, 222, 646, 222]);
    ellipse(c, '#a79c78', 765, 144, 13, 13);
    rect(c, '#444740', 584, 344, 318, 112);
    rect(c, '#5d6355', 596, 329, 294, 91);
    for (let i = 0; i < 3; i++) {
        rect(c, '#6c7060', 606 + i * 91, 341, 84, 58);
        rect(c, '#747765', 610 + i * 91, 341, 76, 3);
        rect(c, '#777765', 605 + i * 92, 407, 85, 12);
        rect(c, '#40483f', 604 + i * 92, 421, 85, 24);
    }
    rect(c, '#555c4f', 573, 371, 30, 82);
    rect(c, '#555c4f', 884, 371, 30, 82);
    rect(c, '#2e3732', 601, 453, 13, 29);
    rect(c, '#2e3732', 876, 453, 13, 29);
    rect(c, '#45433b', 1540, 164, 14, 319);
    poly(c, '#a59a77', [1497, 145, 1599, 145, 1622, 213, 1474, 213]);
    poly(c, '#7c765d', [1568, 145, 1599, 145, 1622, 213, 1579, 213]);
    ellipse(c, '#373d35', 1546, 480, 53, 8);
    rect(c, '#505249', 1662, 275, 210, 203);
    for (let i = 0; i < 3; i++) {
        rect(c, '#393f38', 1674, 287 + i * 61, 186, 50);
        for (let b = 0; b < 10; b++) {
            const h = 25 + (b * 7 + i * 11) % 18;
            rect(c, ['#6f6554', '#677568', '#81755c', '#69635b'][b % 4], 1680 + b * 17, 333 + i * 61 - h, 12, h);
            rect(c, '#969077', 1682 + b * 17, 338 + i * 61 - h, 8, 2);
        }
        rect(c, '#7b715b', 1668, 337 + i * 61, 200, 4);
    }
    // Structural door jamb makes the house-to-garage transition intentional.
    rect(c, '#3a403a', 2738, 32, 62, 508);
    rect(c, '#9b8d6c', 2738, 35, 10, 505);
    rect(c, '#222b29', 2763, 44, 37, 496);
    grain(c, 11);
}

function garage(c: Ctx) {
    gradient(c, ['#313e45', '#515b5b', '#3e4848']);
    masonry(c, 0, 44, WIDTH, 432, 152, 65, '#414c4d', '#616966');
    rect(c, '#202e36', 0, 0, WIDTH, 43);
    for (let x = 150; x < WIDTH; x += 675) {
        poly(c, '#26343b', [x, 24, x + 35, 24, x + 190, 130, x + 168, 144]);
        rect(c, '#2c393d', x, 20, 17, 463);
        rect(c, '#6b736f', x, 20, 3, 450);
        rect(c, '#808d86', x + 204, 49, 204, 11);
        rect(c, '#bdc6ac', x + 216, 59, 179, 5);
        poly(c, 'rgba(172,187,166,0.035)', [x + 208, 63, x + 398, 63, x + 481, 431, x + 119, 431]);
    }
    // Rolling shutter with recessed rails, alternate door and fixed windows.
    rect(c, '#222f36', 338, 100, 662, 384);
    rect(c, '#68716e', 356, 110, 626, 374);
    for (let y = 112; y < 480; y += 34) {
        rect(c, '#76807a', 359, y, 620, 2);
        rect(c, '#4b5757', 359, y + 29, 620, 5);
    }
    for (let x = 412; x < 950; x += 144) {
        rect(c, '#36484f', x, 147, 105, 56);
        rect(c, '#819798', x + 4, 151, 97, 48);
        poly(c, '#9aaba5', [x + 6, 153, x + 70, 153, x + 26, 196, x + 6, 196]);
    }
    // Recognisable parked estate car, deliberately low contrast behind play.
    ellipse(c, 'rgba(17,30,35,0.32)', 717, 474, 319, 18);
    poly(c, '#35464a', [407, 387, 461, 377, 520, 302, 732, 294, 832, 337, 910, 371, 961, 391, 967, 451, 409, 451]);
    poly(c, '#65746e', [416, 388, 476, 377, 532, 309, 729, 303, 827, 349, 913, 378, 951, 396, 951, 436, 418, 436]);
    poly(c, '#283c45', [492, 371, 539, 316, 621, 314, 621, 370]);
    poly(c, '#30444b', [632, 314, 721, 311, 802, 351, 802, 370, 632, 370]);
    poly(c, '#718787', [502, 366, 543, 321, 596, 319, 552, 366]);
    line(c, '#87928a', [419, 393, 936, 393], 3);
    line(c, '#445954', [626, 379, 626, 433], 2);
    rect(c, '#34463f', 643, 382, 25, 5);
    rect(c, '#9ea691', 921, 392, 27, 13);
    rect(c, '#796b5d', 418, 394, 15, 14);
    for (const x of [506, 850]) {
        ellipse(c, '#253038', x, 444, 40, 41);
        ellipse(c, '#4c595a', x, 444, 23, 25);
        ellipse(c, '#7c847a', x, 444, 14, 15);
        ellipse(c, '#3c4a4c', x, 444, 5, 6);
    }
    // Tool wall and bench: silhouettes include spanners, saw and coiled hose.
    rect(c, '#665e4d', 1184, 133, 376, 198);
    for (let x = 1190; x < 1550; x += 18)
        for (let y = 141; y < 322; y += 18) rect(c, '#464c45', x, y, 2, 2);
    for (let i = 0; i < 6; i++) {
        const x = 1215 + i * 48, y = 167 + (i % 2) * 28;
        line(c, '#a6aaa0', [x, y + 7, x, y + 72], 6);
        line(c, '#a6aaa0', [x - 9, y, x - 7, y + 13, x + 7, y + 13, x + 9, y], 5);
    }
    rect(c, '#807255', 1140, 351, 470, 13);
    rect(c, '#293b3e', 1160, 367, 15, 123);
    rect(c, '#293b3e', 1573, 367, 15, 123);
    rect(c, '#73594b', 1430, 324, 104, 26);
    rect(c, '#8f7960', 1438, 317, 87, 8);
    rect(c, '#34494b', 1750, 115, 235, 372);
    rect(c, '#697b75', 1764, 131, 208, 9);
    rect(c, '#70847f', 1766, 147, 204, 137);
    for (let y = 160; y < 277; y += 24) rect(c, '#4d6561', 1775, y, 186, 2);
    rect(c, '#b0ad91', 1934, 321, 7, 28);
    for (let n = 0; n < 4; n++) {
        ellipse(c, '#26383d', 2110, 442 - n * 34, 59, 23);
        ellipse(c, '#445455', 2110, 435 - n * 34, 56, 18);
        ellipse(c, '#293a3f', 2110, 435 - n * 34, 32, 9);
    }
    // A large open bay reveals the garden before crossing the threshold.
    rect(c, '#283b40', 2340, 95, 460, 445);
    rect(c, '#607b70', 2362, 110, 438, 430);
    poly(c, '#435f50', [2362, 354, 2424, 275, 2468, 304, 2547, 256, 2657, 310, 2800, 261, 2800, 540, 2362, 540]);
    rect(c, '#84928a', 2331, 82, 20, 458);
    rect(c, '#818a7d', 2331, 82, 469, 17);
    grain(c, 23);
}

function tree(c: Ctx, x: number, base: number, height: number, seed: number, distant = false) {
    const rand = random(seed), top = base - height;
    const trunk = distant ? '#54665c' : '#414e42';
    poly(c, trunk, [x - 13, base, x - 8, top + 65, x + 3, top + 27, x + 15, base]);
    line(c, trunk, [x, top + 169, x - 62, top + 83, x - 108, top + 59], 13);
    line(c, trunk, [x + 1, top + 120, x + 55, top + 67, x + 90, top + 62], 10);
    if (!distant) line(c, '#6c6c50', [x - 5, base - 8, x - 2, top + 119], 3);
    for (let i = 0; i < 24; i++) {
        const px = x - 121 + rand() * 242, py = top - 9 + rand() * 107;
        const size = 28 + rand() * 51;
        const color = distant ? ['#65786a', '#6d8070', '#61766a'][i % 3] : ['#3d5544', '#4a6149', '#52694d', '#617554'][i % 4];
        poly(c, color, [px - size, py + 10, px - size * 0.7, py - size * 0.3, px - 4, py - size * 0.5, px + size * 0.55, py - size * 0.3, px + size, py + 9, px + size * 0.7, py + size * 0.5, px - size * 0.6, py + size * 0.55]);
        if (!distant) rect(c, '#768363', px - size / 3, py - size / 4, size / 2, 2);
    }
}
function park(c: Ctx) {
    gradient(c, ['#7b9698', '#b8bda6', '#788d6b']);
    // Distant buildings and hedges give way to open natural terrain.
    for (let x = 12; x < WIDTH; x += 179) {
        rect(c, '#91a294', x, 206 + (x % 53), 109, 178);
        poly(c, '#829587', [x - 8, 211 + (x % 53), x + 48, 176 + (x % 53), x + 118, 211 + (x % 53)]);
    }
    poly(c, '#83977b', [0, 351, 239, 323, 441, 340, 715, 308, 1050, 344, 1377, 315, 1721, 338, 1979, 317, 2444, 342, 2800, 313, 2800, 540, 0, 540]);
    for (const [x, h] of [[100, 240], [710, 251], [1320, 242], [1980, 251], [2570, 223]]) tree(c, x, 403, h, x + 1, true);
    poly(c, '#71896a', [0, 402, 350, 363, 610, 386, 974, 351, 1300, 396, 1600, 361, 1920, 375, 2240, 342, 2800, 388, 2800, 540, 0, 540]);
    // A winding path recedes through the lawn rather than a straight colored band.
    poly(c, '#a29e80', [0, 471, 250, 424, 590, 437, 980, 387, 1180, 386, 1500, 428, 1720, 414, 2090, 369, 2360, 381, 2800, 454, 2800, 488, 2310, 407, 2090, 393, 1740, 449, 1480, 468, 1130, 411, 1010, 410, 620, 479, 263, 471, 0, 522]);
    for (const [x, h] of [[383, 343], [1192, 317], [1830, 364], [2535, 334]]) tree(c, x, 492, h, x);
    // Low ornamental fence and park furniture are set into the distant path.
    line(c, '#657663', [50, 404, 964, 404], 3);
    line(c, '#657663', [50, 436, 964, 436], 3);
    for (let x = 61; x < 980; x += 46) {
        rect(c, '#60735e', x, 390, 5, 67);
        poly(c, '#73816a', [x - 2, 390, x + 2, 382, x + 7, 390]);
    }
    for (const x of [798, 2058]) {
        for (let i = 0; i < 4; i++) rect(c, i % 2 ? '#786e50' : '#887b57', x, 365 + i * 12, 185, 8);
        rect(c, '#8d805a', x - 7, 418, 197, 9);
        line(c, '#3e5145', [x + 18, 397, x + 18, 451, x + 11, 463], 7);
        line(c, '#3e5145', [x + 161, 397, x + 161, 451, x + 168, 463], 7);
        rect(c, '#4e5e4b', x + 215, 391, 41, 67);
        rect(c, '#6d7c5e', x + 211, 388, 49, 7);
    }
    for (const x of [627, 1565, 2350]) {
        rect(c, '#3e5448', x, 230, 6, 247);
        poly(c, '#3b5147', [x - 18, 219, x + 24, 219, x + 18, 253, x - 12, 253]);
        rect(c, '#bbb78d', x - 10, 224, 25, 23);
        poly(c, '#405748', [x - 24, 220, x + 3, 207, x + 30, 220]);
    }
    const rand = random(67);
    for (let i = 0; i < 230; i++) {
        const x = rand() * WIDTH, y = 434 + rand() * 106;
        line(c, i % 2 ? '#607551' : '#7f895c', [x - 4, y - 6, x, y, x + 4, y - 9], 2);
    }
    // Stone retaining wall connects the garden to the mountain trail.
    poly(c, '#657466', [2670, 436, 2703, 400, 2740, 420, 2770, 386, 2800, 399, 2800, 540, 2670, 540]);
    grain(c, 34);
}

function ridge(c: Ctx, points: number[], color: string) {
    poly(c, color, [0, HEIGHT, ...points, WIDTH, HEIGHT]);
}
function mountain(c: Ctx) {
    gradient(c, ['#697f91', '#b0bcc0', '#76888a']);
    const cloud = c.createLinearGradient(0, 100, 0, 215);
    cloud.addColorStop(0, 'rgba(211,214,205,0)'); cloud.addColorStop(0.5, 'rgba(211,214,205,0.16)'); cloud.addColorStop(1, 'rgba(211,214,205,0)');
    c.fillStyle = cloud; c.fillRect(0, 100, WIDTH, 115);
    ridge(c, [0, 263, 171, 191, 273, 221, 419, 96, 567, 208, 716, 143, 917, 252, 1128, 164, 1276, 226, 1470, 63, 1699, 230, 1880, 130, 2093, 225, 2340, 105, 2611, 232, 2800, 141], '#95a6ad');
    ridge(c, [0, 327, 227, 250, 365, 291, 574, 144, 776, 291, 921, 250, 1127, 315, 1310, 209, 1523, 288, 1697, 165, 1871, 278, 2037, 215, 2245, 324, 2487, 181, 2671, 264, 2800, 236], '#778f9a');
    poly(c, '#b7c2bd', [515, 187, 574, 144, 643, 197, 605, 185, 579, 199, 562, 178, 542, 195]);
    poly(c, '#b4c0bd', [1649, 203, 1697, 165, 1748, 198, 1721, 195, 1694, 185, 1682, 205]);
    poly(c, '#a7b7b4', [2440, 216, 2487, 181, 2536, 213, 2506, 205, 2489, 219, 2473, 205]);
    // Asymmetrical rocky silhouettes and slanted strata, never house panels.
    ridge(c, [0, 405, 113, 375, 197, 274, 300, 250, 381, 309, 490, 304, 591, 414, 747, 447, 827, 366, 1010, 332, 1110, 255, 1201, 300, 1264, 286, 1389, 405, 1588, 434, 1750, 333, 1861, 279, 1960, 317, 2089, 291, 2202, 400, 2381, 447, 2550, 344, 2691, 288, 2800, 325], '#576f78');
    for (const [x, y] of [[197, 274], [1110, 255], [1861, 279], [2691, 288]]) {
        poly(c, '#6d8386', [x, y, x + 84, y - 23, x + 39, y + 92, x + 111, y + 122, x + 35, y + 253, x - 90, 540, x - 30, y + 131]);
        poly(c, '#455e69', [x + 84, y - 23, x + 159, y + 42, x + 96, y + 109, x + 118, y + 185, x + 37, y + 249, x + 89, y + 117, x + 39, y + 92]);
        line(c, '#81918e', [x - 22, y + 104, x + 44, y + 81, x + 92, y + 79], 2);
        line(c, '#405b65', [x - 41, y + 155, x + 30, y + 140, x + 74, y + 114], 3);
        line(c, '#405b65', [x - 51, y + 208, x + 10, y + 192, x + 67, y + 165], 3);
    }
    // A narrow distant waterfall disappears into the haze of the ravine.
    poly(c, '#7d9698', [1270, 318, 1280, 319, 1294, 384, 1287, 420, 1303, 485, 1283, 505, 1279, 424, 1280, 381]);
    line(c, '#a0b2af', [1274, 323, 1288, 385, 1283, 419, 1294, 470], 3);
    for (let i = 0; i < 19; i++) {
        const x = i * 158 + 33, base = 449 + (i % 3) * 17, h = 49 + (i * 17) % 37;
        rect(c, '#3f5c5e', x - 2, base - h, 5, h);
        for (let n = 0; n < 4; n++) {
            const yy = base - h + n * h * 0.19, w = 14 + n * 8;
            poly(c, '#466664', [x, yy, x + w, yy + h * 0.4, x - w, yy + h * 0.4]);
        }
    }
    const fog = c.createLinearGradient(0, 366, 0, 540);
    fog.addColorStop(0, 'rgba(168,189,185,0)'); fog.addColorStop(1, 'rgba(168,189,185,0.4)');
    c.fillStyle = fog; c.fillRect(0, 366, WIDTH, 174);
    // Last buttress foreshadows the castle entrance.
    rect(c, '#525f63', 2748, 206, 52, 334);
    masonry(c, 2748, 206, 52, 334, 50, 30, '#454f56', '#708080');
    grain(c, 51);
}

function castle(c: Ctx) {
    gradient(c, ['#303c50', '#657582', '#6e7b7d']);
    ellipse(c, '#afb6ac', 2200, 104, 33, 33);
    ellipse(c, '#697983', 2215, 93, 30, 30);
    // Far ramparts establish depth, with widely spaced recognisable towers.
    poly(c, '#505e6b', [0, 363, 270, 349, 510, 362, 720, 337, 1090, 353, 1400, 339, 1850, 359, 2210, 324, 2500, 351, 2800, 337, 2800, 540, 0, 540]);
    for (const x of [150, 880, 1580, 2460]) {
        rect(c, '#4b5966', x, 190, 125, 261);
        poly(c, '#34465b', [x - 20, 196, x + 61, 110, x + 146, 196]);
        line(c, '#76858a', [x - 13, 196, x + 60, 115], 2);
        arch(c, '#273d4d', x + 47, 226, 26, 65);
    }
    // Near curtain wall with deep arch recesses and massive masonry piers.
    rect(c, '#515c64', 0, 304, WIDTH, 236);
    masonry(c, 0, 306, WIDTH, 234, 101, 36, '#434f58', '#647077');
    rect(c, '#738080', 0, 294, WIDTH, 7);
    rect(c, '#394951', 0, 301, WIDTH, 8);
    for (let x = 14; x < WIDTH; x += 95) {
        rect(c, '#59666d', x, 269, 52, 32);
        rect(c, '#7b8784', x, 267, 52, 3);
    }
    for (const x of [100, 575, 1050, 1530, 1995, 2480]) {
        arch(c, '#76817f', x, 324, 178, 216);
        arch(c, '#354955', x + 12, 337, 154, 203);
        arch(c, '#293e4b', x + 26, 350, 126, 190);
        line(c, '#657572', [x + 44, 430, x + 44, 540], 5);
        line(c, '#657572', [x + 131, 430, x + 131, 540], 5);
        line(c, '#657572', [x + 27, 441, x + 151, 441], 5);
        // Wedge-shaped arch stones communicate carved construction.
        const cx = x + 89, cy = 413;
        for (let n = 0; n <= 8; n++) {
            const a = Math.PI + n * Math.PI / 8;
            line(c, '#4c5a60', [cx + Math.cos(a) * 77, cy + Math.sin(a) * 77, cx + Math.cos(a) * 89, cy + Math.sin(a) * 89], 2);
        }
    }
    for (const x of [352, 1286, 2255]) {
        rect(c, '#43525d', x, 114, 173, 426);
        rect(c, '#637172', x + 6, 119, 129, 421);
        rect(c, '#505e63', x + 135, 120, 32, 420);
        masonry(c, x + 6, 121, 160, 419, 63, 32, '#47575e', '#788480');
        rect(c, '#7c8781', x - 10, 112, 193, 9);
        rect(c, '#344653', x - 8, 121, 189, 7);
        for (let b = 0; b < 4; b++) {
            rect(c, '#667572', x - 8 + b * 52, 81, 35, 33);
            rect(c, '#8a9387', x - 8 + b * 52, 79, 35, 3);
        }
        for (const y of [168, 285]) {
            arch(c, '#93a091', x + 47, y, 43, 88);
            arch(c, '#293e48', x + 52, y + 5, 32, 83);
            rect(c, '#858d76', x + 65, y + 12, 4, 63);
        }
        poly(c, '#536b66', [x + 143, 221, x + 180, 221, x + 180, 340, x + 163, 329, x + 143, 342]);
        line(c, '#8a947f', [x + 149, 224, x + 173, 224, x + 173, 319], 2);
    }
    // Recessed entrance and restrained amber torchlight at the destination.
    arch(c, '#8b9280', 2620, 289, 155, 251);
    arch(c, '#2a3b45', 2631, 303, 132, 237);
    arch(c, '#4b5048', 2640, 312, 114, 228);
    for (let x = 2644; x < 2753; x += 17) rect(c, '#313f3f', x, 372, 3, 168);
    rect(c, '#70796a', 2640, 409, 113, 9);
    rect(c, '#70796a', 2640, 486, 113, 9);
    for (const x of [982, 1930, 2576]) {
        const g = c.createRadialGradient(x, 359, 3, x, 359, 63);
        g.addColorStop(0, 'rgba(213,169,98,0.18)'); g.addColorStop(1, 'rgba(213,169,98,0)');
        c.fillStyle = g; c.fillRect(x - 63, 296, 126, 126);
        rect(c, '#343f42', x - 4, 361, 8, 30);
        poly(c, '#aa8a56', [x - 8, 362, x - 5, 347, x + 1, 335, x + 2, 350, x + 8, 354, x + 6, 363]);
        rect(c, '#dbbf7c', x - 2, 352, 4, 10);
    }
    grain(c, 89);
}

/** Static panoramas, one image per zone; no scenery collision or per-frame drawing. */
export function createEnvironment(scene: Phaser.Scene): void {
    const zones = [house, garage, park, mountain, castle];
    zones.forEach((draw, i) => {
        const key = `environment-${i}`;
        texture(scene, key, WIDTH, HEIGHT, draw);
        scene.add.image(i * WIDTH, 0, key).setOrigin(0, 0).setDepth(-30);
    });
}

/** Seamless material bodies. Collision lips are drawn once per platform in scene.ts. */
export function createSurfaceArt(scene: Phaser.Scene): void {
    for (const material of ['metal', 'concrete', 'grass', 'bark', 'rock', 'stone']) {
        texture(scene, `surface-${material}`, material === 'rock' ? 256 : 64, material === 'rock' ? 256 : 64, c => {
            const rand = random(material.length * 135 + material.charCodeAt(0));
            if (material === 'metal') {
                rect(c, '#4c5b60', 0, 0, 64, 64);
                rect(c, '#6e7f81', 0, 8, 64, 13);
                rect(c, '#34454d', 0, 27, 64, 31);
                rect(c, '#728184', 0, 54, 64, 5);
                for (const x of [8, 49]) {
                    rect(c, '#2c414a', x, 13, 7, 7);
                    rect(c, '#b1b9a9', x + 1, 14, 4, 3);
                }


            }
            if (material === 'concrete') {
                rect(c, '#747c76', 0, 0, 64, 64);
                for (let i = 0; i < 65; i++) rect(c, i % 2 ? '#858c7f' : '#646f69', rand() * 64, rand() * 64, 2 + rand() * 4, 2);
                line(c, '#55655f', [49, 21, 40, 30, 43, 44, 34, 58]);


            }
            if (material === 'grass') {
                rect(c, '#64513c', 0, 0, 64, 64);
                for (let i = 0; i < 33; i++) rect(c, i % 2 ? '#817153' : '#514534', rand() * 64, rand() * 64, 3 + rand() * 6, 3);

                line(c, '#403f2f', [12, 19, 14, 29, 8, 35, 9, 45]);
            }
            if (material === 'bark') {
                rect(c, '#68533b', 0, 0, 64, 64);
                for (let i = 0; i < 8; i++) {
                    const y = 10 + i * 7;
                    line(c, '#423f2f', [0, y, 17, y - 2, 29, y + 1, 49, y - 1, 64, y], 2);
                    line(c, '#89714c', [8, y + 2, 33, y + 3, 47, y + 1], 2);
                }
                ellipse(c, '#3f3c2c', 44, 33, 10, 5);
                ellipse(c, '#8c754e', 44, 33, 6, 2);


            }
            if (material === 'rock') {
                rect(c, '#596d70', 0, 0, 256, 256);
                for (let row = 0; row < 4; row++) for (let col = -1; col < 5; col++) {
                    const x = col * 70 + (row % 2) * 31, y = row * 66;
                    const cut = 9 + rand() * 17;
                    poly(c, ['#667a7b','#607477','#566d73','#6d7f7e'][(row+col+5)%4],
                        [x+cut,y+4,x+58,y+rand()*13,x+70,y+40,x+50,y+64,x+6,y+58,x,y+24]);
                    line(c, '#425a63', [x+3,y+26,x+9,y+58,x+50,y+64], 2);
                    if (col % 2 === 0) line(c, '#80908b', [x+cut+4,y+10,x+44,y+8], 2);
                }
                for (let i=0;i<130;i++) rect(c,i%2?'#6c7d7c':'#50666c',rand()*256,rand()*256,2+rand()*4,2);
            }
            if (material === 'stone') {
                rect(c, '#77827d', 0, 0, 64, 64);
                masonry(c, 0, 0, 64, 64, 64, 32, '#4b5d5f', '#a0a796');
                for (let i = 0; i < 22; i++) rect(c, i % 2 ? '#879086' : '#687872', rand() * 64, 10 + rand() * 52, 4, 2);


                rect(c, '#89976e', 2, 57, 18, 4);
            }
        });
    }
}
