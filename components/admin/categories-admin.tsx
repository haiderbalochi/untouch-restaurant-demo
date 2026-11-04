"use client";

import Image from "next/image";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Modal } from "@/components/ui/overlay";
import { Badge, Button, EmptyState, Field, Input, Skeleton, Textarea, Toggle } from "@/components/ui/primitives";
import { createCategory, removeCategory, saveCategory, type CategoryInput } from "@/lib/data/admin";
import { useCategories, useProducts } from "@/lib/hooks";
import type { Category } from "@/lib/types";
import { cdnImage, slugify } from "@/lib/utils";

const blank: CategoryInput = {
  name: "",
  slug: "",
  description: "",
  image: "",
  order: 0,
  active: true,
};

export function CategoriesAdmin() {
  const { data: categories, loading } = useCategories({ includeInactive: true });
  const { data: products } = useProducts({ includeUnavailable: true });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryInput>(blank);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ ...blank, order: categories.length + 1 });
    setOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      order: category.order,
      active: category.active,
    });
    setOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("Give the category a name.");
    const payload: CategoryInput = { ...form, slug: form.slug || slugify(form.name) };
    setSaving(true);
    try {
      if (editing) {
        await saveCategory(editing.id, payload);
        toast.success("Category updated");
      } else {
        await createCategory(payload);
        toast.success("Category created");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the category.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[0.82rem] text-cream/40">
          {categories.length} categories · order controls the storefront sequence
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-3.5" /> New category
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-2xl" />
            ))
          : categories
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((category) => {
                const count = products.filter((product) => product.categoryId === category.id).length;
                return (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 rounded-2xl border border-cream/10 bg-cream/[0.02] p-3.5"
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-3">
                      {category.image ? (
                        <Image
                          src={cdnImage(category.image, 160)}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.84rem] text-cream/85">{category.name}</p>
                      <p className="mt-0.5 text-[0.66rem] text-cream/30">
                        #{category.order} · {count} dishes
                      </p>
                      <div className="mt-1.5">
                        <Badge tone={category.active ? "success" : "neutral"}>
                          {category.active ? "Active" : "Hidden"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        className="grid size-8 place-items-center rounded-full text-cream/40 hover:bg-cream/8 hover:text-cream"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `Delete ${category.name}? Dishes in it will remain but lose their category.`,
                            )
                          )
                            return;
                          try {
                            await removeCategory(category.id);
                            toast.success("Category deleted");
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Delete failed.");
                          }
                        }}
                        className="grid size-8 place-items-center rounded-full text-cream/25 hover:text-red-300"
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
      </div>

      {!loading && categories.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No categories yet."
          description="Create your first category — the menu is organised around these."
          action={
            <Button size="sm" onClick={openCreate}>
              New category
            </Button>
          }
        />
      ) : null}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.name}` : "New category"}
        size="lg"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="category-name">
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug: editing ? current.slug : slugify(event.target.value),
                  }))
                }
                required
              />
            </Field>
            <Field label="Slug" htmlFor="category-slug">
              <Input
                id="category-slug"
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="category-description">
            <Textarea
              id="category-description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-20"
            />
          </Field>

          <Field label="Display order" htmlFor="category-order">
            <Input
              id="category-order"
              type="number"
              min={0}
              value={form.order}
              onChange={(event) => setForm((current) => ({ ...current, order: Number(event.target.value) }))}
              className="w-28"
            />
          </Field>

          <ImageUploader
            value={form.image ? [form.image] : []}
            onChange={(images) => setForm((current) => ({ ...current, image: images[0] ?? "" }))}
            scope="category"
            multiple={false}
            label="Category image"
          />

          <div className="rounded-xl border border-cream/10 px-4">
            <Toggle
              checked={form.active}
              onChange={(next) => setForm((current) => ({ ...current, active: next }))}
              label="Active"
              description="Visible to customers on the storefront"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-cream/10 pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editing ? "Save changes" : "Create category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
