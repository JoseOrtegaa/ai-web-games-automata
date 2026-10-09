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
function courtyard(c: Ctx) {
    gradient(c, ['#657d83','#b0b7a0','#63766e']);
    // Open-sky courtyard: cloister arcades, buttresses, a fountain and clipped garden beds.
    for (let x=0; x<WIDTH; x+=560) {
        rect(c,'#5d6964',x,90,510,370);
        masonry(c,x,90,510,370,82,34,'#505c59','#778279');
        rect(c,'#929782',x-5,85,520,8);
        for (let n=0;n<4;n++) {
            arch(c,'#89907c',x+25+n*123,190,102,270);
            arch(c,'#344d4f',x+33+n*123,202,86,258);
            arch(c,'#a2b6a6',x+45+n*123,218,62,190);
            rect(c,'#455b53',x+40+n*123,358,72,68);
        }
        rect(c,'#4b5c59',x+510,70,42,400);
        rect(c,'#7c8676',x+510,70,7,380);
        for (let n=0;n<3;n++) {
            arch(c,'#354e52',x+55+n*154,110,38,52);
            rect(c,'#a5a58a',x+51+n*154,163,47,5);
        }
    }
    for (const x of [300,1320,2300]) {
        ellipse(c,'#414f47',x,430,140,23);
        rect(c,'#757e6c',x-112,384,224,39);
        ellipse(c,'#a0a68a',x,384,113,17);
        ellipse(c,'#5e8990',x,380,99,10);
        rect(c,'#9ba58e',x-13,300,26,80);
        ellipse(c,'#b4b79c',x,303,54,12);
        line(c,'#a0bfbb',[x,280,x,300],4);
        for (const dx of [-85,85]) line(c,'#92aaa2',[x,298,x+dx/2,317,x+dx,375],2);
    }
    for(let x=30;x<WIDTH;x+=390) {
        rect(c,'#7b7c65',x,395,135,37);
        ellipse(c,'#4e6953',x+65,381,66,25);
        ellipse(c,'#647a58',x+59,370,47,19);
    }
    grain(c,77);
}
function keep(c: Ctx) {
    gradient(c,['#292e37','#454b51','#5b6261']);
    masonry(c,0,0,WIDTH,HEIGHT,116,42,'#303a42','#535d60');
    for(let x=0;x<WIDTH;x+=560) {
        // Tall ribbed vaults and narrow stained-glass windows, no exterior skyline.
        arch(c,'#667073',x+30,25,440,500);
        arch(c,'#343e48',x+48,45,404,495);
        arch(c,'#7a8986',x+165,72,164,250);
        arch(c,'#4c7080',x+177,86,140,226);
        for(let n=0;n<4;n++) {
            poly(c,n%2?'#8b947a':'#678f97',[x+188+n*30,129,x+202+n*30,155,x+188+n*30,190,x+179+n*30,158]);
        }
        line(c,'#b0ab87',[x+247,95,x+247,313],6);
        line(c,'#b0ab87',[x+179,212,x+316,212],5);
        poly(c,'rgba(181,198,169,.08)',[x+179,214,x+316,214,x+495,430,x+280,430]);
        rect(c,'#5e6869',x,0,28,540);
        rect(c,'#90958a',x+3,0,5,540);
        rect(c,'#777f79',x-8,255,47,18);
        for (const dx of [67,380]) {
            rect(c,'#786c54',x+dx-4,135,72,8);
            poly(c,'#6e4147',[x+dx,144,x+dx+60,144,x+dx+60,265,x+dx+30,292,x+dx,265]);
            poly(c,'#b8a477',[x+dx+30,173,x+dx+43,207,x+dx+30,240,x+dx+17,207]);
            rect(c,'#262e32',x+dx+24,330,12,40);
            ellipse(c,'rgba(232,164,81,.08)',x+dx+30,328,46,57);
            poly(c,'#dca66a',[x+dx+20,340,x+dx+30,306,x+dx+40,340]);
        }
    }
    grain(c,91);
}
export function createEnvironment(scene: Phaser.Scene, environment: 'ramparts' | 'courtyard' | 'keep'): void {
    const key = `castle-${environment}`;
    texture(scene, key, WIDTH, HEIGHT, { ramparts:castle, courtyard, keep }[environment]);
    scene.add.image(0,0,key).setOrigin(0,0).setDepth(-30);
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
