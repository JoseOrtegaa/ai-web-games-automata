# Criterios tecnológicos

Consultar solo al elegir o cambiar stack, build o despliegue. Son valores de partida; el arquitecto documenta cualquier desviación en pocas líneas.

## Cliente
- Juegos 2D nuevos con escenas, animaciones o física: TypeScript + Vite + Phaser.
- Minijuegos muy pequeños: HTML/CSS y JavaScript modular con Canvas 2D si reduce complejidad real.
- 3D solicitado: TypeScript + Vite + Three.js como punto de partida; definir aparte física y reglas cuando sean necesarias.
- Juegos existentes: conservar su stack salvo que el cambio solicitado requiera migración.
- No añadir React, un ECS, un bus de eventos global, un motor propio o múltiples capas por costumbre.
- Npm por juego y lockfile cuando existan dependencias. Versiones compatibles verificadas en documentación oficial al crear el juego; no imponer aquí números que envejezcan.
- Comandos documentados para desarrollo, pruebas, build y previsualización cuando apliquen. Separar reglas comprobables del render sin duplicar los sistemas útiles del motor.

## Publicación
El README actual documenta Pages desde la raíz de main. Los juegos estáticos existentes conservan sus carpetas y URLs.

Vite genera un artefacto compilado: subir solo TypeScript y un index de desarrollo no publica un juego funcional. Antes del primer juego con build, implementar una ruta reproducible de publicación: preferentemente un pipeline que prepare un sitio con catálogo, juegos existentes y los artefactos nuevos. Verificar permisos y configuración reales; no asumir que cambiar un YAML configura Pages automáticamente. Una alternativa compatible con la publicación actual es versionar el artefacto compilado en una ruta explícita, si se justifica y documenta.

El directorio fuente y la ruta pública pueden diferir. Documentarlos, configurar la base de assets para la URL final y actualizar el catálogo con la ruta comprobada. No sustituir todo el sitio por el dist de un único juego. No migrar la publicación para una tarea que no lo necesita.

## Rendimiento y dispositivos
Orientación decidida por juego. Layout con safe areas, controles táctiles, límites de ancho y escala coherente en escritorio. Ajustar densidad de render y límites de entidades/partículas al presupuesto medido. Gestionar resize, cambio de orientación, pestaña oculta, reanudación y activación de audio por interacción. Evitar gestos de navegador que interfieran en la superficie jugable; conservar accesibilidad donde sea posible. No prometer FPS de un móvil sin medición real.

## Futuro multijugador 1v1
No añadir servidor a juegos que no lo necesitan. Cuando se solicite online, definir al inicio: tiempo real o turnos, salas privadas o matchmaking, reconexión, autoridad del estado, persistencia y concurrencia esperada.

Para tiempo real competitivo, considerar un servidor autoritativo pequeño en Node.js/TypeScript y WebSocket seguro; el cliente envía intenciones y el servidor valida. Evitar confiar resultados al cliente. Conservar el cliente estático en Pages si conviene; el servidor requiere otro alojamiento que soporte conexiones y proceso apropiados.

Elegir proveedor entonces, comprobando límites, suspensión en inactividad, región, despliegue, registros y costes vigentes. Consultar decisiones que requieran cuentas, credenciales o gasto. No asumir que «gratis» garantiza disponibilidad continua. Secrets fuera del repositorio y del bundle cliente. La entrega online necesita prueba con dos clientes y fallos de conexión.

## Referencias
- Phaser: https://docs.phaser.io/phaser/getting-started/what-is-phaser
- Vite/build y Pages: https://vite.dev/guide/static-deploy.html
- Three.js: https://threejs.org/docs/
