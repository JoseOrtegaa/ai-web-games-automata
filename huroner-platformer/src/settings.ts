export type MovementMode = 'swipe' | 'buttons';
const storageKey = 'ferret-jump-controls-v1';

export function setupMovementSettings(onChange: (mode: MovementMode) => void) {
    const dialog = document.getElementById('settings') as HTMLDialogElement;
    const options = document.querySelectorAll<HTMLInputElement>('[name="movement"]');
    const apply = (mode: MovementMode) => {
        document.getElementById('directions')!.hidden = mode !== 'buttons';
        document.getElementById('swipe-zone')!.hidden = mode !== 'swipe';
        options.forEach(option => option.checked = option.value === mode);
        onChange(mode);
    };
    let initial: MovementMode = 'swipe';
    try {
        if (localStorage.getItem(storageKey) === 'buttons') initial = 'buttons';
    } catch { /* Controls remain usable when storage is blocked. */ }
    apply(initial);
    options.forEach(option => option.addEventListener('change', () => {
        const mode = option.value as MovementMode;
        apply(mode);
        try { localStorage.setItem(storageKey, mode); } catch { /* Session-only preference. */ }
    }));
    document.getElementById('open-settings')!.onclick = () => dialog.showModal();
    document.getElementById('close-settings')!.onclick = () => dialog.close();
}
