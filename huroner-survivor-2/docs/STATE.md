# Huroner Survivor 2 — estado vigente

## Objetivo y fase
Versión independiente con las reglas existentes, presentación «El último claro» y módulos separados. Diseño, arquitectura, arte, implementación y QA funcional completados. Integración/publicación pendiente; no repetir fases anteriores.

## Revisión
Origen del juego: 40dbf9245aeda9b7f418276cfe96d677b7465671.
Base remota de integración: b32337f6d2b0c50cfd8924bc5d974dcfb5d0bef0 (workflow actualizado). Rama de trabajo: work/huroner-survivor-2. Identidad del código probado: docs/tested-files.json.

## Decisiones duraderas
- HTML/CSS/ES Modules/Canvas, sin dependencias runtime ni backend.
- Preservar contenido y balance. Primer terminal irreversible y recarga manual/auto compartida de 0,25 s.
- Dirección visual: petróleo, cobre, marfil y carmesí; arte original SVG/Canvas.
- Preferencias y récord de V2 aislados. V1 intacta.

## Completado y archivos
Juego completo en esta carpeta; contratos en ARCHITECTURE y presentación en DESIGN. Catálogo raíz preparado. Corregidos render duplicado, costuras de suelo y paneles altos en horizontal.

## QA y límites
27 casos unitarios pasan; 45 comprobaciones de navegador pasan; retest localizado de paneles en Chromium/WebKit pasa. Evidencia y comandos en QA.md. Sin defectos funcionales bloqueantes abiertos. Rendimiento limitado bajo carga sintética extrema; sin pruebas físicas en teléfonos ni verificación auditiva.

## Pendiente y siguiente paso
Integrar este contenido, comprobar Pages y ejecutar humo público. Registrar commit, despliegue y resultado en este documento y QA. No reabrir diseño/arquitectura ni repetir la matriz local sin nuevo defecto.
