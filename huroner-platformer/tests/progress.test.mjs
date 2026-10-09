import test from 'node:test';
import assert from 'node:assert/strict';
import {readProgress,isUnlocked,completeLevel} from '../src/progress.ts';
test('sequential unlocks, duplicate wins, corrupt save and unavailable storage',()=>{
    const data=new Map();
    globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
    assert(isUnlocked(0)); assert(!isUnlocked(1)); assert(!isUnlocked(3));
    completeLevel(2); assert.deepEqual(readProgress().completed,[]);
    completeLevel(0); completeLevel(0); assert.deepEqual(readProgress().completed,['1-1']);
    assert(isUnlocked(1)); assert(!isUnlocked(2));
    localStorage.setItem('ferret-jump-campaign-v1',JSON.stringify({version:1,completed:['1-3','bad']}));
    assert.deepEqual(readProgress().completed,[]);
    localStorage.getItem=()=>{throw Error('blocked')}; localStorage.setItem=()=>{throw Error('blocked')};
    completeLevel(0);completeLevel(1);assert(isUnlocked(2));
});
