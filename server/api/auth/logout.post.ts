export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const session = await useSession(event, {
    password: config.sessionPassword,
    name: "s",
  });

  await session.clear();

  return sendRedirect(event, "/dev/");
});
