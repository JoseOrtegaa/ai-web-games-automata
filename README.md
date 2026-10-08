# AI Web Games Automata

Juegos web originales desarrollados con una sesión de IA + GitHub, sin workflow multiagente ni documentación de roles. Cada juego ocupa una carpeta propia y se publica mediante GitHub Pages. Reglas de trabajo: [AGENTS.md](AGENTS.md).

**Catálogo:** https://joseortegaa.github.io/ai-web-games-automata/

## Juegos

| Juego | Carpeta | Descripción |
| --- | --- | --- |
| [Ferret Jump](https://joseortegaa.github.io/ai-web-games-automata/huroner-platformer/dist/) | `huroner-platformer/` | Plataformas pixel art horizontal, controles táctiles configurables, croquetas y secretos. |
| [Huroner Survivor](https://joseortegaa.github.io/ai-web-games-automata/huroner-survivor/) | `huroner-survivor/` | Survivor vertical con espada, mejoras, cuatro mundos, bosses y arena final. |

La versión anterior de Huroner Survivor se conserva en la rama [feature/huroner-survivor-legacy](https://github.com/JoseOrtegaa/ai-web-games-automata/tree/feature/huroner-survivor-legacy/huroner-survivor).

## Desarrollo y publicación

GitHub Pages sirve la **raíz de `main`**. El catálogo está en `index.html`.

- **Huroner Survivor**: HTML/CSS/JavaScript con módulos ES, sin build. Ejecuta `npm test` desde `huroner-survivor/`. Se publica directamente desde esa carpeta.
- **Ferret Jump**: Phaser + TypeScript + Vite. Ejecuta `npm ci`, `npm test`, `npm run build` desde `huroner-platformer/`; incluye `dist/` actualizado en el commit para publicar. GitHub Actions verifica el gameplay y navegador en los cambios correspondientes.
- Para probar el sitio en local: `python3 -m http.server 8000` desde la raíz y abre `http://localhost:8000/`. Consulta el README de cada juego para sus controles, pruebas y detalles concretos.
- Para crear otro juego: carpeta independiente, README corto, pruebas proporcionales y ruta de publicación verificada sin romper el catálogo. Evita introducir agentes, estados de fase o plantillas de documentos.

Para encargar una mejora, basta indicar **repositorio + juego + cambio** y pedir «inspecciona, implementa, prueba y publica». El código, los tests y los commits son la fuente de verdad; no se requiere una cadena de agentes.
