export const PREFERENCES_KEY = 'huroner-survivor-2:preferences:v1';
export const RECORD_KEY = 'huroner-survivor-2:record:v1';

function browserStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}
function read(key, storage) {
  try { return JSON.parse(storage?.getItem(key) ?? 'null'); } catch { return null; }
}
function write(key, value, storage) {
  try { storage?.setItem(key, JSON.stringify(value)); } catch { /* Private browsing must not interrupt play. */ }
}
export function loadPreferences(storage = browserStorage(), browserLanguage = globalThis.navigator?.language ?? 'es') {
  const saved = read(PREFERENCES_KEY, storage) ?? {};
  return {
    language: ['es', 'en'].includes(saved.language) ? saved.language : browserLanguage.startsWith('es') ? 'es' : 'en',
    muted: typeof saved.muted === 'boolean' ? saved.muted : false,
    attackMode: ['button', 'auto'].includes(saved.attackMode) ? saved.attackMode : 'button',
    attackSide: ['left', 'right'].includes(saved.attackSide) ? saved.attackSide : 'right',
  };
}
export function savePreferences(preferences, storage = browserStorage()) { write(PREFERENCES_KEY, preferences, storage); }
export function loadRecord(storage = browserStorage()) {
  const value = read(RECORD_KEY, storage);
  if (!value || typeof value.won !== 'boolean') return null;
  if (!['time', 'kills', 'level'].every(key => Number.isSafeInteger(value[key]))) return null;
  if (value.time < 0 || value.kills < 0 || value.level < 1) return null;
  return { time: value.time, kills: value.kills, level: value.level, won: value.won };
}
export function saveRecord(record, storage = browserStorage()) { write(RECORD_KEY, record, storage); }

