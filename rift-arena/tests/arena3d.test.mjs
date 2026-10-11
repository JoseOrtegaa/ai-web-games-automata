import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,createFighter} from '../core.js';
import {color,geometryBox,geometrySphere,geometryCylinder,trs,multiply,transform,viewMatrix,perspective,createArena3D} from '../arena3d.js';
import {buildStage3D,STAGE_IDS} from '../stage3d.js';
import {drawFighter3D} from '../fighters3d.js';

test('WebGL primitives are genuine lit 3D triangles with normals',()=>{
 for(const geom of [geometryBox(),geometrySphere(),geometryCylinder()]){
   assert.equal(geom.length%9,0);
   assert.ok(geom.length>=36*9);
   assert.ok(geom.every(Number.isFinite));
 }
 assert.deepEqual(color('#ff8040'),[1,128/255,64/255]);
});
test('3D perspective, camera depth and matrices are finite',()=>{
 const projection=perspective(Math.PI/4,16/9);
 const view=viewMatrix([0,5,17],[0,1.5,0]);
 assert.equal(projection.length,16);
 assert.equal(view.length,16);
 assert.ok(multiply(projection,view).every(Number.isFinite));
 assert.deepEqual(transform(trs(1,2,3,1,1,1),[0,0,0]),[1,2,3]);
});
test('four 3D arenas contain substantial nonplanar geometry',()=>{
 assert.deepEqual(STAGE_IDS,['zenith','temple','forge','glacier']);
 const counts=[];
 for(const name of STAGE_IDS){
  const scene=buildStage3D(name);
  assert.ok(scene.batch.count>15000,name+' mesh too small');
  assert.equal(scene.batch.vertices.length,scene.batch.count*9);
  assert.ok(scene.batch.vertices.every(Number.isFinite));
  let maxY=-Infinity,minY=Infinity,maxZ=-Infinity,minZ=Infinity;
  const v=scene.batch.vertices;
  for(let i=0;i<v.length;i+=9){
    minY=Math.min(minY,v[i+1]);maxY=Math.max(maxY,v[i+1]);
    minZ=Math.min(minZ,v[i+2]);maxZ=Math.max(maxZ,v[i+2]);
  }
  assert.ok(maxY-minY>12);
  assert.ok(maxZ-minZ>40);
  counts.push(scene.batch.count);
 }
 assert.ok(new Set(counts).size>=3,'arenas should have distinct architecture');
});
test('eight fighters emit articulated 3D anatomy in idle, punch and kick',()=>{
 const counts={};
 const fake={
  primitive(...args){
   assert.ok(['box','sphere','cone','cylinder'].includes(args[0]));
   for(const n of args.slice(1,7))assert.ok(Number.isFinite(n));
   counts.primitive++;
  },
  segment(a,b,r,c,root){
   assert.ok(a.every(Number.isFinite)&&b.every(Number.isFinite));
   assert.ok(r>0);assert.equal(root.length,16);counts.segment++;
  }
 };
 for(const def of ROSTER){
  counts.primitive=0;counts.segment=0;
  const f=createFighter(def.id,300,1);
  drawFighter3D(fake,f,2.1);
  assert.ok(counts.primitive>=38,def.id+' needs modeled face and suit');
  assert.ok(counts.segment>=7,def.id+' needs limbs');
  for(const attack of ['punch','kick','uppercut','special']){
   f.action={type:attack,elapsed:.3,hit:false};
   drawFighter3D(fake,f,3.5);
  }
 }
});
test('graceful 2D fallback when WebGL is not supported',()=>{
 assert.equal(createArena3D({getContext(){return null}}),null);
});
