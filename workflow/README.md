# Workflow de juegos web

Este directorio contiene instrucciones versionadas que ejecuta un agente con herramientas. No instala un servicio autónomo ni crea por sí solo conexiones entre ChatGPT, Codex y GitHub.

## Uso
Desde un chat de Work con acceso a GitHub y herramientas de desarrollo, indica:
«Trabaja en https://github.com/JoseOrtegaa/ai-web-games-automata. Lee AGENTS.md y ejecuta su workflow. Quiero crear un juego que…».

Para trabajar dentro de un Proyecto de ChatGPT, copia una vez el contenido de [PROJECT_INSTRUCTIONS.md](PROJECT_INSTRUCTIONS.md) en sus instrucciones. No hace falta subir copias de todos los documentos. Después puedes describir directamente cada juego o cambio.

El agente debe comprobar acceso real a lectura/escritura, ejecución, navegador y publicación cuando esas capacidades sean necesarias. Un chat que solo puede leer puede analizar o proponer, pero no afirmar que ha implementado o publicado.

## Organización
- [WORKFLOW.md](WORKFLOW.md): fases, rutas de trabajo y entrega.
- [TECHNOLOGY.md](TECHNOLOGY.md): criterios tecnológicos y publicación.
- [agents/](agents/): seis roles, cargados bajo demanda.
- [templates/README.md](templates/README.md): creación de documentación específica.
- [templates/game/](templates/game/): base documental para un juego nuevo.

El orquestador usa subagentes reales cuando estén disponibles. Si no lo están, ejecuta los roles secuencialmente e informa de esa limitación; no presenta esa revisión como independiente.

## Alcance de esta instalación
Se incorporan instrucciones y plantillas. No se instala todavía un servidor, una plataforma externa de agentes ni un nuevo pipeline de despliegue. El primer juego que requiera build o backend debe implementar y verificar su ruta de publicación conforme a TECHNOLOGY.md.

Los juegos existentes mantienen sus rutas y arquitectura. La documentación adicional se incorpora de forma selectiva cuando una tarea la necesite.
