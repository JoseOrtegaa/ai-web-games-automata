# Huroner Survivor — estado vigente

## Objetivo / fase
Corregir el jitter de cámara observado alrededor del nivel 23 cuando varios enemigos con embestida coinciden. Implementación y QA localizado completados en fix/ram-camera-jitter; pendiente integración/publicación.

## Causa
En Profundidades el stone_boar usa ram. Cada embestida aplicaba un empujón físico de 34 px antes de comprobar si el jugador seguía invulnerable por otro golpe. Con varios jabalíes, golpes que no causaban daño seguían desplazando al jugador; como la cámara lo sigue, la escena parecía temblar/saltar repetidamente.

## Corrección
- hurt() devuelve ahora si el impacto realmente entró.
- El empujón de ram solo se aplica cuando hurt() devuelve true.
- Embestidas bloqueadas por los 0,65 s de invulnerabilidad se consumen pero no desplazan al jugador.
- Un impacto válido mantiene el empujón de 34 px y el screen shake existente (shake=5), por lo que no se pierde feedback.

## QA
Pendiente ejecutar comprobación lógica localizada sobre múltiples embestidas y parseo de core.js.

## Contexto preservado
Arena final del inframundo integrada; 20 bosses normales (5 por mundo); generación gradual por nivel/tiempo; familias de enemigos por mundo; cuevas 5/10→15→30; ataque automático por defecto; XP 30/70; escudo 20→120; ataque 0,25 s; zoom bloqueado.

## Siguiente paso
Validar que una embestida durante invulnerabilidad no mueve al jugador, que una embestida válida sí mantiene knockback/shake, integrar en main y comprobar Pages.
