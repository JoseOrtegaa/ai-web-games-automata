# Huroner Survivor — mapa para agentes

Aplicar también las reglas comunes de [AGENTS raíz](../AGENTS.md). Este archivo resume exclusivamente este juego; máximo orientativo: 300 palabras.

## Lectura
Para retomar, [STATE](docs/STATE.md). Según la tarea: [BRIEF](docs/BRIEF.md), [DESIGN](docs/DESIGN.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [QA](docs/QA.md). No leer todos por defecto.

## Stack y mapa
HTML/CSS, JavaScript ES Modules, Canvas 2D y Web Audio; sin framework, build ni dependencias runtime. Mapa: `index.html`/`style.css` componen pantallas; `app.js` coordina navegación, HUD y frame; `core.js` posee reglas/estado; `render.js` dibuja; `input.js` gestiona punteros/teclado; `audio.js` sonido; `storage.js` preferencias/récord; `i18n.js` textos. Contratos en ARCHITECTURE. `world.js`: escenario cambia en niveles 5/10/15…; decoración cacheada, sin afectar combate.

## Comandos
Desde `huroner-survivor/`:

```bash
node --test tests/*.test.js
python3 -m http.server 8000 --directory ..
```

Abrir `http://localhost:8000/huroner-survivor/`. No instalación ni compilación. También disponible `npm test`.

## Restricciones
Preservar contenido/balance; sólo corregir estados terminales y discrepancias documentadas. Manual y automático pasan por `manualAttack()` y comparten 0,25 s; nunca llamar `automaticAttack()` desde UI. Primer `dead/won` irreversible, sin reglas posteriores. UI no muta Game. Pausa/elección congelan tiempo; resetear input al salir de juego activo. ES/EN, multitáctil, cancelación y zoom bloqueado durante partida. Prioridad iPhone/Safari y Android/Chrome, escritorio equilibrado; no afirmar pruebas físicas no realizadas. Mantener claves históricas para conservar ajustes/récords: `huroner-survivor-2:preferences:v1` y `huroner-survivor-2:record:v1`.

## Publicación
Pages desde raíz de `main`, archivos fuente directamente en `huroner-survivor/`. Ruta `/ai-web-games-automata/huroner-survivor/`; estado de publicación en STATE y QA. Rutas relativas. Juego antiguo archivado en rama `feature/huroner-survivor-legacy`. Sin backend.
