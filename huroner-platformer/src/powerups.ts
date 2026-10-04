import { B } from './balance';
import type { PowerUpKind } from './types';
export interface Status {
    health: number;
    shield: boolean;
    oilUntil: number;
}
export function applyPower(kind: PowerUpKind, state: Status, now: number): boolean {
    if (kind === 'meat') {
        if (state.health >= 3)
            return false;
        state.health++;
    }
    else if (kind === 'oil')
        state.oilUntil = now + B.oilDuration;
    else
        state.shield = true;
    return true;
}
