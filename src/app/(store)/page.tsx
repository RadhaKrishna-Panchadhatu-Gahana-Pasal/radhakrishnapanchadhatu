import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { CategorySection } from "@/components/home/category-section";
import { NewArrivalsSection } from "@/components/home/new-arrivals-section";
import { FeaturedSection } from "@/components/home/featured-section";
import { BrandStorySection } from "@/components/home/brand-story-section";
import { PromoBannerSection } from "@/components/home/promo-banner-section";
import { CustomOrderCta } from "@/components/home/custom-order-cta";
import { StoreVisitSection } from "@/components/home/store-visit-section";

export const metadata: Metadata = {
  title: "Radha Krishna Panchha Dhatu | Panchadhatu & Steel Jewellery from Butwal",
  description:
    "Discover premium Panchadhatu and steel jewellery. Shop online or visit our store at Yogikuti, Santichowk, Butwal. Delivery throughout Nepal.",
};

// Revalidate homepage every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <NewArrivalsSection />
      <FeaturedSection />
      <BrandStorySection />
      <PromoBannerSection />
      <CustomOrderCta />
      <StoreVisitSection />
    </>
  );
}
