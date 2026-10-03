# Huroner Survivor — estado vigente

## Objetivo / fase
Aplicar dos ajustes aislados: ataque automático por defecto para jugadores sin preferencia guardada y flecha direccional hacia el boss cuando queda fuera de la zona visible. Implementación, QA localizado e integración en `main` completados.

## Revisión
PR #3 fusionado en `main` el 2026-10-03. Merge squash: `44f3153da3993c6ed4845424e20fa43fb147fc30`. Archivos funcionales: `storage.js`, `app.js`, `render.js`. Pruebas: `storage.test.js` y `render.test.js`.

## Decisiones
- `loadPreferences` usa `attackMode: 'auto'` solo cuando no existe un modo válido guardado. Una preferencia previa `button` se conserva; no se fuerza a usuarios existentes.
- El renderer recibe el `bossId` que ya muestra el HUD. Si el actor vivo de ese encuentro está fuera del área segura de pantalla, dibuja una flecha compacta en el borde apuntando hacia él. Si el boss está visible, la flecha desaparece.
- Gemelos usan su `encounterId`, por lo que la flecha sigue al hermano vivo del encuentro mostrado.
- Sin cambios en daño, cadencia de ataque, IA, bosses, horda, XP, controles ni persistencia existente.

## QA
QA localizado PASS:
- preferencias: 4/4 pruebas, incluido default automático y conservación de modo manual guardado;
- geometría de flecha: 2/2 pruebas (oculta en pantalla, clamp y dirección fuera de pantalla);
- sintaxis de `app.js` y `render.js`: PASS.
No se afirma prueba física en iPhone.

## Contexto preservado
Gestión de hordas distribuida ya integrada; límite ordinario 170. Bosses con HP +30→50% y dos ataques nuevos por actor. XP 30/70; escudo 20→120; ataque 0,25 s; mundos cada 5 niveles; zoom bloqueado.

## Siguiente paso
No repetir implementación. Probar visualmente la flecha en partida real y continuar con el siguiente cambio solicitado.
