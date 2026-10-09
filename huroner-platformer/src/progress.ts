const KEY = 'ferret-jump-campaign-v1';
export interface Progress { version: 1; completed: string[] }
const IDS = ['1-1', '1-2', '1-3'];
let memory: Progress = { version: 1, completed: [] };
export function readProgress(): Progress {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (raw?.version === 1 && Array.isArray(raw.completed)) {
            // Only a contiguous, known sequence can unlock levels.
            const completed: string[] = [];
            for (const id of IDS) { if (!raw.completed.includes(id)) break; completed.push(id); }
            memory = { version: 1, completed };
        }
    } catch { /* Continue in memory when storage is unavailable. */ }
    return { version:1, completed:[...memory.completed] };
}
export function isUnlocked(index: number, progress = readProgress()): boolean {
    return Number.isInteger(index) && index >= 0 && index < IDS.length && (index === 0 || progress.completed.includes(IDS[index-1]));
}
export function completeLevel(index: number): void {
    const progress = readProgress();
    if (!isUnlocked(index, progress)) return;
    if (!progress.completed.includes(IDS[index])) progress.completed.push(IDS[index]);
    memory = progress;
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* Memory fallback. */ }
}
