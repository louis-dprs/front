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
    oidc: {
      providers: {
        keycloak: {
          baseUrl: process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL,
          clientId: process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_ID,
          clientSecret: process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET,
          redirectUri: process.env.NUXT_OAUTH_KEYCLOAK_REDIRECT_URL || "http://localhost:3000/auth/keycloak/callback",
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
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:5253/api/",
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
