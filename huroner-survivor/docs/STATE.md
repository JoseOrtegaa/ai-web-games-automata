# Huroner Survivor — estado vigente

## Objetivo / fase
Subir la HP de todos los bosses 30–50% y añadir dos ataques distintos a cada actor, incluido el rey final. Implementación, QA lógico y QA visual Chromium completos. Publicación bloqueada por revisión automática: requiere autorización explícita de Jose para integrar en main y actualizar el juego público.

## Revisión / archivos
Base `ee1ff19`, rama `feature/boss-health-attacks`. Cambios en bosses/core/boss-art/render, pruebas boss-expansion y documentación BOSSES. Trabajo previo de diez encuentros publicado y conservado.

## Decisiones
10 encuentros aleatorios cada 5 niveles + rey final a 600 s. 24 ataques añadidos: dos por cada hermano gemelo, dos por otros nueve y dos del rey. Ciclo original→nuevo 1→nuevo 2; rey carga/anillo/ráfaga→nuevos. Bonus HP sobre fórmula anterior: +30% hasta nivel 5, +1 punto porcentual por nivel hasta +50% en 25. Snapshot al aparecer; gemelos comparten total, auxiliar sin bonus. Sin cambiar XP, cadencia jugador, escudos ni recompensas. Avisos fijos ≥0,85 s; efectos 64/150; pausa/terminales conservados. Catálogo detallado en BOSSES.md.

## Completado / QA
57 pruebas lógicas PASS, incluidos escalado, 24 ataques/avisos/daño/esquiva, rotación, congelación, cancelación, límites y regresiones del juego. Chromium móvil PASS: 24 escenas aviso/ataque, renderer inmutable, pausa y límites; sin errores. Evidencia boss-expansion-local.json. WebKit bloqueado por bibliotecas del sistema ausentes; sin pruebas físicas.

## Contexto preservado
Ruta canónica `huroner-survivor/`, Pages desde main. XP 30/70; escudo jugador 20→120, recarga 6 s + 10%/s; máximos filtrados. Mundos cada 5 niveles, ataque 0,25 s, zoom bloqueado y claves históricas conservadas.

## Siguiente paso
Diff revisado. Rama feature/boss-health-attacks lista para revisión. Solicitar autorización explícita para integrar en main y actualizar Pages; después comprobar el despliegue y el contenido público. No volver a implementar ni repetir QA aprobado.
