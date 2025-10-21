export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
}

declare module "#auth-utils" {
  interface User {
    id: string;
    email: string;
    name: string;
    username: string;
  }

  interface UserSession {
    user?: User;
    loggedInAt?: number;
    secure?: {
      accessToken: string;
      refreshToken: string;
      expiresAt?: number;
    };
  }
}

export {};
