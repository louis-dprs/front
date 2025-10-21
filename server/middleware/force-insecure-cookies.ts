// Middleware to force non-secure cookies for development
export default defineEventHandler((event) => {
  // Intercept setHeader for set-cookie
  const originalSetHeader = event.node.res.setHeader.bind(event.node.res);
  
  event.node.res.setHeader = function (name, value) {
    if (name.toLowerCase() === "set-cookie") {
      if (typeof value === "string") {
        // Remove Secure flag
        value = value.replace(/;\s*Secure/gi, "");
      } else if (Array.isArray(value)) {
        value = value.map((cookie) =>
          typeof cookie === "string" ? cookie.replace(/;\s*Secure/gi, "") : cookie
        );
      }
    }
    return originalSetHeader(name, value);
  };
});
