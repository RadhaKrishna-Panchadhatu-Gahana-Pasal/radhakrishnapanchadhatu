import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Radha Krishna Panchha Dhatu",
    short_name: "RK Panchadhatu",
    description:
      "Premium Panchadhatu and steel jewellery from Butwal, Nepal.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F5F0",
    theme_color: "#B08A45",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [],
    categories: ["shopping", "lifestyle"],
  };
}
