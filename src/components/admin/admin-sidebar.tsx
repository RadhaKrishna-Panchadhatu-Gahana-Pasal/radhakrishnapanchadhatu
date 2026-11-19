import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Archive,
  ShoppingBag,
  Users,
  Star,
  Image,
  Megaphone,
  FileText,
  Settings,
  TrendingUp,
  Truck,
  Tag,
  CreditCard,
  Bell,
  Shield,
  Layers,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: FolderOpen },
      { label: "Collections", href: "/admin/collections", icon: Archive },
      { label: "Inventory", href: "/admin/inventory", icon: Layers },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Coupons", href: "/admin/coupons", icon: Tag },
      { label: "Shipping", href: "/admin/shipping", icon: Truck },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Banners", href: "/admin/banners", icon: Image },
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { label: "Homepage", href: "/admin/homepage", icon: LayoutDashboard },
      { label: "Pages", href: "/admin/pages", icon: FileText },
      { label: "Media", href: "/admin/media", icon: Image },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Users & Roles", href: "/admin/users", icon: Shield },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: TrendingUp },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col bg-[#25231F] text-[#C9C3B8] flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <p className="font-heading text-base text-white">RK Panchadhatu</p>
        <p className="text-xs text-[#B08A45] tracking-widest uppercase">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Admin navigation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#77736B] px-3 mb-2">
              {section.label}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Icon size={16} className="flex-shrink-0 text-[#B08A45]" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <Link
          href="/"
          className="text-xs text-[#77736B] hover:text-[#B08A45] transition-colors"
        >
          ← Back to Store
        </Link>
      </div>
    </aside>
  );
}
