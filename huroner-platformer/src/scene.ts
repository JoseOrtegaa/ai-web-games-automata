import Phaser from 'phaser';
import { createArt } from './art';
import { createEnvironment, createSurfaceArt } from './environment';
import { LEVEL } from './level-data';
import { B } from './balance';
import { Player } from './player';
import { Input } from './input';
import { Audio } from './audio';
import { UI } from './ui';
import { Enemies, type Enemy } from './enemies';
import { canStomp, canLandOneWay } from './collision';
import { applyPower, type Status } from './powerups';
import { saveRun } from './collectibles';
import { updateCamera } from './camera';
import type { PowerUpDef, SolidDef } from './types';
type Mode = 'menu' | 'playing' | 'paused' | 'dead' | 'won';
export class GameScene extends Phaser.Scene {
    player!: Player;
    controls!: Input;
    sounds = new Audio();
    ui = new UI();
    enemies!: Enemies;
    status: Status = { health: 3, shield: false, oilUntil: 0 };
    mode: Mode = 'menu';
    now = 0;
    count = 0;
    deathAt = 0;
    checkpoint = false;
    secrets = new Set<string>();
    collected = new Set<string>();
    safe = { ...LEVEL.spawn };
    private terrain!: Phaser.Physics.Arcade.StaticGroup;
    private pickups!: Phaser.Physics.Arcade.StaticGroup;
    private food!: Phaser.Physics.Arcade.StaticGroup;
    private panels: {
        id: string;
        rect: Phaser.GameObjects.Container;
    }[] = [];
    private shield!: Phaser.GameObjects.Arc;
    private checkpointSprite!: Phaser.GameObjects.Image;
    private bob: Phaser.GameObjects.Image[] = [];
    private section = -1;
    private hudAt = 0;
    private autoPaused = false;
    private particleCount = 0;
    constructor() {
        super('FerretJump');
    }
    create() {
        createArt(this);
        createSurfaceArt(this);
        this.drawWorld();
        this.controls = new Input();
        this.player = new Player(this, LEVEL.spawn.x, LEVEL.spawn.y);
        this.enemies = new Enemies(this, LEVEL.enemies);
        this.physics.add.collider(this.player.sprite, this.terrain, undefined, (a, b) => {
            const solid = (b as Phaser.GameObjects.GameObject).getData('solid') as SolidDef;
            const body = (a as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body;
            return !solid.oneWay || canLandOneWay(body.velocity.y, body.prev.y + body.height, solid.y);
        });
        this.physics.add.collider(this.enemies.group, this.terrain);
        this.physics.add.collider(this.enemies.projectiles, this.terrain, p => p.destroy());
        this.physics.add.overlap(this.player.sprite, this.enemies.group, (_p, obj) => this.touchEnemy((obj as Phaser.Physics.Arcade.Sprite).getData('enemy')));
        this.physics.add.overlap(this.player.sprite, this.enemies.projectiles, (_p, obj) => {
            if (this.mode === 'playing') {
                const x = (obj as Phaser.Physics.Arcade.Sprite).x;
                obj.destroy();
                this.damage(x);
            }
        });
        this.addPickups();
        this.shield = this.add.circle(0, 0, 31, 0xf4efbd, .15).setStrokeStyle(3, 0xe6f3ba, .85).setDepth(19).setVisible(false);
        this.bindUI();
        this.physics.pause();
        this.ui.hud(this.status, this.count, this.now);
        this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
        this.input.keyboard?.on('keydown-P', () => this.togglePause());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden)
                this.pauseForEnvironment();
        });
        window.addEventListener('blur', () => this.pauseForEnvironment());
        window.addEventListener('resize', () => this.orientation());
        this.orientation();
        if (new URLSearchParams(location.search).has('qa')) {
            (window as unknown as Record<string, unknown>).__ferretQA = { scene: this, state: () => this.snapshot(), teleport: (x: number, y: number) => {
                    this.player.reset(x, y);
                    this.cameras.main.scrollX = Phaser.Math.Clamp(x - 440, 0, LEVEL.width - 960);
                }, start: () => this.start(), damage: () => this.damage(this.player.sprite.x - 20), restart: () => this.restart() };
        }
    }
    private drawWorld() {
        createEnvironment(this);
        LEVEL.scenery.forEach(d => this.add.image(d.x, d.y, d.kind).setOrigin(.5, 1).setScale(d.scale ?? 1).setFlipX(d.flip ?? false).setDepth(-10).setAlpha(.88));
        this.terrain = this.physics.add.staticGroup();
        LEVEL.solids.forEach(def => {
            this.add.tileSprite(def.x, def.y, def.width, def.height, `surface-${def.surface}`).setOrigin(0).setDepth(5);
            this.add.rectangle(def.x, def.y, def.width, def.surface === 'grass' ? 7 : 3, ({ grass: 0x80955e, rock: 0xa9afac, stone: 0xb4afa2, metal: 0x93a5aa, concrete: 0xaaa9a2, bark: 0xb09a6e } as Partial<Record<SolidDef['surface'], number>>)[def.surface] ?? 0xd6bb8a, .85).setOrigin(0).setDepth(6);
            const r = this.add.rectangle(def.x + def.width / 2, def.y + def.height / 2, def.width, def.height, 0, 0);
            this.terrain.add(r);
            r.setData('solid', def);
        });
        LEVEL.secrets.forEach(s => {
            const panel = this.add.container(s.x, s.y).setDepth(25);
            const tex = this.add.tileSprite(0, 0, s.width, s.height, `surface-${s.surface}`).setOrigin(0);
            panel.add(tex);
            for (let x = 18; x < s.width; x += 38)
                panel.add(this.add.rectangle(x, 10, 4, s.height - 20, 0x172e3d, .4).setOrigin(0));
            panel.add(this.add.rectangle(s.width - 8, s.height - 20, 3, 13, 0xf5d9aa, .65));
            this.panels.push({ id: s.id, rect: panel });
        });
        this.checkpointSprite = this.add.image(LEVEL.checkpoint.x, 430, 'checkpoint').setOrigin(.5, 1).setDepth(10);
        this.add.image(LEVEL.goal.x, 430, 'goal').setOrigin(.5, 1).setDepth(10);
        const label = this.add.text(LEVEL.goal.x, 238, 'EL CASTILLO', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#fff3c0', letterSpacing: 3 }).setOrigin(.5).setDepth(11);
        this.tweens.add({ targets: label, alpha: .6, yoyo: true, repeat: -1, duration: 1000 });
        this.add.text(480, 270, 'MANTÉN EL SALTO\nPARA LLEGAR MÁS ALTO', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#e4e8ce', align: 'center', lineSpacing: 5 }).setOrigin(.5).setAlpha(.8).setDepth(3);
    }
    private addPickups() {
        this.pickups = this.physics.add.staticGroup();
        this.food = this.physics.add.staticGroup();
        LEVEL.collectibles.forEach(d => {
            const p = this.pickups.create(d.x, d.y, 'kibble') as Phaser.Physics.Arcade.Image;
            p.setDepth(14).setData('id', d.id).setData('baseY', d.y);
            (p.body as Phaser.Physics.Arcade.StaticBody).setSize(23, 23);
            this.bob.push(p);
        });
        LEVEL.powerUps.forEach(d => {
            const p = this.food.create(d.x, d.y, d.kind) as Phaser.Physics.Arcade.Image;
            p.setDepth(14).setData('def', d).setData('baseY', d.y);
            this.bob.push(p);
        });
        this.physics.add.overlap(this.player.sprite, this.pickups, (_a, b) => {
            if (this.mode !== 'playing')
                return;
            const p = b as Phaser.Physics.Arcade.Image;
            this.collected.add(p.getData('id'));
            this.count++;
            this.sounds.play('kibble');
            this.burst(p.x, p.y, 0xffd177, 5);
            p.disableBody(true, true);
        });
        this.physics.add.overlap(this.player.sprite, this.food, (_a, b) => {
            if (this.mode !== 'playing')
                return;
            const p = b as Phaser.Physics.Arcade.Image;
            const def = p.getData('def') as PowerUpDef;
            if (!applyPower(def.kind, this.status, this.now))
                return;
            this.collected.add(def.id);
            p.disableBody(true, true);
            this.sounds.play('power');
            this.burst(p.x, p.y, 0xe5f0bb, 9);
            this.ui.toast(def.kind === 'oil' ? 'Aceite de salmón · ¡12 s de velocidad!' : def.kind === 'meat' ? 'Un bocado · +1 corazón' : '¡Hurón pompón! · Absorbe un golpe');
        });
    }
    private bindUI() {
        this.ui.bind('start', () => this.start());
        this.ui.bind('pause', () => this.togglePause());
        this.ui.bind('resume', () => this.resume());
        this.ui.bind('restart', () => this.restart());
        this.ui.bind('replay', () => this.restart());
        this.ui.bind('sound', () => {
            this.sounds.unlock();
            this.sounds.muted = !this.sounds.muted;
            document.getElementById('sound')!.textContent = this.sounds.muted ? '♫̸' : '♪';
            document.getElementById('sound')!.setAttribute('aria-label', this.sounds.muted ? 'Activar audio' : 'Silenciar audio');
        });
    }
    start() {
        this.sounds.unlock();
        this.mode = 'playing';
        this.ui.show('menu', false);
        this.ui.show('hud', true);
        this.ui.show('controls', true);
        this.physics.resume();
        this.orientation();
    }
    private togglePause() {
        if (this.mode === 'playing')
            this.pauseForEnvironment();
        else if (this.mode === 'paused')
            this.resume();
    }
    private pauseForEnvironment() {
        if (this.mode !== 'playing')
            return;
        this.mode = 'paused';
        this.controls.clear();
        this.physics.pause();
        this.tweens.pauseAll();
        this.ui.show('pause-menu', true);
        this.ui.show('controls', false);
    }
    private resume() {
        if (matchMedia('(orientation: portrait)').matches || document.hidden)
            return;
        this.sounds.unlock();
        this.mode = 'playing';
        this.autoPaused = false;
        this.physics.resume();
        this.tweens.resumeAll();
        this.ui.show('pause-menu', false);
        this.ui.show('controls', true);
    }
    private orientation() {
        if (matchMedia('(orientation: portrait)').matches) {
            if (this.mode === 'playing') {
                this.autoPaused = true;
                this.pauseForEnvironment();
            }
        }
        else if (this.autoPaused)
            this.resume();
    }
    restart() {
        this.status = { health: 3, shield: false, oilUntil: 0 };
        this.count = 0;
        this.now = 0;
        this.hudAt = 0;
        this.checkpoint = false;
        this.secrets.clear();
        this.collected.clear();
        this.safe = { ...LEVEL.spawn };
        this.section = -1;
        this.pickups.getChildren().forEach(o => (o as Phaser.Physics.Arcade.Image).enableBody(false, 0, 0, true, true));
        this.food.getChildren().forEach(o => (o as Phaser.Physics.Arcade.Image).enableBody(false, 0, 0, true, true));
        this.panels.forEach(p => {
            this.tweens.killTweensOf(p.rect);
            p.rect.setAlpha(1);
        });
        this.checkpointSprite.clearTint();
        this.enemies.projectiles.clear(true, true);
        this.enemies.list.forEach(e => {
            this.tweens.killTweensOf(e.sprite);
            e.hp = e.def.kind === 'armored' ? 2 : 1;
            e.immuneUntil = 0;
            e.nextShot = 1700;
            e.direction = 1;
            e.sprite.enableBody(true, e.def.x, e.def.y, true, true).setScale(1).setAlpha(1).clearTint();
        });
        this.tweens.killTweensOf(this.player.sprite);
        this.player.reset(LEVEL.spawn.x, LEVEL.spawn.y);
        this.player.invulnerableUntil = 0;
        this.cameras.main.scrollX = 0;
        this.controls.clear();
        this.ui.show('win', false);
        this.ui.show('pause-menu', false);
        this.tweens.resumeAll();
        this.start();
    }
    update(_time: number, delta: number) {
        if (!this.player)
            return;
        const dt = Math.min(delta, 40);
        if (this.mode === 'dead') {
            if (document.hidden || matchMedia('(orientation: portrait)').matches) {
                this.tweens.pauseAll();
                return;
            }
            this.tweens.resumeAll();
            this.now += dt;
            if (this.now >= this.deathAt)
                this.respawn();
            return;
        }
        if (this.mode !== 'playing')
            return;
        this.now += dt;
        this.player.update(this.controls, this.now, this.status.oilUntil > this.now, () => this.sounds.play('jump'));
        this.controls.consume();
        this.player.sprite.x = Phaser.Math.Clamp(this.player.sprite.x, 18, LEVEL.width - 18);
        this.enemies.update(this.now, this.player.sprite.x);
        updateCamera(this.cameras.main, this.player.sprite.x, this.player.facing, LEVEL.width, dt);
        this.shield.setPosition(this.player.sprite.x, this.player.sprite.y).setVisible(this.status.shield).setScale(1 + Math.sin(this.now / 180) * .06);
        if (this.status.shield)
            this.player.sprite.setTint(0xf5ffd2);
        else
            this.player.sprite.clearTint();
        this.bob.forEach((p, i) => {
            if (p.active)
                p.y = p.getData('baseY') + Math.sin(this.now / 250 + i) * 3;
        });
        const p = this.player.sprite;
        const b = this.player.body;
        if (b.blocked.down && this.now > this.player.hurtUntil && Math.abs(b.velocity.x) < 240) {
            const floor = LEVEL.solids.find(s => !s.oneWay && Math.abs(s.y - b.bottom) < 5 && p.x > s.x + 35 && p.x < s.x + s.width - 35);
            if (floor)
                this.safe = { x: p.x, y: p.y };
        }
        if (p.y > 600) {
            this.damage(p.x, true);
            if (this.mode === 'playing') {
                this.player.reset(this.safe.x, this.safe.y - 4);
                this.player.invulnerableUntil = this.now + B.invulnerability;
            }
            return;
        }
        if (!this.checkpoint && Math.abs(p.x - LEVEL.checkpoint.x) < 45) {
            this.checkpoint = true;
            this.safe = { x: LEVEL.checkpoint.x, y: 385 };
            this.checkpointSprite.setTint(0xffe48b);
            this.sounds.play('checkpoint');
            this.burst(p.x, p.y, 0xffe48b, 12);
            this.ui.toast('Calcetín de descanso · Punto guardado');
        }
        LEVEL.secrets.forEach(s => {
            if (!this.secrets.has(s.id) && p.x > s.x && p.x < s.x + s.width && p.y > s.y && p.y < s.y + s.height) {
                this.secrets.add(s.id);
                this.tweens.add({ targets: this.panels.find(v => v.id === s.id)!.rect, alpha: .13, duration: 400 });
                this.sounds.play('secret');
                this.ui.toast(s.label);
            }
        });
        let nextSection = 0;
        LEVEL.sections.forEach((s, i) => {
            if (p.x >= s.x)
                nextSection = i;
        });
        if (nextSection !== this.section) {
            this.section = nextSection;
            document.getElementById('location')!.textContent = LEVEL.sections[this.section].name;
            if (this.section > 0)
                this.ui.toast(LEVEL.sections[this.section].name);
        }
        if (p.x > LEVEL.goal.x - 35 && p.y > 250)
            this.victory();
        if (this.now > this.hudAt) {
            this.ui.hud(this.status, this.count, this.now);
            this.hudAt = this.now + 100;
        }
    }
    private touchEnemy(enemy: Enemy) {
        if (this.mode !== 'playing' || !enemy.sprite.active)
            return;
        const body = this.player.body;
        const eb = enemy.sprite.body as Phaser.Physics.Arcade.Body;
        if (canStomp(body.velocity.y, body.prev.y + body.height, eb.top)) {
            if (this.enemies.stomp(enemy, this.now)) {
                body.setVelocityY(-B.bounce);
                this.player.lastGround = -9999;
                this.sounds.play('stomp');
                this.burst(enemy.sprite.x, eb.top, 0xffd493, 7);
            }
        }
        else
            this.damage(enemy.sprite.x);
    }
    damage(sourceX: number, fall = false) {
        if (this.mode !== 'playing' || (!fall && this.now < this.player.invulnerableUntil))
            return;
        if (this.status.shield && !fall) {
            this.status.shield = false;
            this.sounds.play('power');
            this.burst(this.player.sprite.x, this.player.sprite.y, 0xe1ffb3, 14);
        }
        else {
            this.status.health--;
            this.sounds.play('hurt');
        }
        this.player.invulnerableUntil = this.now + B.invulnerability;
        this.player.hurtUntil = this.now + 240;
        this.player.sprite.setAccelerationX(0).setVelocity(sourceX < this.player.sprite.x ? 150 : -150, -220);
        this.ui.hud(this.status, this.count, this.now);
        if (this.status.health <= 0)
            this.die();
    }
    private die() {
        this.mode = 'dead';
        this.deathAt = this.now + 750;
        this.controls.clear();
        this.player.sprite.play('ferret-dead');
        this.player.body.enable = false;
        this.sounds.play('dead');
        this.tweens.add({ targets: this.player.sprite, y: this.player.sprite.y - 35, angle: 15, alpha: 0, duration: 650 });
        this.physics.pause();
        this.shield.setVisible(false);
    }
    private respawn() {
        const spawn = this.checkpoint ? { x: LEVEL.checkpoint.x, y: 385 } : LEVEL.spawn;
        this.status.health = 3;
        this.status.shield = false;
        this.status.oilUntil = 0;
        this.player.reset(spawn.x, spawn.y);
        this.player.invulnerableUntil = this.now + B.invulnerability;
        this.safe = { ...spawn };
        this.enemies.projectiles.clear(true, true);
        this.mode = 'playing';
        this.physics.resume();
        this.ui.hud(this.status, this.count, this.now);
        this.cameras.main.scrollX = Phaser.Math.Clamp(spawn.x - 440, 0, LEVEL.width - 960);
        this.ui.toast(this.checkpoint ? 'De vuelta al calcetín. ¡Seguimos!' : 'Otra oportunidad. ¡Tú puedes!');
    }
    private victory() {
        this.mode = 'won';
        this.player.sprite.setVelocity(0).setAcceleration(0).play('ferret-idle');
        this.physics.pause();
        this.controls.clear();
        this.sounds.play('win');
        saveRun(this.count);
        this.ui.results(this.count, this.secrets.size, LEVEL.secrets.length, this.now / 1000);
        this.ui.show('win', true);
        this.ui.show('controls', false);
    }
    private burst(x: number, y: number, color: number, n: number) {
        for (let i = 0; i < n && this.particleCount < 80; i++) {
            this.particleCount++;
            const p = this.add.rectangle(x, y, 4, 4, color).setDepth(30);
            this.tweens.add({ targets: p, x: x + Phaser.Math.Between(-28, 28), y: y + Phaser.Math.Between(-35, 5), alpha: 0, duration: 400, onComplete: () => {
                    p.destroy();
                    this.particleCount--;
                } });
        }
    }
    snapshot() {
        return { mode: this.mode, time: this.now, player: { x: this.player.sprite.x, y: this.player.sprite.y, vx: this.player.body.velocity.x, vy: this.player.body.velocity.y, grounded: this.player.body.blocked.down, feet: this.player.body.bottom }, ...this.status, invulnerableUntil: this.player.invulnerableUntil, kibble: this.count, checkpoint: this.checkpoint, secrets: [...this.secrets], camera: this.cameras.main.scrollX, enemies: this.enemies.list.map(e => ({ id: e.def.id, kind: e.def.kind, x: e.sprite.x, y: e.sprite.y, hp: e.hp, active: e.sprite.active })), level: LEVEL };
    }
}
