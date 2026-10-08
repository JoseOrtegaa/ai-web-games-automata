# Ferret Jump — estado

- Objetivo: configuración Deslizar/Botones, deslizamiento horizontal predeterminado y botones de movimiento ampliados.
- Rama: `feature/ferret-jump-movement-settings`, base `fc38cfa`.
- Fase: implementación y QA local completos en `c35e0a8`; publicación autorizada explícitamente por Jose el 2026-10-08. Pendiente integración y verificación de Pages.
- Archivos: `src/input.ts`, `src/settings.ts`, `src/style.css`, `index.html`, build `dist/`, pruebas `tests/browser-controls.mjs` y adaptación del runner/casos existentes.
- Decisiones: preferencia `ferret-jump-controls-v1` independiente del progreso; movimiento mantenido respecto al punto inicial, zona muerta 12 px; salto separado, captura del puntero y limpieza ante interrupciones.
- QA: build/typecheck, 3 pruebas unitarias, prueba dirigida en Chromium 153 con multitouch CDP y revisión visual correctos. Detalle en `docs/QA.md`.
- Defectos abiertos: ninguno en el alcance. Sin prueba en dispositivo físico/Safari.
- Bloqueo de aprobación resuelto: Jose autorizó explícitamente subir y publicar los cambios. Remoto comprobado: `https://github.com/JoseOrtegaa/ai-web-games-automata.git`.
- Siguiente paso: subir rama, comprobar CI, integrar y verificar Pages.
