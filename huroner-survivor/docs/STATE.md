# Huroner Survivor — estado vigente

## Objetivo / fase
Corregir el jitter de cámara observado alrededor del nivel 23 cuando varios enemigos con embestida coinciden. Implementación, QA localizado e integración en `main` completados.

## Causa
En Profundidades el stone_boar usa ram. Cada embestida aplicaba un empujón físico de 34 px antes de comprobar si el jugador seguía invulnerable por otro golpe. Con varios jabalíes, golpes que no causaban daño seguían desplazando al jugador; como la cámara lo sigue, la escena parecía temblar/saltar repetidamente.

## Corrección
- hurt() devuelve ahora si el impacto realmente entró.
- El empujón de ram solo se aplica cuando hurt() devuelve true.
- Embestidas bloqueadas por los 0,65 s de invulnerabilidad se consumen pero no desplazan al jugador.
- Un impacto válido mantiene el empujón de 34 px y el screen shake existente (shake=5), por lo que no se pierde feedback.

## QA
PASS lógico localizado:
- una embestida válida sigue causando daño, 34 px de knockback y shake=5;
- 7 embestidas solapadas durante invulnerabilidad añaden 0 px de knockback;
- al terminar la invulnerabilidad una nueva embestida válida vuelve a empujar 34 px;
- hurt() distingue impacto aplicado (true) de impacto bloqueado (false);
- core.js parsea correctamente.

## Integración
PR #11 fusionado en `main` el 2026-10-03. Merge squash: `210deee1560aa35de04d79f56a78d064e1c1d3a4`.

## Contexto preservado
Arena final del inframundo integrada; 20 bosses normales (5 por mundo); generación gradual por nivel/tiempo; familias de enemigos por mundo; cuevas 5/10→15→30; ataque automático por defecto; XP 30/70; escudo 20→120; ataque 0,25 s; zoom bloqueado.

## Siguiente paso
Validar en móvil alrededor del nivel 23 que la cámara ya no entra en efecto pinball con varios jabalíes; mantener el shake de impactos válidos.
