# QA vigente — evolución del mundo

Base: `7ad600cd`. PASS local Chromium 134 y WebKit 18.4. Verificados umbrales 5/10/15/20/25/30, estabilidad dentro de etapa, etapas distintas hasta 35, fundido, congelación con tiempo pausado, reinicio, movimiento reducido y ausencia de mutación de Game. Capturas móviles y escritorio inspeccionadas: actores, gema, pickup y aviso legibles. [Resultados](world-local.json). Sin cambios de gameplay; no se repite la suite de combate. Publicación PASS: commit `67c5458b`, [Pages 37078325776](https://github.com/JoseOrtegaa/ai-web-games-automata/actions/runs/37078325776) success. [Humo público](world-public.json): app cambia el mundo de nivel 4 a 5, HUD actualizado, pausa/reanudación y recursos sin errores. Selección de nivel instrumentada solo en el navegador de pruebas; certificado del proxy aceptado, sin validar TLS.

## Evidencia de entregas anteriores

# Huroner Survivor — QA del traslado

Base: 1e30b200. Juego anterior archivado en `feature/huroner-survivor-legacy`. Traslado íntegro a `huroner-survivor/`; runtime de simulación/render/input/audio/storage sin cambios. Humo local PASS en Chromium 134 y WebKit 18.4: una entrada de catálogo, recursos y módulos relativos, nombre sin sufijo, ajustes/récord existentes, inicio, ataque manual, pausa/reanudación y cero errores de red/página. [Resultado](promotion-local.json). Publicación PASS: commit `bc78b15f`, [Pages 37076932423](https://github.com/JoseOrtegaa/ai-web-games-automata/actions/runs/37076932423) success. Humo público en Chromium/WebKit con los mismos criterios PASS; [evidencia](promotion-public.json). URL canónica: https://joseortegaa.github.io/ai-web-games-automata/huroner-survivor/. Se acepta el certificado del proxy del entorno: no es una validación TLS.

## Evidencia histórica de la edición renovada
Lo siguiente corresponde al desarrollo y publicación previos bajo la ruta `huroner-survivor-2/`. Las referencias V1 intacta y ambas URLs describen aquel estado, no la estructura actual. Los JSON de resultados previos se conservan sin alterarlos.

# Huroner Survivor 2 — QA

## Veredicto local
Matriz funcional PASS: 45 comprobaciones en cuatro perfiles, recuperadas de la ejecución independiente anterior. Revisión: V2 añadida sobre base 40dbf924; integración sobre main b32337f6. Arquitectura y dirección visual completadas. Último defecto corregido: panel de ajustes recortado en horizontal. Retest PASS en ambos navegadores a 844×390, 320×568 y 390×844; cabecera accesible y botón alcanzable mediante scroll, pausa/reanudación intactas. Publicación verificada: PASS.

## Criterios y evidencia
| Criterio | Resultado observado |
| --- | --- |
| A1 Reglas | 18 casos heredados y 9 regresiones nuevas de terminal/almacenamiento/recarga pasan; contenido y balance preservados. |
| A2 Presentación | Inspección de portada, arena poblada, elección, pausa y terminales. Arte propio coherente; corregidos suelo con costuras y pasada duplicada de gemas. |
| A3 Controles | Ataque cercano, auto/manual, recarga compartida, teclado, drag, cancelación, pausa y elección PASS. Dos contactos simultáneos mediante CDP Chromium PASS; touch-action none durante combate. |
| A4 Adaptación | Chromium 134.0.6998.35 y WebKit 18.4, 390×844 DPR3 y 1440×1000 DPR1. Comprobaciones adicionales 320×568 y 844×390; panel horizontal corregido y retest PASS. |
| A5 Estructura | Revisión arquitectónica PASS: simulación, render, input, audio y persistencia separados; imports locales; sin dependencias runtime. |
| A6 Aislamiento | Claves de V2 independientes; preferencias ES/EN, sonido y lado persistidas. V1 sin cambios; catálogo añade enlace propio. |
| A7 Carga | Cero errores bloqueantes de consola/red en los cuatro perfiles locales. Humo público PASS. |

Identidad de archivos tras actualizar rutas y nombre (misma lógica jugable): [tested-files.json](tested-files.json), SHA-256 de código/recursos. Retest localizado: [layout-results.json](layout-results.json).

Resultados medidos: [browser-results.json](browser-results.json). Fixture de navegador: [browser-qa.cjs](../tests/browser-qa.cjs); intercepta app.js solo en pruebas para acceder a Game, sin hooks en producción. Victoria y escenas pobladas se preparan con fixture; no equivalen a jugar diez minutos manualmente.

Reproducción: `npm test`; servir la raíz por HTTP y ejecutar `node tests/browser-qa.cjs` con Playwright 1.51.1 y Chromium/WebKit instalados en el entorno de QA. Admite `QA_BASE_URL`, `QA_OUTPUT` y `CHROMIUM_EXECUTABLE`. Playwright es herramienta externa de QA, no dependencia del juego.

## Limitaciones materiales
No se probaron teléfonos físicos ni audio percibido. WebKit Linux no demuestra compatibilidad íntegra con Safari iPhone. El zoom se comprueba por política de entrada y gestos automatizados, pendiente confirmación física.

Carga sintética extrema, 170 enemigos visibles y 350 gemas durante ~3 s:
| Perfil | Media ms/frame | p95 ms/frame |
| --- | ---: | ---: |
| Chromium móvil | 36,2 | 50,0 |
| Chromium escritorio | 29,4 | 33,4 |
| WebKit móvil | 99,1 | 154,0 |
| WebKit escritorio | 74,5 | 88,0 |

Entidades acotadas y ejecución estable; no se alcanzan 60 fps en esta carga headless. El PASS funcional no es un PASS de rendimiento ni una medida de un teléfono real. Mejorar rendimiento con cargas densas queda como limitación conocida, sin alterar balance para ocultarla.

## Publicación
Commit de juego: `51b61920a9b27a8163af70bbdd49a1ed2623427c`. [Pages 37073839721](https://github.com/JoseOrtegaa/ai-web-games-automata/actions/runs/37073839721): success.

URL verificada: https://joseortegaa.github.io/ai-web-games-automata/huroner-survivor-2/ el 2026-10-02 22:42 UTC. Catálogo, ilustración cargada, inicio, HUD, pausa y reanudación PASS; sin errores de página/red. Navegador del entorno acepta el certificado del proxy: esta comprobación no valida TLS. [Resultado público](public-results.json).


## 2026-10-03 — XP repartida, escudo y límites de mejoras

**PASS local.** Base `c69a17c`, rama `feature/xp-shield-upgrades`; revisión propia, sin agentes adicionales.

- `node --test tests/*.test.js`: cuatro archivos PASS; `node --test --test-isolation=none tests/*.test.js`: 35 casos PASS.
- Nuevos criterios: XP 30/70 para especies/jefes, avance sólo matando y conservación de décimas; gemas saturadas sin mezclar curación; atracción persistente incluso con velocidad máxima/aceite.
- Escudo inicial 20, mitigación previa, absorción y excedente, invulnerabilidad, demora 6 s, recarga 10%/s, pausa/elección, cinco mejoras de +20, independencia de vida y reset.
- Máximos fuera de ofertas, última mejora válida, selección obsoleta rechazada y curación al agotar catálogo. Regresiones terminales adaptan el escenario sin escudo para seguir aislando daño letal.
- `tests/progression-qa.cjs` con Playwright 1.51.1 externo: Chromium 134.0.6998.35 y WebKit 18.4 PASS. HUD real, nivel por baja, congelación, mejora de escudo y exclusión de agotadas, reinicio, ES/EN, layouts 390×844, 320×568 y 1440×1000, renderer inmutable. Sin errores de página/recursos.
- Revisión visual de capturas: escudo azul/cobre sobre pata libre, espada/cara visibles; ambas orientaciones, armadura y emblema sin carga. Barra azul sobre vida, elección legible. Resultados reproducibles en `progression-local.json`; capturas temporales `/tmp/huroner-progression-qa/`.
- No se han realizado pruebas físicas de iPhone/Android. Sin cambios en cadencia, enemigos ni mundos.

Publicación verificada: commit `7903e2b3b5415df74a4d1eb777906fff6546b857`, Pages `37117269702` success. Siete archivos desplegados coinciden byte por byte con los probados. Humo público Chromium/WebKit PASS: arranque, escudo 20/20, pausa/reanudación y carga sin errores. Ver `progression-public.json`.


## 2026-10-03 — Diez bosses distintos

**PASS local** sobre base `2a788f2`, implementación en `feature/ten-bosses`; revisión propia, sin delegación.

- `node --test tests/*.test.js`: 5 archivos PASS (51 casos, incluidos 16 nuevos). Pruebas del catálogo entero, aleatoriedad/umbrales, scaling y coexistencia. Gemelos: dos órdenes de muerte, HP sumada con máximo estable, un evento/una recompensa. Codorniz: aviso láser/dirección, daño/escape, espera de cura y reinicio al recibir golpes. Pollo: inmunidad, auxiliar correcto, desbloqueo permanente y sin desbloquear otro pollo.
- Ataques diferenciados: espada/magia, carga dirigida, bombas escalonadas, telarañas persistentes, anillo con centro seguro, guadaña de retorno, cono sostenido y rayos. Impacto real y esquiva de embestida/proyectiles; peligros no dañan durante aviso. Pausa/elección, cancelación por muerte, terminal irreversible, reset y límites 64 peligros/150 disparos. Simulación de dos minutos con diez encuentros coexistentes sin estados no finitos.
- `tests/bosses-qa.cjs`, Playwright 1.51.1 externo: Chromium 134.0.6998.35 y WebKit 18.4 PASS. Diez escenas de aviso/ataque, barra única de gemelos al morir uno, feedback de escudo roto, pausa real, nombres/consejos ES/EN, HUD a 320×568 y 1440×1000, catálogo de doce cuerpos y renderer inmutable. Sin errores de página/recursos.
- Revisión de capturas: siluetas diferenciadas (caballero/mago, cristal, gran escudo y conejo azul, cornamenta, mortero, ocho patas, campana, guadaña, tres colas, alas/corona); avisos coral discontinuos y daño sólido. Capturas temporales `/tmp/huroner-bosses-qa/`, resultados duraderos `bosses-local.json`. No pruebas físicas iPhone/Android; balance subjetivo pendiente de partidas del usuario.

Pendiente publicación y humo público.
