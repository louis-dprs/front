import { useSession } from "h3";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;

  if (!code) {
    return sendRedirect(event, "/dev/?error=no_code");
  }

  try {
    const config = useRuntimeConfig(event);
    const tokenEndpoint = `${config.oauth.keycloak.serverUrl}/realms/${config.oauth.keycloak.realm}/protocol/openid-connect/token`;

    // Exchange code for tokens
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: config.oauth.keycloak.clientId,
      redirect_uri: config.oauth.keycloak.redirectUrl,
    });

    if (config.oauth.keycloak.clientSecret) {
      body.append("client_secret", config.oauth.keycloak.clientSecret);
    }

    const tokenResponse = await $fetch<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    // Decode JWT to get user info
    const payload = JSON.parse(
      Buffer.from(tokenResponse.access_token.split(".")[1], "base64").toString()
    );

    // Store in H3 session
    const session = await useSession(event, {
      password: config.sessionPassword,
      name: "s",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      cookie: {
        sameSite: "lax",
        secure: false,
        httpOnly: true,
      },
    });

    await session.update({
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.preferred_username,
        username: payload.preferred_username,
      },
      tokens: {
        access: tokenResponse.access_token,
        refresh: tokenResponse.refresh_token,
        expiresAt: Date.now() + tokenResponse.expires_in * 1000,
      },
      loggedInAt: Date.now(),
    });

    return sendRedirect(event, "/dev/");
  } catch (error) {
    console.error("Keycloak auth error:", error);
    return sendRedirect(event, "/dev/?error=auth_failed");
  }
});
