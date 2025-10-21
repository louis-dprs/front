export default defineNitroPlugin((nitroApp) => {
  // Hook into all responses to modify session cookie
  nitroApp.hooks.hook("beforeResponse", async (event) => {
    const setCookieHeader = event.node.res.getHeader("set-cookie");
    
    if (setCookieHeader) {
      const cookies = Array.isArray(setCookieHeader) 
        ? setCookieHeader 
        : [setCookieHeader];
      
      // Remove 'Secure' flag from all cookies
      const modifiedCookies = cookies.map((cookie) => {
        if (typeof cookie === "string") {
          // Remove the Secure flag
          return cookie.replace(/;\s*Secure/gi, "");
        }
        return cookie;
      });
      
      event.node.res.setHeader("set-cookie", modifiedCookies);
    }
  });
});
