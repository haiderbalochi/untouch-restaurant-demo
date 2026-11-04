export const SITE = {
  name: "UNTOUCH",
  tagline: "Fire, spice & quiet luxury",
  description:
    "UNTOUCH is a premium kitchen in Karachi plating slow-fired smoke, hand-rolled dough and seasonal spice — ordered in a few taps, delivered untouched.",
  city: "Karachi",
  country: "Pakistan",
  credits: {
    team: "Team Realhackers",
    host: "Haider Baloch",
  },
  adminPath: "/unnothingadmin",
  socials: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    tiktok: "https://tiktok.com",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Categories", href: "/categories" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export const DELIVERY = {
  freeAbove: 6000,
  taxLabel: "Service & packing",
  taxPercent: 0,
} as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export const ORDER_STATUS_LABEL: Record<(typeof ORDER_STATUSES)[number], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for dispatch",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_TONE: Record<
  (typeof ORDER_STATUSES)[number],
  "neutral" | "warm" | "sage" | "danger" | "success"
> = {
  pending: "neutral",
  confirmed: "warm",
  preparing: "warm",
  ready: "warm",
  out_for_delivery: "sage",
  delivered: "success",
  cancelled: "danger",
};

export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded", "failed"] as const;
