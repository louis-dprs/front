import type { User } from "~/types/auth";

export const useAuth = () => {
  const user = useState<User | null>("auth:user", () => null);
  const loggedIn = computed(() => !!user.value);
  const loading = useState<boolean>("auth:loading", () => false);

  const fetch = async () => {
    loading.value = true;
    try {
      const data = await $fetch<{ user: User | null; loggedInAt: number | null }>(
        "/api/auth/session"
      );
      user.value = data.user;
    } catch (error) {
      console.error("Failed to fetch session:", error);
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  const clear = () => {
    user.value = null;
  };

  return {
    user: readonly(user),
    loggedIn: readonly(loggedIn),
    loading: readonly(loading),
    fetch,
    clear,
  };
};
