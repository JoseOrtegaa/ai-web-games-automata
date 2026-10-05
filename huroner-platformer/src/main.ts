import Phaser from 'phaser';
import { GameScene } from './scene';
import './style.css';
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
new Phaser.Game({ type: Phaser.CANVAS, parent: 'game', width: 960, height: 540, pixelArt: true, roundPixels: true, antialias: false, backgroundColor: '#34494b', scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 1200 }, fixedStep: true, fps: 60 } }, scene: [GameScene], audio: { noAudio: true } });
