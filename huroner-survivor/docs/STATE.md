# Huroner Survivor — estado vigente

## Objetivo / fase
Sustituir la antigua rotación automática de fondos por un sistema de mundos descendentes conectados mediante cuevas. Implementación, QA lógico e integración en `main` completados.

## Progresión de mundos
- Superficie inicial.
- Primera cueva: se elige por partida tras el boss de nivel 5 o 10.
- Segunda cueva: tras el boss de nivel 15.
- Tercera cueva: tras el boss de nivel 30.
- La cueva aparece físicamente, con flecha de dirección fuera de pantalla. El botón **DESCENDER** solo aparece cerca.
- El fondo cambia únicamente al entrar; no por alcanzar el nivel.
- Profundidades: magma comienza en 20 y se intensifica con fósiles/petróleo en 25.
- Magma: base desde 30 e intensificación en 35.
- Enemigos y balance actual se conservan.

## Implementación
`core.js`: profundidad, plan 5/10, cuevas, interacción y protección frente a saltos de progresión.
`world.js`: cuatro capas y fases visuales internas cacheadas.
`render.js`: cueva y flecha.
`app.js` / `index.html` / `style.css` / `i18n.js`: botón contextual y feedback ES/EN.
`tests/world-progression.test.js` y `tests/world-qa.cjs`: cobertura nueva.

## QA
PASS lógico:
- primer umbral aleatorio 5/10;
- boss abre cueva sin cambiar automáticamente de mundo;
- interacción cercana desciende 0→1→2→3;
- ignorar una cueva no bloquea una bajada posterior;
- fases visuales 20/25/35 mapeadas correctamente;
- sintaxis de core/world/render/app;
- referencias DOM literales de app presentes en index.

No se afirma prueba física en iPhone ni ejecución Playwright local en esta sesión.

## Integración
PR #5 fusionado en `main` el 2026-10-03. Merge squash: `6eff54aba9c2069f67da02e560fc43eb6befa8e2`.

## Contexto preservado
Modo DEV por `?dev=1`; sus saltos de nivel colocan una capa representativa para pruebas. Ataque automático por defecto. Flecha de boss fuera de pantalla. Bosses cada 5 niveles, HP +30→50% y repertorio ampliado. XP 30/70; escudo 20→120; ataque 0,25 s; zoom bloqueado.

## Siguiente paso
Probar la progresión completa en móvil y pulir enemigos/ambientación de cada capa en iteraciones posteriores.
