# Rift Arena

Arcade original de lucha 1 contra 1, inspirado en la intensidad de los juegos de lucha de consola de finales de los 90. **No utiliza personajes, gráficos, música, logotipos ni escenarios de ninguna franquicia existente.** Sin backend, cookies, compras, IA externa ni dependencias: 0 €.

## Versión actual

- **8 luchadores originales**, ahora ilustrados como personajes reconocibles: cuatro personas (**Kira** ninja, **Volt** combatiente tecnológico, **Ember** artista marcial y **Sable** luchadora acrobática) y cuatro animales antropomórficos (**Onyx** gorila, **Vex** pantera, **Rook** oso boxeador y **Atlas** lobo). Cada uno tiene complexión, rostro, pelaje o cabello, equipamiento y silueta únicos, además de velocidad, potencia y especiales diferenciados.
- **4 escenarios originales** con fondo animado y suelo de perspectiva: Neon Zenith, Templo Solar, Forja Abisal y Bastión Ártico.
- **1v1** contra CPU en cualquier dispositivo o dos jugadores en el mismo teclado en ordenador.
- Rondas de 60 s; primer jugador en ganar 2 rondas vence. Salud, energía, bloqueo, esquiva agachada, salto, gancho elevador, barrido bajo, especiales, combos encadenados, sonido opcional.
- Diseño **mobile landscape** a pantalla completa con controles mediante gestos de dos pulgares, HUD superpuesto y aviso para girar el móvil en vertical.

## Gestos en móvil (contra CPU)

**Pulgar izquierdo (lado izquierdo de la pantalla):** arrastra horizontalmente para moverte, hacia arriba para saltar, hacia abajo para cubrirte/agacharte.

**Pulgar derecho (lado derecho):** toque corto = puño, deslizamiento horizontal = patada, hacia arriba = gancho, hacia abajo = barrido, diagonal = especial (consume 40 puntos de energía), mantener = bloquear. Para encadenar combos, realiza golpes consecutivos mientras termina la animación anterior.

El doble toque no provoca zoom en navegadores compatibles (CSS touch-action y protección complementaria para Safari). Los controles gestuales funcionan con dos dedos simultáneamente. Los controles táctiles originales permanecen en el DOM para compatibilidad; la arena inmersiva se controla por zonas de deslizamiento.

## Controles de teclado

| Acción | Jugador 1 | Jugador 2 |
|---|---|---|
| Mover | A / D | ← / → |
| Saltar | W | ↑ |
| Cubrir/agacharse | S | ↓ |
| Puño | F | J |
| Patada | G | K |
| Gancho | R | U |
| Barrido | T | I |
| Especial | H | L |
| Pausar | Esc o Espacio | Esc o Espacio |

## Desarrollo

HTML, CSS, JavaScript nativo y Canvas 2D. No requiere instalación de paquetes.

Desde la raíz del repositorio:

- `node --test rift-arena/tests/*.test.mjs` — lógica y gestos.
- `node rift-arena/tests/browser-smoke.mjs` — prueba real de navegador con Chrome/Chromium.
- `python3 -m http.server 8000` — servidor local para abrir `/rift-arena/`.

Se publica en GitHub Pages directamente desde `main/rift-arena/`. El navegador Safari de iOS puede impedir el bloqueo automático de orientación: en ese caso gira el teléfono manualmente. Retratos SVG originales y combatientes Canvas articulados con gradientes de volumen, texturas de ropa y pelaje, cuerpos y detalles individuales; animaciones por poses de esqueleto para caminar, respirar, saltar, bloquear, esquivar, puño, patada, barrido, gancho, especial, reacción a impactos y caída tras KO (sin assets externos): **ilustración 2.5D más detallada, no fotorrealista**, no modelos 3D reales, controles gamepad ni multijugador online.


## Versión 3D — Arcade de consola clásica

- Motor **WebGL 1 real** integrado en `arena3d.js`, con cámara de perspectiva, z-buffer, iluminación direccional y especular, materiales sombreados, niebla ambiental, profundidad y geometría original (sin Three.js ni CDN).
- 8 luchadores creados mediante **mallas 3D articuladas**, con proporciones variadas, manos, pies, rostro y cabello o pelaje, ropa, extremidades, accesorios y animación continua a partir de las poses de combate existentes. Archivo `fighters3d.js`.
- Cuatro escenarios 3D independientes en `stage3d.js`: azoteas de neón, templo de montaña, forja industrial y fortaleza glaciar. Suelo en perspectiva, arquitectura, estructuras y decorados tridimensionales.
- Cámara lateral cinematográfica y HUD arcade; golpes con indicadores superpuestos. En móvil horizontal ocupa toda la pantalla y conserva controles por dos pulgares.
- Sin recursos remotos, anuncios, servicios de pago ni datos personales. Los navegadores sin WebGL siguen usando el renderizador Canvas 2D anterior.
- **Nota:** estética low-poly retro de consola PS2 inspirada en juegos clásicos; no es un port de Tekken, ni usa sus personajes o recursos. Los modelos son procedurales: no prometen realismo fotorrealista ni captura de movimiento.
