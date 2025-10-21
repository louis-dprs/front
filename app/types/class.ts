export interface Class {
  id: string;
  stats: {
    strength: number;
    stamina: number;
    intelligence: number;
    agility: number;
    hp: number;
  };
  iconKey: string;
  version: number;
  publishedAt: string;
  locale: string;
  name: string;
  shortDesc: string;
  lore: string;
}
