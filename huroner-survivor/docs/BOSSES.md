# Catálogo de bosses — 2026-10-03

Alcance: diez encuentros de nivel, uno aleatorio cada 5 niveles; se evita repetición inmediata, sin descartar encuentros anteriores vivos. El rey final de los 600 s mantiene su función de victoria. HP/daño escalan con la fórmula vigente de jefes. Desde esta ampliación, la HP recibe además un bonus del 30% en nivel 5, +1 punto porcentual por nivel hasta el 50% en nivel 25 (mínimo 30%, máximo 50%). Se fija al aparecer, sin curar ni redimensionar bosses vivos al subir de nivel. Aplica al total de los gemelos y al rey final; no al conejo auxiliar. Cada encuentro concede una sola recompensa de 20 XP (30/70), salvo su conejo de apoyo normal.

| ID | Nombre | Silueta | Mecánica / respuesta |
| --- | --- | --- | --- |
| twins | Hermanos del eclipse | Conejo caballero con espada + conejo encapuchado con bastón | Dos cuerpos, una barra sumada y una recompensa; arco de espada cercano y abanico mágico dirigido. Matar ambos. |
| prism | Codorniz prismática | Cresta de cristal y ojo-lente | Láser recto con dirección fijada durante aviso; regenera 1,8% HP/s tras 3 s sin recibir golpes. Atacar para cortar la cura. |
| bastion | Pollo bastión | Gran escudo hexagonal y yelmo | Invulnerable mientras vive su conejo azul brillante; matarlo rompe permanentemente el escudo. Golpe circular cercano. |
| antler | Liebre cornuda | Cuernos largos y placas rojas | Embestida recta de 0,75 s tras mostrar la trayectoria; apartarse de la línea. |
| mortar | Sapo bombardero | Sapo ancho con alforjas y mortero | Tres bombas escalonadas con círculos fijados alrededor de la posición del jugador. Salir de las marcas. |
| weaver | Viuda de espinas | Araña de ocho patas y abdomen marcado | Deja tres telarañas persistentes dañinas, con aviso; rodearlas. Sin inmovilización nueva. |
| bell | Tortuga campanera | Caparazón abovedado y campana | Onda circular creciente: cruzarla antes del impacto o aprovechar el centro ya vacío. |
| reaper | Cuervo segador | Alas negras, capucha y guadaña | Guadaña que va y vuelve hacia el dueño, con trayecto inicial avisado. |
| ember | Zorro de brasas | Hocico largo, orejas y tres colas de fuego | Abanico de fuego sostenido con dirección bloqueada; rodearlo por un costado. |
| storm | Búho de la tormenta | Alas anchas, cejas y corona de rayos | Tres impactos de rayo escalonados en posiciones fijadas durante el aviso. Seguir moviéndose. |

## Contratos mínimos
`bosses.js` posee catálogo, creación, comportamiento, agrupación y zonas de peligro. Core lo llama desde `step`, `hit`, `checkLevel`; sin UI. Encuentro identificado por `encounterId`. Gemelos mantienen `encounterMaxHp` para una barra que no se rellena al morir uno. Auxiliar lleva `shieldOwnerId`; no cuenta como boss. Su muerte desactiva sólo el escudo de su dueño.

`boss-art.js` dibuja siluetas, escudos, auxiliar y zonas sin mutar Game ni usar RNG. Cada ataque se anuncia ≥0,75 s (bombas/rayos sucesivos añaden demora); tonos de peligro coral/marfil con contornos discontinuos durante aviso. Efectos solo con tiempo activo, máximo 64 peligros y 150 proyectiles; propietarios muertos cancelan sus peligros/proyectiles. No añadir menús ni dependencias.

QA: selección/umbrales, totalidad del catálogo, cada ataque/aviso y escape, gemelos/recompensa, láser/regeneración, escudo/auxiliar correcto, coexistencia, pausa/elección, terminales, reseteo, límites de entidades, HUD ES/EN y capturas Chromium/WebKit móvil/escritorio. Incluir humo del enlace público.


## Ampliación de repertorio y vida — 2026-10-03

Cada actor alterna su ataque original y dos adicionales, en ciclo para que todos aparezcan. El rey conserva carga, anillo de proyectiles y ráfaga, seguidos de dos ataques nuevos. Sus ataques usan ahora los avisos y límites comunes. Son 24 ataques añadidos: dos para cada hermano, dos para cada uno de los otros nueve encuentros y dos para el final.

| Boss / actor | Nuevo ataque 1 | Nuevo ataque 2 |
| --- | --- | --- |
| Gemelo espada | Estocada: embestida por un carril avisado | Corte del eclipse: dos tajos en sentidos opuestos, escalonados |
| Gemelo mago | Tríada de runas: tres explosiones alrededor de la posición fijada | Estrella arcana: ocho proyectiles radiales |
| Codorniz prismática | Prisma dividido: tres láseres divergentes | Estallido de cristal: seis fragmentos rápidos radiales |
| Pollo bastión | Onda de escudo: golpe recto a distancia | Martillo de asedio: impacto en posición marcada y onda posterior |
| Liebre cornuda | Terremoto: onda rápida desde el boss | Salto cornudo: salto hacia una zona marcada, impacto al aterrizar |
| Sapo bombardero | Charco ácido: zona persistente verde | Alfombra de bombas: cuatro detonaciones en línea escalonadas |
| Viuda de espinas | Cruz de seda: dos franjas persistentes | Abanico venenoso: cinco gotas verdes divergentes |
| Tortuga campanera | Implosión: anillo que se cierra, flechas hacia dentro | Triángulo de ecos: tres ondas escalonadas desde centros distintos |
| Cuervo segador | Guadañas gemelas: dos trayectorias de ida y vuelta | Corte de alas: dos sectores laterales, frente/espalda libres |
| Zorro de brasas | Rastro de fuego: tres zonas ardientes en línea | Salto de brasas: aterrizaje sobre una zona ardiente persistente |
| Búho de tormenta | Cruz de tormenta: dos descargas diagonales en el objetivo marcado | Jaula de rayos: seis impactos periféricos y uno central retrasado |
| Rey final | Terremoto real: dos ondas sucesivas | Juicio: cuatro rayos desde el rey y un impacto en el objetivo fijado |

Se mantienen la cura de la codorniz, el escudo/conejo del pollo, las recompensas y la cadencia de aparición. Peligros anunciados al menos 0,85 s; objetivos/direcciones fijados, sin persecución de las marcas. Daño limitado por la invulnerabilidad existente del jugador. Saltos sin daño de contacto durante el desplazamiento. Ácido, fuego, cristales y veneno diferenciados visualmente. Pausa/elección congelan el ciclo; muerte cancela efectos del actor.
