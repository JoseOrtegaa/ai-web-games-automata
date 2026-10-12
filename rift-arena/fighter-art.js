// The eight approved October 12 concepts. IDs stay stable for combat profiles.
import {attackIntensity} from './poses.js';
export const FIGHTER_ART=Object.freeze({
 ryuzo:{species:'Sensei',height:3.85,head:[.54,.14],hand:[.31,.26],hip:[.54,.53]},
 drake:{species:'Monje',height:3.8,head:[.52,.12],hand:[.26,.17],hip:[.55,.53]},
 brute:{species:'Toro',height:4.25,head:[.60,.13],hand:[.25,.23],hip:[.56,.52]},
 titan:{species:'Luchadora',height:3.75,head:[.53,.14],hand:[.38,.27],hip:[.53,.53]},
 razor:{species:'Gato',height:3.65,head:[.58,.14],hand:[.29,.25],hip:[.55,.53]},
 ursus:{species:'Panda',height:4.05,head:[.58,.13],hand:[.24,.25],hip:[.55,.53]},
 selene:{species:'Luchadora',height:3.75,head:[.53,.13],hand:[.30,.20],hip:[.53,.53]},
 fang:{species:'Lobo',height:3.95,head:[.57,.13],hand:[.29,.23],hip:[.55,.53]}
});
export const artUrl=id=>new URL('./assets/fighters/'+id+'.webp',import.meta.url).href;
export const portraitUrl=id=>new URL('./assets/fighters/'+id+'-portrait.webp',import.meta.url).href;
const images=new Map();
export function fighterImage(id){
 if(typeof Image==='undefined')return null;
 if(!images.has(id)){const image=new Image();image.src=artUrl(id);images.set(id,image);}
 return images.get(id);
}
export async function loadFighterArt(ids){
 await Promise.all(ids.map(async id=>{const im=fighterImage(id);if(im)await im.decode();}));
}
// Soft local skinning of the original cutout: no invented face/cloth textures.
// These are 2D puppets in a 3D stage, not reconstructed volumetric models.
export function deformArt(u,v,f,time){
 const d=FIGHTER_ART[f.id]||FIGHTER_ART.ryuzo;
 const peak=attackIntensity(f),kind=f.action?.type;
 const stride=Math.sin((f.walk||0)*1.35)*(f.motion||0);
 let x=u,y=v;
 const weight=(cx,cy,rx,ry)=>Math.exp(-(((u-cx)/rx)**2+((v-cy)/ry)**2));
 const striking=['punch','uppercut','special'].includes(kind);
 if(striking){
  const w=weight(...d.hand,.20,.17)*peak;
  x-=w*(kind==='special'?.22:.14);
  y-=w*(kind==='uppercut'?.20:.012);
 }
 if(kind==='kick'||kind==='sweep'){
  // Rotate the forward leg about its hip; upper cloth keeps its source silhouette.
  const influence=Math.max(0,Math.min(1,(v-.54)/.19))*Math.max(0,Math.min(1,(.65-u)/.23));
  const angle=(kind==='kick'?1.18:.40)*peak*influence;
  const dx=u-.48,dy=v-.57,c=Math.cos(angle),s=Math.sin(angle);
  x=.48+dx*c-dy*s;y=.57+dx*s+dy*c;
 }
 const lower=Math.max(0,(v-.55)/.45);
 x+=stride*.025*lower*(u<.52?1:-1);
 y-=Math.max(0,stride*(u<.52?1:-1))*.02*lower;
 const breath=Math.sin(time*2.8+f.x*.012)*.002;
 y+=breath*(1-v);
 const recoil=Math.min(1,(f.recoil||0)/.32);
 x+=recoil*.045*(1-v);
 if(f.block){x+=weight(...d.hand,.23,.18)*.095;y-=weight(...d.hand,.23,.18)*.035;}
 if(f.crouch){y=.98-(.98-y)*.77;x+=(u-.53)*.055;}
 if(f.health<=0){const dx=x-.53,dy=y-.96;x=.53+dx*.15-dy*.82;y=.96+dx*.82+dy*.15;}
 return [x,y];
}
export function renderArt2D(ctx,f,time,ground){
 const image=fighterImage(f.id),d=FIGHTER_ART[f.id];
 if(!image?.complete||!image.naturalWidth||!d)return false;
 const height=d.height*62,width=height*image.naturalWidth/image.naturalHeight;
 ctx.save();ctx.translate(f.x,ground-f.y);ctx.scale(-f.face,1);
 // Affine texture triangles use the same deformation as the WebGL sprite mesh.
 const cols=8,rows=12;
 const triangle=(uv)=>{
  const src=uv.map(([u,v])=>[u*image.naturalWidth,v*image.naturalHeight]);
  const dst=uv.map(([u,v])=>{const [x,y]=deformArt(u,v,f,time);return [(x-.53)*width,(y-.97)*height];});
  const [[x0,y0],[x1,y1],[x2,y2]]=src,[[a0,b0],[a1,b1],[a2,b2]]=dst;
  const den=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);
  const a=((a1-a0)*(y2-y0)-(a2-a0)*(y1-y0))/den;
  const c=((a2-a0)*(x1-x0)-(a1-a0)*(x2-x0))/den;
  const b=((b1-b0)*(y2-y0)-(b2-b0)*(y1-y0))/den;
  const d=((b2-b0)*(x1-x0)-(b1-b0)*(x2-x0))/den;
  ctx.save();ctx.beginPath();ctx.moveTo(a0,b0);ctx.lineTo(a1,b1);ctx.lineTo(a2,b2);ctx.closePath();ctx.clip();
  ctx.transform(a,b,c,d,a0-a*x0-c*y0,b0-b*x0-d*y0);ctx.drawImage(image,0,0);ctx.restore();
 };
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const a=[x/cols,y/rows],b=[(x+1)/cols,y/rows],c=[(x+1)/cols,(y+1)/rows],d=[x/cols,(y+1)/rows];
  triangle([a,b,c]);triangle([a,c,d]);
 }
 ctx.restore();return true;
}
