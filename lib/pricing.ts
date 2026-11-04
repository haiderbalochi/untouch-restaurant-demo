import type { Addon, Coupon, Product, QuoteLine, Variant } from "@/lib/types";
import { clamp } from "@/lib/utils";

export const FREE_DELIVERY_ABOVE = 6000;

export function effectivePrice(product: Pick<Product, "price" | "discountPrice">) {
  const { price, discountPrice } = product;
  return discountPrice && discountPrice > 0 && discountPrice < price ? discountPrice : price;
}

export function unitPrice(product: Pick<Product, "price" | "discountPrice">, variant?: Variant | null, addons: Addon[] = []) {
  return (
    effectivePrice(product) +
    (variant?.priceDelta ?? 0) +
    addons.reduce((sum, addon) => sum + Math.max(0, addon.price), 0)
  );
}

export function lineTotal(line: QuoteLine) {
  return unitPrice(line.product, line.variant, line.addons) * line.quantity;
}

export function couponDiscount(
  coupon: Pick<Coupon, "type" | "value" | "minOrder"> | null,
  subtotal: number,
) {
  if (!coupon) return 0;
  if (subtotal < (coupon.minOrder ?? 0)) return 0;
  const raw = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  return clamp(Math.round(raw), 0, subtotal);
}

export function deliveryFeeFor(subtotalAfterDiscount: number, configuredFee: number) {
  if (subtotalAfterDiscount <= 0) return 0;
  if (subtotalAfterDiscount >= FREE_DELIVERY_ABOVE) return 0;
  return Math.max(0, Math.round(configuredFee));
}

export interface PriceInputs {
  lines: QuoteLine[];
  coupon: Coupon | null;
  deliveryFee: number;
  minOrder: number;
}

export function quoteTotals({ lines, coupon, deliveryFee, minOrder }: PriceInputs) {
  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const discount = couponDiscount(coupon, subtotal);
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = deliveryFeeFor(afterDiscount, deliveryFee);
  const total = afterDiscount + shipping;
  const issues: string[] = [];
  if (subtotal > 0 && subtotal < minOrder) {
    issues.push(`Minimum order is Rs ${minOrder.toLocaleString("en-PK")}.`);
  }
  return { subtotal, discount, afterDiscount, deliveryFee: shipping, total, issues };
}
