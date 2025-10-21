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
    "nuxt-auth-utils",
  ],
  auth: {
    strategies: {
      keycloak: {
        scheme: 'oauth',
        endpoints: {
          authorization: 'http://10.4.30.2:8040/keycloak/auth/realms/dungeoncrawler/protocol/openid-connect/auth',
          token:         'http://10.4.30.2:8040/keycloak/auth/realms/dungeoncrawler/protocol/openid-connect/token',
          userInfo:      'http://10.4.30.2:8040/keycloak/auth/realms/dungeoncrawler/protocol/openid-connect/userinfo',
        },
        clientId:   'dungeoncrawler',
        scope:      ['openid', 'profile', 'email'],
        redirectUri: 'http://10.4.30.2:8888/dev/auth/keycloak',
        cookie: {
          secure: false,
          sameSite: 'lax',
        },
      },
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

  // Session configuration to handle large tokens
  session: {
    name: "s",
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      sameSite: "lax",
      secure: false,
      maxSize: 8192,
      httpOnly: true, // Protège contre XSS
      path: "/dev", // Limite le scope du cookie
    },
  },
  
  // Si vous utilisez nuxt-auth / sidebase
  auth: {
    globalAppMiddleware: true,
    session: {
      enableRefreshOnWindowFocus: true,
      enableRefreshPeriodically: false,
    },
  },

  // Compatibility
  compatibilityDate: "2025-07-15",

  // Devtools
  devtools: { enabled: true },
});
