# La casa dormida · Ferret Jump

## Intención y dirección
Un explorador diminuto convierte la casa tibia de la mañana en una aventura. Pixel art original dibujado directamente en texturas Canvas: bordes escalonados, paleta restringida, sombreado de materiales, personajes con ojos y siluetas propios. No recursos externos ni formas provisionales. Hurón crema/cacao, vientre luminoso, antifaz chocolate, nariz coral, pañuelo turquesa y cola curvada. Bípedo; 48×64 con idle, carrera, salto, caída, daño y derrota. Animación discreta y lectura prioritaria.

Luz melocotón en nido/habitación, azul lavanda y madera nogal en salón, menta y cerámica en cocina. Mobiliario grande detallado más oscuro y menos saturado que protagonista/pickups. Los cantos transitables siempre tienen línea clara; fondos carecen de ese borde. Croqueta dorada romboidal, carne roja, aceite naranja en botella azul, transformación semilla de plumón verde. «Pompón» añade halo/flecos claros y absorbe un golpe, sin ataque nuevo. Audio sintetizado original: salto ascendente corto, croqueta dos notas, pisotón grave redondo, daño seco, power-up arpegio, derrota descendente, final breve frase ascendente.

## Nivel manual
14.000×540; cinco secciones de un único nivel. Nido seguro (0–2000): caminar, cojín, libros escalonados y primer hueco. Habitación (2000–3980): primer conejo y ruta alta de estantería con entrada opcional bajo panel de libros. Salón (3980–6950): protegido aislado, vuelo y primer tirador separado. Calcetín de descanso/checkpoint a 6830. Segunda mitad (6950–9970): combina saltos cortos, rutas altas y arquetipos ya conocidos. Cocina (9970–14000): azulejos, segundo escondite en ventilación bajo alacena y llegada luminosa sin ataque final. Salida identificable como puerta de jardín con insignia de pata.

Ruta crítica permite caminar bajo varias plataformas altas; el jugador elige recompensa/riesgo. Saltos obligatorios: huecos 80–100 px, escalones 50–70 px. Coleccionables trazan arcos y bordes. Tiempo objetivo 2–4 minutos novel, a verificar; recorrido directo sin explorar será menor. Dos secretos reales son paneles no sólidos que ocultan recompensas y desaparecen al entrar; pistas leves (juntas/luz), sin texto que revele la entrada. No teletransportes ni capacidad extra.

## Reglas observables
Tres corazones; daño lateral resta uno y 1,4 s de invulnerabilidad; pisotón descendente rebota y mata al básico/volador/tirador; protegido lleva cápsula de bellota visible y requiere dos pisotones. Conejo patrulla; codorniz vuela oscilando; pollo tirador avisa antes de proyectil horizontal. No enemigos en spawn/checkpoint/salida. Carne cura uno; aceite +25% durante 12 s; pompón absorbe un impacto. Recogidos conservados al morir; reintento completo reinicia nivel. Final guarda récord y croquetas una sola vez.

## UX y contratos artísticos
Viewport 960×540 FIT; cámara horizontal, controles en 90 px inferiores, objetivo/obstáculos en banda visible. Teclado A/D o flechas + espacio/W/arriba. Salto táctil grande, multitouch dirección+salto, feedback de presión. Pantalla vertical elegante solicita giro y pausa. HUD 3 corazones, croquetas e indicadores pequeños. Menú de entrada editorial de aventura con personaje, título y acción principal; victoria resume recorrido sin tienda.

`createArt(scene)` registra `ferret` (spritesheet 48×64) y `ferret-idle/run/jump/fall/hurt/dead`; texturas `rabbit`, `armored`, `quail`, `spitter`, `kibble`, `meat`, `oil`, `puff`, `checkpoint`, `goal`, `projectile`. Decoraciones de `LEVEL.scenery` se dibujan con **origin(0.5,1)** y detrás de geometría: `cage`, `sock`, `window`, `plant`, `picture`, `bookshelf`, `lamp`, `sofa`, `drawers`, `mug`, `cabinet`, `kettle`. Texturas de superficie repetibles: `surface-wood/cushion/book/pipe/tile/cardboard`. No colisión implícita en decoración.

## Comprobación visual / QA
Hurón legible en todos los fondos; líneas de plataforma no ocultas por controles; patas y cola visibles en seis estados; arquetipos reconocibles sin leer; transformado claramente diferente; invulnerabilidad moderada; sprites sin suavizado. Probar salto variable, coyote/buffer, 7 huecos, doble pisotón, proyectil anunciado, rutas altas, entrada por ambos paneles, checkpoint y final. Emulación táctil/ratios no equivale a hardware móvil. Todas las texturas son código original del proyecto (sin material Nintendo ni terceros).
