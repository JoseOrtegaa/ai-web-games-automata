/** Original vector character art for Huroner Survivor 2. No simulation state. */
const INK = '#15282d';
const paths = new Map();
function shape(c, data, fill, stroke = INK, width = 1.3) {
  let path = paths.get(data);
  if (!path) { path = new Path2D(data); paths.set(data, path); }
  if (fill) { c.fillStyle = fill; c.fill(path); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(path); }
}
function oval(c, x, y, rx, ry, fill, stroke = null, width = 1.2) {
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = fill; c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(); }
}
function line(c, data, color = INK, width = 1) { shape(c, data, null, color, width); }

/** Approximately 46 × 60 units. x/y is the actor ground anchor, face is ±1. */
export function drawFerret(c, { x = 0, y = 0, scale = 1, face = 1, walk = 0, armor = 0 } = {}) {
  c.save(); c.translate(x, y); c.scale(scale * (face < 0 ? -1 : 1), scale);
  c.lineJoin = 'round'; c.lineCap = 'round';
  const step = Math.sin(walk) * 2;
  oval(c, 0, 18, 21, 5.5, '#06131966');
  // Long charcoal-tipped tail is the defining mustelid silhouette.
  shape(c, 'M-7 10C-29 17-29 3-24-3C-31-1-34 15-22 21C-15 25-6 20-1 16Z', '#c6b597');
  shape(c, 'M-24-3C-31-1-34 15-22 21L-18 15C-26 12-27 5-24-3Z', '#3a4847');
  c.save(); c.translate(0, step * .18);
  shape(c, 'M-9 5L-12 17Q-14 22-5 21L1 9Z', '#394a49');
  c.save(); c.translate(0, -step);
  shape(c, 'M3 5L6 18Q4 22 15 20L12 16L12 4Z', '#263d40'); c.restore();
  shape(c, 'M-11-8Q-16 3-9 15Q0 21 13 10L12-10Z', '#d8c7a8');
  shape(c, 'M-5-8Q-8 4-4 13Q2 17 8 10L7-10Z', '#f1e5ca', null);
  line(c, 'M-8 10L-4 14M-9 7L-6 9', '#a89376', .8);
  if (armor) {
    shape(c, 'M-13-3L-10 9L0 13L10 7L13-4L2-8Z', '#63766a');
    shape(c, 'M-8-2L-6 7L0 9L4 4L3-6Z', '#9da48a', '#b8b494', .7);
    line(c, 'M-12 3L10 0M-2-6L0 10', '#344e4d', 1);
  }
  // Scarf knot and wind-cut pennant stay red at every armor rank.
  shape(c, 'M-8-12Q-20-15-25-8L-20-6L-24-1Q-11-3-7-9Z', '#a7443b');
  shape(c, 'M-12-14Q-2-10 10-15L12-9Q0-3-12-8Z', '#c9604d');
  line(c, 'M-12-10Q-2-7 10-12', '#f0986e', .8);
  // Sword held beside the body, ivory blade and copper guard.
  shape(c, 'M13 9L20-12L23-15L23-9L17 10Z', '#e6eddf', '#607b79', 1);
  line(c, 'M20-9L16 6', '#fff9df', .8);
  shape(c, 'M11 7L20 10L19 12L10 9Z', '#b99054');
  line(c, 'M14 11L12 16', '#705743', 3);
  oval(c, 11, 1, 4.3, 6.5, '#d7c6a6', INK);
  oval(c, 13, 5, 3.3, 3, '#efe1c4', INK, .9);
  // Rounded ears, narrow muzzle and dark eye mask distinguish a ferret.
  oval(c, -10, -23, 5.3, 5.8, '#dcccaf', INK);
  oval(c, 7, -25, 5.2, 5.2, '#dcccaf', INK);
  oval(c, -10, -23, 2.6, 3.2, '#b78e7e');
  oval(c, 7, -25, 2.5, 2.5, '#b78e7e');
  shape(c, 'M-13-23Q-7-30 4-28Q12-26 13-18L17-13L12-7Q2-4-8-11Q-15-15-13-23Z', '#f0e5cc');
  shape(c, 'M-12-21Q-7-25-2-19Q5-24 11-21L13-15Q7-12 2-14L-2-12Q-9-12-13-17Z', '#42504b', null);
  shape(c, 'M0-17Q6-20 11-15L17-13L11-8Q3-7-2-12Z', '#f6edd6', null);
  oval(c, -6, -18, 2.1, 2.8, '#0c1e24'); oval(c, 7, -18, 1.8, 2.6, '#0c1e24');
  oval(c, -5.6, -19, .7, .9, '#fff9df'); oval(c, 7.5, -19, .6, .8, '#fff9df');
  shape(c, 'M11-13Q14-15 16-13L14-10Z', '#725e54', null);
  line(c, 'M13-10L10-8M2-12L-5-12M3-10L-3-8', '#8f8978', .7);
  line(c, 'M-7-25L-4-26M-4-26L-1-25', '#fff7df', .8);
  c.restore(); c.restore();
}

