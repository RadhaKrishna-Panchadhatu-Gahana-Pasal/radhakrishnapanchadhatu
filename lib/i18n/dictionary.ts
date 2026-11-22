export type Locale = 'en' | 'ne';

export const LOCALE_STORAGE_KEY = 'rkp_locale';
export const LOCALES: Locale[] = ['en', 'ne'];
export const LOCALE_LABELS: Record<Locale, string> = { en: 'EN', ne: 'ने' };

/**
 * Storefront chrome translations. Catalogue content (product names, CMS copy)
 * stays exactly as the shop enters it — only navigation and shared interface
 * labels are translated, so nothing goes out of sync with the CMS.
 */
const en = {
  'nav.catalog': 'Catalog',
  'nav.newArrivals': 'New Arrivals',
  'nav.customOrder': 'Custom Order',
  'nav.trackOrder': 'Track Order',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.cart': 'Cart',
  'nav.wishlist': 'Wishlist',
  'nav.account': 'Account',
  'nav.admin': 'Admin',
  'nav.adminCms': 'Admin CMS',
  'nav.search': 'Search jewellery',
  'nav.menuOpen': 'Open navigation menu',
  'nav.menuClose': 'Close navigation menu',
  'nav.language': 'Change language',
  'footer.collections': 'Collections',
  'footer.customerCare': 'Customer Care',
  'footer.storePolicies': 'Store & Policies',
  'footer.fullCatalog': 'Full Catalog',
  'footer.steel': 'Steel Jewellery',
  'footer.customOrder': 'Custom Order',
  'footer.trackOrder': 'Track Order',
  'footer.faq': 'FAQ & Care',
  'footer.shipping': 'Shipping & Delivery',
  'footer.returns': 'Returns & Exchanges',
  'footer.install': 'Install App',
  'footer.about': 'About Us',
  'footer.visit': 'Visit Butwal Store',
  'footer.terms': 'Terms & Conditions',
  'footer.privacy': 'Privacy Policy',
  'footer.cookies': 'Cookie Preferences',
  'footer.rights': 'All rights reserved',
} as const;

export type TranslationKey = keyof typeof en;

const ne: Record<TranslationKey, string> = {
  'nav.catalog': 'संग्रह',
  'nav.newArrivals': 'नयाँ आगमन',
  'nav.customOrder': 'अनुकूल अर्डर',
  'nav.trackOrder': 'अर्डर ट्र्याक',
  'nav.about': 'हाम्रोबारे',
  'nav.contact': 'सम्पर्क',
  'nav.cart': 'झोला',
  'nav.wishlist': 'इच्छा सूची',
  'nav.account': 'खाता',
  'nav.admin': 'एडमिन',
  'nav.adminCms': 'एडमिन CMS',
  'nav.search': 'गहना खोज्नुहोस्',
  'nav.menuOpen': 'नेभिगेसन खोल्नुहोस्',
  'nav.menuClose': 'नेभिगेसन बन्द गर्नुहोस्',
  'nav.language': 'भाषा परिवर्तन',
  'footer.collections': 'संग्रहहरू',
  'footer.customerCare': 'ग्राहक सेवा',
  'footer.storePolicies': 'पसल र नीतिहरू',
  'footer.fullCatalog': 'पूरा संग्रह',
  'footer.steel': 'स्टिल गहना',
  'footer.customOrder': 'अनुकूल अर्डर',
  'footer.trackOrder': 'अर्डर ट्र्याक',
  'footer.faq': 'जिज्ञासा र हेरचाह',
  'footer.shipping': 'ढुवानी र डेलिभरी',
  'footer.returns': 'फिर्ता र साटासाट',
  'footer.install': 'एप इन्स्टल',
  'footer.about': 'हाम्रोबारे',
  'footer.visit': 'बुटवल पसल भ्रमण',
  'footer.terms': 'नियम र सर्तहरू',
  'footer.privacy': 'गोपनीयता नीति',
  'footer.cookies': 'कुकी प्राथमिकता',
  'footer.rights': 'सर्वाधिकार सुरक्षित',
};

export const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, ne };

export function translate(locale: Locale, key: TranslationKey): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}
