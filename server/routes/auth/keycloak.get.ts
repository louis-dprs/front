export default defineOAuthKeycloakEventHandler({
  async onSuccess(event, { user, tokens }) {
    const now = Date.now();
    const expiresInSec = Number(tokens.expires_in || tokens.expiresIn || 0);
    const expiresAt = expiresInSec > 0 ? now + expiresInSec * 1000 : undefined;

    await setUserSession(event, {
      user: {
        keycloakId: user.sub,
        email: user.email,
        name: user.name || user.preferred_username,
        username: user.preferred_username,
      },
      loggedInAt: now,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    });
    return sendRedirect(event, "/dev/");
  },
  onError(event, _error) {
    return sendRedirect(event, "/dev/?error=auth_failed");
  },
});
