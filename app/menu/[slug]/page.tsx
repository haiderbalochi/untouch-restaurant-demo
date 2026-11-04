import type { Metadata } from "next";
import { ProductDetail } from "@/components/menu/product-detail";
import { fetchProductSeo } from "@/lib/server/seo";
import { SITE } from "@/lib/site";
import { truncate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductSeo(slug);
  if (!product) {
    return {
      title: "Dish",
      description: SITE.description,
      alternates: { canonical: `/menu/${slug}` },
    };
  }
  const description = truncate(
    product.tagline || product.description || `Order ${product.name} from ${SITE.name}.`,
    155,
  );
  return {
    title: product.name,
    description,
    alternates: { canonical: `/menu/${product.slug ?? slug}` },
    openGraph: {
      title: `${product.name} · ${SITE.name}`,
      description,
      images: product.images?.length ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
