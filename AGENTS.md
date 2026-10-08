# ai-web-games-automata — reglas mínimas

Usa **una sola sesión de IA con GitHub** para diseñar, implementar, probar y publicar. No hay workflow multiagente ni roles separados obligatorios.

- Lee la petición, el código y el README del juego afectado; revisa la rama actual y conserva el trabajo previo. No modifiques otros juegos ni reutilices sus recursos salvo utilidades realmente comunes.
- Prioriza prototipos **jugables**, originales, con código simple y mantenible. No inventes mecánicas importantes ajenas a lo solicitado. Para nuevos juegos 2D, valora Phaser + TypeScript + Vite; conserva el stack de los existentes.
- Mobile-first: controles táctiles, orientación, safe areas, prevención de zoom/scroll durante la partida y presentación correcta en escritorio. Respeta privacidad, guardados existentes y accesibilidad.
- **0 € de gasto autorizado.** Sin backend, APIs facturables ni servicios nuevos con coste sin permiso explícito. Nunca publiques secretos.
- QA proporcional: pruebas existentes, build si aplica y comprobación real del flujo jugable/controles. Un build verde no demuestra jugabilidad. No declares pruebas físicas de iPhone/Safari si solo has emulado.
- Despliegue: GitHub Pages sirve `main` desde la raíz. `huroner-survivor/` se publica directamente; Ferret Jump compila y **versiona `huroner-platformer/dist/`**. Mantén el catálogo y las rutas de otros juegos.
- Integra/publica los cambios autorizados tras QA correcto y confirma el enlace cuando puedas. Resume cambios, comprobaciones, commit y limitaciones; evita checkpoints y documentos ceremoniales.
