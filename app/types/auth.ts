export interface User {
  keycloakId: string;
  email: string;
  name: string;
  username: string;
}

export interface UserSession {
  user: User;
  loggedInAt: number;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // epoch ms
}

declare module "#auth-utils" {
  interface User {
    keycloakId: string;
    email: string;
    name: string;
    username: string;
  }

  interface UserSession {
    loggedInAt?: number;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

export {};
