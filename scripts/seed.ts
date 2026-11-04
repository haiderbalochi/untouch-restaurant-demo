/**
 * Seeds the UNTOUCH catalogue into Firebase Realtime Database.
 *
 *   npm run seed
 *
 * Requires Firebase Admin credentials in .env.local (service account JSON or the
 * three FIREBASE_ADMIN_* values). Re-running is safe: documents are merged by id.
 */
import { loadEnv } from "./load-env";

loadEnv();

import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

/** Locally hosted WebP plates (public/img) — seeded records never hot-link a CDN. */
const IMG = {
  burger: "/img/dish-burger.webp",
  burger2: "/img/dish-burger-2.webp",
  pizza: "/img/dish-pizza.webp",
  pizza2: "/img/dish-pizza-2.webp",
  sandwich: "/img/dish-sandwich.webp",
  sandwich2: "/img/dish-sandwich-2.webp",
  pasta: "/img/dish-pasta.webp",
  pasta2: "/img/dish-pasta-2.webp",
  chicken: "/img/dish-chicken.webp",
  chicken2: "/img/dish-chicken-2.webp",
  bbq: "/img/hero-plate.webp",
  bbq2: "/img/dish-shawarma.webp",
  fries: "/img/dish-fries.webp",
  fries2: "/img/dish-fries-2.webp",
  drink: "/img/dish-drink.webp",
  drink2: "/img/dish-coffee.webp",
  dessert: "/img/dish-dessert.webp",
  dessert2: "/img/dish-dessert-2.webp",
  biryani: "/img/dish-biryani.webp",
  table: "/img/atmosphere-1.webp",
  smoke: "/img/dish-shawarma.webp",
};

const now = new Date().toISOString();

const categories = [
  { id: "burgers", name: "Burgers", order: 1, image: IMG.burger, description: "Hand-pressed patties, overnight brioche, charcoal finish." },
  { id: "pizza", name: "Wood-fired Pizza", order: 2, image: IMG.pizza, description: "72-hour cold-fermented dough, blistered in 90 seconds." },
  { id: "bbq", name: "Charcoal BBQ", order: 3, image: IMG.bbq, description: "Twenty-hour marinades over live coal. Nothing rushed." },
  { id: "chicken", name: "Chicken", order: 4, image: IMG.chicken, description: "Brined, spice-rubbed and grilled to order." },
  { id: "pasta", name: "Pasta", order: 5, image: IMG.pasta, description: "Rolled in-house, sauced to order, never held." },
  { id: "sandwiches", name: "Sandwiches", order: 6, image: IMG.sandwich, description: "Stacked slow-roast fills on house-baked bread." },
  { id: "fries", name: "Fries & Sides", order: 7, image: IMG.fries, description: "Triple-cooked, seasoned at the pass." },
  { id: "drinks", name: "Drinks", order: 8, image: IMG.drink, description: "Cold-pressed, house-brewed, no shortcuts." },
  { id: "desserts", name: "Desserts", order: 9, image: IMG.dessert, description: "Finished à la minute, plated with restraint." },
  { id: "deals", name: "Special Deals", order: 10, image: IMG.biryani, description: "Chef-built combinations, priced kindly." },
];

interface SeedProduct {
  slug: string;
  name: string;
  category: string;
  price: number;
  discount?: number;
  tagline: string;
  description: string;
  images: string[];
  ingredients: string[];
  featured?: boolean;
  popular?: boolean;
  badge?: string;
  prep?: number;
  rating?: number;
  reviews?: number;
  sold?: number;
  variants?: { id: string; name: string; priceDelta: number }[];
  addons?: { id: string; name: string; price: number }[];
}

