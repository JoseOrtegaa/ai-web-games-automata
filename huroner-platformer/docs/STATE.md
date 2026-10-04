# Estado

- Objetivo: prototipo completo Ferret Jump, un nivel horizontal mobile-first.
- Rama: `feature/ferret-jump`, actualizada desde main `7e34f50` sin modificar Survivor.
- Fase: QA. Arquitectura, diseño, arte original y desarrollo completados.
- Completado: Phaser/TypeScript/Vite; nivel manual, 4 enemigos, secretos, buffs, checkpoint, HUD/controles/audio y documentación. Build y 3 tests de reglas correctos.
- Pendiente: QA real navegador, correcciones derivadas, integración y publicación verificadas.
- QA local bloqueado: Chromium necesita sockets internos prohibidos en este host; solicitud de permisos ampliados rechazada por política. WebKit tampoco dispone de sus bibliotecas. No se han afirmado pruebas móviles físicas.
- Próximo paso: ejecutar tests/browser-qa.mjs mediante GitHub Actions en la rama aislada y revisar artefactos antes de integrar. Workflow acotado a Ferret Jump, no cambia Pages.
- Restricciones: no modificar/copiar huroner-survivor, sin recursos Nintendo ni costes nuevos; dist versionado para Pages.
