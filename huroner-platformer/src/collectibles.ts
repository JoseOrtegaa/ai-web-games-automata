interface Save { version:1; total:number; best:number; spent:number }
const KEY='ferret-jump-v1';
let memory:Save={version:1,total:0,best:0,spent:0};
let pending=false;
export function readWallet():Save {
    try {
        const raw=JSON.parse(localStorage.getItem(KEY)||'null');
        if(raw?.version===1 && Number.isSafeInteger(raw.total) && raw.total>=0 && Number.isSafeInteger(raw.best) && raw.best>=0) {
            const spent=Number.isSafeInteger(raw.spent)&&raw.spent>=0&&raw.spent<=raw.total?raw.spent:0;
            const disk={version:1 as const,total:raw.total,best:raw.best,spent};
            memory=pending?{version:1,total:Math.max(disk.total,memory.total),best:Math.max(disk.best,memory.best),spent:Math.max(disk.spent,memory.spent)}:disk;
        }
    } catch { /* Storage can be disabled. */ }
    return {...memory};
}
function write(data:Save):Save {
    memory=data;
    try { localStorage.setItem(KEY,JSON.stringify(data)); pending=false; } catch { pending=true; }
    return {...data};
}
export function balance():number {const s=readWallet();return s.total-s.spent;}
export function spend(amount:number):boolean {
    if(!Number.isSafeInteger(amount)||amount<0)return false;
    const s=readWallet();if(s.total-s.spent<amount)return false;
    write({...s,spent:s.spent+amount});return true;
}
export function saveRun(amount:number):Save {
    const s=readWallet();
    if(!Number.isSafeInteger(amount)||amount<0)return s;
    return write({...s,total:s.total+amount,best:Math.max(s.best,amount)});
}
