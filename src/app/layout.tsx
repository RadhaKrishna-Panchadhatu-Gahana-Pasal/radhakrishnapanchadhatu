import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const fontHeading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Radha Krishna Panchha Dhatu | Panchadhatu & Steel Jewellery",
    template: "%s | Radha Krishna Panchha Dhatu",
  },
  description:
    "Premium Panchadhatu and steel jewellery from Butwal, Nepal. Discover traditional ornaments crafted with five-metal alloy. Shop online or visit our store at Yogikuti, Santichowk.",
  keywords: [
    "panchadhatu jewellery",
    "panchdhatu ornaments",
    "steel jewellery Nepal",
    "jewellery Butwal",
    "online jewellery Nepal",
    "traditional ornaments",
  ],
  authors: [{ name: "Radha Krishna Panchha Dhatu" }],
  creator: "Radha Krishna Panchha Dhatu",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_NP",
    siteName: "Radha Krishna Panchha Dhatu",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#B08A45",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontHeading.variable} ${fontBody.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
