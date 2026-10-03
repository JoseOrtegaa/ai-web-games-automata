# Huroner Survivor — estado vigente

## Objetivo / fase
Eliminar completamente el escudo del jugador, hacer que el hurón evolucione visualmente con el nivel y alejar la cámara para mostrar más arena. Implementación y QA lógico completados en feature/ferret-evolution-zoomout; pendiente integración/publicación.

## Escudo del jugador
- Eliminados estado shield/shieldDelay/maxShield, mejora Escudo del claro, absorción/recarga, barra HUD y arte del escudo en la pata libre.
- El daño mitigado por armadura va directamente a HP; invulnerabilidad de 0,65 s se conserva.
- debugHeal cura únicamente HP.
- Los escudos propios de bosses (Bastión/conejo llave) permanecen intactos y separados.

## Evolución del hurón
- Etapa I: niveles 1–9, apariencia base.
- Etapa II: 10–19, primeras protecciones y detalles.
- Etapa III: 20–29, armadura/espada más desarrolladas.
- Etapa IV: 30+, detalles infernales/rúnicos y espada con mayor presencia.
- Evolución puramente visual: no altera daño, hitbox, alcance ni velocidad.
- La espada queda como única arma sostenida; la pata libre ya no porta escudo ni otra arma.

## Cámara
- Nuevo cameraZoomFor(width): mismo mundo/hitboxes, encuadre ~16% más lejano respecto al anterior.
- Referencias: 390 px → 0,84; 430 px → 0,926; 540 px → 0,99.

## QA lógico
- jugador no contiene shield/shieldDelay/maxShield ni existe upgrade shield;
- daño de 15 resta 15 HP directamente sin armadura;
- mecánica de escudo del boss Bastión sigue rompiéndose correctamente;
- ferretEvolutionFor devuelve 0/1/2/3 en los hitos 1–9/10–19/20–29/30+;
- las cuatro etapas generan firmas de dibujo distintas;
- dibujo antiguo del escudo de mano eliminado;
- HUD/app/index/style sin referencias de escudo del jugador;
- core.js, art.js, render.js y app.js parsean.

## Contexto preservado
Números de daño/curación sutiles; spawn midgame suavizado; jitter de embestidas corregido; arena final del inframundo; 20 bosses normales; ataque automático por defecto; XP 30/70; ataque 0,25 s; zoom del navegador bloqueado.

## Siguiente paso
Integrar en main, comprobar Pages y validar visualmente en iPhone el tamaño de cámara y que las cuatro evoluciones se distingan bien durante partida.
