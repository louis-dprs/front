/**
 * Simple in-memory session store
 * For production, use Redis or a database
 */

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface UserData {
  keycloakId: string;
  email: string;
  name: string;
  username: string;
}

export interface SessionData {
  tokens: TokenData;
  user: UserData;
  loggedInAt: number;
}

const sessionStore = new Map<string, SessionData>();

export function storeTokens(sessionId: string, tokens: TokenData) {
  const existing = sessionStore.get(sessionId);
  if (existing) {
    existing.tokens = tokens;
    sessionStore.set(sessionId, existing);
  }
}

export function storeSession(sessionId: string, data: SessionData) {
  sessionStore.set(sessionId, data);
}

export function getSession(sessionId: string): SessionData | undefined {
  return sessionStore.get(sessionId);
}

export function getTokens(sessionId: string): TokenData | undefined {
  return sessionStore.get(sessionId)?.tokens;
}

export function getUser(sessionId: string): UserData | undefined {
  return sessionStore.get(sessionId)?.user;
}

export function removeTokens(sessionId: string) {
  sessionStore.delete(sessionId);
}

export function updateTokens(
  sessionId: string,
  updates: Partial<TokenData>
): boolean {
  const existing = sessionStore.get(sessionId);
  if (!existing) return false;

  existing.tokens = {
    ...existing.tokens,
    ...updates,
  };
  sessionStore.set(sessionId, existing);
  return true;
}
