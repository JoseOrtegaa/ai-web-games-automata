// Rift Arena WebGL 3D. No external libraries, assets, accounts, servers or network requests.
import { buildStage3D } from './stage3d.js';
import { drawFighter3D } from './fighters3d.js';
import {stageAtmosphere} from './stage-scenes.js';

export const color=h=>{
 const s=(h||'#ffffff').replace('#','');
 if(s.length===3)return [...s].map(x=>parseInt(x+x,16)/255);
 return [0,2,4].map(i=>parseInt(s.slice(i,i+2),16)/255);
};
export const diff=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const norm=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function multiply(a,b){
 const o=new Float32Array(16);
 for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];
 return o;
}
export function trs(x=0,y=0,z=0,sx=1,sy=1,sz=1,angle=0,tilt=0){
 const ca=Math.cos(angle),sa=Math.sin(angle),cb=Math.cos(tilt),sb=Math.sin(tilt);
 return new Float32Array([ca*sx,0,-sa*sx,0,-sa*sb*sy,cb*sy,-ca*sb*sy,0,sa*cb*sz,sb*sz,ca*cb*sz,0,x,y,z,1]);
}
export const transform=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
export function viewMatrix(eye,target){
 const z=norm(diff(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x),dot=(v)=>-v.reduce((sum,n,i)=>sum+n*eye[i],0);
 return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,dot(x),dot(y),dot(z),1]);
}
export function perspective(fov,aspect,near=.1,far=180){
 const f=1/Math.tan(fov/2),nf=1/(near-far);
 return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,far*near*2*nf,0]);
}
const vert=(out,p,n,c)=>out.push(...p,...n,...c);
const tri=(out,a,b,c,na,nb,nc)=>{
 for(const [p,n] of [[a,na],[b,nb],[c,nc]])vert(out,p,n,[1,1,1]);
};
export function geometryBox(){
 const v=[],p=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
 for(const [a,b,c,d,n] of [[0,3,2,1,[0,0,-1]],[4,5,6,7,[0,0,1]],[0,4,7,3,[-1,0,0]],[1,2,6,5,[1,0,0]],[0,1,5,4,[0,-1,0]],[3,7,6,2,[0,1,0]]]){
  tri(v,p[a],p[b],p[c],n,n,n);tri(v,p[a],p[c],p[d],n,n,n);
 }
 return new Float32Array(v);
}
export function geometrySphere(rings=10,sectors=13){
 const out=[],sample=(i,j)=>{const a=Math.PI*i/rings,b=2*Math.PI*j/sectors;return [Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)];};
 for(let i=0;i<rings;i++)for(let j=0;j<sectors;j++){
  const a=sample(i,j),b=sample(i+1,j),c=sample(i+1,j+1),d=sample(i,j+1);
  tri(out,a,b,c,a,b,c);tri(out,a,c,d,a,c,d);
 }
 return new Float32Array(out);
}
export function geometryCylinder(sides=11,top=.78){
 const out=[],step=Math.PI*2/sides;
 for(let j=0;j<sides;j++){
  const a=j*step,b=(j+1)*step,na=norm([Math.cos(a),.15,Math.sin(a)]),nb=norm([Math.cos(b),.15,Math.sin(b)]);
  const p=[Math.cos(a),-.5,Math.sin(a)],q=[Math.cos(b),-.5,Math.sin(b)],r=[top*Math.cos(b),.5,top*Math.sin(b)],s=[top*Math.cos(a),.5,top*Math.sin(a)];
  tri(out,p,q,r,na,nb,nb);tri(out,p,r,s,na,nb,na);
  tri(out,[0,-.5,0],q,p,[0,-1,0],[0,-1,0],[0,-1,0]);
  tri(out,[0,.5,0],s,r,[0,1,0],[0,1,0],[0,1,0]);
 }
 return new Float32Array(out);
}
const GEOMS={box:geometryBox(),sphere:geometrySphere(),cylinder:geometryCylinder(),cone:geometryCylinder(10,0)};
export class MeshBuilder{
 constructor(){this.vertices=[];this.count=0;}
 add(mesh,x,y,z,sx,sy,sz,col,rot=0,tilt=0){
  const m=trs(x,y,z,sx,sy,sz,rot,tilt),geo=GEOMS[mesh]||GEOMS.box,c=color(col);
  for(let i=0;i<geo.length;i+=9){
   const p=transform(m,[geo[i],geo[i+1],geo[i+2]]);
   const n=norm([m[0]*geo[i+3]+m[4]*geo[i+4]+m[8]*geo[i+5],m[1]*geo[i+3]+m[5]*geo[i+4]+m[9]*geo[i+5],m[2]*geo[i+3]+m[6]*geo[i+4]+m[10]*geo[i+5]]);
   this.vertices.push(...p,...n,...c);
  }
  this.count+=geo.length/9;
 }
 box(x,y,z,sx,sy,sz,c,r=0){this.add('box',x,y,z,sx,sy,sz,c,r);}
 ball(x,y,z,sx,sy,sz,c){this.add('sphere',x,y,z,sx,sy,sz,c);}
 cone(x,y,z,sx,sy,sz,c,r=0){this.add('cone',x,y,z,sx,sy,sz,c,r);}
 cylinder(x,y,z,sx,sy,sz,c){this.add('cylinder',x,y,z,sx,sy,sz,c);}
}
const vs=[
'attribute vec3 aPos;attribute vec3 aNormal;attribute vec3 aColor;',
'uniform mat4 uModel;uniform mat4 uVP;uniform vec3 uTint;',
'varying vec3 vNormal;varying vec3 vPos;varying vec3 vColor;',
'void main(){vec4 w=uModel*vec4(aPos,1.);vPos=w.xyz;',
'vNormal=mat3(uModel)*aNormal;vColor=aColor*uTint;gl_Position=uVP*w;}'
].join('\n');
const fs=[
'precision mediump float;varying vec3 vNormal;varying vec3 vPos;varying vec3 vColor;',
'uniform vec3 uCamera;uniform vec3 uFog;uniform vec3 uLamp;uniform float uFogDensity;',
'void main(){vec3 n=normalize(vNormal);vec3 sun=normalize(vec3(-.38,.92,.58));',
'float diffuse=max(dot(n,sun),0.);float fill=max(dot(n,normalize(vec3(.62,.24,-.6))),0.)*.24;',
'float facing=max(dot(n,normalize(uCamera-vPos)),0.);float rim=pow(1.-facing,3.)*.19;',
'float spec=pow(max(dot(reflect(-sun,n),normalize(uCamera-vPos)),0.),24.)*.16;',
'float texture=sin(vPos.x*17.+vPos.z*9.)*sin(vPos.y*19.+vPos.z*6.)*.015;',
'vec3 lit=vColor*(.38+.66*diffuse+fill+rim+texture)*uLamp+spec*vec3(1.,.9,.79);',
'float dist=length(uCamera-vPos),fog=1.-exp(-max(0.,dist-11.)*uFogDensity);',
'gl_FragColor=vec4(pow(mix(lit,uFog,clamp(fog,0.,.73)),vec3(.95)),1.);}'
].join('\n');
function compile(gl,kind,src){
 const sh=gl.createShader(kind);gl.shaderSource(sh,src);gl.compileShader(sh);
 if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));
 return sh;
}
export function createArena3D(canvas){
 let gl;
 try{gl=canvas.getContext('webgl',{alpha:false,antialias:true,depth:true,powerPreference:'high-performance',preserveDrawingBuffer:true})||canvas.getContext('experimental-webgl',{alpha:false,antialias:true,depth:true});}
 catch{return null;}
 if(!gl)return null;
 try{return new ArenaRenderer(gl,canvas);}catch(e){console.warn('WebGL initialization failure',e);return null;}
}
export class ArenaRenderer{
 constructor(gl,canvas){
  this.gl=gl;this.canvas=canvas;this.program=gl.createProgram();
  gl.attachShader(this.program,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(this.program,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(this.program);
  if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
  gl.useProgram(this.program);this.loc={};
  for(const [key,name] of Object.entries({pos:'aPos',normal:'aNormal',col:'aColor'}))this.loc[key]=gl.getAttribLocation(this.program,name);
  for(const [key,name] of Object.entries({model:'uModel',vp:'uVP',tint:'uTint',camera:'uCamera',fog:'uFog',lamp:'uLamp',density:'uFogDensity'}))this.loc[key]=gl.getUniformLocation(this.program,name);
  this.dynamic={};this.stageMeshes=new Map();
  for(const [name,data] of Object.entries(GEOMS)){
   const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
   this.dynamic[name]={buffer:buf,count:data.length/9};
  }
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);
  this.neutral=trs();this.camera=[0,5.0,17.0];this.target=[0,1.5,0];this.width=0;this.height=0;
 }
 resize(w,h){if(this.width===w&&this.height===h)return;this.width=w;this.height=h;this.gl.viewport(0,0,w,h);}
 bind(mesh){
  const gl=this.gl,l=this.loc;gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
  for(const [slot,offset] of [[l.pos,0],[l.normal,12],[l.col,24]]){gl.enableVertexAttribArray(slot);gl.vertexAttribPointer(slot,3,gl.FLOAT,false,36,offset);}
 }
 draw(mesh,model,shade='#ffffff'){
  const gl=this.gl,l=this.loc;this.bind(mesh);
  gl.uniformMatrix4fv(l.model,false,model);gl.uniform3fv(l.tint,color(shade));
  gl.drawArrays(gl.TRIANGLES,0,mesh.count);
 }
 primitive(kind,x,y,z,sx,sy,sz,shade,rot=0,tilt=0,root=null){
  const model=trs(x,y,z,sx,sy,sz,rot,tilt);this.draw(this.dynamic[kind],root?multiply(root,model):model,shade);
 }
 segment(a,b,r,col,root=null){
  const delta=diff(b,a),len=Math.hypot(...delta);if(len<.005)return;
  const y=norm(delta),x=norm(cross([0,0,1],y)),z=norm(cross(x,y));
  const m=new Float32Array([x[0]*r,x[1]*r,x[2]*r,0,y[0]*len,y[1]*len,y[2]*len,0,
   z[0]*r,z[1]*r,z[2]*r,0,(a[0]+b[0])*.5,(a[1]+b[1])*.5,(a[2]+b[2])*.5,1]);
  this.draw(this.dynamic.cylinder,root?multiply(root,m):m,col);
 }
 prepareStage(stage){
  if(this.stageMeshes.has(stage))return this.stageMeshes.get(stage);
  const scene=buildStage3D(stage),gl=this.gl,buffer=gl.createBuffer(),data=new Float32Array(scene.batch.vertices);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  const mesh={buffer,count:data.length/9,palette:scene.palette};this.stageMeshes.set(stage,mesh);return mesh;
 }
 render(fighters,stage='zenith',time=0,shake=0){
  const gl=this.gl,l=this.loc,scene=this.prepareStage(stage),pal=scene.palette;
  const targetX=(fighters[0].x+fighters[1].x-1152)*.014*.24;
  const gap=Math.abs(fighters[0].x-fighters[1].x)*.014;
  const distance=15.0+Math.min(.9,gap*.15)+(this.width<this.height*1.2?5:0);
  const dest=[targetX,5.15,distance],focus=[targetX,1.45,0];
  for(let i=0;i<3;i++){this.camera[i]+=(dest[i]-this.camera[i])*.075;this.target[i]+=(focus[i]-this.target[i])*.075;}
  const camera=this.camera.map((v,i)=>v+(shake?Math.sin(time*95+i*4)*shake*.009:0));
  const vp=multiply(perspective(Math.PI/4.1,this.width/Math.max(1,this.height),.2,160),viewMatrix(camera,this.target));
  gl.clearColor(...pal.sky,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
  gl.uniformMatrix4fv(l.vp,false,vp);gl.uniform3fv(l.camera,camera);gl.uniform3fv(l.fog,pal.fog);
  gl.uniform3fv(l.lamp,pal.light);gl.uniform1f(l.density,.018);
  this.draw(scene,this.neutral);
  stageAtmosphere(this,stage,time);
  for(const fighter of fighters)drawFighter3D(this,fighter,time);
 }
}
