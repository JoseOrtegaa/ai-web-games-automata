# Huroner Survivor — estado vigente

## Objetivo / fase
Añadir números de daño y curación sutiles sin saturar la pantalla. Implementación pendiente de QA en feature/subtle-combat-numbers.

## Diseño
- Daño: número pequeño crema sobre el enemigo, asciende ~16 px y desaparece en 0,68 s.
- Curación: mismo tratamiento en verde y con prefijo + cerca del hurón.
- Golpes al mismo objetivo dentro de 0,22 s se agrupan en un único número (por ejemplo, Colmillo gemelo).
- Máximo 10 textos simultáneos; si se alcanza el límite se sustituye el más antiguo.
- Regeneración se acumula y se muestra aproximadamente cada 0,9 s, evitando un número por frame.
- Curas discretas (carne, gema de cura, sanguijuela, vitalidad/Segundo aliento) muestran la vida realmente recuperada, respetando el máximo de HP.

## Implementación
core.js: cola combatTexts, agrupación/cap, helper heal(), throttling de regen y registro de daño real.
render.js: texto flotante pequeño con contorno oscuro, crema para daño y verde para curación.
tests/core.test.js: agregación, cap y throttling/cura real.

## QA
Pendiente comprobar lógica, límites y parseo.

## Contexto preservado
Spawn midgame suavizado; jitter de embestidas corregido; arena final del inframundo integrada; 20 bosses normales; ataque automático por defecto; XP 30/70; escudo 20→120; ataque 0,25 s; zoom bloqueado.

## Siguiente paso
Ejecutar QA localizado, revisar diff, integrar en main y comprobar Pages.
