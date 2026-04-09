import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
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

    // Send confirmation email directly via Resend
    try {
      const formattedPrice = car.salePrice ? `$${(car.salePrice / 100).toLocaleString()}` : "Contact for price";
      const formattedMileage = car.mileage ? `${car.mileage.toLocaleString()} miles` : "N/A";
      const conditionLabel = car.condition ? car.condition.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "N/A";

      await resend.emails.send({
        from: "Ben Auto <onboarding@resend.dev>",
        to: customerEmail,
        subject: `Quote Request Received - ${referenceNumber}`,
        html: `
          <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; font-weight: 900; margin: 0;">
                Ben <span style="color: #ff5f00;">Auto</span>
              </h1>
            </div>

            <div style="background: #f4f0ea; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 8px; font-size: 20px;">Quote Request Received!</h2>
              <p style="margin: 0; color: #6b6560; font-size: 14px;">
                Reference: <strong style="color: #ff5f00;">${referenceNumber}</strong>
              </p>
            </div>

            <div style="border: 1px solid #e5e2dd; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #6b6560; text-transform: uppercase; letter-spacing: 1px;">Vehicle of Interest</p>
              <p style="margin: 0 0 16px; font-size: 18px; font-weight: 700;">${car.name}</p>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6b6560; border-bottom: 1px solid #f0ede8;">Year</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #f0ede8;">${car.year || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6b6560; border-bottom: 1px solid #f0ede8;">Mileage</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #f0ede8;">${formattedMileage}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6b6560; border-bottom: 1px solid #f0ede8;">Condition</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #f0ede8;">${conditionLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6b6560;">Listed Price</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; text-align: right;">${formattedPrice}</td>
                </tr>
              </table>
            </div>

            <div style="border: 1px solid #e5e2dd; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px; font-size: 12px; color: #6b6560; text-transform: uppercase; letter-spacing: 1px;">Your Details</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #6b6560;">Name</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; text-align: right;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #6b6560;">Email</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; text-align: right;">${customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #6b6560;">Phone</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; text-align: right;">${customerPhone}</td>
                </tr>
                ${financingInterest ? '<tr><td style="padding: 6px 0; font-size: 13px; color: #6b6560;">Financing</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; text-align: right; color: #ff5f00;">Interested</td></tr>' : ""}
                ${tradeInInterest ? '<tr><td style="padding: 6px 0; font-size: 13px; color: #6b6560;">Trade-in</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; text-align: right; color: #ff5f00;">Yes</td></tr>' : ""}
              </table>
              ${message ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0ede8;"><p style="margin: 0 0 4px; font-size: 12px; color: #6b6560;">Your Message</p><p style="margin: 0; font-size: 13px; color: #333;">${message}</p></div>` : ""}
            </div>

            <div style="background: #fff8f0; border: 1px solid #ffe0c0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 8px; font-size: 16px; color: #ff5f00;">What Happens Next?</h3>
              <ol style="margin: 0; padding-left: 20px; color: #6b6560; font-size: 13px; line-height: 1.8;">
                <li>A Ben Auto specialist will review your inquiry</li>
                <li>We will contact you within <strong>24 hours</strong></li>
                <li>We'll discuss pricing, financing options, and arrange a viewing</li>
              </ol>
            </div>

            <p style="font-size: 12px; color: #6b6560; text-align: center; margin-top: 32px;">
              Thank you for choosing Ben Auto, ${customerName}.<br/>
              Questions? Reply to this email or call us directly.
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send quote confirmation email:", emailErr);
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
