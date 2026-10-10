import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:960,height:540},hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>{
 const s=window.__ferretQA.scene,hat=s.hat;
 return {coat:s.player.coat,texture:s.player.sprite.texture.key,hat:hat?.texture.key,hatVisible:hat?.visible,
  hatWidth:hat?.displayWidth,hatX:hat?.x,hatY:hat?.y,flip:hat?.flipX,playerX:s.player.sprite.x,playerY:s.player.sprite.y};
});
try {
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8123/huroner-platformer/dist/?qa=1');
 await page.waitForFunction(()=>window.__ferretQA);
 await page.evaluate(()=>localStorage.setItem('ferret-jump-v1',JSON.stringify({version:1,total:1000,best:100})));
 await page.click('#start');
 for(const id of ['crown','snow'])await page.click(`[data-cosmetic="${id}"]`);
 assert.equal(await page.locator('#shop-balance').textContent(),'◆ 720 croquetas disponibles');
 await page.click('[data-level="0"]');
 await page.waitForFunction(()=>window.__ferretQA.state().mode==='playing');
 await page.waitForTimeout(120);
 let s=await state();
 assert.equal(s.texture,'ferret-snow');assert.equal(s.hat,'hat-crown');
 assert(s.hatVisible&&s.hatWidth<=30&&Math.abs(s.hatX-s.playerX)<=8&&s.hatY<s.playerY-15);
 const palette=await page.evaluate(()=>{
  const count=(key,color)=>{const img=window.__ferretQA.scene.textures.get(key).getSourceImage(),d=img.getContext('2d').getImageData(0,0,img.width,img.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]===color[0]&&d[i+1]===color[1]&&d[i+2]===color[2]&&d[i+3])n++;return n;};
  return {snow:count('ferret-snow',[155,201,211]),violet:count('ferret-violet',[162,120,198]),classic:count('ferret',[211,155,115])};
 });
 assert(palette.snow>80&&palette.violet>80&&palette.classic>80,'coat atlas must recolor fur pixels');
 await page.evaluate(()=>{const s=window.__ferretQA.scene;s.player.reset(300,330);s.physics.pause();s.cameras.main.setZoom(2);s.cameras.main.centerOn(300,330);});
 await page.waitForTimeout(100);await page.screenshot({path:'test-results/visual-crown-snow.png'});
 await page.evaluate(()=>{const s=window.__ferretQA.scene;s.physics.resume();s.cameras.main.setZoom(1);s.player.reset(300,385);});
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(200);await page.keyboard.up('ArrowLeft');
 s=await state();assert(s.flip&&s.hatX<s.playerX,'hat follows the flipped head');
 await page.keyboard.down('ArrowDown');await page.waitForTimeout(100);
 assert.equal((await state()).hatVisible,false,'hat clears the crouch passage');await page.keyboard.up('ArrowDown');
 await page.waitForTimeout(100);assert((await state()).hatVisible);
 await page.evaluate(()=>{const s=window.__ferretQA.scene;s.status.shield=true;});
 await page.waitForTimeout(50);assert.equal((await state()).texture,'ferret-snow','shield keeps chosen coat');
 await page.click('#pause');await page.click('#pause-map');await page.click('[data-cosmetic="violet"]');
 await page.click('[data-level="0"]');await page.waitForFunction(()=>window.__ferretQA.state().mode==='playing');
 assert.equal((await state()).texture,'ferret-violet');
 await page.evaluate(()=>{const s=window.__ferretQA.scene;s.player.reset(300,330);s.physics.pause();s.cameras.main.setZoom(2);s.cameras.main.centerOn(300,330);});
 await page.waitForTimeout(100);await page.screenshot({path:'test-results/visual-crown-violet.png'});
 await page.evaluate(()=>{const s=window.__ferretQA.scene;s.physics.resume();s.cameras.main.setZoom(1);s.player.reset(300,385);});
 await page.click('#pause');await page.click('#pause-map');
 await page.reload();await page.waitForFunction(()=>window.__ferretQA);await page.click('#start');
 assert.equal(await page.locator('[data-cosmetic="crown"] span').textContent(),'Equipado');
 assert.equal(await page.locator('[data-cosmetic="violet"] span').textContent(),'Equipado');
 assert.equal(await page.locator('#shop-balance').textContent(),'◆ 520 croquetas disponibles');
 await page.evaluate(()=>localStorage.setItem('ferret-jump-campaign-v1',JSON.stringify({version:1,completed:['1-1','1-2','1-3','2-1','2-2']})));
 await page.click('#map-back');await page.click('#start');
 await page.click('[data-level="0"]');await page.waitForFunction(()=>window.__ferretQA.state().mode==='playing');
 await page.evaluate(()=>{const q=window.__ferretQA,t=q.state().level.tunnel;q.teleport(t.x,t.y-30);});
 await page.waitForTimeout(180);await page.keyboard.down('ArrowDown');
 await page.waitForFunction(()=>window.__ferretQA.state().inSecret);await page.keyboard.up('ArrowDown');
 assert.equal((await state()).texture,'ferret-violet','secret transition preserves coat');
 await page.waitForTimeout(60);assert((await state()).hatVisible,'secret transition preserves crown');
 await page.click('#pause');await page.click('#pause-map');
 const patterns=[];
 for(let i=3;i<6;i++){
  await page.click(`[data-level="${i}"]`);await page.waitForFunction(i=>window.__ferretQA.state().levelIndex===i&&window.__ferretQA.state().mode==='playing',i);
  const backdrop=await page.evaluate(()=>{
   const s=window.__ferretQA.scene;
   const key=s.children.list.find(c=>c.type==='TileSprite'&&c.depth===-30)?.displayTexture.key;
   const canvas=s.textures.get(key).getSourceImage();const c=canvas.getContext('2d');
   const samples=[];for(let y=80;y<=400;y+=80)for(let x=150;x<=2550;x+=300)samples.push(...c.getImageData(x,y,1,1).data);
   return {key,samples};
  });
  patterns.push(JSON.stringify(backdrop.samples));
  assert.equal(backdrop.key,['castle-frozen-bridge','castle-frozen-hall','castle-frozen-tower'][i-3]);
  const material=(await page.evaluate(()=>window.__ferretQA.state().level.solids.filter(s=>s.oneWay).map(s=>s.surface)));
  assert(material.includes(['ice','glass','snow'][i-3]));
  await page.evaluate(()=>{const q=window.__ferretQA;q.teleport(980,340);q.scene.cameras.main.centerOn(980,300);});
  await page.waitForTimeout(100);await page.screenshot({path:`test-results/visual-ice-${i}.png`});
  await page.click('#pause');await page.click('#pause-map');
 }
 assert.equal(new Set(patterns).size,3,'each frozen chapter has a distinct rendered panorama');
 assert.deepEqual(errors,[]);
 console.log('PASS: sized crown, coat textures, facing, crouch, shield, persistence, and distinct frozen panoramas.');
} finally {await browser.close();}
