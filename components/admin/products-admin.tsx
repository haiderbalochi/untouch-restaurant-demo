"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Modal } from "@/components/ui/overlay";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Select,
  Skeleton,
  Textarea,
  Toggle,
} from "@/components/ui/primitives";
import { createProduct, removeProduct, saveProduct, type ProductInput } from "@/lib/data/admin";
import { useDemoMode } from "@/lib/demo/mode";
import { useCategories, useProducts } from "@/lib/hooks";
import type { Addon, Product, Variant } from "@/lib/types";
import { cdnImage, makeId, money, slugify } from "@/lib/utils";

const blank: ProductInput = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  images: [],
  price: 0,
  discountPrice: null,
  categoryId: "",
  categoryName: "",
  ingredients: [],
  available: true,
  featured: false,
  popular: false,
  badge: null,
  variants: [],
  addons: [],
  prepTime: 25,
  calories: null,
  rating: 0,
};

export function ProductsAdmin() {
  const { data: products, loading } = useProducts({ includeUnavailable: true });
  const { data: categories } = useCategories({ includeInactive: true });
  const { demo } = useDemoMode();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductInput>(blank);
  const [ingredientsText, setIngredientsText] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      if (categoryFilter !== "all" && product.categoryId !== categoryFilter) return false;
      if (!term) return true;
      return `${product.name} ${product.categoryName}`.toLowerCase().includes(term);
    });
  }, [products, search, categoryFilter]);

  function openCreate() {
    setEditing(null);
    setForm({ ...blank, categoryId: categories[0]?.id ?? "", categoryName: categories[0]?.name ?? "" });
    setIngredientsText("");
    setOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      images: product.images,
      price: product.price,
      discountPrice: product.discountPrice,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      ingredients: product.ingredients,
      available: product.available,
      featured: product.featured,
      popular: product.popular,
      badge: product.badge,
      variants: product.variants,
      addons: product.addons,
      prepTime: product.prepTime,
      calories: product.calories,
      rating: product.rating,
    });
    setIngredientsText(product.ingredients.join(", "));
    setOpen(true);
  }

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("A dish needs a name.");
    if (!form.categoryId) return toast.error("Assign a category first.");
    if (!form.price || form.price <= 0) return toast.error("Set a price greater than zero.");

    const category = categories.find((item) => item.id === form.categoryId);
    const payload: ProductInput = {
      ...form,
      slug: form.slug || slugify(form.name),
      categoryName: category?.name ?? form.categoryName,
      ingredients: ingredientsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      discountPrice:
        form.discountPrice && form.discountPrice > 0 && form.discountPrice < form.price
          ? form.discountPrice
          : null,
    };

    setSaving(true);
    try {
      if (editing) {
        await saveProduct(editing.id, payload);
        toast.success(`${payload.name} updated`);
      } else {
        await createProduct(payload);
        toast.success(`${payload.name} published`);
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the dish.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(product: Product, key: "available" | "featured" | "popular") {
    try {
      await saveProduct(product.id, { [key]: !product[key] });
      toast.success("Product updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-cream/30" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search dishes…"
              aria-label="Search dishes"
              className="h-10 rounded-full pl-9 text-[0.82rem]"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter by category"
            className="h-10 w-auto rounded-full text-[0.78rem]"
          >
            <option value="all" className="bg-ink">
              All categories
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id} className="bg-ink">
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-3.5" /> New dish
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-cream/10">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            className="border-0"
            title="No dishes found."
            description="Adjust the filters, or publish your first dish."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-3.5" /> New dish
              </Button>
            }
          />
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-cream/10 bg-cream/[0.025]">
              <tr className="text-[0.62rem] uppercase tracking-[0.14em] text-cream/35">
                <th className="px-5 py-3 font-normal">Dish</th>
                <th className="hidden px-3 py-3 font-normal md:table-cell">Category</th>
                <th className="px-3 py-3 font-normal">Price</th>
                <th className="hidden px-3 py-3 font-normal lg:table-cell">Flags</th>
                <th className="px-3 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/8">
              {filtered.map((product) => (
                <tr key={product.id} className="group transition-colors hover:bg-cream/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-ink-3">
                        {product.images[0] ? (
                          <Image
                            src={cdnImage(product.images[0], 120)}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[0.84rem] text-cream/85">{product.name}</p>
                        <p className="truncate text-[0.66rem] text-cream/30">/{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 text-[0.78rem] text-cream/45 md:table-cell">
                    {product.categoryName || "—"}
                  </td>
                  <td className="px-3 py-3 text-[0.8rem] tabular-nums text-cream/70">
                    {money(product.discountPrice ?? product.price)}
                    {product.discountPrice ? (
                      <span className="ml-1.5 text-[0.66rem] text-cream/25 line-through">
                        {money(product.price)}
                      </span>
                    ) : null}
                  </td>
                  <td className="hidden px-3 py-3 lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => toggleField(product, "available")}
                        title="Toggle availability"
                      >
                        <Badge tone={product.available ? "success" : "danger"}>
                          {product.available ? "Available" : "Hidden"}
                        </Badge>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleField(product, "featured")}
                        title="Toggle featured"
                      >
                        <Badge tone={product.featured ? "warm" : "neutral"}>Featured</Badge>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleField(product, "popular")}
                        title="Toggle popular"
                      >
                        <Badge tone={product.popular ? "sage" : "neutral"}>Popular</Badge>
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="grid size-8 place-items-center rounded-full text-cream/45 transition-colors hover:bg-cream/8 hover:text-cream"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
                          try {
                            await removeProduct(product.id);
                            toast.success("Dish deleted");
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Delete failed.");
                          }
                        }}
                        className="grid size-8 place-items-center rounded-full text-cream/30 transition-colors hover:text-red-300"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.name}` : "Publish a new dish"}
        description={
          demo
            ? "Saved to this browser's demo data — the storefront updates instantly and Firebase is never touched."
            : "Everything here is written to Firebase Realtime Database and appears on the storefront instantly."
        }
        size="xl"
      >
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="product-name">
              <Input
                id="product-name"
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((current) => ({
                    ...current,
                    name,
                    slug: editing ? current.slug : slugify(name),
                  }));
                }}
                required
              />
            </Field>
            <Field label="Slug" htmlFor="product-slug" hint="Used in the product URL.">
              <Input
                id="product-slug"
                value={form.slug}
                onChange={(event) => update("slug", slugify(event.target.value))}
              />
            </Field>
            <Field label="Category" htmlFor="product-category">
              <Select
                id="product-category"
                value={form.categoryId}
                onChange={(event) => {
                  const category = categories.find((item) => item.id === event.target.value);
                  setForm((current) => ({
                    ...current,
                    categoryId: event.target.value,
                    categoryName: category?.name ?? "",
                  }));
                }}
                required
              >
                <option value="" className="bg-ink">
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-ink">
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Badge" htmlFor="product-badge" hint="Optional label, e.g. Chef's pick.">
              <Input
                id="product-badge"
                value={form.badge ?? ""}
                onChange={(event) => update("badge", event.target.value || null)}
              />
            </Field>
            <Field label="Price (PKR)" htmlFor="product-price">
              <Input
                id="product-price"
                type="number"
                min={0}
                step={1}
                value={form.price || ""}
                onChange={(event) => update("price", Number(event.target.value))}
                required
              />
            </Field>
            <Field label="Discounted price (PKR)" htmlFor="product-discount" hint="Leave empty for no offer.">
              <Input
                id="product-discount"
                type="number"
                min={0}
                step={1}
                value={form.discountPrice ?? ""}
                onChange={(event) =>
                  update("discountPrice", event.target.value ? Number(event.target.value) : null)
                }
              />
            </Field>
            <Field label="Prep time (minutes)" htmlFor="product-prep">
              <Input
                id="product-prep"
                type="number"
                min={1}
                max={180}
                value={form.prepTime}
                onChange={(event) => update("prepTime", Number(event.target.value))}
              />
            </Field>
            <Field label="Calories" htmlFor="product-calories" hint="Optional">
              <Input
                id="product-calories"
                type="number"
                min={0}
                value={form.calories ?? ""}
                onChange={(event) =>
                  update("calories", event.target.value ? Number(event.target.value) : null)
                }
              />
            </Field>
          </div>

          <Field label="Tagline" htmlFor="product-tagline">
            <Input
              id="product-tagline"
              value={form.tagline}
              onChange={(event) => update("tagline", event.target.value)}
              placeholder="One line that sells it"
            />
          </Field>

          <Field label="Description" htmlFor="product-description">
            <Textarea
              id="product-description"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className="min-h-24"
            />
          </Field>

          <Field label="Ingredients" htmlFor="product-ingredients" hint="Comma separated.">
            <Input
              id="product-ingredients"
              value={ingredientsText}
              onChange={(event) => setIngredientsText(event.target.value)}
            />
          </Field>

          <ImageUploader value={form.images} onChange={(images) => update("images", images)} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-cream/10 p-4">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-cream/40">Variants</p>
                <button
                  type="button"
                  onClick={() =>
                    update("variants", [
                      ...form.variants,
                      { id: makeId("v"), name: "", priceDelta: 0 } as Variant,
                    ])
                  }
                  className="text-[0.66rem] uppercase tracking-[0.12em] text-ember-3"
                >
                  + Add
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {form.variants.length === 0 ? (
                  <p className="text-[0.72rem] text-cream/25">No sizes — single price.</p>
                ) : (
                  form.variants.map((variant, index) => (
                    <div key={variant.id} className="flex gap-2">
                      <Input
                        value={variant.name}
                        placeholder="Large"
                        onChange={(event) =>
                          update(
                            "variants",
                            form.variants.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, name: event.target.value } : item,
                            ),
                          )
                        }
                        className="h-9 text-[0.78rem]"
                      />
                      <Input
                        type="number"
                        value={variant.priceDelta}
                        onChange={(event) =>
                          update(
                            "variants",
                            form.variants.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, priceDelta: Number(event.target.value) }
                                : item,
                            ),
                          )
                        }
                        className="h-9 w-24 text-[0.78rem]"
                        aria-label="Price difference"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "variants",
                            form.variants.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        className="px-1 text-cream/30 hover:text-red-300"
                        aria-label="Remove variant"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-cream/10 p-4">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-cream/40">Add-ons</p>
                <button
                  type="button"
                  onClick={() =>
                    update("addons", [...form.addons, { id: makeId("a"), name: "", price: 0 } as Addon])
                  }
                  className="text-[0.66rem] uppercase tracking-[0.12em] text-ember-3"
                >
                  + Add
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {form.addons.length === 0 ? (
                  <p className="text-[0.72rem] text-cream/25">No extras offered.</p>
                ) : (
                  form.addons.map((addon, index) => (
                    <div key={addon.id} className="flex gap-2">
                      <Input
                        value={addon.name}
                        placeholder="Extra cheese"
                        onChange={(event) =>
                          update(
                            "addons",
                            form.addons.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, name: event.target.value } : item,
                            ),
                          )
                        }
                        className="h-9 text-[0.78rem]"
                      />
                      <Input
                        type="number"
                        value={addon.price}
                        onChange={(event) =>
                          update(
                            "addons",
                            form.addons.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, price: Number(event.target.value) } : item,
                            ),
                          )
                        }
                        className="h-9 w-24 text-[0.78rem]"
                        aria-label="Add-on price"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "addons",
                            form.addons.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        className="px-1 text-cream/30 hover:text-red-300"
                        aria-label="Remove add-on"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-2 rounded-xl border border-cream/10 px-4 sm:grid-cols-3">
            <Toggle
              checked={form.available}
              onChange={(next) => update("available", next)}
              label="Available"
              description="Visible on the menu"
            />
            <Toggle
              checked={form.featured}
              onChange={(next) => update("featured", next)}
              label="Featured"
              description="Homepage signature"
            />
            <Toggle
              checked={form.popular}
              onChange={(next) => update("popular", next)}
              label="Popular"
              description="Crowd favourite"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-cream/10 pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editing ? "Save changes" : "Publish dish"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
