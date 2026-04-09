"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { locationsData } from "@/lib/cars-data";

export function HeroSection() {
  const router = useRouter();
  const [mode, setMode] = useState<"rent" | "buy">("rent");
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("2026-04-01");
  const [returnDate, setReturnDate] = useState("2026-04-05");

  const handleRentSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    router.push(`/fleet?${params.toString()}`);
  };

  const handleBuyBrowse = () => {
    router.push("/fleet?mode=buy");
  };

  return (
    <section className="relative h-auto min-h-screen overflow-hidden bg-surface-dark md:h-screen md:min-h-[700px]">
      <Image
        src="/heroes/homepage-hero.jpg"
        alt="Premium car rental"
        fill
        className="object-cover opacity-60"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 lg:px-12 lg:py-5">
        <Image src="/brand/ben-auto-logo.png" alt="Ben Auto" width={140} height={46} className="h-10 w-auto md:h-12" />
        <div className="hidden items-center gap-6 md:flex">
          <a href="/fleet" className="text-sm font-medium text-white/80 transition-colors hover:text-white">Fleet</a>
          <a href="/fleet?mode=buy" className="text-sm font-medium text-white/80 transition-colors hover:text-white">Buy</a>
          <a href="/login" className="text-sm font-medium text-white/80 transition-colors hover:text-white">Admin</a>
          <a href="/book" className="rounded-full bg-[#ff5f00] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-lg hover:shadow-[#ff5f00]/25">
            Book a Car
          </a>
        </div>
        <a href="/login" className="text-xs font-medium text-white/60 md:hidden">Admin</a>
      </nav>

      {/* Mobile hero */}
      <div className="relative z-10 flex flex-col items-center px-4 pb-8 pt-8 text-center md:hidden">
        <Image src="/brand/ben-auto-logo.png" alt="Ben Auto" width={280} height={93} className="h-24 w-auto" />
        <p className="mt-4 max-w-sm text-sm text-white/70">
          Premium car rental &amp; sales at prices you&apos;ll love.
        </p>

        {/* Rent/Buy Toggle */}
        <div className="mt-6 w-full">
          <ModeToggle mode={mode} setMode={setMode} />
        </div>

        {/* Search area */}
        <div className="mt-4 w-full">
          {mode === "rent" ? (
            <RentSearchBar
              location={location}
              setLocation={setLocation}
              pickupDate={pickupDate}
              setPickupDate={setPickupDate}
              returnDate={returnDate}
              setReturnDate={setReturnDate}
              onSearch={handleRentSearch}
            />
          ) : (
            <BuySearchBar onBrowse={handleBuyBrowse} />
          )}
        </div>
      </div>

      {/* Desktop hero */}
      <div className="relative z-10 hidden h-full flex-col items-center justify-center px-6 text-center md:flex">
        <Image src="/brand/ben-auto-logo.png" alt="Ben Auto" width={400} height={133} className="h-36 w-auto lg:h-44" />
        <p className="mt-6 max-w-lg text-lg text-white/70">
          Premium car rental &amp; sales at prices you&apos;ll love.
        </p>
      </div>

      {/* Desktop: search bar pinned to bottom */}
      <div className="absolute bottom-8 left-1/2 z-20 hidden w-full max-w-5xl -translate-x-1/2 px-4 md:block">
        <div className="flex flex-col items-center gap-4">
          <ModeToggle mode={mode} setMode={setMode} />
          {mode === "rent" ? (
            <RentSearchBar
              location={location}
              setLocation={setLocation}
              pickupDate={pickupDate}
              setPickupDate={setPickupDate}
              returnDate={returnDate}
              setReturnDate={setReturnDate}
              onSearch={handleRentSearch}
            />
          ) : (
            <BuySearchBar onBrowse={handleBuyBrowse} />
          )}
        </div>
      </div>
    </section>
  );
}

function ModeToggle({ mode, setMode }: { mode: "rent" | "buy"; setMode: (m: "rent" | "buy") => void }) {
  return (
    <div className="inline-flex rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-xl">
      <button
        onClick={() => setMode("rent")}
        className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
          mode === "rent"
            ? "bg-[#ff5f00] text-white shadow-lg shadow-[#ff5f00]/30"
            : "text-white/60 hover:text-white"
        }`}
      >
        Rent
      </button>
      <button
        onClick={() => setMode("buy")}
        className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
          mode === "buy"
            ? "bg-[#ff5f00] text-white shadow-lg shadow-[#ff5f00]/30"
            : "text-white/60 hover:text-white"
        }`}
      >
        Buy
      </button>
    </div>
  );
}

function RentSearchBar({
  location, setLocation, pickupDate, setPickupDate, returnDate, setReturnDate, onSearch,
}: {
  location: string; setLocation: (v: string) => void;
  pickupDate: string; setPickupDate: (v: string) => void;
  returnDate: string; setReturnDate: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-5">
      {/* Desktop */}
      <div className="hidden md:flex md:items-end md:gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Location</label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-8 text-sm text-white outline-none transition-all focus:border-[#ff5f00]/50 focus:bg-white/10">
              <option value="" className="bg-[#1a1a1a] text-white">Select pickup</option>
              {locationsData.map((loc) => (
                <option key={loc.name} value={loc.name} className="bg-[#1a1a1a] text-white">{loc.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-10 w-px bg-white/10" />
        <div className="w-40">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Pickup</label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition-all focus:border-[#ff5f00]/50 focus:bg-white/10 [color-scheme:dark]" />
          </div>
        </div>
        <div className="h-10 w-px bg-white/10" />
        <div className="w-40">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Return</label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={pickupDate} className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition-all focus:border-[#ff5f00]/50 focus:bg-white/10 [color-scheme:dark]" />
          </div>
        </div>
        <button onClick={onSearch} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5f00] text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-lg hover:shadow-[#ff5f00]/30">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-2.5 md:hidden">
        <div className="relative">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-[#ff5f00]/50">
            <option value="" className="bg-[#1a1a1a]">Select pickup location</option>
            {locationsData.map((loc) => (
              <option key={loc.name} value={loc.name} className="bg-[#1a1a1a]">{loc.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-2 text-xs text-white outline-none focus:border-[#ff5f00]/50 [color-scheme:dark]" />
          </div>
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={pickupDate} className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-2 text-xs text-white outline-none focus:border-[#ff5f00]/50 [color-scheme:dark]" />
          </div>
        </div>
        <button onClick={onSearch} className="flex items-center justify-center gap-2 rounded-lg bg-[#ff5f00] py-3 text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90">
          Show Cars
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function BuySearchBar({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-5">
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-medium text-white">Looking to buy?</p>
          <p className="mt-1 text-xs text-white/50">Browse our selection of quality vehicles for sale</p>
        </div>
        <button
          onClick={onBrowse}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff5f00] px-8 py-3 text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-lg hover:shadow-[#ff5f00]/30 md:w-auto"
        >
          Browse Cars for Sale
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
