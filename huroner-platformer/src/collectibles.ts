interface Save {
    version: 1;
    total: number;
    best: number;
}
export function saveRun(amount: number): Save {
    let data: Save = { version: 1, total: 0, best: 0 };
    try {
        const raw = JSON.parse(localStorage.getItem('ferret-jump-v1') || 'null');
        if (raw?.version === 1 && Number.isFinite(raw.total) && Number.isFinite(raw.best))
            data = raw;
        data = { version: 1, total: data.total + amount, best: Math.max(data.best, amount) };
        localStorage.setItem('ferret-jump-v1', JSON.stringify(data));
    }
    catch {
        /* Private mode may disable localStorage. */
    }
    return data;
}
