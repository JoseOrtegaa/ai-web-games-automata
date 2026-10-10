import type { Status } from './powerups';
const element = (id: string) => document.getElementById(id)!;
export class UI {
    private toastTimer: ReturnType<typeof setTimeout> | undefined;
    show(id: string, visible: boolean) {
        element(id).hidden = !visible;
    }
    bind(id: string, fn: () => void) {
        element(id).onclick = fn;
    }
    hud(state: Status, kibble: number, now: number) {
        element('hearts').innerHTML = Array.from({ length: 3 }, (_, i) => `<span class="${i >= state.health ? 'empty' : ''}">${i < state.health ? '♥' : '♡'}</span>`).join('');
        element('hearts').setAttribute('aria-label', `${state.health} corazones`);
        element('count').textContent = String(kibble);
        element('buff').textContent = [state.shield ? '✦ Pompón' : null, state.oilUntil > now ? `↠ ${Math.ceil((state.oilUntil - now) / 1000)}s` : null].filter(Boolean).join(' · ');
    }
    toast(text: string) {
        clearTimeout(this.toastTimer);
        element('toast').textContent = text;
        element('toast').classList.add('visible');
        this.toastTimer = setTimeout(() => element('toast').classList.remove('visible'), 2500);
    }
    clearToast() {
        clearTimeout(this.toastTimer);
        element('toast').classList.remove('visible');
    }
    results(kibble: number, secrets: number, totalSecrets: number, seconds: number) {
        element('results').innerHTML = `◆ ${kibble} croquetas<br><small>${secrets}/${totalSecrets} secretos · ${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}</small>`;
    }
}
