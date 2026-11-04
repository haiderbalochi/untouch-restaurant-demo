import type { MetadataRoute } from "next";
import { ADMIN_READY, getAdminDb } from "@/lib/firebase/admin";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/menu`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];

  if (!ADMIN_READY) return staticRoutes;

  try {
    const db = getAdminDb();
    const [productsSnapshot, categoriesSnapshot] = await Promise.all([
      db.ref("products").orderByChild("available").equalTo(true).get(),
      db.ref("categories").orderByChild("active").equalTo(true).get(),
    ]);

    const categories: MetadataRoute.Sitemap = [];
    categoriesSnapshot.forEach((child) => {
      const raw = (child.val() ?? {}) as Record<string, unknown>;
      categories.push({
        url: `${base}/categories/${raw.slug ?? child.key}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
      return false;
    });

    const products: MetadataRoute.Sitemap = [];
    productsSnapshot.forEach((child) => {
      const raw = (child.val() ?? {}) as Record<string, unknown>;
      products.push({
        url: `${base}/menu/${raw.slug ?? child.key}`,
        lastModified: raw.updatedAt ? new Date(String(raw.updatedAt)) : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      });
      return false;
    });

    return [...staticRoutes, ...categories, ...products];
  } catch {
    return staticRoutes;
  }
}
