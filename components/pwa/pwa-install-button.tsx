'use client';

import { useState } from 'react';
import { Download, Share, Smartphone } from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';

export function PWAInstallButton({ compact = false }: { compact?: boolean }) {
  const { canInstallPwa, isInstalledPwa, isIosDevice, promptInstallPwa } = useStore();
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (isInstalledPwa) {
    return null;
  }

  if (canInstallPwa) {
    return (
      <button
        type="button"
        onClick={() => promptInstallPwa()}
        className={
          compact
            ? 'inline-flex items-center gap-1.5 text-xs font-medium text-gold-deep underline underline-offset-4 hover:text-ink'
            : 'inline-flex items-center gap-2 rounded-full border border-gold/50 bg-sand px-4 py-2 text-xs font-medium text-ink transition hover:border-gold hover:text-gold-deep'
        }
      >
        <Download className="h-3.5 w-3.5 text-gold-deep" />
        Install App
      </button>
    );
  }

  if (isIosDevice) {
    return (
      <div className="inline-block">
        <button
          type="button"
          onClick={() => setShowIosGuide((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-deep underline underline-offset-4"
        >
          <Smartphone className="h-3.5 w-3.5" />
          Add to Home Screen
        </button>
        {showIosGuide && (
          <p className="mt-2 max-w-xs rounded-xl border border-line bg-sand p-3 text-xs leading-relaxed text-ink">
            Tap <Share className="inline h-3.5 w-3.5" /> Share in Safari and select{' '}
            <strong>Add to Home Screen</strong> to install Radhakrishna.
          </p>
        )}
      </div>
    );
  }

  return null;
}
