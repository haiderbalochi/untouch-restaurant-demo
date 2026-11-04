import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0a0908",
    theme_color: "#0a0908",
    lang: "en",
    dir: "ltr",
    categories: ["food", "shopping", "lifestyle"],
    prefer_related_applications: false,
    // Lets Chrome's getInstalledRelatedApps() confirm an existing install when
    // the customer opens the website in a normal browser tab.
    related_applications: [
      {
        platform: "webapp",
        url: `${siteUrl.replace(/\/$/, "")}/manifest.webmanifest`,
        id: "/",
      },
    ],
    launch_handler: {
      client_mode: "navigate-existing",
    },
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      {
        src: "/icons/monochrome-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "monochrome",
      },
    ],
    shortcuts: [
      {
        name: "Browse the menu",
        short_name: "Menu",
        description: "Every dish, freshly fired",
        url: "/menu",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Your cart",
        short_name: "Cart",
        description: "Finish your order",
        url: "/cart",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Order history",
        short_name: "Orders",
        description: "Track an order or reorder",
        url: "/account/orders",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
