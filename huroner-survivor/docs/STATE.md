# Huroner Survivor — estado vigente

## Objetivo y fase
Promover la edición renovada a `huroner-survivor/`, retirar `huroner-survivor-2/` de main y conservar el juego antiguo en una rama. Implementación del traslado terminada; QA localizado PASS en Chromium/WebKit; publicación pendiente. Diseño, arquitectura y gameplay ya validados: no repetir fases.

## Revisión y conservación
Base: 1e30b200f23882ada2a4231daa2948330bd44b6b. Rama de archivo creada: `feature/huroner-survivor-legacy`, apuntando a esa revisión; el juego antiguo está en su carpeta `huroner-survivor/`. Edición renovada procede del commit 51b6192.

## Cambios
Traslado íntegro de módulos, recursos, pruebas y documentos. Nombre visible y paquete pasan a Huroner Survivor; catálogo con una entrada. Rutas de herramientas/documentación actualizadas. Las claves `huroner-survivor-2:preferences:v1` y `huroner-survivor-2:record:v1` se conservan deliberadamente: localStorage depende del origen, no de la carpeta, y así se mantienen ajustes y récords de esta edición. No migrar ni borrar los datos del juego legacy.

## Verificación
Se reutiliza la QA previa del código de juego (27 casos unitarios, 45 comprobaciones Chromium/WebKit y retest de paneles). Esta tarea solo requiere verificar rutas, carga, nombre, persistencia y controles básicos. Sin cambios de reglas ni arte.

## Límites y siguiente paso
Rendimiento limitado bajo carga extrema; sin pruebas físicas ni auditivas. Humo local completado. Integrar y verificar Pages en `/ai-web-games-automata/huroner-survivor/`. Registrar resultado en QA y aquí.
