/**
 * Static site configuration — values that don't change per environment.
 * Business-specific values (name, phone, address) should come from
 * the CMS (StoreSetting table) at runtime, not from this file.
 */

export const siteConfig = {
  name: "Radha Krishna Panchha Dhatu",
  shortName: "RK Panchadhatu",
  description:
    "Premium Panchadhatu and steel jewellery from Butwal, Nepal. Delivery throughout Nepal.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Store defaults (overridden by CMS settings in production)
  phone: "+977 984-670-3068",
  phoneAlt: "+977 976-367-8419",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779846703068",
  address: {
    line1: "Yogikuti, Santichowk",
    line2: "Tilottama Path",
    city: "Butwal",
    district: "Rupandehi",
    province: "Lumbini Province",
    country: "Nepal",
  },
  currency: "NPR" as const,
  timezone: "Asia/Kathmandu",

  social: {
    // Update these URLs via CMS settings
    facebook: "https://www.facebook.com/p/Radhahakrishna-panchadhatu-Butwal-Yogikuti-Santichock-61594098656803/",
    tiktok: "", // Set in CMS
  },
} as const;
