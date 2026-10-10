/** Small, local encounters: enemies never follow across the whole level. */
export const ENEMY_RULES = {
    groundNotice: 280, flyingNotice: 360, verticalNotice: 110,
    spacing: 48, projectileRange: 420, projectileLifetime: 2800,
} as const;
export function pursuitDirection(x: number, y: number, playerX: number, playerY: number,
    minX: number, maxX: number, notice: number): number {
    if (playerX < minX - 70 || playerX > maxX + 70 ||
        Math.abs(playerX - x) > notice || Math.abs(playerY - y) > ENEMY_RULES.verticalNotice) return 0;
    return Math.abs(playerX - x) < 12 ? 0 : Math.sign(playerX - x);
}
export function projectileExpired(x: number, startX: number, age: number): boolean {
    return Math.abs(x - startX) >= ENEMY_RULES.projectileRange || age >= ENEMY_RULES.projectileLifetime;
}
