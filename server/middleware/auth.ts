export default defineEventHandler(async (event) => {
  // Skip middleware for auth routes and public assets
  const path = event.path;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/", // Root path (Nuxt internal)
    "/auth/", // Auth routes (without /dev prefix)
    "/dev/auth/", // Auth routes
    "/_nuxt/", // Nuxt assets
    "/dev/_nuxt/", // Nuxt assets
    "/api/", // API routes
    "/dev/api/", // API routes
    "/dev/", // Home page
    "/dev", // Home page (without trailing slash)
    "/dev/lore", // Lore page (public)
    "/dev/bestiary", // Bestiary page (public)
    "/resources/", // Public resources
  ];

  // Check if the current path is public or contains error parameter
  if (
    publicRoutes.some((route) => path === route || path.startsWith(route)) ||
    path.includes("error=")
  ) {
    return;
  }

  // For all other routes, check if user is authenticated
  const session = await getUserSession(event);

  if (!session.user) {
    // Redirect to home page if not authenticated
    return sendRedirect(event, "/dev/?error=unauthorized");
  }
});
