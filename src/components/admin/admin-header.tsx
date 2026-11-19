import { Bell, User } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <button
          aria-label="Notifications"
          className="p-2 text-secondary-text hover:text-primary-text transition-colors"
        >
          <Bell size={18} />
        </button>
        <button
          aria-label="Admin account"
          className="flex items-center gap-2 text-sm text-secondary-text hover:text-primary-text transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#B08A45]/20 flex items-center justify-center">
            <User size={16} className="text-[#B08A45]" />
          </div>
          <span className="hidden sm:block">Admin</span>
        </button>
      </div>
    </header>
  );
}
