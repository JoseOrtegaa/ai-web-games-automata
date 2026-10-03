# Huroner Survivor — estado vigente

## Objetivo / fase
Convertir el boss final en un encuentro realmente final: acceso al inframundo, arena propia, pocos esbirros y tres fases de ataques combinados. Implementación, QA lógico e integración en `main` completados.

## Flujo final
- A los 10:00 ya no aparece el rey directamente: se abre una grieta/cueva final con flecha.
- Al acercarse, el botón cambia a **BAJAR AL INFRAMUNDO**.
- Al entrar se limpia el mapa anterior y se inicia una arena circular independiente (finalArena, radio 285).
- Rey único con arte propio underworld_king; +18% HP adicional respecto al escalado final anterior.
- Máximo 4 esbirros magma, aproximadamente uno cada 4,2 s; sin pickups periódicos.
- DEV ?dev=1: botón **FINAL** entra directamente a la arena.

## Dificultad del rey
- Fase I (100–70%): cinco ataques del rey en ciclo.
- Fase II (70–35%): ataque principal + tres marcas infernales simultáneas; cadencia ~2,55 s.
- Fase III (≤35%): lo anterior + anillo expansivo + dos carriles fijados; cadencia ~2,15 s.
- Todos los patrones nuevos tienen telegráfico; no se aumenta el daño bruto de forma equivalente.

## Implementación
core.js: puerta final, entrada, límites físicos de arena, HP extra, spawn reducido y DEV final.
bosses.js: fases II/III y patrones simultáneos.
world.js: stage 40 inframundo.
boss-art.js: Rey del Inframundo único y paleta final.
render.js: portal final y borde de arena.
app.js / i18n.js / index.html: UX, textos ES/EN y botón DEV.
Tests actualizados para flujo 10:00, fases, límites y minions.

## QA
PASS lógico:
- 10:00 abre portal sin spawnear al rey;
- entrar crea un único rey final con tema/forma propios;
- arena confina jugador y rey;
- máximo 4 esbirros y todos usan familia magma;
- fase II genera 4 hazards simultáneos y fase III 7 en el escenario comprobado;
- todos los hazards añadidos nacen con edad negativa/aviso previo;
- muestreo espacial de fase III conserva zonas de escape en todos los instantes comprobados (peor muestra: 146/197 puntos seguros);
- stage de inframundo = 40 sin convertirlo en un quinto worldDepth;
- core/bosses/world/boss-art/render/app parsean;
- todos los IDs DOM literales usados por app existen.

No se afirma prueba física en iPhone ni ejecución Playwright local en esta sesión.

## Integración
PR #10 fusionado en `main` el 2026-10-03. Merge squash: `bd0c05f460fe09b36fc728d8fee54e318eda0056`.

## Contexto preservado
20 bosses normales: 5 por mundo. Generación normal gradual por nivel + tiempo. Familias normales distintas por mundo. Cuevas: primera bajada tras boss 5/10 aleatorio, siguientes tras 15/30. Ataque automático por defecto. XP 30/70; escudo 20→120; ataque 0,25 s; zoom bloqueado.

## Siguiente paso
Probar físicamente el boss final en móvil con DEV → FINAL y ajustar únicamente telegráficos/cadencia si la fase III resulta demasiado fácil o demasiado punitiva.
