# Huroner Survivor — estado vigente

## Objetivo / fase
Suavizar ligeramente la acumulación de enemigos alrededor del nivel 23 sin nerfear el early game ni eliminar el escalado. Implementación, QA e integración en `main` completados.

## Ajuste de balance
- Niveles 1–15: generación exactamente igual.
- Niveles 16–30: incremento por nivel baja de 0,105 a 0,08 enemigos/s.
- Desde nivel 31: vuelve la pendiente original de 0,105 enemigos/s por nivel, conservando únicamente la pequeña reducción acumulada del tramo medio.
- El componente por tiempo activo (+0,0026 enemigos/s por segundo, hasta 600 s) no cambia.
- Referencia nivel 23 @300 s: 3,71 enemigos/s frente a 3,91 antes (~5,1% menos).

## Motivo
Si el jugador sube niveles rápido, el término por nivel aceleraba la aparición antes de que la horda existente se limpiara. La reducción se concentra en Profundidades/midgame y sigue siendo monotónica nivel a nivel.

## QA
PASS lógico localizado:
- tasa monotónica al menos hasta nivel 60;
- niveles 1–15 sin cambios;
- nivel 23 @300 s baja de 3,91 a 3,71 enemigos/s (~5,1%);
- desde nivel 31 vuelve la pendiente original de +0,105 enemigos/s por nivel;
- simulaciones de 20 s en niveles 20/23/25/30 permanecen finitas y acotadas;
- core.js parsea correctamente.

## Integración
PR #12 fusionado en `main` el 2026-10-03. Merge squash: `77b42d80590b416f3228343353048c3ee84644cf`.

## Contexto preservado
Jitter de embestidas corregido; arena final del inframundo integrada; 20 bosses normales (5 por mundo); familias de enemigos por mundo; cuevas 5/10→15→30; ataque automático por defecto; XP 30/70; escudo 20→120; ataque 0,25 s; zoom bloqueado.

## Siguiente paso
Validar en móvil la acumulación alrededor de nivel 23 y ajustar solo si todavía se forma demasiada horda.
