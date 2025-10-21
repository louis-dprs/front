import { getSession } from "../../utils/token-store";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  
  // nuxt-auth-utils renomme automatiquement 'sid' en 'id'
  const sessionId = (session?.sid || session?.id) as string | undefined;
  
  if (!sessionId) {
    return {
      user: null,
      loggedInAt: null,
    };
  }

  const sessionData = getSession(sessionId);
  return {
    user: sessionData?.user || null,
    loggedInAt: sessionData?.loggedInAt || null,
  };
});
