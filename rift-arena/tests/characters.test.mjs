import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,createFighter} from '../core.js';
import {DESIGNS,portraitSvg,renderCharacter} from '../characters.js';

test('cuatro humanos y cuatro animales, siluetas y perfiles diferentes',()=>{
 assert.equal(ROSTER.length,8);
 assert.deepEqual(ROSTER.map(f=>DESIGNS[f.id]?.species),[
   'Humano','Humano','Gorila','Humano','Pantera','Oso','Humana','Lobo'
 ]);
 assert.equal(ROSTER.filter(f=>DESIGNS[f.id].type==='human').length,4);
 assert.equal(new Set(ROSTER.map(f=>DESIGNS[f.id].outfit)).size,8);
});
test('ocho retratos SVG completos y accesibles, no idénticos',()=>{
 const artworks=ROSTER.map(f=>portraitSvg(f));
 for(let i=0;i<artworks.length;i++){
  assert.match(artworks[i],/<svg /);
  assert.match(artworks[i],/<\/svg>/);
  assert.match(artworks[i],/aria-label=/);
  assert.match(artworks[i],/linearGradient/);
  assert.match(artworks[i],new RegExp(ROSTER[i].name));
  assert.ok(artworks[i].length>1300);
 }
 assert.equal(new Set(artworks).size,8);
 assert.match(artworks[4],/Pantera/);
 assert.match(artworks[5],/Oso/);
 assert.match(artworks[7],/Lobo/);
});
test('el dibujo de combate utiliza cabeza y extremidades para todos los luchadores',()=>{
 const counts={fill:0,stroke:0,ellipse:0};
 const gradient={addColorStop(){}};
 const ctx={
   save(){},restore(){},translate(){},rotate(){},scale(){},
   beginPath(){},moveTo(){},lineTo(){},closePath(){},quadraticCurveTo(){},bezierCurveTo(){},
   ellipse(){counts.ellipse++},arc(){},
   fill(){counts.fill++},stroke(){counts.stroke++},
   createLinearGradient(){return gradient},
   set fillStyle(v){this._fillStyle=v},get fillStyle(){return this._fillStyle},
   set strokeStyle(v){this._strokeStyle=v},get strokeStyle(){return this._strokeStyle}
 };
 for(const d of ROSTER){
  counts.fill=0;counts.stroke=0;counts.ellipse=0;
  const f=createFighter(d.id,430,1);
  renderCharacter(ctx,f,1.3,508);
  assert.ok(counts.fill>20,d.id+' must have detailed visible shapes');
  assert.ok(counts.stroke>15,d.id+' must have outlined anatomical elements');
  assert.ok(counts.fill>=25,d.id+' must have angular head and anatomy');
  f.action={type:'kick',elapsed:.24,hit:false};
  renderCharacter(ctx,f,2.5,508);
 }
});
