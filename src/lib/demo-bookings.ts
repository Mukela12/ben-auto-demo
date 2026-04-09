import { carsData } from "./cars-data";

interface DemoBooking {
  id: string;
  bookingRef: string;
  status: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  totalPrice: number;
  depositAmount: number;
  stripePaymentId: string | null;
  stripeDepositId: string | null;
  depositStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  extras: { insurance: boolean; gps: boolean; childSeat: number };
  car: (typeof carsData)[number];
  carId: string;
  createdAt: string;
}

export const demoBookings: DemoBooking[] = [
  {
    id: "bk-001",
    bookingRef: "BK-2026-A7K2",
    status: "confirmed" as const,
    pickupDate: "2026-04-01T10:00:00",
    returnDate: "2026-04-05T10:00:00",
    pickupLocation: "LAX Airport",
    returnLocation: "LAX Airport",
    totalPrice: 139600,
    depositAmount: 125000,
    stripePaymentId: "pi_3PxDemo001",
    stripeDepositId: "pi_3PxDeposit001",
    depositStatus: "held" as const,
    customerName: "James Wilson",
    customerEmail: "james.wilson@email.com",
    customerPhone: "+1 (310) 555-0142",
    extras: { insurance: true, gps: false, childSeat: 0 },
    car: carsData.find((c) => c.slug === "mercedes-g-class")!,
    carId: "mercedes-g-class",
    createdAt: "2026-03-27T14:30:00",
  },
  {
    id: "bk-002",
    bookingRef: "BK-2026-M3P9",
    status: "active" as const,
    pickupDate: "2026-03-26T09:00:00",
    returnDate: "2026-03-30T09:00:00",
    pickupLocation: "JFK Airport",
    returnLocation: "Manhattan - Midtown",
    totalPrice: 115600,
    depositAmount: 100000,
    stripePaymentId: "pi_3PxDemo002",
    stripeDepositId: "pi_3PxDeposit002",
    depositStatus: "held" as const,
    customerName: "Sarah Chen",
    customerEmail: "sarah.chen@company.com",
    customerPhone: "+1 (212) 555-0198",
    extras: { insurance: true, gps: true, childSeat: 0 },
    car: carsData.find((c) => c.slug === "bmw-7-series")!,
    carId: "bmw-7-series",
    createdAt: "2026-03-24T09:15:00",
  },
  {
    id: "bk-003",
    bookingRef: "BK-2026-R5T1",
    status: "completed" as const,
    pickupDate: "2026-03-20T14:00:00",
    returnDate: "2026-03-24T14:00:00",
    pickupLocation: "Miami International Airport",
    returnLocation: "Miami Beach",
    totalPrice: 75600,
    depositAmount: 75000,
    stripePaymentId: "pi_3PxDemo003",
    stripeDepositId: "pi_3PxDeposit003",
    depositStatus: "released" as const,
    customerName: "Michael Torres",
    customerEmail: "m.torres@gmail.com",
    customerPhone: "+1 (305) 555-0167",
    extras: { insurance: false, gps: true, childSeat: 0 },
    car: carsData.find((c) => c.slug === "ford-mustang-convertible")!,
    carId: "ford-mustang-convertible",
    createdAt: "2026-03-18T16:45:00",
  },
  {
    id: "bk-004",
    bookingRef: "BK-2026-K8W3",
    status: "pending" as const,
    pickupDate: "2026-04-10T12:00:00",
    returnDate: "2026-04-17T12:00:00",
    pickupLocation: "San Francisco Airport",
    returnLocation: "San Francisco Airport",
    totalPrice: 95200,
    depositAmount: 55000,
    stripePaymentId: null,
    stripeDepositId: null,
    depositStatus: "none" as const,
    customerName: "Emily Rodriguez",
    customerEmail: "emily.r@outlook.com",
    customerPhone: "+1 (415) 555-0234",
    extras: { insurance: true, gps: false, childSeat: 1 },
    car: carsData.find((c) => c.slug === "jeep-wrangler")!,
    carId: "jeep-wrangler",
    createdAt: "2026-03-28T11:20:00",
  },
  {
    id: "bk-005",
    bookingRef: "BK-2026-N2V6",
    status: "cancelled" as const,
    pickupDate: "2026-03-28T10:00:00",
    returnDate: "2026-03-30T10:00:00",
    pickupLocation: "Las Vegas Strip",
    returnLocation: "Las Vegas Strip",
    totalPrice: 31600,
    depositAmount: 35000,
    stripePaymentId: "pi_3PxDemo005",
    stripeDepositId: "pi_3PxDeposit005",
    depositStatus: "released" as const,
    customerName: "David Kim",
    customerEmail: "d.kim@icloud.com",
    customerPhone: null,
    extras: { insurance: false, gps: false, childSeat: 0 },
    car: carsData.find((c) => c.slug === "toyota-camry")!,
    carId: "toyota-camry",
    createdAt: "2026-03-25T08:00:00",
  },
];
