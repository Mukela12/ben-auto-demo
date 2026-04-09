"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingProgress } from "@/components/car-rental/booking-progress";
import { useBookingStore } from "@/hooks/use-booking-store";
import { locationsData } from "@/lib/cars-data";

export default function BookingStep1Page() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading...</div>}>
      <BookingStep1 />
    </Suspense>
  );
}

function BookingStep1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCar = searchParams.get("car");

  const { setDates, setLocations, pickupLocation, returnLocation } = useBookingStore();

  const [pickup, setPickup] = useState(pickupLocation || "");
  const [returnLoc, setReturnLoc] = useState(returnLocation || "");
  const [pickupDate, setPickupDate] = useState("2026-04-01");
  const [returnDate, setReturnDate] = useState("2026-04-05");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");

  const handleContinue = () => {
    if (!pickup || !pickupDate || !returnDate) return;

    setLocations(pickup, returnLoc || pickup);
    setDates(
      new Date(`${pickupDate}T${pickupTime}`),
      new Date(`${returnDate}T${returnTime}`)
    );

    if (preselectedCar) {
      router.push(`/book/select?preferred=${encodeURIComponent(preselectedCar)}`);
    } else {
      router.push("/book/select");
    }
  };

  return (
    <div>
      <BookingProgress currentStep={1} />

      <div className="mx-auto max-w-2xl">
        <h1 className="font-[var(--font-inter-tight)] text-3xl font-black">
          When & Where
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose your pickup and return details
        </p>

        <div className="mt-8 space-y-6">
          {/* Pickup Location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Pickup Location
            </label>
            <select
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm outline-none transition focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20"
            >
              <option value="">Select a location</option>
              {locationsData.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} — {loc.city}
                </option>
              ))}
            </select>
          </div>

          {/* Return Location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Return Location
            </label>
            <select
              value={returnLoc}
              onChange={(e) => setReturnLoc(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm outline-none transition focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20"
            >
              <option value="">Same as pickup</option>
              {locationsData.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} — {loc.city}
                </option>
              ))}
            </select>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm outline-none transition focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Pickup Time
              </label>
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm outline-none transition focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const h = i.toString().padStart(2, "0");
                  return [`${h}:00`, `${h}:30`];
                })
                  .flat()
                  .map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm outline-none transition focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Return Time
              </label>
              <select
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm outline-none transition focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const h = i.toString().padStart(2, "0");
                  return [`${h}:00`, `${h}:30`];
                })
                  .flat()
                  .map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!pickup || !pickupDate || !returnDate}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5f00] py-4 text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-lg hover:shadow-[#ff5f00]/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {preselectedCar ? "Check Live Availability" : "Browse Available Cars"}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
