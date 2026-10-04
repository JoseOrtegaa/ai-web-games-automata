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

Publicación verificada en `c9cd1f8b11dd23406935f966a6b42edffb4f0a22`; Pages `37133803328` success. Nueve archivos runtime públicos idénticos byte por byte a los probados. Humo público en Chrome: inicio, HUD 20/20 y 100/100, pausa/reanudación PASS. Sin errores propios de la página en la consola observada; errores de metadatos de la extensión del navegador excluidos. Evidencia `bosses-public.json`.


## 2026-10-03 — Vida y dos ataques adicionales por boss

**PASS lógico y Chromium móvil.** Base `ee1ff19`, rama `feature/boss-health-attacks`; revisión propia, sin delegación.

- `node --test --test-isolation=none tests/*.test.js`: 57 casos PASS. Seis casos nuevos recorren todo el catálogo: HP +30–50% sobre fórmula anterior (niveles 1/5/10/15/20/25/50/100), total de gemelos, rey final y auxiliar sin bonus; no curación al subir de nivel.
- Los 24 ataques nuevos son alcanzables en el ciclo; advertencia previa, geometría fija, daño efectivo y salida segura. Proyectiles, carga y saltos probados con impacto real y esquiva lateral. Pausa/elección, cancelación por muerte, límites 64/150. Regresiones: 10 minutos simulados, convivencia, escudos, XP, controles y terminales.
- `tests/core.test.js` adapta la prueba de las tres habilidades del rey a su nueva rotación/aviso, conservando aserciones de cantidad de proyectiles y carga.
- `tests/boss-expansion-qa.cjs`: Chromium 134.0.6998.35, Playwright 1.51.1 externo, viewport 390×844. 24 escenas de aviso y ataque, renderer inmutable, efectos acotados y pausa real PASS; sin errores de página ni recursos. Evidencia en `boss-expansion-local.json`; capturas temporales `/tmp/huroner-boss-expansion/`. Revisión visual de ácido/fuego, cristales/veneno, cruces, saltos y ondas. Se amplía radio inicial de dos ondas para que sus avisos no queden tapados por el cuerpo.
- WebKit BLOCKED: faltan bibliotecas del sistema (GTK/GStreamer y otras). No se afirman pruebas de Safari ni teléfonos físicos. La validación funcional y visual publicada corresponde a Chromium. Balance subjetivo pendiente de partidas reales.

Reproducir QA con Playwright 1.51.1 instalado fuera del proyecto; `QA_BROWSERS=chromium node tests/boss-expansion-qa.cjs`. Sin nuevas dependencias runtime.

## 2026-10-04 — evolución del hurón, sin escudo y cámara alejada

**PASS lógico localizado.** Se elimina el sistema de escudo del jugador sin tocar la protección especial de bosses. Daño mitigado por armadura pasa directo a HP. `ferretEvolutionFor` cubre cuatro etapas 1–9/10–19/20–29/30+; el arte produce cuatro firmas distintas y no conserva el dibujo del escudo de mano. `cameraZoomFor` da 0,84 a 390 px, 0,926 a 430 px y tope 0,99 a 540 px, equivalente a un encuadre aproximado 16% más lejano que el histórico. HUD/runtime no contienen referencias al escudo del jugador. Core, arte, renderer y app parsean. Prueba física en iPhone pendiente.


## 2026-10-04 — cámara 30% más alejada adicional

**PASS lógico localizado.** PR #15, squash `ed7d597ace7be7543761913c0853df57d1738d26`.

- El diff de runtime modifica únicamente `cameraZoomFor`: zoom previo / 1,30. No toca `Game`, spawns, daño, movimiento, hitboxes, input ni HUD.
- Valores comprobados: 320 px → 0,530178; 390 px → 0,646154; 430 px → 0,712426; 540 px → 0,761538.
- La prueba `tests/render.test.js` fue actualizada para esas referencias y conserva las pruebas del indicador de boss.
- Las aserciones numéricas equivalentes se ejecutaron con Node y pasan.
- No se ejecutó la suite completa ni QA de navegador en este entorno porque el runner no tiene acceso de red al repositorio; no se afirma prueba física en iPhone/Android.
- GitHub Pages: run 37161784959 completado con `success` para el commit de juego `ed7d597ace7be7543761913c0853df57d1738d26`.


## 2026-10-04 — enemigos normales menos robóticos

**PASS lógico localizado.** PR #16, squash `712208aa6e9d9348a8f6cf5e11a40661090d3c22`.

- Puntería imperfecta añadida a jump/fan/lunge/shot/ram; burst/explode permanecen centrados en el propio enemigo.
- Cada una de las 16 familias conserva su ataque principal y recibe un secundario coherente; bone_skull evolucionado alterna explode/ram.
- 1 de cada 4 IDs puede abrir con secundario y la anti-repetición fuerza cambio tras dos usos iguales cuando la alternativa está disponible.
- El secundario no amplía el rango original de activación del enemigo.
- Fan secundario de arqueros conserva feather/bone/rock/ember según familia.
- Checks dirigidos ejecutados con Node: repertorios, desviación de puntería, apertura no sincronizada, anti-repetición y conservación de rango: PASS.
- La suite completa no se pudo ejecutar en el runner aislado porque no resuelve github.com; se revisó el diff integrado y los tests de regresión específicos quedaron añadidos al repositorio.
- Bosses no modificados; no se afirma prueba física en iPhone/Android.


## 2026-10-04 — mayor torpeza en saltos y disparos triples

**PASS lógico localizado.** PR #17, squash `07e77d4a2513431e79cb1761c406ca8a6f2ec0f3`.

- Saltos normales: rama torpe ~68%; cuando entra, el objetivo queda desplazado lo suficiente para poder caer fuera del área de impacto de un jugador quieto.
- Fan/triple: rama torpe ~62%, spread variable 0,34–0,48 rad y jitter individual 0,055–0,11 rad por proyectil.
- Shot/ram/lunge reciben error moderado adicional; burst/explode no cambian.
- Daño, cooldowns, rangos de activación, bosses y límites de proyectiles permanecen sin cambios.
- Tests específicos actualizados para aceptar el nuevo punto de caída imperfecto y la geometría irregular del triple.
- El runner aislado no resuelve raw.githubusercontent.com, por lo que no se ejecutó la suite Node completa en este entorno; diff y regresiones dirigidas revisados antes de integrar.
- No se afirma prueba física en iPhone/Android.
