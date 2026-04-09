"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { DotsLoader } from "@/components/ui/loader";
import { LuxuryLoader } from "@/components/ui/luxury-loader";
import { notify } from "@/lib/notify";
import type { Booking } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositStatus, setDepositStatus] = useState<string>("none");
  const [bookingStatus, setBookingStatus] = useState<string>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBooking() {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        const data = await res.json();

        if (!cancelled && res.ok) {
          setBooking(data);
          setDepositStatus(data.depositStatus);
          setBookingStatus(data.status);
        }
      } catch {
        // Keep the fallback state and show a friendly error below.
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBooking();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDepositAction = async (action: "capture" | "release") => {
    if (!booking) return;
    setActionLoading(action);
    try {
      const endpoint = action === "capture" ? "/api/stripe/capture" : "/api/stripe/release";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} deposit`);
      }
      setDepositStatus(action === "capture" ? "captured" : "released");
      if (action === "release") setBookingStatus("completed");
      notify.success(
        action === "capture" ? "Deposit captured" : "Deposit released",
        {
          description:
            action === "capture"
              ? "The security deposit has been charged."
              : "The hold has been released back to the customer.",
        }
      );
    } catch (error) {
      notify.error("Deposit update failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
    setActionLoading(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!booking) return;
    setActionLoading("status");
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to update booking status");
      }
      setBookingStatus(newStatus);
      notify.success("Booking status updated", {
        description: `Booking is now marked ${newStatus}.`,
      });
    } catch (error) {
      notify.error("Status update failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
    setActionLoading(null);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <LuxuryLoader
        title="Loading Booking"
        subtitle="Fetching the latest trip and deposit details."
      />
    );
  }

  if (!booking) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Booking not found or could not be loaded.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/admin/bookings" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Bookings
          </Link>
          <h1 className="mt-2 font-[var(--font-inter-tight)] text-2xl font-black">
            Booking {booking.bookingRef}
          </h1>
        </div>
        <span className={`self-start rounded-full px-3 py-1 text-xs font-bold uppercase ${statusColors[bookingStatus] || "bg-gray-100 text-gray-800"}`}>
          {bookingStatus}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Car Info */}
          {booking.car && (
            <div className="flex items-center gap-4 rounded-xl bg-card p-6 shadow-sm">
              <div className="relative h-20 w-32 shrink-0 rounded-xl bg-surface-dark">
                <Image src={booking.car.imageUrl} alt={booking.car.name} fill className="object-contain p-2" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#ff5f00]">{booking.car.category}</p>
                <h3 className="font-[var(--font-inter-tight)] text-lg font-bold">{booking.car.name}</h3>
                <p className="text-sm text-muted-foreground">{booking.car.brand} · {booking.car.horsepower} HP · {booking.car.transmission}</p>
              </div>
            </div>
          )}

          {/* Trip Details */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h3 className="font-[var(--font-inter-tight)] text-base font-bold">Trip Details</h3>
            <div className="mt-4 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pickup</p>
                <p className="mt-1 font-medium">{booking.pickupLocation}</p>
                <p className="text-sm text-muted-foreground">{formatDate(booking.pickupDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Return</p>
                <p className="mt-1 font-medium">{booking.returnLocation}</p>
                <p className="text-sm text-muted-foreground">{formatDate(booking.returnDate)}</p>
              </div>
            </div>
            {(booking.extras.insurance || booking.extras.gps || booking.extras.childSeat > 0) && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Extras</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {booking.extras.insurance && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">Insurance</span>}
                  {booking.extras.gps && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">GPS</span>}
                  {booking.extras.childSeat > 0 && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">Child Seat</span>}
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h3 className="font-[var(--font-inter-tight)] text-base font-bold">Customer</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{booking.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{booking.customerEmail}</span>
              </div>
              {booking.customerPhone && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{booking.customerPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h3 className="font-[var(--font-inter-tight)] text-base font-bold">Payment</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Charged</span>
                <span className="font-bold">{formatCurrency(booking.totalPrice)}</span>
              </div>
              {booking.stripePaymentId && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Stripe ID</span>
                  <span className="font-mono text-muted-foreground">{booking.stripePaymentId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Deposit Management - THE KEY FEATURE */}
          <div className="rounded-xl border-2 border-[#ff5f00]/20 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-[#ff5f00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="font-[var(--font-inter-tight)] text-base font-bold">Security Deposit</h3>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hold Amount</span>
                <span className="font-bold">{formatCurrency(booking.depositAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  depositStatus === "held"
                    ? "bg-amber-100 text-amber-800"
                    : depositStatus === "released"
                      ? "bg-green-100 text-green-800"
                      : depositStatus === "captured"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-600"
                }`}>
                  {depositStatus}
                </span>
              </div>
              {booking.stripeDepositId && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Stripe Hold ID</span>
                  <span className="font-mono text-muted-foreground">{booking.stripeDepositId}</span>
                </div>
              )}
            </div>

            {depositStatus === "held" && (
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => handleDepositAction("release")}
                  disabled={actionLoading !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition-all hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading === "release" ? (
                    <DotsLoader size="sm" className="text-white" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  )}
                  Release Deposit
                </button>
                <button
                  onClick={() => handleDepositAction("capture")}
                  disabled={actionLoading !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 py-3 text-sm font-bold text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                >
                  {actionLoading === "capture" ? (
                    <DotsLoader size="sm" className="text-red-700" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                  Capture Deposit (Damage)
                </button>
                <p className="text-center text-[10px] text-muted-foreground">
                  Release returns the hold. Capture charges the customer.
                </p>
              </div>
            )}

            {depositStatus === "released" && (
              <div className="mt-4 rounded-xl bg-green-50 p-3 text-center text-xs text-green-700">
                Deposit has been released back to the customer.
              </div>
            )}

            {depositStatus === "captured" && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-xs text-red-700">
                Deposit has been charged to the customer for damages.
              </div>
            )}
          </div>

          {/* Status Management */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h3 className="font-[var(--font-inter-tight)] text-base font-bold">Update Status</h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["pending", "confirmed", "active", "completed"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={bookingStatus === s || actionLoading !== null}
                  className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-all ${
                    bookingStatus === s
                      ? "bg-[#ff5f00] text-white"
                      : "bg-secondary text-muted-foreground hover:bg-border disabled:opacity-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
