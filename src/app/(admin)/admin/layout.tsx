"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/car-rental/theme-toggle";
import { MobileDockWrapper } from "@/components/car-rental/mobile-dock";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Bookings", href: "/admin/bookings", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { label: "Quotes", href: "/admin/quotes", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { label: "Fleet", href: "/admin/fleet", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("admin@benauto.com");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (!res.ok) {
        router.replace("/login");
        return;
      }

      const data = await res.json();
      if (!cancelled && data.user?.email) {
        setAdminEmail(data.user.email);
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  const adminInitials = adminEmail
    .split("@")[0]
    .split(/[.\-_]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "AD";

  return (
    <div className="h-screen overflow-hidden bg-secondary">
      {/* Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-64 border-r border-border bg-card">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand/ben-auto-logo.png" alt="Ben Auto" width={100} height={34} className="h-8 w-auto" />
          </Link>
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
            Admin
          </span>
        </div>

        {/* User Profile */}
        <div className="border-b border-border px-4 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ff5f00] to-[#ff8534] text-sm font-bold text-white shadow-lg shadow-[#ff5f00]/20">
              {adminInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">Admin</p>
              <p className="truncate text-[11px] text-muted-foreground">{adminEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  active
                    ? "bg-[#ff5f00]/10 text-[#ff5f00] border-l-[3px] border-[#ff5f00]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions - Fixed */}
        <div className="border-t border-border px-3 py-3 space-y-1 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Site
          </Link>
          <button
            onClick={() => {
              void handleSignOut();
            }}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {signingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content — offset by sidebar width */}
      <div className="flex h-full flex-col lg:pl-64">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/" className="flex items-center">
              <Image src="/brand/ben-auto-logo.png" alt="Ben Auto" width={100} height={34} className="h-8 w-auto" />
            </Link>
            <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">Admin</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5f00] text-xs font-bold text-white">
                {adminInitials[0] || "A"}
              </div>
              <span className="hidden text-sm font-medium text-foreground sm:block">{adminEmail}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-24 lg:p-8 lg:pb-8">{children}</main>
      </div>
      <MobileDockWrapper />
    </div>
  );
}
