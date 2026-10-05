# QA — Ferret Jump

**PASS funcional y visual — 2026-10-05.** Juego validado en `730a4dec88664d10bef577ff29b04bc7ad9a2b38`, bundle `index-DZNGAO9A.js`.

Evidencia: [GitHub Actions 37270208690](https://github.com/JoseOrtegaa/ai-web-games-automata/actions/runs/37270208690), artefacto `ferret-jump-qa` con JSON y capturas. Entorno: Ubuntu 24.04, Node 24, Playwright 1.62.1, Chromium 151, render Canvas. No equivale a móviles físicos.

## Comprobaciones
- `npm test`: 3/3 reglas geométricas correctas; typecheck y build correctos.
- Recorrido real mediante teclado, sin teletransportes ni alterar salud/física: victoria en 62,76 s, 112 croquetas, checkpoint activo, dos corazones al terminar. Es recorrido automatizado directo; el objetivo de 2–4 minutos con exploración para un principiante requiere calibración humana.
- **26/26 casos dirigidos PASS**: aceleración/frenada; salto corto (41 px en esta muestra) y mantenido (96 px); coyote; buffer; paredes/plataformas one-way; daño lateral e invulnerabilidad; pisotón sobre cuatro arquetipos (protegido dos golpes); derrota y respawn; checkpoint, conservación de recogidos y reintento; carne, aceite +25%/12 s y expiración/pausa; Pompón absorbe golpe; dos pasadizos; vuelo/proyectil anunciado; WebAudio/mute; victoria, guardado único/replay; giro/pausa; cinco ratios; multitouch CDP, doble toque sin zoom; muerte suspendida en vertical; rendimiento; recuperación desde cocina baja; consola limpia.
- Ratios: 844×390, 932×430, 667×375, 1024×768, 1440×900 y vertical 390×844. Sin scroll, botones ≥44 px, escala visual 1.
- Capturas revisadas: menú, protagonista/fondo/HUD, salón, cocina, Pompón, móvil, giro y victoria. Pixel art original legible y controles bajo zona principal de plataformas.
- Muestra de 180 frames: mediana 16,7 ms, p95 16,7 ms (~60 FPS en runner). Canvas mejoró frente a WebGL software (33,3 ms); no certifica FPS de iPhone/Android.

## Fallos corregidos
1. La CanvasTexture conservaba otro key y las animaciones detenían el primer frame: mismo key y frame inicial explícito.
2. Pausa/orientación durante muerte, tweens pendientes en replay, HUD del respawn y salto buffered corto.
3. Ruta baja ante muebles altos obligaba a retroceder después de un rebote: nueve apoyos pequeños garantizan subidas de hasta 80 px.
4. El controlador QA saltaba ante descensos seguros: ahora distingue caída a suelo y hueco, sin alterar la física del juego.

## Límites
Sin defectos bloqueantes conocidos con esta cobertura. Safari/WebKit y hardware iOS/Android no comprobados. No música ambiental; efectos originales sintetizados. Tiempo y sensación con jugadores noveles pendientes de feedback. El host local bloqueó sockets de Chromium; se validó en Actions sin eludir restricciones.

Reproducción: Node 24, `npm ci`, `npm test`, `npm run build`, `npx playwright install chromium`; servir raíz del repositorio en 8123 y ejecutar `node tests/browser-qa.mjs` desde el juego. `BASE_URL` cambia servidor. `?qa=1` habilita casos dirigidos; el recorrido completo solo usa teclado.
