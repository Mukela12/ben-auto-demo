import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateBookingRef } from "@/lib/utils";
import { stripe } from "@/lib/stripe";
import { calculateBookingTotals, normalizeBookingExtras } from "@/lib/booking";
import { ensureStripeCustomer } from "@/lib/stripe-bookings";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      carId,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation,
      customerName,
      customerEmail,
      customerPhone,
      extras,
    } = body;

    if (!carId || !pickupDate || !returnDate || !pickupLocation || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required checkout fields" },
        { status: 400 }
      );
    }

    const pickupAt = new Date(pickupDate);
    const returnAt = new Date(returnDate);

    if (
      Number.isNaN(pickupAt.getTime()) ||
      Number.isNaN(returnAt.getTime()) ||
      returnAt <= pickupAt
    ) {
      return NextResponse.json(
        { error: "Pickup and return dates are invalid" },
        { status: 400 }
      );
    }

    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        carId: car.id,
        status: { in: ["confirmed", "active"] },
        pickupDate: { lt: returnAt },
        returnDate: { gt: pickupAt },
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "This vehicle is no longer available for those dates" },
        { status: 409 }
      );
    }

    const normalizedExtras = normalizeBookingExtras(extras);
    const pricing = calculateBookingTotals({
      car,
      pickupDate: pickupAt,
      returnDate: returnAt,
      extras: normalizedExtras,
    });

    const customer = await ensureStripeCustomer({
      customerEmail,
      customerName,
      customerPhone,
    });

    const booking = await prisma.booking.create({
      data: {
        bookingRef: generateBookingRef(),
        status: "pending",
        pickupDate: pickupAt,
        returnDate: returnAt,
        pickupLocation,
        returnLocation: returnLocation || pickupLocation,
        totalPrice: pricing.total,
        depositAmount: pricing.depositAmount,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        extras: normalizedExtras as unknown as Prisma.InputJsonValue,
        carId,
      },
    });

    try {
      const rentalIntent = await stripe.paymentIntents.create({
        amount: pricing.total,
        currency: "usd",
        customer: customer.id,
        capture_method: "automatic",
        payment_method_types: ["card"],
        setup_future_usage: "off_session",
        metadata: {
          bookingId: booking.id,
          bookingRef: booking.bookingRef,
          type: "rental",
        },
        receipt_email: customerEmail,
        description: `Ben Auto rental - ${booking.bookingRef}`,
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          stripePaymentId: rentalIntent.id,
        },
      });

      return NextResponse.json({
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        rentalClientSecret: rentalIntent.client_secret,
        totalPrice: pricing.total,
        depositAmount: pricing.depositAmount,
      });
    } catch (error) {
      await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
