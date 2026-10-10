import Phaser from 'phaser';
import { B, verticalGravity } from './balance';
import { jumpAllowed } from './collision';
import type { Input } from './input';
export class Player {
    sprite: Phaser.Physics.Arcade.Sprite;
    crouched = false;
    lastGround = -9999;
    pressedAt = -9999;
    facing = 1;
    hurtUntil = 0;
    invulnerableUntil = 0;
    coat: 'classic' | 'snow' | 'violet' = 'classic';
    constructor(scene: Phaser.Scene, x: number, y: number, private canStand: (left: number, top: number, right: number, bottom: number) => boolean) {
        this.sprite = scene.physics.add.sprite(x, y, 'ferret', 0);
        this.sprite.setSize(24, 42).setOffset(12, 20).setMaxVelocity(310, B.maxFall);
        this.sprite.setDepth(20);
    }
    get body() {
        return this.sprite.body as Phaser.Physics.Arcade.Body;
    }
    animation(name:string) { return `${this.coat==='classic'?'ferret':`ferret-${this.coat}`}-${name}`; }
    setCoat(coat:string) { this.coat=coat==='snow'||coat==='violet'?coat:'classic'; }
    update(input: Input, now: number, oil: boolean, onJump: () => void, icy = false) {
        const body = this.body;
        const grounded = body.blocked.down || body.touching.down;
        if (input.crouch && grounded && !this.crouched) this.setCrouched(true);
        if (!input.crouch && this.crouched && this.canStand(body.left, body.bottom - 42, body.right, body.bottom - 24)) this.setCrouched(false);
        if (grounded)
            this.lastGround = now;
        if (input.pressed && !this.crouched)
            this.pressedAt = now;
        if (this.crouched) this.pressedAt = -9999;
        if (now >= this.hurtUntil) {
            const axis = input.axis;
            this.sprite.setAccelerationX(axis * (this.crouched ? B.acceleration * .65 : grounded ? B.acceleration * (icy ? .38 : 1) : B.airAcceleration));
            this.sprite.setDragX(this.crouched ? B.drag * 1.5 : grounded ? B.drag * (icy ? .08 : 1) : B.airDrag);
            this.sprite.setMaxVelocity((this.crouched ? 85 : B.speed) * (oil ? B.oilMultiplier : 1), B.maxFall);
            if (axis) {
                this.facing = axis;
                this.sprite.setFlipX(axis < 0);
            }
            if (!this.crouched && jumpAllowed(grounded, now, this.lastGround, this.pressedAt, B.coyote, B.buffer)) {
                body.setVelocityY(input.jump ? -B.jump : -B.cutJump);
                this.lastGround = -9999;
                this.pressedAt = -9999;
                onJump();
            }
            if (input.released && body.velocity.y < -B.cutJump)
                body.setVelocityY(-B.cutJump);
        }
        // Phaser adds body gravity to the world's 1200 px/s²; only the ferret changes.
        body.setGravityY(grounded ? 0 : B.gravity * (verticalGravity(body.velocity.y, input.jump) - 1));
        const anim = now < this.hurtUntil ? 'hurt' : this.crouched ? 'crouch' : !grounded ? (body.velocity.y < 0 ? 'jump' : 'fall') : Math.abs(body.velocity.x) > 15 ? 'run' : 'idle';
        this.sprite.play(this.animation(anim), true);
        this.sprite.alpha = now < this.invulnerableUntil ? (matchMedia('(prefers-reduced-motion: reduce)').matches ? .65 : Math.floor(now / 90) % 2 ? .4 : 1) : 1;
    }
    private setCrouched(value: boolean) {
        this.crouched = value;
        this.sprite.setSize(24, value ? 24 : 42).setOffset(12, value ? 38 : 20);
    }
    reset(x: number, y: number) {
        this.sprite.enableBody(true, x, y, true, true);
        this.setCrouched(false);
        this.sprite.setAcceleration(0, 0).setVelocity(0, 0).setGravityY(0).setAlpha(1).setAngle(0);
        this.lastGround = -9999;
        this.pressedAt = -9999;
        this.hurtUntil = 0;
    }
}
