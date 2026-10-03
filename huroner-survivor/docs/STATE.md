# Huroner Survivor — estado vigente

## Objetivo / fase
Estado vigente: escudo del jugador eliminado, evolución visual del hurón activa, cámara ~30% más amplia y enemigos normales menos robóticos mediante puntería imperfecta y variantes de ataque. Implementación, QA lógico localizado e integración en `main` completados.

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
- `cameraZoomFor(width)` conserva el encuadre anterior y divide su zoom entre 1,30: mismo mundo, hitboxes y balance; solo cambia presentación.
- Referencias actuales: 320 px → 0,530; 390 px → 0,646; 430 px → 0,712; 540 px → 0,762.
- El HUD permanece fuera de la transformación de cámara y conserva su tamaño.

## QA lógico
- jugador no contiene shield/shieldDelay/maxShield ni existe upgrade shield;
- daño de 15 resta 15 HP directamente sin armadura;
- mecánica de escudo del boss Bastión sigue rompiéndose correctamente;
- ferretEvolutionFor devuelve 0/1/2/3 en los hitos 1–9/10–19/20–29/30+;
- las cuatro etapas generan firmas de dibujo distintas;
- dibujo antiguo del escudo de mano eliminado;
- HUD/app/index/style sin referencias de escudo del jugador;
- core.js, art.js, render.js y app.js parsean.

## Integración
PR #14 fusionado en `main` el 2026-10-04 para evolución/sin escudo/cámara inicial. PR #15 para el alejamiento adicional de cámara. PR #16 para IA enemiga menos robótica. Último squash de gameplay: `712208aa6e9d9348a8f6cf5e11a40661090d3c22`.

## IA de enemigos normales
- Los especiales ya no apuntan todos al píxel exacto del jugador: salto, disparo, abanico, lunge y ram aplican una desviación pequeña por enemigo/ataque.
- Cada familia conserva un ataque principal y dispone de un secundario coherente.
- Algunos enemigos usan el secundario ya desde su primer especial; con alternativa disponible no pueden repetir el mismo patrón más de dos veces seguidas.
- Los rangos de activación originales se conservan y los arqueros mantienen el proyectil propio de su mundo.
- Bosses sin cambios.

## Contexto preservado
Números de daño/curación sutiles; spawn midgame suavizado; jitter de embestidas corregido; arena final del inframundo; 20 bosses normales; ataque automático por defecto; XP 30/70; ataque 0,25 s; zoom del navegador bloqueado.

## Siguiente paso
Probar en iPhone la sensación de hordas: confirmar que la torpeza se perciba natural sin volver a los enemigos demasiado fáciles; ajustar solo margen de puntería o probabilidad de variantes si hiciera falta.
