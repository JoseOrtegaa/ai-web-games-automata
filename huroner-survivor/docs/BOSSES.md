# Catálogo de bosses por mundo — 2026-10-03

Los bosses normales aparecen cada 5 niveles. Ya no existe un pool global: la capa actual aporta exactamente **5 bosses diferentes**, elegidos aleatoriamente evitando repetición inmediata. El rey final de los 600 s sigue separado. Los perfiles de ataque pueden reutilizarse entre mundos, pero nombre, silueta, material, proyectiles y paleta se adaptan al entorno.

## Mundo 1 · Superficie
| Boss | Perfil |
| --- | --- |
| Hermanos del eclipse | Dúo espada + magia |
| Codorniz prismática | Láser/cristal + regeneración |
| Pollo bastión | Escudo + objetivo auxiliar |
| Liebre cornuda | Embestida/terremoto/salto |
| Viuda de espinas | Telarañas/zonas/proyectiles |

## Mundo 2 · Subsuelo
| Boss | Perfil |
| --- | --- |
| Caballero del osario | Hoja de hueso de ida/vuelta + cortes |
| Oráculo de médula | Magia ósea, marcas y rayos |
| Bombardero de cráneos | Bombas y zonas malditas |
| Campanero del sepulcro | Ondas expansivas/implosivas |
| Sabueso del osario | Embestidas y salto |

## Mundo 3 · Profundidades
| Boss | Perfil |
| --- | --- |
| Coloso de granito | Ondas sísmicas |
| Vidente de cristal | Haces/cristales + regeneración |
| Carnero de cantera | Embestidas pétreas |
| Tejedora de obsidiana | Grietas persistentes y proyectiles |
| Artillero de la falla | Bombardeo de roca |

## Mundo 4 · Magma
| Boss | Perfil |
| --- | --- |
| Sabueso del infierno | Sectores y rastros de fuego |
| Segador de ceniza | Guadañas ardientes de ida/vuelta |
| Coloso de lava | Anillos de magma |
| Oráculo piromante | Marcas mágicas y rayos de fuego |
| Ariete volcánico | Embestidas y terremotos |

## Contratos
`BOSS_POOLS` contiene 4 listas de 5 IDs. `BOSSES` contiene 20 definiciones con `depth`, `profile`, `form`, nombre y pista ES/EN. `spawnBoss()` selecciona solo dentro de `game.worldDepth`; un tipo explícito sigue disponible para QA/DEV.

`bossProfile` controla la mecánica; `bossType` identifica el encuentro; `bossTheme` y `bossForm` controlan arte/paleta. Esto permite reutilizar una mecánica sin que dos bosses de mundos diferentes se vean iguales.

Se conservan las reglas de HP: bonus 30% en nivel 5, +1 punto porcentual por nivel hasta 50% desde nivel 25. Gemelos comparten barra/recompensa; Bastión mantiene su objetivo auxiliar. Cada encuentro normal concede una sola recompensa de boss. El rey final conserva carga, anillo, ráfaga, terremoto real y juicio.

Avisos de ataques permanecen anticipados, objetivos/direcciones se fijan antes del impacto, pausa/elección congelan simulación, muerte del dueño cancela hazards/proyectiles y se mantienen límites de 64 hazards y 150 proyectiles.

## Arte
Superficie conserva las siluetas animales existentes. Subsuelo usa hueso/calavera/caballeros/oráculos; Profundidades usa granito, cristal y obsidiana; Magma usa ceniza, roca fundida y fuego. La magia y los proyectiles toman la paleta del mundo. Las zonas tipo telaraña pasan a grietas de obsidiana en roca.

## QA vigente
Comprobar: 20 IDs únicos; 5 bosses y 5 perfiles distintos por mundo; selección restringida a la capa; no repetición inmediata; cada encuentro ejecuta su perfil; perfiles extra siguen alcanzables; coexistencia mantiene límites; rey final sigue separado; HUD resuelve nombre/pista por `bossType`.
