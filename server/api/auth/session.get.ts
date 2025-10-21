export default defineEventHandler(async (event) => {
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

  return {
    user: session.data.user || null,
    loggedInAt: session.data.loggedInAt || null,
  };
});