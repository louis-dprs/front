import { defineStore } from "pinia";
import type { Class } from "~/types/class";
import { getClassesLocalized } from "~/api/classAPI";

export const useClassStore = defineStore("Class", {
  state: () => ({
    Classes: [] as Class[],
    selectedClass: null as Class | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getById: (state) => {
      return (id: string) => state.Classes.find((c) => c.id === id) || null;
    },
  },

  actions: {
    async fetchClasses(locale: string) {
      this.loading = true;
      this.error = null;
      try {
        this.Classes = await getClassesLocalized(locale);
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
