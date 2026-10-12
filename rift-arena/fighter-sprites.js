import {FIGHTER_ART,fighterImage,deformArt} from './fighter-art.js';
const vertex=`attribute vec3 aPosition;attribute vec2 aUV;uniform mat4 uVP;varying vec2 vUV;
void main(){vUV=aUV;gl_Position=uVP*vec4(aPosition,1.);}`;
const fragment=`precision mediump float;varying vec2 vUV;uniform sampler2D uTexture;uniform float uFlash;
void main(){vec4 c=texture2D(uTexture,vUV);if(c.a<.025)discard;
gl_FragColor=vec4(mix(c.rgb,vec3(1.,.87,.74),uFlash*.42),c.a);}`;
function shader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
export class FighterSprites{
 constructor(gl){
  this.gl=gl;this.textures=new Map();this.buffer=gl.createBuffer();this.program=gl.createProgram();
  gl.attachShader(this.program,shader(gl,gl.VERTEX_SHADER,vertex));gl.attachShader(this.program,shader(gl,gl.FRAGMENT_SHADER,fragment));gl.linkProgram(this.program);
  if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
  this.pos=gl.getAttribLocation(this.program,'aPosition');this.uv=gl.getAttribLocation(this.program,'aUV');
  this.vp=gl.getUniformLocation(this.program,'uVP');this.tex=gl.getUniformLocation(this.program,'uTexture');this.flash=gl.getUniformLocation(this.program,'uFlash');
  const columns=24,rows=32;this.grid=[];const indices=[];
  for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++)this.grid.push([x/columns,y/rows]);
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
   const a=y*(columns+1)+x,b=a+1,c=b+columns+1,d=a+columns+1;
   indices.push(a,b,c,a,c,d);
  }
  this.indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);this.indexCount=indices.length;
  this.vertices=new Float32Array(this.grid.length*5);
 }
 texture(id){
  if(this.textures.has(id))return this.textures.get(id);
  const im=fighterImage(id);if(!im?.complete||!im.naturalWidth)return null;
  const gl=this.gl,texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const result={texture,aspect:im.naturalWidth/im.naturalHeight};this.textures.set(id,result);return result;
 }
 render(fighters,vp,time){
  const gl=this.gl;gl.useProgram(this.program);gl.uniformMatrix4fv(this.vp,false,vp);
  gl.activeTexture(gl.TEXTURE0);gl.uniform1i(this.tex,0);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
  gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
  gl.enableVertexAttribArray(this.pos);gl.vertexAttribPointer(this.pos,3,gl.FLOAT,false,20,0);
  gl.enableVertexAttribArray(this.uv);gl.vertexAttribPointer(this.uv,2,gl.FLOAT,false,20,12);
  for(const f of fighters){
   const asset=this.texture(f.id);if(!asset)continue;
   const height=FIGHTER_ART[f.id].height,width=height*asset.aspect;
   for(let i=0;i<this.grid.length;i++){
    const [u,v]=this.grid[i],[x,y]=deformArt(u,v,f,time),o=i*5;
    // Source guard faces left. Mirror the entire artwork towards the opponent.
    this.vertices[o]=(f.x-576)*.014-(x-.53)*width*f.face;
    this.vertices[o+1]=f.y*.014+(.97-y)*height;
    this.vertices[o+2]=.16;this.vertices[o+3]=u;this.vertices[o+4]=v;
   }
   gl.bufferData(gl.ARRAY_BUFFER,this.vertices,gl.DYNAMIC_DRAW);gl.bindTexture(gl.TEXTURE_2D,asset.texture);
   gl.uniform1f(this.flash,Math.min(1,(f.flash||0)/.16));gl.drawElements(gl.TRIANGLES,this.indexCount,gl.UNSIGNED_SHORT,0);
  }
  gl.depthMask(true);gl.disable(gl.BLEND);
 }
}
