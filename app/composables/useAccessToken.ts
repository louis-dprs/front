// Composable pour récupérer le token d'accès depuis la session H3
export const useAccessToken = async () => {
  try {
    const data = await $fetch<{ 
      user: any; 
      loggedInAt: number | null;
      tokens?: {
        access: string;
        refresh: string;
        expiresAt: number;
      }
    }>("/api/auth/session");
    
    return data.tokens?.access || null;
  } catch (error) {
    console.error("Failed to fetch access token:", error);
    return null;
  }
};
