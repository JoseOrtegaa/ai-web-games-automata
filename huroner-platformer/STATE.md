# Ferret Jump — estado

- Objetivo completado: configuración Deslizar/Botones, deslizamiento horizontal predeterminado y botones de movimiento ampliados.
- Fase: integrado y publicado; publicación autorizada explícitamente por Jose el 2026-10-08.
- Revisión: implementación `972b2345d219bdbc3763f9102384a0fddaa57f42`, PR #19, integración `2f8a0a36993e11beb0d20e1ddd8bacd318f023ab`.
- Archivos: `src/input.ts`, `src/settings.ts`, `src/style.css`, `index.html`, build `dist/`, pruebas `tests/browser-controls.mjs` y adaptación del runner/casos existentes.
- Decisiones: preferencia `ferret-jump-controls-v1` independiente del progreso; movimiento mantenido respecto al punto inicial, zona muerta 12 px; salto separado, captura de puntero y limpieza ante interrupciones.
- QA: typecheck/build, 3 pruebas unitarias, recorrido y casos de juego más nuevos controles PASS en [Actions 37822148487](https://github.com/JoseOrtegaa/ai-web-games-automata/actions/runs/37822148487). QA local adicional en Chromium 153 con multitouch CDP y revisión visual. Detalle en `docs/QA.md`.
- Publicación: [Pages 37822619321](https://github.com/JoseOrtegaa/ai-web-games-automata/actions/runs/37822619321) completado correctamente. HTML, JS y CSS públicos comprobados con HTTP 200 y coincidencia byte a byte con el build validado.
- Enlace: https://joseortegaa.github.io/ai-web-games-automata/huroner-platformer/dist/
- Defectos abiertos: ninguno en el alcance. Sin prueba en dispositivo físico/Safari.
- Pendiente: feedback de Jose y siguiente mejora; ninguna tarea de esta entrega pendiente.
