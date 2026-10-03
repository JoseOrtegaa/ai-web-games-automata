# Huroner Survivor — arquitectura

## Stack y motivos

HTML/CSS, JavaScript ES Modules, Canvas 2D y Web Audio; pruebas con `node:test`. V2 deriva del juego existente y conserva su simulación: incorporar Phaser, TypeScript o build no aporta una mejora necesaria para este alcance. Sin dependencias de ejecución, backend ni servicios nuevos. Código legible con bloques y nombres explícitos, sin conservar el formato comprimido del original.

V2 contiene una copia independiente del core y los tests de la base registrada en STATE; nunca importar archivos de la rama legacy en ejecución. Los módulos siguientes ya están implementados; los resultados de sus verificaciones corresponden a QA y STATE.

## Módulos y dependencias

| Archivo | Responsabilidad y estado propio |
| --- | --- |
| `index.html`, `style.css` | Estructura semántica, pantallas, HUD, controles, tokens visuales, safe areas y composición adaptable. |
| `app.js` | Entrada y coordinación: instancia Game, navegación, eventos de botones, elección, traducción del DOM, HUD, récord y único requestAnimationFrame. |
| `core.js` | Game, reglas, balance, UPGRADES, RNG inyectable y eventos de simulación; sin DOM, audio ni almacenamiento. |
| `world.js` | Capa de escenario por nivel, tiles cacheados y transición visual; no muta Game ni usa su RNG. |
| `render.js` | Canvas de arena y portada, cámara, dibujos, culling, resize y caches de recursos visuales. Sólo lee Game. |
| `input.js` | Teclado, puntero de movimiento, joystick y botón de ataque, captura/cancelación y bloqueo de gestos durante partida. Sin acceso a Game. |
| `audio.js` | AudioContext, desbloqueo, música original y efectos sintéticos, silencio/suspensión y límites de voces. |
| `storage.js` | Lectura validada, escritura tolerante a fallos, preferencias y récord exclusivos de V2. |
| `i18n.js` | Diccionario ES/EN, selección de texto y formateo. Los descriptores de UPGRADES siguen en core para conservar su contrato. |
| `tests/core.test.js`, `tests/storage.test.js` | Regresiones de simulación y validación de persistencia mediante almacenamiento falso. |

`app` importa estos módulos; ninguno importa `app`. `core` no depende del navegador. `render` puede importar constantes del core, nunca llamarlo para mutar estado. No extraer un framework de escenas, bus ni interfaz por cada función. Mantener HUD y navegación juntos en app; extraer dibujos del render sólo si el volumen de recursos lo exige. Los parámetros jugables viven en core, agrupados con la regla correspondiente; la presentación usa constantes/getters existentes en vez de duplicar cifras.

## Contratos relevantes

- Conservar `new Game(random)`, `reset()`, `step(dt, {x,y})`, `manualAttack()`, `choose(id)`, `rank(id)`, getters y exports actuales para aprovechar los tests. App lee estado público y sólo lo altera por estos métodos, salvo vaciar la cola de eventos. RNG de presentación nunca consume `game.random`.
- **Una puerta de ataque:** tanto el callback manual como el automático invocan `manualAttack()`. Su nombre heredado no cambia su papel: valida `playing`, consume `ATTACK_COOLDOWN` y ejecuta los espadazos. Eliminar el temporizador de ataque automático de app. `automaticAttack()` es implementación interna, nunca la puerta de entrada de UI; debe respetar estado terminal entre espadazos.
- `createInput({shell, joystick, stick, attackButton, onAttack, onPause, onGesture})` devuelve `read()` → `{x,y}`, `setEnabled(boolean)`, `reset()` y `destroy()`. `read` combina teclado o joystick sin dar ventaja diagonal; el core sigue normalizando. Un puntero controla movimiento y otro puede atacar. Cancelar/liberar captura borra sólo su acción; `reset` borra todas. `onAttack` es una intención, app comprueba modo y estado; no hay ataque retenido tras salir de partida.
- `createRenderer({canvas, heroCanvas})` devuelve `resize()`, `draw(game, {active, moving, reducedMotion})`, `drawHero()` y `destroy()`. Estado de cámara/caches privado. Medidas desde el contenedor, coordenadas de mundo preservadas; no modificar radios, velocidades ni enemigos para acomodar arte.
- `createAudio()` devuelve `unlock()`, `setMuted(value)`, `tick(dt)`, `handleEvents(events)`, `suspend()` y `reset()`. Música avanza sólo con tiempo activo; efectos se deduplican por frame donde ya lo hace V1. Fallos de audio no bloquean partida. Desbloquear desde un gesto real; suspender al ocultar pestaña.
- `loadPreferences(storage?, browserLanguage?)`, `savePreferences(preferences, storage?)`, `loadRecord(storage?)` y `saveRecord(record, storage?)` permiten probar con un objeto falso. Preferencias: `{language:'es'|'en', muted:boolean, attackMode:'button'|'auto', attackSide:'left'|'right'}`; récord: `{time,kills,level,won}`. Validar tipos, números finitos y rangos; valores dañados recuperan defaults.
- App consume una copia de `game.events.splice(0)` una vez por frame y la entrega a audio y feedback. Conservar eventos `slash/hurt/pickup/level/mutation/item/boss/storm/dead/won/kill` y payloads actuales. Resolver pantallas por `game.state`, no por el orden de eventos antiguos. No reproducir eventos dos veces.

