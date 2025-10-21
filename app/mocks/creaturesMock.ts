import type { Creature } from "~/types/creature";

export const mockCreatures: Creature[] = [
  {
    id: "goblin1fr",
    rank: "Normal",
    stats: {
      strength: 5,
      stamina: 5,
      intelligence: 8,
      agility: 12,
      hp: 30,
    },
    iconKey: "/resources/bestiary/monster/crypt-goblin.png",
    version: 0,
    publishedAt: "2025-10-01T07:44:34.758Z",
    locale: "fr",
    name: "Crypt Goblin",
    shortDesc:
      "A twisted little creature lurking in the damp cellars of the castle. Quick but fragile.",
    lore: "string",
  },
  {
    id: "necromancer1en",
    rank: "Normal",
    stats: {
      strength: 5,
      stamina: 5,
      intelligence: 8,
      agility: 12,
      hp: 30,
    },
    iconKey: "/resources/bestiary/monster/cursed-necromancer.png",
    version: 0,
    publishedAt: "2025-10-01T07:44:34.758Z",
    locale: "en",
    name: "Cursed Necromancer",
    shortDesc:
      "A fallen sorcerer wandering the haunted halls, summoning the dead to torment the living.",
    lore: "string",
  },
  {
    id: "withered-orc1en",
    rank: "Normal",
    stats: {
      strength: 5,
      stamina: 5,
      intelligence: 8,
      agility: 12,
      hp: 30,
    },
    iconKey: "/resources/bestiary/monster/withered-orc.png",
    version: 0,
    publishedAt: "2025-10-01T07:44:34.758Z",
    locale: "en",
    name: "Withered Orc",
    shortDesc:
      "A fallen sorcerer wandering the haunted halls, summoning the dead to torment the living.",
    lore: "string",
  },
  {
    id: "warlord1en",
    rank: "Boss",
    stats: {
      strength: 5,
      stamina: 5,
      intelligence: 8,
      agility: 12,
      hp: 30,
    },
    iconKey: "/resources/bestiary/boss/warlord-revenant.png",
    version: 0,
    publishedAt: "2025-10-01T07:44:34.758Z",
    locale: "en",
    name: "Warlord Revenant",
    shortDesc:
      "A cursed warlord, his armor fused to his decaying body. He guards the castle gates with brute force and relentless fury.",
    lore: "string",
  },
  {
    id: "archmage1en",
    rank: "Boss",
    stats: {
      strength: 5,
      stamina: 5,
      intelligence: 8,
      agility: 12,
      hp: 30,
    },
    iconKey: "resources/bestiary/boss/archmage-of-shadow.png",
    version: 0,
    publishedAt: "2025-10-01T07:44:34.758Z",
    locale: "en",
    name: "archmage of shadow",
    shortDesc:
      "A mysterious sorcerer cloaked in darkness, wielding forbidden magic and secrets of the unseen.",
    lore: "string",
  },
];
