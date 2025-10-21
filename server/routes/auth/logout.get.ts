import { removeTokens } from "../../utils/token-store";

export default defineEventHandler(async (event) => {
  // Get session before clearing to remove tokens
  const session = await getUserSession(event);
  
  // nuxt-auth-utils renomme 'sid' en 'id'
  const sessionId = (session?.sid || session?.id) as string | undefined;
  
  if (sessionId) {
    // Remove session data from server-side store
    removeTokens(sessionId);
  }
  
  await clearUserSession(event);
  return sendRedirect(event, "/dev/");
});
