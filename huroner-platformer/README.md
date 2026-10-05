# Ferret Jump · La casa dormida

Un plataformas pixel art original. Explora una casa enorme con un pequeño hurón, encuentra croquetas y pasadizos, salta sobre enemigos y llega al jardín.

- **Móvil horizontal:** izquierda/derecha y salto; mantén el salto para alcanzar más altura.
- **Teclado:** A/D o flechas, espacio/W/arriba. Escape/P pausa.
- **Vida:** tres corazones. Calcetín a mitad de camino guarda el punto de reaparición.
- **Objetos:** carne recupera vida, aceite acelera 12 segundos, pompón absorbe un golpe.
- **Enemigos:** pisotón para derrotarlos; los protegidos necesitan dos. Evita sus laterales.

## Desarrollo

Node 24 o posterior (pruebas TypeScript nativas). `npm ci`, `npm run dev`, `npm test`, `npm run build`, `npm run preview`.

Fuente TypeScript/Phaser con arte original generado en Canvas y sonido sintetizado. Sin código ni recursos de otros juegos. `dist/` se versiona para GitHub Pages del repositorio. Ver `AGENTS.md` y `docs/` para decisiones, contratos y QA. El guardado local conserva croquetas acumuladas y mejor resultado al terminar; falla de forma segura si el navegador bloquea almacenamiento.

La validación de navegador reproducible está en `tests/browser-qa.mjs` y GitHub Actions. Requiere instalar Chromium con `npx playwright install chromium` y servir la raíz del repositorio en el puerto 8123. `BASE_URL` permite probar otro servidor. Avisos de terceros: `public/LICENSES.txt`, también publicado en `dist/`.
