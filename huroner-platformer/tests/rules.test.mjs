import test from 'node:test';
import assert from 'node:assert/strict';
import {canStomp,canLandOneWay,jumpAllowed} from '../src/collision.ts';
test('stomp requires downward landing from above; sides and ascent hurt',()=>{assert.equal(canStomp(160,100,106),true);assert.equal(canStomp(-140,100,106),false);assert.equal(canStomp(200,155,106),false);});
test('one-way surfaces allow ascent and catch falling feet above top',()=>{assert.equal(canLandOneWay(-200,130,120),false);assert.equal(canLandOneWay(100,115,120),true);assert.equal(canLandOneWay(100,140,120),false);});
test('coyote and buffering bridge input edges but cannot grant air jumps',()=>{assert.equal(jumpAllowed(false,1000,920,960,110,130),true);assert.equal(jumpAllowed(false,1100,920,1070,110,130),false);assert.equal(jumpAllowed(true,1000,0,900,110,130),true);assert.equal(jumpAllowed(true,1000,0,800,110,130),false);});
