# ✅ Migration vers nuxt-oidc-auth

## 📦 Installation

```powershell
npm install nuxt-oidc-auth
```

## 🔧 Configuration

### 1. Variables d'environnement (.env)

```bash
# Keycloak OIDC Configuration
NUXT_OAUTH_KEYCLOAK_CLIENT_ID=dungeoncrawler
NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET=1135VSSQbfuYxPQm58PnGF6OnOicPsFJ
NUXT_OAUTH_KEYCLOAK_REDIRECT_URL=http://10.4.30.2:8888/dev/auth/keycloak/callback
NUXT_OAUTH_KEYCLOAK_SERVER_URL=http://10.4.30.2:8040/keycloak
NUXT_OAUTH_KEYCLOAK_REALM=dungeoncrawler

# API Backend
NUXT_PUBLIC_API_BASE=http://localhost:5253/api
```

⚠️ **Important** : L'URL de redirection doit finir par `/callback` pour nuxt-oidc-auth

### 2. Configuration Nuxt (nuxt.config.ts)

```typescript
export default defineNuxtConfig({
  modules: [
    // ... autres modules
    "nuxt-oidc-auth",
  ],

  runtimeConfig: {
    oidc: {
      providers: {
        keycloak: {
          baseUrl: process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL,
          clientId: process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_ID,
          clientSecret: process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET,
          redirectUri: process.env.NUXT_OAUTH_KEYCLOAK_REDIRECT_URL,
          scope: ["openid", "profile", "email"],
          realm: process.env.NUXT_OAUTH_KEYCLOAK_REALM,
        },
      },
      session: {
        expirationCheck: true,
        automaticRefresh: true,
      },
    },
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },
});
```

## 📝 Fichiers modifiés

### ✅ Fichiers mis à jour

1. **`app/composables/useAuth.ts`** - Wrapper autour de `useOidcAuth()`
2. **`server/api/proxy/[...path].ts`** - Utilise `useOidcSession()` pour le token
3. **`server/api/auth/session.get.ts`** - Retourne la session OIDC
4. **`app/pages/index.vue`** - Utilise les méthodes login/logout de nuxt-oidc-auth

### ❌ Fichiers à supprimer (obsolètes)

Ces fichiers ne sont plus nécessaires avec nuxt-oidc-auth :

```powershell
Remove-Item server\routes\auth\login.get.ts
Remove-Item server\routes\auth\keycloak.get.ts
Remove-Item server\routes\auth\logout.get.ts
Remove-Item server\utils\auth-tokens.ts
Remove-Item server\middleware\force-insecure-cookies.ts
```

## 🎯 Utilisation

### Frontend - Composable `useAuth()`

```vue
<script setup>
const { user, loggedIn, login, logout } = useAuth();

// Connexion
const handleLogin = () => {
  login(); // Redirige vers Keycloak
};

// Déconnexion
const handleLogout = () => {
  logout(); // Déconnecte et efface la session
};
</script>

<template>
  <div v-if="loggedIn">
    <p>Bonjour {{ user.name }}</p>
    <button @click="handleLogout">Logout</button>
  </div>
  <button v-else @click="handleLogin">Login</button>
</template>
```

### Serveur - API Proxy avec token automatique

```typescript
// server/api/proxy/[...path].ts
const session = await useOidcSession(event);
const accessToken = session.accessToken;

// Le token est automatiquement ajouté aux appels backend
headers["Authorization"] = `Bearer ${accessToken}`;
```

### Appels API depuis le frontend

```typescript
// app/api/creatureAPI.ts
export const getCreatures = async (locale: string) => {
  // Le proxy ajoute automatiquement le Bearer token
  const res = await $fetch(`/api/proxy/creatures/localized`, {
    query: { locale }
  });
  return res;
};
```

## 🚀 Workflow d'authentification

1. **Utilisateur clique sur "Login"**
   - `login()` → nuxt-oidc-auth redirige vers Keycloak
   
2. **Authentification sur Keycloak**
   - L'utilisateur s'authentifie
   - Keycloak redirige vers `/auth/keycloak/callback`
   
3. **Callback automatique**
   - nuxt-oidc-auth échange le code contre les tokens
   - Stocke la session avec `accessToken`, `refreshToken`, `user`, `claims`
   - Redirige vers la page d'origine
   
4. **Session active**
   - `useAuth()` retourne les infos utilisateur
   - Le proxy ajoute automatiquement le Bearer token aux appels API
   
5. **Rafraîchissement automatique**
   - nuxt-oidc-auth rafraîchit le token avant expiration
   - Transparent pour l'utilisateur

## 🔑 Avantages de nuxt-oidc-auth

✅ **Gestion automatique des tokens**
- Refresh automatique avant expiration
- Pas besoin de gérer manuellement `ensureValidAccessToken()`

✅ **Conforme aux standards OIDC**
- Support complet du protocole OpenID Connect
- Compatible avec tous les providers OIDC (Keycloak, Auth0, etc.)

✅ **Moins de code à maintenir**
- Plus besoin de gérer manuellement le flow OAuth
- Routes de callback gérées automatiquement

✅ **Session sécurisée**
- Tokens stockés côté serveur avec chiffrement
- Cookie session minimal (comme avant)

✅ **Composables prêts à l'emploi**
- `useOidcAuth()` pour le frontend
- `useOidcSession()` pour le serveur

## 🔒 Configuration Keycloak

Dans Keycloak, configure ton client :

1. **Valid Redirect URIs** :
   ```
   http://10.4.30.2:8888/dev/auth/keycloak/callback
   ```

2. **Access Type** : `confidential`

3. **Standard Flow Enabled** : `ON`

4. **Direct Access Grants Enabled** : `ON` (optionnel)

## 🧪 Test

```powershell
npm run dev
```

1. Ouvre http://10.4.30.2:8888/dev/
2. Clique sur "Login / Register"
3. Authentifie-toi sur Keycloak
4. Tu es redirigé avec ta session active
5. Les appels API `/api/proxy/*` incluent automatiquement ton Bearer token

## 📊 Structure de session

```typescript
session = {
  accessToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiresAt: 1729512000,
  user: {
    id: "user-id",
    name: "John Doe",
    email: "john@example.com",
    preferred_username: "john",
  },
  claims: {
    sub: "user-id",
    email_verified: true,
    // ... tous les claims OIDC
  }
}
```

## 🎨 Comparaison H3 vs nuxt-oidc-auth

| Aspect | H3 Manuel | nuxt-oidc-auth |
|--------|-----------|----------------|
| Setup | ~200 lignes de code | ~20 lignes de config |
| Refresh tokens | Manuel avec `ensureValidAccessToken()` | ✅ Automatique |
| Routes callback | À créer manuellement | ✅ Créées automatiquement |
| Conformité OIDC | Partielle | ✅ Complète |
| Maintenance | Code custom à maintenir | ✅ Module maintenu |
| Cookie size | ~389 bytes | ~400 bytes (similaire) |

## 🎯 Prochaines étapes

- [ ] Supprimer les fichiers obsolètes (voir liste ci-dessus)
- [ ] Tester le flow de connexion/déconnexion
- [ ] Vérifier les appels API avec tokens
- [ ] Configurer la redirection Keycloak
- [ ] Tester le refresh automatique des tokens
