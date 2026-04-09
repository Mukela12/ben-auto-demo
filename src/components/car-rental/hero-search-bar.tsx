"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { locationsData } from "@/lib/cars-data";

export function HeroSearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("2026-04-01");
  const [returnDate, setReturnDate] = useState("2026-04-05");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    router.push(`/fleet?${params.toString()}`);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-5">
      {/* Desktop: horizontal row */}
      <div className="hidden md:flex md:items-end md:gap-3">
        {/* Location */}
        <div className="flex-1">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Location
          </label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-8 text-sm text-white outline-none transition-all focus:border-[#ff5f00]/50 focus:bg-white/10"
            >
              <option value="" className="bg-[#1a1a1a] text-white">Select pickup</option>
              {locationsData.map((loc) => (
                <option key={loc.name} value={loc.name} className="bg-[#1a1a1a] text-white">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-white/10" />

        {/* Pickup */}
        <div className="w-40">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Pickup
          </label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition-all focus:border-[#ff5f00]/50 focus:bg-white/10 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-white/10" />

        {/* Return */}
        <div className="w-40">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Return
          </label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={pickupDate}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition-all focus:border-[#ff5f00]/50 focus:bg-white/10 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff5f00] text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-lg hover:shadow-[#ff5f00]/30"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Mobile: compact 2-row layout */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {/* Location row */}
        <div className="relative">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-[#ff5f00]/50"
          >
            <option value="" className="bg-[#1a1a1a]">Select pickup location</option>
            {locationsData.map((loc) => (
              <option key={loc.name} value={loc.name} className="bg-[#1a1a1a]">
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dates row: side by side */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-2 text-xs text-white outline-none focus:border-[#ff5f00]/50 [color-scheme:dark]"
            />
          </div>
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={pickupDate}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-2 text-xs text-white outline-none focus:border-[#ff5f00]/50 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#ff5f00] py-3 text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90"
        >
          Show Cars
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
