# Huroner Survivor — estado vigente

## Objetivo / fase
Evitar que las hordas numerosas colapsen visualmente en una sola pila de sprites sin reducir el límite global ni rebajar la presión del juego. Implementación, QA lógico e integración en `main` completados.

## Revisión
PR #2 fusionado en `main` el 2026-10-03. Merge squash: `fe6025a07ff9c59c99736c56209870edb6ba6843`. Archivos funcionales afectados: `core.js` y `tests/core.test.js`.

## Decisiones
Se mantienen el límite ordinario de 170 enemigos, vida, daño, XP, bosses y cadencia de spawn. La solución combina:
- spawn ponderado por 8 sectores alrededor del jugador, evitando sectores localmente saturados;
- offsets de aproximación por enemigo únicamente cuando hay al menos 6 enemigos ordinarios a <180 px del jugador;
- separación suave mediante grid espacial, con prioridad para bosses/auxiliares para no desplazar sus mecánicas;
- recolocación de enemigos muy lejanos usando la misma distribución por sectores.

No hay colisiones rígidas ni reducción artificial de enemigos. Con pocos enemigos se conserva la persecución directa previa.

## QA
QA localizado sobre el código real de la rama: 42/42 pruebas lógicas PASS:
- `core.test.js`: 20/20, incluidas las dos regresiones nuevas y stress de 10 minutos;
- `bosses.test.js`: 16/16;
- `boss-expansion.test.js`: 6/6.

La primera pasada detectó que el offset afectaba a un enemigo aislado; se corrigió activándolo solo bajo densidad real y la segunda pasada quedó completa en PASS. No se afirma prueba física en iPhone.

## Contexto preservado
Bosses: HP +30→50% y dos ataques nuevos por actor ya integrados. XP 30/70; escudo 20→120; ataque 0,25 s; mundos cada 5 niveles; zoom bloqueado. Ruta canónica `huroner-survivor/`.

## Siguiente paso
No repetir implementación. Probar la sensación de densidad en una partida real (especialmente niveles 20+) y ajustar únicamente si la horda queda demasiado abierta o sigue formando pilas locales. La comprobación remota de Pages quedó limitada porque el entorno no pudo abrir la URL pública.
