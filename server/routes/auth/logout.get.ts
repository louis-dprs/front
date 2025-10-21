import { removeTokens } from "../../utils/token-store";

export default defineEventHandler(async (event) => {
  // Get session before clearing to remove tokens
  const session = await getUserSession(event);
  const sessionId = session?.sid as string | undefined;
  
  if (sessionId) {
    // Remove session data from server-side store
    removeTokens(sessionId);
  }
  
  await clearUserSession(event);
  return sendRedirect(event, "/dev/");
});
