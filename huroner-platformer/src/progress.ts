const KEY = 'ferret-jump-campaign-v1';
export interface Progress { version: 1; completed: string[]; best: Record<string,number> }
const IDS = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3'];
let memory: Progress = { version: 1, completed: [], best:{} };
export function readProgress(): Progress {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (raw?.version === 1 && Array.isArray(raw.completed)) {
            // Only a contiguous, known sequence can unlock levels.
            const completed: string[] = [];
            for (const id of IDS) { if (!raw.completed.includes(id)) break; completed.push(id); }
            const best:Record<string,number> = {};
            for (const id of IDS) if(Number.isSafeInteger(raw.best?.[id]) && raw.best[id]>=0) best[id]=raw.best[id];
            memory = { version: 1, completed, best };
        }
    } catch { /* Continue in memory when storage is unavailable. */ }
    return { version:1, completed:[...memory.completed], best:{...memory.best} };
}
export function isUnlocked(index: number, progress = readProgress()): boolean {
    return Number.isInteger(index) && index >= 0 && index < IDS.length && (index === 0 || progress.completed.includes(IDS[index-1]));
}
export function completeLevel(index: number, croquettes = 0): void {
    const progress = readProgress();
    if (!isUnlocked(index, progress)) return;
    if (!progress.completed.includes(IDS[index])) progress.completed.push(IDS[index]);
    if(Number.isSafeInteger(croquettes) && croquettes>=0)
        progress.best[IDS[index]]=Math.max(progress.best[IDS[index]] ?? 0,croquettes);
    memory = progress;
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* Memory fallback. */ }
}
