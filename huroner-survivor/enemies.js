export const ENEMY_ROSTERS = [
  ['rabbit','hare','quail','chicken'],
  ['bone_skull','bone_swordsman','bone_archer','bone_rabbit'],
  ['stone_swordsman','stone_archer','stone_rabbit','stone_boar'],
  ['ash_swordsman','ember_archer','lava_beast','magma_skull'],
];

const DEFINITIONS = {
  rabbit:{hp:23,speed:29,r:17,xp:2,attack:'jump',specialTier:1,stain:'#812e39',death:'#a35453'},
  hare:{hp:18,speed:43,r:17,xp:2,attack:'ram',specialTier:1,stain:'#812e39',death:'#a35453'},
  quail:{hp:14,speed:37,r:12,xp:2,attack:'fan',specialTier:1,projectile:'feather',stain:'#812e39',death:'#a35453'},
  chicken:{hp:35,speed:24,r:17,xp:3,attack:'burst',specialTier:1,stain:'#812e39',death:'#a35453'},

  bone_skull:{hp:21,speed:38,r:14,xp:2,attack:'ram',evolvedAttack:'explode',specialTier:0,stain:'#665d50',death:'#d8c9a4'},
  bone_swordsman:{hp:29,speed:31,r:17,xp:2,attack:'lunge',specialTier:0,stain:'#665d50',death:'#d8c9a4'},
  bone_archer:{hp:19,speed:25,r:15,xp:2,attack:'shot',specialTier:0,projectile:'bone',stain:'#665d50',death:'#d8c9a4'},
  bone_rabbit:{hp:25,speed:36,r:17,xp:2,attack:'jump',specialTier:0,stain:'#665d50',death:'#d8c9a4'},

  stone_swordsman:{hp:39,speed:27,r:18,xp:2,attack:'lunge',specialTier:0,stain:'#4c4542',death:'#81766e'},
  stone_archer:{hp:28,speed:22,r:16,xp:2,attack:'shot',specialTier:0,projectile:'rock',stain:'#4c4542',death:'#81766e'},
  stone_rabbit:{hp:35,speed:31,r:18,xp:2,attack:'jump',specialTier:0,stain:'#4c4542',death:'#81766e'},
  stone_boar:{hp:49,speed:27,r:20,xp:3,attack:'ram',specialTier:0,stain:'#4c4542',death:'#81766e'},

  ash_swordsman:{hp:47,speed:30,r:18,xp:2,attack:'lunge',specialTier:0,stain:'#4d211b',death:'#b75a32'},
  ember_archer:{hp:33,speed:25,r:16,xp:2,attack:'shot',specialTier:0,projectile:'ember',stain:'#4d211b',death:'#b75a32'},
  lava_beast:{hp:46,speed:34,r:19,xp:2,attack:'jump',specialTier:0,stain:'#4d211b',death:'#b75a32'},
  magma_skull:{hp:34,speed:40,r:15,xp:3,attack:'explode',specialTier:0,stain:'#4d211b',death:'#e46b32'},
};

const EVOLUTION_LEVELS = [5,12,25,35];

const ALTERNATE_ATTACKS = {
  rabbit:['lunge'],hare:['jump'],quail:['shot'],chicken:['lunge'],
  bone_skull:['lunge'],bone_swordsman:['ram'],bone_archer:['fan'],bone_rabbit:['lunge'],
  stone_swordsman:['ram'],stone_archer:['fan'],stone_rabbit:['ram'],stone_boar:['burst'],
  ash_swordsman:['ram'],ember_archer:['fan'],lava_beast:['ram'],magma_skull:['ram'],
};

const EVOLVED_ALTERNATE_ATTACKS = {
  bone_skull:['ram'],
};

export function enemyRoster(depth=0) {
  const index=Math.max(0,Math.min(3,Math.round(Number(depth)||0)));
  return ENEMY_ROSTERS[index];
}

export function enemyDefinition(kind) {
  return DEFINITIONS[kind] ?? DEFINITIONS.rabbit;
}

export function enemyEvolutionTier(depth=0,level=1) {
  const index=Math.max(0,Math.min(3,Math.round(Number(depth)||0)));
  return Number(level)>=EVOLUTION_LEVELS[index]?1:0;
}

export function enemyAttackStyle(kind,tier=0) {
  const def=enemyDefinition(kind);
  return tier>=1&&def.evolvedAttack?def.evolvedAttack:def.attack;
}

export function enemyAttackOptions(kind,tier=0) {
  const primary=enemyAttackStyle(kind,tier);
  const alternates=tier>=1&&EVOLVED_ALTERNATE_ATTACKS[kind]
    ?EVOLVED_ALTERNATE_ATTACKS[kind]
    :(ALTERNATE_ATTACKS[kind]||[]);
  return [primary,...alternates.filter(attack=>attack!==primary)];
}

export function isSurfaceEnemy(kind) {
  return ENEMY_ROSTERS[0].includes(kind);
}
