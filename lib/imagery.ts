/**
 * Editorial photography used for brand surfaces (hero, story, promotions, galleries).
 *
 * Every asset is served locally from /public/img (WebP, optimised) so the storefront
 * never depends on a hot-linked CDN. Product imagery still comes from the catalogue
 * (Cloudinary / Realtime Database); these are the brand-level art direction plates.
 */
export const IMAGERY = {
  hero: "/img/hero-plate.webp",
  heroAlt: "/img/dish-spread.webp",
  fire: "/img/dish-shawarma.webp",
  story: "/img/atmosphere-1.webp",
  dough: "/img/dish-pizza.webp",
  smoke: "/img/dish-shawarma.webp",
  table: "/img/atmosphere-3.webp",
  interior: "/img/atmosphere-2.webp",
  burger: "/img/dish-burger.webp",
  dessert: "/img/dish-dessert.webp",
  drinks: "/img/dish-drink.webp",
  fallbackDish: "/img/dish-spread.webp",
  pass: "/img/prep-1.webp",
} as const;

/** Uneven gallery plates used by the atmosphere section. */
export const ATMOSPHERE = [
  { src: "/img/atmosphere-1.webp", label: "The dining room", note: "Twelve tables, no rush" },
  { src: "/img/atmosphere-2.webp", label: "The counter", note: "Where the fire lives" },
  { src: "/img/hero-plate.webp", label: "The pass", note: "Plated to order" },
  { src: "/img/atmosphere-3.webp", label: "The long table", note: "Private dining" },
] as const;

/** Small plates used by the hero rail and editorial bands. */
export const PLATES = [
  { src: "/img/dish-burger.webp", label: "Burgers" },
  { src: "/img/dish-pizza.webp", label: "Pizza" },
  { src: "/img/dish-chicken.webp", label: "Chicken" },
  { src: "/img/dish-dessert.webp", label: "Desserts" },
] as const;
