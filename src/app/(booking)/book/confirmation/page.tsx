"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookingProgress } from "@/components/car-rental/booking-progress";
import { LuxuryLoader } from "@/components/ui/luxury-loader";
import { useBookingStore } from "@/hooks/use-booking-store";
import type { Booking } from "@/types";
import { formatCurrency, formatDate, calculateDays, getDiscountPercent } from "@/lib/utils";

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12">
          <LuxuryLoader
            title="Loading Confirmation"
            subtitle="Syncing your booking details from the live system."
          />
        </div>
      }
    >
      <BookingConfirmation />
    </Suspense>
  );
}

function BookingConfirmation() {
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get("ref") || "BK-2026-DEMO";
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    selectedCar: car,
    extras,
    pickupDate,
    returnDate,
    pickupLocation,
    returnLocation,
    customerName,
    customerEmail,
  } = useBookingStore();

  useEffect(() => {
    if (!bookingRef) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadBooking() {
      try {
        const res = await fetch(`/api/bookings?bookingRef=${encodeURIComponent(bookingRef)}`);
        const data = await res.json();

        if (res.ok && !cancelled) {
          setBooking(data);
        }
      } catch {
        // Keep the local store fallback for the happy path.
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBooking();

    return () => {
      cancelled = true;
    };
  }, [bookingRef]);

  const days = pickupDate && returnDate ? calculateDays(pickupDate, returnDate) : 4;
  const discountPercent = getDiscountPercent(days);

  const rentalSubtotal = car ? car.dailyRate * days : 0;
  const insuranceTotal = extras.insurance ? 2900 * days : 0;
  const gpsTotal = extras.gps ? 1200 * days : 0;
  const childSeatTotal = extras.childSeat * 800 * days;
  const subtotal = rentalSubtotal + insuranceTotal + gpsTotal + childSeatTotal;
  const discount = Math.round(subtotal * (discountPercent / 100));
  const storeTotal = subtotal - discount;
  const displayCar = booking?.car || car;
  const displayExtras = booking?.extras || extras;
  const displayPickupLocation = booking?.pickupLocation || pickupLocation || "LAX Airport";
  const displayReturnLocation =
    booking?.returnLocation || returnLocation || pickupLocation || "LAX Airport";
  const displayPickupDate = booking?.pickupDate || pickupDate || "Apr 1, 2026";
  const displayReturnDate = booking?.returnDate || returnDate || "Apr 5, 2026";
  const displayCustomerName = booking?.customerName || customerName;
  const displayCustomerEmail = booking?.customerEmail || customerEmail;
  const total = booking?.totalPrice ?? storeTotal;
  const depositAmount = booking?.depositAmount ?? displayCar?.depositAmount ?? 0;

  return (
    <div>
      <BookingProgress currentStep={5} />

      <div className="mx-auto max-w-2xl text-center">
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-6 font-[var(--font-inter-tight)] text-3xl font-black">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your booking reference is{" "}
          <span className="font-mono font-bold text-foreground">{bookingRef}</span>
        </p>
        {displayCustomerEmail && (
          <p className="mt-1 text-sm text-muted-foreground">
            A confirmation email has been sent to <strong>{displayCustomerEmail}</strong>
          </p>
        )}
        {loading && (
          <p className="mt-2 text-xs text-muted-foreground">
            Syncing live booking details...
          </p>
        )}
      </div>

      {/* Booking Details Card */}
      <div className="mx-auto mt-10 max-w-2xl rounded-xl bg-card p-8 shadow-sm">
        {displayCar && (
          <div className="flex flex-col items-center gap-4 border-b border-border pb-6 md:flex-row">
            <div className="relative h-28 w-44 shrink-0 rounded-xl bg-surface-dark">
              <Image src={displayCar.imageUrl} alt={displayCar.name} fill className="object-contain p-2" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#ff5f00]">{displayCar.category}</p>
              <h2 className="font-[var(--font-inter-tight)] text-xl font-bold">{displayCar.name}</h2>
              <p className="text-sm text-muted-foreground">{displayCar.brand} · {displayCar.horsepower} HP · {displayCar.transmission}</p>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pickup</h3>
            <p className="mt-1 font-medium">{displayPickupLocation}</p>
            <p className="text-sm text-muted-foreground">{formatDate(displayPickupDate)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Return</h3>
            <p className="mt-1 font-medium">{displayReturnLocation}</p>
            <p className="text-sm text-muted-foreground">{formatDate(displayReturnDate)}</p>
          </div>
        </div>

        {(displayExtras.insurance || displayExtras.gps || displayExtras.childSeat > 0) && (
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Extras</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {displayExtras.insurance && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">Full Insurance</span>}
              {displayExtras.gps && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">GPS Navigation</span>}
              {displayExtras.childSeat > 0 && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">Child Seat</span>}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Total Charged</span><span className="font-bold">{formatCurrency(total)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Deposit Hold</span><span className="font-medium">{formatCurrency(depositAmount)}</span></div>
          <p className="mt-2 text-xs text-muted-foreground">Deposit will be released when the car is returned in good condition.</p>
        </div>

        {displayCustomerName && (
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Driver</h3>
            <p className="mt-1 font-medium">{displayCustomerName}</p>
            {displayCustomerEmail && <p className="text-sm text-muted-foreground">{displayCustomerEmail}</p>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="rounded-xl bg-[#ff5f00] px-8 py-3.5 text-center text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90"
        >
          Back to Home
        </Link>
        <Link
          href="/fleet"
          className="rounded-xl border border-border bg-card px-8 py-3.5 text-center text-sm font-medium transition-all hover:bg-secondary"
        >
          Explore Fleet
        </Link>
      </div>
    </div>
  );
}
