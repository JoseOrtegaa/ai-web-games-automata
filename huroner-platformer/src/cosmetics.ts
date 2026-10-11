import { balance, spend } from './collectibles.ts';
export const COSMETICS=[
    {id:'none',name:'Sin sombrero',type:'hat',price:0},
    {id:'beret',name:'Boina de explorador',type:'hat',price:80},
    {id:'crown',name:'Corona de castillo',type:'hat',price:160},
    {id:'classic',name:'Pelaje clásico',type:'coat',price:0},
    {id:'snow',name:'Pelaje nevado',type:'coat',price:120},
    {id:'violet',name:'Pelaje violeta',type:'coat',price:200},
    {id:'mint',name:'Pelaje menta',type:'coat',price:140},
    {id:'coral',name:'Pelaje coral',type:'coat',price:160},
    {id:'gold',name:'Pelaje dorado',type:'coat',price:180},
    {id:'midnight',name:'Pelaje medianoche',type:'coat',price:220},
    {id:'no-balloon',name:'Sin globo',type:'accessory',price:0},
    {id:'balloon-red',name:'Globo cereza',type:'accessory',price:100},
    {id:'balloon-mint',name:'Globo menta',type:'accessory',price:130},
    {id:'balloon-gold',name:'Globo dorado',type:'accessory',price:170},
] as const;
type Type='hat'|'coat'|'accessory';
interface Wardrobe { owned:string[]; hat:string; coat:string; accessory:string }
const KEY='ferret-jump-cosmetics-v1';
let memory:Wardrobe={owned:['none','classic','no-balloon'],hat:'none',coat:'classic',accessory:'no-balloon'};
export function readWardrobe():Wardrobe {
    try {
        const raw=JSON.parse(localStorage.getItem(KEY)||'null');
        if(raw && Array.isArray(raw.owned)) {
            const owned=COSMETICS.filter(c=>c.price===0||raw.owned.includes(c.id)).map(c=>c.id);
            memory={owned,hat:owned.includes(raw.hat)?raw.hat:'none',coat:owned.includes(raw.coat)?raw.coat:'classic',accessory:owned.includes(raw.accessory)?raw.accessory:'no-balloon'};
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
