# Arquitectura — Ferret Jump

## Stack y publicación
TypeScript 5.9.3, Vite 8.3.2, Phaser 3.90.0. Versiones comprobadas en npm el 2026-10-04; Node local 24.19 satisface Vite (`^20.19 || >=22.12`). Phaser 3 estable ofrece Arcade Physics, escenas, animaciones, cámara y WebGL sin inventar un motor. Código nuevo; ninguna dependencia de Survivor.

Fuente en `huroner-platformer/`; artefacto **versionado** en `huroner-platformer/dist/`, base relativa `./`. El catálogo enlaza `huroner-platformer/dist/`. Preserva Pages desde main/raíz y todos los juegos existentes, sin cambio global de despliegue. Comandos: `npm ci`, `npm run dev`, `npm run typecheck`, `npm test`, `npm run build`, `npm run preview`. Integración construye y sube fuente, lockfile y dist juntos.

## Responsabilidades y contratos
- `main.ts`: Phaser AUTO (WebGL preferente), pixelArt, antialias false, viewport lógico 960×540 y FIT/CENTER_BOTH. Resolución interna 1; no multiplicar por DPR.
- `scene.ts`: único propietario de partida, grupos físicos y ciclo de vida. Conecta módulos; sin bus global.
- `player.ts`: locomoción/animación. `input.ts`: teclado y Pointer Events multitáctiles → eje -1/0/1, salto held/pressed/released. `collision.ts`: pisotón, daño y filtros one-way.
- `enemies.ts`: patrulla, protegido de 2 pisotones, volador senoidal, tirador con aviso. `powerups.ts`, `collectibles.ts`: estados y solapes. `camera.ts`: seguimiento horizontal. `ui.ts`: HUD/menús/táctil. `audio.ts`: síntesis WebAudio tras gesto.
- `art.ts` exporta `createArt(scene: Phaser.Scene): void`. Registra texturas originales y animaciones. Personaje canvas/spritesheet 48×64; animaciones **ferret-idle, ferret-run, ferret-jump, ferret-fall, ferret-hurt, ferret-dead**; textura base **ferret**. Enemigos **rabbit, armored, quail, spitter**; objetos **kibble, meat, oil, puff, checkpoint, goal, projectile**. Diseñador documenta texturas decorativas adicionales. Nearest-neighbor; silueta legible, cuerpo físico menor que sprite.
- `level-data.ts` exporta `LEVEL: LevelDef` con contratos de `types.ts`. Rectángulos son esquina superior izquierda; entidades usan centro. Geometría separada de arte; decoración nunca crea colisiones accidentalmente.
- `balance.ts`: números de ajuste juntos. Módulos dependen de tipos/balance y escena llama sus funciones; no clases envoltorio para cada sistema.

## Física y composición
Arcade fixedStep 60 Hz, gravedad inicial 1200 px/s², velocidad 220 px/s, aceleración 1500, frenada 1900, control aéreo 0.85. Impulso salto -490; cortar velocidad ascendente a -180 al soltar. Coyote 110 ms; buffer 130 ms; caída máxima 700. Altura máxima aproximada 100 px, distancia horizontal ~180 px sin buff: diseñar ruta obligatoria con desniveles <=80 y huecos <=110; márgenes para novatos. Guardar posición previa de pies: pisotón exige descenso y pies previos sobre cabeza + tolerancia 10; rebote -300. Nunca derivar pisotón solo del solape lateral.

Cuerpo protagonista aproximado 24×42, desplazado dentro de sprite 48×64. Mundo altura 540; suelo habitual y=430. Cámara x suave con anticipación limitada 65 px; y fija. Banda inferior 90 px reserva controles. Nivel manual objetivo ~14000 px, rutas secundarias compactas; longitud y ritmo ajustables tras QA de recorrido. Personaje ocupa ~12% del alto. FIT conserva saltos/encuadre en ratios distintos; letterboxing preferible a cambiar física.

3 corazones, daño 1, invulnerabilidad 1400 ms y knockback corto. Muerte animada ~700 ms, después checkpoint con 3 corazones. Caídas cuestan corazón y recuperan suelo seguro; muerte total vuelve a checkpoint. Checkpoint en mitad, sin trampas en zona de reaparición. Carne +1; aceite +25% velocidad 12 s; transformación «hurón pompón» absorbe un golpe (sin ataque extra). Reducir/ocultar estímulos de parpadeo con reduced-motion.

## Estado, pausa y pruebas
Scene guarda salud, buff/escudo, checkpoint, croquetas y sets de IDs recogidos/secretos descubiertos. Mantener IDs recogidos durante muerte para no duplicar croquetas. Reintentar nivel reinicia partida. Persistencia local versionada y try/catch: mejor resultado + croquetas acumuladas, contabilizadas una vez al vencer; no tienda. Pausar física/temporizadores al ocultar pestaña o entrar en vertical; limpiar input en blur/pointercancel. Audio suspended hasta gesto; silenciar posible.

Presupuesto: <=30 enemigos, <=180 croquetas, <=16 proyectiles simultáneos, <=80 partículas; desactivar IA fuera de cámara + margen. No afirmar 60 FPS móviles sin medición física. QA: tests de reglas geométricas/jump cuando útiles y navegador real automatizado con teclado/táctil, comprobación de HUD, muerte/checkpoint, cuatro enemigos, power-ups, secretos y victoria. Dev hook únicamente `?qa=1` para inspeccionar/posicionar; no sustituye recorrido jugable. Capturas móvil horizontal, 16:9 y vertical. Verificar dist servido por HTTP y finalmente URL Pages.

Referencias: https://docs.phaser.io/phaser/concepts/physics/arcade ; https://vite.dev/guide/build (base relativa); https://vite.dev/guide/static-deploy.html .
