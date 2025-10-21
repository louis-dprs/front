# 🚀 Architecture sans proxy - Appels directs au backend

## 📋 Changements effectués

### ❌ Fichiers supprimés
- `server/api/proxy/[...path].ts` - Proxy supprimé
- `server/utils/auth-tokens.ts` - Gestion manuelle des tokens supprimée
- `server/middleware/force-insecure-cookies.ts` - Plus nécessaire
- `server/routes/auth/*.ts` - Routes OAuth manuelles supprimées

### ✅ Fichiers modifiés
1. **`app/api/creatureAPI.ts`** - Appels directs au backend avec token
2. **`app/api/classAPI.ts`** - Appels directs au backend avec token
3. **`.env`** - URL backend mise à jour

## 🔧 Nouvelle architecture

```
Frontend (navigateur)
  ↓ $fetch avec Authorization header
  ↓ Token récupéré depuis useOidcAuth()
Backend API (.NET)
```

## 📝 Code des APIs

### Exemple : `app/api/creatureAPI.ts`

```typescript
export async function getCreaturesLocalized(locale: string): Promise<Creature[]> {
  try {
    const config = useRuntimeConfig();
    const { accessToken } = await useOidcAuth();
    
    // Appel direct au backend avec le token
    const res = await $fetch(`${config.public.apiBase}/creatures/localized`, {
      params: { locale },
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : {}
    });
    return res as Creature[];
  } catch {
    console.warn("⚠️ API unreachable, using mock data");
    return mockCreatures;
  }
}
```

## ⚙️ Configuration CORS Backend

**⚠️ IMPORTANT** : Ton backend .NET doit maintenant accepter les requêtes depuis le frontend.

### Dans ton `Program.cs` ou `Startup.cs` :

```csharp
// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://10.4.30.2:8888") // Ton frontend
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ...

app.UseCors("AllowFrontend");
```

### Ou pour le développement (moins restrictif) :

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

app.UseCors("AllowAll");
```

## 🔑 Variables d'environnement

```bash
# Keycloak OIDC
NUXT_OAUTH_KEYCLOAK_CLIENT_ID=dungeoncrawler
NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET=1135VSSQbfuYxPQm58PnGF6OnOicPsFJ
NUXT_OAUTH_KEYCLOAK_REDIRECT_URL=http://10.4.30.2:8888/dev/auth/keycloak/callback
NUXT_OAUTH_KEYCLOAK_SERVER_URL=http://10.4.30.2:8040/keycloak
NUXT_OAUTH_KEYCLOAK_REALM=dungeoncrawler

# Backend API (appels directs)
NUXT_PUBLIC_API_BASE=http://10.4.30.2:5253/api
```

⚠️ **Note** : `NUXT_PUBLIC_API_BASE` doit pointer vers l'URL accessible depuis le navigateur du client.

## 📊 Avantages et inconvénients

### ✅ Avantages
- **Plus simple** - Pas de proxy à maintenir
- **Moins de code** - Architecture directe
- **Performance** - Un hop réseau en moins

### ⚠️ Inconvénients
- **CORS requis** - Doit être configuré sur le backend
- **Token exposé** - Le token transite par le client (mais c'est normal avec OIDC)
- **Pas de cache serveur** - Impossible de cacher les appels côté serveur

## 🔒 Sécurité

### Token dans le client
Le token JWT est récupéré par `useOidcAuth()` et ajouté au header. C'est **normal** et **sécurisé** car :
- ✅ Le token est stocké dans un cookie httpOnly côté serveur
- ✅ `useOidcAuth()` fait un appel serveur pour le récupérer
- ✅ Le token n'est jamais stocké en localStorage/sessionStorage
- ✅ nuxt-oidc-auth le rafraîchit automatiquement

### Protection contre le vol
- ✅ HTTPS en production (obligatoire)
- ✅ Tokens à courte durée de vie
- ✅ Refresh tokens gérés par nuxt-oidc-auth
- ✅ Cookie sécurisé (httpOnly, sameSite)

## 🧪 Test

```powershell
npm run dev
```

1. Connecte-toi via Keycloak
2. Va sur `/bestiary`
3. Ouvre les DevTools → Network
4. Tu devrais voir les appels directs à `http://10.4.30.2:5253/api/...`
5. Vérifie le header `Authorization: Bearer ...`

## 🔍 Debug CORS

Si tu as des erreurs CORS :

### Erreur typique :
```
Access to fetch at 'http://10.4.30.2:5253/api/creatures/localized' 
from origin 'http://10.4.30.2:8888' has been blocked by CORS policy
```

### Solution :
1. Vérifie que CORS est bien configuré dans ton backend .NET
2. Vérifie que l'origin correspond exactement (avec/sans slash final)
3. Vérifie les logs backend pour voir si la requête arrive

### Test CORS depuis le terminal :
```powershell
curl -H "Origin: http://10.4.30.2:8888" `
     -H "Access-Control-Request-Method: GET" `
     -H "Access-Control-Request-Headers: Authorization" `
     -X OPTIONS `
     http://10.4.30.2:5253/api/creatures/localized
```

Tu devrais voir :
```
Access-Control-Allow-Origin: http://10.4.30.2:8888
Access-Control-Allow-Methods: GET, POST, ...
```

## 📝 Notes importantes

1. **URL Backend** : Doit être accessible depuis le navigateur du client (pas localhost)
2. **CORS** : Absolument nécessaire maintenant
3. **Token** : Géré automatiquement par nuxt-oidc-auth
4. **Performance** : Bonne pour des appels simples, pas de cache serveur possible

## 🎯 Prochaines étapes

- [ ] Configurer CORS sur le backend .NET
- [ ] Tester les appels API
- [ ] Vérifier que le token est bien envoyé
- [ ] Tester avec/sans authentification
- [ ] Vérifier les erreurs CORS éventuelles
