'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Lock, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/client';
import { AddressAutocomplete } from '@/components/maps/address-autocomplete';
import { useStore } from '@/components/providers/store-provider';
import { formatNPR } from '@/lib/store/money';
import { saveTrackedOrderToken } from '@/lib/store/order-history';
import type { PaymentMethod } from '@/lib/store/types';
import type { PaymentProviderState } from '@/lib/payments/availability';

const NEPAL_PROVINCES = [
  'Lumbini Province',
  'Bagmati Province',
  'Gandaki Province',
  'Koshi Province',
  'Madhesh Province',
  'Karnali Province',
  'Sudurpashchim Province',
];

interface QuoteState {
  discountPaisa: number;
  deliveryFeePaisa: number;
  estimatedDays: string;
  codAvailable: boolean;
  couponMessage: string | null;
  giftCardPaisa: number;
  giftCardMessage: string | null;
}

interface PendingGatewayOrder {
  orderNumber: string;
  trackingToken: string;
  paymentMethod: PaymentMethod;
  totalPaisa: number;
  providerReference: string;
  paymentUrl?: string;
}

export function CheckoutClient({
  mapsApiKey,
  paymentOptions,
  providers,
}: {
  mapsApiKey: string;
  providers: PaymentProviderState[];
  paymentOptions: {
    codEnabled: boolean;
    esewaEnabled: boolean;
    khaltiEnabled: boolean;
    fonepayEnabled: boolean;
  };
}) {
  const router = useRouter();
  const { cart, cartSubtotalPaisa, clearCart } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('Lumbini Province');
  const [district, setDistrict] = useState('Rupandehi');
  const [municipality, setMunicipality] = useState('Butwal');
  const [ward, setWard] = useState('11');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [giftCardInput, setGiftCardInput] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => {
    const firstSelectableOnline = providers.find(
      (provider) => provider.method !== 'COD' && provider.selectable
    );
    if (firstSelectableOnline) return firstSelectableOnline.method;
    return paymentOptions.codEnabled ? 'COD' : 'FONEPAY';
  });

  const providerFor = (method: PaymentMethod) => providers.find((p) => p.method === method);

  const providerBadge = (method: PaymentMethod) => {
    const status = providerFor(method)?.status;
    if (!status || status === 'LIVE') return null;
    return (
      <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
        {status === 'COMING_SOON' ? 'Coming soon' : 'Sandbox'}
      </span>
    );
  };

  const [quote, setQuote] = useState<QuoteState>({
    discountPaisa: 0,
    deliveryFeePaisa: 0,
    estimatedDays: '1–2 business days',
    codAvailable: paymentOptions.codEnabled,
    couponMessage: null,
    giftCardPaisa: 0,
    giftCardMessage: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gatewayOrder, setGatewayOrder] = useState<PendingGatewayOrder | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({
      province,
      subtotalPaisa: String(cartSubtotalPaisa),
      couponCode: appliedCoupon,
      giftCardCode: appliedGiftCard,
    });
    fetch(`/api/checkout?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.deliveryFeePaisa === 'number') {
          setQuote(data);
        }
      })
      .catch(() => {});
  }, [province, cartSubtotalPaisa, appliedCoupon, appliedGiftCard]);

  // Funnel: checkout started, and a one-shot recovery record once an email exists.
  useEffect(() => {
    trackEvent('checkout_start');
  }, []);

  useEffect(() => {
    if (cart.length === 0) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return;
    const timer = setTimeout(() => {
      void fetch('/api/cart/abandon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          customerName: fullName,
          phone,
          items: cart.map((c) => ({
            productId: c.productId,
            name: c.name,
            quantity: c.quantity,
            unitPricePaisa: c.unitPricePaisa,
          })),
          subtotalPaisa: cartSubtotalPaisa,
        }),
      }).catch(() => {});
    }, 1800);
    return () => clearTimeout(timer);
  }, [email, fullName, phone, cart, cartSubtotalPaisa]);

  const finalTotalPaisa =
    Math.max(0, cartSubtotalPaisa - quote.discountPaisa - quote.giftCardPaisa) +
    quote.deliveryFeePaisa;

  const handleCheckoutSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            fullName,
            phone,
            email,
            province,
            district,
            municipality,
            ward,
            street,
            landmark,
            deliveryInstructions,
          },
          items: cart.map((c) => ({
            productId: c.productId,
            variantId: c.variantId,
            quantity: c.quantity,
          })),
          paymentMethod,
          couponCode: appliedCoupon || undefined,
          giftCardCode: appliedGiftCard || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Checkout could not be completed.');
        setSubmitting(false);
        return;
      }

      saveTrackedOrderToken(data.trackingToken);
      trackEvent('purchase');
      if (typeof data.paymentUrl === 'string' && data.paymentUrl) {
        // Real Fonepay sandbox/live redirect. Fonepay's callback settles the order.
        clearCart();
        window.location.assign(data.paymentUrl);
        return;
      }
      if (data.paymentMethod === 'COD') {
        clearCart();
        router.push(
          `/order/success?orderNumber=${encodeURIComponent(data.orderNumber)}&token=${encodeURIComponent(
            data.trackingToken
          )}`
        );
      } else {
        setGatewayOrder(data);
      }
    } catch {
      setError('Network error submitting your order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyGateway = async (outcome: 'PAID' | 'FAILED' | 'CANCELLED') => {
    if (!gatewayOrder) return;
    setVerifyingPayment(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: gatewayOrder.orderNumber,
          trackingToken: gatewayOrder.trackingToken,
          providerReference: gatewayOrder.providerReference,
          outcome,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Payment verification failed.');
      } else {
        saveTrackedOrderToken(data.trackingToken);
        clearCart();
        router.push(
          `/order/success?orderNumber=${encodeURIComponent(data.orderNumber)}&token=${encodeURIComponent(
            data.trackingToken
          )}`
        );
      }
    } catch {
      setError('Unable to reach payment verification endpoint.');
    } finally {
      setVerifyingPayment(false);
    }
  };

  if (cart.length === 0 && !gatewayOrder) {
    return (
      <div className="container-shell py-16">
        <div className="card mx-auto max-w-lg p-10 text-center">
          <h1 className="font-serif text-3xl font-semibold text-ink">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted">
            Select pieces from our catalog before proceeding to Nepal delivery checkout.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-medium text-white hover:bg-gold-deep"
          >
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
        Secure Nepal Checkout
      </p>
      <h1 className="section-title mt-2">Delivery &amp; Payment</h1>

      {/* Interactive Online Payment Gateway Verification Step */}
      {gatewayOrder ? (
        <div className="card mx-auto mt-8 max-w-xl p-8">
          <div className="flex items-center gap-3 text-gold-deep">
            <ShieldCheck className="h-7 w-7" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                {gatewayOrder.paymentMethod} Gateway Verification
              </p>
              <h2 className="font-serif text-2xl font-semibold text-ink">
                Order {gatewayOrder.orderNumber}
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            Your order has been reserved in status <strong className="text-ink">INITIATED</strong>. {gatewayOrder.paymentMethod}{' '}
            has no live gateway wired up yet, so this sandbox step records a test outcome for{' '}
            <span className="font-semibold text-ink tabular-nums">
              {formatNPR(gatewayOrder.totalPaisa)}
            </span>{' '}
            (Ref: <code className="font-mono">{gatewayOrder.providerReference}</code>). No money moves.
          </p>

          {error && <p className="mt-4 text-xs font-medium text-danger">{error}</p>}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={verifyingPayment}
              onClick={() => handleVerifyGateway('PAID')}
              className="flex items-center justify-center gap-2 rounded-full bg-success px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm {gatewayOrder.paymentMethod} Payment
            </button>
            <button
              type="button"
              disabled={verifyingPayment}
              onClick={() => handleVerifyGateway('FAILED')}
              className="rounded-full border border-line px-5 py-3 text-sm font-medium text-danger transition hover:border-danger disabled:opacity-50"
            >
              Simulate Failed / Cancelled
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCheckoutSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <div className="card p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-semibold text-ink">
                1. Delivery Address (Nepal)
              </h2>
              <p className="mt-1 text-xs text-muted">
                Guest checkout supported — no account required.
              </p>

              <div className="mt-5">
                <AddressAutocomplete
                  apiKey={mapsApiKey}
                  onSelectAddress={(addr) => {
                    if (addr.street) setStreet(addr.street);
                    if (addr.municipality) setMunicipality(addr.municipality);
                    if (addr.district) setDistrict(addr.district);
                    if (addr.province) setProvince(addr.province);
                  }}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-ink">
                  Full Name *
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aarav Bhandari"
                    className="mt-1.5 w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>

                <label className="text-sm font-medium text-ink">
                  Mobile Number *
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="984-XXXXXXX"
                    className="mt-1.5 w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>

                <label className="text-sm font-medium text-ink">
                  Email (optional receipt)
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>

                <label className="text-sm font-medium text-ink">
                  Province *
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                  >
                    {NEPAL_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-ink">
                  District *
                  <input
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Rupandehi / Kathmandu"
                    className="mt-1.5 w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>

                <label className="text-sm font-medium text-ink">
                  Municipality / Rural Municipality *
                  <input
                    required
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    placeholder="Butwal Sub-Metropolitan City"
                    className="mt-1.5 w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>

                <label className="text-sm font-medium text-ink">
                  Ward Number *
                  <input
                    required
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="11"
                    className="mt-1.5 w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>

                <label className="text-sm font-medium text-ink">
                  Street / Tole *
                  <input
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Yogikuti, Santichowk"
                    className="mt-1.5 w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>

                <label className="text-sm font-medium text-ink sm:col-span-2">
                  Nearest Landmark (optional)
                  <input
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near chowk, temple, or school"
                    className="mt-1.5 w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>

                <label className="text-sm font-medium text-ink sm:col-span-2">
                  Delivery Instructions (optional)
                  <textarea
                    rows={2}
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="Preferred call timing or gift note"
                    className="mt-1.5 w-full rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>
              </div>
            </div>

            {/* Payment Selection */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-semibold text-ink">2. Payment Method</h2>
              <p className="mt-1 text-xs text-muted">
                Online payments are confirmed only after server-side gateway verification.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {providerFor('ESEWA') && (
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                      !providerFor('ESEWA')?.selectable
                        ? 'cursor-not-allowed border-line opacity-60'
                        : paymentMethod === 'ESEWA'
                        ? 'cursor-pointer border-gold bg-gold/10'
                        : 'cursor-pointer border-line'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        eSewa Wallet
                        {providerBadge('ESEWA')}
                      </p>
                      <p className="text-xs text-muted">{providerFor('ESEWA')?.note}</p>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'ESEWA'}
                      disabled={!providerFor('ESEWA')?.selectable}
                      onChange={() => setPaymentMethod('ESEWA')}
                      className="accent-gold"
                    />
                  </label>
                )}

                {providerFor('KHALTI') && (
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                      !providerFor('KHALTI')?.selectable
                        ? 'cursor-not-allowed border-line opacity-60'
                        : paymentMethod === 'KHALTI'
                        ? 'cursor-pointer border-gold bg-gold/10'
                        : 'cursor-pointer border-line'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Khalti Digital
                        {providerBadge('KHALTI')}
                      </p>
                      <p className="text-xs text-muted">{providerFor('KHALTI')?.note}</p>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'KHALTI'}
                      disabled={!providerFor('KHALTI')?.selectable}
                      onChange={() => setPaymentMethod('KHALTI')}
                      className="accent-gold"
                    />
                  </label>
                )}

                {providerFor('FONEPAY') && (
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                      !providerFor('FONEPAY')?.selectable
                        ? 'cursor-not-allowed border-line opacity-60'
                        : paymentMethod === 'FONEPAY'
                        ? 'cursor-pointer border-gold bg-gold/10'
                        : 'cursor-pointer border-line'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Fonepay QR
                        {providerBadge('FONEPAY')}
                      </p>
                      <p className="text-xs text-muted">{providerFor('FONEPAY')?.note}</p>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'FONEPAY'}
                      disabled={!providerFor('FONEPAY')?.selectable}
                      onChange={() => setPaymentMethod('FONEPAY')}
                      className="accent-gold"
                    />
                  </label>
                )}

                <label
                  className={`flex items-center justify-between rounded-xl border p-4 transition ${
                    !quote.codAvailable
                      ? 'cursor-not-allowed border-line opacity-50'
                      : paymentMethod === 'COD'
                      ? 'cursor-pointer border-gold bg-gold/10'
                      : 'cursor-pointer border-line'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">Cash on Delivery</p>
                    <p className="text-xs text-muted">
                      {quote.codAvailable ? 'Pay cash upon parcel arrival' : 'Unavailable in selected province'}
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    disabled={!quote.codAvailable}
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-gold"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column Order Summary */}
          <aside className="card h-fit p-6">
            <h2 className="font-serif text-2xl font-semibold text-ink">Order Summary</h2>
            <ul className="mt-4 divide-y divide-line text-sm">
              {cart.map((item) => (
                <li key={`${item.productId}-${item.variantId || 'base'}`} className="flex justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-ink">
                      {item.name} &times; {item.quantity}
                    </p>
                    {item.variantLabel && <p className="text-xs text-muted">{item.variantLabel}</p>}
                  </div>
                  <span className="font-medium text-ink tabular-nums">
                    {formatNPR(item.unitPricePaisa * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Promo code (e.g. WELCOME10)"
                className="flex-1 rounded-xl border border-line bg-field px-3 py-2 text-xs uppercase outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={() => setAppliedCoupon(couponInput.trim().toUpperCase())}
                className="rounded-xl border border-line px-4 py-2 text-xs font-medium text-ink hover:border-gold"
              >
                Apply
              </button>
            </div>
            {quote.couponMessage && (
              <p className="mt-1.5 text-xs text-gold-deep">{quote.couponMessage}</p>
            )}

            <div className="mt-2 flex gap-2">
              <input
                value={giftCardInput}
                onChange={(e) => setGiftCardInput(e.target.value)}
                placeholder="Gift card code"
                aria-label="Gift card code"
                className="flex-1 rounded-xl border border-line bg-field px-3 py-2 text-xs uppercase outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={() => setAppliedGiftCard(giftCardInput.trim().toUpperCase())}
                className="rounded-xl border border-line px-4 py-2 text-xs font-medium text-ink hover:border-gold"
              >
                Redeem
              </button>
            </div>
            {quote.giftCardMessage && (
              <p className="mt-1.5 text-xs text-gold-deep">{quote.giftCardMessage}</p>
            )}

            <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="tabular-nums text-ink">{formatNPR(cartSubtotalPaisa)}</span>
              </div>
              {quote.discountPaisa > 0 && (
                <div className="flex justify-between text-success">
                  <span>Promo Discount</span>
                  <span className="tabular-nums">-{formatNPR(quote.discountPaisa)}</span>
                </div>
              )}
              {quote.giftCardPaisa > 0 && (
                <div className="flex justify-between text-success">
                  <span>Gift card</span>
                  <span className="tabular-nums">-{formatNPR(quote.giftCardPaisa)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Delivery ({quote.estimatedDays})</span>
                <span className="tabular-nums text-ink">
                  {quote.deliveryFeePaisa === 0 ? 'Free' : formatNPR(quote.deliveryFeePaisa)}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                <span>Total (NPR)</span>
                <span className="tabular-nums">{formatNPR(finalTotalPaisa)}</span>
              </div>
            </div>

            {error && <p className="mt-4 text-xs font-medium text-danger">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-medium text-white transition hover:bg-gold-deep disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {submitting ? 'Creating Order...' : 'Place Order'}
            </button>

            <ul className="mt-4 space-y-1.5 text-[11px] leading-relaxed text-muted">
              <li className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-gold-deep" />
                Server-verified payments · we never store wallet PINs
              </li>
              <li className="flex items-center gap-2">
                <Truck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-gold-deep" />
                Dispatch from Butwal in {quote.estimatedDays}
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-gold-deep" />
                7-day exchange on unworn ready stock
              </li>
            </ul>
          </aside>
        </form>
      )}
    </div>
  );
}
