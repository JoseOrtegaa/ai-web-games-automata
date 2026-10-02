# Workflow operativo

## 1. Inicio
El orquestador comprueba el repositorio y su revisión, identifica el juego y clasifica la tarea. Lee su propio rol y solo las fuentes requeridas. Comprueba las capacidades necesarias para completar el encargo; una conexión de lectura a GitHub no equivale a ejecutar, probar o publicar.

Para un juego nuevo, convierte la idea en un brief breve con objetivo, loop, controles, orientación, victoria/derrota, alcance, exclusiones y criterios observables. No analiza rentabilidad salvo petición. Si faltan decisiones sustanciales o el alcance exige varias entregas, presenta una ronda agrupada de preguntas y una división propuesta antes de programar. Una duda posterior que realmente bloquee puede requerir otra pregunta.

Comunica la entrega y las suposiciones técnicas razonables; continúa sin pedir aprobación ceremonial. Las mecánicas complementarias propuestas por los agentes requieren consulta explícita. No implementarlas mientras esperan respuesta. Dirección artística y detalles de implementación son autónomos.

## 2. Ruta según tarea

| Tarea | Roles necesarios |
| --- | --- |
| Juego nuevo | Orquestador → diseñador de juego → arquitecto → diseñador visual → programador → QA → entrega |
| Mecánica o sistema nuevo | Diseñador de juego → arquitecto si cambia contratos → programador → QA; visual si afecta presentación |
| Cambio visual | Diseñador visual → programador → QA |
| Bug localizado | Programador → QA |
| Cambio estructural | Arquitecto → programador → QA |
| Solo documentación | Autor del documento → revisión de coherencia y enlaces; sin pruebas de gameplay innecesarias |

El orquestador coordina todas las rutas. No invoca roles que no aporten una decisión necesaria. Un rol no equivale obligatoriamente a un proceso adicional en una tarea pequeña.

## 3. Entradas, salidas y responsables

| Responsable | Lee | Escribe |
| --- | --- | --- |
| Orquestador | Petición, AGENTS local, STATE, conclusiones de especialistas | BRIEF inicial, STATE, coordinación y entrega |
| Diseñador de juego | BRIEF y restricciones relevantes | Gameplay y criterios jugables de DESIGN; refinamientos de BRIEF |
| Arquitecto | BRIEF, gameplay de DESIGN, TECHNOLOGY | ARCHITECTURE y mapa técnico del AGENTS local |
| Diseñador visual | BRIEF, DESIGN, límites gráficos y de input | Secciones artísticas de DESIGN y recursos |
| Programador | Criterios del cambio, diseño y contratos relevantes | Código, pruebas necesarias y comandos del AGENTS local |
| QA | Criterios de BRIEF, diseño relevante, comandos y diff | QA con resultados y defectos reproducibles |

Los dos diseñadores editan DESIGN de forma secuencial y conservan las secciones ajenas. El orquestador integra actualizaciones de AGENTS y STATE. Si cambia un contrato o decisión artística, devuelve la decisión al responsable antes de implementarla; una revisión breve es suficiente.

## 4. Ejecución de un juego nuevo
1. Completa BRIEF y los criterios que comprobará QA.
2. Crea la carpeta del juego y documentos desde las plantillas; sigue templates/README.md.
3. Define gameplay; consulta las mecánicas adicionales.
4. Define arquitectura mínima, stack, pruebas y publicación.
5. Materializa dirección visual, recursos e interacciones. El arquitecto revisa solo incompatibilidades técnicas surgidas.
6. Implementa una porción jugable completa para comprobar el loop; continúa hasta el alcance acordado, sin presentar esa porción como entrega final si falta trabajo.
7. QA revisa funcionalidad, diseño y regresiones. Corrige los defectos y vuelve a comprobar lo afectado.
8. Actualiza estado y documentación, revisa el diff e integra/publica.

## 5. Contexto y delegación
- Encargo de especialista: objetivo, criterios de aceptación, rutas de entrada, archivos editables, restricciones, salida esperada y condición de parada.
- Usa contextos nuevos y acotados cuando la herramienta lo permita. No heredes por comodidad toda la conversación.
- Orientación: AGENTS raíz/local hasta 350/300 palabras; roles hasta 700; traspasos hasta 200. Son presupuestos de síntesis, no excusa para omitir un contrato necesario.
- Busca por archivo, símbolo o sección antes de leer grandes bloques. Amplía solo para resolver dependencias o incertidumbre.
- El orquestador recibe conclusiones, rutas y evidencias; no relee todo el trabajo de cada especialista.
- Por defecto, un escritor por archivo y trabajo secuencial. Paraleliza solo encargos independientes; coordina integración antes de editar archivos compartidos.
- Máximo tres especialistas simultáneos salvo necesidad concreta. Evita delegación recursiva: la coordina el orquestador.
- Elimina duplicación documental. STATE describe el presente; Git conserva la historia.

## 6. QA y reparación
QA declara PASS, FAIL o BLOCKED. Un criterio obligatorio no comprobado queda BLOCKED, nunca PASS. Documenta navegador, entorno, revisión probada y evidencias pertinentes.

Tras dos intentos fallidos sobre el mismo defecto sin progreso, detén ese patrón y revisa la causa con el responsable apropiado. Continúa si existe una hipótesis nueva comprobable. Si faltan acceso o una decisión del usuario, registra el bloqueo y pregunta de forma concreta. No repitas indefinidamente ni rebajes requisitos para aprobar.

La puerta predeterminada usa pruebas de lógica, build cuando exista, revisión visual e interacción en navegadores disponibles, con Chromium/WebKit emulados para aproximar los móviles cuando estén disponibles. No exige un dispositivo físico para cada entrega; sí exige declarar qué cobertura existe. Si un requisito necesita hardware real, define esa comprobación al concretar el alcance.

## 7. Git y publicación automática
La autorización de Jose cubre commits, push, integración y publicación tras QA. No requiere confirmación rutinaria. No autoriza costes nuevos, eliminar trabajo ajeno, force-push ni eludir protecciones.

Trabaja sobre la revisión actual y una rama/checkout aislado cuando sea posible. Revisa archivos y diff; excluye secretos, dependencias instaladas y temporales. Integra solo cambios de la tarea. Si main avanzó, incorpora sus cambios y vuelve a validar las superficies afectadas. Respeta las protecciones y comprobaciones del repositorio.

Main dispara actualmente publicación según el README: no subas código incompleto a esa rama. Para un checkpoint pendiente usa una rama de trabajo. Para cambios documentales basta revisión documental; no ejecutes gameplay sin motivo.

Publica mediante el mecanismo configurado. Para un nuevo build, define primero cómo conservar el catálogo y las rutas de los demás juegos. Comprueba el estado del despliegue y abre la URL jugable para una prueba mínima. Commit, integración, despliegue iniciado y despliegue verificado son estados diferentes. Si falla la publicación, informa y registra el punto exacto; no declares éxito.

## 8. Recuperación y cierre
Actualiza STATE en hitos o antes de detenerte: alcance cumplido/restante, fase, decisiones, defectos, pruebas y próximo paso concreto. Conserva el trabajo recuperable en una rama cuando la sesión pueda interrumpirse. No dependas de archivos temporales o de la memoria del chat.

Al retomar, lee instrucciones vigentes, estado y revisión de esa rama; verifica el avance real antes de repetir tareas. Finaliza con un resumen breve, enlace jugable verificado, referencia del commit y limitaciones materiales. No prometas reanudación automática fuera de las capacidades disponibles.
