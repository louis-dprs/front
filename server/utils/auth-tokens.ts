import type { H3Event } from "h3";
import type { UserSession } from "#auth-utils";
import { getTokens } from "./token-store";

export function getSessionTokens(session: UserSession) {
  const sessionId = session?.sessionId as string | undefined;
  if (!sessionId) {
    return {
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
    };
  }

  const tokens = getTokens(sessionId);
  return {
    accessToken: tokens?.accessToken,
    refreshToken: tokens?.refreshToken,
    expiresAt: tokens?.expiresAt,
  };
}

export function isTokenExpiringSoon(expiresAt?: number, skewMs = 30_000) {
  if (!expiresAt) return true;
  return Date.now() + skewMs >= expiresAt;
}

export async function ensureValidAccessToken(event: H3Event) {
  const session = await getUserSession(event);
  const { accessToken, refreshToken, expiresAt } = getSessionTokens(session);

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

    const response = await $fetch<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    // Calculate new expiration
    const now = Date.now();
    const newExpiresAt =
      response.expires_in > 0 ? now + response.expires_in * 1000 : undefined;

    // Update tokens in server-side store
    const sessionId = session?.sessionId as string | undefined;
    if (sessionId) {
      const { updateTokens } = await import("./token-store");
      updateTokens(sessionId, {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: newExpiresAt,
      });
    }

    return response.access_token;
  } catch {
    // Refresh failed (token expired, revoked, or network issue)
    // Return null to signal that authentication is required
    return null;
  }
}
