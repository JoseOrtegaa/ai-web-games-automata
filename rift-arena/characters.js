// Approved raster references shared by selector, WebGL and Canvas fallback.
import {FIGHTER_ART,portraitUrl,renderArt2D} from './fighter-art.js';
export const DESIGNS=FIGHTER_ART;
export function portraitSvg(def){
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 470" role="img" aria-label="${def.name}, ${FIGHTER_ART[def.id].species}"><image href="${portraitUrl(def.id)}" x="-100" y="-22" width="600" height="800" preserveAspectRatio="xMidYMin slice"/></svg>`;
}
export function renderCharacter(ctx,f,t,ground){renderArt2D(ctx,f,t,ground);}
