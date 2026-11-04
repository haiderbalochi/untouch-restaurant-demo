import type { RestaurantSettings } from "@/lib/types";

/**
 * Neutral defaults shared by the browser and server route handlers.
 * Kept free of any "use client" directive so server code can import it.
 */
export const DEFAULT_SETTINGS: RestaurantSettings = {
  name: "UNTOUCH",
  logoUrl: "",
  phone: "+92 300 000 0000",
  email: "hello@untouch.pk",
  address: "Plot 24, Khayaban-e-Shahbaz, DHA Phase VI, Karachi",
  deliveryFee: 249,
  minOrder: 1200,
  openTime: "12:00",
  closeTime: "23:30",
  isOpen: true,
  socials: { instagram: "", facebook: "", tiktok: "" },
  content: {
    heroKicker: "Karachi · Slow fire kitchen",
    heroTitle: "Nothing ordinary touches your plate.",
    heroSubtitle:
      "Twenty-hour marinades, hand-stretched dough and a fire we never rush. UNTOUCH is a quiet obsession with flavour — now at your door.",
    storyTitle: "A kitchen that refuses shortcuts.",
    storyBody:
      "We started with one tandoor, six seats and a stubborn idea: that a burger could carry the soul of a charcoal grill. A decade later, everything at UNTOUCH is still made the long way — dough proved overnight, spice ground each morning, sauces built from scratch.",
    announcement: "Complimentary dessert on orders above Rs 6,000 — this week only.",
  },
};

export const CONFIG_MESSAGE =
  "Live data is offline — connect your Firebase project to load the full UNTOUCH catalogue.";
