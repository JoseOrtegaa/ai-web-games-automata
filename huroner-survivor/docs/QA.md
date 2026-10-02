# Huroner Survivor — QA del traslado

Base: 1e30b200. Juego anterior archivado en `feature/huroner-survivor-legacy`. Traslado íntegro a `huroner-survivor/`; runtime de simulación/render/input/audio/storage sin cambios. Humo local PASS en Chromium 134 y WebKit 18.4: una entrada de catálogo, recursos y módulos relativos, nombre sin sufijo, ajustes/récord existentes, inicio, ataque manual, pausa/reanudación y cero errores de red/página. [Resultado](promotion-local.json). Publicación pendiente.

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
