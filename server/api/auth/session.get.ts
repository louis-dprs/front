export default defineEventHandler(async (event) => {
  const session = await useOidcSession(event);
  
  return {
    user: session.user || null,
    loggedIn: !!session.user,
    claims: session.claims || null,
  };
});
