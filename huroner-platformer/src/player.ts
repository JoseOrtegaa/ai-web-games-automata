import Phaser from 'phaser';
import { B, verticalGravity } from './balance';
import { jumpAllowed } from './collision';
import type { Input } from './input';
export class Player {
    sprite: Phaser.Physics.Arcade.Sprite;
    lastGround = -9999;
    pressedAt = -9999;
    facing = 1;
    hurtUntil = 0;
    invulnerableUntil = 0;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.sprite = scene.physics.add.sprite(x, y, 'ferret', 0);
        this.sprite.setSize(24, 42).setOffset(12, 20).setMaxVelocity(310, B.maxFall);
        this.sprite.setDepth(20);
    }
    get body() {
        return this.sprite.body as Phaser.Physics.Arcade.Body;
    }
    update(input: Input, now: number, oil: boolean, onJump: () => void) {
        const body = this.body;
        const grounded = body.blocked.down || body.touching.down;
        if (grounded)
            this.lastGround = now;
        if (input.pressed)
            this.pressedAt = now;
        if (now >= this.hurtUntil) {
            const axis = input.axis;
            this.sprite.setAccelerationX(axis * (grounded ? B.acceleration : B.airAcceleration));
            this.sprite.setDragX(grounded ? B.drag : B.airDrag);
            this.sprite.setMaxVelocity(B.speed * (oil ? B.oilMultiplier : 1), B.maxFall);
            if (axis) {
                this.facing = axis;
                this.sprite.setFlipX(axis < 0);
            }
            if (jumpAllowed(grounded, now, this.lastGround, this.pressedAt, B.coyote, B.buffer)) {
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
        const anim = now < this.hurtUntil ? 'hurt' : !grounded ? (body.velocity.y < 0 ? 'jump' : 'fall') : Math.abs(body.velocity.x) > 15 ? 'run' : 'idle';
        this.sprite.play(`ferret-${anim}`, true);
        this.sprite.alpha = now < this.invulnerableUntil ? (matchMedia('(prefers-reduced-motion: reduce)').matches ? .65 : Math.floor(now / 90) % 2 ? .4 : 1) : 1;
    }
    reset(x: number, y: number) {
        this.sprite.enableBody(true, x, y, true, true);
        this.sprite.setAcceleration(0, 0).setVelocity(0, 0).setGravityY(0).setAlpha(1).setAngle(0);
        this.lastGround = -9999;
        this.pressedAt = -9999;
        this.hurtUntil = 0;
    }
}
