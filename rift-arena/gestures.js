// Normaliza deslizamientos sin depender de APIs específicas de iOS.
export const SWIPE_MIN=30;
export function movementFromDrag(dx,dy){
  const horizontal=Math.abs(dx)>20;
  return {
    left:horizontal&&dx<0,
    right:horizontal&&dx>0,
    jump:dy < -42 && Math.abs(dy)>Math.abs(dx)*1.3,
    crouch:dy>34&&Math.abs(dy)>Math.abs(dx)*.75,
    block:dy>34&&Math.abs(dy)>Math.abs(dx)*.75
  };
}
export function strikeFromSwipe(dx,dy,elapsedMs=120){
  const ax=Math.abs(dx),ay=Math.abs(dy);
  if(Math.hypot(dx,dy)<SWIPE_MIN) return elapsedMs>=380?'block':'punch';
  if(ax>=44&&ay>=38&&ay<ax*1.8)return 'special';
  if(ay>ax*1.1)return dy<0?'uppercut':'sweep';
  return 'kick';
}
