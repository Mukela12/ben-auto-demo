"use client";

import Image from "next/image";
import { Suspense, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingProgress } from "@/components/car-rental/booking-progress";
import { DotsLoader } from "@/components/ui/loader";
import {
  LuxuryLoader,
  VehicleCardsSkeleton,
} from "@/components/ui/luxury-loader";
import { useBookingStore } from "@/hooks/use-booking-store";
import type { Car } from "@/types";
import { calculateDays, formatCurrency } from "@/lib/utils";

export default function BookingStep2() {
  return (
    <Suspense
      fallback={
        <div>
          <BookingProgress currentStep={2} />
          <div className="mt-8 space-y-5">
            <LuxuryLoader
              title="Loading Live Availability"
              subtitle="Preparing your vehicle results for the selected dates."
            />
            <VehicleCardsSkeleton />
          </div>
        </div>
      }
    >
      <BookingStep2Inner />
    </Suspense>
  );
}

function BookingStep2Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasHydrated, setSelectedCar, pickupDate, returnDate } = useBookingStore();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingCarSlug, setPendingCarSlug] = useState<string | null>(null);
  const [preferredCarName, setPreferredCarName] = useState("");
  const [isPending, startTransition] = useTransition();
  const hasDates = Boolean(pickupDate && returnDate);
  const preferredCarSlug = searchParams.get("preferred");
  const availabilityNotice = searchParams.get("notice");

  useEffect(() => {
    if (!hasDates && !hasHydrated) {
      return;
    }

    if (!hasDates) {
      router.replace("/book");
      return;
    }

    let cancelled = false;

    async function loadCars() {
      router.prefetch("/book/extras");

      const startDate = pickupDate;
      const endDate = returnDate;

      if (!startDate || !endDate) {
        router.replace("/book");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        });
        const res = await fetch(`/api/cars?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load available cars");
        }

        if (!cancelled) {
          setCars(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load available cars"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCars();

    return () => {
      cancelled = true;
    };
  }, [hasDates, hasHydrated, pickupDate, returnDate, router]);

  useEffect(() => {
    if (!preferredCarSlug) {
      setPreferredCarName("");
      return;
    }

    const preferredCar = cars.find((car) => car.slug === preferredCarSlug);
    if (preferredCar) {
      setPreferredCarName(preferredCar.name);
      return;
    }

    const requestedSlug = preferredCarSlug;
    if (!requestedSlug) {
      return;
    }

    let cancelled = false;

    async function loadPreferredCarName() {
      try {
        const res = await fetch(
          `/api/cars?slug=${encodeURIComponent(requestedSlug)}&all=true`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (!cancelled && res.ok) {
          setPreferredCarName(data.name);
        }
      } catch {
        if (!cancelled) {
          setPreferredCarName("");
        }
      }
    }

    void loadPreferredCarName();

    return () => {
      cancelled = true;
    };
  }, [cars, preferredCarSlug]);

  const days =
    pickupDate && returnDate
      ? calculateDays(pickupDate, returnDate)
      : 1;
  const preferredCar = preferredCarSlug
    ? cars.find((car) => car.slug === preferredCarSlug) || null
    : null;
  const preferredBanner =
    preferredCarSlug && !loading && !error
      ? preferredCar
        ? `${preferredCar.name} is available for your dates and pinned first below.`
        : `${preferredCarName || "Your selected car"} is unavailable for those dates. Here are the live available alternatives.`
      : null;

  if (!hasDates && !hasHydrated) {
    return (
      <div>
        <BookingProgress currentStep={2} />
        <div className="mt-8 space-y-5">
          <LuxuryLoader
            title="Restoring Your Search"
            subtitle="Loading your saved dates before checking live availability."
          />
          <VehicleCardsSkeleton />
        </div>
      </div>
    );
  }

  const handleSelect = (car: Car) => {
    setSelectedCar(car);
    setPendingCarSlug(car.slug);
    startTransition(() => {
      router.push(`/book/extras?car=${car.slug}`);
    });
  };

  return (
    <div>
      <BookingProgress currentStep={2} />

      <h1 className="font-[var(--font-inter-tight)] text-3xl font-black">
        Choose Your Car
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {days} day rental · All cars include unlimited mileage
      </p>

      {preferredBanner ? (
        <div
          className={`mt-6 rounded-2xl border p-4 text-sm ${
            preferredCar
              ? "border-[#ff5f00]/20 bg-[#ff5f00]/5 text-foreground"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {preferredBanner}
          {!preferredCar && availabilityNotice === "unavailable" ? (
            <p className="mt-1 text-xs text-amber-800">
              Final validation still happens at checkout, but only cars that are currently available are shown here.
            </p>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 space-y-5">
          <LuxuryLoader
            title="Checking Live Availability"
            subtitle="Matching your dates with the fleet in real time."
          />
          <VehicleCardsSkeleton />
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : cars.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No vehicles are available for the selected dates. Try different dates or return to the fleet.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {isPending && pendingCarSlug ? (
            <LuxuryLoader
              compact
              title="Preparing Your Vehicle"
              subtitle="Loading extras and securing your selection."
            />
          ) : null}
          {[...cars]
            .sort((a, b) => {
              if (preferredCarSlug) {
                if (a.slug === preferredCarSlug) return -1;
                if (b.slug === preferredCarSlug) return 1;
              }

              return a.dailyRate - b.dailyRate;
            })
            .map((car) => (
            <div
              key={car.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-[#ff5f00]/30 hover:shadow-lg md:flex-row"
            >
              {/* Image */}
              <div className="relative h-48 w-full shrink-0 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] md:h-auto md:w-64">
                <Image
                  src={car.imageUrl}
                  alt={car.name}
                  fill
                  className="object-contain p-4"
                />
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-between p-5 md:flex-row md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#ff5f00]">
                      {car.category}
                    </p>
                    {preferredCarSlug === car.slug ? (
                      <span className="rounded-full bg-[#ff5f00]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#ff5f00]">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-1 font-[var(--font-inter-tight)] text-lg font-bold text-foreground">
                    {car.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{car.seats} seats</span>
                    <span>·</span>
                    <span className="capitalize">{car.transmission}</span>
                    <span>·</span>
                    <span>{car.horsepower} HP</span>
                    <span>·</span>
                    <span className="capitalize">{car.fuelType}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{car.tagline}</p>
                </div>

                <div className="mt-4 flex items-center gap-4 md:mt-0 md:flex-col md:items-end">
                  <div className="text-right">
                    <p className="font-[var(--font-inter-tight)] text-2xl font-black text-foreground">
                      {formatCurrency(car.dailyRate * days)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(car.dailyRate)}/day × {days} days
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelect(car)}
                    disabled={isPending}
                    className="rounded-xl bg-[#ff5f00] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-lg hover:shadow-[#ff5f00]/25 disabled:cursor-wait disabled:opacity-60"
                  >
                    {pendingCarSlug === car.slug ? (
                      <span className="flex items-center gap-2">
                        <DotsLoader size="sm" className="text-white" />
                        Preparing...
                      </span>
                    ) : (
                      "Select"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
