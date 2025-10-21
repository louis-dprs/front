# Alternative Simple - Sans nuxt-auth-utils

## Architecture minimaliste

Utilisation des **sessions H3 natives** uniquement :

```typescript
import { useSession } from 'h3'

// Stockage dans session H3
const session = await useSession(event, {
  password: process.env.NUXT_SESSION_PASSWORD,
  cookie: { sameSite: 'lax', secure: false }
})

// Lire
session.data.user

// Écrire
await session.update({ user: {...} })

// Supprimer
await session.clear()
```

## Fichiers simplifiés

### 1. server/routes/auth/keycloak-simple.get.ts

```typescript
import { useSession } from 'h3'

export default defineEventHandler(async (event) => {
  // Récupérer le code OAuth depuis query params
  const query = getQuery(event)
  const code = query.code as string
  
  if (!code) {
    return sendRedirect(event, '/dev/?error=no_code')
  }

  try {
    // Échanger le code contre des tokens
    const config = useRuntimeConfig()
    const tokenEndpoint = `${config.oauth.keycloak.serverUrl}/realms/${config.oauth.keycloak.realm}/protocol/openid-connect/token`
    
    const tokenResponse = await $fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: config.oauth.keycloak.clientId,
        redirect_uri: config.oauth.keycloak.redirectUrl,
      })
    })

    // Décoder le token pour avoir les infos user
    const payload = JSON.parse(
      Buffer.from(tokenResponse.access_token.split('.')[1], 'base64').toString()
    )

    // Stocker dans session H3
    const session = await useSession(event, {
      password: config.sessionPassword,
      name: 's',
      maxAge: 60 * 60 * 24 * 7,
      cookie: {
        sameSite: 'lax',
        secure: false,
        httpOnly: true,
      }
    })

    await session.update({
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.preferred_username,
        username: payload.preferred_username,
      },
      tokens: {
        access: tokenResponse.access_token,
        refresh: tokenResponse.refresh_token,
        expiresAt: Date.now() + (tokenResponse.expires_in * 1000)
      },
      loggedInAt: Date.now()
    })

    return sendRedirect(event, '/dev/')
  } catch (error) {
    console.error('Keycloak auth error:', error)
    return sendRedirect(event, '/dev/?error=auth_failed')
  }
})
```

### 2. server/api/auth/session-simple.get.ts

```typescript
import { useSession } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = await useSession(event, {
    password: config.sessionPassword,
    name: 's',
  })

  return {
    user: session.data.user || null,
    loggedInAt: session.data.loggedInAt || null,
  }
})
```

### 3. server/routes/auth/logout-simple.get.ts

```typescript
import { useSession } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = await useSession(event, {
    password: config.sessionPassword,
    name: 's',
  })

  await session.clear()
  return sendRedirect(event, '/dev/')
})
```

### 4. app/composables/useAuthSimple.ts

```typescript
export const useAuthSimple = () => {
  const user = useState('auth:user', () => null)
  const loading = useState('auth:loading', () => false)
  const loggedIn = computed(() => !!user.value)

  const fetch = async () => {
    loading.value = true
    try {
      const data = await $fetch('/api/auth/session')
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const login = () => {
    const config = useRuntimeConfig()
    const authUrl = `${config.public.keycloakUrl}/realms/${config.public.keycloakRealm}/protocol/openid-connect/auth`
    const params = new URLSearchParams({
      client_id: config.public.keycloakClientId,
      redirect_uri: config.public.keycloakRedirectUrl,
      response_type: 'code',
      scope: 'openid profile email',
    })
    window.location.href = `${authUrl}?${params}`
  }

  const logout = async () => {
    await $fetch('/auth/logout')
    user.value = null
    navigateTo('/dev/')
  }

  return { user, loggedIn, loading, fetch, login, logout }
}
```

### 5. nuxt.config.ts - Ajout variables publiques

```typescript
runtimeConfig: {
  sessionPassword: process.env.NUXT_SESSION_PASSWORD,
  oauth: {
    keycloak: {
      serverUrl: process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL,
      realm: process.env.NUXT_OAUTH_KEYCLOAK_REALM,
      clientId: process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_ID,
      redirectUrl: process.env.NUXT_OAUTH_KEYCLOAK_REDIRECT_URL,
    }
  },
  public: {
    keycloakUrl: process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL,
    keycloakRealm: process.env.NUXT_OAUTH_KEYCLOAK_REALM,
    keycloakClientId: process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_ID,
    keycloakRedirectUrl: process.env.NUXT_OAUTH_KEYCLOAK_REDIRECT_URL,
  }
}
```

## Avantages

✅ **Ultra-simple** : Seulement H3 sessions natives  
✅ **Pas de dépendance externe** : Que du Nuxt/H3  
✅ **Contrôle total** : Tu gères tout toi-même  
✅ **Léger** : Moins de code, plus rapide  

## Inconvénients

⚠️ Pas de refresh automatique des tokens  
⚠️ Gestion manuelle du flow OAuth  
⚠️ Plus de code à maintenir toi-même  

## Pour l'implémenter

1. Supprime `nuxt-auth-utils` du nuxt.config.ts
2. Crée les fichiers ci-dessus
3. Utilise `useAuthSimple()` dans tes composants
4. Configure les variables d'environnement

**Tu veux que j'implémente cette version dans ton projet ?**
