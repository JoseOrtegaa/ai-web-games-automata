// Boss-only QA shortcut. Route tests still traverse the level under normal controls.
export async function defeatBoss(page){
 const boss=await page.evaluate(()=>window.__ferretQA.state().boss);
 if(!boss?.active)return;
 for(let hit=0;hit<3;hit++){
  await page.evaluate(()=>{const q=window.__ferretQA;q.teleport(q.state().boss.x,295);q.scene.player.body.setVelocityY(360);});
  await page.waitForFunction(hit=>window.__ferretQA.state().boss.hp<=2-hit,hit,{timeout:4000});
  await page.waitForTimeout(900);
 }
}
