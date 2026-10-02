# Huroner Survivor

Edición actual de Huroner Survivor: un hurón con espada sobrevive a hordas mutantes durante diez minutos y derrota al jefe final. Conserva contenido y balance del original, con presentación «El último claro», módulos separados y almacenamiento propio. El juego anterior está archivado en la rama `feature/huroner-survivor-legacy`, dentro de `huroner-survivor/`.

## Ejecutar

Desde esta carpeta, sin instalar dependencias ni compilar:

```bash
npm test
python3 -m http.server 8000 --directory ..
```

Abrir <http://localhost:8000/huroner-survivor/>. Usar un servidor HTTP: los módulos no deben abrirse con `file://`.

## Jugar

- Móvil: arrastrar por la arena para mover el joystick; usar otro dedo para pulsar ataque.
- Escritorio: WASD o flechas para moverse, espacio para atacar y Escape para pausar/reanudar. También se puede arrastrar con el ratón.
- Ajustes: ataque manual o automático, botón a izquierda/derecha, sonido e idioma ES/EN.
- Ambos modos atacan al enemigo vivo más cercano y comparten una recarga de 0,25 segundos.
- Recoger experiencia permite elegir mejoras; cada cinco niveles aparece un jefe. A los diez minutos llega el jefe final: hay que derrotarlo para ganar.
- Pausa y elección detienen la simulación. Cambiar de pestaña pausa el combate; se reanuda con una acción explícita.

Las preferencias y el récord se guardan localmente cuando el navegador lo permite. No se guarda una partida en curso ni se requiere cuenta o conexión a un servicio.

## Organización

| Archivo | Responsabilidad |
| --- | --- |
| `core.js` | Simulación, reglas, balance y eventos; RNG inyectable, sin navegador. |
| `app.js` | Pantallas, HUD, preferencias y único bucle de actualización. |
| `render.js`, `art.js`, `assets/` | Cámara, arena, personajes y recursos visuales. |
| `input.js` | Teclado, joystick, multitáctil y cancelación de punteros. |
| `audio.js` | Música y efectos mediante Web Audio. |
| `storage.js`, `i18n.js` | Validación de persistencia y textos ES/EN. |
| `index.html`, `style.css` | Estructura, interfaz adaptable y safe areas. |
| `tests/` | Regresiones deterministas del core y almacenamiento falso. |

Se conservan las claves de la edición renovada para mantener ajustes y récords al cambiar de URL: `huroner-survivor-2:preferences:v1` y `huroner-survivor-2:record:v1`; no se leen ni migran datos de V1. El primer resultado `dead`/`won` es irreversible hasta reiniciar, y detiene las reglas posteriores del mismo paso.

Las pruebas automatizadas se ejecutan también con `node --test tests/*.test.js`. La verificación de navegador, sus limitaciones y la publicación se registran en [QA](docs/QA.md) y [STATE](docs/STATE.md). Los contratos técnicos están en [ARCHITECTURE](docs/ARCHITECTURE.md); alcance y dirección visual, en [BRIEF](docs/BRIEF.md) y [DESIGN](docs/DESIGN.md).
