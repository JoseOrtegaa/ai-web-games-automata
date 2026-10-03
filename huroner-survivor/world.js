const SIZE = 768;
const THEMES = [
  { name: 'surface', soil: '#142b32', patches: ['#1b363b', '#1c383e'], ink: '#506457', stone: '#2c4849', bone: '#998a6c', magma: '#9a3f24', oil: '#090b0d' },
  { name: 'underground', soil: '#241d18', patches: ['#342820', '#2d241f'], ink: '#665443', stone: '#51443a', bone: '#b2a080', magma: '#9f4025', oil: '#0a0a0b' },
  { name: 'deep', soil: '#1d1716', patches: ['#2e201c', '#281b19'], ink: '#6b4d43', stone: '#4b3a36', bone: '#b49b7d', magma: '#c44b24', oil: '#070708' },
  { name: 'magma', soil: '#170d0d', patches: ['#281313', '#321712'], ink: '#6d3930', stone: '#442b29', bone: '#8f7765', magma: '#e55a27', oil: '#050506' },
];
const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function worldStage(depth, level) {
  const d = clamp(Math.round(Number(depth) || 0), 0, 3), l = Math.max(1, Number(level) || 1);
  if (d === 0) return 0;
  if (d === 1) return 10;
  if (d === 2) return l >= 25 ? 22 : l >= 20 ? 21 : 20;
  return l >= 40 ? 32 : l >= 35 ? 31 : 30;
}

