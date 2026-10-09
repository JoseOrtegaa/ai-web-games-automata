import type { SolidDef } from './types';

/** Check only the extra space needed above the crouched body. */
export function hasHeadroom(solids: SolidDef[], left: number, top: number, right: number, crouchedTop: number): boolean {
    return !solids.some(s => left < s.x + s.width && right > s.x && top < s.y + s.height && crouchedTop > s.y);
}

export function canStomp(velocityY: number, previousFeet: number, enemyTop: number): boolean {
    return velocityY > 35 && previousFeet <= enemyTop + 12;
}
export function canLandOneWay(velocityY: number, previousFeet: number, surfaceTop: number): boolean {
    return velocityY >= 0 && previousFeet <= surfaceTop + 8;
}
export function jumpAllowed(grounded: boolean, now: number, lastGround: number, pressedAt: number, coyote: number, buffer: number): boolean {
    return (grounded || now - lastGround <= coyote) && now - pressedAt <= buffer;
}
