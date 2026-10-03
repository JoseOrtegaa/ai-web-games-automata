# Huroner Survivor — estado vigente

## Objetivo y fase
XP 30% directa/70% en gemas, escudo recargable/mejorable, mejoras máximas ocultas y escudo visible en la silueta. Implementado y QA local PASS; pendiente integración/publicación.

## Revisión y archivos
Base `c69a17c`, rama `feature/xp-shield-upgrades`. Cambios en core, app/HUD, i18n, art/render y pruebas `progression.test.js` / `progression-qa.cjs`. Contratos y balance en DESIGN/ARCHITECTURE.

## Decisiones duraderas
Radio de gemas 56; atracción persistente a max(300, velocidad×1,25), XP con precisión de décimas y sin agregar a gemas curativas. Escudo lleno 20; +20 capacidad/carga por rango, cinco rangos, máximo 120. Daño mitigado por armadura consume escudo y desborda a vida; espera 6 s sin daño, recarga 10% de capacidad/s. Pausa/elección congelan. Vida máxima no escala escudo. Menú filtra máximos y core rechaza selección obsoleta. Escudo azul/cobre en pata libre, emblema apagado sin carga; sin partículas nuevas.

## Completado y verificación
35 pruebas de reglas PASS. Chromium/WebKit PASS: HUD, XP al matar, mejoras máximas, escudo, pausa/elección, reset, ES/EN, layouts móvil/pequeño/escritorio, dibujo reflejado/con armadura y renderer inmutable. Evidencia en QA y progression-local.json. Sin pruebas físicas; permanece limitación de rendimiento extremo previa.

## Contexto preservado
Ruta `huroner-survivor/`, Pages desde main. Legacy en `feature/huroner-survivor-legacy`; claves `huroner-survivor-2:*` conservadas. Mundos por cada 5 niveles previamente terminados, sin cambios en esta entrega. No reabrir fases anteriores.

## Siguiente paso
Revisar diff, integrar sin sobrescribir cambios ajenos y comprobar publicación. Sin defectos abiertos.
