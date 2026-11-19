'use client';

import { WifiOff } from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';

export function OfflineIndicator() {
  const { isOnline } = useStore();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-warning/30 bg-ink px-4 py-2 text-xs font-medium text-sand shadow-soft"
    >
      <WifiOff className="h-3.5 w-3.5 text-gold" />
      <span>Offline mode · Browsing cached catalogue</span>
    </div>
  );
}
