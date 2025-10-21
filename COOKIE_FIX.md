# 🔧 Fix : Cookie trop volumineux

## Problème identifié

L'erreur `Set-Cookie header was blocked because the cookie was too large` se produit car :
1. Les tokens JWT de Keycloak (accessToken et refreshToken) étaient stockés dans le cookie
2. Même après avoir déplacé les tokens, les infos utilisateur rendaient le cookie trop gros après chiffrement Iron

**Limite des cookies** : 4096 caractères maximum
**Taille des tokens JWT Keycloak** : Souvent > 4000 caractères
**Cookie Iron-sealed** : Même un petit objet devient gros après chiffrement

## Solution implémentée (V2 - Ultra minimale)

Nous stockons **TOUT côté serveur** et ne mettons **QUE le session ID** dans le cookie :

### Architecture

```
Cookie (ultra-léger) ────> sid: "uuid" (36 chars seulement)
                                 │
                                 ▼
                          Session Store (serveur)
                          ├─ tokens
                          │  ├─ accessToken
                          │  ├─ refreshToken
                          │  └─ expiresAt
                          └─ user
                             ├─ keycloakId
                             ├─ email
                             ├─ name
                             └─ username
```

### Fichiers modifiés

1. **`server/utils/token-store.ts`** (nouveau)
   - Store en mémoire pour les tokens
   - ⚠️ Pour la production, utilisez Redis ou une base de données

2. **`server/routes/auth/keycloak.get.ts`**
   - Génère un sessionId unique
   - Stocke les tokens côté serveur via le sessionId
   - Ne met que le sessionId dans le cookie

3. **`server/utils/auth-tokens.ts`**
   - Récupère les tokens depuis le store serveur
   - Met à jour les tokens lors du refresh

4. **`server/routes/auth/logout.get.ts`**
   - Supprime les tokens du store lors de la déconnexion

5. **`app/types/auth.ts`**
   - Remplace `accessToken`, `refreshToken`, `expiresAt` par `sessionId`

6. **`nuxt.config.ts`**
   - Ajout de la configuration session

## Avantages

✅ Cookie léger (< 500 caractères)
✅ Meilleure sécurité (tokens jamais exposés au client)
✅ Plus de contrôle sur le cycle de vie des tokens
✅ Possibilité de révoquer les sessions côté serveur

## Important pour la production

⚠️ **Le store actuel est en mémoire** : les tokens sont perdus au redémarrage du serveur.

### Migration vers un store persistant

Pour la production, remplacez `server/utils/token-store.ts` par un store Redis :

```typescript
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

export async function storeTokens(sessionId: string, tokens: TokenData) {
  await redis.setEx(
    `session:${sessionId}`,
    60 * 60 * 24 * 7, // 7 days
    JSON.stringify(tokens)
  );
}

export async function getTokens(sessionId: string): Promise<TokenData | undefined> {
  const data = await redis.get(`session:${sessionId}`);
  return data ? JSON.parse(data) : undefined;
}

export async function removeTokens(sessionId: string) {
  await redis.del(`session:${sessionId}`);
}
```

## Test

1. Démarrez le serveur : `npm run dev`
2. Connectez-vous via Keycloak
3. Vérifiez dans les DevTools :
   - Le cookie est maintenant < 1000 caractères
   - Pas d'erreur "cookie too large"
4. Les API calls fonctionnent toujours (le proxy injecte le token automatiquement)

## Notes

- Le sessionId est un UUID v4 cryptographiquement sûr
- Les tokens sont automatiquement rafraîchis (logique inchangée)
- L'expérience utilisateur reste identique
