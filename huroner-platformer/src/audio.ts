type Sound = 'jump' | 'kibble' | 'stomp' | 'hurt' | 'power' | 'dead' | 'win' | 'checkpoint' | 'secret';
export class Audio {
    private ctx: AudioContext | null = null;
    muted = false;
    unlock() {
        try {
            this.ctx ??= new AudioContext();
            void this.ctx.resume();
        }
        catch {
            /* A blocked audio device never blocks play. */
        }
    }
    play(kind: Sound) {
        if (this.muted || !this.ctx || this.ctx.state !== 'running')
            return;
        const ctx = this.ctx;
        const melodies: Record<Sound, number[]> = { jump: [280, 440], kibble: [880, 1175], stomp: [200, 120], hurt: [180, 90], power: [440, 554, 659, 880], dead: [330, 247, 165], win: [523, 659, 784, 1047, 784, 1047], checkpoint: [523, 784, 1047], secret: [392, 494, 587, 784] };
        melodies[kind].forEach((f, i) => {
            const t = ctx.currentTime + i * .075;
            const osc = ctx.createOscillator(), gain = ctx.createGain();
            osc.type = kind === 'hurt' ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(.075, t + .008);
            gain.gain.exponentialRampToValueAtTime(.001, t + .14);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + .16);
        });
    }
}