function ellipse(c, x, y, rx, ry, color) {
  c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
}
function line(c, points, color, width = 2) {
  c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
}
function skull(c, x, y, scale, theme, burned = false) {
  c.save(); c.translate(x, y); c.scale(scale, scale);
  ellipse(c, 0, 0, 9, 8, burned ? '#3a2925' : theme.bone + 'b8');
  ellipse(c, -3, -1, 2, 2.5, theme.soil); ellipse(c, 3, -1, 2, 2.5, theme.soil);
  line(c, [[-4,6],[4,6]], theme.soil, 1.5); c.restore();
}
function bones(c, x, y, theme, alpha = '88') {
  line(c, [[x-14,y-7],[x+15,y+9]], theme.bone + alpha, 3);
  line(c, [[x-13,y+10],[x+14,y-8]], theme.bone + alpha, 3);
  for (const [bx, by] of [[x-15,y-8],[x+16,y+10],[x-14,y+11],[x+15,y-9]]) ellipse(c,bx,by,2.5,2.5,theme.bone+alpha);
}
function magmaCrack(c, x, y, theme, strength = 1) {
  const glow = Math.min(.55, .18 + strength * .13);
  c.save(); c.shadowColor = theme.magma; c.shadowBlur = 7 + strength * 6;
  line(c, [[x-30,y-8],[x-13,y+1],[x-3,y-6],[x+9,y+5],[x+31,y-2]], theme.magma + Math.round(glow*255).toString(16).padStart(2,'0'), 2.2 + strength);
  c.restore();
}
function oilPool(c, x, y, theme, scale = 1) {
  ellipse(c,x,y,31*scale,13*scale,theme.oil+'d8');
  ellipse(c,x-7*scale,y-2*scale,12*scale,4*scale,'#2c2927a0');
}
function tileFor(stage) {
  const depth = stage >= 30 ? 3 : stage >= 20 ? 2 : stage >= 10 ? 1 : 0;
  const phase = depth === 2 ? stage - 20 : depth === 3 ? stage - 30 : 0;
  const theme = THEMES[depth];
  const tile = document.createElement('canvas'); tile.width = tile.height = SIZE;
  const c = tile.getContext('2d'); c.fillStyle = theme.soil; c.fillRect(0, 0, SIZE, SIZE);

  for (let i = 0; i < 92; i++) {
    const x = hash(i + depth * 23, 4) * SIZE, y = hash(i + depth * 31, 9) * SIZE, n = hash(i, depth + 2);
    for (const dx of [-SIZE, 0, SIZE]) for (const dy of [-SIZE, 0, SIZE]) {
      c.save(); c.translate(dx, dy);
      ellipse(c, x, y, 28 + n * 72, 17 + n * 38, theme.patches[n > .5 ? 0 : 1]);
      if (i % (depth ? 5 : 7) === 0) {
        c.fillStyle = theme.stone; c.beginPath();
        [[-8,1],[-4,-6],[5,-5],[9,2],[2,6]].forEach(([a,b],j)=>j?c.lineTo(x+a,y+b):c.moveTo(x+a,y+b));
        c.closePath(); c.fill(); line(c, [[x-4,y-5],[x+5,y-4]], theme.ink+'70', 1);
      }
      if (depth === 0 && i % 4 === 0) {
        line(c, [[x-3,y+11],[x-6,y+2],[x,y-7],[x+3,y-13]], theme.ink+'35', 1);
      }
      c.restore();
    }
  }

  const decor = depth === 0 ? 18 : depth === 1 ? 28 : depth === 2 ? 34 : 40;
  for (let i = 0; i < decor; i++) {
    const x = hash(i + stage * 41, 33) * SIZE, y = hash(i + stage * 47, 61) * SIZE;
    for (const dx of [-SIZE,0,SIZE]) for (const dy of [-SIZE,0,SIZE]) {
      c.save(); c.translate(dx,dy);
      if (depth === 0) {
        if (i % 3 === 0) {
          c.save(); c.translate(x,y); c.rotate((hash(i,7)-.5)*.8);
          line(c,[[0,24],[-4,6],[3,-12],[-2,-29]],theme.ink+'78',3);
          line(c,[[-4,7],[-18,-3]],theme.ink+'5d',2); c.restore();
        }
      } else if (depth === 1) {
        if (i % 4 === 0) skull(c,x,y,.8+hash(i,2)*.45,theme);
        else if (i % 3 === 0) bones(c,x,y,theme,'70');
        else {
          c.fillStyle=theme.stone;c.beginPath();c.moveTo(x-14,y+10);c.lineTo(x-7,y-18);c.lineTo(x+8,y-25);c.lineTo(x+16,y+11);c.closePath();c.fill();
          line(c,[[x-5,y-16],[x+7,y-21]],theme.ink+'65',2);
        }
      } else if (depth === 2) {
        if (i % 6 === 0) skull(c,x,y,.85+hash(i,5)*.5,theme,phase>=2&&i%12===0);
        else if (i % 5 === 0) bones(c,x,y,theme,phase>=1?'92':'68');
        else if (i % 4 === 0) {
          c.fillStyle=theme.stone;c.beginPath();c.moveTo(x-15,y+12);c.lineTo(x-10,y-18);c.lineTo(x+3,y-28);c.lineTo(x+18,y+10);c.closePath();c.fill();
          line(c,[[x-8,y-8],[x+8,y-14]],theme.ink+'72',2);
        }
        if (phase >= 1 && i % (phase >= 2 ? 3 : 6) === 0) magmaCrack(c,x,y,theme,phase);
        if (phase >= 2 && i % 8 === 0) oilPool(c,x+15,y-10,theme,.8+hash(i,4)*.4);
        if (phase >= 2 && i % 9 === 0) {
          c.save();c.translate(x,y);c.rotate(hash(i,11)*Math.PI);
          line(c,[[-20,0],[20,0]],theme.bone+'88',5);
          for(let j=-2;j<=2;j++)line(c,[[j*7,-7],[j*7,7]],theme.bone+'70',2);
          c.restore();
        }
      } else {
        if (i % 5 === 0) skull(c,x,y,.85+hash(i,3)*.45,theme,true);
        if (i % 4 === 0) bones(c,x,y,theme,phase>=1?'6b':'4f');
        if (i % (phase>=1?2:3) === 0) magmaCrack(c,x,y,theme,2+phase);
        if (i % (phase>=1?5:8) === 0) {
          c.save();c.shadowColor=theme.magma;c.shadowBlur=14+phase*5;
          ellipse(c,x+11,y+8,26+phase*7,9+phase*4,theme.magma+(phase>=1?'a0':'78'));c.restore();
        }
        if (phase>=1 && i%7===0) {
          c.save();c.translate(x,y);c.rotate((hash(i,19)-.5)*1.4);
          line(c,[[-20,0],[19,0]],'#392522',7);line(c,[[-5,-7],[7,6]],'#241615',5);c.restore();
        }
      }
      c.restore();
    }
  }

  if (depth >= 1) {
    const shade = depth === 1 ? .08 : depth === 2 ? .16 : .23;
    c.fillStyle = `rgba(4,2,3,${shade})`; c.fillRect(0,0,SIZE,SIZE);
  }
  return tile;
}

export function createWorldLayer() {
  let stage = null, current = null, previous = null, changedAt = 0;
  const cache = new Map();
  const getTile = key => { if (!cache.has(key)) cache.set(key, tileFor(key)); return cache.get(key); };
  function paint(ctx, tile, w, h, cx, cy) {
    const ox = ((cx % SIZE) + SIZE) % SIZE, oy = ((cy % SIZE) + SIZE) % SIZE;
    for (let x = -ox; x < w; x += SIZE) for (let y = -oy; y < h; y += SIZE) ctx.drawImage(tile, x, y);
  }
  return {
    draw(ctx, w, h, cx, cy, { depth = 0, level = 1, time = 0, reducedMotion = false }) {
      const next = worldStage(depth, level);
      if (next !== stage) {
        previous = stage === null ? null : current;
        current = getTile(next); stage = next; changedAt = time;
      }
      const blend = reducedMotion ? 1 : Math.min(1, Math.max(0, (time - changedAt) / 1.25));
      if (previous && blend < 1) {
        paint(ctx, previous, w, h, cx, cy); ctx.save(); ctx.globalAlpha = blend;
        paint(ctx, current, w, h, cx, cy); ctx.restore();
      } else { previous = null; paint(ctx, current, w, h, cx, cy); }
    },
  };
}
