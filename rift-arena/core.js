export const WIDTH = 1152;
export const GROUND = 508;
export const LIMITS = [75, WIDTH - 75];
export const ROSTER = [
  { id: 'kira', name: 'KIRA', alias: 'LA SOMBRA', color: '#b98bff', shade: '#47276b', speed: 305, power: 1, defense: 1, trait: 'Ráfaga fugaz', bio: 'Velocidad, fintas y golpes rápidos.' },
  { id: 'volt', name: 'VOLT', alias: 'EL RAYO', color: '#6ee8ff', shade: '#125a72', speed: 260, power: 1.03, defense: 1, trait: 'Pulso eléctrico', bio: 'Equilibrado, con un especial de largo alcance.' },
  { id: 'onyx', name: 'ONYX', alias: 'EL TITÁN', color: '#ffbd6c', shade: '#70431b', speed: 210, power: 1.18, defense: .82, trait: 'Terremoto', bio: 'Resiste más y golpea con mucha fuerza.' },
  { id: 'ember', name: 'EMBER', alias: 'LA LLAMA', color: '#ff6f8b', shade: '#7c2449', speed: 278, power: 1.1, defense: .96, trait: 'Patada infernal', bio: 'Presión constante y combos agresivos.' }
];
export const MOVES = {
  punch: { start: .09, active: .12, end: .21, range: 93, damage: 7, push: 21 },
  kick: { start: .16, active: .15, end: .29, range: 123, damage: 11, push: 35 },
  special: { start: .22, active: .2, end: .44, range: 166, damage: 19, push: 72, cost: 40 }
};
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function fighterDefinition(id) { return ROSTER.find(f => f.id === id) || ROSTER[0]; }
export function createFighter(id, x, face = 1) {
  return { id, x, y: 0, vy: 0, face, health: 100, meter: 45, action: null,
    block: false, stun: 0, flash: 0, walk: 0, combo: 0, comboClock: 0, hits: 0 };
}
export function moveInfo(fighter) {
  const base = MOVES[fighter.action?.type || 'punch'];
  if (fighter.action?.type !== 'special') return base;
  if (fighter.id === 'volt') return { ...base, range: 310, damage: 16 };
  if (fighter.id === 'onyx') return { ...base, range: 183, damage: 24 };
  if (fighter.id === 'kira') return { ...base, range: 204, damage: 18 };
  return { ...base, range: 178, damage: 21 };
}
export function tryAttack(f, type) {
  if (!MOVES[type] || f.health <= 0 || f.stun > 0 || f.action || f.block) return false;
  const cost = MOVES[type].cost || 0;
  if (f.meter < cost) return false;
  f.meter -= cost;
  f.action = { type, elapsed: 0, hit: false };
  return true;
}
export function stepFighter(f, intent, enemy, dt) {
  const d = clamp(dt, 0, .05);
  f.face = enemy.x >= f.x ? 1 : -1;
  f.flash = Math.max(0, f.flash - d);
  f.stun = Math.max(0, f.stun - d);
  f.comboClock = Math.max(0, f.comboClock - d);
  if (f.comboClock === 0) f.combo = 0;
  const stunned = f.stun > 0 || f.health <= 0;
  f.block = !stunned && !f.action && f.y === 0 && !!intent.block;
  if (!stunned && !f.block) {
    if (intent.punch) tryAttack(f, 'punch');
    else if (intent.kick) tryAttack(f, 'kick');
    else if (intent.special) tryAttack(f, 'special');
    const axis = Number(!!intent.right) - Number(!!intent.left);
    const slow = f.action ? .28 : 1;
    f.x = clamp(f.x + axis * fighterDefinition(f.id).speed * slow * d, ...LIMITS);
    f.walk += Math.abs(axis) * d * 11;
    if (intent.jump && f.y === 0 && !f.action) f.vy = 600;
  }
  if (f.y > 0 || f.vy > 0) {
    f.y += f.vy * d;
    f.vy -= 1500 * d;
    if (f.y <= 0) { f.y = 0; f.vy = 0; }
  }
  if (f.action) {
    f.action.elapsed += d;
    const m = moveInfo(f);
    if (f.action.elapsed > m.start + m.active + m.end) f.action = null;
  }
}
export function resolveHit(attacker, defender) {
  const action = attacker.action;
  if (!action || action.hit || attacker.health <= 0) return null;
  const m = moveInfo(attacker);
  if (action.elapsed < m.start || action.elapsed > m.start + m.active) return null;
  const dx = defender.x - attacker.x;
  if (Math.abs(dx) > m.range || Math.abs(defender.y - attacker.y) > 86 || dx * attacker.face < -28) return null;
  action.hit = true;
  const guarding = defender.block && defender.y === 0 && defender.face === -attacker.face;
  const raw = Math.round(m.damage * fighterDefinition(attacker.id).power / fighterDefinition(defender.id).defense);
  const damage = guarding ? Math.max(1, Math.round(raw * .17)) : raw;
  defender.health = clamp(defender.health - damage, 0, 100);
  defender.stun = guarding ? .11 : .25;
  defender.flash = .17;
  if (!guarding) { defender.action = null; defender.x = clamp(defender.x + attacker.face * m.push, ...LIMITS); }
  attacker.meter = clamp(attacker.meter + (guarding ? 4 : 12), 0, 100);
  defender.meter = clamp(defender.meter + (guarding ? 3 : 8), 0, 100);
  attacker.hits++;
  attacker.combo = attacker.comboClock > 0 ? attacker.combo + 1 : 1;
  attacker.comboClock = 1.15;
  return { x: defender.x, y: defender.y, damage, guarding, type: action.type,
    color: fighterDefinition(attacker.id).color, combo: attacker.combo };
}
export function keepApart(a, b) {
  const min = 64;
  const distance = b.x - a.x;
  if (Math.abs(distance) >= min) return;
  const sign = distance < 0 ? -1 : 1;
  const shift = (min - Math.abs(distance)) / 2;
  a.x = clamp(a.x - sign * shift, ...LIMITS);
  b.x = clamp(b.x + sign * shift, ...LIMITS);
}
export function winnerByTimeout(a, b) {
  if (a.health === b.health) return null;
  return a.health > b.health ? 0 : 1;
}
