export default defineNitroPlugin((nitroApp) => {
  // Hook into render response to modify cookies
  nitroApp.hooks.hook("render:response", (response, { event }) => {
    const setCookieHeader = event.node.res.getHeader("set-cookie");
    
    if (setCookieHeader) {
      const cookies = Array.isArray(setCookieHeader) 
        ? setCookieHeader 
        : [setCookieHeader];
      
      // Remove 'Secure' flag from all cookies
      const modifiedCookies = cookies.map((cookie) => {
        if (typeof cookie === "string") {
          return cookie.replace(/;\s*Secure/gi, "");
        }
        return cookie;
      });
      
      event.node.res.setHeader("set-cookie", modifiedCookies);
    }
  });
  
  // Also hook into request to modify outgoing cookies
  nitroApp.hooks.hook("request", (event) => {
    const originalSetHeader = event.node.res.setHeader.bind(event.node.res);
    
    event.node.res.setHeader = function (name: string, value: any) {
      if (name.toLowerCase() === "set-cookie") {
        if (typeof value === "string") {
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
});
