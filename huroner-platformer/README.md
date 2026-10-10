# Ferret Jump · La ruta de los castillos

Plataformas 2D pixel art original. La campaña se organiza por castillos y niveles independientes. Hay seis niveles jugables en dos mundos: el castillo medieval (1-1 a 1-3) y la fortaleza congelada (2-1 a 2-3). Cada nivel tiene recorrido, enemigos, zona oculta, reliquia y checkpoint propios. Las torres finales terminan en combates de jefe.

**Demo:** https://joseortegaa.github.io/ai-web-games-automata/huroner-platformer/dist/

## Jugar y progresar

- **Elegir nivel** abre el mapa de dos mundos. Los niveles se desbloquean al completar el anterior. Cada tarjeta muestra tres objetivos independientes: completar, encontrar su reliquia y alcanzar 45 croquetas en los niveles medievales o 35 en los helados. La mejor cantidad por nivel se guarda en `ferret-jump-campaign-v1` junto a la secuencia de niveles superados; los guardados antiguos se conservan.
- Los jefes **Barón Bellota** (1-3) y **Reina Ventisca** (2-3) custodian la puerta de sus castillos. Cada uno anuncia su onda de choque antes de lanzarla; salta sobre el jefe tres veces para abrir la salida. El segundo mundo se desbloquea al vencer al Barón.
- **Fortaleza congelada:** 2-1 El puente de escarcha (valle y río helado), 2-2 El salón de los espejos (arcadas, reflejos y plataformas de cristal) y 2-3 La torre de la ventisca (torres y nieve). El hielo y el cristal reducen aceleración y fricción mientras estás sobre ellos; las plataformas nevadas tienen agarre normal. Frenar y cambiar de dirección requiere anticipación. Liebres nivales, búhos y escarabajos de escarcha completan las rutas. Hay una zona oculta helada diferente para cada nivel, con tres enemigos separados, cofre y reliquia.
- **Armario del hurón:** boina (80), corona (160), pelaje nevado (120) y violeta (200 croquetas). Se compran y equipan en el mapa, sin conexión ni pagos reales. Los pelajes usan sprites completos con colores propios; la corona se alinea con la cabeza al cambiar de dirección y desaparece al agacharse. El total histórico de croquetas y el récord anterior permanecen intactos; `spent` indica cuánto se gastó y el saldo disponible es `total - spent`. Los cosméticos se guardan por separado.
- Los mundos 3 y 4 siguen indicados como próximos. Tres corazones, pisotón, checkpoints, pasadizos y potenciadores siguen activos. Las croquetas de una partida se incorporan a la cartera al completar el nivel; las reliquias se guardan al recogerlas.

Los recorridos medievales miden 4940 unidades (5440 en la torre, que incluye la arena del jefe): un 30 % más que los 3800 anteriores. Añaden otra cadena de almenas y puentes altos, terrazas con balcones escalonados y una escalinata amplia con galerías opcionales. Cada nivel tiene un túnel de piedra antes del tramo añadido: súbete y agáchate con cualquiera de los controles para entrar en la zona secreta propia de ese nivel. Su puerta devuelve al mismo túnel. Conserva corazones, croquetas, checkpoint, objetos recogidos y enemigos derrotados; la cámara no completa ni desbloquea niveles. Reiniciar dentro de ella reinicia el nivel principal. Cada zona tiene arquitectura, plataformas y recompensas propias; estas solo se pueden recoger una vez por partida de cada nivel.

- **1-1 · La cisterna del adarve:** 2800 unidades, acueductos, arcos húmedos, escaleras de piedra y galerías altas.
- **1-2 · El jardín de las raíces:** 3000 unidades, raíces, setas, terrazas de césped y plataformas de madera con rutas superiores.
- **1-3 · La cámara del tesoro:** 3200 unidades, estanterías, cofres, faroles y dos escalinatas con balcones metálicos.