function corruption(c, tier, bird) {
  if (!tier) return;
  const coral = tier >= 3 ? '#e28a64' : '#b75c55';
  shape(c, bird ? 'M-12-4L-23-12L-17 0L-24 3L-12 8Z' : 'M-13-6L-23-10L-18-1L-25 5L-12 7Z', coral);
  line(c, bird ? 'M-20-7L-14 2M-20 3L-13 4' : 'M-19-6L-13 1M-20 4L-13 4', '#f3b485', .8);
  if (tier >= 2) {
    shape(c, 'M5-13L9-24L12-15L19-20L16-7Z', '#8b5559');
    line(c, 'M9-20L10-12M16-17L13-10', '#db8b70', .8);
  }
  if (tier >= 3) shape(c, 'M-10 7L-19 17L-7 13L-3 21L1 9Z', '#ad574e');
}

function rabbit(c, tier, hare, phase) {
  const coat = hare ? '#b5a083' : '#d2cbb2';
  // Hare's swept ears and sloping spine read as a runner; rabbit stays upright.
  oval(c, -12, 6, hare ? 5 : 6, 5.5, '#e7dcc1', INK);
  c.save(); c.translate(0, phase);
  if (hare) {
    shape(c, 'M-9-9C-11-20-18-29-15-35Q-5-31-1-12Z', coat);
    shape(c, 'M1-12Q0-28 6-37Q13-32 8-10Z', coat);
    line(c, 'M-13-29L-6-14M6-30L5-14', '#675d55', 2.8);
    shape(c, 'M-13 6Q-14-9-1-14Q12-12 13 3L17 11Q3 17-13 6Z', coat);
    shape(c, 'M-8 9Q-13 12-17 15L-8 17L1 10M7 9L11 17L20 17L12 7', '#b09a7d');
  } else {
    shape(c, 'M-10-12Q-18-34-10-36Q-3-34-3-13Z', coat);
    shape(c, 'M1-14Q-1-37 7-35Q12-33 8-12Z', coat);
    line(c, 'M-10-29L-7-17M6-29L5-18', '#a9847b', 2.5);
    oval(c, 0, 2, 14.5, 14.5, coat, INK);
    oval(c, -8, 14, 7, 4, '#bdb39c', INK);
    oval(c, 8, 14, 7, 4, '#bdb39c', INK);
  }
  corruption(c, tier, false);
  shape(c, 'M-13-11Q-5-20 7-14L13-7L9 1Q1 5-9-2Z', coat);
  shape(c, 'M-4-5Q2-8 9-3L9 1Q0 5-6 0Z', '#e9dfc6', null);
  oval(c, -7, -8, 2.6, 3.4, tier ? '#db7562' : '#384547');
  oval(c, 6, -8, 2.4, 3.3, tier ? '#db7562' : '#384547');
  line(c, 'M-11-12L-5-10M3-10L9-12', INK, 1.6);
  oval(c, -6.5, -9, .75, .85, '#f3e8c8');
  shape(c, 'M-1-2L4-2L1 1Z', '#846a61', null);
  line(c, 'M1 1L1 4M-4 0L-13-1M7 0L14 0', '#5f655c', .65);
  if (tier) shape(c, 'M-3 2L-1 7L1 3M4 2L6 6L7 1', '#f2dfb8', INK, .7);
  else shape(c, 'M-1 3L-1 6L3 6L3 3', '#f0e8cd', INK, .65);
  c.restore();
}

