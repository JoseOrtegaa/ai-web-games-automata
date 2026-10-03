# Huroner Survivor — estado vigente

## Objetivo / fase
Reemplazar el pool global de bosses por cinco bosses temáticos y aleatorios para cada mundo. Implementación, QA lógico e integración en `main` completados.

## Bosses por mundo
- Superficie: Hermanos del eclipse, Codorniz prismática, Pollo bastión, Liebre cornuda, Viuda de espinas.
- Subsuelo: Caballero del osario, Oráculo de médula, Bombardero de cráneos, Campanero del sepulcro, Sabueso del osario.
- Profundidades: Coloso de granito, Vidente de cristal, Carnero de cantera, Tejedora de obsidiana, Artillero de la falla.
- Magma: Sabueso del infierno, Segador de ceniza, Coloso de lava, Oráculo piromante, Ariete volcánico.
- Rey final de 600 s permanece separado.

## Implementación
`bosses.js`: `BOSS_POOLS` (4×5), 20 definiciones, selección por `worldDepth`, separación `bossType` / `bossProfile` / `bossTheme` / `bossForm`.
`boss-art.js`: 15 siluetas nuevas para capas inferiores, paletas de hueso/roca/magma y hazards/proyectiles temáticos.
`app.js`: HUD consulta mecánica Bastión por perfil.
Tests de bosses adaptados a catálogo y pools.

## QA
PASS lógico:
- 20 bosses, 5 perfiles y 5 formas distintas por mundo;
- selección aleatoria restringida a la capa y sin repetición inmediata;
- los 20 bosses ejecutan su perfil asignado;
- ataques extra siguen alcanzables por perfil;
- cinco bosses simultáneos por mundo respetan 64 hazards / 150 proyectiles y estado finito;
- rey final de 10 minutos sigue separado;
- bosses.js, boss-art.js y app.js parsean.

No se afirma prueba física en iPhone ni ejecución de la suite Node desde checkout local: el contenedor de esta sesión no pudo resolver github.com.

## Integración
PR #8 fusionado en `main` el 2026-10-03. Merge squash: `aff246fa4fe948c7af9e8bab242652405aa9e0ac`.

## Contexto preservado
Familias normales por mundo ya integradas. Cuevas: primera bajada tras boss 5/10 aleatorio, siguientes tras 15/30. Modo DEV `?dev=1`. Ataque automático por defecto. XP 30/70 con remanente redondeado; escudo 20→120; ataque 0,25 s; zoom bloqueado.

## Siguiente paso
Probar visualmente bosses de las cuatro capas en móvil y ajustar tamaño/contraste/telegráficos si alguno lo necesita.
