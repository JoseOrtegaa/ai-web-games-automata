import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {ROSTER,createFighter} from '../core.js';
import {portraitSvg} from '../characters.js';
import {FIGHTER_ART,artUrl,portraitUrl,deformArt} from '../fighter-art.js';

test('the approved eight references are used by portraits and combat',async()=>{
 assert.deepEqual(ROSTER.map(f=>FIGHTER_ART[f.id].species),['Sensei','Monje','Toro','Luchadora','Gato','Panda','Luchadora','Lobo']);
 for(const f of ROSTER){
  await access(new URL(artUrl(f.id)));await access(new URL(portraitUrl(f.id)));
  const portrait=portraitSvg(f);assert.match(portrait,/<image href=/);assert.ok(portrait.includes(portraitUrl(f.id)));assert.ok(portrait.includes(f.name));
 }
});
test('cutout mesh animates without nonfinite vertices in either direction',()=>{
 for(const def of ROSTER)for(const face of [-1,1]){
  const f=createFighter(def.id,420,face),idle=deformArt(.25,.2,f,0);
  for(const kind of ['punch','uppercut','special','kick','sweep']){
   f.action={type:kind,elapsed:.25};
   for(let v=0;v<=1;v+=.1)for(let u=0;u<=1;u+=.1)assert.ok(deformArt(u,v,f,2).every(Number.isFinite));
  }
  f.action={type:'punch',elapsed:.13};assert.notDeepEqual(deformArt(.25,.2,f,0),idle);
  f.action=null;f.crouch=true;assert.ok(deformArt(.5,.2,f,0)[1]>.2);
  f.crouch=false;f.health=0;assert.ok(deformArt(.5,.2,f,0).every(Number.isFinite));
 }
});
