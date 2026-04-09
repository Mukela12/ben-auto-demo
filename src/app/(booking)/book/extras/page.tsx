"use client";

import Image from "next/image";
import { Suspense, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingProgress } from "@/components/car-rental/booking-progress";
import { DotsLoader } from "@/components/ui/loader";
import { LuxuryLoader } from "@/components/ui/luxury-loader";
import { useBookingStore } from "@/hooks/use-booking-store";
import type { Car } from "@/types";
import { formatCurrency, calculateDays, getDiscountPercent } from "@/lib/utils";

const extrasOptions = [
  {
    id: "insurance",
    name: "Full Coverage Insurance",
    description: "Zero deductible protection for peace of mind",
    pricePerDay: 2900,
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    id: "gps",
    name: "GPS Navigation",
    description: "Built-in navigation system with live traffic",
    pricePerDay: 1200,
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
  },
  {
    id: "childSeat",
    name: "Child Seat",
    description: "ISOFIX compatible, suitable for ages 1-12",
    pricePerDay: 800,
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
];

export default function BookingStep3Page() {
  return (
    <Suspense
      fallback={
        <div className="py-12">
          <LuxuryLoader
            title="Loading Your Selection"
            subtitle="Getting your chosen vehicle ready."
          />
        </div>
      }
    >
      <BookingStep3 />
    </Suspense>
  );
}

function BookingStep3() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carSlug = searchParams.get("car");

  const { extras, setExtras, setSelectedCar, selectedCar, pickupDate, returnDate } = useBookingStore();
  const [car, setCar] = useState<Car | null>(selectedCar);
  const [loading, setLoading] = useState(!selectedCar);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    router.prefetch("/book/checkout");

    if (selectedCar && (!carSlug || selectedCar.slug === carSlug)) {
      setCar(selectedCar);
      setLoading(false);
      return;
    }

    if (!carSlug) {
      router.replace("/book");
      return;
    }

    let cancelled = false;

    async function loadCar() {
      setLoading(true);
      try {
        const slug = carSlug;
        if (!slug) {
          router.replace("/book");
          return;
        }

        const res = await fetch(`/api/cars?slug=${encodeURIComponent(slug)}&all=true`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Vehicle not found");
        }

        if (!cancelled) {
          setCar(data);
          setSelectedCar(data);
        }
      } catch {
        if (!cancelled) {
          router.replace("/book");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCar();

    return () => {
      cancelled = true;
    };
  }, [carSlug, router, selectedCar, setSelectedCar]);

  if (loading || !car) {
    return (
      <div>
        <BookingProgress currentStep={3} />
        <div className="mt-8">
          <LuxuryLoader
            title="Preparing Your Vehicle"
            subtitle="Loading live details for your selected car."
          />
        </div>
      </div>
    );
  }

  const days = pickupDate && returnDate ? calculateDays(pickupDate, returnDate) : 4;
  const discountPercent = getDiscountPercent(days);

  const rentalSubtotal = car.dailyRate * days;
  const insuranceTotal = extras.insurance ? 2900 * days : 0;
  const gpsTotal = extras.gps ? 1200 * days : 0;
  const childSeatTotal = extras.childSeat * 800 * days;
  const subtotal = rentalSubtotal + insuranceTotal + gpsTotal + childSeatTotal;
  const discount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discount;

  const toggleExtra = (id: string) => {
    if (id === "insurance") setExtras({ insurance: !extras.insurance });
    if (id === "gps") setExtras({ gps: !extras.gps });
    if (id === "childSeat") setExtras({ childSeat: extras.childSeat > 0 ? 0 : 1 });
  };

  return (
    <div>
      <BookingProgress currentStep={3} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Extras Selection */}
        <div className="lg:col-span-2">
          <h1 className="font-[var(--font-inter-tight)] text-3xl font-black">
            Add Extras
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enhance your rental experience
          </p>

          <div className="mt-8 space-y-4">
            {extrasOptions.map((extra) => {
              const isActive =
                extra.id === "insurance"
                  ? extras.insurance
                  : extra.id === "gps"
                    ? extras.gps
                    : extras.childSeat > 0;

              return (
                <button
                  key={extra.id}
                  onClick={() => toggleExtra(extra.id)}
                  className={`flex w-full items-center gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                    isActive
                      ? "border-[#ff5f00] bg-[#ff5f00]/5"
                      : "border-border bg-card hover:border-[#ff5f00]/30"
                  }`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-[#ff5f00]" : "bg-secondary"}`}>
                    <svg className={`h-5 w-5 ${isActive ? "text-white" : "text-muted-foreground"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={extra.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-foreground">{extra.name}</h3>
                    <p className="text-xs text-muted-foreground">{extra.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(extra.pricePerDay)}</p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${isActive ? "border-[#ff5f00] bg-[#ff5f00]" : "border-border"}`}>
                    {isActive && (
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              startTransition(() => {
                router.push("/book/checkout");
              });
            }}
            disabled={isPending}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5f00] py-4 text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-lg hover:shadow-[#ff5f00]/25 disabled:cursor-wait disabled:opacity-60"
          >
            {isPending ? (
              <>
                <DotsLoader size="sm" className="text-white" />
                Preparing Checkout...
              </>
            ) : (
              "Continue to Checkout"
            )}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-xl bg-card p-6 shadow-sm">
            <h3 className="font-[var(--font-inter-tight)] text-lg font-bold">Booking Summary</h3>

            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-16 w-24 shrink-0 rounded-lg bg-surface-dark">
                <Image src={car.imageUrl} alt={car.name} fill className="object-contain p-1" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{car.name}</p>
                <p className="text-xs text-muted-foreground">{days} days</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rental ({days} days)</span>
                <span>{formatCurrency(rentalSubtotal)}</span>
              </div>
              {extras.insurance && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance</span>
                  <span>{formatCurrency(insuranceTotal)}</span>
                </div>
              )}
              {extras.gps && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GPS</span>
                  <span>{formatCurrency(gpsTotal)}</span>
                </div>
              )}
              {extras.childSeat > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Child Seat</span>
                  <span>{formatCurrency(childSeatTotal)}</span>
                </div>
              )}
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{discountPercent}% multi-day discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-3 font-bold">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Security deposit (hold)</span>
                <span>{formatCurrency(car.depositAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
