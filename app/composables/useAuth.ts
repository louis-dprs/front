import type { User } from "~/types/auth";

// Simple auth composable with H3 sessions
export const useAuth = () => {
  const user = useState<User | null>("auth:user", () => null);
  const loggedInAt = useState<number | null>("auth:loggedInAt", () => null);

  const loggedIn = computed(() => !!user.value);

  // Fetch user data from session API
  const fetch = async () => {
    try {
      const data = await $fetch<{ user: User | null; loggedInAt: number | null }>(
        "/dev/api/auth/session"
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
    user.value = null;
    loggedInAt.value = null;
  };

  // Login redirect
  const login = () => {
    navigateTo("/dev/auth/login");
  };

  // Logout
  const logout = async () => {
    await $fetch("/dev/api/auth/logout", { method: "POST" });
    user.value = null;
    loggedInAt.value = null;
  };

  return {
    user,
    loggedIn,
    loggedInAt,
    fetch,
    clear,
    login,
    logout,
  };
};
