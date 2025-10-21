# 🔴 Problème d'authentification OAuth Keycloak avec Nuxt.js en production

## Contexte
- **Framework** : Nuxt.js (SSR) avec `nuxt-auth-utils`
- **Authentification** : OAuth 2.0 avec Keycloak
- **Environnement** : Kubernetes (prod) vs local (dev)
- **BaseURL de l'app** : `/dev/`

## Symptômes
1. ✅ En local (dev) : tout fonctionne parfaitement
2. ❌ En prod (Kubernetes) : 
   - La redirection vers Keycloak fonctionne ✅
   - L'authentification sur Keycloak fonctionne ✅
   - Le callback OAuth échoue avec **500 Internal Server Error** ❌
   - Erreur : `Page not found: /auth/keycloak?code=...`

## Flow OAuth actuel
1. Utilisateur clique sur "Login" → redirigé vers `/dev/auth/keycloak`
2. Nuxt redirige vers Keycloak : `http://10.4.30.2:8040/keycloak/realms/dungeoncrawler/protocol/openid-connect/auth`
3. Utilisateur s'authentifie sur Keycloak
4. Keycloak redirige vers : `http://10.4.30.2:8040/dev/auth/keycloak?code=...&state=...`
5. **Le serveur Nuxt répond 500** lors du traitement du callback

## Configuration actuelle en prod (Kubernetes)
```env
NUXT_OAUTH_KEYCLOAK_CLIENT_ID=dungeoncrawler
NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET=Zw4NLYma3DLQEJM2llI8wPzyp3mAa1gt
NUXT_OAUTH_KEYCLOAK_REDIRECT_URL=http://10.4.30.2:8040/dev/auth/keycloak
NUXT_OAUTH_KEYCLOAK_SERVER_URL=http://10.4.30.2:8040/keycloak
NUXT_OAUTH_KEYCLOAK_REALM=dungeoncrawler
```

## Cause probable
Le serveur Nuxt (tournant dans un pod Kubernetes) essaie d'échanger le code OAuth contre des tokens en appelant Keycloak via :
```
POST http://10.4.30.2:8040/keycloak/realms/dungeoncrawler/protocol/openid-connect/token
```

**Mais depuis le pod, cette URL n'est probablement pas accessible** (réseau interne Kubernetes vs réseau externe).

## Points à vérifier dans la configuration Keycloak

### Client `dungeoncrawler` :
1. **Valid Redirect URIs** : doit contenir `http://10.4.30.2:8040/dev/auth/keycloak` (et éventuellement un wildcard si nécessaire)
2. **Web Origins** : doit contenir `http://10.4.30.2:8040` ou `*`
3. **Access Type** : `confidential` (car client secret utilisé)
4. **Standard Flow Enabled** : `ON`
5. **Direct Access Grants Enabled** : peut être `OFF` (pas utilisé ici)

### URLs de callback attendues :
- **Redirect URI configurée dans Keycloak** : `http://10.4.30.2:8040/dev/auth/keycloak`
- **URL que Keycloak utilise pour rediriger** : `http://10.4.30.2:8040/dev/auth/keycloak?code=...`

## Solution potentielle
Ajouter la variable d'environnement manquante :
```env
NUXT_OAUTH_KEYCLOAK_SERVER_URL_INTERNAL=http://<service-keycloak-interne>:<port>/keycloak
```

Cela permet au serveur Nuxt de contacter Keycloak via le réseau interne Kubernetes au lieu de l'IP publique.

## Questions pour l'analyse des clients Keycloak
1. Le client `dungeoncrawler` a-t-il bien `http://10.4.30.2:8040/dev/auth/keycloak` dans les **Valid Redirect URIs** ?
2. Y a-t-il des restrictions sur les **Web Origins** ?
3. Le **Client Protocol** est-il bien `openid-connect` ?
4. Les **Credentials** (client secret) correspondent-elles bien à `Zw4NLYma3DLQEJM2llI8wPzyp3mAa1gt` ?
5. Y a-t-il des logs d'erreur côté Keycloak lors de la tentative d'échange du code ?

## Erreur complète (console navigateur)
```
GET http://10.4.30.2:8040/dev/auth/keycloak?session_state=92e4d95b-0030-4d5c-a662-91628b525f29&iss=http%3A%2F%2F10.4.30.2%3A8040%2Fkeycloak%2Frealms%2Fdungeoncrawler&code=9d068905-1652-4538-8ddb-f0f1e272060b.92e4d95b-0030-4d5c-a662-91628b525f29.19cab4f6-d1d2-443d-a9e7-1086884b2716 500 (Internal Server Error)

[nuxt] error caught during app initialization 
Page not found: /auth/keycloak?session_state=92e4d95b-0030-4d5c-a662-91628b525f29&iss=http://10.4.30.2:8040/keycloak/realms/dungeoncrawler&code=9d068905-1652-4538-8ddb-f0f1e272060b.92e4d95b-0030-4d5c-a662-91628b525f29.19cab4f6-d1d2-443d-a9e7-1086884b2716
```

## Architecture
```
[Navigateur] 
    ↓ (1) Click Login
[Nuxt App - http://10.4.30.2:8040/dev/]
    ↓ (2) Redirect to Keycloak
[Keycloak - http://10.4.30.2:8040/keycloak]
    ↓ (3) User authenticates
    ↓ (4) Redirect to callback
[Nuxt App - http://10.4.30.2:8040/dev/auth/keycloak?code=...]
    ↓ (5) Exchange code for tokens (SERVER-SIDE)
    ❌ 500 ERROR HERE
[Keycloak Token Endpoint - http://10.4.30.2:8040/keycloak/realms/dungeoncrawler/protocol/openid-connect/token]
```

Le problème se situe à l'étape 5 : le serveur Nuxt ne peut pas contacter le token endpoint de Keycloak.
