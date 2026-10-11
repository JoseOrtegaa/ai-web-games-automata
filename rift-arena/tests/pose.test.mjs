import test from 'node:test';
import assert from 'node:assert/strict';
import {createFighter,tryAttack,stepFighter,ROSTER} from '../core.js';
import {fighterPose,attackIntensity} from '../poses.js';
import {isRepeatedTap,installZoomGuard} from '../touch-safety.js';

test('idle breathes gently, walking moves legs and changes gait',()=>{
  const f=createFighter('ryuzo',200),enemy=createFighter('brute',500);
  const idleA=fighterPose(f,0),idleB=fighterPose(f,1);
  assert.notEqual(idleA.bob,idleB.bob);
  for(let i=0;i<15;i++)stepFighter(f,{right:true},enemy,.04);
  const moving=fighterPose(f,1);
  assert.ok(f.motion>.7);
  assert.notDeepEqual(moving.frontKnee,idleA.frontKnee);
});
test('the guarded pose has raised hands, crouching lowers the body',()=>{
  const f=createFighter('razor',350);
  const idle=fighterPose(f,0);
  f.block=true;
  assert.ok(fighterPose(f,0).frontHand[1]<idle.frontHand[1]);
  f.block=false;f.crouch=true;
  assert.ok(fighterPose(f,0).rootScale<idle.rootScale);
});
test('punch, high kick, sweep and uppercut all have different articulated silhouettes',()=>{
  for(const type of ['punch','kick','sweep','uppercut','special']){
    const f=createFighter('selene',300);
    assert.equal(tryAttack(f,type),true);
    const windup=fighterPose(f,.2);
    f.action.elapsed=type==='punch'?.13:type==='kick'?.25:type==='special'?.31:.30;
    const peak=fighterPose(f,.2);
    assert.ok(peak.intensity>windup.intensity,type+' should animate towards the strike');
    if(type==='kick'||type==='sweep')assert.ok(peak.frontAnkle[0]>windup.frontAnkle[0]+30);
    if(type==='uppercut')assert.ok(peak.frontHand[1]<windup.frontHand[1]-35);
  }
});
test('hit recoil and knockout are visible physical states',()=>{
 const f=createFighter('ursus',400);
 f.recoil=.28;
 const stagger=fighterPose(f,.3);
 assert.ok(stagger.hurt>.8);
 f.health=0;
 const ko=fighterPose(f,.3);
 assert.ok(ko.fallen);
 assert.notEqual(ko.pivot,0);
});
test('poses are finite for all eight characters and all attacks',()=>{
 for(const def of ROSTER){
  const f=createFighter(def.id,300);
  for(const type of ['punch','kick','uppercut','sweep','special']){
    f.action={type,elapsed:.22};
    const p=fighterPose(f,.57);
    for(const key of ['frontKnee','frontAnkle','rearKnee','frontHand','rearHand']){
      assert.ok(p[key].every(Number.isFinite),def.id+' '+type+' '+key);
    }
    assert.ok(attackIntensity(f)>=0&&attackIntensity(f)<=1);
  }
 }
});
test('double tap guard prevents only nearby rapid repeated taps',()=>{
 const a={time:100,x:45,y:85};
 assert.equal(isRepeatedTap(a,265,49,81),true);
 assert.equal(isRepeatedTap(a,500,49,81),false);
 assert.equal(isRepeatedTap(a,210,150,81),false);
 assert.equal(isRepeatedTap(null,210,49,81),false);
});
test('zoom guard does not suppress a single tap, but blocks double tap and double click',()=>{
 const handlers={};
 const root={addEventListener(type,fn,opts){handlers[type]=fn;assert.equal(opts.passive,false)}};
 let time=100;
 installZoomGuard(root,()=>time);
 function touch(x,y){
  const ev={touches:[],changedTouches:[{clientX:x,clientY:y}],cancelable:true,prevented:false,preventDefault(){this.prevented=true}};
  handlers.touchend(ev);
  return ev.prevented;
 }
 assert.equal(touch(80,90),false);
 time=280;
 assert.equal(touch(83,91),true);
 time=800;
 assert.equal(touch(90,90),false);
 let prevented=false;
 handlers.dblclick({cancelable:true,preventDefault(){prevented=true;}});
 assert.equal(prevented,true);
});
