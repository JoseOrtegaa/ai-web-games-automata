# Ferret Jump · La casa dormida

Plataformas 2D pixel art original. Un hurón bípedo explora una casa enorme, recoge croquetas, descubre pasadizos y supera enemigos sin reutilizar código de Huroner Survivor.

**Demo:** https://joseortegaa.github.io/ai-web-games-automata/huroner-platformer/dist/

## Controles y mecánicas

- **Móvil horizontal:** desliza horizontalmente en la zona izquierda y mantén el dedo para caminar; suelta para detenerte. Salta con el botón derecho; mantén para mayor altura.
- **Configuración inicial:** Deslizar (predeterminado) o Botones grandes. Se guarda la elección localmente.
- **Teclado:** A/D o flechas para desplazarse, espacio/W/arriba para saltar, Escape/P para pausar.
- **Vida:** tres corazones; daño lateral y pisotón a enemigos; los protegidos necesitan dos golpes. Hay checkpoint intermedio, rutas alternativas y secretos.
- **Objetos:** carne recupera vida, aceite aumenta temporalmente velocidad y pompón absorbe un golpe.
- El juego conserva croquetas acumuladas y mejor resultado al terminar; no incluye cuentas, tiendas ni backend.

## Desarrollo

Node 24+; TypeScript, Phaser 3 y Vite. Arte original mediante Canvas y audio sintetizado.

```bash
cd huroner-platformer
npm ci
npm test
npm run build
npm run dev
```

Otros comandos: `npm run typecheck` y `npm run preview`. La validación de navegador usa `tests/browser-qa.mjs` y GitHub Actions. Para ejecutarla localmente instala Chromium (`npx playwright install chromium`), sirve la **raíz del repositorio** en el puerto 8123 y ejecuta `node tests/browser-qa.mjs` desde el juego. `BASE_URL` permite cambiar el servidor.

## Mantenimiento y publicación

- `src/scene.ts` coordina la partida; `input.ts`/`settings.ts` gestionan controles; `player.ts`/`collision.ts` la física; `art.ts` el pixel art; `level-data.ts` la geometría y entidades; `balance.ts` los ajustes; `ui.ts` la interfaz.
- No introducir mundos, bosses, tiendas o nuevos ataques salvo petición. Conservar salto variable, coyote time, buffer, checkpoints, entrada táctil multitouch, pausa al girar y guardado local versionado. Evitar scroll/zoom accidental en partida.
- Para QA dirigido: `?qa=1` habilita `window.__ferretQA`; probar también un recorrido real, no solo teletransportes. Una emulación táctil no equivale a Safari físico.
- **Se versiona `dist/`** tras `npm run build` porque Pages sirve `main` desde raíz. No modificar ni borrar otros juegos ni el catálogo al publicar.

Avisos de terceros en `public/LICENSES.txt` y `dist/LICENSES.txt`.
