import { Game, xpNeeded, ATTACK_COOLDOWN } from './core.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { loadPreferences, savePreferences, loadRecord, saveRecord } from './storage.js';
import { text, formatTime } from './i18n.js';

const $ = id => document.getElementById(id);
const game = new Game();
const preferences = loadPreferences();
const audio = createAudio();
const renderer = createRenderer({ canvas: $('world') });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let record = loadRecord(), mode = 'home', last = performance.now(), hudTimer = 0;
let choiceVersion = 0, visibleChoices = null, toastTimer = 0, shownBossId = null;
const t = key => text(key, preferences.language);
const input = createInput({
  shell: $('game-shell'), joystick: $('joystick'), stick: $('stick'), attackButton: $('attack-button'),
  onAttack() { if (mode === 'playing' && preferences.attackMode === 'button') game.manualAttack(); },
  onPause() { if (mode === 'paused') resume(); else pause(); },
  onGesture() { audio.unlock(); $('touch-hint').hidden = true; },
});

function show(id) {
  for (const name of ['home', 'settings-screen', 'level-screen', 'pause-screen', 'end-screen']) $(name).hidden = name !== id;
}
function focusArena() {
  $('game-shell').tabIndex = -1;
  $('game-shell').focus({ preventScroll: true });
}
function syncControls() {
  const active = mode === 'playing' && game.state === 'playing';
  input.setEnabled(active);
  $('attack-button').hidden = !active || preferences.attackMode !== 'button';
  $('attack-button').classList.toggle('left', preferences.attackSide === 'left');
  const readiness = Math.max(0, 1 - game.manualAttackCooldown / ATTACK_COOLDOWN);
  $('attack-button').classList.toggle('cooling', readiness < 1);
  $('attack-fill').style.width = `${readiness * 100}%`;
  $('combat-fill').style.width = `${readiness * 100}%`;
  $('combat-label').textContent = preferences.attackMode === 'auto' ? t('auto') : t('attack');
}
function updateSettings() {
  for (const [id, selected] of [
    ['attack-auto', preferences.attackMode === 'auto'], ['attack-manual', preferences.attackMode === 'button'],
    ['attack-left', preferences.attackSide === 'left'], ['attack-right', preferences.attackSide === 'right'],
    ['lang-es', preferences.language === 'es'], ['lang-en', preferences.language === 'en'],
  ]) { $(id).classList.toggle('selected', selected); $(id).setAttribute('aria-pressed', String(selected)); }
  $('attack-side-group').hidden = preferences.attackMode !== 'button';
  $('settings-sound').textContent = t(preferences.muted ? 'off' : 'on');
  $('pause-sound').textContent = `${t('sound')} · ${t(preferences.muted ? 'off' : 'on')}`;
  $('sound').textContent = preferences.muted ? '♪̸' : '♫';
  $('sound').setAttribute('aria-pressed', String(!preferences.muted));
}
function translate() {
  document.documentElement.lang = preferences.language;
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
  $('language').textContent = preferences.language === 'es' ? 'EN' : 'ES';
  for (const [id, key] of [['config', 'settings'], ['sound', 'sound'], ['pause', 'pause'], ['attack-button', 'attack'], ['world', 'arena']]) $(id).setAttribute('aria-label', t(key));
  $('attack-help').textContent = t(preferences.attackMode === 'auto' ? 'autoHelp' : 'manualHelp');
  $('best').textContent = record ? `${record.won ? '✧ ' : ''}${formatTime(record.time)} · ${record.kills} ${t('kills').toLowerCase()}` : t('noRecord');
  $('touch-hint').textContent = `${t('moveHelp')}\n${t(preferences.attackMode === 'auto' ? 'autoHelp' : 'manualHelp')}`;
  updateSettings(); hud();
}
function preference(key, value) {
  preferences[key] = value; savePreferences(preferences); audio.setMuted(preferences.muted); translate();
}
function toggleSound() { audio.unlock(); preference('muted', !preferences.muted); }
function toast(message) { $('toast').textContent = message; $('toast').classList.add('show'); toastTimer = 3; }
function start() {
  audio.unlock(); audio.reset(); game.reset(); mode = 'playing'; shownBossId = null;
  choiceVersion++; visibleChoices = null; input.reset(); show(null); $('hud').hidden = false;
  $('touch-hint').hidden = false; last = performance.now(); hud(); syncControls(); focusArena(); toast(t('huntBegins'));
}
function pause() {
  if (mode !== 'playing' || game.state !== 'playing') return;
  mode = 'paused'; input.reset(); show('pause-screen'); syncControls(); $('resume').focus({ preventScroll: true });
}
function resume() {
  if (mode !== 'paused') return;
  mode = 'playing'; input.reset(); show(null); audio.unlock(); last = performance.now(); syncControls(); focusArena();
}
function keepRecord(won) {
  const next = { time: Math.floor(game.time), kills: game.kills, level: game.level, won };
  const score = value => (value.won ? 1e7 : Math.min(value.time, 600) * 1000) + value.kills;
  if (!record || score(next) > score(record)) { record = next; saveRecord(record); }
}
function home() {
  if (mode === 'paused' || mode === 'playing') keepRecord(false);
  mode = 'home'; input.reset(); audio.reset(); choiceVersion++; visibleChoices = null;
  show('home'); $('hud').hidden = true; $('touch-hint').hidden = true; $('toast').classList.remove('show');
  syncControls(); translate(); $('start').focus({ preventScroll: true });
}
function end() {
  const won = game.state === 'won'; mode = 'end'; keepRecord(won); input.reset(); choiceVersion++;
  $('touch-hint').hidden = true; $('toast').classList.remove('show');
  $('end-kicker').textContent = t(won ? 'wonKicker' : 'deadKicker');
  $('end-title').textContent = t(won ? 'wonTitle' : 'deadTitle');
  $('end-copy').textContent = t(won ? 'wonCopy' : 'deadCopy');
  const stats = $('end-stats'); stats.replaceChildren();
  for (const [value, label] of [[formatTime(game.time), 'time'], [game.kills, 'kills'], [game.level, 'level']]) {
    const item = document.createElement('div'), strong = document.createElement('b'), small = document.createElement('small');
    strong.textContent = value; small.textContent = t(label); item.append(strong, small); stats.append(item);
  }
  show('end-screen'); syncControls(); $('retry').focus({ preventScroll: true });
}
function levelMenu() {
  input.reset(); syncControls(); show('level-screen'); $('touch-hint').hidden = true;
  visibleChoices = game.choices; const version = ++choiceVersion;
  $('level-summary').textContent = `${t('level')} ${game.level} · ${t('edition')}`;
  $('choices').replaceChildren();
  for (const upgrade of game.choices) {
    const button = document.createElement('button'); button.className = 'upgrade'; button.dataset.upgrade = upgrade.id;
    const icon = document.createElement('span'); icon.className = 'icon'; icon.textContent = upgrade.icon; icon.setAttribute('aria-hidden', 'true');
    const content = document.createElement('span'), title = document.createElement('strong'), description = document.createElement('small'), rank = document.createElement('em');
    const language = preferences.language === 'es' ? 0 : 1;
    title.textContent = upgrade.name[language]; description.textContent = upgrade.desc[language];
    rank.textContent = upgrade.id === 'heal' ? '♥' : `${t('rank')} ${game.rank(upgrade.id)} / ${upgrade.max} → ${game.rank(upgrade.id) + 1} / ${upgrade.max}`;
    content.append(title, description, rank); button.append(icon, content);
    button.onclick = event => {
      // A stale button or the second click of a double click cannot select the next offer.
      if (version !== choiceVersion || event.detail > 1 || mode !== 'playing') return;
      if (!game.choose(upgrade.id)) return;
      choiceVersion++; input.reset();
      if (game.state === 'levelup') levelMenu();
      else { visibleChoices = null; show(null); syncControls(); focusArena(); }
      hud();
    };
    $('choices').append(button);
  }
  $('choices').firstElementChild?.focus({ preventScroll: true });
}
function hud() {
  const player = game.player;
  $('level').textContent = game.level; $('timer').textContent = formatTime(game.time);
  $('timer-label').textContent = t(game.bossSpawned ? 'defeatBoss' : 'survive');
  $('shield-label').textContent = `${Math.ceil(player.shield)} / ${game.maxShield}`;
  $('shield-fill').style.width = `${Math.max(0, player.shield / game.maxShield * 100)}%`;
  $('hp-label').textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
  $('hp-fill').style.width = `${Math.max(0, player.hp / player.maxHp * 100)}%`;
  $('xp-fill').style.width = `${Math.min(100, game.xp / xpNeeded(game.level) * 100)}%`;
  $('xp-label').textContent = `${game.xp} / ${xpNeeded(game.level)} XP`;
  $('mutation-label').textContent = `${t('mutation')} ${['I', 'II', 'III', 'IV'][game.mutation]}`;
  $('kills').textContent = `${game.kills} ${t('kills').toLowerCase()}`;
  $('equipment').textContent = '⚔' + (game.rank('armor') ? '⬡' : '') + (game.rank('orbit') ? '✧' : '') + (game.rank('lightning') ? 'ϟ' : '') + (game.rank('frost') ? '❄' : '');
  const bosses = game.enemies.filter(enemy => enemy.boss && enemy.hp > 0);
  const boss = bosses.find(enemy => enemy.id === shownBossId) ?? bosses.find(enemy => enemy.finalBoss) ?? bosses[0];
  shownBossId = boss?.id ?? null; $('boss-hud').hidden = !boss;
  if (boss) {
    $('boss-name').textContent = `${t(boss.finalBoss ? 'finalBoss' : boss.kind)} · ${t('level')} ${boss.bossLevel}`;
    $('boss-count').textContent = bosses.length > 1 ? `${bosses.length} ${t('guardians')}` : '';
    $('boss-hud').dataset.bossId = String(boss.id); $('boss-fill').style.width = `${Math.max(0, boss.hp / boss.maxHp * 100)}%`;
  }
  const buffs = $('buffs'); buffs.replaceChildren();
  for (const [key, timer, bonus] of [['oil', game.speedBoostTimer, '+10%'], ['fire', game.fireTimer, '+35%']]) {
    if (timer <= 0) continue;
    const element = document.createElement('span'); element.textContent = `${t(key)} ${bonus} · ${Math.ceil(timer)} s`; buffs.append(element);
  }
}
function consumeEvents() {
  const events = game.events.splice(0); audio.handleEvents(events);
  for (const event of events) {
    if (event.type === 'mutation') toast(`${t('mutation')} ${['I', 'II', 'III', 'IV'][event.tier]} · ${t('mutationToast')}`);
    if (event.type === 'item') toast(t(`${event.kind}Toast`));
    if (event.type === 'boss') toast(event.final ? t('finalToast') : `${t('bossToast')} · ${event.level}`);
  }
  if (mode === 'playing' && (game.state === 'dead' || game.state === 'won')) end();
  else if (mode === 'playing' && game.state === 'levelup' && visibleChoices !== game.choices) levelMenu();
}
function frame(now) {
  const dt = Math.max(0, Math.min((now - last) / 1000, .05)); last = now;
  const movement = input.read();
  if (mode === 'playing' && game.state === 'playing') {
    game.step(dt, movement);
    if (game.state === 'playing') {
      if (preferences.attackMode === 'auto') game.manualAttack();
      audio.tick(dt);
    }
  }
  consumeEvents(); syncControls();
  if (toastTimer > 0) { toastTimer -= dt; if (toastTimer <= 0) $('toast').classList.remove('show'); }
  hudTimer -= dt; if (hudTimer <= 0 && mode !== 'home' && mode !== 'settings') { hudTimer = .08; hud(); }
  renderer.draw(game, { active: !['home', 'settings'].includes(mode), moving: Math.hypot(movement.x, movement.y) > .1, reducedMotion: reducedMotion.matches });
  requestAnimationFrame(frame);
}
$('start').onclick = start; $('retry').onclick = start; $('pause').onclick = pause; $('resume').onclick = resume;
$('quit').onclick = home; $('back').onclick = home;
$('config').onclick = () => { mode = 'settings'; input.reset(); updateSettings(); show('settings-screen'); $('attack-auto').focus({ preventScroll: true }); };
$('settings-done').onclick = () => { mode = 'home'; show('home'); $('config').focus({ preventScroll: true }); };
$('language').onclick = () => preference('language', preferences.language === 'es' ? 'en' : 'es');
$('lang-es').onclick = () => preference('language', 'es'); $('lang-en').onclick = () => preference('language', 'en');
$('sound').onclick = toggleSound; $('settings-sound').onclick = toggleSound; $('pause-sound').onclick = toggleSound;
$('attack-auto').onclick = () => preference('attackMode', 'auto'); $('attack-manual').onclick = () => preference('attackMode', 'button');
$('attack-left').onclick = () => preference('attackSide', 'left'); $('attack-right').onclick = () => preference('attackSide', 'right');
function loseFocus() { input.reset(); pause(); last = performance.now(); audio.suspend(); }
window.addEventListener('blur', loseFocus);
document.addEventListener('visibilitychange', () => { if (document.hidden) loseFocus(); });
audio.setMuted(preferences.muted); translate(); syncControls(); requestAnimationFrame(frame);
