export default defineEventHandler((event) => {
  // Intercepte setHeader pour supprimer le flag Secure des cookies
  const originalSetHeader = event.node.res.setHeader.bind(event.node.res);
  
  event.node.res.setHeader = function (name: string, value: any) {
    if (name.toLowerCase() === "set-cookie") {
      if (Array.isArray(value)) {
        value = value.map((cookie) =>
          typeof cookie === "string"
            ? cookie.replace(/;\s*Secure/gi, "")
            : cookie
        );
      } else if (typeof value === "string") {
        value = value.replace(/;\s*Secure/gi, "");
      }
    }
    return originalSetHeader(name, value);
  };
});
