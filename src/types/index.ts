export interface Car {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CarCategory;
  tagline: string;
  description: string;
  dailyRate: number; // cents
  depositAmount: number; // cents
  seats: number;
  doors: number;
  transmission: "automatic" | "manual";
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid";
  horsepower: number;
  acceleration: string;
  luggage: string;
  imageUrl: string;
  galleryUrls: string[];
  featured: boolean;
  available: boolean;
}

export type CarCategory =
  | "sedan"
  | "suv"
  | "convertible"
  | "coupe"
  | "luxury"
  | "van"
  | "truck";

export interface Booking {
  id: string;
  bookingRef: string;
  status: BookingStatus;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  totalPrice: number; // cents
  depositAmount: number; // cents
  stripePaymentId: string | null;
  stripeDepositId: string | null;
  depositStatus: DepositStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  extras: BookingExtras;
  car: Car;
  carId: string;
  createdAt: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export type DepositStatus = "none" | "held" | "captured" | "released";

export interface BookingExtras {
  insurance: boolean;
  gps: boolean;
  childSeat: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  active: boolean;
}

export interface PriceBreakdown {
  days: number;
  dailyRate: number;
  subtotal: number;
  insurance: number;
  gps: number;
  childSeat: number;
  discount: number;
  discountPercent: number;
  total: number;
  deposit: number;
}

export interface BookingFlowState {
  pickupLocation: string;
  returnLocation: string;
  pickupDate: Date | null;
  returnDate: Date | null;
  selectedCar: Car | null;
  extras: BookingExtras;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}
