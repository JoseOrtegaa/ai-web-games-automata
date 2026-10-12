# Rift Arena

Arcade original de lucha 1 contra 1, inspirado en la intensidad de los juegos de lucha de consola de finales de los 90. **No utiliza personajes, gráficos, música, logotipos ni escenarios de ninguna franquicia existente.** Sin backend, cookies, compras, IA externa ni dependencias: 0 €.

## Personajes aprobados — 12 de octubre de 2026

Se integran las ocho referencias visuales originales: sensei, monje, toro, dos luchadoras, gato, panda y lobo. Se mantienen los identificadores/nombres del juego (Ryuzo, Drake, Brute, Titan, Selene, Razor, Ursus y Fang) y sus perfiles de combate. El selector muestra las imágenes originales; el combate usa recortes transparentes derivados de ellas. Recursos locales WebP, sin CDN ni peticiones a IA durante el juego.

El renderizado de personajes es **2.5D**: una malla 2D con textura se anima dentro de escenarios WebGL 3D. Hay respiración, desplazamiento, salto, guardia, agachado, golpes, retroceso y KO. Conserva detalles visuales mucho mejor que los modelos geométricos anteriores, que se han eliminado. **No son modelos 3D volumétricos ni animaciones de producción**: la extracción de fondo y la deformación de una única pose pueden introducir diferencias respecto a la referencia. No se garantiza identidad exacta en todas las poses.

Ocho escenarios: Neon Zenith, Templo Solar, Forja Abisal, Bastión Ártico, Bosque Ancestral, Cráter Infernal, Lago de Cristal y Cumbres Sagradas. 1v1 contra CPU o versus local con dos jugadores en teclado. Rondas de 60 segundos, primero en ganar dos; salud, energía, combos, bloqueo, saltos, gancho, barrido y especiales. Móvil horizontal, dos pulgares, prevención de zoom y pausa. El inicio espera a que estén cargados los ocho personajes; si falla la descarga, muestra un mensaje para recargar.

## Controles

En móvil, arrastra con el pulgar izquierdo para moverte; arriba salta, abajo cubre. Con el derecho: toque = puño, horizontal = patada, arriba = gancho, abajo = barrido, diagonal = especial, mantener = bloquear.

| Acción | Jugador 1 | Jugador 2 |
|---|---|---|
| Mover | A / D | ← / → |
| Saltar | W | ↑ |
| Cubrir | S | ↓ |
| Puño / patada | F / G | J / K |
| Gancho / barrido | R / T | U / I |
| Especial | H | L |
| Pausa | Esc / Espacio | Esc / Espacio |

## Desarrollo y publicación

HTML/CSS/JavaScript nativo, WebGL 1 y alternativa Canvas 2D. Sin backend, cuentas, servicios de pago ni dependencias de ejecución.

Desde la raíz:

- `node --test rift-arena/tests/*.test.mjs`
- `node rift-arena/tests/browser-smoke.mjs` (Chrome/Chromium, o `CHROME_BIN`)
- `python3 -m http.server 8000`, abrir `/rift-arena/`.

GitHub Pages publica directamente `main/rift-arena/`. QA con navegador de escritorio y emulación móvil; no equivale a probar Safari en un iPhone físico.
