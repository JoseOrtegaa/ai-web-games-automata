# Huroner Survivor — estado vigente

## Objetivo / fase
Añadir un modo desarrollador aislado para acelerar pruebas sin recorrer manualmente niveles 1→25. Implementación, QA lógico e integración en `main` completados.

## Activación
El modo DEV se activa únicamente mediante `?dev=1` en la URL. No se usa una clave embebida porque el cliente web es público y cualquier secreto incluido en JavaScript sería inspeccionable. Sin el parámetro no aparece ninguna herramienta DEV.

## Controles DEV
Panel compacto y plegable:
- nivel `-1`, `+1`, valor directo y presets 5/10/15/20/25;
- Daño (`power`) +1 o MAX (8/8);
- Regeneración (`regen`) +1 o MAX (4/4);
- CURAR restaura HP y escudo;
- BOSS genera un encuentro aleatorio escalado al nivel actual.

Un salto de nivel fija nivel/mutación/mundo, limpia la escena de combate anterior y deja que los nuevos enemigos aparezcan con el tier seleccionado. No abre selección de mejora ni entrega XP. Los récords no se guardan durante una sesión DEV.

## Integración
PR #4 fusionado en `main` el 2026-10-03. Merge squash: `60fca1e30291df2f0d1b9ddad031b151cef6edb4`.

## Archivos
`core.js`: operaciones deterministas de debug.
`app.js`: gate por URL, wiring y exclusión de récord.
`index.html` / `style.css`: panel DEV oculto para juego normal.
`tests/core.test.js`: regresión de controles DEV.

## QA
PASS:
- core: 21/21;
- bosses: 16/16;
- expansión de bosses: 6/6;
- storage: 4/4;
- geometría de flecha: 2/2;
- sintaxis app/render y correspondencia de IDs DEV: PASS.
No se afirma prueba física en iPhone.

## Contexto preservado
Ataque automático por defecto para usuarios nuevos; flecha de boss fuera de pantalla. Hordas distribuidas con límite 170. Bosses HP +30→50% y ataques ampliados. XP 30/70; escudo 20→120; ataque 0,25 s; mundos cada 5 niveles; zoom bloqueado.

## Siguiente paso
Usar la URL DEV para pruebas rápidas. No exponer el panel en la URL normal. Ajustar herramientas únicamente cuando aparezca una necesidad real de QA.
