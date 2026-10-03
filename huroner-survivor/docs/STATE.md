# Huroner Survivor — estado vigente

## Objetivo / fase
Añadir familias de enemigos normales distintas para cada mundo, eliminando la antigua escalada visual repetitiva de la superficie. Implementación, QA lógico e integración en `main` completados.

## Familias
- Superficie: conejo, liebre, codorniz y pollo actuales; una sola evolución desde nivel 5.
- Subsuelo: calavera ósea, esqueleto espada, esqueleto arquero con proyectiles de hueso y conejo esquelético. Evolución en torno a nivel 12; humanos cambian físicamente y la calavera pasa de embestir a explotar.
- Profundidades: guerrero de roca, arquero de roca, conejo pétreo y jabalí de roca. Evolución visual desde nivel 25.
- Magma: guerrero calcinado, arquero de brasas, bestia de lava y calavera de magma explosiva. Evolución visual desde nivel 35.

## Implementación
`enemies.js`: rosters, stats, evolución, XP y estilos de ataque.
`core.js`: spawn por `worldDepth`, especiales genéricos (salto/fan/área/embestida/lunge/disparo/explosión) y proyectiles temáticos.
`art.js`: siluetas vectoriales propias por familia.
`render.js`: telegráficos y proyectiles hueso/roca/brasa, partículas y manchas por material.
`tests/enemy-families.test.js` + adaptación de `core.test.js`.

## QA
PASS lógico:
- superficie limitada a tier 1 y especiales bloqueados antes de nivel 5;
- 12 enemigos de capas inferiores activan el ataque esperado;
- arqueros disparan hueso/roca/brasa respectivamente;
- calavera ósea evoluciona de embestida con empuje a explosión;
- humanos óseos conservan arma/ataque al evolucionar;
- simulación corta estable en las cuatro capas;
- core/enemies/art/render parsean correctamente.

No se afirma prueba física en iPhone ni validación visual con navegador automatizado en esta sesión.

## Integración
PR #7 fusionado en `main` el 2026-10-03. Merge squash: `af40e71d08b574ffcf08873ff8754fbf74215b8c`.

## Contexto preservado
Mundos conectados por cuevas: primera bajada aleatoria tras boss 5/10, siguientes tras 15/30; fases visuales 20/25/35. Modo DEV por `?dev=1`. Ataque automático por defecto. Bosses cada 5 niveles y sistema de bosses sin cambios. XP 30/70 y remanente redondeado a una décima; escudo 20→120; ataque 0,25 s; zoom bloqueado.

## Siguiente paso
Probar visualmente cada roster en móvil y ajustar lectura/tamaño/contraste si alguna silueta o telegráfico lo necesita.
