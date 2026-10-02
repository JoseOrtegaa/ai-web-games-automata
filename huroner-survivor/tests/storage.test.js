import test from 'node:test';
import assert from 'node:assert/strict';
import { PREFERENCES_KEY, RECORD_KEY, loadPreferences, savePreferences, loadRecord, saveRecord } from '../storage.js';

function memoryStorage(entries = []) {
  const values = new Map(entries);
  const reads = [], writes = [];
  return {
    values, reads, writes,
    getItem(key) { reads.push(key); return values.get(key) ?? null; },
    setItem(key, value) { writes.push(key); values.set(key, value); },
  };
}

test('preferences default from browser language and validate each stored field', () => {
  const defaults = { language: 'es', muted: false, attackMode: 'button', attackSide: 'right' };
  assert.deepEqual(loadPreferences(memoryStorage(), 'es-ES'), defaults);
  assert.deepEqual(loadPreferences(memoryStorage(), 'fr-FR'), { ...defaults, language: 'en' });
  for (const raw of ['{broken', 'null', '42', 'false', '[]', '"text"']) {
    assert.deepEqual(loadPreferences(memoryStorage([[PREFERENCES_KEY, raw]]), 'es'), defaults);
  }
  const invalid = { language: 'de', muted: 'true', attackMode: 'rapid', attackSide: 'center' };
  assert.deepEqual(loadPreferences(memoryStorage([[PREFERENCES_KEY, JSON.stringify(invalid)]]), 'es'), defaults);
  const partial = memoryStorage([[PREFERENCES_KEY, JSON.stringify({ language: 'en', muted: true })]]);
  assert.deepEqual(loadPreferences(partial, 'es'), { ...defaults, language: 'en', muted: true });
});

test('preferences and records round-trip using only V2 keys, without touching legacy data', () => {
  const storage = memoryStorage([['huroner-best', '{"time":599}'], ['huroner-language', 'es']]);
  const preferences = { language: 'en', muted: true, attackMode: 'auto', attackSide: 'left' };
  // Time may exceed ten minutes while the final boss is still alive.
  const record = { time: 713, kills: 800, level: 27, won: true };
  savePreferences(preferences, storage); saveRecord(record, storage);
  assert.deepEqual(loadPreferences(storage, 'es'), preferences);
  assert.deepEqual(loadRecord(storage), record);
  assert.deepEqual(storage.reads, [PREFERENCES_KEY, RECORD_KEY]);
  assert.deepEqual(storage.writes, [PREFERENCES_KEY, RECORD_KEY]);
  assert.equal(PREFERENCES_KEY, 'huroner-survivor-2:preferences:v1');
  assert.equal(RECORD_KEY, 'huroner-survivor-2:record:v1');
  assert.equal(storage.values.get('huroner-best'), '{"time":599}');
  assert.equal(storage.values.get('huroner-language'), 'es');
});

test('records reject malformed JSON, missing fields, invalid ranges and non-integer numbers', () => {
  const valid = { time: 0, kills: 0, level: 1, won: false };
  const load = value => loadRecord(memoryStorage([[RECORD_KEY, JSON.stringify(value)]]));
  assert.deepEqual(load(valid), valid);
  assert.equal(loadRecord(memoryStorage([[RECORD_KEY, '{broken']])), null);
  for (const value of [null, [], {}, 1, { ...valid, won: 1 }]) assert.equal(load(value), null);
  for (const key of ['time', 'kills', 'level']) {
    for (const value of [-1, 1.5, '2', null, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      assert.equal(load({ ...valid, [key]: value }), null, `${key}: ${value}`);
    }
    const missing = { ...valid }; delete missing[key]; assert.equal(load(missing), null);
  }
  assert.equal(load({ ...valid, level: 0 }), null);
});

test('storage access and quota failures do not interrupt play', () => {
  const blocked = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('QuotaExceededError'); } };
  assert.equal(loadPreferences(blocked, 'en').language, 'en');
  assert.equal(loadRecord(blocked), null);
  assert.doesNotThrow(() => savePreferences({ language: 'en' }, blocked));
  assert.doesNotThrow(() => saveRecord({ time: 1, kills: 0, level: 1, won: false }, blocked));
  assert.equal(loadRecord(null), null);
  assert.doesNotThrow(() => savePreferences({}, null));
});