## Estado y actualización

Game posee `playing/levelup/dead/won` y toda la simulación. App posee `home/settings/playing/paused/end`, preferencias y reloj visual. La combinación de ambos define si avanza el mundo; pausa no escribe un nuevo estado en core. Al cambiar a pausa, elección, inicio, final o menú, resetear input. Elecciones se aceptan sólo mediante `choose`, reconstruyendo botones cuando cambien; una segunda pulsación del mismo botón cerrado no afecta la elección siguiente.

Un requestAnimationFrame calcula `dt` limitado a 0,05 s. Sólo con app y core en `playing`: leer input, `game.step`, comprobar de nuevo el estado, pedir ataque automático si procede y avanzar música. Después consumir eventos, resolver pantalla, actualizar HUD y dibujar. En blur/visibilitychange pausar y resetear input/reloj; reanudar por acción explícita sin compensar el tiempo oculto. El HUD puede actualizarse a 12,5 Hz como el original y de inmediato en transiciones; recarga y controles pueden refrescarse cada frame.

**Primer terminal irreversible:** conservar orden de reglas del core, pero detener el procesamiento tan pronto se fija `dead` o `won`. Añadir guardas en daño/ataques y retornos en bucles después de llamadas que pueden terminar la partida, incluidas habilidades, contacto, órbitas, rayos, aura y proyectiles. `hit`, `offer` y `checkLevel` no pueden sustituir un terminal; Gemelo tampoco continúa después de ganar. Emitir un solo resultado. No basta con decidir qué pantalla mostrar: tras morir no se matan enemigos, cura, recoge XP ni abre elección en ese mismo paso. Test específico: contacto mortal antes de daño pasivo que habría matado al jefe final → sólo `dead`; victoria alcanzada primero → no daño/elección posteriores.

## Presentación, recursos y presupuesto

El diseñador visual define arte, layout y recursos en DESIGN sin cambiar contratos jugables. Canvas dibuja el mundo y DOM las pantallas/controles. Recursos locales con rutas relativas a V2; dibujos Canvas/SVG propios son válidos, sin descarga obligatoria en runtime. Registrar procedencia en DESIGN si aparecen recursos externos. Fuentes de sistema o locales; fallback visible mientras carga cualquier recurso.

`render.js` importa directamente el arte de `art.js`: `drawFerret(ctx, {x,y,scale,face,walk,armor})` y `drawAnimal(ctx, {kind,x,y,scale,tier,boss,time,flash})` dibujan sin modificar estado y restauran el contexto con save/restore. La portada carga `assets/hero.svg` desde el HTML; `heroCanvas` y `drawHero()` son opcionales y no se utilizan en la composición actual. No hace falta un gestor de assets ni una capa adicional. Cualquier ajuste de firma se acuerda antes de integrar y se refleja aquí.

