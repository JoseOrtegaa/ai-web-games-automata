# Huroner Survivor — diseño

## Gameplay

Diseño cerrado para V2: conservar el contenido y los parámetros de `huroner-survivor/core.js` en el commit base indicado en STATE. La mejora es de comprensión, respuesta y legibilidad; no introduce balance, enemigos, armas, economía, modos ni progresión permanente. Criterios relacionados: A1–A5 del BRIEF. Si un texto del original contradice su simulación, se corrige el texto, no el balance.

### Objetivo y ciclo de partida

El jugador controla un hurón con espada en una arena continua. Se mueve, esquiva, ataca, recoge XP y elige mejoras. Empieza en nivel 1, con 100/100 HP y sin mejoras. A los 600 segundos de juego activo aparece una gallina jefe final; sobrevivir hasta ese momento no basta: derrotarla gana la partida. HP a cero termina en derrota. Los jefes intermedios aparecen al alcanzar niveles 5, 10, 15, etc.; pueden coexistir y no deben sustituirse ni desaparecer al aparecer otro.

Tiempo, desplazamiento, enemigos, recargas, invulnerabilidad y buffs avanzan exclusivamente durante juego activo. Menú, pausa y elección de mejora congelan la simulación. Perder foco o cambiar de pestaña pausa. Reiniciar crea una partida limpia; sólo permanecen preferencias y récord local, con claves independientes de V1. No hay mejoras permanentes.

### Movimiento y ataque

- Táctil: joystick flotante al tocar y arrastrar la arena, compatible con otro dedo en el botón de ataque. Escritorio: WASD/flechas y arrastre; Escape pausa/reanuda. Conservar las opciones originales de configuración, incluyendo ataque manual/automático y botón a izquierda/derecha.
- Movimiento inicial: 124 unidades/s. El vector se normaliza para impedir velocidad diagonal extra. Soltar/cancelar un puntero o pausar no puede dejar una dirección o ataque retenidos. Bloquear zoom del navegador durante partida.
- Un ataque autorizado apunta al enemigo vivo más cercano al comenzar el espadazo; sin enemigo usa la última orientación del hurón. No requiere acertar para consumir la recarga. El arco daña a todos los enemigos dentro de su área; no se añade selección manual de objetivo.
- Recarga compartida manual/automática: **0,25 s**, sin bypass al alternar modalidades ni tocar repetidamente. Automático utiliza la misma puerta de ataque que manual. La presentación puede mostrar la recarga pero nunca modificarla.
- Espada inicial: daño 20, alcance 98 más radio del enemigo, semiarco 1,35 rad más tolerancia de impacto 0,15 rad; retroceso de 10 unidades. Colmillo Gemelo ejecuta dos espadazos consecutivos dentro del mismo ataque y de la misma recarga; cada espadazo puede adquirir el objetivo más cercano. No añade retraso, carga ni combo.
- Daño recibido: `max(1, dañoEntrante × 100 / (100 + 18 × rangoArmadura))`. El escudo absorbe primero el daño mitigado; el excedente pasa a HP. Tras recibirlo: 0,65 s de invulnerabilidad. La regeneración y curación nunca superan la vida máxima.

### Experiencia y mejoras

Cada conejo, liebre o codorniz concede 2 XP; gallina común, 3; jefe intermedio, 20; jefe final, 100 aunque su muerte termina la partida. El 30% se suma al matar y el 70% cae como gema, conservando el total y las décimas sin error acumulado. La comprobación de nivel sigue en el paso de simulación para completar el ataque y respetar estados terminales. Cada baja tiene una probabilidad del 3,5% de dejar además una gema curativa de 15 HP. La atracción inicial de gemas tiene radio 56; una gema atraída sigue acercándose hasta recogerse, a velocidad máxima entre 300 y 1,25 veces la velocidad del jugador. Los pickups de carne/aceite/fuego usan contacto directo (radio 18), no el imán de XP.

