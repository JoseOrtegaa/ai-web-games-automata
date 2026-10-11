# Rift Arena

Prototipo gratuito y original de lucha arcade **1 contra 1**. Se publica directamente desde esta carpeta en GitHub Pages, sin backend, dependencias ni coste.

## Jugar

1. Elige entre Kira, Volt, Onyx y Ember; selecciona jugador 1 y rival.
2. Escoge **VS CPU** o **2 jugadores** (mismo teclado, en ordenador).
3. El primero en ganar dos rondas se lleva el combate. Cada ronda dura 75 segundos.
4. Puñetazos, patadas, salto, cobertura y especial que consume 40 puntos de energía. La energía se recupera peleando.

| Acción | Jugador 1 | Jugador 2 |
| --- | --- | --- |
| Mover | A / D | ← / → |
| Saltar | W | ↑ |
| Cubrir | S | ↓ |
| Puño | F | J |
| Patada | G | K |
| Especial | H | L |

En móvil hay controles táctiles para el jugador 1, pensados para jugar **contra la CPU**. Se recomienda orientación horizontal.

## Tecnología y QA

Canvas 2D, HTML, CSS y módulos de JavaScript nativos. Sin frameworks, servicios externos ni compras. Los luchadores y fondos son arte vectorial original dibujado en tiempo real. Para ejecutar en local desde la raíz del repositorio: python3 -m http.server 8000. Para lógica de combate: node --test rift-arena/tests/*.test.mjs.

**Estado:** primera versión jugable 2D. No incluye todavía combos direccionales complejos, mando físico, modo en línea ni personajes 3D.
