export interface User {
  keycloakId: string;
  email: string;
  name: string;
  username: string;
}

export interface UserSession {
  user: User;
  loggedInAt: number;
  sid?: string; // Session ID - Reference to server-side session storage
}

declare module "#auth-utils" {
  interface User {
    keycloakId: string;
    email: string;
    name: string;
    username: string;
  }

  interface UserSession {
    sid?: string; // Session ID - Only this is stored in the cookie
  }
}

export {};
