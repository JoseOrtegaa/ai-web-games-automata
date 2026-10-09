import test from 'node:test';
import assert from 'node:assert/strict';
import {canStomp,canLandOneWay,jumpAllowed,hasHeadroom} from '../src/collision.ts';
import {verticalGravity} from '../src/balance.ts';
test('stomp requires downward landing from above; sides and ascent hurt',()=>{assert.equal(canStomp(160,100,106),true);assert.equal(canStomp(-140,100,106),false);assert.equal(canStomp(200,155,106),false);});
test('one-way surfaces allow ascent and catch falling feet above top',()=>{assert.equal(canLandOneWay(-200,130,120),false);assert.equal(canLandOneWay(100,115,120),true);assert.equal(canLandOneWay(100,140,120),false);});
test('coyote and buffering bridge input edges but cannot grant air jumps',()=>{assert.equal(jumpAllowed(false,1000,920,960,110,130),true);assert.equal(jumpAllowed(false,1100,920,1070,110,130),false);assert.equal(jumpAllowed(true,1000,0,900,110,130),true);assert.equal(jumpAllowed(true,1000,0,800,110,130),false);});
test('held ascent floats slightly; releasing and descending have stronger gravity',()=>{
    assert(verticalGravity(-400,true)<1);
    assert(verticalGravity(-400,false)>1);
    assert.equal(verticalGravity(0,true),verticalGravity(300,false));
});
test('a low ceiling blocks standing while a neighboring gap allows it',()=>{
    const ceiling=[{x:100,y:389,width:70,height:15,surface:'stone'}];
    assert.equal(hasHeadroom(ceiling,120,388,144,406),false);
    assert.equal(hasHeadroom(ceiling,171,388,195,406),true);
    assert.equal(hasHeadroom(ceiling,120,406,144,424),true);
});
