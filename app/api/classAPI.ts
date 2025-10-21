import type { Class } from "~/types/class";
import { mockClasses } from "~/mocks/classMock";

export async function getClassesLocalized(locale: string): Promise<Class[]> {
  try {
    const config = useRuntimeConfig();
    const { accessToken } = await useOidcAuth();
    
    // Direct call to backend with token
    const res = await $fetch(`${config.public.apiBase}/classes/localized`, {
      params: { locale },
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : {}
    });
    return res as Class[];
  } catch {
    console.warn("⚠️ API unreachable, using mock data");
    return mockClasses;
  }
}
