import type {
  Banner,
  Category,
  Coupon,
  Order,
  OrderAddress,
  OrderItem,
  OrderStatus,
  Product,
  RestaurantSettings,
  Review,
  UserProfile,
} from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/defaults";

/**
 * Demo catalogue — the sample restaurant used when Firebase Realtime Database
 * has no content yet.
 *
 * Everything here is fictional portfolio content. Live Firebase data always
 * wins; this seed is only rendered while the live catalogue is empty, and demo
 * edits live in this browser's localStorage (see lib/demo/store.ts). Nothing in
 * this folder is ever written to Firebase.
 */
const STAMP = "2026-01-01T00:00:00.000Z";

const IMG = {
  burger: "/img/dish-burger.webp",
  burger2: "/img/dish-burger-2.webp",
  burger3: "/img/dish-burger-3.webp",
  pizza: "/img/dish-pizza.webp",
  pizza2: "/img/dish-pizza-2.webp",
  pizza3: "/img/dish-pizza-3.webp",
  chicken: "/img/dish-chicken.webp",
  chicken2: "/img/dish-chicken-2.webp",
  chicken3: "/img/dish-chicken-3.webp",
  fries: "/img/dish-fries.webp",
  fries2: "/img/dish-fries-2.webp",
  sandwich: "/img/dish-sandwich.webp",
  sandwich2: "/img/dish-sandwich-2.webp",
  pasta: "/img/dish-pasta.webp",
  pasta2: "/img/dish-pasta-2.webp",
  pasta3: "/img/dish-pasta-3.webp",
  dessert: "/img/dish-dessert.webp",
  dessert2: "/img/dish-dessert-2.webp",
  dessert3: "/img/dish-dessert-3.webp",
  drink: "/img/dish-drink.webp",
  coffee: "/img/dish-coffee.webp",
  cocktail: "/img/dish-cocktail.webp",
  cocktail2: "/img/dish-cocktail-2.webp",
  ribs: "/img/hero-plate.webp",
  brisket: "/img/dish-shawarma.webp",
  biryani: "/img/dish-biryani.webp",
  spread: "/img/dish-spread.webp",
} as const;

interface Draft {
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
  calories?: number;
  rating?: number;
  reviews?: number;
  sold?: number;
  variants?: { id: string; name: string; priceDelta: number }[];
  addons?: { id: string; name: string; price: number }[];
}

const categoryDrafts: { id: string; name: string; description: string; image: string }[] = [
  { id: "burgers", name: "Burgers", description: "Hand-pressed patties, overnight brioche, charcoal finish.", image: IMG.burger },
  { id: "pizza", name: "Wood-fired Pizza", description: "72-hour cold-fermented dough, blistered in 90 seconds.", image: IMG.pizza },
  { id: "bbq", name: "Charcoal BBQ", description: "Twenty-hour marinades over live coal. Nothing rushed.", image: IMG.ribs },
  { id: "chicken", name: "Chicken", description: "Brined, spice-rubbed and grilled to order.", image: IMG.chicken },
  { id: "pasta", name: "Pasta", description: "Rolled in-house, sauced to order, never held.", image: IMG.pasta },
  { id: "sandwiches", name: "Sandwiches", description: "Stacked slow-roast fills on house-baked bread.", image: IMG.sandwich },
  { id: "fries", name: "Fries & Sides", description: "Triple-cooked, seasoned at the pass.", image: IMG.fries },
  { id: "drinks", name: "Drinks", description: "Cold-pressed, house-brewed, no shortcuts.", image: IMG.drink },
  { id: "desserts", name: "Desserts", description: "Finished à la minute, plated with restraint.", image: IMG.dessert },
  { id: "deals", name: "Special Deals", description: "Chef-built combinations, priced kindly.", image: IMG.spread },
];

