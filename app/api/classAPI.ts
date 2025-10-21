import type { Class } from "~/types/class";
import { mockClasses } from "~/mocks/classMock";

export async function getClassesLocalized(locale: string): Promise<Class[]> {
  try {
    // Use the server proxy so the access token is injected automatically
    const res = await $fetch(`/api/proxy/classes/localized`, {
      params: { locale },
    });
    return res as Class[];
  } catch {
    console.warn("⚠️ API unreachable, using mock data");
    return mockClasses;
  }
}
