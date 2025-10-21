<template>
  <div
    class="absolute inset-0 z-1 bg-gradient-to-b from-black via-zinc-900 to-black"
  >
    <img
      src="/resources/HomePage_Background.png"
      alt="Castle background"
      class="w-full h-full object-cover opacity-75"
    />
  </div>
  <div
    class="relative min-h-screen bg-black text-white overflow-hidden flex flex-col"
  >
    <div class="absolute top-6 left-6 z-10">
      <img
        src="/resources/CastleOfWhispers_Logo.png"
        alt="Castle of Whispers logo"
        class="h-72 w-auto object-contain"
      />
    </div>

    <nav class="absolute top-6 right-6 z-30 flex space-x-8 text-3xl">
      <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
      <NuxtLink to="/bestiary" class="hover:underline">Bestiary</NuxtLink>
      <NuxtLink to="/lore" class="hover:underline">Lore</NuxtLink>
      <a href="#" class="hover:underline">Community</a>
    </nav>

    <main class="relative z-10 flex flex-1 items-center justify-center">
      <slot />
    </main>

    <!-- Footer fixé en bas de page -->
    <footer
      class="absolute bottom-0 z-30 left-0 w-full py-4 text-center text-sm bg-zinc-900"
    >
      &copy; 2025 Castle of Whispers
    </footer>
  </div>
</template>
<script setup lang="ts"></script>
