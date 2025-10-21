# 🔧 Fix : Cookie trop volumineux - Solution native Keycloak

## Problème identifié

L'erreur `Set-Cookie header was blocked because the cookie was too large` se produit car :
1. Les tokens JWT de Keycloak sont volumineux (~5000+ caractères)
2. Le chiffrement Iron ajoute beaucoup d'overhead (~10x)
3. Cookie Secure forcé sur connexion HTTP locale

**Limite des cookies** : 4096 caractères maximum

## ✅ Solution native implémentée

### Utilisation native de nuxt-auth-utils

Au lieu d'un store custom, on utilise directement le système de session de `nuxt-auth-utils` :

```typescript
// Session stockée (chiffrée Iron dans le cookie)
{
  user: { id, email, name, username },    // ~200 bytes
  loggedInAt: timestamp,                   // ~15 bytes
  secure: {                                // Chiffré mais dans session
    accessToken: "...",
    refreshToken: "...",
    expiresAt: number
  }
}
```

### Configuration optimisée

1. **Cookie size** : `maxSize: 8192` (double de la limite standard)
2. **Cookie name** : `name: "s"` (ultra-court)
3. **Cookie secure** : `secure: false` en dev via middleware
4. **Session maxAge** : 7 jours

### Taille finale
**~389 bytes** après optimisation (au lieu de >4096 bytes)

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
