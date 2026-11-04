import { ADMIN_READY, getAdminDb } from "@/lib/firebase/admin";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "@/lib/demo/seed";
import type { Product } from "@/lib/types";

/**
 * Optional server-side lookups for SEO metadata, reading the
 * Firebase Realtime Database with the Admin SDK. When the live catalogue is
 * unavailable (no Admin credentials or an empty database) the bundled demo
 * catalogue supplies the metadata instead, so shared links still look complete.
 */
export async function fetchProductSeo(slug: string): Promise<Partial<Product> | null> {
  if (!ADMIN_READY) return DEMO_PRODUCTS.find((product) => product.slug === slug) ?? null;
  try {
    const snapshot = await getAdminDb()
      .ref("products")
      .orderByChild("available")
      .equalTo(true)
      .get();

    let match: Partial<Product> | null = null;
    snapshot.forEach((child) => {
      const raw = (child.val() ?? {}) as Record<string, unknown>;
      if (String(raw.slug ?? child.key) === slug) {
        match = raw as Partial<Product>;
        return true;
      }
      return false;
    });
    return match ?? DEMO_PRODUCTS.find((product) => product.slug === slug) ?? null;
  } catch {
    return DEMO_PRODUCTS.find((product) => product.slug === slug) ?? null;
  }
}

export async function fetchCategorySeo(
  slug: string,
): Promise<{ name: string; description: string } | null> {
  if (!ADMIN_READY) return DEMO_CATEGORIES.find((category) => category.slug === slug) ?? null;
  try {
    const snapshot = await getAdminDb().ref("categories").get();
    let match: { name: string; description: string } | null = null;
    snapshot.forEach((child) => {
      const raw = (child.val() ?? {}) as Record<string, unknown>;
      if (String(raw.slug ?? child.key) === slug) {
        match = { name: String(raw.name ?? ""), description: String(raw.description ?? "") };
        return true;
      }
      return false;
    });
    if (match) return match;
    const demo = DEMO_CATEGORIES.find((category) => category.slug === slug);
    return demo ? { name: demo.name, description: demo.description } : null;
  } catch {
    const demo = DEMO_CATEGORIES.find((category) => category.slug === slug);
    return demo ? { name: demo.name, description: demo.description } : null;
  }
}
