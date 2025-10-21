# 🔐 Keycloak Authentication Setup

## Overview

This project uses **Keycloak** for OAuth authentication via the `nuxt-auth-utils` module.

In addition, server-side API calls go through a lightweight proxy (`/api/proxy/...`) that:

- reads the access token from the user session (if present),
- attaches `Authorization: Bearer <token>` to outgoing requests,
- forwards requests without `Authorization` when no token is present (backend decides 401/403),
- returns backend errors/status codes as-is when possible.

## Configuration

### Environment Variables (`.env`)

The project expects the following environment variables. Do NOT commit secrets to the repository; keep them in a local `.env` or a secrets manager.

```env
NUXT_SESSION_PASSWORD=<generate_a_secure_server_side_session_password>
NUXT_OAUTH_KEYCLOAK_CLIENT_ID=<keycloak_client_id>
NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET=<client_secret_or_empty_if_not_required>
NUXT_OAUTH_KEYCLOAK_REDIRECT_URL=http://localhost:3000/dev/auth/keycloak
NUXT_OAUTH_KEYCLOAK_SERVER_URL=<keycloak_base_url> # e.g. https://keycloak.example.com/auth
NUXT_OAUTH_KEYCLOAK_SERVER_URL_INTERNAL=<optional_internal_url_if_different>
NUXT_OAUTH_KEYCLOAK_REALM=<keycloak_realm>
```

Notes:

- `NUXT_SESSION_PASSWORD` is used to encrypt server-side sessions. Keep it secret.
- `NUXT_OAUTH_KEYCLOAK_REDIRECT_URL` must match the redirect URI configured in your Keycloak client. In this project the callback route is mounted under the `/dev/` base (see `nuxt.config.ts` -> `app.baseURL`).

### Nuxt configuration

This repository does not hard-code an `oauth` object into `nuxt.config.ts`. Instead, `nuxt-auth-utils` reads the environment variables at runtime. Keep the variables above available to the app (local `.env`, process manager, or CI secrets).

## File Structure

```
server/
├── api/
│   ├── auth/
│   │   ├── session.get.ts        # Get current user session
│   │   └── tokens.get.ts         # Debug endpoint for token status
│   └── proxy/
│       └── [...path].ts          # Server-side proxy with token injection
├── routes/
│   └── auth/
│       ├── keycloak.get.ts       # OAuth callback handler
│       └── logout.get.ts         # Logout endpoint
├── middleware/
│   └── auth.ts                   # Server middleware for route protection
└── utils/
    └── auth-tokens.ts            # Token management utilities

app/
├── api/
│   ├── classAPI.ts               # Class API client (uses proxy)
│   └── creatureAPI.ts            # Creature API client (uses proxy)
├── pages/
│   └── index.vue                 # Home page with login/logout
└── types/
    └── auth.ts                   # TypeScript type definitions
```

## OAuth Flow

1. Login

- User clicks "Login / Register"
- Redirects to `/auth/keycloak` (handled by `nuxt-auth-utils`)
- Keycloak redirects back to the URL set in `NUXT_OAUTH_KEYCLOAK_REDIRECT_URL`

2. Callback

- The server route `server/routes/auth/keycloak.get.ts` receives the OAuth code and exchanges it for tokens (implementation provided by `nuxt-auth-utils`).
- On success the handler stores a minimal user object in the encrypted server-side session and redirects to `/dev/` (see `keycloak.get.ts`).

3. Session Management

- Session is stored server-side (encrypted with `NUXT_SESSION_PASSWORD`).
- On successful login, the session contains:
  - user (id, email, name, username)
  - loggedInAt
  - accessToken, refreshToken, expiresAt (for backend calls via the proxy)
- Use the `useUserSession()` composable on the client to fetch session data.
- Protected routes use server middleware to verify the session.

4. Logout

- The logout route clears the session and redirects to `/dev/`.

