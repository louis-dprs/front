import type { Creature } from "~/types/creature";
import { mockCreatures } from "~/mocks/creaturesMock";

export async function getCreaturesLocalized(
  locale: string
): Promise<Creature[]> {
  try {
    const config = useRuntimeConfig();
    const { accessToken } = await useOidcAuth();
    
    // Direct call to backend with token
    const res = await $fetch(`${config.public.apiBase}/creatures/localized`, {
      params: { locale },
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : {}
    });
    return res as Creature[];
  } catch {
    console.warn("⚠️ API unreachable, using mock data");
    return mockCreatures;
  }
}