XP necesaria para salir del nivel `n`: `round(6 + 3n + 0,12n²)`. Al subir, se descuenta el umbral y se conserva el excedente. Se ofrecen hasta tres mejoras distintas al azar, excluyendo las que alcanzaron su máximo. Elegir una reanuda o abre inmediatamente la siguiente elección si sobra XP suficiente. La elección es obligatoria y no tiene temporizador. Si todas las mejoras están agotadas, se ofrece únicamente curación completa. Pulsaciones inválidas o duplicadas no pueden otorgar mejoras adicionales.

Los porcentajes por rango se suman sobre la base; los buffs temporales multiplican después. Conservar estas trece mejoras, sus nombres ES/EN y límites:

| Mejora / ID | Efecto observable por rango | Máximo |
| --- | --- | --- |
| Filo salvaje / `power` | Daño base × (1 + 0,22 × rango), aplicable a todas las armas | 8 |
| Colmillo gemelo / `twin` | Dos espadazos por ataque | 1 |
| Corazón indomable / `vitality` | +25 HP máximos y cura 35 HP | 6 |
| Armadura de corteza / `armor` | Reducción según fórmula de armadura anterior | 6 |
| Escudo del claro / `shield` | +20 de capacidad y carga al elegir; base 20, máximo total 120 | 5 |
| Espada colosal / `reach` | Alcance 98 × (1 + 0,18 × rango); semiarco +0,13 rad/rango | 5 |
| Patas ligeras / `speed` | Velocidad 124 × (1 + 0,12 × rango) | 5 |
| Imán de almas / `magnet` | Radio 56 × (1 + 0,45 × rango) | 4 |
| Instinto vital / `regen` | Regenera 0,7 HP/s por rango | 4 |
| Cuchillas lunares / `orbit` | Una cuchilla adicional: órbita de radio 72 a 2,5 rad/s; impacto de 0,65 × daño, recarga por enemigo 0,35 s | 4 |
| Tormenta salvaje / `lightning` | Cada 2,8 s alcanza hasta rango + 1 enemigos cercanos, a menos de 350 unidades; daño 2,1 × daño | 4 |
| Aliento de invierno / `frost` | Cada 0,6 s: radio 65 + 15 × rango, daño 0,25 × rango × daño; velocidad enemiga ×0,48 durante 1 s | 4 |
| Colmillo carmesí / `leech` | Cada baja tiene 20% de probabilidad de curar 2 × rango HP | 3 |

Corregir dos descripciones heredadas: no existe mejora de velocidad de ataque; la armadura no debe anunciar «+2» como si fuera la reducción real. La descripción de Gemelo debe hablar de «cada ataque» para cubrir automático y manual. Rayos comienza con dos objetivos y añade uno por rango posterior. No convertir estas correcciones de texto en cambios de reglas.

### Escudo

Empieza lleno con 20 puntos (20% de los 100 HP iniciales), independiente de mejoras de vida. Cualquier daño válido reinicia la espera de 6 s; después recupera el 10% de la capacidad máxima por segundo, sin excederla. Pausa, elección y estados terminales congelan espera/recarga; reiniciar restaura 20/20 y cero rangos. Barra azul con cifra actual/máxima sobre la vida, ES/EN. El hurón sostiene un escudo azul de borde cobre en la pata libre; su emblema se apaga al agotarse, conservando la silueta. Sin partículas ni colisiones nuevas.

### Pickups y ritmo existente

Primera aparición de pickup a los 5 s; siguientes cada 8–13 s, con hasta 8 pickups presentes. Tipos equiprobables: carne cura 3 HP; aceite multiplica velocidad por 1,10 durante 20 s; fuego multiplica todo el daño por 1,35 durante 15 s. Repetir el mismo buff renueva su duración a ese valor; no suma duración ni potencia. Aceite y fuego pueden coexistir. Un pickup puede consumirse aunque la vida esté llena.

Primera aparición de enemigos a los 0,5 s. Intervalo posterior `max(0,24, 1,35 − tiempo × 0,0018)` s; grupo de `1 + floor(tiempo/150)` enemigos, límite ordinario 170. Nacen a 430–520 unidades del jugador; los comunes a más de 800 se recolocan a 480. Mantener límites existentes de gemas, partículas, efectos y proyectiles y la conservación de XP cuando se agreguen gemas. Los jefes no se eliminan por distancia.

