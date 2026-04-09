"use client";

import { useEffect, useState } from "react";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import { useTheme } from "next-themes";
import { DotsLoader } from "@/components/ui/loader";
import { useBookingStore } from "@/hooks/use-booking-store";
import { useMounted } from "@/hooks/use-mounted";
import { notify } from "@/lib/notify";
import { formatCurrency } from "@/lib/utils";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let cachedStripePromise: Promise<StripeJs | null> | null = null;

function buildPortableCheckoutUrl(args: {
  origin: string;
  carSlug?: string | null;
  pickupDate?: Date | null;
  returnDate?: Date | null;
  pickupLocation?: string;
  returnLocation?: string;
  extras?: {
    insurance: boolean;
    gps: boolean;
    childSeat: number;
  };
}) {
  const {
    origin,
    carSlug,
    pickupDate,
    returnDate,
    pickupLocation,
    returnLocation,
    extras,
  } = args;

  if (!carSlug || !pickupDate || !returnDate || !pickupLocation) {
    return `${origin}/book/checkout`;
  }

  const params = new URLSearchParams({
    car: carSlug,
    pickupDate: pickupDate.toISOString(),
    returnDate: returnDate.toISOString(),
    pickupLocation,
    returnLocation: returnLocation || pickupLocation,
  });

  if (extras?.insurance) {
    params.set("insurance", "1");
  }

  if (extras?.gps) {
    params.set("gps", "1");
  }

  if ((extras?.childSeat || 0) > 0) {
    params.set("childSeat", String(extras?.childSeat || 0));
  }

  return `${origin}/book/checkout?${params.toString()}`;
}

function getStripePromise() {
  if (typeof window === "undefined" || !publishableKey) {
    return null;
  }

  if (!cachedStripePromise) {
    cachedStripePromise = loadStripe(publishableKey, {
      locale: "auto",
      developerTools: {
        assistant: {
          enabled: false,
        },
      },
    });
  }

  return cachedStripePromise;
}

interface CheckoutFormProps {
  totalPrice: number;
  depositAmount: number;
  carId: string;
  onSuccess: (bookingRef: string) => void;
}

interface CheckoutFormInnerProps extends CheckoutFormProps {
  isDark: boolean;
}

function CheckoutFormInner({
  totalPrice,
  depositAmount,
  carId,
  isDark,
  onSuccess,
}: CheckoutFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [cardReady, setCardReady] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardSlow, setCardSlow] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");

  const {
    selectedCar,
    pickupDate,
    returnDate,
    pickupLocation,
    returnLocation,
    customerName,
    customerEmail,
    customerPhone,
    extras,
    setCustomerInfo,
  } = useBookingStore();

  const [name, setName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail);
  const [phone, setPhone] = useState(customerPhone);

  useEffect(() => {
    setCheckoutUrl(
      buildPortableCheckoutUrl({
        origin: window.location.origin,
        carSlug: selectedCar?.slug,
        pickupDate,
        returnDate,
        pickupLocation,
        returnLocation,
        extras,
      })
    );
  }, [
    extras,
    pickupDate,
    pickupLocation,
    returnDate,
    returnLocation,
    selectedCar?.slug,
  ]);

  useEffect(() => {
    if (cardReady) {
      setCardSlow(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCardSlow(true);
    }, 8000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [cardReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !name || !email || !cardComplete) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Secure payment could not be initialized. Please reload checkout.");
      return;
    }

    setProcessing(true);
    setError("");
    setCustomerInfo({ name, email, phone });
    const loadingToastId = notify.loading("Preparing secure checkout", {
      description: "Creating your booking and confirming your payment details.",
    });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId,
          pickupDate: pickupDate?.toISOString() || new Date("2026-04-01").toISOString(),
          returnDate: returnDate?.toISOString() || new Date("2026-04-05").toISOString(),
          pickupLocation: pickupLocation || "LAX Airport",
          returnLocation: returnLocation || pickupLocation || "LAX Airport",
          totalPrice,
          depositAmount,
          customerName: name,
          customerEmail: email,
          customerPhone: phone || null,
          extras,
        }),
      });

      const checkoutData = await res.json();

      if (!res.ok) {
        throw new Error(checkoutData.error || "Failed to create payment session");
      }

      const { bookingId, bookingRef, rentalClientSecret } = checkoutData;

      if (!rentalClientSecret) {
        throw new Error("Failed to create payment session");
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        rentalClientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: { name, email, phone: phone || undefined },
          },
          receipt_email: email,
        }
      );

      if (stripeError) {
        const message = stripeError.message || "Payment failed";
        setError(message);
        notify.dismiss(loadingToastId);
        notify.error("Your selected payment method failed", {
          description: message,
        });
        return;
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error("Payment did not complete successfully");
      }

      const completionRes = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          rentalPaymentIntentId: paymentIntent.id,
        }),
      });

      const completionData = await completionRes.json();
      if (!completionRes.ok) {
        throw new Error(
          completionData.error || "Payment succeeded but booking finalization failed"
        );
      }

      notify.dismiss(loadingToastId);
      onSuccess(completionData.bookingRef || bookingRef);
    } catch (err) {
      console.error("Checkout error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(
        message
      );
      notify.dismiss(loadingToastId);
      notify.error("Payment could not be completed", {
        description: message,
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Driver Info */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Driver Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20"
            />
          </div>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Payment Details</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Rental: {formatCurrency(totalPrice)} charged now. Deposit: {formatCurrency(depositAmount)} held on your card and released on return.
        </p>
        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <div
            className={`rounded-lg border px-4 py-4 ${
              isDark
                ? "border-[#2d2d2d] bg-[#111111]"
                : "border-[#e5e2dd] bg-white"
            }`}
          >
            <CardElement
              options={{
                disableLink: true,
                hidePostalCode: true,
                style: {
                  base: {
                    color: isDark ? "#fafaf7" : "#0a0a0a",
                    iconColor: isDark ? "#fafaf7" : "#0a0a0a",
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "16px",
                    fontSmoothing: "antialiased",
                    lineHeight: "24px",
                    "::placeholder": {
                      color: isDark ? "#a8a29e" : "#8c857f",
                    },
                    ":-webkit-autofill": {
                      color: isDark ? "#fafaf7" : "#0a0a0a",
                    },
                  },
                  invalid: {
                    color: "#dc2626",
                    iconColor: "#dc2626",
                  },
                },
              }}
              onReady={() => {
                setCardReady(true);
                setCardSlow(false);
              }}
              onChange={(event) => {
                setCardComplete(event.complete);
                if (event.error?.message) {
                  setError(event.error.message);
                } else {
                  setError("");
                }
              }}
            />
          </div>
        </div>
        {cardSlow && !error && !cardReady && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            Secure payment is taking longer than usual to load. If you opened this link inside an app browser, please open it in Safari or Chrome and try again.
          </div>
        )}
      </div>

      {/* Deposit info */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <div className="flex gap-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Security Deposit</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
              A {formatCurrency(depositAmount)} hold will be placed on your card. This is not a charge — it&apos;s released when you return the car in good condition.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || !name || !email || !cardComplete}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff5f00] py-4 text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-lg hover:shadow-[#ff5f00]/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {processing ? (
          <>
            <DotsLoader size="sm" className="text-white" />
            Processing...
          </>
        ) : (
          <>Pay {formatCurrency(totalPrice)} &amp; Place Deposit Hold</>
        )}
      </button>

      {!processing && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-lg border border-border py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
          >
            Reload Secure Checkout
          </button>
          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center rounded-lg border border-border py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              Open in Browser
            </a>
          ) : null}
        </div>
      )}
    </form>
  );
}

