# Huroner Survivor

Survivor web con un hurón y su espada. Sobrevive a hordas mutantes, consigue mejoras, derrota jefes y desciende hasta la arena del inframundo para la batalla final. El juego antiguo permanece en [feature/huroner-survivor-legacy](https://github.com/JoseOrtegaa/ai-web-games-automata/tree/feature/huroner-survivor-legacy/huroner-survivor).

**Demo:** https://joseortegaa.github.io/ai-web-games-automata/huroner-survivor/

## Jugar

- Móvil: arrastrar en la arena para moverse y usar otro dedo para ataque si está en modo manual.
- Teclado: WASD/flechas para moverse, espacio para atacar y Escape para pausar.
- Ajustes: ataque manual/automático (automático por defecto al entrar por primera vez), botón a izquierda/derecha, sonido e idioma ES/EN.
- Ambos modos atacan al enemigo más cercano y comparten enfriamiento; las mejoras aparecen al ganar experiencia.
- Los bosses normales aparecen cada cinco niveles, con cinco tipos por cada una de las cuatro capas del mundo. Los cambios de mundo se producen por accesos a cuevas. A los 600 s se abre el descenso al enfrentamiento final.
- Pausa, elecciones y pestaña oculta detienen la simulación. Las preferencias y récords se almacenan localmente cuando es posible; no se guarda la partida en curso.

## Desarrollo

No requiere instalación, framework ni compilación. Usa HTML/CSS, JavaScript ES Modules, Canvas 2D y Web Audio.

```bash
cd huroner-survivor
npm test
python3 -m http.server 8000 --directory ..
```

Abrir `http://localhost:8000/huroner-survivor/` (no usar `file://`). Para QA adicional, hay scripts en `tests/*-qa.cjs` que pueden requerir Playwright externo.

## Estructura y cuidados al modificar

- `core.js`: estado y reglas; `app.js`: menú, HUD y bucle; `input.js`: movimiento y multitáctil; `render.js` y `art.js`: cámara y arte; `world.js`: escenarios; `enemies.js`: enemigos; `bosses.js` y `boss-art.js`: jefes; `storage.js`/`i18n.js`/`audio.js`: datos, textos y sonido.
- Mantener cuatro capas visuales diferenciadas y sus enemigos; evitar puntería perfecta o ataques repetitivos en enemigos normales. Conservar el escudo especial de ciertos jefes, pero no reintroducir escudo al hurón. El hurón evoluciona visualmente a niveles 10, 20 y 30.
- Conserva el método común `manualAttack()` como puerta de ataque manual/auto (0,25 s), el primer resultado final irreversible, y pausa de tiempo durante menús/elección. El núcleo no debe depender del DOM.
- No cambiar balance, colisiones ni controles de forma accidental al editar arte/cámara. Mantener las claves persistidas `huroner-survivor-2:preferences:v1` y `huroner-survivor-2:record:v1`.
- Las suites `tests/` y los módulos actuales son referencia para reglas reales; no copiar valores de documentos históricos de fases. Probar el recorrido afectado y no afirmar Safari/iPhone físico si no se ha usado.

GitHub Pages sirve los archivos de `huroner-survivor/` directamente desde la raíz de `main`. No hay build ni backend.
