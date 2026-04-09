import type { Prisma } from "@prisma/client";
import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatCurrencyExact, formatDate } from "@/lib/utils";

type BookingWithCar = Prisma.BookingGetPayload<{
  include: { car: true };
}>;

async function getBookingWithCar(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: { car: true },
  });
}

export async function ensureStripeCustomer(args: {
  customerEmail: string;
  customerName: string;
  customerPhone?: string | null;
}) {
  const { customerEmail, customerName, customerPhone } = args;
  const existing = await stripe.customers.list({
    email: customerEmail,
    limit: 1,
  });

  const customer = existing.data[0];

  if (customer) {
    if (customer.name !== customerName || customer.phone !== customerPhone) {
      return stripe.customers.update(customer.id, {
        name: customerName,
        phone: customerPhone ?? undefined,
      });
    }

    return customer;
  }

  return stripe.customers.create({
    email: customerEmail,
    name: customerName,
    phone: customerPhone ?? undefined,
  });
}

export async function sendBookingConfirmationEmail(
  bookingOrId: BookingWithCar | string
) {
  const booking =
    typeof bookingOrId === "string"
      ? await getBookingWithCar(bookingOrId)
      : bookingOrId;

  if (!booking?.car) {
    return;
  }

  await resend.emails.send({
    from: "Ben Auto <onboarding@resend.dev>",
    to: booking.customerEmail,
    subject: `Booking Confirmed - ${booking.bookingRef}`,
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
            Reference: <strong style="color: #ff5f00;">${booking.bookingRef}</strong>
          </p>
        </div>

        <div style="border: 1px solid #e5e2dd; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #6b6560; text-transform: uppercase; letter-spacing: 1px;">Vehicle</p>
          <p style="margin: 0 0 16px; font-size: 16px; font-weight: 700;">${booking.car.name}</p>

          <div style="display: flex; gap: 24px;">
            <div>
              <p style="margin: 0 0 4px; font-size: 12px; color: #6b6560;">Pickup</p>
              <p style="margin: 0; font-size: 14px; font-weight: 600;">${formatDate(booking.pickupDate)}</p>
              <p style="margin: 0; font-size: 12px; color: #6b6560;">${booking.pickupLocation}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px; font-size: 12px; color: #6b6560;">Return</p>
              <p style="margin: 0; font-size: 14px; font-weight: 600;">${formatDate(booking.returnDate)}</p>
              <p style="margin: 0; font-size: 12px; color: #6b6560;">${booking.returnLocation}</p>
            </div>
          </div>
        </div>

        <div style="text-align: center; padding: 24px 0;">
          <p style="font-size: 24px; font-weight: 900; margin: 0;">${formatCurrencyExact(booking.totalPrice)}</p>
          <p style="font-size: 12px; color: #6b6560; margin: 4px 0 0;">Rental charged</p>
          <p style="font-size: 12px; color: #6b6560; margin: 4px 0 0;">Deposit hold: ${formatCurrencyExact(booking.depositAmount)}</p>
        </div>

        <p style="font-size: 12px; color: #6b6560; text-align: center; margin-top: 32px;">
          Thank you for choosing Ben Auto, ${booking.customerName}.<br/>
          Questions? Reply to this email and our team will help.
        </p>
      </div>
    `,
  });
}

export async function confirmBookingIfNeeded(bookingId: string) {
  const booking = await getBookingWithCar(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "confirmed") {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "confirmed" },
      include: { car: true },
    });

    await sendBookingConfirmationEmail(updated);
    return updated;
  }

  return booking;
}

export async function ensureDepositHoldForBooking(args: {
  bookingId: string;
  rentalPaymentIntentId?: string | null;
}) {
  const booking = await getBookingWithCar(args.bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.stripeDepositId) {
    return stripe.paymentIntents.retrieve(booking.stripeDepositId);
  }

  const rentalPaymentIntentId = args.rentalPaymentIntentId ?? booking.stripePaymentId;

  if (!rentalPaymentIntentId) {
    throw new Error("Rental payment intent not found");
  }

  const rentalIntent = await stripe.paymentIntents.retrieve(rentalPaymentIntentId);
  const customerId =
    typeof rentalIntent.customer === "string"
      ? rentalIntent.customer
      : rentalIntent.customer?.id;
  const paymentMethodId =
    typeof rentalIntent.payment_method === "string"
      ? rentalIntent.payment_method
      : rentalIntent.payment_method?.id;

  if (rentalIntent.status !== "succeeded") {
    throw new Error("Rental payment has not succeeded");
  }

  if (!customerId || !paymentMethodId) {
    throw new Error("Unable to reuse payment method for deposit hold");
  }

  const depositIntent = await stripe.paymentIntents.create({
    amount: booking.depositAmount,
    currency: rentalIntent.currency,
    customer: customerId,
    payment_method: paymentMethodId,
    confirm: true,
    off_session: true,
    capture_method: "manual",
    metadata: {
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      type: "deposit",
    },
    description: `Ben Auto deposit hold - ${booking.bookingRef}`,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      stripeDepositId: depositIntent.id,
      depositStatus:
        depositIntent.status === "requires_capture" ? "held" : booking.depositStatus,
    },
  });

  return depositIntent;
}
