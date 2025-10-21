import { useSession } from "h3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  
  const session = await useSession(event, {
    password: config.sessionPassword,
    name: "s",
  });

  return {
    user: session.data.user || null,
    loggedInAt: session.data.loggedInAt || null,
  };
});
