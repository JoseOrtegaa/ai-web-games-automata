import { setupMovementSettings, type MovementMode } from './settings';

export class Input {
    private keys = new Set<string>();
    private pointers = new Map<number, string>();
    pressed = false;
    released = false;
    private wasJump = false;
    private movementMode: MovementMode = 'swipe';
    private swipe: { id: number; startX: number; startY: number } | undefined;
    private swipeAxis = 0;
    private swipeDown = false;
    private wheelCrouchUntil = 0;
    constructor() {
        setupMovementSettings(mode => {
            this.clear();
            this.movementMode = mode;
        });
        window.addEventListener('keydown', e => {
            if (document.querySelector('dialog[open]')) return;
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'a', 'd', 'w', 's', 'A', 'D', 'W', 'S'].includes(e.key)) {
                e.preventDefault();
                this.keys.add(e.key.toLowerCase());
                this.edges();
            }
        });
        window.addEventListener('keyup', e => {
            this.keys.delete(e.key.toLowerCase());
            this.edges();
        });
        document.querySelectorAll<HTMLButtonElement>('[data-control]').forEach(button => {
            button.addEventListener('pointerdown', e => {
                if (button.dataset.control !== 'jump' && this.movementMode !== 'buttons') return;
                e.preventDefault();
                button.setPointerCapture(e.pointerId);
                this.pointers.set(e.pointerId, button.dataset.control!);
                this.edges();
                this.paint();
            });
            const end = (e: PointerEvent) => {
                e.preventDefault();
                this.pointers.delete(e.pointerId);
                this.edges();
                this.paint();
            };
            button.addEventListener('pointerup', end);
            button.addEventListener('pointercancel', end);
            button.addEventListener('lostpointercapture', end);
        });
        const zone = document.getElementById('swipe-zone')!;
        zone.addEventListener('pointerdown', e => {
            if (this.movementMode !== 'swipe' || this.swipe) return;
            e.preventDefault();
            zone.setPointerCapture(e.pointerId);
            this.swipe = { id: e.pointerId, startX: e.clientX, startY: e.clientY };
            zone.classList.add('active');
        });
        zone.addEventListener('pointermove', e => {
            if (this.swipe?.id !== e.pointerId) return;
            e.preventDefault();
            const dx = e.clientX - this.swipe.startX;
            const dy = e.clientY - this.swipe.startY;
            this.swipeDown = dy > 28 && dy > Math.abs(dx);
            this.swipeAxis = this.swipeDown || Math.abs(dx) < 12 ? 0 : Math.sign(dx);
            zone.classList.toggle('crouching', this.swipeDown);
            zone.style.setProperty('--swipe-offset', `${this.swipeDown ? 0 : Math.max(-52, Math.min(52, dx))}px`);
        });
        const endSwipe = (e: PointerEvent) => {
            if (this.swipe?.id !== e.pointerId) return;
            this.clearSwipe();
        };
        zone.addEventListener('pointerup', endSwipe);
        zone.addEventListener('pointercancel', endSwipe);
        zone.addEventListener('lostpointercapture', endSwipe);
        window.addEventListener('wheel', e => {
            if (document.getElementById('controls')!.hidden) return;
            if (e.deltaY > 8) {
                e.preventDefault();
                this.wheelCrouchUntil = Date.now() + 400;
            } else if (e.deltaY < -8) {
                this.wheelCrouchUntil = 0;
            }
        }, { passive: false });
        window.addEventListener('blur', () => this.clear());
    }
    get axis() {
        const held = [...this.pointers.values()];
        return Number(this.keys.has('arrowright') || this.keys.has('d') || held.includes('right') || this.swipeAxis > 0) - Number(this.keys.has('arrowleft') || this.keys.has('a') || held.includes('left') || this.swipeAxis < 0);
    }
    get jump() {
        return this.keys.has(' ') || this.keys.has('arrowup') || this.keys.has('w') || [...this.pointers.values()].includes('jump');
    }
    get crouch() {
        return this.keys.has('arrowdown') || this.keys.has('s') || [...this.pointers.values()].includes('crouch') || this.swipeDown || Date.now() < this.wheelCrouchUntil;
    }
    private edges() {
        const jump = this.jump;
        if (jump && !this.wasJump)
            this.pressed = true;
        if (!jump && this.wasJump)
            this.released = true;
        this.wasJump = jump;
    }
    private paint() {
        document.querySelectorAll('[data-control]').forEach(b => b.classList.toggle('held', [...this.pointers.values()].includes((b as HTMLElement).dataset.control!)));
    }
    consume() {
        this.pressed = false;
        this.released = false;
    }
    private clearSwipe() {
        this.swipe = undefined;
        this.swipeAxis = 0;
        this.swipeDown = false;
        this.wheelCrouchUntil = 0;
        const zone = document.getElementById('swipe-zone')!;
        zone.classList.remove('active');
        zone.classList.remove('crouching');
        zone.style.setProperty('--swipe-offset', '0px');
    }
    clear() {
        this.clearSwipe();
        this.keys.clear();
        this.pointers.clear();
        this.pressed = false;
        this.released = false;
        this.wasJump = false;
        this.paint();
    }
}
