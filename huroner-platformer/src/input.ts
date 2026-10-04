export class Input {
    private keys = new Set<string>();
    private pointers = new Map<number, string>();
    pressed = false;
    released = false;
    private wasJump = false;
    constructor() {
        window.addEventListener('keydown', e => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'd', 'w', 'A', 'D', 'W'].includes(e.key)) {
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
        window.addEventListener('blur', () => this.clear());
    }
    get axis() {
        const held = [...this.pointers.values()];
        return Number(this.keys.has('arrowright') || this.keys.has('d') || held.includes('right')) - Number(this.keys.has('arrowleft') || this.keys.has('a') || held.includes('left'));
    }
    get jump() {
        return this.keys.has(' ') || this.keys.has('arrowup') || this.keys.has('w') || [...this.pointers.values()].includes('jump');
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
    clear() {
        this.keys.clear();
        this.pointers.clear();
        this.pressed = false;
        this.released = false;
        this.wasJump = false;
        this.paint();
    }
}
