export interface User {
  keycloakId: string;
  email: string;
  name: string;
  username: string;
}

export interface UserSession {
  user: User;
  loggedInAt: number;
  sessionId?: string; // Reference to server-side token storage
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
    sessionId?: string; // Reference to server-side token storage
  }
}

export {};
