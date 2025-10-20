import { defineStore } from "pinia";
import type { Creature } from "~/types/creature";
import { getCreaturesLocalized } from "~/api/creatureAPI";

export const useCreatureStore = defineStore("Creature", {
  state: () => ({
    Creatures: [] as Creature[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    bossCreatures: (state) => state.Creatures.filter((m) => m.rank === "Boss"),
    simpleCreatures: (state) =>
      state.Creatures.filter((m) => m.rank === "Normal"),
  },

  actions: {
    async fetchCreatures(locale: string) {
      this.loading = true;
      this.error = null;
      try {
        this.Creatures = await getCreaturesLocalized(locale);
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.error = err.message;
        } else {
          this.error = "Unknow Error";
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