Las zonas secretas duplican aproximadamente la longitud de la sala original de 1500 unidades e incluyen 9–10 plataformas superiores opcionales. Su ruta inferior es continua para explorar y reunir croquetas. Cada zona tiene tres enemigos separados: ratas y murciélagos en la cisterna, escarabajos y polillas en las raíces, y cofres vivientes y fantasmas en el tesoro. Las especies tienen arte propio y pueden reutilizarse en futuros niveles; patrullan y persiguen localmente. Los cofres resisten dos pisotones; los demás, uno.

Los niveles incluyen 6–7 enemigos en encuentros dispersos, con tres vigilantes adicionales en los tramos ampliados. Conejos y aves persiguen al hurón dentro de su territorio y ceden espacio a otros enemigos. Las aves ajustan también la altura. Los proyectiles recorren como máximo 420 unidades o duran 2,8 segundos; las paredes siguen bloqueándolos.

Cada oculto ofrece un cofre de **25 croquetas** al final, abierto automáticamente al tocarlo una vez por partida. Sus croquetas se añaden al total de la partida y se guardan al completar el nivel principal. Reentrar o morir no repite el premio; empezar de nuevo el nivel permite otro cofre.

Las rutas superiores esconden **Llave antigua**, **Semilla brillante**, **Gema del castillo**, **Cristal aurora**, **Espejo del lago** y **Estrella polar**, una por zona. Se guardan al recogerlas en `ferret-jump-relics-v1`, sin esperar a la victoria, y no reaparecen si ya están en tu colección. El mapa muestra las seis y señala la reliquia de cada nivel. Si el navegador impide guardar, se conservan durante la sesión. Los guardados de campaña y croquetas anteriores siguen funcionando.

## Controles

- **Móvil horizontal:** desliza a los lados en la zona izquierda para caminar o hacia abajo para agacharte; suelta para levantarte. En modo Botones, usa ▼ para agacharte. Puedes avanzar lentamente agachado. Salta con el botón derecho; mantén para un arco más alto y suelta para un salto corto.
- Configuración inicial: **Deslizar** (predeterminado) o **Botones** grandes. Elección guardada localmente.
- **Teclado y ratón:** A/D o flechas para caminar, S/↓ o rueda hacia abajo para agacharse, espacio/W/↑ para saltar, Escape/P para pausar. La rueda provoca un agachado breve; S/↓ lo mantiene. El mapa admite Tab y Enter.

## Desarrollo y QA

Node 24+, TypeScript, Phaser 3 y Vite. Arte original Canvas y audio sintetizado. Sin cuentas, backend ni APIs.

```bash
npm ci
npm test
npm run build
npm run dev
```

`npm run test:e2e` compila, sirve el juego en un puerto local temporal y ejecuta los 13 recorridos E2E: seis niveles y seis ocultos con movimiento y salto reales, enemigos, jefes, recompensas, compras, mapa, guardado, controles táctiles emulados y pruebas visuales de pelajes, corona y panoramas. Instala Chromium (`npx playwright install chromium`) antes de ejecutarlo. `BASE_URL` y `CHROMIUM_PATH` permiten usar otro servidor o navegador. El resultado de cada caso queda en `test-results/summary.json`. La emulación Chromium no equivale a probar Safari físico.

## Mantenimiento y publicación

- `level-data.ts`: mundos, capítulos y geometría medieval. `frozen-levels.ts`: niveles y secretos helados. `secret-levels.ts`: las tres zonas secretas medievales. `environment.ts`: panoramas de cada nivel, incluidos puente, salón y torre helada y sus tres ocultos.
- `scene.ts`: partida, transiciones y mapa. `progress.ts`: desbloqueo secuencial y persistencia. `input.ts`/`settings.ts`: controles. Física en `player.ts`/`collision.ts`.
- Conservar salto variable, coyote time, buffer, multitouch, pausa al girar, safe areas y guardados existentes.
- `?qa=1` habilita `window.__ferretQA`; no sustituir pruebas de recorrido por teletransportes.
- GitHub Pages sirve `main` desde raíz. **Versionar `dist/`** tras el build; no modificar otros juegos ni el catálogo.

Avisos de terceros en `public/LICENSES.txt` y `dist/LICENSES.txt`.
