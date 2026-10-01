# Huroner Survivor

Survivor web vertical en español e inglés. Un hurón con espada sobrevive a conejos, liebres, codornices y pollos mutantes, recoge experiencia y elige una de tres mejoras aleatorias al subir de nivel. El jefe aparece a los **10 minutos de juego activo**: hay que derrotarlo para ganar.

- **Móvil:** toca y arrastra en la arena para mover el joystick flotante. Ataques automáticos.
- **Ordenador:** WASD, flechas o arrastrar con ratón. Escape pausa/reanuda.
- **Progresión:** daño, velocidad de ataque, alcance, vida, armadura, regeneración, imán, robo de vida, cuchillas orbitales, rayos y aura de hielo.
- **Mutaciones en niveles 6, 11 y 16:** cambios visuales, estadísticas y habilidades; liebres que embisten y pollos que lanzan proyectiles.
- **Partidas independientes:** no hay mejoras permanentes. Récord, idioma y sonido se guardan en localStorage del navegador. El récord no se sincroniza entre dispositivos.
- **Audio:** música y efectos sintetizados con Web Audio, con opción de silenciar. La partida se pausa al cambiar de pestaña o perder el foco.
- **Arte:** ilustraciones originales dibujadas con Canvas 2D. Sangre estilizada.

## Desarrollo

Sin dependencias ni compilación. Desde la raíz del repositorio: `python3 -m http.server 8000`, luego abrir `http://localhost:8000/huroner-survivor/`.

Pruebas de la simulación: `cd huroner-survivor && npm test`.

`core.js` contiene la simulación independiente del navegador; `app.js` se ocupa de controles, interfaz, audio y renderizado.

## English

A portrait, auto-attacking survival game. Drag to move, collect experience and pick one of three upgrades. Enemies mutate at levels 6, 11 and 16. Defeat the boss that arrives after 10 minutes of active play. Every run starts fresh; only your personal best and preferences persist locally. Switch ES/EN on the title screen.
