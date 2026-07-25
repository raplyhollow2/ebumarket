import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Zyra — Circular fashion",
    short_name: "Zyra",
    description:
      "Teen marketplace and free donation hub with Verified by Zyra listings.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#f7f4ef",
    theme_color: "#1c3024",
    categories: ["shopping", "lifestyle", "social"],
    // Keep false so Chrome prefers installing this web app
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