export function StripeCheckoutForm(props: CheckoutFormProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";
  const {
    selectedCar,
    pickupDate,
    returnDate,
    pickupLocation,
    returnLocation,
    extras,
  } = useBookingStore();
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [paymentUiRequested, setPaymentUiRequested] = useState(false);
  const [stripePromise, setStripePromise] = useState<Promise<StripeJs | null> | null>(null);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    setCheckoutUrl(
      buildPortableCheckoutUrl({
        origin: window.location.origin,
        carSlug: selectedCar?.slug,
        pickupDate,
        returnDate,
        pickupLocation,
        returnLocation,
        extras,
      })
    );
  }, [
    extras,
    mounted,
    pickupDate,
    pickupLocation,
    returnDate,
    returnLocation,
    selectedCar?.slug,
  ]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse rounded-lg bg-secondary" />
        <div className="h-48 animate-pulse rounded-xl bg-secondary" />
        <div className="h-12 animate-pulse rounded-lg bg-secondary" />
      </div>
    );
  }

  if (!paymentUiRequested) {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">Secure Payment</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            To keep checkout reliable across mobile and in-app browsers, secure card fields load on demand.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          If you opened this site inside another app and the payment step keeps failing, use
          {" "}
          <span className="font-semibold">Open in Browser</span>
          {" "}
          first, then continue in Safari or Chrome.
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setStripePromise(getStripePromise());
              setPaymentUiRequested(true);
            }}
            className="w-full rounded-lg bg-[#ff5f00] py-3 text-sm font-bold text-white transition hover:bg-[#ff5f00]/90"
          >
            Load Secure Card Form
          </button>
          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center rounded-lg border border-border py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              Open in Browser
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        <p>Secure payment could not be initialized on this device.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setStripePromise(getStripePromise());
            }}
            className="w-full rounded-lg border border-current py-3 font-medium transition hover:bg-red-100 dark:hover:bg-red-950/50"
          >
            Retry Secure Checkout
          </button>
          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center rounded-lg border border-current py-3 font-medium transition hover:bg-red-100 dark:hover:bg-red-950/50"
            >
              Open in Browser
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <Elements
      key={isDark ? "dark" : "light"}
      stripe={stripePromise}
      options={{
        appearance: {
          theme: "flat",
          variables: {
            colorPrimary: "#ff5f00",
            colorBackground: isDark ? "#1a1a1a" : "#ffffff",
            colorText: isDark ? "#fafaf7" : "#0a0a0a",
            colorTextSecondary: isDark ? "#a8a29e" : "#6b6560",
            colorTextPlaceholder: isDark ? "#78716c" : "#8c857f",
            colorDanger: "#dc2626",
            colorIcon: isDark ? "#fafaf7" : "#0a0a0a",
            colorSuccess: "#16a34a",
            borderRadius: "8px",
            fontFamily: "system-ui, sans-serif",
            spacingUnit: "4px",
          },
          rules: {
            ".Input, .Tab, .Block": {
              backgroundColor: isDark ? "#111111" : "#ffffff",
              border: `1px solid ${isDark ? "#2d2d2d" : "#e5e2dd"}`,
              boxShadow: "none",
            },
            ".Input:focus, .Tab:hover, .Tab--selected": {
              borderColor: "#ff5f00",
              boxShadow: "0 0 0 1px rgba(255, 95, 0, 0.35)",
            },
            ".Label": {
              color: isDark ? "#fafaf7" : "#0a0a0a",
            },
          },
        },
      }}
    >
      <CheckoutFormInner {...props} isDark={isDark} />
    </Elements>
  );
}
