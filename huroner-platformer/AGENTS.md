# Ferret Jump

Plataformas 2D original mobile-first horizontal: un hurón bípedo explora «La casa dormida», nivel manual de 14.000 px. Independiente de Huroner Survivor: no reutilizar ni editar aquel juego.

## Stack y estructura
Phaser 3.90 Arcade Physics, TypeScript, Vite. `src/scene.ts` coordina partida; `player/input/collision/camera/enemies/powerups/collectibles/audio/ui` separan responsabilidades; `balance.ts` centraliza ajuste. `art.ts` dibuja sprites pixel art originales; `level-data.ts` contiene geometría y entidades con contratos `types.ts`. Viewport 960×540 FIT; terreno sólido y plataformas one-way. No motor custom ni framework adicional.

## Juego
Flechas/A-D: movimiento; espacio/W/arriba: salto variable. Táctil multitouch: deslizamiento horizontal predeterminado o botones grandes, configurable desde el menú y persistido en `ferret-jump-controls-v1`; salto separado. `settings.ts` gestiona la preferencia; `input.ts` captura y limpia gestos. Coyote 110 ms y buffer 130 ms. Tres corazones; invulnerabilidad 1,4 s; daño lateral, pisotón con rebote. Conejo patrulla, protegido dos pisotones, codorniz voladora, tirador anunciado. Carne cura; aceite acelera 12 s; pompón absorbe un golpe. Croquetas, dos paneles secretos, checkpoint calcetín central, puerta final. Muerte conserva recogidos; reintento reinicia nivel. Resultado se acumula una sola vez al vencer en localStorage versionado. Audio original sintetizado tras gesto, silenciable.

## Restricciones y pruebas
Prohibido zoom/scroll en partida. Vertical y pestaña oculta pausan. Sin música/recursos externos, Nintendo, bosses, tiendas ni mundos adicionales. Respetar diseños y workflow raíz. Documentos `docs/BRIEF`, `DESIGN`, `ARCHITECTURE` definen alcance.

`npm ci`; `npm run dev`; `npm test`; `npm run build`; `npm run preview`. Versionar `dist/` para Pages desde main/raíz. QA dirigido: abrir `?qa=1`, `window.__ferretQA.state()`, `.start()`, `.teleport(x,y)`, `.damage()`, `.restart()`; `.scene` permite inspección. Hooks no disponibles normalmente. Verificar recorrido real además de escenarios dirigidos; emulación no equivale a iPhone físico.
