import test from 'node:test';
import assert from 'node:assert/strict';
import {readWallet,balance,spend,saveRun} from '../src/collectibles.ts';
import {readWardrobe,selectCosmetic} from '../src/cosmetics.ts';
import {readProgress,completeLevel} from '../src/progress.ts';
const data=new Map();
globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
test('legacy savings fund purchases without changing lifetime totals or run records',()=>{
 data.set('ferret-jump-v1',JSON.stringify({version:1,total:150,best:60}));
 assert.equal(balance(),150);assert(!spend(151));
 assert(selectCosmetic('beret'));assert.equal(balance(),70);
 assert(!selectCosmetic('snow'));
 assert.equal(readWallet().total,150);
 assert.equal(readWallet().spent,80);
 saveRun(35);assert.equal(balance(),105);
 assert.equal(readWallet().best,60);
 assert.equal(readWardrobe().hat,'beret');
 assert(!selectCosmetic('unknown'));
});
test('level records preserve old completed sequence and best croquettes per level',()=>{
 data.set('ferret-jump-campaign-v1',JSON.stringify({version:1,completed:['1-1','1-2','1-3']}));
 assert.equal(readProgress().completed.length,3);
 completeLevel(3,27);completeLevel(3,19);
 assert.equal(readProgress().best['2-1'],27);
 assert.equal(readProgress().completed.at(-1),'2-1');
});
