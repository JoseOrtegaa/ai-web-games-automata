import { ENEMY_PROFILES } from './enemy-catalog';
import Phaser from 'phaser';
type Ctx = CanvasRenderingContext2D;
const P = { ink: '#352d42', dark: '#5a3d4e', fur: '#d39b73', cream: '#fff0cf', light: '#fff9e7', teal: '#47b7ac', gold: '#fac76a', pink: '#ed8790' };
function rect(c: Ctx, color: string, x: number, y: number, w: number, h: number) {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
}
function poly(c: Ctx, color: string, points: number[]) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2)
        c.lineTo(points[i], points[i + 1]);
    c.closePath();
    c.fill();
}
function line(c: Ctx, color: string, points: number[], width = 2) {
    c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(points[0],points[1]);
    for(let i=2;i<points.length;i+=2)c.lineTo(points[i],points[i+1]);
    c.stroke();
}
function ellipse(c: Ctx, color: string, x: number, y: number, rx: number, ry: number) {
    c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
}
function canvas(w: number, h: number) {
    const a = document.createElement('canvas');
    a.width = w;
    a.height = h;
    return a;
}
function texture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void) {
    if (scene.textures.exists(key))
        return;
    const lo = canvas(w, h);
    const c = lo.getContext('2d')!;
    draw(c);
    const hi = canvas(w * 2, h * 2);
    const out = hi.getContext('2d')!;
    out.imageSmoothingEnabled = false;
    out.drawImage(lo, 0, 0, hi.width, hi.height);
    scene.textures.addCanvas(key, hi);
}
function ferret(c: Ctx, frame: number) {
    const running = frame >= 2 && frame <= 5, bob = frame === 1 || frame === 3 || frame === 5 ? 1 : 0;
    c.save();
    c.translate(0, bob);
    if (frame === 11) {
        // Low, horizontal pose: tail and head stay recognisable in the narrow passage.
        poly(c, P.ink, [7, 24, 2, 23, 0, 19, 2, 17, 4, 20, 9, 21]);
        poly(c, P.fur, [7, 22, 3, 21, 2, 19, 4, 20]);
        poly(c, P.ink, [6, 21, 17, 18, 21, 20, 22, 27, 7, 28]);
        poly(c, P.fur, [8, 21, 17, 19, 19, 22, 19, 26, 8, 26]);
        poly(c, P.cream, [13, 21, 20, 22, 20, 26, 13, 26]);
        poly(c, P.ink, [15, 16, 16, 12, 19, 13, 21, 16, 23, 17, 24, 24, 20, 27, 16, 25]);
        rect(c, P.fur, 18, 14, 2, 4);
        rect(c, P.pink, 19, 14, 1, 2);
        poly(c, P.cream, [17, 19, 21, 18, 24, 20, 24, 24, 19, 25]);
        rect(c, P.ink, 20, 20, 2, 2);
        rect(c, P.light, 20, 20, 1, 1);
        rect(c, P.pink, 23, 22, 1, 2);
        rect(c, P.teal, 11, 21, 6, 1);
        rect(c, P.ink, 9, 27, 4, 3);
        rect(c, P.ink, 19, 26, 4, 4);
        c.restore();
        return;
    }
    if (frame >= 9) {
        c.translate(12, 23);
        c.rotate(frame === 9 ? -0.7 : -1.4);
        c.translate(-12, -23);
    }
    // Proud curved tail, pointed ears and long upright torso retain a ferret silhouette.
    poly(c, P.ink, [8, 24, 4, 25, 1, 22, 0, 18, 2, 15, 5, 16, 4, 20, 8, 21, 11, 23]);
    poly(c, P.fur, [7, 23, 4, 23, 2, 21, 2, 18, 4, 17, 4, 21, 8, 22]);
    rect(c, P.cream, 1, 17, 3, 3);
    poly(c, P.ink, [8, 16, 17, 15, 20, 21, 18, 27, 8, 28, 6, 24, 7, 19]);
    poly(c, P.fur, [9, 17, 16, 17, 18, 22, 17, 26, 9, 26, 8, 23]);
    poly(c, P.cream, [13, 18, 17, 18, 18, 23, 16, 26, 12, 26, 11, 23]);
    const stride = running ? [0, 3, 0, -3][frame - 2] : 0;
    rect(c, P.ink, 8 + stride, 26, 5, frame === 6 ? 3 : 5);
    rect(c, P.dark, 9 + stride, 27, 4, 2);
    rect(c, P.ink, 15 - stride, 26, 6, frame === 7 ? 5 : 4);
    rect(c, P.fur, 16 - stride, 27, 4, 1);
    // Ears and head with contrasting mask, muzzle and eye glints.
    poly(c, P.ink, [7, 7, 6, 2, 10, 1, 13, 5, 17, 3, 21, 4, 21, 8, 23, 10, 23, 16, 19, 19, 10, 18, 6, 14, 6, 9]);
    rect(c, P.fur, 8, 3, 3, 5);
    rect(c, P.pink, 9, 4, 1, 3);
    rect(c, P.fur, 18, 5, 2, 3);
    rect(c, P.pink, 19, 5, 1, 2);
    poly(c, P.cream, [9, 7, 16, 6, 20, 8, 22, 11, 22, 15, 18, 17, 11, 16, 8, 13, 8, 9]);
    poly(c, P.dark, [9, 9, 13, 9, 15, 11, 18, 9, 21, 10, 21, 13, 17, 14, 14, 13, 11, 14, 9, 12]);
    if (frame === 8 || frame >= 9) {
        rect(c, P.ink, 11, 11, 3, 1);
        rect(c, P.ink, 18, 11, 3, 1);
    }
    else {
        rect(c, P.ink, 12, 10, 2, 3);
        rect(c, P.light, 12, 10, 1, 1);
        rect(c, P.ink, 19, 10, 2, 3);
        rect(c, P.light, 19, 10, 1, 1);
    }
    rect(c, P.light, 15, 13, 7, 3);
    rect(c, P.pink, 21, 12, 2, 2);
    rect(c, P.dark, 19, 15, 2, 1);
    rect(c, P.pink, 10, 14, 2, 1);
    rect(c, '#218780', 9, 17, 9, 2);
    rect(c, P.teal, 9, 17, 9, 1);
    poly(c, P.teal, [9, 17, 5, 16, 3, 19, 8, 19]);
    // Tiny paws carry running motion; airborne pose opens the arms.
    if (frame === 6 || frame === 7) {
        rect(c, P.ink, 5, 17, 4, 4);
        rect(c, P.cream, 5, 17, 3, 2);
        rect(c, P.cream, 19, 17, 3, 3);
    }
    else {
        rect(c, P.dark, 8, 20 + (running ? stride / 3 : 0), 3, 4);
        rect(c, P.cream, 9, 23 + (running ? stride / 3 : 0), 2, 2);
        rect(c, P.cream, 18, 21, 3, 2);
    }
    c.restore();
}
function animal(c: Ctx, kind: string) {
    const rabbit = kind === 'rabbit', armor = kind === 'armored', bird = kind === 'quail';
    const body = rabbit ? '#cda5dc' : armor ? '#d69b76' : bird ? '#9aa8cf' : '#f6c878';
    const shade = rabbit ? '#9177b5' : armor ? '#936247' : bird ? '#6277a3' : '#cb8f51';
    if (rabbit || armor) {
        poly(c, P.ink, [7, 12, 5, 3, 7, 1, 10, 3, 11, 10, 14, 2, 17, 2, 18, 5, 15, 13]);
        rect(c, body, 7, 3, 2, 8);
        rect(c, P.pink, 8, 4, 1, 5);
        rect(c, body, 15, 4, 1, 7);
    }
    if (bird) {
        poly(c, P.ink, [12, 7, 11, 2, 14, 0, 17, 2, 15, 4, 14, 8]);
        rect(c, '#f2d493', 13, 2, 2, 2);
    }
    if (!rabbit && !armor && !bird) {
        poly(c, '#a45560', [11, 8, 10, 3, 12, 1, 14, 4, 16, 1, 19, 3, 18, 8]);
    }
    poly(c, P.ink, [6, 11, 10, 8, 18, 8, 22, 12, 23, 18, 19, 22, 8, 22, 3, 18, 3, 14]);
    poly(c, body, [7, 12, 11, 10, 17, 10, 20, 13, 21, 17, 18, 20, 9, 20, 5, 17, 5, 14]);
    poly(c, shade, [5, 15, 10, 14, 13, 17, 11, 20, 7, 19]);
    rect(c, P.cream, 15, 14, 6, 4);
    rect(c, P.ink, 17, 11, 2, 3);
    rect(c, '#fff9df', 17, 11, 1, 1);
    rect(c, bird || kind === 'spitter' ? '#cf7f47' : P.pink, 21, 14, 3, 2);
    rect(c, P.ink, 7, 21, 5, 2);
    rect(c, P.ink, 17, 21, 5, 2);
    if (bird) {
        poly(c, '#c9cde4', [5, 13, 0, 7, 6, 8, 12, 15, 10, 18, 5, 15]);
        rect(c, '#e5dbbf', 13, 17, 2, 1);
    }
    if (armor) {
        poly(c, '#533d3f', [3, 15, 4, 9, 9, 6, 16, 8, 18, 13, 15, 18, 7, 19]);
        poly(c, '#9e704b', [5, 13, 6, 10, 10, 8, 15, 10, 16, 13, 13, 17, 8, 17]);
        rect(c, '#d3ad70', 7, 10, 6, 2);
        rect(c, '#60443c', 8, 13, 2, 3);
        rect(c, '#60443c', 12, 12, 2, 4);
    }
    if (kind === 'spitter') {
        rect(c, '#698c69', 6, 16, 8, 3);
        rect(c, '#aac285', 8, 16, 4, 1);
    }
}
/** Six original silhouettes for the underground habitats, at the same pixel scale. */
function undergroundAnimal(c: Ctx, kind: string) {
    if (kind === 'rat') {
        poly(c,P.ink,[2,18,5,11,12,9,19,12,23,16,21,21,5,22]);
        poly(c,'#8facae',[4,17,7,12,13,11,19,14,21,17,18,20,6,20]);
        ellipse(c,P.ink,8,10,4,4);ellipse(c,'#c3959c',8,10,2,2);
        line(c,'#b8a098',[4,18,1,18,0,14],2);
        rect(c,'#d4cbc0',17,16,5,3);rect(c,'#ffebbc',17,13,2,2);
        rect(c,P.ink,7,21,4,2);rect(c,P.ink,16,21,4,2);
    } else if (kind === 'bat') {
        poly(c,P.ink,[11,13,6,7,0,6,1,17,5,14,8,19,12,17,16,19,19,14,23,17,24,6,18,7,13,13]);
        poly(c,'#7d789c',[2,9,7,10,11,16,8,16,5,12,2,14]);
        poly(c,'#7d789c',[22,9,17,10,13,16,16,16,19,12,22,14]);
        poly(c,'#aaa4bd',[8,15,8,4,11,8,14,8,17,4,17,16,14,22,10,22]);
        rect(c,'#f3d696',10,11,2,2);rect(c,'#f3d696',14,11,2,2);
        rect(c,P.ink,11,15,4,3);rect(c,'#eee2d3',11,16,1,2);
    } else if (kind === 'beetle') {
        poly(c,P.ink,[3,17,5,11,10,8,18,8,22,14,23,20,18,22,6,22]);
        poly(c,'#8b9c4e',[5,17,7,12,12,10,17,10,20,15,20,20,7,20]);
        line(c,'#465d3f',[13,11,13,20],2);
        rect(c,'#bdd087',8,12,3,3);rect(c,'#bdd087',15,12,3,3);
        rect(c,P.ink,2,20,5,3);rect(c,P.ink,17,21,5,2);
        line(c,'#82916a',[17,10,18,5,21,4],2);rect(c,'#fff0ac',19,15,2,2);
    } else if (kind === 'moth') {
        poly(c,P.ink,[12,10,5,3,0,7,1,15,7,21,12,16,17,21,23,15,24,7,19,3]);
        poly(c,'#c3b782',[10,11,5,5,2,8,3,14,8,18,10,15]);
        poly(c,'#c3b782',[14,11,19,5,22,8,21,14,16,18,14,15]);
        ellipse(c,'#678b71',6,11,2,3);ellipse(c,'#678b71',18,11,2,3);
        rect(c,'#566e54',10,8,4,13);rect(c,'#e9daa5',10,8,4,4);
        line(c,'#a6be8c',[11,8,8,4,9,2],1);line(c,'#a6be8c',[13,8,16,4,15,2],1);
    } else if (kind === 'mimic') {
        rect(c,P.ink,2,6,21,16);rect(c,'#957049',4,8,17,12);
        rect(c,'#cda85f',3,7,19,3);rect(c,'#cda85f',5,10,3,11);rect(c,'#cda85f',17,10,3,11);
        rect(c,P.ink,8,12,10,5);rect(c,'#f1e6ba',9,12,2,2);rect(c,'#f1e6ba',14,15,2,2);
        rect(c,'#e2bd7e',10,8,5,3);rect(c,'#e9cd94',7,5,2,2);rect(c,'#e9cd94',16,5,2,2);
        rect(c,P.ink,4,21,5,3);rect(c,P.ink,17,21,5,3);
    } else if (kind === 'ghost') {
        poly(c,P.ink,[4,12,6,6,11,3,17,4,21,10,21,23,16,20,12,23,9,20,4,23]);
        poly(c,'#b9c9d5',[6,12,8,7,12,5,16,6,19,11,19,20,16,17,12,20,9,17,6,20]);
        poly(c,'#8296af',[6,13,10,17,14,17,12,20,9,17,6,20]);
        rect(c,'#324955',10,10,2,4);rect(c,'#324955',16,10,2,4);
        rect(c,'#ecdaaa',11,8,7,1);rect(c,'#52697e',13,16,3,2);
    }
}
function wood(c: Ctx, w: number, h: number, light = false) {
    rect(c, light ? '#987665' : '#735c60', 0, 0, w, h);
    for (let y = 8; y < h; y += 17) {
        rect(c, light ? '#ac8970' : '#816569', 0, y, w, 1);
        for (let x = (y * 11) % 23; x < w; x += 31) {
            rect(c, '#5e4e56', x, y + 4, 14, 1);
            rect(c, '#8a6b65', x + 3, y + 5, 8, 1);
        }
    }
}
function plant(c: Ctx) {
    rect(c, '#536d62', 46, 29, 4, 80);
    for (let i = 0; i < 5; i++) {
        const y = 20 + i * 15, left = i % 2 === 0;
        poly(c, i % 2 ? '#6b9981' : '#85ae8a', left ? [48, y + 20, 26, y + 15, 17, y, 33, y + 2, 47, y + 13] : [48, y + 20, 70, y + 10, 78, y - 4, 60, y + 1, 49, y + 13]);
    }
    poly(c, '#73545b', [22, 98, 75, 98, 66, 130, 30, 130]);
    rect(c, '#b17c71', 24, 99, 49, 7);
    poly(c, '#96665f', [29, 108, 67, 108, 61, 128, 35, 128]);
    rect(c, '#c89983', 34, 111, 3, 15);
    rect(c, '#684a50', 24, 96, 50, 4);
}
export function createArt(scene: Phaser.Scene): void {
    const coats = [
        {key:'ferret',fur:P.fur,cream:P.cream,dark:P.dark},
        {key:'ferret-snow',fur:'#9bc9d3',cream:'#f7faf2',dark:'#647e89'},
        {key:'ferret-violet',fur:'#a278c6',cream:'#e7c7f2',dark:'#624a79'},
    ];
    for(const coat of coats) if (!scene.textures.exists(coat.key)) {
        const lo = canvas(24 * 12, 32), c = lo.getContext('2d')!;
        for (let i = 0; i < 12; i++) {
            c.save();
            c.translate(i * 24, 0);
            ferret(c, i);
            c.restore();
        }
        if(coat.key!=='ferret'){
            const pixels=c.getImageData(0,0,lo.width,lo.height);
            const from=[P.fur,P.cream,P.dark].map(hex=>[1,3,5].map(n=>parseInt(hex.slice(n,n+2),16)));
            const to=[coat.fur,coat.cream,coat.dark].map(hex=>[1,3,5].map(n=>parseInt(hex.slice(n,n+2),16)));
            for(let i=0;i<pixels.data.length;i+=4)for(let n=0;n<from.length;n++)
                if(pixels.data[i]===from[n][0]&&pixels.data[i+1]===from[n][1]&&pixels.data[i+2]===from[n][2]){
                    pixels.data[i]=to[n][0];pixels.data[i+1]=to[n][1];pixels.data[i+2]=to[n][2];break;
                }
            c.putImageData(pixels,0,0);
        }
        const hi = canvas(48 * 12, 64);
        const out = hi.getContext('2d')!;
        out.imageSmoothingEnabled = false;
        out.drawImage(lo, 0, 0, hi.width, hi.height);
        // Passing a Texture to addSpriteSheet preserves its key (Phaser 3).
        const atlas = scene.textures.addCanvas(coat.key, hi)!;
        scene.textures.addSpriteSheet(coat.key, atlas, { frameWidth: 48, frameHeight: 64 });
    }
    const anims = [['idle', 0, 1, 3, -1], ['run', 2, 5, 11, -1], ['jump', 6, 6, 1, 0], ['fall', 7, 7, 1, 0], ['hurt', 8, 8, 1, 0], ['dead', 9, 10, 4, 0], ['crouch', 11, 11, 1, 0]] as const;
    for(const coat of coats)for (const [name, start, end, frameRate, repeat] of anims)
        if (!scene.anims.exists(`${coat.key}-${name}`))
            scene.anims.create({ key: `${coat.key}-${name}`, frames: scene.anims.generateFrameNumbers(coat.key, { start, end }), frameRate, repeat });
    for (const kind of Object.keys(ENEMY_PROFILES))
        texture(scene, kind, kind === 'armored' ? 26 : 24, 24, c => {
            if(['snowhare','owl','frostbug'].includes(kind)) {
                ellipse(c,'#2b556c',12,15,11,8);ellipse(c,kind==='frostbug'?'#86b9c7':'#e0f0e5',12,14,9,6);
                if(kind==='snowhare'){poly(c,'#e8f8ed',[5,10,4,0,8,1,11,10,14,1,18,2,18,11]);rect(c,'#284b66',17,11,2,2);}
                if(kind==='owl'){poly(c,'#a1dbe1',[2,15,0,10,8,12,12,19,17,12,24,10,22,17]);ellipse(c,'#3e6472',9,12,2,2);ellipse(c,'#3e6472',16,12,2,2);}
                if(kind==='frostbug'){for(const x of [5,10,16,21])rect(c,'#d7f0ed',x,19,2,4);poly(c,'#d9f6f4',[6,8,12,2,17,8]);}
            } else ['rabbit','armored','quail','spitter'].includes(kind) ? animal(c, kind) : undergroundAnimal(c, kind);
        });
    texture(scene,'relic-ice',18,22,c=>{poly(c,'#2b6382',[9,0,18,11,9,22,0,11]);poly(c,'#b9f5f1',[9,2,16,11,9,19,2,11]);rect(c,'#fff8e2',8,5,2,10);});
    texture(scene,'hat-beret',20,10,c=>{ellipse(c,'#306276',10,6,9,3);rect(c,'#163f56',2,8,17,2);rect(c,'#e7d29c',10,1,2,3);});
    texture(scene,'hat-crown',18,11,c=>{
        poly(c,'#493d43',[1,10,0,1,5,5,9,0,13,5,18,1,17,10]);
        poly(c,'#e8bc59',[2,9,2,3,5,7,9,2,13,7,16,3,16,9]);
        rect(c,'#91604c',2,9,14,2);rect(c,'#fff2aa',8,6,2,2);
    });
    for(const ice of [false,true])texture(scene,ice?'boss-ice':'boss-oak',56,50,c=>{
        const shell=ice?'#7bd0dc':'#956847',shine=ice?'#daf7f0':'#d6ae78';
        ellipse(c,'#294356',28,30,25,20);ellipse(c,shell,28,27,22,17);
        poly(c,shine,[8,20,5,5,18,17,27,6,35,17,50,4,47,24]);
        rect(c,'#e6f2db',17,23,7,7);rect(c,'#e6f2db',33,23,7,7);
        rect(c,'#263745',21,25,3,4);rect(c,'#263745',33,25,3,4);
        rect(c,'#263745',18,40,8,8);rect(c,'#263745',32,40,8,8);
        rect(c,shine,25,34,7,3);
    });
    for(const open of [false,true])texture(scene,open?'reward-chest-open':'reward-chest',28,24,c=>{
        rect(c,P.ink,2,10,24,13);rect(c,'#388c96',4,12,20,9);
        rect(c,'#edc874',5,12,3,9);rect(c,'#edc874',20,12,3,9);
        if(open){poly(c,P.ink,[2,8,6,1,26,1,26,10]);poly(c,'#64a8aa',[5,7,8,3,24,3,24,8]);rect(c,'#ffd77e',6,10,16,3);}
        else {rect(c,P.ink,2,6,24,6);rect(c,'#76b9bd',4,7,20,3);rect(c,'#f5d88c',12,9,5,7);rect(c,P.ink,14,12,1,2);}
        rect(c,'#fff1b3',2,2,2,2);rect(c,'#fff1b3',25,4,2,2);
    });
    texture(scene,'relic-key',18,22,c=>{
        ellipse(c,P.ink,8,6,6,6);ellipse(c,'#edc76d',8,6,4,4);ellipse(c,P.ink,8,6,2,2);
        poly(c,P.ink,[7,10,12,10,12,14,16,14,16,19,12,19,12,22,7,22]);
        rect(c,'#edc76d',8,10,3,11);rect(c,'#edc76d',10,15,5,3);rect(c,'#fff0b5',8,11,1,8);
    });
    texture(scene,'relic-seed',18,22,c=>{
        poly(c,P.ink,[9,7,4,10,2,15,5,21,12,22,16,16,15,11]);
        poly(c,'#b9d873',[9,9,5,12,4,16,7,20,11,20,14,16,13,12]);
        poly(c,'#4d9264',[9,8,5,6,3,1,9,2,11,5,14,1,17,2,15,7]);
        rect(c,'#efffc8',7,12,2,5);rect(c,'#f6edb1',0,7,2,2);
    });
    texture(scene,'relic-gem',18,22,c=>{
        poly(c,P.ink,[5,2,13,2,18,8,10,22,0,8]);
        poly(c,'#8ed7e2',[6,4,12,4,15,8,9,19,3,8]);
        poly(c,'#5285bc',[3,8,9,19,8,8]);poly(c,'#bdf7ee',[8,8,9,19,15,8]);
        rect(c,'#fff7ce',7,4,2,3);rect(c,'#edc982',2,0,2,2);
    });
    texture(scene, 'kibble', 16, 16, c => {
        poly(c, '#77483a', [3, 5, 7, 2, 12, 4, 14, 9, 10, 14, 5, 13, 2, 9]);
        poly(c, '#d58b42', [4, 6, 8, 3, 11, 5, 12, 9, 9, 12, 5, 11, 4, 8]);
        poly(c, '#ffdc83', [5, 5, 8, 4, 10, 5, 8, 7, 5, 7]);
        rect(c, '#bd763c', 7, 9, 3, 1);
    });
    texture(scene, 'meat', 16, 16, c => {
        rect(c, '#f9e5c1', 10, 9, 4, 3);
        rect(c, '#fff4d9', 12, 8, 3, 5);
        poly(c, '#823f50', [2, 5, 5, 2, 10, 3, 12, 7, 9, 12, 4, 13, 1, 9]);
        poly(c, '#e97c80', [3, 5, 6, 4, 9, 5, 10, 8, 7, 11, 4, 10, 3, 8]);
        rect(c, '#ffc2aa', 4, 5, 3, 2);
    });
    texture(scene, 'oil', 16, 16, c => {
        rect(c, '#386279', 6, 1, 5, 3);
        rect(c, '#263b56', 5, 4, 7, 11);
        rect(c, '#7db9bc', 4, 6, 9, 7);
        rect(c, '#efa75e', 5, 8, 7, 5);
        rect(c, '#ffcf7b', 6, 9, 2, 3);
        rect(c, '#dff6d7', 5, 6, 2, 2);
    });
    texture(scene, 'puff', 16, 16, c => {
        poly(c, '#527b69', [2, 6, 5, 5, 4, 2, 8, 4, 11, 1, 12, 5, 15, 6, 12, 9, 13, 13, 9, 12, 7, 15, 5, 12, 1, 11, 3, 8]);
        poly(c, '#b7e8b2', [4, 6, 7, 6, 8, 4, 10, 6, 12, 7, 10, 10, 7, 12, 5, 10, 3, 9]);
        rect(c, '#fff2ce', 7, 7, 3, 3);
    });
    texture(scene, 'projectile', 10, 10, c => {
        poly(c, '#776044', [1, 4, 5, 1, 8, 3, 9, 6, 6, 9, 2, 8]);
        rect(c, '#e9bd70', 3, 3, 4, 4);
        rect(c, '#ffdf9b', 4, 3, 2, 1);
    });
    texture(scene, 'checkpoint', 32, 32, c => {
        poly(c, '#4b576e', [4, 27, 4, 20, 12, 17, 15, 7, 26, 8, 27, 24, 23, 29]);
        poly(c, '#64ada7', [6, 25, 8, 21, 17, 19, 18, 9, 24, 10, 24, 23, 21, 27]);
        rect(c, '#f7dcac', 17, 7, 10, 4);
        rect(c, '#dfebc3', 19, 13, 5, 2);
        rect(c, '#3f7e80', 8, 24, 12, 2);
        rect(c, '#ffcf73', 8, 18, 3, 3);
    });
    texture(scene, 'goal', 64, 80, c => {
        // Stone arch and timber gate at the castle arrival.
        poly(c, '#514f49', [2,80,2,27,10,12,23,3,41,3,54,12,62,27,62,80]);
        poly(c, '#aaa18b', [7,80,7,29,14,16,26,8,38,8,50,16,57,29,57,80]);
        poly(c, '#252c2c', [15,80,15,31,20,22,29,16,35,16,44,22,49,31,49,80]);
        rect(c, '#614d38', 18, 32, 28, 48);
        poly(c, '#614d38', [18,33,23,24,30,20,35,20,41,25,46,33]);
        for (let x = 22; x < 46; x += 6) rect(c, '#40382d', x, 30, 1, 48);
        for (const y of [42, 65]) { rect(c, '#303b3c', 18, y, 28, 4); rect(c, '#a09b81', 21, y+1, 2, 2); }
        rect(c, '#c6a769', 39, 53, 3, 5);
        for (const y of [32, 48, 64]) { rect(c, '#686558', 7, y, 8, 2); rect(c, '#686558', 49, y, 8, 2); }
        rect(c, '#c3b99e', 27, 7, 10, 7);
        rect(c, '#8f794e', 30, 9, 4, 3);
    });
    // Material tiles: an unbroken highlight distinguishes solid ground from scenery.
    for (const surface of ['wood', 'cushion', 'book', 'pipe', 'tile', 'cardboard'])
        texture(scene, `surface-${surface}`, 32, 32, c => {
            if (surface === 'wood') {
                wood(c, 32, 32, true);
                rect(c, '#e6bc88', 0, 0, 32, 3);
                rect(c, '#634954', 0, 4, 32, 2);
            }
            if (surface === 'cushion') {
                rect(c, '#796585', 0, 0, 32, 32);
                rect(c, '#c59cac', 0, 0, 32, 4);
                rect(c, '#9c7d99', 0, 5, 32, 23);
                for (let x = 3; x < 32; x += 7) {
                    rect(c, '#e7b5ba', x, 2, 3, 1);
                    rect(c, '#6f5b7a', x, 28, 3, 1);
                }
                rect(c, '#ae8c9f', 3, 10, 2, 12);
            }
            if (surface === 'book') {
                rect(c, '#9c6470', 0, 0, 32, 32);
                rect(c, '#f4c7a0', 0, 0, 32, 3);
                rect(c, '#e8d3b1', 0, 5, 32, 20);
                for (let y = 8; y < 25; y += 4)
                    rect(c, '#bba98f', 0, y, 32, 1);
                rect(c, '#704d63', 0, 27, 32, 5);
                rect(c, '#c58480', 0, 28, 32, 2);
            }
            if (surface === 'pipe') {
                rect(c, '#517e7f', 0, 0, 32, 32);
                rect(c, '#c0d9b9', 0, 0, 32, 3);
                rect(c, '#81b3a5', 0, 3, 32, 7);
                rect(c, '#65998f', 0, 11, 32, 7);
                rect(c, '#3f626b', 0, 25, 32, 7);
                rect(c, '#aec9ac', 4, 3, 2, 22);
                rect(c, '#355460', 8, 5, 2, 24);
            }
            if (surface === 'tile') {
                rect(c, '#aac1b3', 0, 0, 32, 32);
                rect(c, '#eaf0ca', 0, 0, 32, 3);
                rect(c, '#537b7d', 0, 4, 32, 2);
                rect(c, '#7da39b', 1, 7, 29, 23);
                rect(c, '#c5d2b9', 3, 8, 26, 2);
                rect(c, '#b0c6b2', 3, 10, 2, 16);
                rect(c, '#638b87', 27, 11, 2, 17);
            }
            if (surface === 'cardboard') {
                rect(c, '#a87d5c', 0, 0, 32, 32);
                rect(c, '#eac794', 0, 0, 32, 3);
                rect(c, '#795a50', 0, 4, 32, 2);
                rect(c, '#c2996c', 2, 7, 28, 24);
                rect(c, '#b08862', 4, 11, 14, 1);
                rect(c, '#d6b17e', 22, 6, 6, 26);
                rect(c, '#b99970', 24, 6, 1, 26);
            }
        });
    texture(scene, 'plant', 96, 132, plant);
    texture(scene, 'window', 112, 128, c => {
        rect(c, '#7e7081', 8, 5, 96, 117);
        rect(c, '#c1b19e', 11, 8, 90, 109);
        rect(c, '#7eaaa8', 16, 13, 80, 99);
        rect(c, '#a8c9b8', 19, 16, 74, 91);
        rect(c, '#d2ddbd', 19, 16, 74, 31);
        poly(c, '#8aab96', [19, 90, 34, 62, 42, 66, 56, 41, 68, 52, 73, 41, 92, 68, 92, 107, 19, 107]);
        poly(c, '#739989', [19, 103, 33, 87, 41, 90, 60, 73, 69, 79, 79, 67, 93, 91, 93, 110, 19, 110]);
        rect(c, '#d9c8ac', 54, 13, 5, 100);
        rect(c, '#d9c8ac', 16, 61, 80, 5);
        rect(c, '#8f8283', 59, 16, 2, 96);
        rect(c, '#8f8283', 19, 66, 74, 2);
        rect(c, '#dbc8b0', 3, 118, 106, 7);
        rect(c, '#8d7680', 6, 125, 100, 3);
        poly(c, '#b08f9d', [0, 0, 26, 0, 22, 29, 15, 57, 10, 90, 1, 94]);
        poly(c, '#c6a4ad', [3, 0, 12, 0, 12, 30, 6, 74, 3, 90]);
        poly(c, '#b08f9d', [88, 0, 111, 0, 111, 94, 100, 90, 98, 54, 91, 30]);
        rect(c, '#d3b7b7', 102, 4, 3, 80);
    });
    texture(scene, 'cage', 125, 123, c => {
        rect(c, '#746b7a', 5, 115, 113, 8);
        rect(c, '#a39599', 7, 9, 110, 3);
        for (let x = 10; x < 119; x += 13) {
            rect(c, '#777784', x, 11, 2, 104);
            rect(c, '#a8a6a5', x, 11, 1, 102);
        }
        rect(c, '#8f8993', 7, 45, 110, 2);
        rect(c, '#8f8993', 7, 86, 110, 2);
        poly(c, '#8a7688', [10, 95, 31, 90, 48, 93, 62, 87, 85, 92, 111, 88, 114, 114, 11, 115]);
        poly(c, '#ad8e9e', [20, 98, 40, 97, 52, 102, 81, 96, 101, 98, 100, 111, 22, 111]);
        rect(c, '#594f65', 40, 98, 25, 11);
        rect(c, '#c1a2ad', 26, 97, 68, 3);
        rect(c, '#798ba0', 96, 43, 14, 28);
        rect(c, '#bac6bf', 99, 46, 9, 17);
        rect(c, '#5e7882', 101, 70, 3, 11);
    });
    texture(scene, 'sock', 82, 42, c => {
        poly(c, '#695a75', [4, 32, 8, 24, 34, 18, 43, 4, 66, 5, 68, 22, 76, 26, 79, 36, 68, 41, 13, 40]);
        poly(c, '#a18ba6', [9, 32, 14, 27, 38, 23, 46, 7, 61, 8, 62, 25, 72, 30, 72, 35, 64, 38, 16, 37]);
        rect(c, '#cbb0b7', 45, 7, 19, 6);
        rect(c, '#d8bcbd', 47, 8, 2, 4);
        rect(c, '#d8bcbd', 52, 8, 2, 4);
        rect(c, '#d8bcbd', 57, 8, 2, 4);
        poly(c, '#77657f', [13, 32, 32, 28, 48, 27, 53, 31, 47, 35, 18, 36]);
        rect(c, '#b39baa', 23, 26, 13, 2);
    });
    texture(scene, 'picture', 95, 70, c => {
        rect(c, '#70565c', 0, 0, 95, 70);
        rect(c, '#b99579', 3, 3, 89, 64);
        rect(c, '#705b62', 7, 7, 81, 56);
        rect(c, '#bdc2a3', 10, 10, 75, 50);
        poly(c, '#8fa98c', [10, 50, 27, 25, 40, 35, 52, 18, 66, 30, 85, 49, 85, 60, 10, 60]);
        poly(c, '#788f83', [10, 57, 32, 42, 45, 47, 69, 36, 85, 51, 85, 60]);
        rect(c, '#e0c18d', 67, 18, 8, 8);
        rect(c, '#eacb96', 68, 19, 5, 5);
        rect(c, '#d2ad87', 4, 4, 86, 2);
    });
    texture(scene, 'bookshelf', 158, 152, c => {
        rect(c, '#514957', 8, 4, 142, 148);
        wood(c, 158, 152);
        rect(c, '#514957', 9, 9, 140, 135);
        const colors = ['#967384', '#738c8c', '#b29878', '#828397', '#a18176'];
        for (let row = 0; row < 3; row++) {
            const y = 17 + row * 42;
            for (let i = 0; i < 9; i++) {
                const x = 13 + i * 15, h = 26 + (i * 7 + row * 3) % 10;
                rect(c, '#403e4f', x + 1, y + 35 - h, 12, h);
                rect(c, colors[(i + row) % 5], x, y + 34 - h, 10, h);
                rect(c, '#bfab94', x + 1, y + 39 - h, 8, 2);
                rect(c, '#b4a392', x + 3, y + 31, 4, 1);
            }
            rect(c, '#a38774', 7, y + 35, 144, 4);
            rect(c, '#564550', 8, y + 39, 140, 3);
        }
        rect(c, '#b09178', 0, 0, 158, 5);
        rect(c, '#69515a', 0, 146, 158, 6);
    });
    texture(scene, 'lamp', 84, 148, c => {
        rect(c, '#746977', 40, 46, 5, 94);
        rect(c, '#a99991', 41, 51, 2, 86);
        poly(c, '#797180', [20, 144, 29, 139, 54, 139, 67, 144, 65, 148, 19, 148]);
        rect(c, '#b5a79a', 26, 141, 30, 2);
        poly(c, '#ac8d89', [19, 4, 64, 4, 80, 52, 4, 52]);
        poly(c, '#cdb39a', [22, 6, 60, 6, 74, 48, 10, 48]);
        rect(c, '#dbc8a5', 23, 6, 4, 40);
        rect(c, '#b59b8c', 48, 6, 3, 40);
        rect(c, '#e1c79e', 7, 49, 70, 4);
        rect(c, '#9b8282', 66, 51, 1, 18);
        rect(c, '#b6a292', 65, 69, 3, 4);
    });
    texture(scene, 'sofa', 230, 119, c => {
        rect(c, '#65546e', 12, 13, 204, 91);
        rect(c, '#88708b', 17, 8, 194, 76);
        rect(c, '#a0849c', 22, 12, 184, 6);
        for (let i = 0; i < 3; i++) {
            const x = 27 + i * 60;
            rect(c, '#755f7e', x, 26, 55, 52);
            rect(c, '#92798f', x + 3, 28, 50, 47);
            rect(c, '#ab8ba0', x + 4, 29, 48, 2);
            rect(c, '#755f7e', x + 27, 49, 3, 3);
        }
        rect(c, '#65546e', 14, 75, 202, 30);
        rect(c, '#ac8d9d', 19, 75, 193, 7);
        rect(c, '#8f758a', 20, 84, 190, 15);
        for (let i = 0; i < 3; i++)
            rect(c, '#69566e', 23 + i * 63, 76, 2, 26);
        rect(c, '#79647c', 0, 47, 23, 60);
        rect(c, '#aa8c9e', 3, 44, 18, 9);
        rect(c, '#79647c', 209, 47, 21, 60);
        rect(c, '#aa8c9e', 210, 44, 18, 9);
        rect(c, '#6a555b', 20, 105, 12, 14);
        rect(c, '#6a555b', 198, 105, 12, 14);
        rect(c, '#b89375', 22, 107, 3, 10);
    });
    texture(scene, 'drawers', 134, 144, c => {
        wood(c, 134, 139);
        rect(c, '#a88b74', 0, 0, 134, 6);
        for (let i = 0; i < 3; i++) {
            const y = 12 + i * 39;
            rect(c, '#574652', 8, y, 118, 35);
            rect(c, '#8e7066', 11, y + 2, 112, 30);
            rect(c, '#ad8b73', 13, y + 3, 108, 2);
            rect(c, '#63505a', 56, y + 14, 24, 6);
            rect(c, '#b9a388', 58, y + 13, 20, 3);
        }
        rect(c, '#584752', 7, 133, 12, 11);
        rect(c, '#584752', 115, 133, 12, 11);
    });
    texture(scene, 'cabinet', 148, 144, c => {
        rect(c, '#526b70', 0, 2, 148, 140);
        rect(c, '#9ba99a', 0, 0, 148, 6);
        rect(c, '#b9bfaa', 2, 1, 144, 2);
        for (let i = 0; i < 2; i++) {
            const x = 6 + i * 70;
            rect(c, '#778f86', x, 10, 65, 124);
            rect(c, '#a9b5a1', x + 2, 11, 61, 3);
            rect(c, '#607e79', x + 7, 21, 51, 98);
            rect(c, '#879d8f', x + 10, 24, 44, 91);
            rect(c, '#afb39a', x + 51, 54, 4, 15);
            rect(c, '#526c6d', x + 54, 57, 2, 13);
        }
        rect(c, '#405c66', 7, 136, 135, 8);
    });
    texture(scene, 'mug', 88, 100, c => {
        poly(c, '#6a717f', [9, 12, 66, 12, 69, 80, 59, 94, 20, 94, 10, 83]);
        poly(c, '#9bafa9', [13, 17, 61, 17, 64, 79, 56, 89, 24, 89, 16, 80]);
        rect(c, '#c7ccba', 17, 21, 5, 53);
        rect(c, '#66757c', 65, 28, 19, 46);
        rect(c, '#a4b6ac', 67, 31, 17, 40);
        rect(c, '#587079', 69, 38, 9, 26);
        rect(c, '#c5cbb7', 68, 31, 14, 3);
        rect(c, '#6d656b', 13, 11, 49, 8);
        rect(c, '#bfc6b1', 14, 10, 47, 3);
        rect(c, '#6c8d87', 28, 44, 24, 22);
        rect(c, '#b7c5ae', 33, 49, 14, 12);
    });
    texture(scene, 'kettle', 117, 119, c => {
        poly(c, '#4d6571', [30, 39, 36, 20, 72, 20, 81, 37, 96, 57, 98, 100, 88, 113, 25, 113, 18, 99, 20, 59]);
        poly(c, '#8faaa7', [32, 43, 78, 41, 92, 61, 92, 98, 85, 107, 29, 107, 24, 97, 26, 60]);
        rect(c, '#bfd0b7', 32, 58, 6, 38);
        rect(c, '#6c8e8d', 79, 66, 8, 32);
        poly(c, '#6f8d92', [23, 59, 4, 31, 0, 32, 5, 60, 23, 84]);
        poly(c, '#aec2b0', [21, 59, 7, 38, 9, 55, 22, 75]);
        poly(c, '#4d5b6b', [72, 33, 83, 8, 105, 10, 117, 33, 111, 57, 101, 59, 105, 33, 98, 22, 91, 22, 84, 44]);
        rect(c, '#a3b8aa', 38, 21, 34, 8);
        rect(c, '#5d6e78', 48, 11, 13, 10);
        rect(c, '#819893', 49, 12, 10, 4);
        rect(c, '#587d7e', 51, 63, 20, 25);
        rect(c, '#b3c4ae', 55, 68, 12, 3);
        rect(c, '#b3c4ae', 55, 75, 12, 3);
    });
}
