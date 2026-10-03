# Huroner Survivor — mapa para agentes

Aplicar también las reglas comunes de [AGENTS raíz](../AGENTS.md). Este archivo resume exclusivamente este juego; máximo orientativo: 300 palabras.

## Lectura
Para retomar, [STATE](docs/STATE.md). Según la tarea: [BRIEF](docs/BRIEF.md), [DESIGN](docs/DESIGN.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [QA](docs/QA.md). No leer todos por defecto.

## Stack y mapa
HTML/CSS, JavaScript ES Modules, Canvas 2D y Web Audio; sin framework, build ni dependencias runtime. Mapa: `index.html`/`style.css` componen pantallas; `app.js` coordina navegación, HUD y frame; `core.js` posee reglas/estado; `render.js` dibuja; `input.js` gestiona punteros/teclado; `audio.js` sonido; `storage.js` preferencias/récord; `i18n.js` textos. Contratos en ARCHITECTURE. `bosses.js`/`boss-art.js`: diez encuentros aleatorios por cada 5 niveles, peligros y siluetas; reglas en docs/BOSSES.md. Gemelos: una barra/recompensa. Bosses y final: HP extra 30→50% según nivel al aparecer; dos ataques nuevos por actor (24), repertorio cíclico. `world.js`: cuatro capas (superficie/subsuelo/profundidades/magma) cambian solo al entrar en cuevas desbloqueadas por bosses; fases visuales internas en 20/25/35; decoración cacheada.

## Comandos
Desde `huroner-survivor/`:

```bash
node --test tests/*.test.js
python3 -m http.server 8000 --directory ..
```

Abrir `http://localhost:8000/huroner-survivor/`. No instalación ni compilación. También disponible `npm test`.

## Restricciones
Preservar balance salvo peticiones explícitas. XP: 30% directa, 70% gemas; radio base 56. Escudo inicial 20, +20/rango (máximo 5), recarga 10%/s tras 6 s sin daño. Ocultar mejoras máximas y rechazar selecciones agotadas. Manual y automático pasan por `manualAttack()` y comparten 0,25 s; nunca llamar `automaticAttack()` desde UI. Primer `dead/won` irreversible, sin reglas posteriores. UI no muta Game. Pausa/elección congelan tiempo; resetear input al salir de juego activo. ES/EN, multitáctil, cancelación y zoom bloqueado durante partida. Prioridad iPhone/Safari y Android/Chrome, escritorio equilibrado; no afirmar pruebas físicas no realizadas. Mantener claves históricas para conservar ajustes/récords: `huroner-survivor-2:preferences:v1` y `huroner-survivor-2:record:v1`.

## Publicación
Pages desde raíz de `main`, archivos fuente directamente en `huroner-survivor/`. Ruta `/ai-web-games-automata/huroner-survivor/`; estado de publicación en STATE y QA. Rutas relativas. Juego antiguo archivado en rama `feature/huroner-survivor-legacy`. Sin backend.
