'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  getFirebaseAuth,
  getGoogleAuthProvider,
  initFirebaseClient,
  syncUserProfileToFirestore,
  testFirestoreConnection,
  toggleWishlistInFirestore,
  type FirebaseClientConfig,
} from '@/lib/firebase/client';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  material: string;
  variantId?: string;
  variantLabel?: string;
  unitPricePaisa: number;
  quantity: number;
  imageUrl: string;
}

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface StoreContextValue {
  cart: CartItem[];
  cartCount: number;
  cartSubtotalPaisa: number;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeFromCart: (productId: string, variantId: string | undefined) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  user: User | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  isOnline: boolean;
  canInstallPwa: boolean;
  isInstalledPwa: boolean;
  isIosDevice: boolean;
  promptInstallPwa: () => Promise<boolean>;
  cookiePrefs: CookiePreferences | null;
  cookieModalOpen: boolean;
  setCookieModalOpen: (open: boolean) => void;
  saveCookiePrefs: (prefs: { analytics: boolean; marketing: boolean }) => void;
  mapsQuotaExceeded: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_STORAGE_KEY = 'rkp_cart_v1';
const WISHLIST_STORAGE_KEY = 'rkp_wishlist_v1';
const COOKIE_STORAGE_KEY = 'rkp_cookie_consent_v1';

export function StoreProvider({
  children,
  firebaseConfig = null,
}: {
  children: React.ReactNode;
  firebaseConfig?: FirebaseClientConfig | null;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalledPwa, setIsInstalledPwa] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);

  const [cookiePrefs, setCookiePrefs] = useState<CookiePreferences | null>(null);
  const [cookieModalOpen, setCookieModalOpen] = useState(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  // Hydrate cart, wishlist, cookie consent & register SW
  useEffect(() => {
    try {
      const rawCart = localStorage.getItem(CART_STORAGE_KEY);
      if (rawCart) {
        const parsed = JSON.parse(rawCart);
        if (Array.isArray(parsed)) setCart(parsed);
      }
      const rawWish = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (rawWish) {
        const parsed = JSON.parse(rawWish);
        if (Array.isArray(parsed)) setWishlist(parsed);
      }
      const rawCookie = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (rawCookie) {
        setCookiePrefs(JSON.parse(rawCookie));
      }
    } catch {
      // ignore storage read errors
    }
    setHydrated(true);

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const ua = window.navigator.userAgent;
      setIsIosDevice(/iphone|ipad|ipod/i.test(ua));
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        Boolean((window.navigator as { standalone?: boolean }).standalone);
      setIsInstalledPwa(standalone);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist, hydrated]);

  // Network & PWA listeners
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setIsInstalledPwa(true);
      setInstallPrompt(null);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  // Two-tier Google Maps Demo Key Quota Defense
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleQuotaEvent = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaEvent);

    const win = window as Window & { gm_authFailure?: () => void };
    const prevAuthFailure = win.gm_authFailure;
    win.gm_authFailure = () => {
      setMapsQuotaExceeded(true);
      if (typeof prevAuthFailure === 'function') prevAuthFailure();
    };

    const origConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const joined = args.map((a) => String(a ?? '')).join(' ');
      if (
        joined.includes('OverQuotaMapError') ||
        joined.includes('QuotaExceededError') ||
        joined.includes('OVER_QUERY_LIMIT') ||
        joined.includes('RESOURCE_EXHAUSTED')
      ) {
        setMapsQuotaExceeded(true);
      }
      origConsoleError.apply(console, args);
    };

    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaEvent);
      win.gm_authFailure = prevAuthFailure;
      console.error = origConsoleError;
    };
  }, []);

  const fbApiKey = firebaseConfig?.apiKey || '';
  const fbProjectId = firebaseConfig?.projectId || '';
  const fbAppId = firebaseConfig?.appId || '';
  const fbAuthDomain = firebaseConfig?.authDomain || '';
  const fbDatabaseId = firebaseConfig?.firestoreDatabaseId || '';
  const fbStorageBucket = firebaseConfig?.storageBucket || '';
  const fbMessagingSenderId = firebaseConfig?.messagingSenderId || '';
  const fbMeasurementId = firebaseConfig?.measurementId || '';

  // Firebase Auth listener
  useEffect(() => {
    const resolvedConfig: FirebaseClientConfig | null =
      fbApiKey && fbProjectId && fbAppId
        ? {
            apiKey: fbApiKey,
            projectId: fbProjectId,
            appId: fbAppId,
            authDomain: fbAuthDomain || undefined,
            firestoreDatabaseId: fbDatabaseId || undefined,
            storageBucket: fbStorageBucket || undefined,
            messagingSenderId: fbMessagingSenderId || undefined,
            measurementId: fbMeasurementId || undefined,
          }
        : null;

    const { auth } = initFirebaseClient(resolvedConfig);
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
      if (nextUser) {
        testFirestoreConnection().catch(() => {});
      }
    });
    return () => unsub();
  }, [
    fbApiKey,
    fbProjectId,
    fbAppId,
    fbAuthDomain,
    fbDatabaseId,
    fbStorageBucket,
    fbMessagingSenderId,
    fbMeasurementId,
  ]);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (c) => c.productId === item.productId && (c.variantId || '') === (item.variantId || '')
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(25, next[idx].quantity + item.quantity),
        };
        return next;
      }
      return [...prev, item];
    });
    setCartDrawerOpen(true);
  }, []);

  const updateCartQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) => {
      setCart((prev) => {
        if (quantity <= 0) {
          return prev.filter(
            (c) => !(c.productId === productId && (c.variantId || '') === (variantId || ''))
          );
        }
        return prev.map((c) =>
          c.productId === productId && (c.variantId || '') === (variantId || '')
            ? { ...c, quantity: Math.min(25, quantity) }
            : c
        );
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string, variantId: string | undefined) => {
    setCart((prev) =>
      prev.filter(
        (c) => !(c.productId === productId && (c.variantId || '') === (variantId || ''))
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
        if (user) {
          toggleWishlistInFirestore(user.uid, productId, !exists).catch(() => {});
        }
        return next;
      });
    },
    [user]
  );

  const signInWithGoogle = useCallback(async () => {
    const activeAuth = getFirebaseAuth();
    const provider = getGoogleAuthProvider();
    if (!activeAuth || !provider) {
      throw new Error(
        'Customer Google Sign-In is not configured for this environment yet. Guest checkout and order tracking remain available.'
      );
    }

    const result = await signInWithPopup(activeAuth, provider);
    if (result.user) {
      await testFirestoreConnection();
      await syncUserProfileToFirestore({
        uid: result.user.uid,
        fullName: result.user.displayName || 'Store Guest',
        email: result.user.email || '',
      }).catch(() => {});
    }
  }, []);

  const signOutUser = useCallback(async () => {
    const activeAuth = getFirebaseAuth();
    if (activeAuth) {
      await signOut(activeAuth);
    }
  }, []);

  const promptInstallPwa = useCallback(async () => {
    if (!installPrompt) return false;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      return true;
    }
    return false;
  }, [installPrompt]);

  const saveCookiePrefs = useCallback((prefs: { analytics: boolean; marketing: boolean }) => {
    const next: CookiePreferences = {
      essential: true,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      updatedAt: new Date().toISOString(),
    };
    setCookiePrefs(next);
    setCookieModalOpen(false);
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotalPaisa = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPricePaisa * item.quantity, 0),
    [cart]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      cartCount,
      cartSubtotalPaisa,
      cartDrawerOpen,
      setCartDrawerOpen,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      wishlist,
      toggleWishlist,
      user,
      authLoading,
      signInWithGoogle,
      signOutUser,
      isOnline,
      canInstallPwa: Boolean(installPrompt),
      isInstalledPwa,
      isIosDevice,
      promptInstallPwa,
      cookiePrefs,
      cookieModalOpen,
      setCookieModalOpen,
      saveCookiePrefs,
      mapsQuotaExceeded,
    }),
    [
      cart,
      cartCount,
      cartSubtotalPaisa,
      cartDrawerOpen,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      wishlist,
      toggleWishlist,
      user,
      authLoading,
      signInWithGoogle,
      signOutUser,
      isOnline,
      installPrompt,
      isInstalledPwa,
      isIosDevice,
      promptInstallPwa,
      cookiePrefs,
      cookieModalOpen,
      saveCookiePrefs,
      mapsQuotaExceeded,
    ]
  );

  return (
    <StoreContext.Provider value={value}>
      {mapsQuotaExceeded && (
        <div
          role="alert"
          className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-950"
        >
          Google Maps Platform quota reached. If you are the app owner,{' '}
          <a
            href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold hover:text-gold-deep"
          >
            visit maps developer site for instructions to update your account.
          </a>
        </div>
      )}
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
