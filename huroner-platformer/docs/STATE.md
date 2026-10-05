# Estado

- Objetivo: prototipo completo Ferret Jump, un nivel horizontal mobile-first.
- Rama remota: `feature/ferret-jump`; base de main `7e34f50`. Survivor intacto.
- Revisión remota vigente: `bf566ebce2efb2cbc734405ebaaa2d3f1e1eee58`.
- Fase: cierre de QA; arquitectura/diseño/desarrollo terminados.
- Primer QA real detectó textura del protagonista mal registrada; corregida en `ffa2a8a` (key de CanvasTexture y frame inicial).
- QA `37269455689`: 25/25 casos dirigidos PASS, sin errores de consola. Movimiento, salto variable/coyote/buffer, combate, vida/checkpoint, secretos/powerups, audio, multitouch y cinco ratios comprobados en Chromium CI.
- Pendiente: recorrido completo por teclado. El bot saltó prematuramente desde un mueble hacia un hueco; ajustada su lectura de descensos seguros sin cambiar geometría. Se añadió traza de daño.
- QA vigente: GitHub Actions `37269835133`, probando recorrido corregido y render Canvas (comparar rendimiento frente a WebGL software del runner).
- Entorno local no permite sockets de Chromium; QA remoto legítimo. No pruebas físicas iOS/Android.
- Siguiente paso: leer resultado/artefactos de ese run, corregir solo fallos reales, actualizar QA y ARCHITECTURE, integrar main con conector GitHub y verificar Pages.
- Publicación: `huroner-platformer/dist/` versionado; catálogo apunta a esa ruta. Git terminal no tiene credenciales; usar GitHub connector (create_tree/create_commit/update_ref sin force). No confundir commits locales iniciales con HEAD remoto.
