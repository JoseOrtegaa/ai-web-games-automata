import Phaser from 'phaser';
import { createArt } from './art';
import { createEnvironment, createSurfaceArt } from './environment';
import { LEVELS, CHAPTERS, WORLDS } from './level-data';
import { SECRET_LEVELS, SECRET_CHAPTERS } from './secret-levels';
import { FROZEN_SECRETS } from './frozen-levels';
import { readProgress, isUnlocked, completeLevel } from './progress';
import { B } from './balance';
import { Player } from './player';
import { Input } from './input';
import { Audio } from './audio';
import { UI } from './ui';
import { Enemies, type Enemy } from './enemies';
import { ENEMY_PROFILES } from './enemy-catalog';
import { canStomp, canLandOneWay, hasHeadroom } from './collision';
import { applyPower, type Status } from './powerups';
import { saveRun } from './collectibles';
import { COSMETICS, readWardrobe, selectCosmetic, balance } from './cosmetics';
import { RELICS, readRelics, discoverRelic, CHEST_CROQUETTES } from './rewards';
import { updateCamera } from './camera';
import type { PowerUpDef, SolidDef } from './types';
type Mode = 'menu' | 'playing' | 'paused' | 'dead' | 'won';
interface AreaState {
    collected: string[]; secrets: string[]; checkpoint: boolean;
    enemies: { hp:number; x:number; y:number; direction:number }[];
}
interface Journey {
    status: Status; now: number; count: number;
    main?: AreaState; secret?: AreaState;
}
export class GameScene extends Phaser.Scene {
    levelIndex = 0;
    inSecret = false;
    private journey?: Journey;
    private tunnelReady = true;
    level = LEVELS[0];
    private launchPlaying = false;
    private listenersBound = false;
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
    safe = { ...this.level.spawn };
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
    private hat?: Phaser.GameObjects.Image;
    private boss?: Phaser.Physics.Arcade.Sprite;
    private bossHP = 0;
    private bossNext = 0;
    private bossChargeUntil = 0;
    private bossImmune = 0;
    private bossWarning?: Phaser.GameObjects.Text;
    private wave?: Phaser.GameObjects.Rectangle;
    private waveStart = 0;
    constructor() {
        super('FerretJump');
    }
    init(data: { levelIndex?: number; play?: boolean; secret?: boolean; journey?: Journey } = {}) {
        this.levelIndex = data.levelIndex ?? 0;
        this.inSecret = data.secret ?? false;
        this.journey = data.journey;
        this.tunnelReady = !data.journey;
        this.level = this.inSecret ? (this.levelIndex<3?SECRET_LEVELS[this.levelIndex]:FROZEN_SECRETS[this.levelIndex-3]) : LEVELS[this.levelIndex];
        this.launchPlaying = data.play ?? false;
        this.mode = 'menu';
        this.status = { health:3, shield:false, oilUntil:0 };
        this.now = 0; this.count = 0; this.deathAt = 0; this.checkpoint = false;
        this.secrets.clear(); this.collected.clear(); this.panels = []; this.bob = [];
        this.section = -1; this.hudAt = 0; this.autoPaused = false; this.particleCount = 0;
        this.hat=undefined;this.boss=undefined;this.bossHP=0;this.wave=undefined;
        this.safe = { ...this.level.spawn };
    }
    create() {
        this.ui.clearToast();
        createArt(this);
        createSurfaceArt(this);
        this.drawWorld();
        this.controls ??= new Input();
        this.player = new Player(this, this.level.spawn.x, this.level.spawn.y, (left, top, right, bottom) =>
            hasHeadroom(this.level.solids, left, top, right, bottom));
        this.player.setCoat(readWardrobe().coat);
        this.hat=this.add.image(0,0,'hat-beret').setDepth(21).setOrigin(.5,1).setVisible(false);
        this.setupBoss();
        this.enemies = new Enemies(this, this.level.enemies);
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
        this.restoreJourney();
        this.bindUI();
        this.physics.pause();
        this.ui.hud(this.status, this.count, this.now);
        this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
        this.input.keyboard?.on('keydown-P', () => this.togglePause());
        if (!this.listenersBound) {
            this.listenersBound = true;
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) this.pauseForEnvironment();
            });
            window.addEventListener('blur', () => this.pauseForEnvironment());
            window.addEventListener('resize', () => this.orientation());
        }
        this.orientation();
        if (this.launchPlaying) this.start();
        if (new URLSearchParams(location.search).has('qa')) {
            (window as unknown as Record<string, unknown>).__ferretQA = { scene: this, state: () => this.snapshot(), teleport: (x: number, y: number) => {
                    this.player.reset(x, y);
                    this.cameras.main.scrollX = Phaser.Math.Clamp(x - 440, 0, this.level.width - 960);
                }, start: () => this.start(), damage: () => this.damage(this.player.sprite.x - 20), restart: () => this.restart() };
        }
    }
    private drawWorld() {
        createEnvironment(this, this.inSecret ? (this.levelIndex<3?SECRET_CHAPTERS[this.levelIndex].environment:['frozen-crystal','frozen-lake','frozen-observatory'][this.levelIndex-3] as 'frozen-crystal'|'frozen-lake'|'frozen-observatory') : CHAPTERS[this.levelIndex].environment, this.level.width);
        this.level.scenery.forEach(d => this.add.image(d.x, d.y, d.kind).setOrigin(.5, 1).setScale(d.scale ?? 1).setFlipX(d.flip ?? false).setDepth(-10).setAlpha(.88));
        this.terrain = this.physics.add.staticGroup();
        this.level.solids.forEach(def => {
            this.add.tileSprite(def.x, def.y, def.width, def.height, `surface-${def.surface}`).setOrigin(0).setDepth(5);
            this.add.rectangle(def.x, def.y, def.width, def.surface === 'grass' ? 7 : 3, ({ grass: 0x80955e, rock: 0xa9afac, stone: 0xb4afa2, metal: 0x93a5aa, concrete: 0xaaa9a2, bark: 0xb09a6e, ice:0xedffff, glass:0xf4fffa, snow:0xfff9e9 } as Partial<Record<SolidDef['surface'], number>>)[def.surface] ?? 0xd6bb8a, .85).setOrigin(0).setDepth(6);
            const r = this.add.rectangle(def.x + def.width / 2, def.y + def.height / 2, def.width, def.height, 0, 0);
            this.terrain.add(r);
            r.setData('solid', def);
        });
        this.level.secrets.forEach(s => {
            const panel = this.add.container(s.x, s.y).setDepth(25);
            const tex = this.add.tileSprite(0, 0, s.width, s.height, `surface-${s.surface}`).setOrigin(0);
            panel.add(tex);
            for (let x = 18; x < s.width; x += 38)
                panel.add(this.add.rectangle(x, 10, 4, s.height - 20, 0x172e3d, .4).setOrigin(0));
            panel.add(this.add.rectangle(s.width - 8, s.height - 20, 3, 13, 0xf5d9aa, .65));
            this.panels.push({ id: s.id, rect: panel });
        });
        const tunnel = this.level.tunnel;
        if (tunnel) {
            this.add.rectangle(tunnel.x,tunnel.y+25,78,50,0x3c5758).setStrokeStyle(3,0x92a18c).setDepth(7);
            this.add.rectangle(tunnel.x,tunnel.y+5,104,14,0xa99a69).setStrokeStyle(2,0xd8c38a).setDepth(8);
            this.add.ellipse(tunnel.x,tunnel.y+2,70,9,0x14242c).setDepth(9);
            this.add.text(tunnel.x,tunnel.y-52,'↓ AGÁCHATE', {fontFamily:'Trebuchet MS',fontSize:'12px',color:'#fff3c0'}).setOrigin(.5).setDepth(11);
        }
        this.checkpointSprite = this.add.image(this.level.checkpoint.x, 430, 'checkpoint').setOrigin(.5, 1).setDepth(10).setVisible(!this.inSecret);
        this.add.image(this.level.goal.x, 430, 'goal').setOrigin(.5, 1).setDepth(10);
        const label = this.add.text(this.level.goal.x, 238, this.inSecret ? 'VOLVER AL CASTILLO →' : this.level.boss ? 'DERROTA AL JEFE →' : this.levelIndex===5 ? 'FIN DEL MUNDO 2' : 'AL SIGUIENTE NIVEL →', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#fff3c0', letterSpacing: 3 }).setOrigin(.5).setDepth(11);
        this.tweens.add({ targets: label, alpha: .6, yoyo: true, repeat: -1, duration: 1000 });
        if (!this.inSecret) this.add.text(480, 270, 'MANTÉN EL SALTO\nPARA LLEGAR MÁS ALTO', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#e4e8ce', align: 'center', lineSpacing: 5 }).setOrigin(.5).setAlpha(.8).setDepth(3);
    }
    private setupBoss() {
        const def=this.level.boss;
        if(!def)return;
        this.bossHP=3;this.bossNext=1800;this.bossChargeUntil=0;this.bossImmune=0;
        this.boss=this.physics.add.sprite(def.x,390,this.levelIndex===2?'boss-oak':'boss-ice').setDepth(16);
        this.boss.setSize(48,45).setImmovable(true);
        (this.boss.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        this.bossWarning=this.add.text(def.x,320,`${def.name}  ♥ ♥ ♥`,{fontFamily:'Trebuchet MS',fontSize:'15px',color:'#f4f5d3',backgroundColor:'#244252'}).setOrigin(.5).setDepth(22);
        this.physics.add.overlap(this.player.sprite,this.boss,()=>{
            if(this.mode!=='playing'||!this.boss?.active)return;
            const b=this.player.body;
            if(b.velocity.y>60 && b.prev.y+b.height<this.boss.y-15 && this.now>this.bossImmune){
                this.bossHP--;this.bossImmune=this.now+850;b.setVelocityY(-B.bounce);
                this.sounds.play('stomp');this.burst(this.boss.x,this.boss.y-20,def.color,16);
                if(this.bossHP<=0){this.boss.disableBody(true,true);this.bossWarning?.setText(`¡${def.name} derrotado!`);this.wave?.destroy();this.wave=undefined;this.ui.toast('¡Jefe derrotado! La puerta está abierta');}
                else {this.bossNext=this.now+1800;this.bossWarning?.setText(`${def.name}  ${'♥ '.repeat(this.bossHP)}`);}
            }else this.damage(this.boss.x);
        });
    }
    private updateBoss(dt:number) {
        const boss=this.boss,def=this.level.boss;
        if(!boss?.active||!def)return;
        const near=Math.abs(this.player.sprite.x-boss.x)<550;
        if(!near) {this.bossNext=Math.max(this.bossNext,this.now+900);return;}
        if(this.now>=this.bossNext && !this.bossChargeUntil){
            this.bossChargeUntil=this.now+850;
            boss.setTint(0xffd278);
            this.bossWarning?.setText(`${def.name} · ¡PREPARA EL SALTO!`);
        }
        if(this.bossChargeUntil && this.now>=this.bossChargeUntil){
            this.bossChargeUntil=0;boss.clearTint();this.bossNext=this.now+2900;
            this.bossWarning?.setText(`${def.name}  ${'♥ '.repeat(this.bossHP)}`);
            const dir=this.player.sprite.x<boss.x?-1:1;
            this.wave?.destroy();
            this.wave=this.add.rectangle(boss.x+dir*42,418,36,18,def.color).setStrokeStyle(2,0xffffff).setDepth(18);
            this.wave.setData('dir',dir);this.waveStart=this.wave.x;
        }
        if(this.wave){
            this.wave.x+=this.wave.getData('dir')*dt*.22;
            if(Math.abs(this.wave.x-this.waveStart)>310){this.wave.destroy();this.wave=undefined;}
            else if(Math.abs(this.wave.x-this.player.sprite.x)<27 && Math.abs(this.player.sprite.y-418)<42){this.damage(this.wave.x);this.wave.destroy();this.wave=undefined;}
        }
        // Short deliberate patrol between attacks; the arena stays readable.
        if(!this.bossChargeUntil && this.now<this.bossNext-1400) {
            const x=Phaser.Math.Clamp(boss.x+(this.player.sprite.x<boss.x?-1:1)*dt*.045,def.minX,def.maxX);
            boss.setPosition(x,boss.y);
            (boss.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
        }
        this.bossWarning?.setPosition(boss.x,320);
    }
    private restoreJourney() {
        const journey = this.journey;
        if (!journey) return;
        this.status = { ...journey.status }; this.now = journey.now; this.count = journey.count;
        const area = this.inSecret ? journey.secret : journey.main;
        if (area) {
            this.collected = new Set(area.collected); this.secrets = new Set(area.secrets);
            this.checkpoint = area.checkpoint;
            for (const obj of [...this.pickups.getChildren(), ...this.food.getChildren()]) {
                const item = obj as Phaser.Physics.Arcade.Image;
                if (this.collected.has(item.getData('id') ?? item.getData('def').id)) {
                    if (item.getData('reward') === 'chest') item.setTexture('reward-chest-open').disableBody(true,false);
                    else item.disableBody(true,true);
                }
            }
            this.panels.forEach(p => { if (this.secrets.has(p.id)) p.rect.setAlpha(.13); });
            this.enemies.list.forEach((e,i) => {
                const saved = area.enemies[i];
                e.hp = saved.hp; e.direction = saved.direction; e.nextShot = this.now + 1700;
                e.sprite.setPosition(saved.x,saved.y);
                if (e.hp <= 0) e.sprite.disableBody(true,true);
            });
            if (this.checkpoint) this.checkpointSprite.setTint(0xffe48b);
        }
        const tunnel = LEVELS[this.levelIndex].tunnel!;
        const spawn = this.inSecret ? this.level.spawn : {x:tunnel.x,y:tunnel.y-30};
        this.player.reset(spawn.x,spawn.y);
        this.player.invulnerableUntil = this.now + 1000;
        this.safe = {...spawn};
        this.cameras.main.scrollX = Phaser.Math.Clamp(spawn.x-440,0,this.level.width-960);
    }
    private travel(secret: boolean) {
        const area: AreaState = {
            collected:[...this.collected], secrets:[...this.secrets], checkpoint:this.checkpoint,
            enemies:this.enemies.list.map(e => ({hp:e.hp,x:e.sprite.x,y:e.sprite.y,direction:e.direction})),
        };
        const journey: Journey = { ...this.journey, status:{...this.status}, now:this.now, count:this.count,
            [this.inSecret ? 'secret' : 'main']:area };
        this.controls.clear();
        this.sounds.play('secret');
        this.mode = 'paused';
        this.physics.pause();
        this.scene.restart({levelIndex:this.levelIndex,play:true,secret,journey});
    }
    private addPickups() {
        this.pickups = this.physics.add.staticGroup();
        this.food = this.physics.add.staticGroup();
        this.level.collectibles.forEach(d => {
            const p = this.pickups.create(d.x, d.y, 'kibble') as Phaser.Physics.Arcade.Image;
            p.setDepth(14).setData('id', d.id).setData('baseY', d.y);
            (p.body as Phaser.Physics.Arcade.StaticBody).setSize(23, 23);
            this.bob.push(p);
        });
        this.level.powerUps.forEach(d => {
            const p = this.food.create(d.x, d.y, d.kind) as Phaser.Physics.Arcade.Image;
            p.setDepth(14).setData('def', d).setData('baseY', d.y);
            this.bob.push(p);
        });
        const rewards=this.level.rewards;
        if(rewards){
            const chest=this.pickups.create(rewards.chest.x,rewards.chest.y,'reward-chest') as Phaser.Physics.Arcade.Image;
            chest.setDepth(14).setData('id',rewards.chest.id).setData('reward','chest');
            this.add.text(chest.x,chest.y-46,`COFRE · +${CHEST_CROQUETTES}`,{fontFamily:'Trebuchet MS',fontSize:'11px',color:'#ffe3a0'}).setOrigin(.5).setDepth(14);
            if(!readRelics().includes(rewards.relic.id)){
                const relic=RELICS.find(r=>r.id===rewards.relic.id)!;
                const item=this.pickups.create(rewards.relic.x,rewards.relic.y,relic.texture) as Phaser.Physics.Arcade.Image;
                item.setDepth(14).setData('id',relic.id).setData('reward','relic').setData('baseY',rewards.relic.y);
                this.bob.push(item);
            }
        }
        this.physics.add.overlap(this.player.sprite, this.pickups, (_a, b) => {
            if (this.mode !== 'playing')
                return;
            const p = b as Phaser.Physics.Arcade.Image;
            const id=p.getData('id') as string;
            if(this.collected.has(id))return;
            this.collected.add(id);
            const reward=p.getData('reward');
            if(reward==='chest'){
                this.count+=CHEST_CROQUETTES;
                p.setTexture('reward-chest-open').disableBody(true,false);
                this.sounds.play('secret');this.burst(p.x,p.y,0xffd177,14);
                this.ui.toast(`¡Cofre abierto! · +${CHEST_CROQUETTES} croquetas`);
                this.ui.hud(this.status,this.count,this.now);
                return;
            }
            if(reward==='relic'){
                discoverRelic(id);
                p.disableBody(true,true);
                this.sounds.play('secret');this.burst(p.x,p.y,0xd7efb2,14);
                this.ui.toast(`¡${RELICS.find(r=>r.id===id)!.name}! · Guardada en tu colección`);
                return;
            }
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
        this.ui.bind('start', () => this.openMap());
        this.ui.bind('map-back', () => { this.ui.show('world-map', false); this.ui.show('menu', true); });
        this.ui.bind('pause-map', () => this.openMap());
        this.ui.bind('win-map', () => this.openMap());
        this.ui.bind('next-level', () => this.levelIndex < CHAPTERS.length-1 ? this.selectLevel(this.levelIndex+1) : this.openMap());
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
    private openMap() {
        this.mode = 'menu';
        this.controls.clear(); this.physics.pause(); this.tweens.pauseAll();
        for (const id of ['menu','pause-menu','win','controls','hud']) this.ui.show(id, false);
        const progress = readProgress();
        const relics = readRelics();
        const levels = document.getElementById('level-list')!;
        levels.replaceChildren();
        CHAPTERS.forEach((chapter, i) => {
            if(i===0||i===3){const heading=document.createElement('h3');heading.className='world-heading';heading.textContent=`Mundo ${i===0?1:2} · ${WORLDS[i===0?0:1].name}`;levels.append(heading);}
            const unlocked = isUnlocked(i, progress);
            const button = document.createElement('button');
            button.className = 'level-node'; button.dataset.level = String(i);
            button.disabled = !unlocked;
            button.innerHTML = unlocked
                ? `<span class="level-number">${chapter.id}</span><strong>${chapter.name}</strong><small>${chapter.summary}</small><em>${progress.completed.includes(chapter.id) ? 'Completado · Volver a jugar' : 'Disponible · Explorar →'}</em>`
                : `<span class="level-number">?</span><strong>${chapter.id} · Sin descubrir</strong><small>Completa el nivel ${CHAPTERS[i-1].id} para desbloquearlo.</small>`;
            if(unlocked){
                const target=i<3?45:35;
                const objectives=document.createElement('span');objectives.className='level-objectives';
                objectives.textContent=`${progress.completed.includes(chapter.id)?'✓':'○'} Completar  ·  ${relics.includes(RELICS[i].id)?'✓':'○'} Reliquia  ·  ${(progress.best[chapter.id]??0)>=target?'✓':'○'} ${target} croquetas`;
                button.append(objectives);
            }
            button.onclick = () => this.selectLevel(i);
            levels.append(button);
        });
        document.getElementById('relic-title')!.textContent=`Tu colección · ${relics.length}/${RELICS.length} reliquias`;
        const collection=document.getElementById('relic-list')!;collection.replaceChildren();
        RELICS.forEach((relic,i)=>{
            const found=relics.includes(relic.id),card=document.createElement('div');
            card.className=`relic-card ${found?'found':''}`;
            if(found){const img=document.createElement('img');img.src=(this.textures.get(relic.texture).getSourceImage() as HTMLCanvasElement).toDataURL();img.alt='';card.append(img);}
            else {const mark=document.createElement('span');mark.className='relic-mark';mark.textContent='?';card.append(mark);}
            const text=document.createElement('div');const title=document.createElement('strong');title.textContent=found?relic.name:'Reliquia por descubrir';
            const detail=document.createElement('small');detail.textContent=`${CHAPTERS[i].id} · ${found?'Encontrada':relic.hint}`;text.append(title,detail);card.append(text);collection.append(card);
        });
        document.getElementById('map-title')!.textContent='Dos castillos por explorar';
        document.getElementById('world-summary')!.textContent = `${WORLDS[0].summary} ${WORLDS[1].summary}`;
        document.getElementById('future-worlds')!.innerHTML = WORLDS.slice(2).map((_,i) => `<div class="future-world"><b>?</b><span>Mundo ${i+3}</span><small>Próximamente</small></div>`).join('');
        this.renderShop();
        this.ui.show('world-map', true);
        (levels.querySelector('button:not(:disabled)') as HTMLButtonElement)?.focus();
    }
    private renderShop() {
        document.getElementById('shop-balance')!.textContent=`◆ ${balance()} croquetas disponibles`;
        const list=document.getElementById('shop-list')!;list.replaceChildren();
        const wardrobe=readWardrobe();
        COSMETICS.forEach(item=>{
            const owned=wardrobe.owned.includes(item.id),selected=wardrobe[item.type]===item.id;
            const button=document.createElement('button');button.className='shop-item';button.dataset.cosmetic=item.id;
            button.disabled=selected||(!owned&&balance()<item.price);
            const name=document.createElement('strong');name.textContent=item.name;
            const action=document.createElement('span');action.textContent=selected?'Equipado':owned?'Equipar':`◆ ${item.price}`;
            button.append(name,action);
            button.onclick=()=>{if(selectCosmetic(item.id))this.renderShop();};list.append(button);
        });
    }
    private selectLevel(index: number) {
        if (!isUnlocked(index)) return;
        this.controls.clear();
        for (const id of ['world-map','menu','pause-menu','win','controls','hud']) this.ui.show(id, false);
        this.scene.restart({ levelIndex:index, play:true });
    }
    start() {
        this.sounds.unlock();
        this.mode = 'playing';
        this.ui.show('world-map', false);
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
        if (this.inSecret) {
            this.controls.clear(); this.ui.show('pause-menu',false);
            this.scene.restart({levelIndex:this.levelIndex,play:true});
            return;
        }
        this.journey = undefined; this.tunnelReady = true;
        this.status = { health: 3, shield: false, oilUntil: 0 };
        this.count = 0;
        this.now = 0;
        this.hudAt = 0;
        this.checkpoint = false;
        this.secrets.clear();
        this.collected.clear();
        this.safe = { ...this.level.spawn };
        this.section = -1;
        this.pickups.getChildren().forEach(o => (o as Phaser.Physics.Arcade.Image).enableBody(false, 0, 0, true, true));
        this.food.getChildren().forEach(o => (o as Phaser.Physics.Arcade.Image).enableBody(false, 0, 0, true, true));
        this.panels.forEach(p => {
            this.tweens.killTweensOf(p.rect);
            p.rect.setAlpha(1);
        });
        this.checkpointSprite.clearTint();
        this.enemies.projectiles.clear(true, true);
        this.wave?.destroy();this.wave=undefined;
        if(this.boss){this.boss.enableBody(true,this.level.boss!.x,390,true,true).clearTint();(this.boss.body as Phaser.Physics.Arcade.Body).updateFromGameObject();this.bossHP=3;this.bossNext=1800;this.bossChargeUntil=0;this.bossWarning?.setText(`${this.level.boss!.name}  ♥ ♥ ♥`);}
        this.enemies.list.forEach(e => {
            this.tweens.killTweensOf(e.sprite);
            e.hp = ENEMY_PROFILES[e.def.kind].hp;
            e.immuneUntil = 0;
            e.nextShot = 1700;
            e.direction = 1;
            e.sprite.enableBody(true, e.def.x, e.def.y, true, true).setScale(1).setAlpha(1).clearTint();
        });
        this.tweens.killTweensOf(this.player.sprite);
        this.player.reset(this.level.spawn.x, this.level.spawn.y);
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
        const feet=this.player.body.bottom;
        const icy=this.player.body.blocked.down && this.level.solids.some(s=>(s.surface==='ice'||s.surface==='glass')&&Math.abs(s.y-feet)<6&&this.player.sprite.x>s.x&&this.player.sprite.x<s.x+s.width);
        this.player.update(this.controls, this.now, this.status.oilUntil > this.now, () => this.sounds.play('jump'),icy);
        this.controls.consume();
        this.player.sprite.x = Phaser.Math.Clamp(this.player.sprite.x, 18, this.level.width - 18);
        this.enemies.update(this.now, this.player.sprite.x, this.player.sprite.y);
        this.updateBoss(dt);
        updateCamera(this.cameras.main, this.player.sprite.x, this.player.facing, this.level.width, dt);
        this.shield.setPosition(this.player.sprite.x, this.player.sprite.y).setVisible(this.status.shield).setScale(1 + Math.sin(this.now / 180) * .06);
        const wardrobe=readWardrobe();
        this.hat?.setVisible(wardrobe.hat!=='none'&&!this.player.crouched)
            .setTexture(wardrobe.hat==='crown'?'hat-crown':'hat-beret')
            .setDisplaySize(wardrobe.hat==='crown'?28:30,wardrobe.hat==='crown'?17:15)
            .setPosition(this.player.sprite.x+(this.player.facing<0?-6:6),this.player.sprite.y-21+(this.player.sprite.frame.name==='1'?2:0))
            .setFlipX(this.player.facing<0).setAlpha(this.player.sprite.alpha);
        if (this.status.shield)
            this.player.sprite.setTint(0xf5ffd2);
        else this.player.sprite.clearTint();
        this.bob.forEach((p, i) => {
            if (p.active)
                p.y = p.getData('baseY') + Math.sin(this.now / 250 + i) * 3;
        });
        const p = this.player.sprite;
        const b = this.player.body;
        if (!this.controls.crouch) this.tunnelReady = true;
        const tunnel = this.level.tunnel;
        if (tunnel && this.tunnelReady && this.player.crouched && b.blocked.down
            && Math.abs(p.x-tunnel.x)<30 && Math.abs(b.bottom-tunnel.y)<5) {
            this.travel(true);
            return;
        }
        if (b.blocked.down && this.now > this.player.hurtUntil && Math.abs(b.velocity.x) < 240) {
            const floor = this.level.solids.find(s => !s.oneWay && Math.abs(s.y - b.bottom) < 5 && p.x > s.x + 35 && p.x < s.x + s.width - 35);
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
        if (!this.inSecret && !this.checkpoint && Math.abs(p.x - this.level.checkpoint.x) < 45) {
            this.checkpoint = true;
            this.safe = { x: this.level.checkpoint.x, y: 385 };
            this.checkpointSprite.setTint(0xffe48b);
            this.sounds.play('checkpoint');
            this.burst(p.x, p.y, 0xffe48b, 12);
            this.ui.toast('Calcetín de descanso · Punto guardado');
        }
        this.level.secrets.forEach(s => {
            if (!this.secrets.has(s.id) && p.x > s.x && p.x < s.x + s.width && p.y > s.y && p.y < s.y + s.height) {
                this.secrets.add(s.id);
                this.tweens.add({ targets: this.panels.find(v => v.id === s.id)!.rect, alpha: .13, duration: 400 });
                this.sounds.play('secret');
                this.ui.toast(s.label);
            }
        });
        let nextSection = 0;
        this.level.sections.forEach((s, i) => {
            if (p.x >= s.x)
                nextSection = i;
        });
        if (nextSection !== this.section) {
            this.section = nextSection;
            document.getElementById('location')!.textContent = this.level.sections[this.section].name;
            if (this.section > 0)
                this.ui.toast(this.level.sections[this.section].name);
        }
        if (p.x > this.level.goal.x - 35 && p.y > 250) {
            if (this.inSecret) this.travel(false);
            else if(this.boss?.active){this.ui.toast(`Derrota a ${this.level.boss!.name} para abrir la puerta`);this.player.sprite.x=this.level.goal.x-50;}
            else this.victory();
            return;
        }
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
        this.player.sprite.play(this.player.animation('dead'));
        this.hat?.setVisible(false);
        this.player.body.enable = false;
        this.sounds.play('dead');
        this.tweens.add({ targets: this.player.sprite, y: this.player.sprite.y - 35, angle: 15, alpha: 0, duration: 650 });
        this.physics.pause();
        this.shield.setVisible(false);
    }
    private respawn() {
        const spawn = this.checkpoint ? { x: this.level.checkpoint.x, y: 385 } : this.level.spawn;
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
        this.cameras.main.scrollX = Phaser.Math.Clamp(spawn.x - 440, 0, this.level.width - 960);
        this.ui.toast(this.checkpoint ? 'De vuelta al calcetín. ¡Seguimos!' : 'Otra oportunidad. ¡Tú puedes!');
    }
    private victory() {
        this.mode = 'won';
        this.player.sprite.setVelocity(0).setAcceleration(0).play(this.player.animation('idle'));
        this.physics.pause();
        this.controls.clear();
        this.sounds.play('win');
        saveRun(this.count);
        completeLevel(this.levelIndex,this.count);
        document.getElementById('win-title')!.textContent = this.levelIndex === 2 ? '¡Castillo medieval completado!' : this.levelIndex===5 ? '¡Fortaleza congelada completada!' : `¡${CHAPTERS[this.levelIndex].id} completado!`;
        document.getElementById('win-description')!.textContent = this.levelIndex===5 ? 'La ventisca ha cesado. Repite niveles para reunir reliquias y croquetas.' : `La puerta abre el camino a ${CHAPTERS[this.levelIndex+1].name.toLowerCase()}.`;
        document.getElementById('next-level')!.textContent = this.levelIndex===5 ? 'Volver al mapa →' : `Jugar ${CHAPTERS[this.levelIndex+1].id} →`;
        this.ui.results(this.count, this.secrets.size, this.level.secrets.length, this.now / 1000);
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
        return { inSecret: this.inSecret, mode: this.mode, time: this.now, player: { x: this.player.sprite.x, y: this.player.sprite.y, vx: this.player.body.velocity.x, vy: this.player.body.velocity.y, grounded: this.player.body.blocked.down, feet: this.player.body.bottom, bodyHeight: this.player.body.height, crouched: this.player.crouched }, ...this.status, invulnerableUntil: this.player.invulnerableUntil, kibble: this.count, checkpoint: this.checkpoint, secrets: [...this.secrets], camera: this.cameras.main.scrollX, boss:this.boss?{hp:this.bossHP,x:this.boss.x,active:this.boss.active,warning:this.bossChargeUntil>0}:null, enemies: this.enemies.list.map(e => ({ id: e.def.id, kind: e.def.kind, x: e.sprite.x, y: e.sprite.y, hp: e.hp, active: e.sprite.active })), levelIndex: this.levelIndex, level: this.level };
    }
}
