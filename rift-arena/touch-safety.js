// iOS Safari: disable accidental double-tap zoom, but keep native scrolling in menus.
// Fighting gestures run on Pointer Events and remain fully touch enabled.
export function isRepeatedTap(previous, time, x, y, thresholdMs=340, maxDistance=36){
 return Boolean(previous)
  && time-previous.time>0
  && time-previous.time<thresholdMs
  && Math.hypot(x-previous.x,y-previous.y)<maxDistance;
}
export function installZoomGuard(root, clock=()=>performance.now()){
 let previous=null;
 const cancel=e=>{if(e.cancelable)e.preventDefault();};
 root.addEventListener('dblclick',cancel,{passive:false});
 root.addEventListener('touchend',event=>{
   if(event.touches.length || event.changedTouches.length!==1){
     previous=null;return;
   }
   const finger=event.changedTouches[0];
   const now=clock();
   if(isRepeatedTap(previous,now,finger.clientX,finger.clientY)){
     cancel(event);
     previous=null;
   }else{
     previous={time:now,x:finger.clientX,y:finger.clientY};
   }
 },{passive:false});
 return ()=>previous=null;
}
