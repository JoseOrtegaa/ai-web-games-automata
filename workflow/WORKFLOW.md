# Workflow operativo

## 1. Principio de ejecución

El orquestador usa siempre la ruta mínima que pueda completar y comprobar la petición. Un rol describe una responsabilidad; **no implica abrir un agente, contexto o proceso separado**.

La delegación es excepcional: solo se crea un especialista independiente cuando existe una decisión sustancial que el orquestador o el programador no deben inventar. No se delega para volver a leer, resumir, validar ceremonialmente ni repetir trabajo ya resuelto.

Orden de prioridad:
1. Reanudar trabajo ya existente.
2. Resolver en el contexto actual cuando la decisión sea evidente.
3. Delegar solo la especialidad imprescindible.
4. Programar.
5. Hacer QA proporcional al riesgo.
6. Integrar y publicar cuando corresponda.

## 2. Inicio y reanudación

El orquestador identifica juego, tarea, revisión actual y estado real del repositorio. Lee su propio rol, el AGENTS local y STATE cuando existan; después abre únicamente archivos pertinentes.

### Reanudación de trabajo interrumpido
Si existe trabajo parcial, STATE, cambios sin integrar o una entrega anterior incompleta:
- verifica primero qué está realmente terminado y qué falta;
- continúa desde el último punto comprobable;
- **no repite diseño, arquitectura, diseño visual ni análisis ya documentados**;
- no reconstruye contexto histórico salvo que una inconsistencia lo exija;
- usa el diff, STATE y los archivos afectados como fuente principal;
- envía directamente el trabajo pendiente al programador o QA cuando las decisiones necesarias ya existen.

Una reanudación no se trata como juego nuevo.

Para un juego nuevo, el orquestador crea un brief breve con objetivo, loop, controles, orientación, victoria/derrota, alcance, exclusiones y criterios observables. Si faltan decisiones sustanciales, agrupa las preguntas. Los detalles técnicos razonables se resuelven sin pedir aprobación ceremonial.

Las mecánicas complementarias propuestas por los agentes requieren consulta explícita. La dirección artística puede resolverse autónomamente dentro del alcance aceptado.

## 3. Ruta según tarea

| Tarea | Ruta predeterminada |
| --- | --- |
| Reanudar entrega interrumpida | Orquestador → pendiente real → QA si procede → entrega |
| Bug localizado | Programador → QA localizado |
| Ajuste pequeño de gameplay | Programador → QA; diseñador solo si falta una regla de juego |
| Ajuste visual ya definido | Programador → QA visual localizado |
| Nueva decisión visual | Diseñador visual → programador → QA |
| Feature normal | Orquestador → especialista imprescindible, si existe una decisión pendiente → programador → QA |
| Cambio estructural real | Arquitecto → programador → QA |
| Juego nuevo sencillo | Planificación consolidada → programador → QA |
| Juego nuevo complejo | Orquestador → especialistas estrictamente necesarios → programador → QA |
| Solo documentación | Autor del documento → revisión de coherencia |

No se invoca arquitectura si no cambian responsabilidades, contratos o límites. No se invoca diseño de juego si el comportamiento solicitado ya está definido. No se invoca diseño visual si solo se implementa una decisión visual existente.

## 4. Planificación consolidada

Para un juego nuevo o una feature que requiera varias disciplinas, el orquestador intenta primero resolver una **fase única de planificación** con:
- reglas jugables necesarias;
- arquitectura mínima;
- dirección visual esencial;
- criterios de QA.

Esta fase puede aplicar las listas de comprobación de los roles sin abrir procesos separados.

Se delega un especialista independiente únicamente cuando:
- hay varias alternativas razonables con impacto importante;
- la decisión requiere inspección o razonamiento especializado relevante;
- existe una incompatibilidad entre áreas;
- o el resultado necesita una revisión realmente independiente.

Por defecto, una entrega usa **cero o un especialista delegado antes del programador**. Un juego nuevo puede usar más cuando esté justificado, pero nunca se ejecuta automáticamente la cadena completa diseñador → arquitecto → visual solo por ser un juego nuevo.

## 5. Entradas, salidas y responsables

