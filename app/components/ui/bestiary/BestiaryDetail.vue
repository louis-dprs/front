<template>
  <div
    class="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-lg"
  >
    <NuxtImg
      src="/resources/Book_Page.png"
      alt="Background"
      class="absolute inset-0 w-full h-full object-contain"
      priority
    />

    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-md flex flex-col items-center w-[367px] h-[523px] relative"
    >
      <NuxtImg
        :src="entity.iconKey"
        :alt="entity.name"
        class="absolute top-0 left-0 w-full h-50 object-cover rounded-t-md"
      />

      <div
        class="mt-48 w-full flex flex-col items-center text-center text-black text-sm leading-snug"
      >
        <h2 class="text-2xl font-bold mb-1">{{ entity.name }}</h2>
        <p class="mb-1">{{ entity.shortDesc }}</p>
        <p class="mb-2">Base HP: {{ entity.stats.hp }}</p>

        <h3 class="text-lg font-semibold mb-1">Statistics</h3>
        <table class="w-full mb-4 text-sm border-collapse border border-black">
          <thead class="bg-zinc-300/60">
            <tr>
              <th class="border border-black px-3 py-1">Stat</th>
              <th class="border border-black px-3 py-1">Level 1</th>
              <th class="border border-black px-3 py-1">Level Up</th>
            </tr>
          </thead>
          <tbody class="bg-zinc-300/30">
            <tr>
              <td class="border border-black px-3 py-1">Strength</td>
              <td class="border border-black px-3 py-1">
                {{ entity.stats.strength }}
              </td>
              <td class="border border-black px-3 py-1">
                + {{ entity.stats.strength_up }}
              </td>
            </tr>
            <tr>
              <td class="border border-black px-3 py-1">Stamina</td>
              <td class="border border-black px-3 py-1">
                {{ entity.stats.stamina }}
              </td>
              <td class="border border-black px-3 py-1">
                + {{ entity.stats.stamina_up }}
              </td>
            </tr>
            <tr>
              <td class="border border-black px-3 py-1">Intelligence</td>
              <td class="border border-black px-3 py-1">
                {{ entity.stats.intelligence }}
              </td>
              <td class="border border-black px-3 py-1">
                + {{ entity.stats.intelligence_up }}
              </td>
            </tr>
            <tr>
              <td class="border border-black px-3 py-1">Agility</td>
              <td class="border border-black px-3 py-1">
                {{ entity.stats.agility }}
              </td>
              <td class="border border-black px-3 py-1">
                + {{ entity.stats.agility_up }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NuxtImg } from "#components";
import type { Creature } from "~/types/creature";
import type { Class } from "~/types/class";

defineProps<{
  entity: Creature | Class;
}>();
</script>
