import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const bookingRef = searchParams.get("bookingRef");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (bookingRef) where.bookingRef = bookingRef;

  if (bookingRef) {
    const booking = await prisma.booking.findFirst({
      where,
      include: { car: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  }

  const adminSession = await getAdminSessionFromRequest(request);
  if (!adminSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: { car: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST() {
  return NextResponse.json(
    { error: "Use /api/checkout for new bookings" },
    { status: 410 }
  );
}