| Enemigo común | HP base | Velocidad base | XP |
| --- | --- | --- | --- |
| Conejo | 23 | 29 | 2 |
| Liebre | 18 | 43 | 2 |
| Codorniz | 14 | 37 | 2 |
| Gallina | 35 | 24 | 3 |

Para nacimientos: HP = base × (1 + tiempo/340) × (1 + 0,52 × tier); velocidad = base × (1 + 0,14 × tier); daño = 9 + 3 × tier + tiempo/120. Tier = mínimo entre 3 y `floor((nivel − 1)/5)`. Enemigos comunes ya presentes al mutar conservan su porcentaje de HP, multiplican HP máximo por 1,42 y velocidad por 1,14, suman 3 de daño y adoptan el tier nuevo. No reemplazar esta actualización por la fórmula de nacimiento: tienen comportamientos históricos distintos.

### Mutaciones y jefes

Mutaciones en niveles 6, 11 y 16. Avisos de ataques especiales fijan posición/dirección al iniciarse; alejarse debe permitir esquivar, sin seguimiento invisible del objetivo.

- Conejo desde nivel 6: aviso de 0,75 s del punto de aterrizaje, salto de 0,45 s y daño en radio 30. Desde nivel 11 el salto dura 0,34 s.
- Codorniz desde nivel 6: aviso de 0,75 s y abanico de 3 plumas; desde nivel 11 son 5. Separación 0,3 rad, velocidad 120 y vida 3 s. La dirección se fija durante el aviso.
- Gallina desde nivel 6: aviso de 0,8 s del círculo de radio 65 y golpe; desde nivel 11 el radio aumenta un 15%.
- Los tres especiales anteriores tienen recarga de 5–7 s; desde nivel 16 se divide por 1,15. Conservan los rangos de activación del original: conejo 220, codorniz 280, gallina radio + 35. El daño de especial usa las estadísticas actuales del enemigo.
- Liebre desde nivel 6: embestida de 0,65 s a velocidad 230, tras preparación de 0,65 s; recarga 4,5–6,5 s. No incorporar los especiales de los otros animales a la liebre.
- Jefe intermedio aleatorio del [catálogo de 10 encuentros](BOSSES.md), sin repetición inmediata, cada 5 niveles. Gemelos reparten su vida entre dos cuerpos y conservan una barra/recompensa; auxiliares no cuentan como jefes. Jefe intermedio del nivel `n`: HP `520 + 105n`, daño `14 + 1,15n`. Final: HP `max(3200, 1400 + 95n)`, daño `max(26, 16 + n)`. Velocidad de ambos `34 + min(10, 0,35n)`, radio 43.
- El jefe final conserva selección de ataques entre embestida, anillo y ráfaga; los diez encuentros de nivel usan las mecánicas, avisos y recargas de `bosses.js` y BOSSES.md. Para el jefe final, intervalos 3,8 s (intermedio) y 3,1 s (final), velocidades, proyectiles y daños actuales. Las hordas siguen apareciendo durante los jefes y después de los 600 s hasta ganar o morir.

### Claridad y feedback sin cambio de mecánicas

La dirección visual concreta la forma, pero debe comunicar: HP actual/máximo, XP hacia el siguiente nivel, nivel, tiempo activo, bajas, presencia/vida de jefe, modo de ataque y recarga, buffs activos y duración restante. Si hay varios jefes, el HUD identifica a cuál pertenece cada indicador mostrado; un cambio de referencia visual nunca afecta su existencia en simulación.

Antes de empezar, explicar movimiento, ataque seleccionado y condición de victoria con texto breve ES/EN. Durante la elección, mostrar efecto real y rango actual/máximo. Separar claramente pausa, elección, derrota y victoria. La XP conserva su destello blanco breve y desfasado sobre la gema, sin halo en el suelo. Las zonas de peligro y proyectiles deben permanecer visibles sobre gemas, sangre y efectos; un aviso no debe confundirse con daño ya aplicado. El impacto visual/audio responde a eventos reales y no retrasa la simulación. Los buffs se identifican además de por color. Mantener opción de sonido y contenido de audio existente.

### Invariantes y criterios comprobables para QA