## Route protection and concrete paths

- Callback route used by Keycloak: `GET /dev/auth/keycloak` (the `dev` base comes from `app.baseURL` in `nuxt.config.ts`).
- After successful login the server redirects to `/dev/`.
- API session endpoint: `GET /dev/api/auth/session` (client uses `/api/auth/session` with the app base)

## Usage in Components

```text
// Exemple d'utilisation du composable `useUserSession()` côté client
import { onMounted } from "vue";

const { loggedIn, user, fetch: fetchSession } = useUserSession();

onMounted(async () => {
  await fetchSession();
});

if (loggedIn.value) {
  console.log("User:", user.value);
}
```

## Available Routes

- `GET /auth/keycloak` - Initiate OAuth flow with Keycloak
- `GET /auth/logout` - Logout user
- `GET /api/auth/session` - Get current session
- `GET /api/auth/tokens` - Debug endpoint showing token status (hasAccessToken, expiresAt, etc.)
- `ALL /api/proxy/[...path]` - Server-side proxy to your backend (adds Authorization if available)

(These routes are mounted under the app base `/dev/` at runtime.)

## Keycloak Configuration

When creating the Keycloak client (in the `dungeoncrawler` realm or your chosen realm), ensure:

- Client ID: set to the value you put in `NUXT_OAUTH_KEYCLOAK_CLIENT_ID`
- Client Type: Confidential or Public depending on your setup
- Valid Redirect URIs: set to the value of `NUXT_OAUTH_KEYCLOAK_REDIRECT_URL` (e.g. `http://localhost:3000/dev/auth/keycloak`)
- Web Origins: your app origin (e.g. `http://localhost:3000`)
- Access Type: `confidential` if you use a client secret (then set `NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET`), otherwise `public` if no secret is required.

## Testing Authentication

1. Start the development server:

```bash
npm run dev
```

2. Navigate to `http://localhost:3000/dev/`
3. Click "Login / Register"
4. Authenticate with Keycloak
5. You will be redirected back to `/dev/` and the session will be available via `/api/auth/session`

## User Session Type

```text
interface User {
  keycloakId: string;
  email: string;
  name: string;
  username: string;
}

interface UserSession {
  user?: User;
  loggedInAt?: number;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // epoch ms
}
```

## Server-side Proxy Usage

The proxy at `/api/proxy/[...path]` automatically handles token injection for backend API calls.

**How it works:**

- Extracts the access token from the server session (if present)
- Adds `Authorization: Bearer <token>` header when a token exists
- Forwards requests without Authorization when no token is found (backend decides auth)
- Automatically JSON-encodes request bodies and sets `Content-Type: application/json`
- Propagates backend errors with proper status codes

**Client usage example:**

```text
export async function getCreaturesLocalized(
  locale: string
): Promise<Creature[]> {
  try {
    // Use the server proxy so the access token is injected automatically
    const res = await $fetch(`/api/proxy/creatures/localized`, {
      params: { locale },
    });
    return res as Creature[];
  } catch {
    console.warn("⚠️ API unreachable, using mock data");
    return mockCreatures;
  }
}
```

**Token refresh:**

- The `refreshToken` is stored in the session and automatic refresh is implemented
- When a token is expiring (within 30 seconds) or expired, the system automatically:
  1. Calls the Keycloak token endpoint with the refresh token
  2. Updates the session with the new access token, refresh token, and expiration
  3. Returns the new access token for the current request
- If refresh fails (token revoked, network error, etc.), returns `null` and the user must re-authenticate
- Token refresh logic is in `server/utils/auth-tokens.ts` -> `ensureValidAccessToken()`

## Security

- Do NOT commit `.env` with secrets to version control.
- Session encryption: server-side sessions encrypted with `NUXT_SESSION_PASSWORD`.
- Confidential client: if you use a confidential Keycloak client, store the client secret server-side and do not expose it to the browser.
