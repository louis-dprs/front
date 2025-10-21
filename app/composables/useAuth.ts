// Simple wrapper around useUserSession with API fallback
export const useAuth = () => {
  const { loggedIn, user, fetch, clear } = useUserSession();

  // Extend fetch to also call API if needed
  const fetchWithFallback = async () => {
    await fetch();
    
    // If session exists, fetch full user data from API
    if (loggedIn.value) {
      try {
        const data = await $fetch<{ user: any; loggedInAt: number | null }>(
          "/api/auth/session"
        );
        // Update user state with API data
        if (data.user) {
          Object.assign(user.value, data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    }
  };

  return {
    user,
    loggedIn,
    fetch: fetchWithFallback,
    clear,
  };
};
