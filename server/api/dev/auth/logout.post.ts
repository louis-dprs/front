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

  await session.clear();

  return sendRedirect(event, "/dev/");
});
