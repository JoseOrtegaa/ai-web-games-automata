# Huroner Survivor — estado vigente

## Objetivo / fase
Suavizar y aumentar progresivamente la generación de enemigos para evitar que el mundo 2 se sienta vacío y eliminar saltos bruscos de densidad. Implementación, QA lógico e integración en `main` completados.

## Generación normal
- Antes: intervalo dependiente casi solo del tiempo y tandas de 1/2/3/4/5 enemigos que saltaban cada 150 s.
- Ahora: `spawnRateFor(level,time)` aumenta ligeramente con **cada nivel** y también de forma continua con el tiempo activo.
- Se genera un enemigo por tick de spawn, eliminando saltos de tamaño de tanda.
- Referencias aproximadas: lvl 1 = 0,82 enemigos/s; lvl 5 @60 s = 1,40/s; lvl 10 @150 s = 2,16/s; lvl 15 @220 s = 2,86/s; lvl 20 @300 s = 3,60/s; lvl 25 @380 s = 4,33/s; lvl 30 @450 s = 5,04/s; lvl 35 @520 s = 5,74/s.
- Al entrar en una cueva se limpian las entidades del mundo anterior como antes, pero el primer spawn pasa de 0,5 s a 0,15 s para evitar una pausa artificial.
- No hay bonus discreto por mundo: la presión depende de nivel/tiempo, por lo que descender no produce un salto ni una caída artificial.

## Implementación
`core.js`: nuevas `spawnRateFor` / `spawnIntervalFor`; reemplazo de tandas por cadencia continua; reanudación rápida tras cueva.
`tests/core.test.js`: monotonicidad por nivel/tiempo y ausencia de burst.
`tests/world-progression.test.js`: reanudación de spawn tras descenso.

## QA
PASS lógico:
- tasa aumenta en cada nivel del 1 al 40;
- el tiempo activo también aumenta la presión de forma continua;
- simulaciones de 10 s en tramos 5/10/15/25/35 producen presión creciente y acotada;
- un tick de spawn crea un solo enemigo, sin ráfagas por umbral;
- descenso reanuda spawn en ≤0,15 s;
- `core.js` parsea correctamente.

No se afirma prueba física en iPhone ni ejecución de la suite Node desde checkout local en esta sesión.

## Integración
PR #9 fusionado en `main` el 2026-10-03. Merge squash: `e1473f7c40e8dcfa422bc4f7a33e3e04639e24b9`.

## Contexto preservado
20 bosses normales: 5 por mundo, más rey final de 600 s. Familias normales distintas por mundo. Cuevas: primera bajada tras boss 5/10 aleatorio, siguientes tras 15/30. Modo DEV `?dev=1`. Ataque automático por defecto. XP 30/70 con remanente redondeado; escudo 20→120; ataque 0,25 s; zoom bloqueado.

## Siguiente paso
Validar sensación de densidad en móvil, especialmente tras la primera bajada y en los niveles 20–35; ajustar solo la pendiente si hiciera falta.
