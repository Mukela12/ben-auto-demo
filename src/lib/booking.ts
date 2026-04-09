import type { BookingExtras, Car } from "@/types";

const INSURANCE_PRICE_PER_DAY = 2900;
const GPS_PRICE_PER_DAY = 1200;
const CHILD_SEAT_PRICE_PER_DAY = 800;

export function normalizeBookingExtras(input: unknown): BookingExtras {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Partial<BookingExtras>;

  return {
    insurance: Boolean(raw.insurance),
    gps: Boolean(raw.gps),
    childSeat: Number.isFinite(raw.childSeat) ? Math.max(0, Number(raw.childSeat)) : 0,
  };
}

export function calculateBookingDays(pickupDate: Date, returnDate: Date): number {
  const diff = returnDate.getTime() - pickupDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getDiscountPercent(days: number): number {
  if (days >= 14) return 15;
  if (days >= 7) return 10;
  if (days >= 3) return 5;
  return 0;
}

export function calculateBookingTotals(args: {
  car: Pick<Car, "dailyRate" | "depositAmount">;
  pickupDate: Date;
  returnDate: Date;
  extras: BookingExtras;
}) {
  const { car, pickupDate, returnDate, extras } = args;
  const days = calculateBookingDays(pickupDate, returnDate);
  const discountPercent = getDiscountPercent(days);

  const rentalSubtotal = car.dailyRate * days;
  const insuranceTotal = extras.insurance ? INSURANCE_PRICE_PER_DAY * days : 0;
  const gpsTotal = extras.gps ? GPS_PRICE_PER_DAY * days : 0;
  const childSeatTotal = extras.childSeat * CHILD_SEAT_PRICE_PER_DAY * days;
  const subtotal = rentalSubtotal + insuranceTotal + gpsTotal + childSeatTotal;
  const discount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discount;

  return {
    days,
    discountPercent,
    rentalSubtotal,
    insuranceTotal,
    gpsTotal,
    childSeatTotal,
    subtotal,
    discount,
    total,
    depositAmount: car.depositAmount,
  };
}
