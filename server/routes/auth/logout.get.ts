import { removeTokens } from "../../utils/token-store";

export default defineEventHandler(async (event) => {
  // Get session before clearing to remove tokens
  const session = await getUserSession(event);
  const sessionId = session?.sessionId as string | undefined;
  
  if (sessionId) {
    // Remove tokens from server-side store
    removeTokens(sessionId);
  }
  
  await clearUserSession(event);
  return sendRedirect(event, "/dev/");
});
