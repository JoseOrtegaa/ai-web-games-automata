# Rift Arena

Arcade original de lucha 1 contra 1, inspirado en la intensidad de los juegos de lucha de consola de finales de los 90. **No utiliza personajes, gráficos, música, logotipos ni escenarios de ninguna franquicia existente.** Sin backend, cookies, compras, IA externa ni dependencias: 0 €.

## Versión actual

- **8 personajes originales:** Kira, Volt, Onyx, Ember, Vex, Rook, Sable y Atlas, con velocidades, potencia y especiales diferenciados.
- **4 escenarios originales** con fondo animado y suelo de perspectiva: Neon Zenith, Templo Solar, Forja Abisal y Bastión Ártico.
- **1v1** contra CPU en cualquier dispositivo o dos jugadores en el mismo teclado en ordenador.
- Rondas de 60 s; primer jugador en ganar 2 rondas vence. Salud, energía, bloqueo, esquiva agachada, salto, gancho elevador, barrido bajo, especiales, combos encadenados, sonido opcional.
- Diseño **mobile landscape** a pantalla completa con controles mediante gestos de dos pulgares, HUD superpuesto y aviso para girar el móvil en vertical.

## Gestos en móvil (contra CPU)

**Pulgar izquierdo (lado izquierdo de la pantalla):** arrastra horizontalmente para moverte, hacia arriba para saltar, hacia abajo para cubrirte/agacharte.

**Pulgar derecho (lado derecho):** toque corto = puño, deslizamiento horizontal = patada, hacia arriba = gancho, hacia abajo = barrido, diagonal = especial (consume 40 puntos de energía), mantener = bloquear. Para encadenar combos, realiza golpes consecutivos mientras termina la animación anterior.

Los controles gestuales funcionan con dos dedos simultáneamente. Los controles táctiles originales permanecen en el DOM para compatibilidad; la arena inmersiva se controla por zonas de deslizamiento.

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

Se publica en GitHub Pages directamente desde `main/rift-arena/`. El navegador Safari de iOS puede impedir el bloqueo automático de orientación: en ese caso gira el teléfono manualmente. Arte y animaciones dibujados por Canvas: **estética arcade 2.5D**, no modelos 3D reales, controles gamepad ni multijugador online.
