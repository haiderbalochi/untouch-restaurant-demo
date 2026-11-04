import type { Metadata } from "next";
import { CategoryView } from "@/components/menu/category-view";
import { fetchCategorySeo } from "@/lib/server/seo";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategorySeo(slug);
  return {
    title: category?.name ?? "Category",
    description:
      category?.description ||
      `Order ${category?.name ?? "dishes"} from ${SITE.name} — made to order, delivered untouched.`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryView slug={slug} />;
}