1. La misma secuencia de input, tiempo y aleatoriedad produce las reglas de combate y progresión documentadas, incluidas las peticiones de XP repartida y escudo del 2026-10-03. Ningún ajuste de diseño altera cifras para aparentar mayor dificultad o potencia.
2. Manual y automático comparten los 0,25 s; Gemelo duplica el espadazo una sola vez; el objetivo siempre es el vivo más cercano o la orientación previa si no existe.
3. Tiempo/buffs/recargas no avanzan en pausa ni elección; reanudar no compensa de golpe el tiempo de pestaña oculta. Reiniciar vacía enemigos, efectos, elecciones, buffs e input retenido.
4. Los niveles 5/10 generan jefes una vez; 6/11/16 mutan; el boss final aparece una sola vez a los 600 s. Los avisos no persiguen al jugador después de fijarse.
5. Excedente de XP encadena elecciones sin perder XP; máximos excluyen mejoras; curación completa aparece al agotar el catálogo. Ni dobles toques ni clicks tras cerrar una elección otorgan rangos extra.
6. Muerte y victoria son estados terminales exclusivos. Si una actualización alcanza primero un estado terminal, no permite que operaciones posteriores lo sustituyan ni abra una elección. En particular, el core original permite que una muerte por contacto sea sobrescrita por una muerte del jefe debida a daño pasivo posterior dentro del mismo paso: V2 debe cerrar esa transición inconsistente, sin conceder invulnerabilidad ni cambiar daño. Mantener el orden de resolución del original y detener las reglas al fijar el resultado.
7. Distinción visual verificable entre XP, curación y buffs; barras y números corresponden al estado real. Correcciones de descripciones ES/EN incluidas; ninguna promesa de velocidad de ataque o armadura ficticia.
8. Joystick + ataque simultáneos, cancelación de puntero y pausa por foco se comprueban en emulación disponible. No presentar emulación como prueba física de iPhone o Android.

No quedan decisiones de gameplay pendientes de Jose. Cualquier propuesta posterior de balance o mecánicas complementarias requiere consulta y queda fuera de esta entrega.

## Dirección artística

**El último claro.** Un pequeño guardián de bufanda roja sostiene su terreno cuando la pradera familiar se convierte en un cuento extraño. La emoción empieza como valentía frágil y evoluciona hacia un paisaje cada vez más tétrico según el nivel. Dirección propia de ilustración vectorial grabada: contornos cortados, masas de luz mate, detalles botánicos y materiales de corteza, roca y metal. De Hollow Knight toma separación de planos y atmósfera; de Dead Cells, lectura inmediata de impacto; de It Takes Two, expresividad de personaje; de Clash Royale, siluetas legibles a escala pequeña. No se usan ni reproducen sus assets.

Tres principios: **personaje claro sobre suelo oscuro**, **formas que identifican antes que colores**, **riqueza en portada y bordes, calma en el centro de combate**. La pradera puede ser melancólica sin oscurecer el HUD ni las amenazas.

| Uso | Color | Regla |
| --- | --- | --- |
| Fondo y tinta | `#101f26`, `#15282d` | Contornos sólidos; evitar negro puro salvo sombra tenue. |
| Pradera/pizarra | `#142b32`, `#203c43` | Variaciones de valor cercanas, inferiores al contraste de enemigos. |
| Marfil | `#eadfc5`, `#f5e8c8` | Hurón, filo, texto principal y botón primario. |
| Cobre | `#b99562` | Bordes, ornamentos y acentos de progreso. No emitir brillo constante. |
| Carmesí arcilla | `#cb6555` | Bufanda, peligro, vida e impactos. Peligro también usa patrón/borde. |
| Aguamarina | `#87c9bf` | XP, diferente de curación roja y pickups dibujados. |

Títulos con Georgia/serif de sistema en peso normal o semibold; texto, números y controles con system-ui legible. No dependencias de fuentes de red. Títulos y números forman la jerarquía; evitar cuerpo entero en mayúsculas pequeñas.

