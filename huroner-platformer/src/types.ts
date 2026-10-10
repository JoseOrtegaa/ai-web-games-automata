/** Level geometry uses top-left rectangles. Entity x/y are center positions. */
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export type Surface = 'wood' | 'cushion' | 'book' | 'pipe' | 'tile' | 'cardboard' | 'metal' | 'concrete' | 'grass' | 'bark' | 'rock' | 'stone';
export interface SolidDef extends Rect {
    surface: Surface;
    oneWay?: boolean;
}
export type EnemyKind = 'rabbit' | 'armored' | 'quail' | 'spitter' | 'rat' | 'bat' | 'beetle' | 'moth' | 'mimic' | 'ghost';
export interface EnemyDef {
    id: string;
    kind: EnemyKind;
    x: number;
    y: number;
    minX: number;
    maxX: number;
}
export interface CollectibleDef {
    id: string;
    x: number;
    y: number;
}
export type PowerUpKind = 'meat' | 'oil' | 'puff';
export interface PowerUpDef {
    id: string;
    kind: PowerUpKind;
    x: number;
    y: number;
}
/** Secrets are non-solid occluding furniture panels over walkable optional routes. */
export interface SecretDef extends Rect {
    surface: Surface;
    id: string;
    label: string;
}
export interface SceneryDef {
    kind: string;
    x: number;
    y: number;
    scale?: number;
    flip?: boolean;
}
export interface SectionDef {
    x: number;
    name: string;
    palette: 'house' | 'garage' | 'park' | 'mountain' | 'castle';
}
export interface LevelDef {
    /** Center and top of a solid tunnel entrance. Crouch while standing on it. */
    tunnel?: { x: number; y: number };
    width: number;
    height: number;
    spawn: {
        x: number;
        y: number;
    };
    checkpoint: {
        x: number;
        y: number;
    };
    goal: {
        x: number;
        y: number;
    };
    sections: SectionDef[];
    solids: SolidDef[];
    enemies: EnemyDef[];
    collectibles: CollectibleDef[];
    powerUps: PowerUpDef[];
    secrets: SecretDef[];
    scenery: SceneryDef[];
}
