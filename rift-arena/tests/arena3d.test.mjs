import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,createFighter} from '../core.js';
import {color,geometryBox,geometrySphere,geometryCylinder,trs,multiply,transform,viewMatrix,perspective,createArena3D} from '../arena3d.js';
import {buildStage3D,STAGE_IDS} from '../stage3d.js';
import {STAGES} from '../stages.js';
import {stageAtmosphere,EXTRA_STAGE_IDS} from '../stage-scenes.js';
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
test('eight 3D arenas contain substantial nonplanar geometry',()=>{
 assert.deepEqual(STAGE_IDS,['zenith','temple','forge','glacier','forest','volcano','lake','alpine']);
 assert.deepEqual(EXTRA_STAGE_IDS,['forest','volcano','lake','alpine']);
 assert.deepEqual(STAGES.map(s=>s.id),STAGE_IDS);
 assert.ok(STAGES.every(s=>s.name&&s.tag&&s.color));
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
   assert.ok(['box','sphere','cone','cylinder','torso','pelvis','skull','muscle','calf','fist','fur'].includes(args[0]));
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

test('four new fields use unique ground colors and own environment geometry',()=>{
 const names=['forest','volcano','lake','alpine'];
 const colors=new Set();
 for(const id of names){
  const scene=buildStage3D(id);
  const ground=scene.palette.floor.join('/');
  assert.ok(!colors.has(ground),'Each battleground needs its own ground material');
  colors.add(ground);
  assert.ok(scene.batch.count>20000,id+' should have background/medium/near detail');
  const depths=new Set(),v=scene.batch.vertices;
  for(let i=0;i<v.length;i+=27) depths.add(Math.floor(v[i+2]/5));
  assert.ok(depths.size>=9,id+' needs multiple depth layers');
 }
});
test('stage atmosphere is animated, scene-specific and keeps a bounded mobile draw count',()=>{
 const results={};
 for(const id of STAGE_IDS){
  const samples=[];
  const renderer={primitive(kind,x,y,z,sx,sy,sz,color){
   assert.equal(kind,'sphere');
   assert.ok([x,y,z,sx,sy,sz].every(Number.isFinite));
   assert.ok(x>=-20&&x<=20);
   samples.push([x,y,z,sx,sy,sz,color]);
  }};
  stageAtmosphere(renderer,id,2.7);
  assert.ok(samples.length<=22,id+' particle budget too high');
  results[id]=samples;
 }
 for(const name of ['forest','volcano','lake','alpine'])
  assert.ok(results[name].length>=12,name+' should have visible ambience');
 const moving=[];
 stageAtmosphere({primitive:(...args)=>moving.push(args)},'volcano',4);
 assert.notDeepEqual(moving[0],results.volcano[0],'Embers should move as time passes');
});

test('rigid anatomy keeps both bone lengths for near and unreachable targets',async()=>{
 const {solveLimb}=await import('../fighters3d.js');
 const start=[.3,2.5,.2];
 for(const target of [[.3,2.5,.2],[8,2,.2],[-2,5,.2],[.8,1.7,.2]]){
  const [elbow,hand]=solveLimb(start,target,.76,.71,-1);
  const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  assert.ok(Math.abs(distance(start,elbow)-.76)<1e-6);
  assert.ok(Math.abs(distance(elbow,hand)-.71)<1e-6);
  assert.ok(distance(start,hand)<=1.47);
 }
});
