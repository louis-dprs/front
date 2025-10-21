export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;
  const config = useRuntimeConfig();

  if (!code) {
    return sendRedirect(event, "/dev/?error=no_code");
  }

  try {
    // Exchange code for tokens
    const keycloakServer = process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL;
    const realm = process.env.NUXT_OAUTH_KEYCLOAK_REALM;
    const clientId = process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET;
    const redirectUri = process.env.NUXT_OAUTH_KEYCLOAK_REDIRECT_URL;

    const tokenUrl = `${keycloakServer}/realms/${realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri!,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error("Token exchange failed");
    }

    const tokens = await tokenResponse.json();

    // Decode JWT to get user info
    const accessToken = tokens.access_token;
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1], "base64").toString()
    );

    // Use H3 session
    const config = useRuntimeConfig(event);
    const session = await useSession(event, {
      password: config.sessionPassword,
      name: "s",
    });

    await session.update({
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        username: payload.preferred_username,
      },
      tokens: {
        access: tokens.access_token,
        refresh: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      },
      loggedInAt: Date.now(),
    });

    // Redirect to home page
    return sendRedirect(event, "/dev/");
  } catch (error) {
    console.error("OAuth callback error:", error);
    return sendRedirect(event, "/dev/?error=auth_failed");
  }
});
