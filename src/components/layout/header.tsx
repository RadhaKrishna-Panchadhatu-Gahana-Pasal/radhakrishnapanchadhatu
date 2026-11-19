import Link from "next/link";
import { Search, ShoppingBag, User, Menu, MessageCircle } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="container-store">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Mobile menu button */}
          <button
            aria-label="Open navigation menu"
            className="md:hidden p-2 text-primary-text hover:text-gold-accent transition-colors"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="flex flex-col items-center md:items-start"
            aria-label="Radha Krishna Panchha Dhatu — Home"
          >
            <span className="font-heading text-lg md:text-2xl text-primary-text leading-tight tracking-wide">
              Radha Krishna
            </span>
            <span className="text-xs md:text-sm text-gold-accent tracking-widest uppercase">
              Panchha Dhatu
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/catalog">Catalogue</NavLink>
            <NavLink href="/new-arrivals">New Arrivals</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <IconButton href="/search" label="Search products">
              <Search size={20} />
            </IconButton>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779846703068"}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="hidden md:flex p-2 text-primary-text hover:text-gold-accent transition-colors"
            >
              <MessageCircle size={20} />
            </a>
            <IconButton href="/account" label="My account">
              <User size={20} />
            </IconButton>
            <IconButton href="/cart" label="Shopping cart">
              <div className="relative">
                <ShoppingBag size={20} />
                {/* TODO: Cart item count badge */}
              </div>
            </IconButton>
          </div>

        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-primary-text hover:text-gold-accent transition-colors"
    >
      {children}
    </Link>
  );
}

function IconButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="p-2 text-primary-text hover:text-gold-accent transition-colors"
    >
      {children}
    </Link>
  );
}
