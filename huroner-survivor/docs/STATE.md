# Huroner Survivor — estado vigente

## Objetivo y fase
Mundo más tétrico cada cinco niveles. Implementado y QA local PASS; publicación pendiente. Cambio exclusivamente visual; no repetir diseño ni pruebas de combate ya cerradas.

## Revisión y archivos
Base remota: 7ad600cd4a630176f63cfd22a8a064f9294c6441. `world.js` genera/cachea etapas; `render.js` delega fondo usando nivel y tiempo del Game. Contratos y dirección actualizados en ARCHITECTURE/DESIGN; prueba reproducible `tests/world-qa.cjs` con Playwright externo.

## Decisiones
5: raíces secas; 10: cementerio; 15: osario/grietas; 20: ruinas; 25: abismo. Múltiplos posteriores redistribuyen motivos y oscurecen con límite. Fundido de 1,8 s de simulación, congelado en pausa/elección, inmediato con movimiento reducido. Menú/reinicio vuelve a pradera. Solo dos tiles como máximo; no nuevos objetos de simulación ni cambios de dificultad.

## Verificación y límites
Chromium/WebKit PASS: umbrales, etapas, transición/pausa, reset, movimiento reducido, Game inmutable, recursos sin errores y capturas móvil/escritorio. Evidencia en QA.md. Sin pruebas físicas; sigue vigente la limitación de rendimiento bajo carga extrema del juego previo.

## Contexto duradero
Ruta canónica `huroner-survivor/`. Legacy archivado en `feature/huroner-survivor-legacy`. Conservar claves de almacenamiento `huroner-survivor-2:*` para mantener ajustes/récords. No hay carpeta V2 en main.

## Siguiente paso
Integrar y comprobar Pages y cambio de mundo en la URL pública. Después registrar revisión y resultado; no repetir fases anteriores.
