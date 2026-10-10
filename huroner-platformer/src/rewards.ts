export const RELICS = [
    {id:'cistern-key',name:'Llave antigua',texture:'relic-key',hint:'La cisterna del adarve'},
    {id:'roots-seed',name:'Semilla brillante',texture:'relic-seed',hint:'El jardín de las raíces'},
    {id:'treasury-gem',name:'Gema del castillo',texture:'relic-gem',hint:'La cámara del tesoro'},
] as const;
const KEY='ferret-jump-relics-v1';
let memory: string[]=[];
let pendingWrite=false;
export function readRelics(): string[] {
    try {
        const raw=JSON.parse(localStorage.getItem(KEY)||'null');
        const saved=raw?.version===1&&Array.isArray(raw.relics)
            ? RELICS.filter(r=>raw.relics.includes(r.id)).map(r=>r.id) : [];
        memory=pendingWrite?[...new Set([...saved,...memory])]:saved;
    } catch { /* Keep session progress when storage is blocked. */ }
    return [...memory];
}
export function discoverRelic(id: string): boolean {
    if(!RELICS.some(r=>r.id===id))return false;
    const found=readRelics();
    if(found.includes(id))return false;
    memory=[...found,id];
    try {localStorage.setItem(KEY,JSON.stringify({version:1,relics:memory}));pendingWrite=false;}catch {pendingWrite=true; /* Session fallback. */ }
    return true;
}
export const CHEST_CROQUETTES=25;
