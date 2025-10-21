import { randomBytes } from "node:crypto";
import { storeSession } from "../../utils/token-store";

export default defineOAuthKeycloakEventHandler({
  async onSuccess(event, { user, tokens }) {
    const now = Date.now();
    const expiresInSec = Number(tokens.expires_in || tokens.expiresIn || 0);
    const expiresAt = expiresInSec > 0 ? now + expiresInSec * 1000 : undefined;

    // Generate a short unique session ID (16 bytes = 32 hex chars)
    const sessionId = randomBytes(16).toString("hex");

    // Store EVERYTHING server-side (tokens + user info)
    storeSession(sessionId, {
      tokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
      },
      user: {
        keycloakId: user.sub,
        email: user.email,
        name: user.name || user.preferred_username,
        username: user.preferred_username,
      },
      loggedInAt: now,
    });

    // ONLY store the session ID in the cookie - nothing else
    await setUserSession(event, {
      sid: sessionId, // Only the session ID - ultra minimal
    });
    return sendRedirect(event, "/dev/");
  },
  onError(event, _error) {
    return sendRedirect(event, "/dev/?error=auth_failed");
  },
});