const drafts: Draft[] = [
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
    calories: 780,
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
    images: [IMG.burger2, IMG.burger3],
    ingredients: ["Beef", "American cheese", "Smoked mayo", "Mustard onions"],
    popular: true,
    prep: 18,
    calories: 840,
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
    images: [IMG.burger3, IMG.burger],
    ingredients: ["Beef", "Swiss", "Mushrooms", "Truffle cream", "Rocket"],
    featured: true,
    prep: 20,
    calories: 760,
    rating: 4.8,
    reviews: 96,
    sold: 640,
  },

  {
    slug: "burrata-margherita",
    name: "Burrata Margherita",
    category: "pizza",
    price: 1590,
    tagline: "Naples, with a Karachi accent.",
    description:
      "72-hour cold-fermented base, San Marzano tomato, fior di latte and a whole burrata torn over the top after the bake. Basil and cold-pressed olive oil to finish.",
    images: [IMG.pizza, IMG.pizza2],
    ingredients: ["72-hour dough", "San Marzano", "Fior di latte", "Burrata", "Basil"],
    featured: true,
    popular: true,
    badge: "Bake of the week",
    prep: 16,
    calories: 690,
    rating: 4.9,
    reviews: 214,
    sold: 1320,
    variants: [
      { id: "9", name: "9 inch", priceDelta: 0 },
      { id: "12", name: "12 inch", priceDelta: 480 },
    ],
  },
  {
    slug: "smoked-bbq-chicken-pizza",
    name: "Smoked BBQ Chicken",
    category: "pizza",
    price: 1890,
    discount: 1690,
    tagline: "Charcoal smoke, under the cheese.",
    description:
      "Pulled chicken from the charcoal grill, house BBQ reduction, red onion and smoked scamorza.",
    images: [IMG.pizza2, IMG.pizza3],
    ingredients: ["Grilled chicken", "BBQ reduction", "Scamorza", "Red onion"],
    popular: true,
    prep: 18,
    calories: 780,
    rating: 4.7,
    reviews: 132,
    sold: 880,
  },
  {
    slug: "truffle-mushroom-pizza",
    name: "Truffle Mushroom Pizza",
    category: "pizza",
    price: 1990,
    tagline: "The quiet one everyone orders twice.",
    description:
      "Wild mushrooms, taleggio, thyme and truffle honey on a blistered base.",
    images: [IMG.pizza3, IMG.pizza],
    ingredients: ["Wild mushrooms", "Taleggio", "Thyme", "Truffle honey"],
    prep: 18,
    calories: 720,
    rating: 4.8,
    reviews: 78,
    sold: 410,
  },

  {
    slug: "charcoal-short-ribs",
    name: "Charcoal Short Ribs",
    category: "bbq",
    price: 2890,
    tagline: "Six hours of smoke, ten minutes of rest.",
    description:
      "Short rib rubbed with toasted spice, smoked low over charcoal and glazed with tamarind and burnt honey. Served with pickled onion and the house fire sauce.",
    images: [IMG.ribs, IMG.brisket],
    ingredients: ["Short rib", "Charcoal smoke", "Tamarind glaze", "Burnt honey", "Pickled onion"],
    featured: true,
    popular: true,
    badge: "Fire only",
    prep: 28,
    calories: 860,
    rating: 5.0,
    reviews: 187,
    sold: 760,
  },
  {
    slug: "twenty-hour-seekh",
    name: "Twenty-Hour Seekh",
    category: "bbq",
    price: 1690,
    tagline: "Twenty hours in the marinade, nine on the coal.",
    description:
      "Hand-minced beef with raw papaya, green chilli and roasted cumin, worked by hand and rested overnight before it touches the fire.",
    images: [IMG.brisket, IMG.ribs],
    ingredients: ["Beef", "Raw papaya", "Green chilli", "Roasted cumin", "Coriander"],
    popular: true,
    prep: 24,
    calories: 640,
    rating: 4.9,
    reviews: 264,
    sold: 1510,
    addons: [
      { id: "mint", name: "Mint chutney", price: 80 },
      { id: "onion", name: "Sumac onions", price: 100 },
    ],
  },
  {
    slug: "smoked-brisket-plate",
    name: "Smoked Brisket Plate",
    category: "bbq",
    price: 2490,
    tagline: "Bark, smoke ring, patience.",
    description:
      "Twelve-hour brisket, sliced thick, with burnt-end beans, slaw and a spoon of mustard jus.",
    images: [IMG.brisket, IMG.spread],
    ingredients: ["Brisket", "Burnt-end beans", "Slaw", "Mustard jus"],
    prep: 26,
    calories: 910,
    rating: 4.8,
    reviews: 94,
    sold: 380,
  },

  {
    slug: "buttermilk-fried-chicken",
    name: "Buttermilk Fried Chicken",
    category: "chicken",
    price: 1390,
    tagline: "The cult order. We refuse to change it.",
    description:
      "Buttermilk-brined for a day, dredged twice, fried to a shatter. Hot honey on the side, because someone always asks.",
    images: [IMG.chicken, IMG.chicken2],
    ingredients: ["Chicken", "Buttermilk brine", "House spice", "Hot honey"],
    popular: true,
    badge: "Cult favourite",
    prep: 20,
    calories: 820,
    rating: 4.9,
    reviews: 341,
    sold: 2120,
    variants: [
      { id: "quarter", name: "Quarter", priceDelta: 0 },
      { id: "half", name: "Half bird", priceDelta: 640 },
    ],
  },
  {
    slug: "charcoal-chicken-wings",
    name: "Charcoal Chicken Wings",
    category: "chicken",
    price: 1190,
    discount: 990,
    tagline: "Blistered, sticky, gone in minutes.",
    description:
      "Wings grilled over live coal and tossed in tamarind butter with charred spring onion.",
    images: [IMG.chicken2, IMG.chicken3],
    ingredients: ["Chicken wings", "Tamarind butter", "Spring onion"],
    popular: true,
    prep: 18,
    calories: 610,
    rating: 4.7,
    reviews: 156,
    sold: 990,
  },
  {
    slug: "harissa-half-chicken",
    name: "Harissa Half Chicken",
    category: "chicken",
    price: 1590,
    tagline: "Slow-grilled, never dry.",
    description:
      "Half chicken brined in yoghurt and harissa, grilled bone-in and finished with lemon and coriander.",
    images: [IMG.chicken3, IMG.chicken],
    ingredients: ["Chicken", "Yoghurt", "Harissa", "Lemon", "Coriander"],
    prep: 26,
    calories: 700,
    rating: 4.8,
    reviews: 88,
    sold: 420,
  },

  {
    slug: "beef-short-rib-ragu",
    name: "Short Rib Ragu",
    category: "pasta",
    price: 1790,
    tagline: "Four hours in the pot, ten minutes on the plate.",
    description:
      "Hand-rolled fettuccine folded through short-rib ragu, parmesan and a little orange zest.",
    images: [IMG.pasta, IMG.pasta2],
    ingredients: ["Fettuccine", "Short rib", "Tomato", "Parmesan", "Orange zest"],
    featured: true,
    popular: true,
    prep: 22,
    calories: 760,
    rating: 4.9,
    reviews: 176,
    sold: 810,
  },
  {
    slug: "truffle-cacio-e-pepe",
    name: "Truffle Cacio e Pepe",
    category: "pasta",
    price: 1590,
    tagline: "Three ingredients. No hiding.",
    description:
      "Tonnarelli, aged pecorino, cracked black pepper and black truffle — emulsified to order.",
    images: [IMG.pasta2, IMG.pasta3],
    ingredients: ["Tonnarelli", "Pecorino", "Black pepper", "Black truffle"],
    prep: 16,
    calories: 690,
    rating: 4.8,
    reviews: 112,
    sold: 540,
  },
  {
    slug: "rigatoni-arrabbiata",
    name: "Rigatoni Arrabbiata",
    category: "pasta",
    price: 1390,
    tagline: "Properly angry.",
    description:
      "Rigatoni with slow-cooked chilli tomato, garlic confit and torn basil.",
    images: [IMG.pasta3, IMG.pasta],
    ingredients: ["Rigatoni", "Chilli tomato", "Garlic confit", "Basil"],
    prep: 15,
    calories: 640,
    rating: 4.6,
    reviews: 64,
    sold: 300,
  },

  {
    slug: "slow-roast-beef-sandwich",
    name: "Slow-Roast Beef",
    category: "sandwiches",
    price: 1290,
    tagline: "Thin-sliced, stacked high.",
    description:
      "Twelve-hour roast beef, smoked cheddar, horseradish cream and pickles on house focaccia.",
    images: [IMG.sandwich, IMG.sandwich2],
    ingredients: ["Roast beef", "Smoked cheddar", "Horseradish cream", "Focaccia"],
    prep: 14,
    calories: 620,
    rating: 4.7,
    reviews: 91,
    sold: 480,
  },
  {
    slug: "truffle-grilled-cheese",
    name: "Truffle Grilled Cheese",
    category: "sandwiches",
    price: 890,
    discount: 790,
    tagline: "The best two-ingredient argument.",
    description:
      "Aged cheddar and mozzarella melted with truffle butter on thick-cut sourdough, pressed until lacquered.",
    images: [IMG.sandwich2, IMG.sandwich],
    ingredients: ["Aged cheddar", "Mozzarella", "Truffle butter", "Sourdough"],
    popular: true,
    prep: 12,
    calories: 540,
    rating: 4.8,
    reviews: 143,
    sold: 720,
  },

  {
    slug: "parmesan-truffle-fries",
    name: "Parmesan Truffle Fries",
    category: "fries",
    price: 690,
    tagline: "Ordered before the mains.",
    description:
      "Triple-cooked fries, truffle oil, 24-month parmesan and chopped parsley.",
    images: [IMG.fries, IMG.fries2],
    ingredients: ["Potato", "Truffle oil", "Parmesan", "Parsley"],
    popular: true,
    badge: "Table staple",
    prep: 12,
    calories: 480,
    rating: 4.9,
    reviews: 288,
    sold: 2410,
  },
  {
    slug: "loaded-charcoal-fries",
    name: "Loaded Charcoal Fries",
    category: "fries",
    price: 890,
    tagline: "A meal pretending to be a side.",
    description:
      "Fries under smoked cheese sauce, burnt-end beef, pickled chilli and spring onion.",
    images: [IMG.fries2, IMG.fries],
    ingredients: ["Potato", "Cheese sauce", "Burnt-end beef", "Pickled chilli"],
    prep: 14,
    calories: 660,
    rating: 4.7,
    reviews: 121,
    sold: 640,
  },

  {
    slug: "burnt-orange-mojito",
    name: "Burnt Orange Mojito",
    category: "drinks",
    price: 490,
    tagline: "No alcohol. No compromise.",
    description:
      "Grilled orange, lime, mint and soda over crushed ice — built to cut through smoke.",
    images: [IMG.drink, IMG.cocktail],
    ingredients: ["Orange", "Lime", "Mint", "Soda"],
    popular: true,
    prep: 6,
    calories: 140,
    rating: 4.8,
    reviews: 76,
    sold: 520,
  },
  {
    slug: "karachi-cold-brew",
    name: "Karachi Cold Brew",
    category: "drinks",
    price: 450,
    tagline: "Eighteen-hour steep.",
    description:
      "Single-origin beans steeped overnight, served over ice with a touch of cardamom.",
    images: [IMG.coffee, IMG.drink],
    ingredients: ["Single-origin coffee", "Cardamom", "Ice"],
    prep: 4,
    calories: 25,
    rating: 4.7,
    reviews: 54,
    sold: 310,
  },
  {
    slug: "saffron-lemonade",
    name: "Saffron Lemonade",
    category: "drinks",
    price: 470,
    tagline: "The colour of a Karachi evening.",
    description: "Cold-pressed lemon, saffron syrup and sparkling water.",
    images: [IMG.cocktail, IMG.cocktail2],
    ingredients: ["Lemon", "Saffron syrup", "Sparkling water"],
    prep: 5,
    calories: 120,
    rating: 4.6,
    reviews: 42,
    sold: 260,
  },

  {
    slug: "salted-caramel-brownie",
    name: "Salted Caramel Brownie",
    category: "desserts",
    price: 790,
    tagline: "Warm centre, cold cream.",
    description:
      "Dark chocolate brownie served warm with salted caramel, vanilla cream and a shard of cocoa nib brittle.",
    images: [IMG.dessert, IMG.dessert2],
    ingredients: ["Dark chocolate", "Salted caramel", "Vanilla cream", "Cocoa nib"],
    featured: true,
    popular: true,
    badge: "Most gifted",
    prep: 10,
    calories: 520,
    rating: 5.0,
    reviews: 205,
    sold: 1120,
  },
  {
    slug: "basque-cheesecake",
    name: "Burnt Basque Cheesecake",
    category: "desserts",
    price: 850,
    tagline: "Deliberately burnt.",
    description: "Caramelised top, molten centre, a spoon of sour cherry.",
    images: [IMG.dessert2, IMG.dessert3],
    ingredients: ["Cream cheese", "Egg", "Vanilla", "Sour cherry"],
    prep: 8,
    calories: 460,
    rating: 4.9,
    reviews: 132,
    sold: 610,
  },
  {
    slug: "pistachio-kulfi",
    name: "Pistachio Kulfi",
    category: "desserts",
    price: 650,
    tagline: "Slow-reduced, never whipped.",
    description:
      "Milk reduced for three hours with pistachio and green cardamom, frozen in the traditional mould.",
    images: [IMG.dessert3, IMG.dessert],
    ingredients: ["Milk", "Pistachio", "Green cardamom"],
    prep: 6,
    calories: 380,
    rating: 4.8,
    reviews: 87,
    sold: 430,
  },

  {
    slug: "the-untouch-table-for-two",
    name: "The UNTOUCH Table for Two",
    category: "deals",
    price: 4990,
    discount: 4290,
    tagline: "Four plates, one fire.",
    description:
      "Two signature burgers or a pizza, a charcoal grill plate, parmesan truffle fries and two desserts. Built to be shared slowly.",
    images: [IMG.spread, IMG.biryani],
    ingredients: ["2 mains", "1 grill plate", "Fries", "2 desserts"],
    featured: true,
    popular: true,
    badge: "Save Rs 700",
    prep: 35,
    rating: 4.9,
    reviews: 68,
    sold: 240,
  },
  {
    slug: "biryani-night-box",
    name: "Biryani Night Box",
    category: "deals",
    price: 1790,
    discount: 1490,
    tagline: "Layered, sealed, opened at your door.",
    description:
      "Aged basmati layered with slow-cooked beef, saffron and fried onion. Served with raita and salan.",
    images: [IMG.biryani, IMG.spread],
    ingredients: ["Aged basmati", "Beef", "Saffron", "Fried onion", "Raita"],
    popular: true,
    prep: 30,
    calories: 880,
    rating: 4.8,
    reviews: 164,
    sold: 690,
  },
];