El hurón tiene orejas redondas, hocico largo claro, máscara oscura, cuerpo alargado, cola larga de punta oscura, bufanda roja y espada marfil. Armadura añade placas verde grisáceas y costuras, conservando cabeza y bufanda. Conejo: cuerpo redondo y orejas verticales; liebre: lomo inclinado, patas largas y orejas barridas; codorniz: gota compacta, penacho y puntos del pecho; gallina: cola desplegada, cresta y barbilla. Las mutaciones añaden espinas coral progresivas y ojos cálidos; los jefes llevan una pequeña corona de espinas cobre y su escala la decide el renderer. Ninguno se distingue únicamente por recolor.

## Composición y UX

La portada combina título, ilustración original y acción principal: `assets/hero.svg` es un escenario transparente de 760 × 610 con luna grabada, ruinas, roca, plantas y el hurón. Se ajusta con `contain`, sin recortar orejas, espada ni base; el título queda fuera del dibujo. Evitar repartir la portada en tarjetas independientes. La pieza ilustrada y un marco cobre bastan para establecer mundo.

En móvil, espacio central continuo para mundo: vida/XP/nivel en la franja superior, tiempo y bajas secundarios; avisos/boss bajo HUD sin tapar al personaje. Zona de joystick abajo izquierda y ataque abajo derecha por defecto, intercambiable según ajustes. Safe areas y objetivos de 44 px mínimos. No colocar texto necesario debajo de un dedo o sobre un botón. En escritorio, la arena conserva su proporción vertical y un ancho máximo; bandas laterales en el mismo tono de pradera, sin estirar entidades.

Paneles de pausa, preferencias, mejora y final usan superficie opaca petróleo, línea fina cobre y ornamento botánico propio, sin apilar cristales translúcidos. Botón principal marfil con texto petróleo; secundarios con contorno cobre. El foco de teclado es explícito. Elecciones: nombre grande, efecto preciso y rango actual/máximo; toda la opción es accionable. Muerte y victoria tienen título y tratamiento distintos: carmesí/cobre sobrio para derrota, marfil/aguamarina para victoria. No introducir una narración o recompensa que implique mecánicas nuevas.

Arena: base `#142b32`; parches irregulares `#1b363b`/`#203e42`; senderos suaves `#294245` con alpha aproximada 0,3; marcas cortas de grabado `#506457` a 0,22; matas en arcos y semillas cobre `#8e7959` a 0,4; piedras poligonales `#2c4849` con borde superior `#627465` tenue. Decoración cacheable, distribuida sin retícula evidente. Mantener el centro despejado de adornos grandes. No añadir colisiones a plantas o rocas.

## Movimiento, feedback y audio

Personajes: pequeña alternancia de patas y rebote de 1–2 unidades con fase individual; bufanda y cola dan dirección sin balancear el mundo. El dibujo acepta el tiempo de simulación, por tanto queda congelado en pausa/elección. Respetar movimiento reducido: suprimir sacudida y desplazamientos decorativos; mantener señales necesarias.

Ataque: arco marfil claro y final cobre, duración heredada de simulación; no retrasar daño para sincronizar dibujo. Impacto: marca breve marfil sobre el actor (según `flash` real) y partículas ya presupuestadas. Daño: vida y señal breve rojiza, sin dejar pantalla roja permanente. Elección: foco sólido y transición corta de 120–180 ms si se implementa; pausa/final deben aparecer inmediatamente aunque haya animación decorativa.

Avisos de ataque: área carmesí de baja opacidad, perímetro claro segmentado y centro/marca legibles, siempre sobre sangre/gemas/decoración. Proyectiles usan borde oscuro + marfil y núcleo carmesí; nunca una pluma marrón confundible con suelo. XP aguamarina facetada con destello blanco desfasado de unos 100 ms exclusivamente sobre la gema, sin halo de suelo. Carne, aceite y fuego conservan formas diferentes y etiquetas/buff con duración.

Conservar Web Audio original y preferencia de sonido; no se entregan ficheros de audio nuevos. Ataque/impacto, daño, recogida, mejora y jefe responden a eventos reales; límites de voces y pausa según ARCHITECTURE. La dirección sonora deseada es percusión seca, metal breve y campanilla apagada; no prometer pistas grabadas inexistentes ni alterar el contenido musical durante esta entrega.

## Recursos

