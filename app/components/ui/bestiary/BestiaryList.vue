<template>
  <div class="grid grid-cols-1 gap-12 max-w-6xl mx-auto px-4">
    <BestiaryDetail
      v-for="entity in entities"
      :key="entity.id"
      :entity="entity"
    />
  </div>
</template>

<script setup lang="ts">
import type { Creature } from "~/types/creature";
import type { Class } from "~/types/class";
import BestiaryDetail from "@/components/ui/bestiary/BestiaryDetail.vue";

defineProps<{
  entities: (Creature | Class)[];
}>();
</script>
