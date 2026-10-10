import Phaser from 'phaser';
import type { EnemyDef } from './types';
import { ENEMY_RULES, pursuitDirection, projectileExpired } from './enemy-rules';
export interface Enemy {
    sprite: Phaser.Physics.Arcade.Sprite;
    def: EnemyDef;
    hp: number;
    direction: number;
    nextShot: number;
    immuneUntil: number;
}
export class Enemies {
    list: Enemy[] = [];
    group: Phaser.Physics.Arcade.Group;
    projectiles: Phaser.Physics.Arcade.Group;
    constructor(private scene: Phaser.Scene, defs: EnemyDef[]) {
        this.group = scene.physics.add.group();
        this.projectiles = scene.physics.add.group({ allowGravity: false, maxSize: 16 });
        defs.forEach(def => {
            const s = this.group.create(def.x, def.y, def.kind) as Phaser.Physics.Arcade.Sprite;
            s.setDepth(12).setSize(30, 30).setOffset((s.width - 30) / 2, s.height - 32);
            const e = { sprite: s, def, hp: def.kind === 'armored' ? 2 : 1, direction: 1, nextShot: 1700 + this.list.length * 280, immuneUntil: 0 };
            s.setData('enemy', e);
            if (def.kind === 'quail')
                (s.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            this.list.push(e);
        });
    }
    update(now: number, playerX: number, playerY: number) {
        for (const e of this.list) {
            const s = e.sprite;
            if (!s.active)
                continue;
            const body = s.body as Phaser.Physics.Arcade.Body;
            const near = Math.abs(s.x - playerX) < 1000;
            s.setVisible(near);
            body.enable = near;
            if (!near)
                continue;
            const flying = e.def.kind === 'quail';
            const chase = pursuitDirection(s.x, s.y, playerX, playerY, e.def.minX, e.def.maxX,
                flying ? ENEMY_RULES.flyingNotice : ENEMY_RULES.groundNotice);
            if (chase) e.direction = chase;
            if (flying) {
                s.setVelocityX(e.direction * (chase ? 66 : 45));
                const targetY = chase ? Phaser.Math.Clamp(playerY - 12, e.def.y - 60, e.def.y + 60) : e.def.y;
                s.setVelocityY(Phaser.Math.Clamp((targetY - s.y) * 1.5, -42, 42) + Math.cos(now / 620 + e.def.x) * 10);
            }
            else if (e.def.kind === 'spitter') {
                s.setVelocityX(0);
                s.setFlipX(playerX < s.x);
                if (Math.abs(playerX - s.x) < 550) {
                    const until = e.nextShot - now;
                    if (until < 460 && until > 0)
                        s.setTint(0xffcb70);
                    else
                        s.clearTint();
                    if (now >= e.nextShot) {
                        this.shoot(e, playerX, now);
                        e.nextShot = now + 2600;
                    }
                }
                else {
                    e.nextShot = now + 1300;
                    s.clearTint();
                }
            }
            else
                s.setVelocityX(e.direction * (e.def.kind === 'armored' ? (chase ? 42 : 32) : (chase ? 64 : 48)));
            if (s.x >= e.def.maxX || body.blocked.right) {
                e.direction = -1;
                s.x = Math.min(s.x, e.def.maxX);
            }
            else if (s.x <= e.def.minX || body.blocked.left) {
                e.direction = 1;
                s.x = Math.max(s.x, e.def.minX);
            }
            // Yield to the enemy ahead instead of stacking on the same position.
            if (this.list.some(other => other !== e && other.sprite.active && other.hp > 0 &&
                Math.abs(other.sprite.y - s.y) < 36 &&
                (other.sprite.x - s.x) * e.direction > 0 && Math.abs(other.sprite.x - s.x) < ENEMY_RULES.spacing))
                s.setVelocityX(0);
            if (e.def.kind !== 'spitter')
                s.setFlipX(e.direction < 0);
            if (e.hp === 1 && e.def.kind === 'armored')
                s.setTint(0xe8b978);
        }
        this.projectiles.getChildren().forEach(obj => {
            const p = obj as Phaser.Physics.Arcade.Sprite;
            if (p.active && (projectileExpired(p.x, p.getData('startX'), now - p.getData('bornAt')) || Math.abs(p.x - playerX) > 850 || p.y > 550))
                p.destroy();
        });
    }
    private shoot(e: Enemy, playerX: number, now: number) {
        if (this.projectiles.countActive() >= 16)
            return;
        const dir = playerX < e.sprite.x ? -1 : 1;
        const p = this.projectiles.create(e.sprite.x + dir * 26, e.sprite.y + 5, 'projectile') as Phaser.Physics.Arcade.Sprite;
        p.setData('startX', p.x).setData('bornAt', now);
        p.setSize(12, 12).setVelocityX(dir * 155).setDepth(15);
    }
    stomp(e: Enemy, now: number): boolean {
        if (now < e.immuneUntil)
            return false;
        e.immuneUntil = now + 350;
        e.hp--;
        if (e.hp <= 0) {
            e.sprite.disableBody(true, false);
            this.scene.tweens.add({ targets: e.sprite, scaleY: .2, alpha: 0, y: e.sprite.y + 14, duration: 170, onComplete: () => e.sprite.setVisible(false) });
        }
        else {
            this.scene.tweens.add({ targets: e.sprite, scaleX: 1.2, scaleY: .8, duration: 100, yoyo: true });
        }
        return true;
    }
}
