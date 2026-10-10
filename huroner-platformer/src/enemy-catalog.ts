import type { EnemyKind } from './types';
/** Reusable enemy species: visuals use the kind, while behaviour stays shared. */
export const ENEMY_PROFILES: Record<EnemyKind, { hp: number; flying: boolean; patrol: number; chase: number }> = {
    rabbit: {hp:1,flying:false,patrol:48,chase:64},
    armored: {hp:2,flying:false,patrol:32,chase:42},
    quail: {hp:1,flying:true,patrol:45,chase:66},
    spitter: {hp:1,flying:false,patrol:0,chase:0},
    rat: {hp:1,flying:false,patrol:38,chase:54},
    bat: {hp:1,flying:true,patrol:35,chase:52},
    beetle: {hp:1,flying:false,patrol:30,chase:44},
    moth: {hp:1,flying:true,patrol:30,chase:48},
    mimic: {hp:2,flying:false,patrol:24,chase:36},
    ghost: {hp:1,flying:true,patrol:28,chase:46},
};
