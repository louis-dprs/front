<template>
  <PublicLayout>
    <section class="flex items-center justify-center h-screen">
      <div class="relative flex items-center justify-center">
        <NuxtImg
          src="/resources/Book_Page.png"
          alt="Background"
          class="object-contain w-[400px] h-auto"
          priority
        />

        <div
          class="w-[330px] h-[445px] flex flex-col items-start text-left p-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <!-- Main title -->
          <h1
            class="self-center w-full text-3xl font-bold mb-6 tracking-wider bg-gradient-to-b from-black to-red-800 bg-clip-text text-transparent animate-flicker"
          >
            {{ mainTitle }}
          </h1>

          <!-- Dynamic sections -->
          <div
            v-for="(section, index) in loreSections"
            :key="index"
            class="mb-4"
          >
            <h2 class="text-xl font-semibold mb-2 text-red-800">
              {{ section.title }}
            </h2>
            <p
              v-for="(paragraph, pIndex) in section.content"
              :key="pIndex"
              class="mb-2 text-base leading-relaxed text-black"
            >
              {{ paragraph }}
            </p>
          </div>

          <p class="mt-4 italic text-black">
            Will you dare to explore its darkness and uncover its secrets?
          </p>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<script setup>
import PublicLayout from "~/components/ui/layout/PublicLayout.vue";
import { NuxtImg } from "#components";

definePageMeta({
  ssr: true,
});

const mainTitle = "Castle of Whispers";

// Each section has a very short lore
const loreSections = [
  {
    title: "History",
    content: ["An ancient castle shrouded in eternal mist."],
  },
  {
    title: "Adventurers",
    content: ["Brave souls seek its hidden secrets."],
  },
  {
    title: "Secrets",
    content: ["A forbidden library, hidden dungeons, and a mysterious portal."],
  },
];
</script>

<style scoped>
@keyframes flicker {
  0%,
  19%,
  21%,
  23%,
  25%,
  54%,
  56%,
  100% {
    opacity: 1;
  }
  20%,
  22%,
  24%,
  55% {
    opacity: 0.5;
  }
}

.animate-flicker {
  animation: flicker 2s infinite;
}
</style>
