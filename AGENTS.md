# AI Web Games Automata — entrada para agentes

## Objetivo
Convertir ideas de Jose en juegos web terminados dentro del alcance acordado: diseño, arquitectura, recursos, implementación, QA y publicación. Cada juego ocupa una carpeta en la raíz. No crear repositorios Git anidados.

## Arranque y lectura
1. Identifica la petición: juego nuevo, mejora, bug o documentación.
2. El coordinador lee [WORKFLOW](workflow/WORKFLOW.md) y su [rol](workflow/agents/ORCHESTRATOR.md).
3. Para juegos existentes, lee su AGENTS.md y STATE.md si existe. Inspecciona después solo documentos y código pertinentes.
4. Cada especialista recibe las reglas comunes, su rol, el encargo y las rutas necesarias. No lee todos los roles ni otros juegos.
5. Las plantillas están en workflow/templates/game/; no son instrucciones activas para juegos existentes.

## Reglas comunes
- La petición actual de Jose define el alcance. Pregunta por ambigüedades importantes; resuelve detalles técnicos autónomamente.
- Consulta cualquier mecánica complementaria antes de incorporarla. Agrupa propuestas al inicio.
- Dirección artística autónoma, con intención y coherencia.
- Código simple, modular y localizado; refactoriza solo lo necesario para el cambio.
- Prioriza iPhone/Safari y Android/Chrome; conserva una composición equilibrada en escritorio.
- No confundas emulación con pruebas físicas ni inventes evidencias.
- Integración y publicación automáticas tras QA satisfactorio, con herramientas y permisos disponibles. Nunca omitas controles para declarar éxito.
- No sobrescribas trabajo ajeno, reescribas historial ni introduzcas costes nuevos sin autorización.

## Fuentes y mantenimiento
El repositorio contiene las reglas y el estado vigente. El chat aporta la petición actual. Si documentos y código discrepan, investiga y corrige el documento del área afectada. Conserva las restricciones particulares de cada juego. No dupliques los roles dentro de los juegos.
