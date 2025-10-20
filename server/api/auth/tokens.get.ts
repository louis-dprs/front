import { getSessionTokens } from "../../utils/auth-tokens";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const { accessToken, refreshToken, expiresAt } = getSessionTokens(session);

  return {
    hasAccessToken: Boolean(accessToken),
    hasRefreshToken: Boolean(refreshToken),
    expiresAt: expiresAt || null,
    expiresInMs: expiresAt ? Math.max(0, expiresAt - Date.now()) : null,
    now: Date.now(),
  };
});
