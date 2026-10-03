# Huroner Survivor — estado vigente

## Objetivo / fase
Evitar que las hordas numerosas colapsen visualmente en una sola pila de sprites sin reducir el límite global ni rebajar la presión del juego. Implementación en rama completada; QA e integración pendientes.

## Revisión
Rama `feature/horde-spacing` sobre `main`. Archivos afectados: `core.js`, `tests/core.test.js` y este STATE.

## Decisiones
Se mantienen el límite ordinario de 170 enemigos, vida, daño, XP, bosses y cadencia de spawn. La solución combina tres reglas localizadas:
- spawn ponderado por 8 sectores alrededor del jugador, evitando sectores localmente saturados;
- objetivo cercano desplazado por enemigo al aproximarse al jugador, para que no todos persigan el mismo píxel;
- separación suave mediante grid espacial, con prioridad para bosses/auxiliares para no desplazar sus mecánicas.

No hay colisiones rígidas ni límite artificial de densidad. El sistema queda preparado para que futuros arquetipos puedan reutilizar o sustituir sus preferencias de distancia.

## QA previsto
Pruebas nuevas: distribución de spawn lejos de sectores saturados y dispersión de una pila melee densa. Mantener suite existente, incluido stress de 10 minutos y límites de entidades. Después revisar diff, integrar en `main` y verificar Pages.

## Contexto preservado
Bosses: HP +30→50% y dos ataques nuevos por actor ya integrados. XP 30/70; escudo 20→120; ataque 0,25 s; mundos cada 5 niveles; zoom bloqueado. Ruta canónica `huroner-survivor/`.

## Siguiente paso
Ejecutar QA de la rama. Si pasa, fusionar/publicar y hacer humo remoto del enlace jugable. No repetir análisis ni cambiar balance ajeno a la densidad de horda.
