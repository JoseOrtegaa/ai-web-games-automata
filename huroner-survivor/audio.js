export function createAudio() {
  let context, muted = false, musicTimer = 0, musicStep = 0;
  const voices = new Set();
  function unlock() {
    try {
      context ??= new (window.AudioContext || window.webkitAudioContext)();
      context.resume().catch(() => {});
    } catch { /* Unsupported audio leaves a fully playable silent game. */ }
  }
  function tone(frequency, duration, volume = .04, type = 'sine', end) {
    if (muted || context?.state !== 'running' || voices.size >= 24) return;
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    if (end) oscillator.frequency.exponentialRampToValueAtTime(end, context.currentTime + duration);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
    oscillator.connect(gain); gain.connect(context.destination);
    voices.add(oscillator);
    oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(); oscillator.stop(context.currentTime + duration);
  }
  function silence() { for (const voice of voices) { try { voice.stop(); } catch {} } }
  return {
    unlock,
    setMuted(value) { muted = value; if (value) silence(); },
    tick(dt) {
      musicTimer -= dt;
      if (musicTimer > 0) return;
      musicTimer = .38;
      const notes = [146.83, 0, 220, 174.61, 0, 196, 130.81, 0, 146.83, 220, 0, 261.63, 196, 0, 174.61, 130.81];
      const note = notes[musicStep++ % notes.length];
      if (note) tone(note, .28, .018, 'triangle');
    },
    handleEvents(events) {
      let picked = false;
      for (const event of events) {
        if (event.type === 'slash') tone(170, .09, .023, 'triangle', 55);
        if (event.type === 'hurt') tone(90, .15, .065, 'sawtooth', 35);
        if (event.type === 'pickup' && !picked) { tone(850, .06, .013); picked = true; }
        if (event.type === 'level') { tone(523, .25, .05); tone(784, .4, .035); }
        if (event.type === 'item') tone(740, .09, .025);
        if (event.type === 'boss') tone(65, .9, .08, 'sawtooth');
        if (event.type === 'storm') tone(260, .18, .04, 'sawtooth', 40);
      }
    },
    suspend() { silence(); context?.suspend().catch(() => {}); },
    reset() { silence(); musicStep = 0; musicTimer = 0; },
  };
}

