export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const authUrl = `${config.oauth.keycloak.serverUrl}/realms/${config.oauth.keycloak.realm}/protocol/openid-connect/auth`;
  
  const params = new URLSearchParams({
    client_id: config.oauth.keycloak.clientId,
    redirect_uri: config.oauth.keycloak.redirectUrl,
    response_type: "code",
    scope: "openid profile email",
  });

  return sendRedirect(event, `${authUrl}?${params.toString()}`, 302);
});
