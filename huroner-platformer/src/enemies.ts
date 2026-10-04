import Phaser from 'phaser';
import type { EnemyDef } from './types';
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
                s.setGravityY(-1200);
            this.list.push(e);
        });
    }
    update(now: number, playerX: number) {
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
            if (e.def.kind === 'quail') {
                s.setVelocityX(e.direction * 45);
                s.setVelocityY(Math.cos(now / 620 + e.def.x) * 26);
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
                        this.shoot(e, playerX);
                        e.nextShot = now + 2600;
                    }
                }
                else
                    e.nextShot = now + 1300;
            }
            else
                s.setVelocityX(e.direction * (e.def.kind === 'armored' ? 32 : 48));
            if (s.x >= e.def.maxX || body.blocked.right) {
                e.direction = -1;
                s.x = Math.min(s.x, e.def.maxX);
            }
            else if (s.x <= e.def.minX || body.blocked.left) {
                e.direction = 1;
                s.x = Math.max(s.x, e.def.minX);
            }
            if (e.def.kind !== 'spitter')
                s.setFlipX(e.direction < 0);
            if (e.hp === 1 && e.def.kind === 'armored')
                s.setTint(0xe8b978);
        }
        this.projectiles.getChildren().forEach(obj => {
            const p = obj as Phaser.Physics.Arcade.Sprite;
            if (p.active && (Math.abs(p.x - playerX) > 850 || p.y > 550))
                p.destroy();
        });
    }
    private shoot(e: Enemy, playerX: number) {
        if (this.projectiles.countActive() >= 16)
            return;
        const dir = playerX < e.sprite.x ? -1 : 1;
        const p = this.projectiles.create(e.sprite.x + dir * 26, e.sprite.y + 5, 'projectile') as Phaser.Physics.Arcade.Sprite;
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
