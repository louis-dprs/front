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
    maxAge: 60 * 60 * 24 * 7, // 7 days
    cookie: {
      sameSite: "lax",
      secure: false, // Disabled for HTTP connections (not recommended for production)
    },
  },

  // Compatibility
  compatibilityDate: "2025-07-15",

  // Devtools
  devtools: { enabled: true },
});