Todos los siguientes recursos son originales de esta V2, creados como código vectorial/SVG en este repositorio, sin fuentes externas ni atribuciones pendientes. Son assets finales, no placeholders. No hay recursos generados con IA bitmap ni dependencias remotas.

| Ruta | Uso / contrato |
| --- | --- |
| `art.js` | `drawFerret(ctx,{x,y,scale,face,walk,armor,shield})`, escala base aprox. 46 × 60; ancla de posición de actor. `face` ±1, `walk` fase en radianes. |
| `art.js` | `drawAnimal(ctx,{kind,x,y,scale,tier,boss,time,flash,id})`; `id` opcional desfasador, clases `rabbit/hare/quail/chicken`; escala base aprox. 40 × 56 incluyendo orejas, variable por animal. `boss` sólo añade corona: caller aplica escala. |
| `assets/hero.svg` | Portada ilustrada transparente, viewBox 760 × 610; mostrar completa. |
| `assets/divider.svg` | Separador botánico cobre, viewBox 400 × 28; uso opcional entre título y acciones. |
| `icon.svg` | Icono local, viewBox 96 × 96; rostro del hurón y bufanda sobre petróleo. |

Art usa `save/restore`, no cambia Game, no consume RNG y cachea sólo paths estáticos. El renderer realiza culling, escala global y jerarquía de pasadas. Revisión: hero renderizado a PNG local a 760 × 610, composición y límites correctos; el coordinador revisó tablero de personajes Canvas en Chromium. La comprobación de integración, viewport y rendimiento pertenece a QA, no se presupone completada por estos recursos.

## Criterios visuales

1. Menú reconocible por luna grabada, hurón de bufanda y pradera; la acción principal y la configuración son legibles sin competir con el dibujo.
2. A escala de combate se distinguen cuatro animales por silueta, protagonista por máscara/cola/bufanda y tier por crecimiento coral. Jefe conserva especie y añade corona.
3. El fondo tiene menor contraste que los actores. No hay desenfoque/filtros por enemigo ni patrones de suelo dominantes.
4. Gemas, carne, aceite y fuego no son círculos del mismo color; XP tiene destello blanco en la propia gema y no un foco en suelo.
5. Avisos de salto/carga/golpe y proyectiles permanecen visibles en una partida con gemas y mobs acumulados. Ningún efecto decorativo cambia colisiones ni tiempos.
6. Vida, XP, buffs, ataque y jefes son legibles en viewport móvil; ninguna instrucción necesaria queda bajo botones o safe areas.
7. Pausa, selección, derrota y victoria se distinguen por título y contenido, además de color. Foco e interacción visibles y áreas táctiles de al menos 44 px.
8. Capturas finales de menú, arena poblada, elección y final en móvil/escritorio muestran el mismo lenguaje de cobre, marfil y petróleo; dibujo completo de portada y sin texto cortado.

## Mundos y descenso

La progresión ambiental no cambia de fondo automáticamente cada cinco niveles. Cada partida empieza en la superficie y el primer acceso al subsuelo se elige al iniciar entre los bosses de nivel 5 o 10. Al completar el boss correspondiente aparece una cueva física a distancia del jugador y una flecha fuera de pantalla señala su dirección. El mundo solo cambia cuando el hurón se acerca y usa **DESCENDER**.

Las siguientes bajadas se desbloquean tras los bosses de nivel 15 y 30. Capas: superficie; subsuelo de tierra/piedra/cadáveres; profundidades rocosas que en nivel 20 incorporan magma y en 25 aumentan magma, fósiles y petróleo; capa de magma desde nivel 30, más intensa en 35. Los enemigos actuales se conservan. Entrar limpia entidades ligadas al mapa anterior, conserva vida/escudo/mejoras y recoloca al jugador en el origen de la nueva capa. Si una cueva se ignora y se derrota un boss posterior, el progreso pendiente se conserva para impedir bloqueos.

Los cambios de capa o fase visual usan un fundido de 1,25 s de tiempo de simulación; con movimiento reducido el cambio es inmediato. La decoración queda bajo actores, gemas, pickups y avisos, no añade colisiones ni modifica estadísticas, y los tiles de 768 px se cachean por etapa visual.

