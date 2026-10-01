# Huroner Survivor — Agent Guide

## Stack
Juego web vertical sin framework ni build. Usa HTML5, CSS, JavaScript ES Modules, Canvas 2D y Web Audio. Estado persistente simple con `localStorage`. Tests con Node `node:test`. Publicación directa en GitHub Pages.

## Arquitectura
- `index.html`: estructura de pantallas, HUD, configuración y controles.
- `style.css`: layout móvil, HUD, modales, joystick y botón de ataque.
- `core.js`: simulación pura/determinista. Player, enemigos, XP, niveles, mejoras, bosses, pickups, daño, proyectiles y victoria/derrota.
- `app.js`: render Canvas, input táctil/teclado, audio, traducciones ES/EN, navegación de pantallas, configuración y sincronización con `core.js`.
- `tests/core.test.js`: pruebas de la lógica de juego.

## Gameplay actual
Supervivencia de 10 minutos. El hurón gana XP, sube de nivel y elige mejoras. Hay bosses cada 5 niveles y un boss final a los 10 minutos. Enemigos mutan por nivel. Pickups: carne (+3 HP), aceite de salmón (+10% velocidad/20s) y fuego (+35% daño/15s). Ataque configurable: automático o botón; el botón puede estar a izquierda/derecha. “Colmillo Gemelo” duplica cada ataque. Preferencias, idioma, sonido y récord se guardan en `localStorage`.

## Para modificar
Cambios de reglas/estadísticas: `core.js` + test correspondiente. UI/controles/render: `app.js`, `index.html`, `style.css`. Evita mezclar lógica de juego en la UI. Mantén límites de entidades y comportamiento móvil. Ejecuta siempre:

```bash
cd huroner-survivor
npm test
```

No añadas dependencias salvo necesidad explícita.
Prohibido el zoom del navegador durante la partida.