const products: SeedProduct[] = [
  {
    slug: "untouch-signature-burger",
    name: "The UNTOUCH Burger",
    category: "burgers",
    price: 1490,
    discount: 1290,
    tagline: "The one that started the queue.",
    description:
      "A 180g hand-pressed short-rib and chuck patty, seared over charcoal, aged cheddar, burnt-onion jam and house pickles in a brioche bun proved overnight. Served medium unless asked otherwise.",
    images: [IMG.burger, IMG.burger2],
    ingredients: ["Short rib", "Chuck", "Aged cheddar", "Burnt onion jam", "House pickles", "Brioche"],
    featured: true,
    popular: true,
    badge: "Signature",
    prep: 22,
    rating: 4.9,
    reviews: 312,
    sold: 1840,
    variants: [
      { id: "single", name: "Single patty", priceDelta: 0 },
      { id: "double", name: "Double patty", priceDelta: 420 },
    ],
    addons: [
      { id: "cheese", name: "Extra aged cheddar", price: 180 },
      { id: "jalapeno", name: "Charred jalapeños", price: 120 },
      { id: "egg", name: "Fried egg", price: 150 },
    ],
  },
  {
    slug: "charcoal-smash-double",
    name: "Charcoal Smash Double",
    category: "burgers",
    price: 1790,
    tagline: "Two smashed edges, one soft centre.",
    description:
      "Two thin patties smashed on the charcoal plate for maximum crust, American cheese, mustard-onion and a spoon of smoked mayo.",
    images: [IMG.burger2, IMG.burger],
    ingredients: ["Beef", "American cheese", "Smoked mayo", "Mustard onions"],
    popular: true,
    prep: 18,
    rating: 4.7,
    reviews: 148,
    sold: 920,
    variants: [
      { id: "single", name: "Single", priceDelta: -300 },
      { id: "double", name: "Double", priceDelta: 0 },
    ],
  },
  {
    slug: "truffle-mushroom-burger",
    name: "Truffle Mushroom Burger",
    category: "burgers",
    price: 1690,
    tagline: "Earthy, quiet, addictive.",
    description:
      "Charcoal patty with black truffle cream, slow-buttered mushrooms, Swiss cheese and rocket.",
    images: [IMG.burger, IMG.smoke],
    ingredients: ["Beef", "Swiss", "Mushrooms", "Truffle cream", "Rocket"],
    featured: true,
    prep: 20,
    rating: 4.8,
    reviews: 96,
    sold: 640,
  },
  {
    slug: "smoked-brisket-pizza",
    name: "Smoked Brisket Pizza",
    category: "pizza",
    price: 2190,
    discount: 1990,
    tagline: "Twelve hours of smoke, ninety seconds of fire.",
    description:
      "Cold-fermented dough, San Marzano base, twelve-hour smoked brisket, red onion, mozzarella and a finish of burnt-butter chilli oil.",
    images: [IMG.pizza, IMG.pizza2],
    ingredients: ["San Marzano tomato", "Fior di latte", "Smoked brisket", "Red onion", "Chilli oil"],
    featured: true,
    popular: true,
    badge: "Chef's pick",
    prep: 25,
    rating: 4.9,
    reviews: 204,
    sold: 1180,
    variants: [
      { id: "9inch", name: '9" personal', priceDelta: -600 },
      { id: "12inch", name: '12" sharing', priceDelta: 0 },
      { id: "16inch", name: '16" table', priceDelta: 900 },
    ],
    addons: [
      { id: "burrata", name: "Burrata", price: 350 },
      { id: "chilli-honey", name: "Chilli honey drizzle", price: 120 },
    ],
  },
  {
    slug: "margherita-verace",
    name: "Margherita Verace",
    category: "pizza",
    price: 1290,
    tagline: "Three ingredients. Nowhere to hide.",
    description:
      "San Marzano tomato, fior di latte, basil and cold-pressed olive oil on 72-hour dough.",
    images: [IMG.pizza2, IMG.pizza],
    ingredients: ["Tomato", "Fior di latte", "Basil", "Olive oil"],
    popular: true,
    prep: 18,
    rating: 4.7,
    reviews: 176,
    sold: 1420,
    variants: [
      { id: "9inch", name: '9" personal', priceDelta: -400 },
      { id: "12inch", name: '12" sharing', priceDelta: 0 },
    ],
  },
  {
    slug: "charcoal-tandoori-wings",
    name: "Charcoal Tandoori Wings",
    category: "chicken",
    price: 1190,
    tagline: "Twenty hours in yoghurt and green chilli.",
    description:
      "Wings marinated overnight in hung yoghurt, green chilli and toasted spice, finished directly over coal and brushed with burnt garlic butter.",
    images: [IMG.chicken, IMG.chicken2],
    ingredients: ["Chicken wings", "Hung yoghurt", "Green chilli", "Garam masala", "Garlic butter"],
    featured: true,
    popular: true,
    badge: "House favourite",
    prep: 24,
    rating: 4.8,
    reviews: 268,
    sold: 1560,
    variants: [
      { id: "six", name: "6 pieces", priceDelta: 0 },
      { id: "twelve", name: "12 pieces", priceDelta: 950 },
    ],
    addons: [
      { id: "mint", name: "Mint chutney", price: 90 },
      { id: "ranch", name: "Smoked ranch", price: 120 },
    ],
  },
  {
    slug: "lamb-chops-charcoal",
    name: "Charcoal Lamb Chops",
    category: "bbq",
    price: 3290,
    discount: 2990,
    tagline: "Four chops, no apologies.",
    description:
      "Frenched lamb chops in a twenty-hour raw papaya and spice marinade, grilled over live coal and rested in clarified butter.",
    images: [IMG.bbq, IMG.bbq2],
    ingredients: ["Lamb chops", "Raw papaya", "Yoghurt", "Black pepper", "Clarified butter"],
    featured: true,
    badge: "Limited daily",
    prep: 32,
    rating: 4.9,
    reviews: 88,
    sold: 410,
    variants: [
      { id: "four", name: "4 chops", priceDelta: 0 },
      { id: "eight", name: "8 chops", priceDelta: 2700 },
    ],
  },
  {
    slug: "seekh-kebab-platter",
    name: "Seekh Kebab Platter",
    category: "bbq",
    price: 1590,
    tagline: "Hand-minced, hand-skewered.",
    description:
      "Four hand-minced beef seekh kebabs with mint chutney, pickled onion and warm naan.",
    images: [IMG.bbq2, IMG.bbq],
    ingredients: ["Beef mince", "Green chilli", "Coriander", "Mint chutney", "Naan"],
    popular: true,
    prep: 26,
    rating: 4.8,
    reviews: 154,
    sold: 1120,
  },
  {
    slug: "malai-boti",
    name: "Malai Boti",
    category: "bbq",
    price: 1490,
    tagline: "Silk, then smoke.",
    description:
      "Chicken thigh in cream, cheddar and white pepper marinade, grilled over coal until just set.",
    images: [IMG.chicken2, IMG.bbq],
    ingredients: ["Chicken thigh", "Cream", "Cheddar", "White pepper"],
    prep: 22,
    rating: 4.7,
    reviews: 112,
    sold: 780,
  },
  {
    slug: "truffle-cacio-e-pepe",
    name: "Truffle Cacio e Pepe",
    category: "pasta",
    price: 1690,
    tagline: "Four ingredients, zero shortcuts.",
    description:
      "House-rolled tonnarelli, pecorino, cracked black pepper, black truffle. Emulsified to order in the pan.",
    images: [IMG.pasta, IMG.pasta2],
    ingredients: ["Tonnarelli", "Pecorino", "Black pepper", "Black truffle"],
    featured: true,
    prep: 20,
    rating: 4.8,
    reviews: 74,
    sold: 420,
  },
  {
    slug: "smoked-arrabbiata",
    name: "Smoked Arrabbiata",
    category: "pasta",
    price: 1390,
    discount: 1190,
    tagline: "Heat with a memory of fire.",
    description:
      "Rigatoni in a slow-cooked tomato sauce smoked over charcoal, chilli, garlic and basil.",
    images: [IMG.pasta2, IMG.pasta],
    ingredients: ["Rigatoni", "Smoked tomato", "Chilli", "Garlic", "Basil"],
    prep: 18,
    rating: 4.6,
    reviews: 58,
    sold: 360,
  },
  {
    slug: "slow-roast-beef-sandwich",
    name: "Slow-roast Beef Sandwich",
    category: "sandwiches",
    price: 1490,
    tagline: "Eight hours of roast in a five-minute sandwich.",
    description:
      "Eight-hour roast beef, horseradish cream, caramelised onion and watercress on house focaccia.",
    images: [IMG.sandwich, IMG.sandwich2],
    ingredients: ["Roast beef", "Horseradish cream", "Caramelised onion", "Focaccia"],
    popular: true,
    prep: 15,
    rating: 4.7,
    reviews: 132,
    sold: 880,
  },
  {
    slug: "charcoal-club",
    name: "Charcoal Club",
    category: "sandwiches",
    price: 1290,
    tagline: "Triple-stacked, carefully balanced.",
    description:
      "Grilled chicken, smoked bacon, tomato, cos and garlic aioli in toasted sourdough.",
    images: [IMG.sandwich2, IMG.sandwich],
    ingredients: ["Chicken breast", "Smoked bacon", "Garlic aioli", "Sourdough"],
    prep: 16,
    rating: 4.6,
    reviews: 96,
    sold: 610,
  },
  {
    slug: "parmesan-truffle-fries",
    name: "Parmesan Truffle Fries",
    category: "fries",
    price: 790,
    tagline: "Triple-cooked. Twice seasoned.",
    description:
      "Hand-cut potatoes cooked three times, tossed with parmesan, truffle oil and parsley.",
    images: [IMG.fries, IMG.fries2],
    ingredients: ["Potato", "Parmesan", "Truffle oil", "Parsley"],
    popular: true,
    prep: 12,
    rating: 4.8,
    reviews: 220,
    sold: 1980,
    variants: [
      { id: "regular", name: "Regular", priceDelta: 0 },
      { id: "large", name: "Large", priceDelta: 250 },
    ],
    addons: [{ id: "aioli", name: "Garlic aioli", price: 120 }],
  },
  {
    slug: "masala-fries",
    name: "Charcoal Masala Fries",
    category: "fries",
    price: 690,
    tagline: "Chaat masala, lime, green chilli.",
    description: "Triple-cooked fries with chaat masala, lime, green chilli and fried curry leaf.",
    images: [IMG.fries2, IMG.fries],
    ingredients: ["Potato", "Chaat masala", "Lime", "Curry leaf"],
    prep: 12,
    rating: 4.7,
    reviews: 168,
    sold: 1340,
  },
  {
    slug: "saffron-lemonade",
    name: "Saffron Lemonade",
    category: "drinks",
    price: 490,
    tagline: "Cold, floral, relentless.",
    description: "Hand-pressed lemon, saffron syrup, a pinch of black salt and crushed ice.",
    images: [IMG.drink, IMG.drink2],
    ingredients: ["Lemon", "Saffron", "Black salt"],
    popular: true,
    prep: 5,
    rating: 4.9,
    reviews: 84,
    sold: 980,
    variants: [
      { id: "regular", name: "Regular", priceDelta: 0 },
      { id: "carafe", name: "Carafe (1L)", priceDelta: 650 },
    ],
  },
  {
    slug: "smoked-cold-brew",
    name: "Smoked Cold Brew",
    category: "drinks",
    price: 590,
    tagline: "Eighteen hours, cold and quiet.",
    description: "Single-origin beans steeped eighteen hours, lightly smoked with cinnamon bark.",
    images: [IMG.drink2, IMG.drink],
    ingredients: ["Coffee", "Cinnamon", "Water"],
    prep: 4,
    rating: 4.7,
    reviews: 52,
    sold: 430,
  },
  {
    slug: "burnt-basque-cheesecake",
    name: "Burnt Basque Cheesecake",
    category: "desserts",
    price: 890,
    tagline: "Deliberately overbaked.",
    description:
      "A dark-topped Basque cheesecake with a molten centre, finished with sea salt and date syrup.",
    images: [IMG.dessert, IMG.dessert2],
    ingredients: ["Cream cheese", "Eggs", "Sea salt", "Date syrup"],
    featured: true,
    popular: true,
    prep: 8,
    rating: 4.9,
    reviews: 194,
    sold: 1210,
  },
  {
    slug: "pistachio-kulfi",
    name: "Pistachio Kulfi",
    category: "desserts",
    price: 690,
    tagline: "Slow-reduced milk, real pistachio.",
    description: "Milk reduced for three hours, pistachio, cardamom and a whisper of rose.",
    images: [IMG.dessert2, IMG.dessert],
    ingredients: ["Milk", "Pistachio", "Cardamom", "Rose"],
    prep: 6,
    rating: 4.7,
    reviews: 66,
    sold: 520,
  },
  {
    slug: "untouch-feast-for-two",
    name: "The UNTOUCH Feast for Two",
    category: "deals",
    price: 4290,
    discount: 3690,
    tagline: "Two signatures, two sides, one dessert.",
    description:
      "Two signature burgers, six charcoal wings, parmesan truffle fries, two saffron lemonades and a shared Basque cheesecake.",
    images: [IMG.table, IMG.burger],
    ingredients: ["Two burgers", "Six wings", "Truffle fries", "Two lemonades", "Cheesecake"],
    featured: true,
    badge: "Best value",
    prep: 30,
    rating: 4.9,
    reviews: 142,
    sold: 640,
  },
  {
    slug: "bbq-platter-for-four",
    name: "Charcoal Platter for Four",
    category: "deals",
    price: 7490,
    discount: 6490,
    tagline: "The whole fire, on one board.",
    description:
      "Lamb chops, seekh kebabs, malai boti, tandoori wings, two naan baskets, mint chutney and pickled onions.",
    images: [IMG.bbq, IMG.table],
    ingredients: ["Lamb chops", "Seekh kebab", "Malai boti", "Wings", "Naan"],
    popular: true,
    badge: "Feeds four",
    prep: 38,
    rating: 4.8,
    reviews: 58,
    sold: 210,
  },
];

