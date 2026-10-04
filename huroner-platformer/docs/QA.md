# QA — Ferret Jump

Estado: **PENDIENTE de build funcional**. La revisión estática no certifica jugabilidad.

## Revisión previa
- Reglas, arquitectura, diseño y geometría leídos por QA independiente.
- Física nominal: altura máxima ~100 px, alcance ~180 px a velocidad constante; siete huecos de suelo de 80–100 px.
- Ajuste solicitado y aceptado por Diseño: ampliar apoyo antes de la pared de 115 px en x5980, reduciendo la precisión requerida en el salto.
- Ajuste solicitado y aceptado: spawn del segundo conejo separado del borde de la caja.
- Documento de diseño corregido de diez a siete huecos reales.

## Cobertura prevista
1. Recorrido completo mediante teclado desde el inicio, sin posicionar al jugador, hasta victoria; verificar plataformas, dificultad y cámara.
2. Casos dirigidos con `?qa=1`: salto corto/largo, coyote/buffer, pisotón, protegido de dos impactos, daño/invulnerabilidad, tres corazones, derrota/checkpoint y reinicio, cuatro arquetipos, croquetas/persistencia, buffs/transformación, dos secretos.
3. Chromium real: emulación móvil y dos contactos táctiles simultáneos; orientación, pausa, ratios, ausencia de scroll/zoom, consola/carga y activación WebAudio.
4. Capturas de menú, juego móvil, secreto/transformación, cocina y victoria; revisión visual.

Entorno previsto: Chromium de Playwright disponible en el contenedor. No se afirmará prueba física iOS/Android. WebKit no disponible por bibliotecas del host. QA actualizará este documento con resultados reproducibles antes de integración.

## Reanudación: harness de navegador
- `tests/browser-qa.mjs` ejecuta recorrido completo por teclado sin teletransportes (`browser-route.mjs`) y casos dirigidos (`browser-cases.mjs`). Usa Playwright; `BASE_URL` apunta al servidor de la raíz y `CHROMIUM_PATH` es opcional.
- Evidencias en `test-results/`: JSON de recorrido/casos y capturas de menú, partida, transformación, victoria, orientación vertical y multitouch.
- Análisis de sintaxis `node --check` de los tres scripts: correcto. Esto **no** constituye ejecución de sus pruebas.
- El Chromium antiguo falla al arrancar; la copia limpia del navegador devuelve versión pero el host impide crear su socket. La revisión automática rechazó la elevación. No se elude la restricción: la ejecución real pasa al workflow de GitHub Actions sobre una rama de validación, antes de integración en main.
- Estado de navegador pendiente de resultados de CI; no se declara PASS global. WebKit y hardware móvil permanecen sin verificar.
