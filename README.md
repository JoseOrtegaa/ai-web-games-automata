# AI Web Games Automata

Juegos web creados íntegramente por IA siguiendo las indicaciones de Jose, sin programación manual. Cada juego vive en su propia carpeta y se publica en GitHub Pages para jugar directamente desde el navegador.

**Catálogo:** https://joseortegaa.github.io/ai-web-games-automata/

## Juegos

| Juego | Carpeta | Descripción |
| --- | --- | --- |
| [Ferret Jump](https://joseortegaa.github.io/ai-web-games-automata/huroner-platformer/dist/) | `huroner-platformer/` | Plataformas pixel art horizontal: explora una casa gigante, encuentra secretos y salta con un hurón bípedo. |
| [Huroner Survivor](https://joseortegaa.github.io/ai-web-games-automata/huroner-survivor/) | `huroner-survivor/` | Survivor vertical: hurón con espada, hordas mutantes, mejoras, bosses y ataque automático o por botón configurable. |

La edición actual de Huroner Survivor incorpora «El último claro». El código anterior está archivado en [feature/huroner-survivor-legacy](https://github.com/JoseOrtegaa/ai-web-games-automata/tree/feature/huroner-survivor-legacy/huroner-survivor).

El archivo `index.html` es el catálogo. Los futuros juegos se añadirán en carpetas independientes.

## Publicación y desarrollo

GitHub Pages sirve la raíz de la rama `main`; cada carpeta con `index.html` tiene su propia ruta. No requiere servicios externos ni claves de API.

Ferret Jump usa TypeScript + Phaser + Vite. Su fuente está en `huroner-platformer/` y su build reproducible/versionado en `huroner-platformer/dist/`. Consulta su [README](huroner-platformer/README.md) para desarrollo y QA. No se cambió la publicación del resto del catálogo.

Para probar los artefactos publicados en local: `python3 -m http.server 8000` y abrir `http://localhost:8000/`.

## Workflow de desarrollo autónomo

Las reglas y los contextos viven en este repositorio. Punto de entrada: [AGENTS.md](AGENTS.md). Guía de uso: [workflow/README.md](workflow/README.md).

- [Instrucciones para tu Proyecto de ChatGPT](workflow/PROJECT_INSTRUCTIONS.md)
- [Flujo y reglas de contexto](workflow/WORKFLOW.md)
- [Roles de los agentes](workflow/agents/)
- [Plantillas para nuevos juegos](workflow/templates/README.md)
- [Tecnología, build y futuro multijugador](workflow/TECHNOLOGY.md)

Desde un chat con las herramientas necesarias, indica el repositorio, pide leer AGENTS.md y describe el juego o cambio. El workflow concreta la entrega, coordina diseño y programación, comprueba QA y publica automáticamente cuando las condiciones se cumplen.

Los juegos existentes conservan su estructura. Para juegos nuevos con compilación o servidor, la arquitectura debe definir e implementar su publicación; las instrucciones no instalan por sí solas esa infraestructura.
