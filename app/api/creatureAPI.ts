import type { Creature } from "~/types/creature";
import { mockCreatures } from "~/mocks/creaturesMock";

export async function getCreaturesLocalized(
  locale: string
): Promise<Creature[]> {
  try {
    // Use the server proxy so the access token is injected automatically
    const res = await $fetch(`/api/proxy/creatures/localized`, {
      params: { locale },
    });
    return res as Creature[];
  } catch {
    console.warn("⚠️ API unreachable, using mock data");
    return mockCreatures;
  }
}
