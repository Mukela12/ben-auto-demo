import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  const { customerEmail, customerName, bookingRef, carName, pickupDate, returnDate, pickupLocation, totalPrice } = await request.json();

  try {
    await resend.emails.send({
      from: "Ben Auto <onboarding@resend.dev>",
      to: customerEmail,
      subject: `Booking Confirmed - ${bookingRef}`,
      html: `
        <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 900; margin: 0;">
              Ben <span style="color: #ff5f00;">Auto</span>
            </h1>
          </div>

          <div style="background: #f4f0ea; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 20px;">Booking Confirmed!</h2>
            <p style="margin: 0; color: #6b6560; font-size: 14px;">
              Reference: <strong style="color: #ff5f00;">${bookingRef}</strong>
            </p>
          </div>

          <div style="border: 1px solid #e5e2dd; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #6b6560; text-transform: uppercase; letter-spacing: 1px;">Vehicle</p>
            <p style="margin: 0 0 16px; font-size: 16px; font-weight: 700;">${carName}</p>

            <div style="display: flex; gap: 24px;">
              <div>
                <p style="margin: 0 0 4px; font-size: 12px; color: #6b6560;">Pickup</p>
                <p style="margin: 0; font-size: 14px; font-weight: 600;">${pickupDate}</p>
                <p style="margin: 0; font-size: 12px; color: #6b6560;">${pickupLocation}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px; font-size: 12px; color: #6b6560;">Return</p>
                <p style="margin: 0; font-size: 14px; font-weight: 600;">${returnDate}</p>
              </div>
            </div>
          </div>

          <div style="text-align: center; padding: 24px 0;">
            <p style="font-size: 24px; font-weight: 900; margin: 0;">$${(totalPrice / 100).toFixed(0)}</p>
            <p style="font-size: 12px; color: #6b6560; margin: 4px 0 0;">Total charged</p>
          </div>

          <p style="font-size: 12px; color: #6b6560; text-align: center; margin-top: 32px;">
            Thank you for choosing Ben Auto, ${customerName}.<br/>
            Questions? Reply to this email or visit our help center.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
