export function createInput({ shell, joystick, stick, attackButton, onAttack, onPause, onGesture }) {
  let enabled = false, pointer = null, attackPointer = null, origin = { x: 0, y: 0 };
  const vector = { x: 0, y: 0 }, keys = new Set(), listeners = [];
  function listen(target, name, callback, options) {
    target.addEventListener(name, callback, options);
    listeners.push(() => target.removeEventListener(name, callback, options));
  }
  function releaseMovement() {
    const previous = pointer; pointer = null;
    vector.x = vector.y = 0; joystick.hidden = true; stick.style.transform = '';
    if (previous !== null && shell.hasPointerCapture(previous)) shell.releasePointerCapture(previous);
  }
  function releaseAttack() {
    const previous = attackPointer; attackPointer = null;
    attackButton.classList.remove('pressed');
    if (previous !== null && attackButton.hasPointerCapture(previous)) attackButton.releasePointerCapture(previous);
  }
  function reset() { releaseMovement(); releaseAttack(); keys.clear(); }
  listen(shell, 'pointerdown', event => {
    if (!enabled || event.target.closest('button') || pointer !== null) return;
    event.preventDefault(); pointer = event.pointerId; shell.setPointerCapture(pointer);
    const rect = shell.getBoundingClientRect();
    origin = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    joystick.style.left = `${origin.x}px`; joystick.style.top = `${origin.y}px`; joystick.hidden = false;
    onGesture();
  });
  listen(shell, 'pointermove', event => {
    if (event.pointerId !== pointer) return;
    const rect = shell.getBoundingClientRect(), dx = event.clientX - rect.left - origin.x, dy = event.clientY - rect.top - origin.y;
    const factor = Math.min(1, 40 / (Math.hypot(dx, dy) || 1));
    vector.x = dx * factor / 40; vector.y = dy * factor / 40;
    stick.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
  });
  listen(attackButton, 'pointerdown', event => {
    if (!enabled || attackPointer !== null) return;
    event.preventDefault(); event.stopPropagation(); attackPointer = event.pointerId;
    attackButton.setPointerCapture(attackPointer); attackButton.classList.add('pressed'); onGesture(); onAttack();
  });
  // Keyboard and assistive-technology activation remain available without double firing pointer taps.
  listen(attackButton, 'click', event => { if (enabled && event.detail === 0) { onGesture(); onAttack(); } });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    listen(shell, type, event => { if (event.pointerId === pointer) releaseMovement(); });
    listen(attackButton, type, event => { if (event.pointerId === attackPointer) releaseAttack(); });
  }
  listen(window, 'keydown', event => {
    if (event.key === 'Escape' && !event.repeat) { onPause(); return; }
    if (!enabled || event.target.closest('button, input, select')) return;
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
    keys.add(key);
    if (key === ' ' && !event.repeat) { onGesture(); onAttack(); }
  });
  listen(window, 'keyup', event => keys.delete(event.key.toLowerCase()));
  for (const type of ['gesturestart', 'gesturechange', 'dblclick']) {
    listen(shell, type, event => { if (enabled) event.preventDefault(); }, { passive: false });
  }
  return {
    read() {
      if (!enabled) return { x: 0, y: 0 };
      const x = pointer !== null ? vector.x : Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
      const y = pointer !== null ? vector.y : Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
      const length = Math.max(1, Math.hypot(x, y)); return { x: x / length, y: y / length };
    },
    setEnabled(value) { if (value !== enabled) reset(); enabled = value; shell.classList.toggle('input-active', value); },
    reset,
    destroy() { reset(); for (const remove of listeners) remove(); },
  };
}
