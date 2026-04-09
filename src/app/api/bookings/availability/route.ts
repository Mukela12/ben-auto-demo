import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const carId = searchParams.get("carId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!carId || !start || !end) {
    return NextResponse.json(
      { error: "carId, start, and end are required" },
      { status: 400 }
    );
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Check for overlapping bookings
  const conflicts = await prisma.booking.findMany({
    where: {
      carId,
      status: { in: ["confirmed", "active"] },
      pickupDate: { lt: endDate },
      returnDate: { gt: startDate },
    },
  });

  return NextResponse.json({
    available: conflicts.length === 0,
    conflicts: conflicts.map((c) => ({
      pickupDate: c.pickupDate,
      returnDate: c.returnDate,
    })),
  });
}
