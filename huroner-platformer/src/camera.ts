import Phaser from 'phaser';
export function updateCamera(camera: Phaser.Cameras.Scene2D.Camera, x: number, facing: number, width: number, dt: number) {
    const target = Phaser.Math.Clamp(x - 440 + facing * 55, 0, width - 960);
    camera.scrollX = Phaser.Math.Linear(camera.scrollX, target, 1 - Math.exp(-dt / 180));
    camera.scrollY = 0;
}