Limitar DPR a 2, mantener arena vertical con ancho máximo en escritorio y resize por contenedor/orientación; safe areas y objetivos táctiles de al menos 44 px. Culling de elementos fuera de vista, sin eliminar entidades de simulación. Suelo/decoración no compiten con amenazas. Dibujar avisos y proyectiles con una pasada de alto contraste que siga legible sobre pickups, sangre y efectos. La sacudida es sólo visual; respetar movimiento reducido. Identificar jefe mostrado por entidad viva (`id`), con indicador de coexistencia; no asumir que `game.boss` representa todos los presentes.

Conservar presupuestos reales del core: límite de aparición ordinaria 170 enemigos (los jefes pueden excederlo), 8 pickups, 140 efectos y 200 partículas. Proyectiles se recortan a 150 al final del paso; ráfagas pueden exceder temporalmente esa cifra. A partir de 350 gemas se agrega XP a una existente, pero las gemas curativas pueden sobrepasar ese umbral: no presentarlo como máximo absoluto ni perder XP al optimizar. No aumentar estos presupuestos para embellecer V2. Nuevos adornos deben ser procedurales o cacheados; si requieren partículas independientes, límite explícito de 64 y sin alterar RNG de core. Audio: hasta 24 voces simultáneas, liberar nodos al finalizar; saturación descarta efectos, nunca reglas.

Medir en QA una partida cargada y registrar viewport, navegador, DPR y observaciones; objetivo orientativo 60 FPS, sin afirmar rendimiento móvil físico por emulación. No añadir sistemas de pooling antes de detectar un coste relevante.

## Pruebas y depuración

Comandos operativos en AGENTS local. Copiar íntegra la suite original y conservar su cobertura; añadir regresiones para el terminal irreversible, puerta compartida manual/auto y guardas tras elección/final. Usar RNG determinista y dt explícitos; comparación de core V1/V2 sólo para escenarios fuera de las correcciones acordadas. Comprobar defaults, claves exclusivas, JSON malformado y excepciones de storage. Sin librerías de test nuevas por rutina.

QA de navegador: ES/EN, sonido, configuración/recarga, pausa/reanudación, reinicio, doble toque de elección, teclado, joystick + ataque de segundo puntero, pointercancel/lostpointercapture, ocultación, resize y guardado. Capturas de menú, arena poblada, elección, pausa y final en móvil y escritorio; red/consola sin errores bloqueantes. Verificar el enlace canónico `huroner-survivor/` y el archivo antiguo en la rama `feature/huroner-survivor-legacy`. No confundir automatización/emulación con dispositivos físicos.

## Persistencia

Conservar estos identificadores históricos aunque la carpeta se llame `huroner-survivor`, para no perder ajustes/récords de la edición renovada. Usar exclusivamente `huroner-survivor-2:preferences:v1` y `huroner-survivor-2:record:v1`. No leer, migrar ni borrar `huroner-*` del original. Escribir al cambiar ajustes o mejorar récord, nunca cada frame. Mantener la comparación de récord de V1 (victoria primero; después tiempo limitado a 600 y bajas). Si almacenamiento falla, continuar con estado en memoria. Sin red, cuenta, guardado de partidas ni progresión permanente.

## Publicación

Fuente y artefacto coinciden en `huroner-survivor/`; no hay build ni dist. `index.html` carga `./app.js` como módulo y los imports/assets son relativos. Pages sirve raíz de `main`, según README: mantener este mecanismo y una sola entrada del juego en el catálogo. Ruta prevista: `https://joseortegaa.github.io/ai-web-games-automata/huroner-survivor/`; no declararla publicada/comprobada hasta QA y humo remoto registrados en STATE. El coordinador integra y publica tras QA; arquitectura no cambia configuración remota.

## XP y escudo (2026-10-03)

`Game.hit` reparte XP 30/70; `gainXp` conserva décimas. Al saturar gemas, agregar sólo a XP viva, nunca a curación. `player.shield` y `shieldDelay` pertenecen a core; `maxShield` deriva de rango, base 20 y +20 hasta cinco mejoras. `hurt` mitiga con armadura, absorbe escudo y resta excedente de HP; `step` recarga sólo el tiempo posterior a 6 s sin daño (10% capacidad/s). `choose` valida también el máximo. UI sólo lee y muestra barra azul; `drawFerret` recibe `shield` normalizado para colorear el emblema del escudo en la pata libre, sin mutar Game.
