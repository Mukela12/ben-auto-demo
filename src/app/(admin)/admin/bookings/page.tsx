"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { TableRowsSkeleton } from "@/components/ui/luxury-loader";
import type { Booking } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function BookingsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
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
        // Keep the page rendering if the request fails.
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

  const filtered = bookings.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (search && !b.customerName.toLowerCase().includes(search.toLowerCase()) && !b.bookingRef.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h1 className="font-[var(--font-inter-tight)] text-2xl font-black">Bookings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {loading ? "Loading bookings..." : "Manage all rental bookings"}
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "confirmed", "active", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-all ${
                filter === s ? "bg-[#ff5f00] text-white" : "bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name or ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20 md:w-64"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="mt-6">
          <TableRowsSkeleton rows={6} columns={8} />
        </div>
      ) : (
      <div className="mt-6 overflow-hidden rounded-xl bg-card shadow-sm">
        <div className="overflow-x-auto">
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
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-[#ff5f00]">{booking.bookingRef}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{booking.customerName}</p>
                    <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">{booking.car?.name || "—"}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {formatDate(booking.pickupDate)}
                    <br />
                    {formatDate(booking.returnDate)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{formatCurrency(booking.totalPrice)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      booking.depositStatus === "held" ? "bg-amber-100 text-amber-800"
                        : booking.depositStatus === "released" ? "bg-green-100 text-green-800"
                          : booking.depositStatus === "captured" ? "bg-red-100 text-red-800"
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
                  <td className="px-6 py-4">
                    <Link href={`/admin/bookings/${booking.id}`} className="text-xs font-medium text-[#ff5f00] hover:underline">
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
