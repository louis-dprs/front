// nuxt-oidc-auth composable wrapper
export const useAuth = () => {
  const { loggedIn, user, session, fetch, clear, login, logout } = useOidcAuth();

  return {
    user,
    loggedIn,
    session,
    fetch,
    clear,
    login: () => login("keycloak"),
    logout,
  };
};
