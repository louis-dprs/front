<template>
  <PublicLayout>
    <div class="flex flex-col gap-4">
      <!-- Show login button if not authenticated -->
      <MenuButton
        v-if="!user"
        v-model="isStartSelected"
        class="w-72 h-24 text-2xl"
        @click="handleLogin"
      >
        Login / Register
      </MenuButton>

      <!-- Show logout button if authenticated -->
      <MenuButton
        v-if="user"
        v-model="isLogoutSelected"
        class="w-72 h-24 text-2xl"
        @click="handleLogout"
      >
        Logout ({{ user.username || user.name }})
      </MenuButton>

      <!-- Show enter dungeon button if authenticated -->
      <MenuButton
        v-model="isOptionsSelected"
        class="w-72 h-24 text-2xl"
        :disabled="!user"
        @click="handleOptions"
      >
        Enter the dungeon
      </MenuButton>
    </div>
  </PublicLayout>
</template>

<script setup lang="ts">
import PublicLayout from "~/components/ui/layout/PublicLayout.vue";
import MenuButton from "~/components/ui/button/MenuButton.vue";

definePageMeta({
  ssr: true,
});

const { loggedIn, user, fetch: fetchSession, login: oidcLogin, logout: oidcLogout } = useAuth();

const isStartSelected = ref(false);
const isLogoutSelected = ref(false);
const isOptionsSelected = ref(false);

// Fetch session on mount
onMounted(async () => {
  await fetchSession();
});

async function handleLogin() {
  // Use nuxt-oidc-auth login
  await oidcLogin();
}

async function handleLogout() {
  // Use nuxt-oidc-auth logout
  await oidcLogout();
}

function handleOptions() {
  if (user.value) {
    navigateTo("/bestiary");
  }
}
</script>
