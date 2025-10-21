# Dungeon Crawler (Castle of Whispers) - AI Coding Instructions

## Project Overview

**Stack**: Nuxt 4 SSR application with TypeScript, Vue 3, Pinia, TailwindCSS, and shadcn-vue components.  
**Purpose**: Fantasy dungeon crawler web game with Keycloak OAuth authentication and a backend API proxy pattern.  
**Base URL**: All routes are prefixed with `/dev/` in production (see `nuxt.config.ts` → `app.baseURL`).

## Architecture & Data Flow

### Server-Side API Proxy Pattern
**Critical**: Never call backend APIs directly from client code. Always use the `/api/proxy/[...path]` server endpoint.

```typescript
// ✅ Correct: API client pattern (see app/api/classAPI.ts, creatureAPI.ts)
export async function getCreaturesLocalized(locale: string): Promise<Creature[]> {
  try {
    const res = await $fetch(`/api/proxy/creatures/localized`, {
      params: { locale },
    });
    return res as Creature[];
  } catch {
    console.warn("⚠️ API unreachable, using mock data");
    return mockCreatures; // Fallback to mocks for development
  }
}
```

**Why**: The proxy (`server/api/proxy/[...path].ts`) automatically:
- Injects OAuth Bearer tokens from server-side session
- Refreshes expired tokens automatically (30-second skew window)
- Handles authentication errors gracefully
- Normalizes JSON request/response bodies

### Authentication Architecture (Keycloak OAuth)
- **Flow**: OAuth 2.0 Authorization Code flow with Keycloak (see `AUTH_SETUP.md`)
- **Session Storage**: Server-side encrypted sessions via `nuxt-auth-utils`
- **Token Refresh**: Automatic token refresh in `server/utils/auth-tokens.ts` → `ensureValidAccessToken()`
- **Public Routes**: Defined in `server/middleware/auth.ts` (auth routes, `/dev/`, `/dev/lore`, `/dev/bestiary`, assets)

**Key Files**:
- `server/routes/auth/keycloak.get.ts` - OAuth callback handler
- `server/routes/auth/logout.get.ts` - Logout endpoint
- `server/api/auth/session.get.ts` - Get current session (used by `useUserSession()` composable)
- `app/pages/index.vue` - Login/logout UI example

### State Management with Pinia
**Pattern**: Domain-specific stores with API integration and getters.

```typescript
// Example: app/stores/creatureStore.ts
export const useCreatureStore = defineStore("Creature", {
  state: () => ({
    Creatures: [] as Creature[],
    loading: false,
    error: null as string | null,
  }),
  getters: {
    bossCreatures: (state) => state.Creatures.filter((m) => m.rank === "Boss"),
    simpleCreatures: (state) => state.Creatures.filter((m) => m.rank === "Normal"),
  },
  actions: {
    async fetchCreatures(locale: string) {
      this.loading = true;
      this.error = null;
      try {
        this.Creatures = await getCreaturesLocalized(locale);
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : "Unknown Error";
      } finally {
        this.loading = false;
      }
    },
  },
});
```

**Stores location**: `app/stores/` (e.g., `creatureStore.ts`, `classStore.ts`)

## Development Workflow

### Essential Commands
```bash
npm run dev                # Start dev server on http://localhost:3000/dev/
npm run build              # Production build
npm run lint               # ESLint + Prettier check
npm run lint:fix           # Auto-fix linting issues
npm run format:fix         # Auto-format with Prettier
```

### Environment Setup
Create `.env` file with these critical variables (see `AUTH_SETUP.md` for full details):
```env
NUXT_PUBLIC_API_BASE=http://localhost:5253/api/
NUXT_SESSION_PASSWORD=<generate_secure_password>
NUXT_OAUTH_KEYCLOAK_CLIENT_ID=dungeoncrawler
NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET=<keycloak_secret>
NUXT_OAUTH_KEYCLOAK_REDIRECT_URL=http://localhost:3000/dev/auth/keycloak
NUXT_OAUTH_KEYCLOAK_SERVER_URL=http://10.4.30.2:8040/keycloak
NUXT_OAUTH_KEYCLOAK_REALM=dungeoncrawler
```

