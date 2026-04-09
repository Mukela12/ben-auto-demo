import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  const {
    customerEmail, customerName, customerPhone, referenceNumber,
    carName, carYear, carMileage, carCondition, salePrice,
    financingInterest, tradeInInterest, message,
  } = await request.json();

  const formattedPrice = salePrice ? `$${(salePrice / 100).toLocaleString()}` : "Contact for price";
  const formattedMileage = carMileage ? `${carMileage.toLocaleString()} miles` : "N/A";
  const conditionLabel = carCondition ? carCondition.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "N/A";

  try {
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
            <p style="margin: 0 0 16px; font-size: 18px; font-weight: 700;">${carName}</p>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b6560; border-bottom: 1px solid #f0ede8;">Year</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #f0ede8;">${carYear || "N/A"}</td>
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
              <li>We&rsquo;ll discuss pricing, financing options, and arrange a viewing</li>
            </ol>
          </div>

          <p style="font-size: 12px; color: #6b6560; text-align: center; margin-top: 32px;">
            Thank you for choosing Ben Auto, ${customerName}.<br/>
            Questions? Reply to this email or call us directly.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quote email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