function bird(c, tier, chicken, phase) {
  const coat = chicken ? '#d9ceb0' : '#a99877';
  c.save(); c.translate(0, phase); line(c, 'M-5 10L-7 17L-11 18', '#bc9760', 2); c.restore();
  c.save(); c.translate(0, -phase); line(c, 'M5 10L7 17L11 18', '#bc9760', 2); c.restore();
  c.save(); c.translate(0, phase * .4);
  if (chicken) {
    shape(c, 'M-9 2C-24-1-28-12-21-17L-12-7Q-22-27-13-27L-5-9Q-9-27-1-24L3-5Z', '#4c6258');
    line(c, 'M-21-13L-10 0M-13-22L-6-4', '#89977b', .85);
  } else shape(c, 'M-9 6L-23 2L-17 12L-5 13Z', '#655f4e');
  shape(c, chicken ? 'M-15 0Q-15-13-1-13Q13-14 15 1Q17 15 3 17Q-12 16-15 0Z' : 'M-14 3Q-12-10 1-12Q14-10 14 3Q13 15 0 16Q-12 16-14 3Z', coat);
  corruption(c, tier, true);
  shape(c, 'M-10-2Q-1-5 2 3L-4 11Q-15 9-10-2Z', chicken ? '#a99d7f' : '#675f4e');
  line(c, 'M-9 2L-3 5M-9 5L-5 8', '#d7c8a2', .8);
  if (!chicken) {
    for (let row = 0; row < 2; row++) for (let j = 0; j < 3; j++) {
      oval(c, 2 + j * 3.5, 4 + row * 4 + j % 2, .8, 1.4, '#ece0bd');
    }
    line(c, 'M3-16Q2-27-5-25', '#313f3e', 2.5);
    oval(c, -6, -25, 3, 2, '#5b6657');
  } else {
    shape(c, 'M-3-17Q-10-24-4-27L0-23Q0-33 6-30L8-24Q14-27 15-22L11-16Z', '#b75446');
    shape(c, 'M9-6Q17-1 12 4Q6 4 8-5Z', '#b75446');
  }
  shape(c, 'M-5-17Q1-23 9-19Q15-15 12-7L5-5Q-6-7-5-17Z', coat);
  if (!chicken) shape(c, 'M-4-16Q2-21 10-16L10-13Q3-17-4-12Z', '#e8dec0', null);
  shape(c, 'M10-13L22-8L11-6Z', '#c49a55');
  line(c, 'M13-9L20-8', '#786244', .7);
  oval(c, 5, -14, 2.6, 3.2, tier ? '#e18467' : '#20383b');
  oval(c, 5.7, -15, .8, .9, '#fbefd3');
  line(c, 'M1-18L8-17', '#485248', 1.3);
  c.restore();
}

/** Approx. 40 × 56 units. Caller controls scale, including boss scale. */
export function drawAnimal(c, { kind = 'rabbit', x = 0, y = 0, scale = 1, tier = 0, boss = false, time = 0, flash = 0, id = 0 } = {}) {
  c.save(); c.translate(x, y); c.scale(scale, scale); c.lineJoin = 'round'; c.lineCap = 'round';
  const phase = Math.sin(time * (kind === 'hare' ? 12 : 8) + id * 1.73) * 1.3;
  oval(c, 0, 18, 18, 4.5, '#07171b66');
  // Flat vector colors avoid expensive per-enemy Canvas filters.
  if (kind === 'quail' || kind === 'chicken') bird(c, tier, kind === 'chicken', phase);
  else rabbit(c, tier, kind === 'hare', phase);
  if (boss) {
    // Thorn circlet, distinct from normal mutation protrusions.
    const crownY = kind === 'chicken' ? -34 : kind === 'quail' ? -28 : -37;
    c.save(); c.translate(0, crownY);
    shape(c, 'M-10 5L-13-2L-5 1L0-8L4 1L12-3L10 6Z', '#b48f58', INK, 1);
    line(c, 'M-8 4L8 4', '#f2d89d', 1);
    oval(c, 0, 3, 1.5, 1.5, '#b44f45'); c.restore();
  }
  if (flash > 0) {
    // A compact ivory impact mark remains readable without obscuring shape.
    c.globalAlpha *= Math.min(.85, flash * 5);
    shape(c, 'M-5-11L1-3L7-10L4-1L12 2L3 5L1 13L-2 5L-10 7L-5 0L-10-5L-2-4Z', '#fff6db', null);
  }
  c.restore();
}
