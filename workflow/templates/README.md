# Plantillas por juego

Para juegos nuevos, copia game/ al directorio raíz <slug>/, conservando su estructura. Sustituye {{GAME_NAME}} y {{GAME_SLUG}}; completa el contenido conforme cada fase resuelva sus decisiones. Estos documentos describen un juego, no crean agentes adicionales.

AGENTS.md es un mapa corto. BRIEF contiene alcance; DESIGN, gameplay y arte; ARCHITECTURE, estructura; STATE, punto de continuación; QA, evidencia vigente. Cada dato tiene un lugar principal. Enlaza en vez de duplicar.

Registra en STATE la revisión del workflow usada al crear el juego. Una actualización de plantillas se aplica a juegos futuros: nunca recopies la plantilla sobre documentación completada. Las reglas globales se consultan vigentes, conservando decisiones particulares compatibles.

En juegos existentes conserva documentos, rutas y reglas. Añade solo la documentación necesaria para la tarea; no ejecutes una migración documental completa para corregir un bug.

No crees carpetas src, server, packages o assets hasta que la arquitectura las necesite. Elimina de cada documento secciones que no apliquen; usa «No aplica: motivo» cuando evite dudas. No dejes placeholders como decisiones aparentes al entregar.

El nombre <slug> debe ser único y apto para URL. Mantén las rutas públicas existentes. No copies aquí ni dentro de cada juego los contextos globales de agentes.