const banners = [
  {
    id: "home-signature",
    title: "Twenty hours of marinade. Ninety seconds of fire.",
    subtitle:
      "The charcoal lamb chops are limited to forty portions a night — reserved, never reheated.",
    image: IMG.bbq,
    ctaLabel: "Order the chops",
    ctaHref: "/menu/charcoal-lamb-chops",
    placement: "home" as const,
    active: true,
    order: 1,
  },
  {
    id: "home-feast",
    title: "Dinner for two, without the decision fatigue.",
    subtitle: "The UNTOUCH Feast — two signatures, sides, drinks and dessert. Built by the chef.",
    image: IMG.table,
    ctaLabel: "See the feast",
    ctaHref: "/menu/untouch-feast-for-two",
    placement: "home" as const,
    active: true,
    order: 2,
  },
];

const coupons = [
  { id: "untouch10", code: "UNTOUCH10", type: "percent" as const, value: 10, minOrder: 2000, expiresAt: null, active: true, usageLimit: null },
  { id: "welcome500", code: "WELCOME500", type: "fixed" as const, value: 500, minOrder: 3000, expiresAt: null, active: true, usageLimit: 500 },
];

function createAdmin() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    const json = raw.trim().startsWith("{") ? JSON.parse(raw) : JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    return initializeApp({ credential: cert(json), projectId: json.project_id });
  }
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
  }
  return initializeApp({ credential: applicationDefault(), projectId });
}

