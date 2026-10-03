# Huroner Survivor — estado vigente

## Objetivo / fase
Diez encuentros de boss diferentes física y mecánicamente, uno aleatorio cada cinco niveles. Implementación y QA local PASS; publicación pendiente. No repetir diseño ni revisión de XP/escudo previa.

## Revisión / archivos
Base `2a788f2`, rama `feature/ten-bosses`. Nuevos `bosses.js`, `boss-art.js`, `docs/BOSSES.md`, `tests/bosses.test.js`, `tests/bosses-qa.cjs`; integración acotada en core/render/app/HUD. Evidencia `bosses-local.json` y QA.

## Decisiones
Catálogo: gemelos espada/magia; codorniz láser + cura tras 3 s sin golpes; pollo protegido por conejo azul; liebre cornuda; sapo bombardero; araña; tortuga campanera; cuervo con guadaña de retorno; zorro con cono de fuego; búho con rayos. Evitar repetición inmediata. Gemelos: HP repartida, máximo de barra estable, una baja y 20 XP al morir ambos. Conejo auxiliar no es boss y romper escudo es permanente/sólo para su dueño. Avisos ≥0,75 s, direcciones/puntos fijados, 64 peligros y 150 disparos máximo. Atacan/curan sólo en tiempo activo; muerte cancela peligros del dueño. Final de 600 s conservado. Arte vectorial propio, sin dependencias nuevas.

## Completado / QA
51 pruebas (5 archivos) PASS. Chromium/WebKit: diez escenas, gemelos/escudo/HUD, pausa, ES/EN, móvil/pequeño/escritorio, siluetas e inmutabilidad del renderer. Simulación de coexistencia de dos minutos con límites intactos. Sin errores bloqueantes; no dispositivos físicos. Balance subjetivo se ajustará según partidas reales.

## Contexto preservado
Ruta canónica `huroner-survivor/`, Pages desde main. XP 30/70; escudo del jugador 20→120, recarga 6 s + 10%/s; mejoras máximas filtradas. Mundos cada 5 niveles, ataque compartido 0,25 s y zoom bloqueado. Claves `huroner-survivor-2:*` y legacy conservados.

## Siguiente paso
Integrar sin pisar cambios ajenos; comprobar Pages y humo público. Sin defectos abiertos.
