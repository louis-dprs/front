export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  
  // Return the full session to see what's stored
  return {
    sessionKeys: Object.keys(session),
    sessionSize: JSON.stringify(session).length,
    session: session,
  };
});
