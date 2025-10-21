import { randomUUID } from "node:crypto";
import { storeTokens } from "../../utils/token-store";

export default defineOAuthKeycloakEventHandler({
  async onSuccess(event, { user, tokens }) {
    const now = Date.now();
    const expiresInSec = Number(tokens.expires_in || tokens.expiresIn || 0);
    const expiresAt = expiresInSec > 0 ? now + expiresInSec * 1000 : undefined;

    // Generate a unique session ID
    const sessionId = randomUUID();

    // Store tokens server-side (not in cookie)
    storeTokens(sessionId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    });

    // Only store minimal user info and session ID in cookie
    await setUserSession(event, {
      user: {
        keycloakId: user.sub,
        email: user.email,
        name: user.name || user.preferred_username,
        username: user.preferred_username,
      },
      loggedInAt: now,
      sessionId, // Only store the session ID, not the tokens
    });
    return sendRedirect(event, "/dev/");
  },
  onError(event, _error) {
    return sendRedirect(event, "/dev/?error=auth_failed");
  },
});
