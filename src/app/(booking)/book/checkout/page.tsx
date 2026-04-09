"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingProgress } from "@/components/car-rental/booking-progress";
import { useBookingStore } from "@/hooks/use-booking-store";
import { StripeCheckoutForm } from "@/components/car-rental/stripe-checkout";
import { LuxuryLoader } from "@/components/ui/luxury-loader";
import { formatCurrency, calculateDays, getDiscountPercent } from "@/lib/utils";

export default function BookingStep4() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    hasHydrated,
    selectedCar: car,
    extras,
    pickupDate,
    returnDate,
    pickupLocation,
    returnLocation,
    setDates,
    setLocations,
    setSelectedCar,
    setExtras,
  } = useBookingStore();
  const [restoringFromLink, setRestoringFromLink] = useState(false);
  const hasBooking = Boolean(car);
  const portableCarSlug = searchParams.get("car");
  const portablePickupDate = searchParams.get("pickupDate");
  const portableReturnDate = searchParams.get("returnDate");
  const portablePickupLocation = searchParams.get("pickupLocation");
  const portableReturnLocation = searchParams.get("returnLocation");
  const portableInsurance = searchParams.get("insurance");
  const portableGps = searchParams.get("gps");
  const portableChildSeat = searchParams.get("childSeat");
  const hasPortableCheckoutState = Boolean(
    portableCarSlug &&
      portablePickupDate &&
      portableReturnDate &&
      portablePickupLocation
  );

  useEffect(() => {
    if (hasBooking || !hasHydrated || !hasPortableCheckoutState || restoringFromLink) {
      return;
    }

    const parsedPickupDate = new Date(portablePickupDate!);
    const parsedReturnDate = new Date(portableReturnDate!);

    if (
      Number.isNaN(parsedPickupDate.getTime()) ||
      Number.isNaN(parsedReturnDate.getTime()) ||
      parsedReturnDate <= parsedPickupDate
    ) {
      router.replace("/book");
      return;
    }

    let cancelled = false;
    setRestoringFromLink(true);

    async function restoreBookingFromLink() {
      try {
        const res = await fetch(
          `/api/cars?slug=${encodeURIComponent(portableCarSlug!)}&all=true`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Vehicle not found");
        }

        if (cancelled) {
          return;
        }

        setSelectedCar(data);
        setDates(parsedPickupDate, parsedReturnDate);
        setLocations(
          portablePickupLocation!,
          portableReturnLocation || portablePickupLocation!
        );
        setExtras({
          insurance: portableInsurance === "1",
          gps: portableGps === "1",
          childSeat: Math.max(Number(portableChildSeat) || 0, 0),
        });
      } catch {
        router.replace(
          portableCarSlug
            ? `/book/select?preferred=${encodeURIComponent(portableCarSlug)}&notice=unavailable`
            : "/book"
        );
      } finally {
        if (!cancelled) {
          setRestoringFromLink(false);
        }
      }
    }

    void restoreBookingFromLink();

    return () => {
      cancelled = true;
    };
  }, [
    hasBooking,
    hasHydrated,
    hasPortableCheckoutState,
    portableCarSlug,
    portableChildSeat,
    portableGps,
    portableInsurance,
    portablePickupDate,
    portablePickupLocation,
    portableReturnDate,
    portableReturnLocation,
    restoringFromLink,
    router,
    setDates,
    setExtras,
    setLocations,
    setSelectedCar,
  ]);

  useEffect(() => {
    if (hasBooking) {
      return;
    }

    if (!hasHydrated || restoringFromLink) {
      return;
    }

    if (hasPortableCheckoutState) {
      return;
    }

    if (!hasBooking) {
      router.replace("/book");
    }
  }, [hasBooking, hasHydrated, hasPortableCheckoutState, restoringFromLink, router]);

  if (!hasBooking) {
    return (
      <div className="py-12">
        <LuxuryLoader
          title="Restoring Your Booking"
          subtitle={
            hasPortableCheckoutState
              ? "Loading your booking details from the secure checkout link."
              : "Loading your selected vehicle and secure checkout details."
          }
        />
      </div>
    );
  }

  const bookingCar = car!;
  const days = pickupDate && returnDate ? calculateDays(pickupDate, returnDate) : 4;
  const discountPercent = getDiscountPercent(days);
  const rentalSubtotal = bookingCar.dailyRate * days;
  const insuranceTotal = extras.insurance ? 2900 * days : 0;
  const gpsTotal = extras.gps ? 1200 * days : 0;
  const childSeatTotal = extras.childSeat * 800 * days;
  const subtotal = rentalSubtotal + insuranceTotal + gpsTotal + childSeatTotal;
  const discount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discount;

  return (
    <div>
      <BookingProgress currentStep={4} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Stripe Checkout Form */}
        <div className="lg:col-span-2">
          <h1 className="font-[var(--font-inter-tight)] text-3xl font-black">Checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">Complete your booking with Stripe</p>

          <div className="mt-8">
            <StripeCheckoutForm
              totalPrice={total}
              depositAmount={bookingCar.depositAmount}
              carId={bookingCar.id || bookingCar.slug}
              onSuccess={(ref) => router.push(`/book/confirmation?ref=${ref}`)}
            />
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-xl bg-card p-6 shadow-sm">
            <h3 className="font-[var(--font-inter-tight)] text-lg font-bold">Booking Summary</h3>

            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-16 w-24 shrink-0 rounded-lg bg-surface-dark">
                <Image src={bookingCar.imageUrl} alt={bookingCar.name} fill className="object-contain p-1" />
              </div>
              <div>
                <p className="text-sm font-bold">{bookingCar.name}</p>
                <p className="text-xs text-muted-foreground">{days} days</p>
              </div>
            </div>

            {pickupLocation && (
              <div className="mt-4 space-y-2 rounded-xl bg-background p-3 text-xs">
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Pickup:</span>
                  <span className="font-medium">{pickupLocation}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Return:</span>
                  <span className="font-medium">{returnLocation || pickupLocation}</span>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rental ({days} days)</span>
                <span>{formatCurrency(rentalSubtotal)}</span>
              </div>
              {extras.insurance && (
                <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span>{formatCurrency(insuranceTotal)}</span></div>
              )}
              {extras.gps && (
                <div className="flex justify-between"><span className="text-muted-foreground">GPS</span><span>{formatCurrency(gpsTotal)}</span></div>
              )}
              {extras.childSeat > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Child Seat</span><span>{formatCurrency(childSeatTotal)}</span></div>
              )}
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{discountPercent}% discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-3 font-bold">
                <span>Charge now</span>
                <span className="text-lg">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Deposit hold</span>
                <span>{formatCurrency(bookingCar.depositAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
