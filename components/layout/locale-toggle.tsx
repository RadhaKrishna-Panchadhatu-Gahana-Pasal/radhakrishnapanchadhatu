'use client';

import { Languages } from 'lucide-react';
import { useLocale } from '@/components/providers/locale-provider';
import { LOCALE_LABELS } from '@/lib/i18n/dictionary';

/** English ⇄ नेपाली toggle for the storefront chrome. */
export function LocaleToggle() {
  const { locale, toggleLocale, t } = useLocale();
  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={`${t('nav.language')}: ${locale === 'en' ? 'Nepali' : 'English'}`}
      title={t('nav.language')}
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-2 text-xs font-medium text-ink transition hover:bg-sand hover:text-gold-deep"
    >
      <Languages aria-hidden="true" className="h-[17px] w-[17px]" />
      <span className="tabular-nums">{LOCALE_LABELS[locale]}</span>
    </button>
  );
}
