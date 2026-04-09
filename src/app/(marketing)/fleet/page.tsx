"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { carsData } from "@/lib/cars-data";
import { formatCurrency } from "@/lib/utils";
import type { Car, CarCategory } from "@/types";

const categories: { label: string; value: CarCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Sedan", value: "sedan" },
  { label: "SUV", value: "suv" },
  { label: "Convertible", value: "convertible" },
  { label: "Coupe", value: "coupe" },
  { label: "Luxury", value: "luxury" },
  { label: "Van", value: "van" },
  { label: "Truck", value: "truck" },
];

export default function FleetPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff5f00] border-t-transparent" /></div>}>
      <FleetContent />
    </Suspense>
  );
}

function FleetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get("mode") as "rent" | "buy") || "rent";

  const [activeCategory, setActiveCategory] = useState<CarCategory | "all">("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [apiCars, setApiCars] = useState<Car[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (mode === "buy") params.set("mode", "buy");
    else params.set("mode", "rent");

    fetch(`/api/cars?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setApiCars(data))
      .catch(() => setApiCars(null));
  }, [mode]);

  const allCars = (apiCars || carsData) as Car[];

  let filteredCars = [...allCars];
  if (activeCategory !== "all") {
    filteredCars = filteredCars.filter((car) => car.category === activeCategory);
  }

  const priceField = mode === "buy" ? "salePrice" : "dailyRate";
  switch (sortBy) {
    case "price-asc":
      filteredCars.sort((a, b) => (a[priceField] || 0) - (b[priceField] || 0));
      break;
    case "price-desc":
      filteredCars.sort((a, b) => (b[priceField] || 0) - (a[priceField] || 0));
      break;
    default:
      filteredCars.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
  }

  const setMode = (newMode: "rent" | "buy") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", newMode);
    router.push(`/fleet?${params.toString()}`);
  };

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-dark py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,95,0,0.08),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <h1 className="font-[var(--font-inter-tight)] text-4xl font-black uppercase tracking-tight text-white md:text-6xl">
            {mode === "buy" ? "Cars for Sale" : "Our Fleet"}
          </h1>
          <p className="mt-4 text-lg text-white/60">
            {mode === "buy"
              ? "Quality pre-owned vehicles at competitive prices."
              : "From economy to ultra-luxury. Every car maintained to perfection."}
          </p>

          {/* Mode Toggle */}
          <div className="mt-8 inline-flex rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-xl">
            <button
              onClick={() => setMode("rent")}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                mode === "rent" ? "bg-[#ff5f00] text-white shadow-lg shadow-[#ff5f00]/30" : "text-white/60 hover:text-white"
              }`}
            >
              Rent
            </button>
            <button
              onClick={() => setMode("buy")}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                mode === "buy" ? "bg-[#ff5f00] text-white shadow-lg shadow-[#ff5f00]/30" : "text-white/60 hover:text-white"
              }`}
            >
              Buy
            </button>
          </div>
        </div>
      </section>

      {/* Filter Bar + Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat.value
                    ? "bg-[#ff5f00] text-white shadow-lg shadow-[#ff5f00]/25"
                    : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#ff5f00]/20"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          {filteredCars.length} vehicle{filteredCars.length !== 1 ? "s" : ""} available
        </p>

        {/* Car Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
          {filteredCars.map((car) => (
            <CarCard key={car.slug} car={car} mode={mode} />
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">No vehicles found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or switch modes.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function CarCard({ car, mode }: { car: Car; mode: "rent" | "buy" }) {
  const isBuyMode = mode === "buy";
  const href = isBuyMode ? `/buy/quote?car=${car.slug}` : `/fleet/${car.slug}`;

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
    >
      {/* Badges */}
      <div className="absolute left-2 top-2 z-10 flex gap-1.5 md:left-4 md:top-4">
        {car.featured && (
          <span className="rounded-full bg-[#ff5f00] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white md:px-3 md:py-1 md:text-[10px]">
            Featured
          </span>
        )}
        {isBuyMode && car.condition && (
          <span className="rounded-full bg-green-600 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white md:px-3 md:py-1 md:text-[10px]">
            {car.condition.replace("_", " ")}
          </span>
        )}
      </div>

      {/* Car Image */}
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-b from-[#2d2d2d] via-[#1f1f1f] to-[#141414] md:h-56">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <Image
          src={car.imageUrl}
          alt={car.name}
          fill
          className="object-contain p-3 drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-[1.08]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Info */}
      <div className="p-3 md:p-5">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-wider text-[#ff5f00] md:text-[10px]">{car.category}</p>
            <h3 className="mt-0.5 truncate font-[var(--font-inter-tight)] text-xs font-bold text-foreground md:mt-1 md:text-lg">
              {car.name}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            {isBuyMode ? (
              <>
                <p className="font-[var(--font-inter-tight)] text-sm font-bold text-foreground md:text-xl">
                  {car.salePrice ? `$${(car.salePrice / 100).toLocaleString()}` : "Contact"}
                </p>
                {car.salePrice && (
                  <p className="text-[8px] text-muted-foreground md:text-[10px]">
                    (ZMW {((car.salePrice / 100) * 27.85).toLocaleString("en-US", { maximumFractionDigits: 0 })})
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="hidden text-xs text-muted-foreground md:block">From</p>
                <p className="font-[var(--font-inter-tight)] text-sm font-bold text-foreground md:text-xl">
                  {formatCurrency(car.dailyRate)}
                  <span className="text-[8px] font-normal text-muted-foreground md:text-xs">/day</span>
                </p>
                <p className="text-[8px] text-muted-foreground md:text-[10px]">
                  (ZMW {((car.dailyRate / 100) * 27.85).toLocaleString("en-US", { maximumFractionDigits: 0 })}/day)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Specs Row */}
        <div className="mt-2 hidden items-center gap-3 border-t border-border pt-3 md:mt-4 md:flex md:pt-4">
          {isBuyMode ? (
            <>
              {car.year && (
                <span className="text-xs text-muted-foreground">{car.year}</span>
              )}
              {car.mileage != null && (
                <span className="text-xs text-muted-foreground">{car.mileage.toLocaleString()} mi</span>
              )}
              <span className="text-xs text-muted-foreground">{car.horsepower} HP</span>
              <span className="ml-auto flex items-center gap-1 text-xs font-medium text-[#ff5f00] opacity-0 transition-opacity group-hover:opacity-100">
                Request Quote
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-muted-foreground">{car.seats}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs capitalize text-muted-foreground">{car.transmission}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs text-muted-foreground">{car.horsepower} HP</span>
              </div>
              <span className="ml-auto flex items-center gap-1 text-xs font-medium text-[#ff5f00] opacity-0 transition-opacity group-hover:opacity-100">
                View
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
