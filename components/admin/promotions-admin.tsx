"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
  Toggle,
} from "@/components/ui/primitives";
import {
  createBanner,
  createCoupon,
  removeBanner,
  removeCoupon,
  saveBanner,
  saveCoupon,
  subscribeAllBanners,
  subscribeAllCoupons,
  type BannerInput,
  type CouponInput,
} from "@/lib/data/admin";
import type { Banner, Coupon } from "@/lib/types";
import { cn, cdnImage, formatDate, money } from "@/lib/utils";

const blankCoupon: CouponInput = {
  code: "",
  type: "percent",
  value: 10,
  minOrder: 0,
  expiresAt: null,
  active: true,
  usageLimit: null,
};

const blankBanner: BannerInput = {
  title: "",
  subtitle: "",
  image: "",
  ctaLabel: "Order now",
  ctaHref: "/menu",
  placement: "home",
  active: true,
  order: 0,
};

export function PromotionsAdmin() {
  const [tab, setTab] = useState<"coupons" | "banners">("coupons");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [couponOpen, setCouponOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState<CouponInput>(blankCoupon);

  const [bannerOpen, setBannerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerInput>(blankBanner);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubCoupons = subscribeAllCoupons((list) => {
      setCoupons(list);
      setLoading(false);
    });
    const unsubBanners = subscribeAllBanners(setBanners);
    return () => {
      unsubCoupons();
      unsubBanners();
    };
  }, []);

  async function submitCoupon(event: React.FormEvent) {
    event.preventDefault();
    if (!couponForm.code.trim()) return toast.error("A coupon needs a code.");
    if (couponForm.value <= 0) return toast.error("Set a discount value.");
    setSaving(true);
    try {
      if (editingCoupon) {
        await saveCoupon(editingCoupon.id, couponForm);
        toast.success("Coupon updated");
      } else {
        await createCoupon(couponForm);
        toast.success("Coupon created");
      }
      setCouponOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the coupon.");
    } finally {
      setSaving(false);
    }
  }

  async function submitBanner(event: React.FormEvent) {
    event.preventDefault();
    if (!bannerForm.title.trim()) return toast.error("Add a banner title.");
    setSaving(true);
    try {
      if (editingBanner) {
        await saveBanner(editingBanner.id, bannerForm);
        toast.success("Banner updated");
      } else {
        await createBanner(bannerForm);
        toast.success("Banner created");
      }
      setBannerOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the banner.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-cream/12 p-1">
          {(["coupons", "banners"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[0.72rem] uppercase tracking-[0.12em] transition-colors",
                tab === value ? "bg-cream text-ink" : "text-cream/45 hover:text-cream",
              )}
            >
              {value}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          onClick={() => {
            if (tab === "coupons") {
              setEditingCoupon(null);
              setCouponForm(blankCoupon);
              setCouponOpen(true);
            } else {
              setEditingBanner(null);
              setBannerForm({ ...blankBanner, order: banners.length });
              setBannerOpen(true);
            }
          }}
        >
          <Plus className="size-3.5" /> New {tab === "coupons" ? "coupon" : "banner"}
        </Button>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : tab === "coupons" ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {coupons.length === 0 ? (
            <EmptyState
              className="sm:col-span-2"
              title="No coupons yet."
              description="Create a percentage or fixed discount and customers can apply it at checkout."
            />
          ) : (
            coupons.map((coupon) => (
              <div key={coupon.id} className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[0.9rem] tracking-[0.08em] text-cream">
                      {coupon.code}
                    </p>
                    <p className="mt-1 text-[0.74rem] text-cream/45">
                      {coupon.type === "percent" ? `${coupon.value}% off` : `${money(coupon.value)} off`}
                      {coupon.minOrder > 0 ? ` · min ${money(coupon.minOrder)}` : ""}
                    </p>
                    <p className="mt-1 text-[0.66rem] text-cream/25">
                      {coupon.expiresAt ? `Expires ${formatDate(coupon.expiresAt)}` : "No expiry"} ·{" "}
                      {coupon.usedCount}
                      {coupon.usageLimit ? `/${coupon.usageLimit}` : ""} used
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge tone={coupon.active ? "success" : "neutral"}>
                      {coupon.active ? "Active" : "Off"}
                    </Badge>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setCouponForm({
                            code: coupon.code,
                            type: coupon.type,
                            value: coupon.value,
                            minOrder: coupon.minOrder,
                            expiresAt: coupon.expiresAt,
                            active: coupon.active,
                            usageLimit: coupon.usageLimit,
                          });
                          setCouponOpen(true);
                        }}
                        className="grid size-7 place-items-center rounded-full text-cream/40 hover:text-cream"
                        aria-label="Edit coupon"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
                          await removeCoupon(coupon.id);
                          toast.success("Coupon deleted");
                        }}
                        className="grid size-7 place-items-center rounded-full text-cream/25 hover:text-red-300"
                        aria-label="Delete coupon"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {banners.length === 0 ? (
            <EmptyState
              className="sm:col-span-2"
              title="No promotional banners."
              description="Banners appear on the homepage or menu, fully controlled from here."
            />
          ) : (
            banners.map((banner) => (
              <div
                key={banner.id}
                className="flex gap-3 rounded-2xl border border-cream/10 bg-cream/[0.02] p-3.5"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-ink-3">
                  {banner.image ? (
                    <Image src={cdnImage(banner.image, 200)} alt="" fill sizes="64px" className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.84rem] text-cream/85">{banner.title}</p>
                  <p className="truncate text-[0.7rem] text-cream/35">{banner.subtitle}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge tone={banner.active ? "success" : "neutral"}>
                      {banner.active ? "Live" : "Off"}
                    </Badge>
                    <span className="text-[0.62rem] text-cream/25">{banner.placement}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBanner(banner);
                      setBannerForm({
                        title: banner.title,
                        subtitle: banner.subtitle,
                        image: banner.image,
                        ctaLabel: banner.ctaLabel,
                        ctaHref: banner.ctaHref,
                        placement: banner.placement,
                        active: banner.active,
                        order: banner.order,
                      });
                      setBannerOpen(true);
                    }}
                    className="grid size-7 place-items-center rounded-full text-cream/40 hover:text-cream"
                    aria-label="Edit banner"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm("Delete this banner?")) return;
                      await removeBanner(banner.id);
                      toast.success("Banner deleted");
                    }}
                    className="grid size-7 place-items-center rounded-full text-cream/25 hover:text-red-300"
                    aria-label="Delete banner"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal
        open={couponOpen}
        onClose={() => setCouponOpen(false)}
        title={editingCoupon ? `Edit ${editingCoupon.code}` : "New coupon"}
        size="lg"
      >
        <form onSubmit={submitCoupon} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Code" htmlFor="coupon-code">
              <Input
                id="coupon-code"
                value={couponForm.code}
                onChange={(event) =>
                  setCouponForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))
                }
                placeholder="UNTOUCH10"
                required
              />
            </Field>
            <Field label="Type" htmlFor="coupon-type">
              <Select
                id="coupon-type"
                value={couponForm.type}
                onChange={(event) =>
                  setCouponForm((current) => ({
                    ...current,
                    type: event.target.value as Coupon["type"],
                  }))
                }
              >
                <option value="percent" className="bg-ink">
                  Percentage
                </option>
                <option value="fixed" className="bg-ink">
                  Fixed amount
                </option>
              </Select>
            </Field>
            <Field
              label={couponForm.type === "percent" ? "Percent off" : "Amount off (PKR)"}
              htmlFor="coupon-value"
            >
              <Input
                id="coupon-value"
                type="number"
                min={1}
                value={couponForm.value}
                onChange={(event) =>
                  setCouponForm((current) => ({ ...current, value: Number(event.target.value) }))
                }
              />
            </Field>
            <Field label="Minimum order (PKR)" htmlFor="coupon-min">
              <Input
                id="coupon-min"
                type="number"
                min={0}
                value={couponForm.minOrder}
                onChange={(event) =>
                  setCouponForm((current) => ({ ...current, minOrder: Number(event.target.value) }))
                }
              />
            </Field>
            <Field label="Expiry" htmlFor="coupon-expiry" hint="Leave empty for no expiry.">
              <Input
                id="coupon-expiry"
                type="date"
                value={couponForm.expiresAt ? couponForm.expiresAt.slice(0, 10) : ""}
                onChange={(event) =>
                  setCouponForm((current) => ({
                    ...current,
                    expiresAt: event.target.value
                      ? new Date(`${event.target.value}T23:59:59`).toISOString()
                      : null,
                  }))
                }
              />
            </Field>
            <Field label="Usage limit" htmlFor="coupon-limit" hint="Empty = unlimited.">
              <Input
                id="coupon-limit"
                type="number"
                min={0}
                value={couponForm.usageLimit ?? ""}
                onChange={(event) =>
                  setCouponForm((current) => ({
                    ...current,
                    usageLimit: event.target.value ? Number(event.target.value) : null,
                  }))
                }
              />
            </Field>
          </div>

          <div className="rounded-xl border border-cream/10 px-4">
            <Toggle
              checked={couponForm.active}
              onChange={(next) => setCouponForm((current) => ({ ...current, active: next }))}
              label="Active"
              description="Redeemable at checkout"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-cream/10 pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => setCouponOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editingCoupon ? "Save coupon" : "Create coupon"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={bannerOpen}
        onClose={() => setBannerOpen(false)}
        title={editingBanner ? "Edit banner" : "New banner"}
        size="lg"
      >
        <form onSubmit={submitBanner} className="space-y-4">
          <Field label="Title" htmlFor="banner-title">
            <Input
              id="banner-title"
              value={bannerForm.title}
              onChange={(event) =>
                setBannerForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Subtitle" htmlFor="banner-subtitle">
            <Input
              id="banner-subtitle"
              value={bannerForm.subtitle}
              onChange={(event) =>
                setBannerForm((current) => ({ ...current, subtitle: event.target.value }))
              }
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button label" htmlFor="banner-cta">
              <Input
                id="banner-cta"
                value={bannerForm.ctaLabel}
                onChange={(event) =>
                  setBannerForm((current) => ({ ...current, ctaLabel: event.target.value }))
                }
              />
            </Field>
            <Field label="Button link" htmlFor="banner-href">
              <Input
                id="banner-href"
                value={bannerForm.ctaHref}
                onChange={(event) =>
                  setBannerForm((current) => ({ ...current, ctaHref: event.target.value }))
                }
              />
            </Field>
            <Field label="Placement" htmlFor="banner-placement">
              <Select
                id="banner-placement"
                value={bannerForm.placement}
                onChange={(event) =>
                  setBannerForm((current) => ({
                    ...current,
                    placement: event.target.value as Banner["placement"],
                  }))
                }
              >
                <option value="home" className="bg-ink">
                  Homepage
                </option>
                <option value="menu" className="bg-ink">
                  Menu
                </option>
              </Select>
            </Field>
            <Field label="Display order" htmlFor="banner-order">
              <Input
                id="banner-order"
                type="number"
                min={0}
                value={bannerForm.order}
                onChange={(event) =>
                  setBannerForm((current) => ({ ...current, order: Number(event.target.value) }))
                }
              />
            </Field>
          </div>

          <ImageUploader
            value={bannerForm.image ? [bannerForm.image] : []}
            onChange={(images) =>
              setBannerForm((current) => ({ ...current, image: images[0] ?? "" }))
            }
            scope="banner"
            multiple={false}
            label="Banner artwork"
          />

          <div className="rounded-xl border border-cream/10 px-4">
            <Toggle
              checked={bannerForm.active}
              onChange={(next) => setBannerForm((current) => ({ ...current, active: next }))}
              label="Live"
              description="Show on the storefront"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-cream/10 pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => setBannerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editingBanner ? "Save banner" : "Create banner"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
