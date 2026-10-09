# Ferret Jump · La ruta de los castillos

Plataformas 2D pixel art original. La campaña se organiza por castillos y niveles independientes. El primer mundo, Castillo medieval, incluye **1-1 Las murallas**, **1-2 El patio interior** y **1-3 Torre del homenaje**, cada uno con fondo, recorrido, enemigos, secreto y checkpoint propios.

**Demo:** https://joseortegaa.github.io/ai-web-games-automata/huroner-platformer/dist/

## Jugar y progresar

- **Elegir nivel** abre el mapa. Muestra un resumen del mundo y los niveles disponibles; los bloqueados aparecen con `?` hasta completar el anterior.
- La puerta final completa el nivel y ofrece pasar al siguiente, volver al mapa o repetir. La última puerta completa el mundo 1; no reinicia la partida automáticamente.
- Los otros tres mundos aparecen como `? · Próximamente`: Fortaleza congelada, Castillo en ruinas y Fortaleza volcánica. Aún no son jugables. Sus futuros diseños deben cambiar arquitectura y plataformas, no solo colores.
- Desbloqueos guardados en `ferret-jump-campaign-v1`. Se conservan las croquetas y récord anteriores (`ferret-jump-v1`) y los ajustes de controles. Sin almacenamiento disponible se mantiene el progreso durante la sesión.
- Tres corazones, pisotón, enemigos protegidos de dos golpes, checkpoints por nivel y pasadizos opcionales. Carne cura, aceite aumenta velocidad y pompón absorbe un golpe.
- Pausa permite volver al mapa o reiniciar **el nivel seleccionado**. Cambiar o reiniciar nivel restablece su checkpoint y objetos; los desbloqueos permanecen. Las croquetas se contabilizan al completar el nivel.

## Controles

- **Móvil horizontal:** desliza horizontalmente en la zona izquierda y mantén el dedo para caminar; suelta para detenerte. Salta con el botón derecho; mantén para un arco más alto y suelta para un salto corto. Puedes corregir la dirección durante el vuelo.
- Configuración inicial: **Deslizar** (predeterminado) o **Botones** grandes. Elección guardada localmente.
- **Teclado:** A/D o flechas, espacio/W/arriba para saltar, Escape/P para pausar. El mapa admite Tab y Enter.

## Desarrollo y QA

Node 24+, TypeScript, Phaser 3 y Vite. Arte original Canvas y audio sintetizado. Sin cuentas, backend ni APIs.

```bash
npm ci
npm test
npm run build
npm run dev
```

`tests/browser-qa.mjs` comprueba los tres recorridos con movimiento y salto reales, mecánicas, controles táctiles emulados, transiciones, mapa y guardado. Instala Chromium (`npx playwright install chromium`), sirve la raíz del repositorio en puerto 8123 y ejecuta `node tests/browser-qa.mjs` desde el juego. `BASE_URL` y `CHROMIUM_PATH` permiten cambiar servidor y navegador. La emulación Chromium no equivale a probar Safari físico.

## Mantenimiento y publicación

- `level-data.ts`: mundos, capítulos y geometría. `environment.ts`: murallas exteriores, patio con arcadas/fuentes e interior abovedado de la torre. Un único ambiente por nivel.
- `scene.ts`: partida, transiciones y mapa. `progress.ts`: desbloqueo secuencial y persistencia. `input.ts`/`settings.ts`: controles. Física en `player.ts`/`collision.ts`.
- Conservar salto variable, coyote time, buffer, multitouch, pausa al girar, safe areas y guardados existentes.
- `?qa=1` habilita `window.__ferretQA`; no sustituir pruebas de recorrido por teletransportes.
- GitHub Pages sirve `main` desde raíz. **Versionar `dist/`** tras el build; no modificar otros juegos ni el catálogo.

Avisos de terceros en `public/LICENSES.txt` y `dist/LICENSES.txt`.