export const DEMO_CATEGORIES: Category[] = categoryDrafts.map((category, index) => {
  const id = category.id;
  return {
    id,
    slug: id,
    name: category.name,
    description: category.description,
    image: category.image,
    order: index + 1,
    active: true,
  };
});

export const DEMO_PRODUCTS: Product[] = drafts.map((draft) => {
  const category = DEMO_CATEGORIES.find((entry) => entry.id === draft.category)!;
  return {
    id: `demo_${draft.slug}`,
    slug: draft.slug,
    name: draft.name,
    tagline: draft.tagline,
    description: draft.description,
    images: draft.images,
    price: draft.price,
    discountPrice: draft.discount ?? null,
    categoryId: category.id,
    categoryName: category.name,
    ingredients: draft.ingredients,
    available: true,
    featured: Boolean(draft.featured),
    popular: Boolean(draft.popular),
    badge: draft.badge ?? null,
    variants: draft.variants ?? [],
    addons: draft.addons ?? [],
    prepTime: draft.prep ?? 20,
    calories: draft.calories ?? null,
    rating: draft.rating ?? 4.7,
    reviewCount: draft.reviews ?? 0,
    soldCount: draft.sold ?? 0,
    createdAt: STAMP,
    updatedAt: STAMP,
  };
});

export const DEMO_BANNERS: Banner[] = [
  {
    id: "demo_fire_menu",
    title: "The winter fire menu",
    subtitle:
      "Short ribs smoked for six hours, seekh rested overnight, and a burnt honey glaze we are quietly proud of. Available until the coals run out.",
    image: "/img/dish-shawarma.webp",
    ctaLabel: "See the fire menu",
    ctaHref: "/menu",
    placement: "home",
    active: true,
    order: 1,
  },
  {
    id: "demo_table_for_two",
    title: "A table for two, at home",
    subtitle:
      "Four plates built to be shared slowly — two signatures, a grill plate, truffle fries and dessert. Save Rs 700 when you order the set.",
    image: "/img/hero-plate.webp",
    ctaLabel: "Order the set",
    ctaHref: "/menu/the-untouch-table-for-two",
    placement: "home",
    active: true,
    order: 2,
  },
  {
    id: "demo_late_kitchen",
    title: "The kitchen stays open until 11:30",
    subtitle:
      "Charcoal wings, cold brew and burnt Basque cheesecake — the late menu, delivered untouched.",
    image: "/img/dish-chicken-2.webp",
    ctaLabel: "Browse the late menu",
    ctaHref: "/menu?filter=featured",
    placement: "menu",
    active: true,
    order: 3,
  },
];

