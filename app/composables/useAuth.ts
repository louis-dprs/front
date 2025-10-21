
// Composable basé sur nuxt-oidc-auth

export const useAuth = () => {
  const { login, logout, isAuthenticated, user, loading, error } = useOidcAuth();

  return {
    user,
    loggedIn: isAuthenticated,
    loading,
    error,
    login,
    logout,
  };
};
