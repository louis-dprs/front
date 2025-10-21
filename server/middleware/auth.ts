export default defineEventHandler(async (event) => {
  // Tout le site est public par défaut
  // Seules certaines pages nécessitent l'authentification
  
  const path = event.path;

  // Routes qui nécessitent l'authentification
  const protectedRoutes = [
    "/dev/profile", // Page de profil (si tu en as une)
    "/dev/settings", // Page de paramètres (si tu en as une)
    // Ajoute ici d'autres routes qui nécessitent l'auth
  ];

  // Vérifie si la route actuelle nécessite l'authentification
  const requiresAuth = protectedRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );

  // Si la route ne nécessite pas d'auth, laisser passer
  if (!requiresAuth) {
    return;
  }

  // Pour les routes protégées, vérifier l'authentification
  const config = useRuntimeConfig(event);
  const session = await useSession(event, {
    password: config.sessionPassword,
    name: "s",
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  });

  if (!session.data.user) {
    // Rediriger vers la page d'accueil si pas authentifié
    return sendRedirect(event, "/dev/?error=unauthorized");
  }
});