**Production Kubernetes Issue**: If deploying to K8s, add `NUXT_OAUTH_KEYCLOAK_SERVER_URL_INTERNAL` for pod-to-service communication (see `KEYCLOAK_DEBUG.md`).

## Project-Specific Conventions

### Component Organization
- **UI Components**: `app/components/ui/` organized by feature (`bestiary/`, `button/`, `layout/`)
- **shadcn-vue**: Prefix `cn` (see `components.json`), components in `app/components/ui/`
- **Layout Pattern**: Use `PublicLayout.vue` for public pages with nav/footer

### TypeScript Types
- **Location**: `app/types/` (e.g., `creature.ts`, `class.ts`, `auth.ts`)
- **Pattern**: Interface-based, shared between API clients and stores
- **Example**: Both `Creature` and `Class` have similar structures with `stats`, `iconKey`, `locale`, `name`, `shortDesc`, `lore`

### i18n (Internationalization)
- **Setup**: `@nuxtjs/i18n` with `en` (default) and `fr` locales
- **Locales**: `i18n/locales/en.json`, `fr.json`
- **API Pattern**: Backend API endpoints accept `?locale=en` param (e.g., `/api/proxy/creatures/localized?locale=en`)

### Mock Data Strategy
All API clients include mock data fallbacks for offline development:
- `app/mocks/creaturesMock.ts`, `classMock.ts`
- Enables frontend work without running backend services

### Styling Approach
- **TailwindCSS 4**: Primary styling system with v4 configuration
- **Custom Font**: "IM Fell DW Pica" (Google Fonts) for medieval theme
- **Theme**: Dark mode with zinc palette (`bg-zinc-900`, `text-zinc-400`, etc.)
- **Animations**: `tw-animate-css` plugin for UI effects

## CI/CD & Deployment

### Docker Build
- **Dockerfile**: Multi-stage Node 24 Alpine build with dotenv-cli for runtime env vars
- **CMD**: `npx dotenv -e .env -- node .output/server/index.mjs`
- **Port**: 3000

### Azure Pipelines
- **Trigger**: `dev` branch
- **Pool**: HarborPool (custom agent)
- **Steps**: Lint → SonarCloud → Docker Build/Push → Cosign signing
- **Registry**: Harbor at `repository.groupe1.local:80/dungeoncrawler/front-dev`
- **Tags**: `latest` and `$(Build.BuildId)`

## Common Patterns & Anti-Patterns

### ✅ DO
- Use the `/api/proxy/` pattern for all backend API calls
- Include mock data fallbacks in API clients
- Store auth tokens only in server-side sessions (never client-side)
- Use Pinia stores for domain state management
- Follow the shadcn-vue component structure in `app/components/ui/`

### ❌ DON'T
- Call backend APIs directly with `$fetch(runtimeConfig.public.apiBase + ...)`
- Store JWT tokens in client-side state/localStorage
- Hard-code OAuth config in `nuxt.config.ts` (use env vars)
- Forget the `/dev/` base URL prefix when testing routes
- Mix public/private layout components (use dedicated layouts)

## Key Files Reference
- **Auth Setup**: `AUTH_SETUP.md`, `KEYCLOAK_DEBUG.md`
- **API Proxy**: `server/api/proxy/[...path].ts`
- **Token Management**: `server/utils/auth-tokens.ts`
- **Auth Middleware**: `server/middleware/auth.ts`
- **Example API Client**: `app/api/classAPI.ts`
- **Example Store**: `app/stores/creatureStore.ts`
- **Example Page**: `app/pages/index.vue` (login flow), `app/pages/bestiary.vue` (store usage)

## Testing Authentication Locally
1. Ensure Keycloak is running at the configured URL
2. Start dev server: `npm run dev`
3. Visit `http://localhost:3000/dev/`
4. Click "Login / Register" → redirects to Keycloak
5. After auth, redirects to `/dev/` with session active
6. Check session: `curl http://localhost:3000/dev/api/auth/session` (with cookies)
