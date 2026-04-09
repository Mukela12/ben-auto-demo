import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

// GET /api/quotes/:id — Get quote details (admin only)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: { car: true },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  return NextResponse.json(quote);
}

// PATCH /api/quotes/:id — Update quote request (admin only)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};

  if (body.status) {
    updateData.status = body.status;
    // Auto-set timestamps
    if (body.status === "contacted" && !body.contactedAt) {
      updateData.contactedAt = new Date();
    }
    if (body.status === "sold" || body.status === "lost") {
      updateData.closedAt = new Date();
    }
  }
  if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes;
  if (body.contactedAt !== undefined) updateData.contactedAt = body.contactedAt;

  const quote = await prisma.quoteRequest.update({
    where: { id },
    data: updateData,
    include: { car: true },
  });

  // If quote is marked as sold, update the car status
  if (body.status === "sold") {
    await prisma.car.update({
      where: { id: quote.carId },
      data: { status: "sold", available: false },
    });
  }

  return NextResponse.json(quote);
}
