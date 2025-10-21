<template>
  <PublicLayout>
    <section class="container mx-auto px-6 py-12">
      <div class="flex justify-center mb-8 gap-4">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="[
            'px-6 py-2 rounded-xl font-semibold',
            activeTab === tab
              ? 'bg-zinc-700 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800',
          ]"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <BestiaryList :entities="currentList" />
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useCreatureStore } from "~/stores/creatureStore";
import PublicLayout from "~/components/ui/layout/PublicLayout.vue";
import BestiaryList from "~/components/ui/bestiary/BestiaryList.vue";

definePageMeta({
  ssr: true,
});

const tabs = ["Monsters", "Bosses", "Characters"];
const activeTab = ref("Monsters");

const creatureStore = useCreatureStore();
const classStore = useClassStore();

onMounted(async () => {
  await creatureStore.fetchCreatures("en");
  await classStore.fetchClasses("en");
});

const currentList = computed(() => {
  if (activeTab.value === "Monsters") return creatureStore.simpleCreatures;
  if (activeTab.value === "Bosses") return creatureStore.bossCreatures;
  return classStore.Classes;
});
</script>
