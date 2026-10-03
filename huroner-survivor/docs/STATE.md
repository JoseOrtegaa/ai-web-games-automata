# Huroner Survivor — estado vigente

## Objetivo / fase
Añadir números de daño y curación sutiles sin saturar la pantalla. Implementación, QA e integración en `main` completados.

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
PASS lógico localizado:
- Colmillo gemelo agrega dos golpes simultáneos en un solo número por enemigo;
- al expirar la ventana de 0,22 s, un golpe posterior crea un número nuevo;
- máximo global de 10 textos simultáneos;
- regeneración produce como máximo un texto visible por ciclo de ~0,9 s;
- curación muestra HP real recuperado y no el valor nominal si hay overheal;
- overkill muestra como máximo el HP restante del enemigo;
- cada texto desaparece en menos de 1 s;
- core.js y render.js parsean correctamente.

## Integración
PR #13 fusionado en `main` el 2026-10-04. Merge squash: `f3011637021d6330ec7d2e4d77de93ef47038565`.

## Contexto preservado
Spawn midgame suavizado; jitter de embestidas corregido; arena final del inframundo integrada; 20 bosses normales; ataque automático por defecto; XP 30/70; escudo 20→120; ataque 0,25 s; zoom bloqueado.

## Siguiente paso
Validar visualmente en móvil que tamaño/contraste sean suficientemente sutiles y ajustar solo presentación si hiciera falta.
