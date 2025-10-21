/**
 * Simple in-memory token store
 * For production, use Redis or a database
 */

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

const tokenStore = new Map<string, TokenData>();

export function storeTokens(sessionId: string, tokens: TokenData) {
  tokenStore.set(sessionId, tokens);
}

export function getTokens(sessionId: string): TokenData | undefined {
  return tokenStore.get(sessionId);
}

export function removeTokens(sessionId: string) {
  tokenStore.delete(sessionId);
}

export function updateTokens(
  sessionId: string,
  updates: Partial<TokenData>
): boolean {
  const existing = tokenStore.get(sessionId);
  if (!existing) return false;

  tokenStore.set(sessionId, {
    ...existing,
    ...updates,
  });
  return true;
}
