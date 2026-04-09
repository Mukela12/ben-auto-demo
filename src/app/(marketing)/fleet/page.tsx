"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { carsData } from "@/lib/cars-data";
import { formatCurrency } from "@/lib/utils";
import type { CarCategory } from "@/types";

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

const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export default function FleetPage() {
  const [activeCategory, setActiveCategory] = useState<CarCategory | "all">("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [apiCars, setApiCars] = useState<typeof carsData | null>(null);

  useEffect(() => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then((data) => setApiCars(data))
      .catch(() => setApiCars(null)); // fallback to static
  }, []);

  const allCars = apiCars || carsData;

  let filteredCars = [...allCars];

  if (activeCategory !== "all") {
    filteredCars = filteredCars.filter((car) => car.category === activeCategory);
  }

  switch (sortBy) {
    case "price-asc":
      filteredCars.sort((a, b) => a.dailyRate - b.dailyRate);
      break;
    case "price-desc":
      filteredCars.sort((a, b) => b.dailyRate - a.dailyRate);
      break;
    case "recommended":
    default:
      filteredCars.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
  }

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-dark py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,95,0,0.08),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <h1 className="font-[var(--font-inter-tight)] text-4xl font-black uppercase tracking-tight text-white md:text-6xl">
            Our Fleet
          </h1>
          <p className="mt-4 text-lg text-white/60">
            From economy to ultra-luxury. Every car maintained to perfection.
          </p>
        </div>
      </section>

      {/* Filter Bar + Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Category Pills */}
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

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#ff5f00]/20"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="mb-6 text-sm text-muted-foreground">
          {filteredCars.length} vehicle{filteredCars.length !== 1 ? "s" : ""} available
        </p>

        {/* Car Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
          {filteredCars.map((car) => (
            <Link
              key={car.slug}
              href={`/fleet/${car.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
            >
              {/* Featured Badge */}
              {car.featured && (
                <div className="absolute left-2 top-2 z-10 rounded-full bg-[#ff5f00] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white md:left-4 md:top-4 md:px-3 md:py-1 md:text-[10px]">
                  Featured
                </div>
              )}

              {/* Car Image */}
              <div className="relative h-32 w-full overflow-hidden bg-gradient-to-b from-[#2d2d2d] via-[#1f1f1f] to-[#141414] md:h-56">
                {/* Ambient light effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(255,255,255,0.06),transparent_60%)]" />
                {/* Floor reflection */}
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
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-[#ff5f00] md:text-[10px]">
                      {car.category}
                    </p>
                    <h3 className="mt-0.5 truncate font-[var(--font-inter-tight)] text-xs font-bold text-foreground md:mt-1 md:text-lg">
                      {car.name}
                    </h3>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="hidden text-xs text-muted-foreground md:block">From</p>
                    <p className="font-[var(--font-inter-tight)] text-sm font-bold text-foreground md:text-xl">
                      {formatCurrency(car.dailyRate)}
                      <span className="text-[8px] font-normal text-muted-foreground md:text-xs">/day</span>
                    </p>
                  </div>
                </div>

                {/* Specs Row */}
                <div className="mt-2 hidden items-center gap-3 border-t border-border pt-3 md:mt-4 md:flex md:pt-4">
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
