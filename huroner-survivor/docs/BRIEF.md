# Huroner Survivor — entrega vigente

La edición «El último claro» sustituye al juego anterior en `huroner-survivor/`. Se retira la carpeta `huroner-survivor-2/` de main. El juego antiguo queda archivado en `feature/huroner-survivor-legacy`.

Se traslada todo el proyecto, incluidos módulos, arte, configuración, pruebas y documentos. Se conserva gameplay, balance, diseño y las claves de persistencia de la edición renovada; se adapta el nombre y las referencias de ruta. No hay mecánicas nuevas ni refactorización.

## Criterios
- Rama legacy conserva íntegramente el juego anterior.
- Una única carpeta y entrada de catálogo en main: `huroner-survivor`.
- Recursos y módulos cargan bajo la ruta canónica; nombre sin sufijo 2.
- Ajustes y récord de la edición renovada siguen disponibles en el mismo origen.
- Inicio, pausa y reanudación funcionan; sin errores de página o carga.
- Pages y URL canónica comprobados tras integrar.

La QA del desarrollo original de esta edición se conserva como evidencia histórica en QA.md; no se repite por este traslado.
