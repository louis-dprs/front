// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Modules
  modules: [
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxt/image",
    "nuxt-oidc-auth",
  ],
  oidc: {
    default: {
      clientId: process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_ID,
      issuer: `${process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL}/realms/${process.env.NUXT_OAUTH_KEYCLOAK_REALM}`,
      redirectUri: process.env.NUXT_OAUTH_KEYCLOAK_REDIRECT_URL,
      responseType: "code",
      scope: "openid profile email",
      storage: "cookie",
      autoLogin: false,
      logoutRedirectUri: process.env.NUXT_OAUTH_KEYCLOAK_REDIRECT_URL,
    },
  },

  // Application settings
  app: {
    baseURL: "/dev/",
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=IM+Fell+DW+Pica&display=swap",
        },
      ],
    },
  },

  // Runtime configuration
  runtimeConfig: {
    sessionPassword: process.env.NUXT_OIDC_SESSION_SECRET || "default-secret-min-32-chars-long",
    oauth: {
      keycloak: {
        serverUrl: process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL,
        realm: process.env.NUXT_OAUTH_KEYCLOAK_REALM,
        clientId: process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET,
        redirectUrl: process.env.NUXT_OAUTH_KEYCLOAK_REDIRECT_URL,
      },
    },
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:5253/api/",
      keycloakUrl: process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL,
      keycloakRealm: process.env.NUXT_OAUTH_KEYCLOAK_REALM,
      keycloakClientId: process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_ID,
      keycloakRedirectUrl: process.env.NUXT_OAUTH_KEYCLOAK_REDIRECT_URL,
    },
  },

  // Internationalization
  i18n: {
    defaultLocale: "en",
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "fr", name: "Français", file: "fr.json" },
    ],
    langDir: "./locales/",
  },

  // Shadcn UI config
  shadcn: {
    prefix: "cn",
    componentDir: "./app/components/ui",
  },



  // Compatibility
  compatibilityDate: "2025-07-15",

  // Devtools
  devtools: { enabled: true },
});