async function main() {
  const app = createAdmin();
  const db = getDatabase(app);

  console.log("Seeding UNTOUCH →", app.options.projectId ?? "(unknown project)");

  await db.ref("categories").update(
    Object.fromEntries(
      categories.map(({ id, ...rest }) => [
        id,
        { ...rest, slug: id, active: true, createdAt: now, updatedAt: now },
      ]),
    ),
  );
  console.log(`✓ ${categories.length} categories`);

  for (const product of products) {
    const category = categories.find((item) => item.id === product.category);
    const doc = {
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      images: product.images,
      price: product.price,
      discountPrice: product.discount ?? null,
      categoryId: product.category,
      categoryName: category?.name ?? "",
      ingredients: product.ingredients,
      available: true,
      featured: Boolean(product.featured),
      popular: Boolean(product.popular),
      badge: product.badge ?? null,
      variants: product.variants ?? [],
      addons: product.addons ?? [],
      prepTime: product.prep ?? 25,
      calories: null,
      rating: product.rating ?? 4.5,
      reviewCount: product.reviews ?? 0,
      soldCount: product.sold ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.ref(`products/${product.slug}`).update(doc);
  }
  console.log(`✓ ${products.length} dishes`);

  for (const banner of banners) {
    const { id, ...rest } = banner;
    await db.ref(`banners/${id}`).update(rest);
  }

  for (const coupon of coupons) {
    const { id, ...rest } = coupon;
    await db.ref(`coupons/${id}`).update({ ...rest, usedCount: 0, createdAt: now });
  }

  await db.ref("restaurantSettings").update(
    {
      name: "UNTOUCH",
      logoUrl: "",
      phone: "+92 300 117 4477",
      email: "hello@untouch.pk",
      address: "Plot 24, Khayaban-e-Shahbaz, DHA Phase VI, Karachi",
      deliveryFee: 249,
      minOrder: 1200,
      openTime: "12:00",
      closeTime: "23:30",
      isOpen: true,
      socials: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        tiktok: "https://tiktok.com",
      },
      content: {
        heroKicker: "Karachi · Slow fire kitchen",
        heroTitle: "Nothing ordinary touches your plate.",
        heroSubtitle:
          "Twenty-hour marinades, hand-stretched dough and a fire we never rush. UNTOUCH is a quiet obsession with flavour — now at your door.",
        storyTitle: "A kitchen that refuses shortcuts.",
        storyBody:
          "We started with one tandoor, six seats and a stubborn idea: that a burger could carry the soul of a charcoal grill. A decade later, everything at UNTOUCH is still made the long way — dough proved overnight, spice ground each morning, sauces built from scratch.",
        announcement: "Complimentary delivery over Rs 6,000 — this week only.",
      },
    },
  );

  const reviews = [
    { product: "untouch-signature-burger", name: "Ayesha K.", rating: 5, comment: "The best burger in Karachi, full stop. The onion jam is unreal." },
    { product: "charcoal-tandoori-wings", name: "Bilal R.", rating: 5, comment: "Ordered these three weekends in a row. The smoke is real, not a sauce." },
    { product: "smoked-brisket-pizza", name: "Hana S.", rating: 5, comment: "Crust blistered perfectly and the brisket actually tastes of smoke." },
    { product: "burnt-basque-cheesecake", name: "Omar F.", rating: 4, comment: "Molten centre, not too sweet. Arrived cold but still excellent." },
    { product: "charcoal-lamb-chops", name: "Zainab M.", rating: 5, comment: "Worth the price. Four chops, perfectly rested, no chew at all." },
  ];

  for (const [index, review] of reviews.entries()) {
    const product = products.find((item) => item.slug === review.product);
    await db.ref(`reviews/seed-review-${index + 1}`).update(
      {
        productId: review.product,
        productName: product?.name ?? "",
        userId: `seed-guest-${index + 1}`,
        userName: review.name,
        rating: review.rating,
        comment: review.comment,
        status: "approved",
        createdAt: now,
      },
    );
  }
  console.log("✓ banners, coupons, settings and reviews");

  console.log("\nSeed complete. Open the storefront — data is live and streaming.");
}

main().catch((error) => {
  console.error("\nSeed failed:", error instanceof Error ? error.message : error);
  console.error(
    "Check that FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY (or FIREBASE_SERVICE_ACCOUNT_JSON) are set in .env.local.",
  );
  process.exit(1);
});
