import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

// POST /api/quotes — Create a new quote request (public)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carId, customerName, customerEmail, customerPhone, message, financingInterest, tradeInInterest } = body;

    if (!carId || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: "Missing required fields: carId, customerName, customerEmail, customerPhone" }, { status: 400 });
    }

    // Validate car exists and is for sale
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }
    if (car.listingType === "rent") {
      return NextResponse.json({ error: "This car is not available for purchase" }, { status: 400 });
    }
    if (car.status === "sold" || car.status === "unlisted") {
      return NextResponse.json({ error: "This car is no longer available" }, { status: 400 });
    }

    // Generate reference number
    const referenceNumber = `QR-${Date.now().toString(36).toUpperCase()}`;

    // Create quote request
    const quote = await prisma.quoteRequest.create({
      data: {
        referenceNumber,
        carId,
        customerName,
        customerEmail,
        customerPhone,
        message: message || null,
        financingInterest: financingInterest || false,
        tradeInInterest: tradeInInterest || false,
      },
      include: { car: true },
    });

    // Send confirmation email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/email/quote-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail,
          customerName,
          customerPhone,
          referenceNumber,
          carName: car.name,
          carYear: car.year,
          carMileage: car.mileage,
          carCondition: car.condition,
          salePrice: car.salePrice,
          financingInterest: financingInterest || false,
          tradeInInterest: tradeInInterest || false,
          message: message || null,
        }),
      });
    } catch {
      // Email failure shouldn't fail the quote request
      console.error("Failed to send quote confirmation email");
    }

    return NextResponse.json({
      quoteId: quote.id,
      referenceNumber: quote.referenceNumber,
    }, { status: 201 });
  } catch (error) {
    console.error("Quote creation error:", error);
    return NextResponse.json({ error: "Failed to create quote request" }, { status: 500 });
  }
}

// GET /api/quotes — List all quote requests (admin only)
export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status && status !== "all" ? { status } : {};

  const quotes = await prisma.quoteRequest.findMany({
    where,
    include: { car: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(quotes);
}
