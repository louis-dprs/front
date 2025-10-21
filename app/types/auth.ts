export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
}

export interface SessionData {
  user: User;
  tokens: {
    access: string;
    refresh: string;
    expiresAt?: number;
  };
  loggedInAt: number;
}
