import Phaser from 'phaser';

/** Decoration follows the existing landing surface; it never adds collision bodies. */
export function drawTunnel(scene: Phaser.Scene, x: number, y: number, chapter: number) {
    const g = scene.add.graphics({ x, y }).setDepth(8);
    const rect = (px: number, py: number, w: number, h: number, color: number, alpha = 1) => {
        g.fillStyle(color, alpha).fillRect(px, py, w, h);
    };
    const ellipse = (px: number, py: number, w: number, h: number, color: number, alpha = 1) => {
        g.fillStyle(color, alpha).fillEllipse(px, py, w, h);
    };
    const line = (points: number[], color: number, width = 2) => {
        g.lineStyle(width, color).beginPath().moveTo(points[0], points[1]);
        for (let i = 2; i < points.length; i += 2) g.lineTo(points[i], points[i + 1]);
        g.strokePath();
    };
    const crystal = (cx: number, cy: number, height: number, color: number) => {
        g.fillStyle(color).fillPoints([
            new Phaser.Geom.Point(cx - 5, cy), new Phaser.Geom.Point(cx - 4, cy - height + 7),
            new Phaser.Geom.Point(cx, cy - height), new Phaser.Geom.Point(cx + 5, cy - height + 6),
            new Phaser.Geom.Point(cx + 6, cy),
        ], true);
        line([cx, cy - height + 5, cx, cy - 3], 0xedffff, 1);
    };
    ellipse(0, 12, 136, 18, 0x152e39, .23);

    if (chapter < 3) {
        const palettes = [
            [0x526e76, 0x8fa7a2, 0xc2d0b3],
            [0x59674a, 0x899567, 0xb7bf89],
            [0x60576b, 0x9d8b8c, 0xd9bd80],
        ];
        const [stone, edge, trim] = palettes[chapter];
        rect(-43, 7, 86, 42, stone);
        // Individual masonry courses give each raised entrance weight and depth.
        for (let row = 0; row < 3; row++) {
            rect(-41, 12 + row * 13, 82, 2, 0x263d45, .6);
            for (let col = 0; col < 3; col++) rect(-30 + col * 31 + (row % 2) * 9, 14 + row * 13, 2, 10, 0x263d45, .5);
        }
        rect(-52, -2, 104, 13, edge);
        rect(-50, -2, 100, 3, trim);
        rect(-47, 9, 94, 3, 0x263d45);
        ellipse(0, 3, 74, 11, 0x122630);
        ellipse(0, 5, 57, 5, chapter === 0 ? 0x63b9b5 : chapter === 1 ? 0x91a760 : 0xd8a350, .45);

        if (chapter === 0) {
            // Cistern: riveted copper grating, wet stone, and a small water outlet.
            for (const px of [-24, -12, 0, 12, 24]) line([px, -1, px, 7], 0x839e93, 2);
            for (const px of [-46, 46]) rect(px - 2, 2, 4, 4, 0xd3b077);
            rect(-8, 25, 16, 20, 0x293f4c);
            rect(-5, 28, 10, 15, 0x58a5ae, .7);
            rect(-34, 16, 14, 3, 0x7e9a78);
            rect(23, 32, 17, 3, 0x7e9a78);
        } else if (chapter === 1) {
            // Roots: a timber hatch framed by curling roots, leaves, and mushrooms.
            for (const px of [-26, -13, 0, 13, 26]) rect(px, 0, 3, 7, 0xa17e50);
            line([-54, -10, -44, 5, -48, 24, -35, 45], 0x715333, 5);
            line([52, -8, 43, 9, 47, 29, 35, 46], 0x715333, 5);
            for (const [px, py] of [[-49, -9], [46, -6], [-37, 32], [43, 21]]) ellipse(px, py, 12, 5, 0x94ad69);
            for (const px of [-60, 61]) {
                rect(px - 2, 0, 4, 10, 0xd6c9a3);
                ellipse(px, 0, 15, 7, 0xb77355);
                rect(px - 3, -2, 3, 2, 0xf1d2aa);
            }
        } else {
            // Treasury: reinforced brass rim, an embossed lock, and amber lamps.
            rect(-52, 5, 104, 3, 0xc4a267);
            for (const px of [-46, -30, 30, 46]) rect(px - 1, 1, 3, 3, 0xf4d69b);
            rect(-13, 20, 26, 20, 0x443b50);
            rect(-11, 22, 22, 16, 0xb89a61);
            ellipse(0, 27, 5, 5, 0x443b50); rect(-1, 28, 3, 6, 0x443b50);
            for (const px of [-62, 62]) {
                ellipse(px, -13, 28, 36, 0xffcb75, .1);
                rect(px - 2, -23, 4, 34, 0x5d5263);
                rect(px - 6, -23, 12, 15, 0x493d43);
                rect(px - 4, -21, 8, 11, 0xf0c77d);
            }
        }
    } else {
        const i = chapter - 3;
        const accent = [0x75dbda, 0xb9bcf0, 0x99d2eb][i];
        // A recessed shaft: all structural trim stays below the existing ground line.
        ellipse(0, 2, 124, 22, accent, .14);
        rect(-53, 0, 106, 14, 0x507e94);
        rect(-51, 0, 102, 3, 0xe4f8f1);
        rect(-49, 4, 98, 8, 0x8fb8c7);
        ellipse(0, 5, 76, 11, 0x203f59);
        ellipse(0, 6, 55, 5, accent, .5);
        for (const px of [-44, 42]) rect(px, 5, 3, 4, 0xf1ffff);
        if (i === 0) {
            crystal(-61, 7, 23, accent); crystal(60, 8, 16, 0xa2e9e2);
            line([-28, 2, -15, 5, -4, 2, 9, 5, 24, 2], 0x8dcccc, 1);
        } else if (i === 1) {
            for (const px of [-61, 61]) {
                rect(px - 6, -15, 12, 23, 0x63879e);
                rect(px - 4, -13, 8, 16, 0xc3dcea);
                line([px - 3, 0, px + 3, -9], 0xffffff, 1);
            }
            for (const px of [-24, -12, 0, 12, 24]) line([px, 1, px, 8], 0x91abc4, 1);
        } else {
            for (const px of [-61, 61]) {
                rect(px - 3, -18, 6, 27, 0x688ba6);
                crystal(px, -12, 14, accent);
                ellipse(px, -17, 25, 25, accent, .12);
            }
            line([-25, 2, -12, 6, 0, 2, 12, 6, 25, 2], 0xd4e7f2, 1);
        }
        // Small snow caps integrate the markers into each frozen setting.
        ellipse(-54, 1, 18, 5, 0xf4fff5); ellipse(54, 1, 18, 5, 0xf4fff5);
    }
    const hint = scene.add.text(x, y - 52, '↓ AGÁCHATE', {
        fontFamily: 'Trebuchet MS', fontSize: '11px', color: chapter < 3 ? '#fff0c7' : '#e4fcff',
        backgroundColor: chapter < 3 ? '#2e4149' : '#294d65', padding: { x: 5, y: 3 },
    }).setOrigin(.5).setDepth(24);
    scene.tweens.add({ targets: hint, alpha: .65, duration: 1400, yoyo: true, repeat: -1 });
}