export function demoProductBySlug(slug: string) {
  return DEMO_PRODUCTS.find((product) => product.slug === slug) ?? null;
}

export const DEMO_SETTINGS: RestaurantSettings = DEFAULT_SETTINGS;

const now = Date.now();
const ago = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

function orderNumberFor(createdAt: string, suffix: string) {
  const date = new Date(createdAt);
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate(),
  ).padStart(2, "0")}`;
  return `UT-${stamp}-${suffix}`;
}

function demoItem(
  slug: string,
  quantity: number,
  options?: { variantName?: string | null; addons?: { name: string; price: number }[] },
): OrderItem {
  const product = DEMO_PRODUCTS.find((entry) => entry.slug === slug) ?? DEMO_PRODUCTS[0];
  const addons = options?.addons ?? [];
  const unitPrice =
    (product.discountPrice && product.discountPrice < product.price
      ? product.discountPrice
      : product.price) + addons.reduce((sum, addon) => sum + addon.price, 0);
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0] ?? "",
    unitPrice,
    quantity,
    variantName: options?.variantName ?? null,
    addons,
    lineTotal: unitPrice * quantity,
  };
}

const DEMO_ADDRESS: OrderAddress = {
  label: "Home",
  fullName: "Ayesha Khan",
  phone: "+92 300 1234567",
  house: "House 14-C",
  street: "Khayaban-e-Shahbaz",
  area: "DHA Phase VI",
  city: "Karachi",
  postalCode: "75500",
  instructions: "Ring the bell twice, the gate sticks.",
};

export const DEMO_CUSTOMERS: UserProfile[] = [
  {
    uid: "demo_customer_ayesha",
    email: "ayesha.khan@example.com",
    displayName: "Ayesha Khan",
    photoURL: "",
    phone: "+92 300 1234567",
    createdAt: ago(60 * 24 * 180),
    notificationPrefs: { orderUpdates: true, offers: true },
  },
  {
    uid: "demo_customer_bilal",
    email: "bilal.raza@example.com",
    displayName: "Bilal Raza",
    photoURL: "",
    phone: "+92 321 7654321",
    createdAt: ago(60 * 24 * 96),
    notificationPrefs: { orderUpdates: true, offers: false },
  },
  {
    uid: "demo_customer_hina",
    email: "hina.siddiqui@example.com",
    displayName: "Hina Siddiqui",
    photoURL: "",
    phone: "+92 333 9876543",
    createdAt: ago(60 * 24 * 54),
    notificationPrefs: { orderUpdates: true, offers: true },
  },
  {
    uid: "demo_customer_daniyal",
    email: "daniyal.qureshi@example.com",
    displayName: "Daniyal Qureshi",
    photoURL: "",
    phone: "+92 345 2223344",
    createdAt: ago(60 * 24 * 21),
    notificationPrefs: { orderUpdates: false, offers: true },
  },
];

export const DEMO_COUPONS: Coupon[] = [
  {
    id: "demo_coupon_untouch10",
    code: "UNTOUCH10",
    type: "percent",
    value: 10,
    minOrder: 1500,
    expiresAt: null,
    active: true,
    usageLimit: null,
    usedCount: 148,
    createdAt: STAMP,
  },
  {
    id: "demo_coupon_fire500",
    code: "FIRE500",
    type: "fixed",
    value: 500,
    minOrder: 3000,
    expiresAt: new Date(now + 21 * 24 * 60 * 60_000).toISOString(),
    active: true,
    usageLimit: 250,
    usedCount: 61,
    createdAt: STAMP,
  },
  {
    id: "demo_coupon_welcome15",
    code: "WELCOME15",
    type: "percent",
    value: 15,
    minOrder: 0,
    expiresAt: new Date(now + 60 * 24 * 60 * 60_000).toISOString(),
    active: true,
    usageLimit: 100,
    usedCount: 24,
    createdAt: STAMP,
  },
  {
    id: "demo_coupon_table700",
    code: "TABLE700",
    type: "fixed",
    value: 700,
    minOrder: 5000,
    expiresAt: null,
    active: true,
    usageLimit: null,
    usedCount: 39,
    createdAt: STAMP,
  },
  {
    id: "demo_coupon_lastcall20",
    code: "LASTCALL20",
    type: "percent",
    value: 20,
    minOrder: 2500,
    expiresAt: ago(60 * 24 * 12),
    active: false,
    usageLimit: 50,
    usedCount: 50,
    createdAt: STAMP,
  },
];

export const DEMO_REVIEWS: Review[] = [
  {
    id: "demo_review_1",
    productId: "demo_untouch-signature-burger",
    productName: "The UNTOUCH Burger",
    userId: "demo_customer_ayesha",
    userName: "Ayesha Khan",
    rating: 5,
    comment:
      "The burnt onion jam is the whole personality of this burger. Arrived hot, bun still soft, and the pickles cut through the smoke perfectly.",
    status: "approved",
    createdAt: ago(60 * 24 * 9),
  },
  {
    id: "demo_review_2",
    productId: "demo_charcoal-short-ribs",
    productName: "Charcoal Short Ribs",
    userId: "demo_customer_bilal",
    userName: "Bilal Raza",
    rating: 5,
    comment:
      "Six hours of smoke you can actually taste. The tamarind glaze keeps it from being heavy. Easily the best plate on the menu.",
    status: "approved",
    createdAt: ago(60 * 24 * 14),
  },
  {
    id: "demo_review_3",
    productId: "demo_burrata-margherita",
    productName: "Burrata Margherita",
    userId: "demo_customer_hina",
    userName: "Hina Siddiqui",
    rating: 4,
    comment:
      "The base is properly blistered and the burrata is generous. I would have liked a little more basil, but we finished every slice.",
    status: "approved",
    createdAt: ago(60 * 24 * 6),
  },
  {
    id: "demo_review_4",
    productId: "demo_parmesan-truffle-fries",
    productName: "Parmesan Truffle Fries",
    userId: "demo_customer_daniyal",
    userName: "Daniyal Qureshi",
    rating: 5,
    comment: "Ordered as a side, ate them as a main. Triple-cooked and still crisp after delivery.",
    status: "approved",
    createdAt: ago(60 * 24 * 3),
  },
  {
    id: "demo_review_5",
    productId: "demo_salted-caramel-brownie",
    productName: "Salted Caramel Brownie",
    userId: "demo_customer_ayesha",
    userName: "Ayesha Khan",
    rating: 5,
    comment: "Warm centre, cold cream, proper dark chocolate. The brittle on top is a nice touch.",
    status: "approved",
    createdAt: ago(60 * 24 * 2),
  },
  {
    id: "demo_review_6",
    productId: "demo_twenty-hour-seekh",
    productName: "Twenty-Hour Seekh",
    userId: "demo_customer_bilal",
    userName: "Bilal Raza",
    rating: 5,
    comment: "Soft, smoky and genuinely spicy. The sumac onions are worth adding.",
    status: "approved",
    createdAt: ago(60 * 24 * 5),
  },
  {
    id: "demo_review_7",
    productId: "demo_charcoal-chicken-wings",
    productName: "Charcoal Chicken Wings",
    userId: "demo_customer_hina",
    userName: "Hina Siddiqui",
    rating: 4,
    comment: "Sticky and blistered, exactly as described. Portion is smaller than I expected for the price.",
    status: "approved",
    createdAt: ago(60 * 24 * 12),
  },
  {
    id: "demo_review_8",
    productId: "demo_beef-short-rib-ragu",
    productName: "Short Rib Ragu",
    userId: "demo_customer_daniyal",
    userName: "Daniyal Qureshi",
    rating: 5,
    comment: "The pasta is rolled properly and the ragu tastes like it spent the afternoon on the stove. Portion could feed two.",
    status: "approved",
    createdAt: ago(60 * 24 * 8),
  },
  {
    id: "demo_review_9",
    productId: "demo_truffle-cacio-e-pepe",
    productName: "Truffle Cacio e Pepe",
    userId: "demo_customer_ayesha",
    userName: "Ayesha Khan",
    rating: 4,
    comment: "Rich and peppery. Arrived a touch clumped, but the flavour was there — would order again.",
    status: "pending",
    createdAt: ago(60 * 22),
  },
  {
    id: "demo_review_10",
    productId: "demo_biryani-night-box",
    productName: "Biryani Night Box",
    userId: "demo_customer_bilal",
    userName: "Bilal Raza",
    rating: 5,
    comment: "Layered properly, not just mixed. The raita is cold and the salan has real depth.",
    status: "pending",
    createdAt: ago(60 * 8),
  },
];

interface DemoOrderDraft {
  suffix: string;
  status: OrderStatus;
  paymentStatus: Order["paymentStatus"];
  customerIndex: number;
  minutesAgo: number;
  items: OrderItem[];
  couponCode?: string;
  discount?: number;
  notes?: string;
  adminNotes?: string;
}

const orderDrafts: DemoOrderDraft[] = [
  {
    suffix: "K4T2",
    status: "preparing",
    paymentStatus: "unpaid",
    customerIndex: 0,
    minutesAgo: 26,
    items: [
      demoItem("untouch-signature-burger", 2, { variantName: "Double patty" }),
      demoItem("parmesan-truffle-fries", 2),
      demoItem("burnt-orange-mojito", 2),
    ],
    couponCode: "UNTOUCH10",
    discount: 590,
    notes: "Please pack the fries separately.",
    adminNotes: "Allergy note checked with the pass.",
  },
  {
    suffix: "M8Q1",
    status: "out_for_delivery",
    paymentStatus: "unpaid",
    customerIndex: 1,
    minutesAgo: 48,
    items: [
      demoItem("burrata-margherita", 1, { variantName: "12 inch" }),
      demoItem("charcoal-chicken-wings", 1),
      demoItem("basque-cheesecake", 2),
    ],
    notes: "Leave with the concierge if we do not answer.",
  },
  {
    suffix: "R9L3",
    status: "delivered",
    paymentStatus: "paid",
    customerIndex: 2,
    minutesAgo: 24 * 60 + 90,
    items: [
      demoItem("charcoal-short-ribs", 1),
      demoItem("smoked-brisket-plate", 1),
      demoItem("saffron-lemonade", 2),
      demoItem("salted-caramel-brownie", 2),
    ],
  },
  {
    suffix: "T3B7",
    status: "delivered",
    paymentStatus: "paid",
    customerIndex: 3,
    minutesAgo: 2 * 24 * 60 + 40,
    items: [demoItem("the-untouch-table-for-two", 1), demoItem("karachi-cold-brew", 2)],
    couponCode: "TABLE700",
    discount: 700,
  },
  {
    suffix: "P2W8",
    status: "pending",
    paymentStatus: "unpaid",
    customerIndex: 0,
    minutesAgo: 4,
    items: [demoItem("twenty-hour-seekh", 2), demoItem("loaded-charcoal-fries", 1)],
  },
  {
    suffix: "C6D4",
    status: "cancelled",
    paymentStatus: "refunded",
    customerIndex: 1,
    minutesAgo: 4 * 24 * 60,
    items: [demoItem("truffle-mushroom-pizza", 1), demoItem("rigatoni-arrabbiata", 1)],
    adminNotes: "Customer cancelled before the pass started.",
  },
];

const STATUS_SEQUENCE: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

export const DEMO_ORDERS: Order[] = orderDrafts.map((draft) => {
  const createdAt = ago(draft.minutesAgo);
  const customer = DEMO_CUSTOMERS[draft.customerIndex];
  const subtotal = draft.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = draft.discount ?? 0;
  const deliveryFee = subtotal - discount >= 6000 ? 0 : 249;
  const reachedIndex = STATUS_SEQUENCE.indexOf(draft.status);
  const history =
    draft.status === "cancelled"
      ? [
          { status: "pending" as OrderStatus, at: createdAt, by: "customer" as const },
          { status: "cancelled" as OrderStatus, at: ago(Math.max(1, draft.minutesAgo - 3)), by: "admin" as const },
        ]
      : STATUS_SEQUENCE.slice(0, Math.max(1, reachedIndex + 1)).map((status, index) => ({
          status,
          at: new Date(new Date(createdAt).getTime() + index * 11 * 60_000).toISOString(),
          by: (index === 0 ? "customer" : "admin") as "customer" | "admin",
        }));

  return {
    id: `demo_order_${draft.suffix.toLowerCase()}`,
    orderNumber: orderNumberFor(createdAt, draft.suffix),
    userId: customer.uid,
    customer: { name: customer.displayName, email: customer.email, phone: customer.phone },
    items: draft.items,
    subtotal,
    discount,
    deliveryFee,
    total: subtotal - discount + deliveryFee,
    couponCode: draft.couponCode ?? null,
    address: { ...DEMO_ADDRESS, fullName: customer.displayName, phone: customer.phone },
    paymentMethod: "cod",
    paymentStatus: draft.paymentStatus,
    paymentProvider: null,
    paymentReference: null,
    status: draft.status,
    notes: draft.notes ?? "",
    adminNotes: draft.adminNotes ?? "",
    statusHistory: history,
    createdAt,
    updatedAt: history[history.length - 1]?.at ?? createdAt,
  };
});

/** Sample artwork available to the admin demo image picker. */
export const DEMO_IMAGE_LIBRARY: string[] = Array.from(
  new Set([...DEMO_PRODUCTS.flatMap((product) => product.images), ...DEMO_BANNERS.map((banner) => banner.image)]),
).filter(Boolean);
