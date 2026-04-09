"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MetricCardsSkeleton, TableRowsSkeleton } from "@/components/ui/luxury-loader";
import type { Booking } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      try {
        const res = await fetch("/api/bookings");
        const data = await res.json();
        if (!cancelled && res.ok) {
          setBookings(data);
        }
      } catch {
        // Keep the dashboard usable even if the network flakes.
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();
  const monthRevenue = bookings
    .filter((booking) => {
      const createdAt = new Date(booking.createdAt);
      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

  const stats = [
    {
      label: "Total Bookings",
      value: String(bookings.length),
      change: `${bookings.filter((booking) => booking.status === "pending").length} pending`,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      label: "Revenue (MTD)",
      value: formatCurrency(monthRevenue),
      change: `${bookings.filter((booking) => booking.status === "confirmed").length} confirmed`,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Active Rentals",
      value: String(bookings.filter((booking) => booking.status === "active").length),
      change: `${bookings.filter((booking) => booking.status === "completed").length} completed`,
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      label: "Deposits Held",
      value: formatCurrency(
        bookings
          .filter((booking) => booking.depositStatus === "held")
          .reduce((sum, booking) => sum + booking.depositAmount, 0)
      ),
      change: `${bookings.filter((booking) => booking.depositStatus === "held").length} active`,
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
  ];

  return (
    <div>
      <h1 className="font-[var(--font-inter-tight)] text-2xl font-black">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {loading ? "Loading your live dashboard..." : "Overview of your rental business"}
      </p>

      {/* Stats Grid */}
      {loading ? (
        <div className="mt-4 space-y-6">
          <MetricCardsSkeleton />
          <TableRowsSkeleton rows={4} columns={7} />
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-card p-3 shadow-sm md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff5f00]/10 md:h-10 md:w-10 md:rounded-xl">
                    <svg className="h-4 w-4 text-[#ff5f00] md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                    </svg>
                  </div>
                  <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 md:px-2 md:text-xs">
                    {stat.change}
                  </span>
                </div>
                <p className="mt-2 font-[var(--font-inter-tight)] text-lg font-black md:mt-4 md:text-2xl">{stat.value}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground md:mt-1 md:text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Bookings */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-inter-tight)] text-lg font-bold">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-sm font-medium text-[#ff5f00] hover:underline">
                View All
              </Link>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl bg-card shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Car</th>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Deposit</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-border last:border-0 hover:bg-background transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/admin/bookings/${booking.id}`} className="font-mono text-sm font-bold text-[#ff5f00] hover:underline">
                          {booking.bookingRef}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{booking.customerName}</p>
                        <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">{booking.car?.name || "—"}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {formatDate(booking.pickupDate)} → {formatDate(booking.returnDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{formatCurrency(booking.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          booking.depositStatus === "held"
                            ? "bg-amber-100 text-amber-800"
                            : booking.depositStatus === "released"
                              ? "bg-green-100 text-green-800"
                              : booking.depositStatus === "captured"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-600"
                        }`}>
                          {booking.depositStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${statusColors[booking.status] || "bg-gray-100 text-gray-800"}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
