export const B = {
    speed: 220, acceleration: 1500, drag: 1900, airAcceleration: 1450, airDrag: 650,
    gravity: 1200, jump: 510, cutJump: 190, riseGravity: .88, fallGravity: 1.3,
    maxFall: 700, coyote: 110, buffer: 130, invulnerability: 1400,
    bounce: 400, oilDuration: 12000, oilMultiplier: 1.25,
} as const;

/** A held jump rises smoothly; releasing it cuts short; descent has more weight. */
export function verticalGravity(velocityY: number, jumpHeld: boolean): number {
    if (velocityY >= 0) return B.fallGravity;
    return jumpHeld ? B.riseGravity : B.fallGravity;
}
