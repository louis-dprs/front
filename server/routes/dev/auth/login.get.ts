export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  const keycloakServer = config.public.keycloakUrl || process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL;
  const realm = config.public.keycloakRealm || process.env.NUXT_OAUTH_KEYCLOAK_REALM;
  const clientId = config.public.keycloakClientId || process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_ID;
  const redirectUri = config.public.keycloakRedirectUrl || process.env.NUXT_OAUTH_KEYCLOAK_REDIRECT_URL;

  const authUrl = `${keycloakServer}/realms/${realm}/protocol/openid-connect/auth`;
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
  });

  return sendRedirect(event, `${authUrl}?${params.toString()}`);
});
