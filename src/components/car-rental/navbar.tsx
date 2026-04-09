"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/ben-auto-logo.png" alt="Ben Auto" width={120} height={40} className="h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/fleet"
            className={cn(
              "text-sm font-medium transition-colors hover:text-foreground",
              isActive("/fleet") ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Fleet
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Locations
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How it Works
          </Link>
          <ThemeToggle />
          <Link
            href="/book"
            className="rounded-full bg-[#ff5f00] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-lg hover:shadow-[#ff5f00]/25"
          >
            Book a Car
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg"
          >
            <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/fleet" className="text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
              Fleet
            </Link>
            <Link href="/" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Locations
            </Link>
            <Link href="/" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
              How it Works
            </Link>
            <Link
              href="/book"
              className="mt-2 rounded-full bg-[#ff5f00] px-6 py-2.5 text-center text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Book a Car
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
