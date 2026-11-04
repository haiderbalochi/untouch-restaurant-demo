/** Domain types shared by the browser, route handlers and admin panel. */

export type ISODate = string;

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  order: number;
  active: boolean;
}

export interface Variant {
  id: string;
  name: string;
  priceDelta: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  images: string[];
  price: number;
  discountPrice: number | null;
  categoryId: string;
  categoryName: string;
  ingredients: string[];
  available: boolean;
  featured: boolean;
  popular: boolean;
  badge: string | null;
  variants: Variant[];
  addons: Addon[];
  prepTime: number;
  calories: number | null;
  rating: number;
  reviewCount: number;
  soldCount: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  postalCode: string;
  instructions: string;
  isDefault: boolean;
  createdAt: ISODate;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phone: string;
  createdAt: ISODate;
  notificationPrefs: { orderUpdates: boolean; offers: boolean };
}

export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  basePrice: number;
  quantity: number;
  variantId: string | null;
  variantName: string | null;
  variantDelta: number;
  addons: Addon[];
}

/** What the browser is allowed to send when placing an order. Prices are never trusted. */
export interface OrderRequestItem {
  productId: string;
  quantity: number;
  variantId: string | null;
  addonIds: string[];
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  variantName: string | null;
  addons: { name: string; price: number }[];
  lineTotal: number;
}

export interface OrderAddress {
  label: string;
  fullName: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  postalCode: string;
  instructions: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";
export type PaymentMethod = "cod" | "online";

export interface StatusEvent {
  status: OrderStatus;
  at: ISODate;
  by: "customer" | "admin" | "system";
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customer: { name: string; email: string; phone: string };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode: string | null;
  address: OrderAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProvider: string | null;
  paymentReference: string | null;
  status: OrderStatus;
  notes: string;
  adminNotes: string;
  statusHistory: StatusEvent[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  expiresAt: ISODate | null;
  active: boolean;
  usageLimit: number | null;
  usedCount: number;
  createdAt: ISODate;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: ISODate;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  placement: "home" | "menu";
  active: boolean;
  order: number;
}

export interface RestaurantSettings {
  name: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  deliveryFee: number;
  minOrder: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  socials: { instagram: string; facebook: string; tiktok: string };
  content: {
    heroKicker: string;
    heroTitle: string;
    heroSubtitle: string;
    storyTitle: string;
    storyBody: string;
    announcement: string;
  };
}

export interface QuoteLine {
  product: Product;
  quantity: number;
  addons: Addon[];
  variant: Variant | null;
  lineTotal: number;
}

export interface Quote {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  coupon: { code: string; type: Coupon["type"]; value: number } | null;
  issues: string[];
  minOrder: number;
  freeAbove: number;
}
