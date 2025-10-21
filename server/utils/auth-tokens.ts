import type { H3Event } from "h3";
import { useSession } from "h3";

export async function getSessionTokens(event: H3Event) {
  const config = useRuntimeConfig(event);
  const session = await useSession(event, {
    password: config.sessionPassword,
    name: "s",
  });

  const tokens = session.data.tokens as {
    access?: string;
    refresh?: string;
    expiresAt?: number;
  } | undefined;

  return {
    accessToken: tokens?.access,
    refreshToken: tokens?.refresh,
    expiresAt: tokens?.expiresAt,
  };
}

export function isTokenExpiringSoon(expiresAt?: number, skewMs = 30_000) {
  if (!expiresAt) return true;
  return Date.now() + skewMs >= expiresAt;
}

export async function ensureValidAccessToken(event: H3Event) {
  const { accessToken, refreshToken, expiresAt } = await getSessionTokens(event);

  // If no token at all, return null (caller decides what to do)
  if (!accessToken) return null;

  // If not expiring soon, return as-is
  if (!isTokenExpiringSoon(expiresAt)) return accessToken;

  // Token is expiring or expired, try to refresh
  if (!refreshToken) {
    // No refresh token available, force logout (return null)
    return null;
  }

  try {
    const config = useRuntimeConfig(event);
    const keycloakServerUrl = config.oauth?.keycloak?.serverUrl as
      | string
      | undefined;
    const realm = config.oauth?.keycloak?.realm as string | undefined;
    const clientId = config.oauth?.keycloak?.clientId as string | undefined;

    if (!keycloakServerUrl || !realm || !clientId) {
      // Missing config, force logout (return null)
      return null;
    }

    const tokenEndpoint = `${keycloakServerUrl}/realms/${realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    });

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    // Calculate new expiration
    const now = Date.now();
    const newExpiresAt =
      data.expires_in > 0 ? now + data.expires_in * 1000 : undefined;

    // Update session with new tokens
    const session = await useSession(event, {
      password: config.sessionPassword,
      name: "s",
    });

    await session.update({
      ...session.data,
      tokens: {
        access: data.access_token,
        refresh: data.refresh_token,
        expiresAt: newExpiresAt,
      },
    });

    return data.access_token;
  } catch {
    // Refresh failed (token expired, revoked, or network issue)
    // Return null to signal that authentication is required
    return null;
  }
}
