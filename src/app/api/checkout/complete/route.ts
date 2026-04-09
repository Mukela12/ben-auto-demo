import { NextResponse } from "next/server";
import {
  confirmBookingIfNeeded,
  ensureDepositHoldForBooking,
} from "@/lib/stripe-bookings";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { bookingId, rentalPaymentIntentId } = await request.json();

    if (!bookingId || !rentalPaymentIntentId) {
      return NextResponse.json(
        { error: "bookingId and rentalPaymentIntentId are required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await ensureDepositHoldForBooking({
      bookingId,
      rentalPaymentIntentId,
    });
    await confirmBookingIfNeeded(bookingId);
    const confirmedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    return NextResponse.json({
      success: true,
      bookingRef: confirmedBooking?.bookingRef || booking.bookingRef,
      depositStatus: confirmedBooking?.depositStatus || booking.depositStatus,
    });
  } catch (error) {
    console.error("Checkout completion error:", error);
    return NextResponse.json(
      { error: "Failed to finalize booking" },
      { status: 500 }
    );
  }
}