| Responsable | Lee | Produce |
| --- | --- | --- |
| Orquestador | Petición, AGENTS local, STATE, diff y fuentes necesarias | BRIEF/STATE, decisiones y coordinación |
| Diseñador de juego | BRIEF y gameplay afectado | Reglas y criterios jugables |
| Arquitecto | BRIEF, contratos afectados y TECHNOLOGY | Decisiones estructurales necesarias |
| Diseñador visual | BRIEF, gameplay y límites gráficos pertinentes | Dirección visual y recursos necesarios |
| Programador | Criterios, decisiones vigentes y código afectado | Código, recursos y pruebas pertinentes |
| QA | Criterios, diff y riesgos afectados | PASS, FAIL o BLOCKED con evidencia |

El orquestador recibe conclusiones y evidencias; no relee todo el razonamiento de cada especialista.

## 6. Presupuesto de contexto y delegación

- AGENTS raíz/local: hasta 350/300 palabras.
- Roles: hasta 700 palabras.
- Traspasos: hasta 200 palabras.
- Busca por archivo, símbolo o sección antes de leer bloques grandes.
- No leas todos los roles para ejecutar una tarea; abre solo el rol que se vaya a usar.
- No cargues otros juegos.
- No releas documentos sin cambios durante una misma entrega salvo necesidad concreta.
- Un especialista recibe objetivo, criterios, rutas necesarias, archivos editables, restricciones y condición de parada.
- Evita delegación recursiva. Solo el orquestador coordina especialistas.
- No abras un especialista para resumir la salida de otro.
- Paraleliza únicamente trabajo verdaderamente independiente.
- STATE describe el presente; Git conserva la historia.

Si una tarea puede resolverse correctamente con menos contextos, herramientas o rondas, se elige esa opción.

## 7. Implementación

El programador implementa exactamente el alcance acordado y trabaja solo sobre los archivos necesarios. Refactoriza únicamente si el cambio lo requiere.

Para una reanudación:
1. lee el checkpoint y el diff real;
2. identifica el siguiente cambio incompleto;
3. continúa desde allí;
4. no repite pasos ya verificados.

Cuando una sesión pueda agotarse antes de terminar, prioriza dejar un checkpoint recuperable: código válido en rama o commit seguro cuando las herramientas lo permitan y STATE con fase, revisión, completado, pendiente y siguiente paso concreto.

## 8. QA proporcional al riesgo

QA relaciona criterios con comprobaciones observables y declara PASS, FAIL o BLOCKED.

- Cambio pequeño: prueba la funcionalidad afectada y dependencias inmediatas.
- Feature normal: prueba criterios, loop afectado y regresiones relevantes.
- Juego nuevo: prueba loop principal, controles, victoria/derrota, reinicio, presentación y build cuando corresponda.
- No se repite toda la suite ni todo el gameplay sin motivo.
- Un build correcto no demuestra jugabilidad.
- No se inventan pruebas físicas ni evidencias.

Tras un fallo, devuelve el defecto al responsable correcto. Repite únicamente la prueba fallida y las relacionadas. Tras dos intentos sin progreso sobre el mismo defecto, cambia de hipótesis antes de continuar.

## 9. Git y publicación

La autorización de Jose cubre commits, push, integración y publicación tras QA satisfactorio. No requiere confirmación rutinaria. No autoriza costes nuevos, force-push, pérdida de trabajo ajeno ni eludir protecciones.

Trabaja sobre la revisión actual y una rama aislada cuando sea posible. Antes de integrar:
- revisa diff;
- excluye secretos, dependencias instaladas y temporales;
- integra solo cambios de la tarea;
- vuelve a comprobar superficies afectadas si main avanzó.

Main puede disparar publicación según la configuración vigente. Commit, integración, despliegue iniciado y despliegue verificado son estados distintos.

## 10. Recuperación y cierre

STATE debe permitir retomar sin reconstruir toda la conversación. Mantén:
- objetivo vigente;
- fase actual;
- decisiones duraderas;
- revisión/rama;
- archivos principales afectados;
- completado;
- pendiente;
- defectos abiertos;
- pruebas realizadas;
- siguiente paso concreto.

Al retomar, confirma el estado real antes de actuar. Finaliza con un resumen breve, referencia del commit, enlace jugable cuando exista y limitaciones materiales. No prometas continuidad fuera de las capacidades disponibles.
