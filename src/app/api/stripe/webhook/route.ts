import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import {
  confirmBookingIfNeeded,
  ensureDepositHoldForBooking,
} from "@/lib/stripe-bookings";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const intent = event.data.object as Stripe.PaymentIntent;
  const bookingId = intent.metadata?.bookingId;

  if (!bookingId) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const type = intent.metadata?.type;
        if (type === "rental") {
          await ensureDepositHoldForBooking({
            bookingId,
            rentalPaymentIntentId: intent.id,
          });
          await confirmBookingIfNeeded(bookingId);
        }
        break;
      }

      case "payment_intent.amount_capturable_updated": {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { depositStatus: "held" },
        });
        break;
      }

      case "payment_intent.canceled": {
        const type = intent.metadata?.type;
        if (type === "deposit") {
          // Deposit released
          await prisma.booking.update({
            where: { id: bookingId },
            data: { depositStatus: "released" },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        await prisma.booking.update({
          where: { id: bookingId },
          data:
            intent.metadata?.type === "deposit"
              ? { depositStatus: "none" }
              : { status: "cancelled" },
        });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
  }

  return NextResponse.json({ received: true });
}
