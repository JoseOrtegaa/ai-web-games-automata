import { balance, spend } from './collectibles.ts';
export const COSMETICS=[
    {id:'none',name:'Sin sombrero',type:'hat',price:0},
    {id:'beret',name:'Boina de explorador',type:'hat',price:80},
    {id:'crown',name:'Corona de castillo',type:'hat',price:160},
    {id:'classic',name:'Pelaje clásico',type:'coat',price:0},
    {id:'snow',name:'Pelaje nevado',type:'coat',price:120},
    {id:'violet',name:'Pelaje violeta',type:'coat',price:200},
] as const;
type Type='hat'|'coat';
interface Wardrobe { owned:string[]; hat:string; coat:string }
const KEY='ferret-jump-cosmetics-v1';
let memory:Wardrobe={owned:['none','classic'],hat:'none',coat:'classic'};
export function readWardrobe():Wardrobe {
    try {
        const raw=JSON.parse(localStorage.getItem(KEY)||'null');
        if(raw && Array.isArray(raw.owned)) {
            const owned=COSMETICS.filter(c=>c.price===0||raw.owned.includes(c.id)).map(c=>c.id);
            memory={owned,hat:owned.includes(raw.hat)?raw.hat:'none',coat:owned.includes(raw.coat)?raw.coat:'classic'};
        }
    }catch { /* Session fallback. */ }
    return {...memory,owned:[...memory.owned]};
}
function write(w:Wardrobe) {memory=w;try{localStorage.setItem(KEY,JSON.stringify(w));}catch{/* Session fallback. */}}
export function selectCosmetic(id:string):boolean {
    const item=COSMETICS.find(c=>c.id===id);if(!item)return false;
    const w=readWardrobe();
    if(!w.owned.includes(id)) {
        if(!spend(item.price))return false;
        w.owned.push(id);
    }
    w[item.type as Type]=id;
    write(w);return true;
}
export {balance};
