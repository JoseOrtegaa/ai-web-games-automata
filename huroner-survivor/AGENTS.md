# Huroner Survivor — mapa para agentes

Aplicar también las reglas comunes de [AGENTS raíz](../AGENTS.md). Este archivo resume exclusivamente este juego; máximo orientativo: 300 palabras.

## Lectura
Para retomar, [STATE](docs/STATE.md). Según la tarea: [BRIEF](docs/BRIEF.md), [DESIGN](docs/DESIGN.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [QA](docs/QA.md). No leer todos por defecto.

## Stack y mapa
HTML/CSS, JavaScript ES Modules, Canvas 2D y Web Audio; sin framework, build ni dependencias runtime. Mapa: `index.html`/`style.css` componen pantallas; `app.js` coordina navegación, HUD y frame; `core.js` posee reglas/estado; `render.js` dibuja; `input.js` gestiona punteros/teclado; `audio.js` sonido; `storage.js` preferencias/récord; `i18n.js` textos. Contratos en ARCHITECTURE. `bosses.js`/`boss-art.js`: 20 bosses normales organizados en 4 pools de 5 por mundo; cada boss de nivel elige aleatoriamente dentro de la capa actual y evita repetición inmediata. Perfiles de ataque reutilizables con arte/material propio por entorno; reglas en docs/BOSSES.md. Rey final de 600 s separado: a 10:00 abre un descenso al inframundo; arena circular propia, máximo 6 esbirros magma, arte único y 3 fases con patrones solapados telegrafiados. HP final recibe +18% adicional en la arena. HP normal de bosses: extra 30→50% según nivel. `world.js`: cuatro capas (superficie/subsuelo/profundidades/magma) cambian solo al entrar en cuevas desbloqueadas por bosses; fases visuales internas en 20/25/35. `enemies.js`: roster, stats, evolución y repertorio de ataques de enemigos normales por capa; apuntado deliberadamente torpe (especialmente saltos y ataques a distancia) y variantes anti-repetición para evitar comportamiento robótico; no reciclar visualmente familias entre mundos.

## Comandos
Desde `huroner-survivor/`:

```bash
node --test tests/*.test.js
python3 -m http.server 8000 --directory ..
```

Abrir `http://localhost:8000/huroner-survivor/`. No instalación ni compilación. También disponible `npm test`.

## Restricciones
Preservar balance salvo peticiones explícitas. XP: 30% directa, 70% gemas; radio base 56. Superficie tiene una sola evolución desde nivel 5; las capas inferiores usan evolución propia sin volver a la antigua escala cada 5 niveles. La generación normal aumenta de forma continua con nivel + tiempo activo (`spawnRateFor`), un enemigo por tick, sin tandas escalonadas; tras descender el primer spawn tarda 0,15 s. En la arena final el spawn normal se sustituye por un máximo de 6 esbirros, uno cada ~4,2 s. El jugador no tiene sistema de escudo: daño mitigado por armadura va directo a HP. El hurón evoluciona visualmente por nivel (1–9, 10–19, 20–29, 30+) y mantiene la espada como única arma en mano. Cámara de combate: ~30% más campo por eje que la revisión anterior mediante zoom uniforme; mismo mundo e hitboxes. Ocultar mejoras máximas y rechazar selecciones agotadas. Manual y automático pasan por `manualAttack()` y comparten 0,25 s; nunca llamar `automaticAttack()` desde UI. Primer `dead/won` irreversible, sin reglas posteriores. UI no muta Game. Pausa/elección congelan tiempo; resetear input al salir de juego activo. ES/EN, multitáctil, cancelación y zoom bloqueado durante partida. Prioridad iPhone/Safari y Android/Chrome, escritorio equilibrado; no afirmar pruebas físicas no realizadas. Mantener claves históricas para conservar ajustes/récords: `huroner-survivor-2:preferences:v1` y `huroner-survivor-2:record:v1`.

## Publicación
Pages desde raíz de `main`, archivos fuente directamente en `huroner-survivor/`. Ruta `/ai-web-games-automata/huroner-survivor/`; estado de publicación en STATE y QA. Rutas relativas. Juego antiguo archivado en rama `feature/huroner-survivor-legacy`. Sin backend.
