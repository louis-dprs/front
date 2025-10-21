import type { User } from "~/types/auth";

// H3-based auth composable
export const useAuth = () => {
  const user = useState<User | null>("auth:user", () => null);
  const loggedInAt = useState<number | null>("auth:loggedInAt", () => null);

  const loggedIn = computed(() => !!user.value);

  // Fetch user data from session API
  const fetch = async () => {
    try {
      const data = await $fetch<{ user: User | null; loggedInAt: number | null }>(
        "/api/auth/session"
      );
      user.value = data.user;
      loggedInAt.value = data.loggedInAt;
    } catch (error) {
      console.error("Failed to fetch user session:", error);
      user.value = null;
      loggedInAt.value = null;
    }
  };

  // Clear session
  const clear = async () => {
    try {
      await $fetch("/auth/logout");
      user.value = null;
      loggedInAt.value = null;
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // Login redirect
  const login = () => {
    navigateTo("/auth/login");
  };

  return {
    user,
    loggedIn,
    loggedInAt,
    fetch,
    clear,
    login,
  };
};
