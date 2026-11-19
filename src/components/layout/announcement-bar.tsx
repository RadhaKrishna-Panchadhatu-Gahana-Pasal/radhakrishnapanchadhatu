"use client";

import { useState } from "react";
import { X } from "lucide-react";

// TODO: Fetch announcements from CMS/database
const DEMO_ANNOUNCEMENT =
  "Free delivery on orders above NPR 2,000 | Panchadhatu & Steel Jewellery from Butwal";

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="banner"
      className="relative bg-[#B08A45] text-white text-sm py-2 px-10 text-center overflow-hidden"
      style={{ "--marquee-duration": "30s" } as React.CSSProperties}
    >
      {/* Scrolling text */}
      <div
        className="inline-flex gap-16 animate-marquee whitespace-nowrap"
        aria-label={DEMO_ANNOUNCEMENT}
      >
        <span>{DEMO_ANNOUNCEMENT}</span>
        <span aria-hidden="true">{DEMO_ANNOUNCEMENT}</span>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
