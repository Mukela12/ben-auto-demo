import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const adminSession = await getAdminSessionFromRequest(request);
  if (!adminSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId, amount } = await request.json();

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking?.stripeDepositId) {
      return NextResponse.json({ error: "No deposit hold found" }, { status: 400 });
    }

    await stripe.paymentIntents.capture(booking.stripeDepositId, {
      amount_to_capture: amount || booking.depositAmount,
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { depositStatus: "captured" },
    });

    return NextResponse.json({ success: true, status: "captured" });
  } catch (error) {
    console.error("Capture error:", error);
    return NextResponse.json({ error: "Failed to capture deposit" }, { status: 500 });
  }
}
