'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '@/components/providers/theme-provider';

const ORDER: ThemePreference[] = ['light', 'dark', 'system'];

const LABELS: Record<ThemePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

/**
 * Cycles Light → Dark → System. The icon shows the current preference, so
 * "System" is visibly different from an explicit light/dark choice.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${LABELS[theme]}. Switch to ${LABELS[next]} theme.`}
      title={`Theme: ${LABELS[theme]} — switch to ${LABELS[next]}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full p-2 text-ink transition hover:bg-sand hover:text-gold-deep ${className}`}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden />
    </button>
  );
}
