# Huroner Survivor — estado vigente

## Objetivo / fase
Aumentar la HP de todos los bosses entre 30% y 50% según el nivel del hurón y añadir dos ataques distintos a cada boss, incluido el rey final. Implementación, QA lógico, QA visual Chromium e integración en `main` completados.

## Integración
PR #1 fusionado en `main` el 2026-10-03. Merge commit: `e2c61df4856606d953d40ddf6f2e7baea1f37253`.
Rama de trabajo: `feature/boss-health-attacks`.
El juego público usa `main` como fuente de GitHub Pages.

## Decisiones
10 encuentros aleatorios cada 5 niveles + rey final a 600 s. 24 ataques añadidos: dos por cada hermano gemelo, dos por los otros nueve encuentros y dos del rey. Ciclo original → nuevo 1 → nuevo 2; rey conserva sus tres ataques originales antes de los dos nuevos.

Bonus HP sobre la fórmula anterior: +30% en nivel 5, +1 punto porcentual por nivel hasta +50% desde nivel 25. El valor se fija al aparecer el boss; subir de nivel durante el combate no lo cura. Los gemelos comparten el total y el conejo auxiliar del Pollo Bastión conserva su HP propia.

Sin cambios en XP, recompensas, escudo del jugador ni cadencia de ataque. Avisos de ataques y límites de hazards/proyectiles conservados.

## Completado / QA
57 pruebas lógicas PASS. Chromium móvil PASS con 24 escenas de aviso/ataque, pausa real y renderer inmutable; sin errores de página/recursos. Evidencia en `docs/boss-expansion-local.json`.

WebKit/iPhone físico no quedaron validados por las dependencias del entorno de pruebas; el balance subjetivo queda para partidas reales.

## Contexto preservado
Ruta canónica `huroner-survivor/`. XP 30/70; escudo jugador 20→120, recarga 6 s + 10%/s; máximos filtrados. Mundos cada 5 niveles, ataque 0,25 s, zoom bloqueado y claves históricas conservadas.

## Siguiente paso
No repetir implementación ni merge. Probar balance en partida real, especialmente niveles 15–25+, y ajustar únicamente si los bosses quedan demasiado fáciles o demasiado duros.
