const SIZE = 768;
const THEMES = [
  { name: 'clearing', soil: '#142b32', patches: ['#1b363b', '#1c383e'], ink: '#506457', stone: '#2c4849', accent: '#8e7959' },
  { name: 'withered', soil: '#18272b', patches: ['#243330', '#26352f'], ink: '#53604c', stone: '#344039', accent: '#706340' },
  { name: 'graveyard', soil: '#171e2b', patches: ['#252c3a', '#222a36'], ink: '#515767', stone: '#384052', accent: '#6b617a' },
  { name: 'ossuary', soil: '#211921', patches: ['#34242b', '#30222b'], ink: '#635152', stone: '#433139', accent: '#805057' },
  { name: 'ruins', soil: '#1c111d', patches: ['#302030', '#281925'], ink: '#634659', stone: '#432a3b', accent: '#8b4356' },
  { name: 'abyss', soil: '#100e19', patches: ['#211a2c', '#191725'], ink: '#4f3e5d', stone: '#33233e', accent: '#843e60' },
];
const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
export function worldStage(level) { return Math.floor(Math.max(1, level) / 5); }
function ellipse(c, x, y, rx, ry, color) {
  c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
}
function line(c, points, color, width = 2) {
  c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
}
function tileFor(stage) {
  const theme = THEMES[Math.min(stage, THEMES.length - 1)];
  const tile = document.createElement('canvas'); tile.width = tile.height = SIZE;
  const c = tile.getContext('2d'); c.fillStyle = theme.soil; c.fillRect(0, 0, SIZE, SIZE);
  // Every motif is wrapped during baking; camera movement cannot expose tile seams.
  for (let i = 0; i < 100; i++) {
    const x = hash(i, 4) * SIZE, y = hash(i, 9) * SIZE, n = hash(i, 2);
    for (const dx of [-SIZE, 0, SIZE]) for (const dy of [-SIZE, 0, SIZE]) {
      c.save(); c.translate(dx, dy);
      ellipse(c, x, y, 35 + n * 80, 20 + n * 45, theme.patches[n > .5 ? 0 : 1]);
      if (i % 3 === 0) line(c, [[x - 5, y], [x - 8, y - 8], [x - 1, y - 2], [x + 4, y - 11]], theme.ink + '38', 1);
      if (i % 7 === 0) {
        c.fillStyle = theme.stone; c.beginPath(); [[-7,0],[-3,-5],[5,-4],[8,2],[0,5]].forEach(([a,b],j)=>j?c.lineTo(x+a,y+b):c.moveTo(x+a,y+b)); c.closePath(); c.fill();
        line(c, [[x - 3, y - 5], [x + 5, y - 4]], theme.ink + '60', 1);
      }
      if (i % 11 === 0) ellipse(c, x + 7, y + 4, 1.3, 2.3, theme.accent + '60');
      for (let j = 0; j < 3; j++) line(c, [[x+j*4,y+10],[x+j*4+3,y+8]], theme.ink + '20', 1);
      c.restore();
    }
  }
  if (stage === 0) return tile;
  // Decoration is scenery only, beneath all actors, pickups and attack warnings.
  const count = Math.min(14 + stage * 4, 38);
  for (let i = 0; i < count; i++) {
    const x = hash(i + stage * 19, 33) * SIZE, y = hash(i + stage * 19, 61) * SIZE;
    for (const dx of [-SIZE, 0, SIZE]) for (const dy of [-SIZE, 0, SIZE]) {
      c.save(); c.translate(x + dx, y + dy); c.rotate((hash(i, stage + 5) - .5) * .7);
      if (stage >= 4 && i % 6 === 0) {
        // Broken arches: a recognizable ruin silhouette, without blocking movement.
        c.fillStyle = theme.stone; c.fillRect(-29,-36,10,52); c.fillRect(19,-52,11,68);
        line(c,[[-24,-36],[-18,-57],[-7,-65],[0,-62]],theme.ink+'80',8);
        line(c,[[25,-52],[14,-65],[8,-63]],theme.ink+'70',8);
        line(c,[[-25,-19],[-20,-22]],theme.soil,3);
      } else if (stage >= 3 && i % 4 === 0) {
        ellipse(c,0,0,11,13,theme.ink+'90');
        ellipse(c,-4,-2,3,4,theme.soil); ellipse(c,4,-2,3,4,theme.soil);
        line(c,[[-5,11],[5,11]],theme.soil,2);
        line(c,[[-21,20],[21,29]],theme.ink+'70',4);
        line(c,[[-17,29],[18,18]],theme.ink+'70',3);
      } else if (stage >= 2 && i % 3 === 0) {
        c.fillStyle = theme.stone; c.beginPath(); c.moveTo(-13,16); c.lineTo(-12,-17); c.quadraticCurveTo(0,-31,12,-17); c.lineTo(14,16); c.closePath(); c.fill();
        line(c,[[-6,-8],[6,-8]],theme.ink+'80',2); line(c,[[0,-14],[0,3]],theme.ink+'80',2);
        ellipse(c,0,19,22,5,theme.soil);
      } else {
        // Barren roots and splintered branches replace the living meadow.
        line(c,[[0,29],[-6,8],[3,-9],[-4,-38]],theme.ink+'75',4);
        line(c,[[-6,8],[-24,-4],[-29,-22]],theme.ink+'65',3);
        line(c,[[3,-9],[21,-21],[24,-37]],theme.ink+'65',2);
        line(c,[[-4,-28],[-16,-39]],theme.ink+'65',2);
      }
      if (stage >= 3) {
        line(c,[[-43,35],[-22,28],[-13,38],[7,27],[31,30],[46,17]],theme.soil,5);
        line(c,[[-43,35],[-22,28],[-13,38],[7,27],[31,30],[46,17]],theme.accent+'70',1);
      }
      c.restore();
    }
  }
  // Later five-level steps keep changing the layout and deepen the same abyss,
  // with a bounded darkness floor and fixed cache size instead of hiding combat.
  if (stage > 5) { c.fillStyle = `rgba(3,2,9,${.2 * (1 - Math.exp(-(stage - 5) / 5))})`; c.fillRect(0,0,SIZE,SIZE); }
  return tile;
}
export function createWorldLayer() {
  let stage = -1, current, previous, changedAt = 0;
  function paint(ctx, tile, w, h, cx, cy) {
    const ox = ((cx % SIZE) + SIZE) % SIZE, oy = ((cy % SIZE) + SIZE) % SIZE;
    for (let x = -ox; x < w; x += SIZE) for (let y = -oy; y < h; y += SIZE) ctx.drawImage(tile, x, y);
  }
  return {
    draw(ctx, w, h, cx, cy, { level, time, reducedMotion }) {
      const next = worldStage(level);
      if (next !== stage) {
        previous = next > stage && stage >= 0 ? current : null;
        current = tileFor(next); stage = next; changedAt = time;
      }
      const blend = reducedMotion ? 1 : Math.min(1, Math.max(0, (time - changedAt) / 1.8));
      if (previous && blend < 1) {
        paint(ctx, previous, w, h, cx, cy); ctx.save(); ctx.globalAlpha = blend;
        paint(ctx, current, w, h, cx, cy); ctx.restore();
      } else { previous = null; paint(ctx, current, w, h, cx, cy); }
    },
  };
}
