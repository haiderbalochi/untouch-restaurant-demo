"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/primitives";
import { UseCategoriesGrid } from "@/components/menu/category-grid";
import { useCategories, useProducts } from "@/lib/hooks";
import { cdnImage, sortCategories } from "@/lib/utils";

export function CategoriesView() {
  const { data: categories, loading } = useCategories();
  const { data: products } = useProducts();
  const sorted = sortCategories(categories);

  if (loading) {
    return (
      <div className="container-x grid gap-5 pb-24 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/3] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="container-x pb-24">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((category, index) => {
          const count = products.filter((product) => product.categoryId === category.id).length;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative isolate overflow-hidden rounded-[1.4rem] border border-cream/10 bg-ink-3"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="relative aspect-[4/3]">
                {category.image ? (
                  <Image
                    src={cdnImage(category.image, 900)}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-ink-3 to-ink-4" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                <span className="absolute left-4 top-4 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cream/45">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="font-display text-[1.7rem] leading-tight text-cream">
                      {category.name}
                    </h2>
                    <p className="mt-1 line-clamp-1 text-[0.76rem] text-cream/45">
                      {category.description || `${count} dishes`}
                    </p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-cream/25 text-cream/70 transition-all duration-500 group-hover:border-ember/60 group-hover:bg-ember group-hover:text-cream">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {sorted.length === 0 ? <UseCategoriesGrid /> : null}
    </div>
  );
}
