"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/menu/product-card";
import { EmptyState, Input, Select } from "@/components/ui/primitives";
import { SetupNotice } from "@/components/layout/setup-notice";
import { useCategories, useProducts } from "@/lib/hooks";
import type { Product } from "@/lib/types";
import { cn, discountedPrice, sortCategories } from "@/lib/utils";

const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price · low to high" },
  { value: "price-desc", label: "Price · high to low" },
  { value: "newest", label: "Newest" },
];

function sortProducts(products: Product[], sort: string) {
  const list = [...products];
  switch (sort) {
    case "popular":
      return list.sort((a, b) => b.soldCount - a.soldCount);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating);
    case "price-asc":
      return list.sort(
        (a, b) =>
          discountedPrice(a.price, a.discountPrice) - discountedPrice(b.price, b.discountPrice),
      );
    case "price-desc":
      return list.sort(
        (a, b) =>
          discountedPrice(b.price, b.discountPrice) - discountedPrice(a.price, a.discountPrice),
      );
    case "newest":
      return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    default:
      return list.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.soldCount - a.soldCount ||
          b.rating - a.rating,
      );
  }
}

export function MenuBrowser() {
  const searchParams = useSearchParams();
  const { data: products, loading, error, preview } = useProducts();
  const { data: categories } = useCategories();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "recommended");
  const [only, setOnly] = useState(searchParams.get("filter") ?? "");

  useEffect(() => {
    setCategory(searchParams.get("category") ?? "all");
    setSort(searchParams.get("sort") ?? "recommended");
    setOnly(searchParams.get("filter") ?? "");
  }, [searchParams]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = products.filter((product) => {
      if (category !== "all" && product.categoryId !== category) return false;
      if (only === "featured" && !product.featured) return false;
      if (only === "specials" && !(product.discountPrice && product.discountPrice < product.price))
        return false;
      if (!term) return true;
      return [product.name, product.tagline, product.description, product.categoryName, ...product.ingredients]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
    return sortProducts(list, sort);
  }, [products, search, category, sort, only]);

  const categoryTabs = [
    { id: "all", name: "Everything" },
    ...sortCategories(categories).map((item) => ({ id: item.id, name: item.name })),
  ];

  const hasFilters = Boolean(search || only || category !== "all");

  return (
    <div className="container-x pb-28">
      <div className="sticky top-[72px] z-40 -mx-5 border-b border-cream/8 bg-ink/85 px-5 py-4 backdrop-blur-2xl md:-mx-10 md:px-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cream/30" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search dishes, ingredients, cravings…"
                aria-label="Search the menu"
                className="h-11 rounded-full bg-cream/[0.04] pl-11 pr-10"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-cream/35 hover:text-cream"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnly(only === "featured" ? "" : "featured")}
                className={cn(
                  "h-11 rounded-full border px-4 text-[0.68rem] uppercase tracking-[0.14em] transition-colors",
                  only === "featured"
                    ? "border-ember/50 bg-ember/15 text-ember-3"
                    : "border-cream/15 text-cream/55 hover:border-cream/30",
                )}
              >
                Featured
              </button>
              <button
                type="button"
                onClick={() => setOnly(only === "specials" ? "" : "specials")}
                className={cn(
                  "h-11 rounded-full border px-4 text-[0.68rem] uppercase tracking-[0.14em] transition-colors",
                  only === "specials"
                    ? "border-ember/50 bg-ember/15 text-ember-3"
                    : "border-cream/15 text-cream/55 hover:border-cream/30",
                )}
              >
                On offer
              </button>
              <div className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-cream/35" />
                <Select
                  aria-label="Sort products"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-11 w-auto min-w-[10.5rem] rounded-full border-cream/15 bg-cream/[0.03] pl-9 pr-8 text-[0.78rem]"
                >
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-ink">
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-[0.76rem] transition-all duration-300",
                  category === tab.id
                    ? "bg-cream text-ink"
                    : "text-cream/50 hover:bg-cream/8 hover:text-cream",
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-8">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-cream/35">
          {loading
            ? "Loading the pass…"
            : `${filtered.length} ${filtered.length === 1 ? "dish" : "dishes"}`}
          {preview ? <span className="ml-2 text-cream/20">· demo menu</span> : null}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setOnly("");
              setSort("recommended");
            }}
            className="inline-flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.16em] text-cream/40 transition-colors hover:text-cream"
          >
            <X className="size-3" /> Reset filters
          </button>
        ) : null}
      </div>

      {error && !loading && !preview ? (
        <div className="mt-8">
          <SetupNotice />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} layout="compact" />
            ))
          : filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} layout="compact" />
            ))}
      </div>

      {!loading && !error && filtered.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="No dishes match that."
          description="Try a different craving, or clear the filters to see the full kitchen."
        />
      ) : null}
    </div>
  );
}
