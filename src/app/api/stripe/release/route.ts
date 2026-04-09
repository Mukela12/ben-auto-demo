import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const adminSession = await getAdminSessionFromRequest(request);
  if (!adminSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await request.json();

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking?.stripeDepositId) {
      return NextResponse.json({ error: "No deposit hold found" }, { status: 400 });
    }

    await stripe.paymentIntents.cancel(booking.stripeDepositId);

    await prisma.booking.update({
      where: { id: bookingId },
      data: { depositStatus: "released", status: "completed" },
    });

    return NextResponse.json({ success: true, status: "released" });
  } catch (error) {
    console.error("Release error:", error);
    return NextResponse.json({ error: "Failed to release deposit" }, { status: 500 });
  }
}
