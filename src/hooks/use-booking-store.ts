"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Car, BookingExtras } from "@/types";

interface BookingStore {
  hasHydrated: boolean;

  // Step 1: Dates & Location
  pickupLocation: string;
  returnLocation: string;
  pickupDate: Date | null;
  returnDate: Date | null;

  // Step 2: Car selection
  selectedCar: Car | null;

  // Step 3: Extras
  extras: BookingExtras;

  // Step 4: Customer info
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Actions
  setDates: (pickup: Date, returnDate: Date) => void;
  setLocations: (pickup: string, returnLoc: string) => void;
  setSelectedCar: (car: Car) => void;
  setExtras: (extras: Partial<BookingExtras>) => void;
  setCustomerInfo: (info: {
    name: string;
    email: string;
    phone: string;
  }) => void;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
}

const initialExtras: BookingExtras = {
  insurance: false,
  gps: false,
  childSeat: 0,
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      hasHydrated: false,
      pickupLocation: "",
      returnLocation: "",
      pickupDate: null,
      returnDate: null,
      selectedCar: null,
      extras: initialExtras,
      customerName: "",
      customerEmail: "",
      customerPhone: "",

      setDates: (pickup, returnDate) =>
        set({ pickupDate: pickup, returnDate }),

      setLocations: (pickup, returnLoc) =>
        set({ pickupLocation: pickup, returnLocation: returnLoc }),

      setSelectedCar: (car) => set({ selectedCar: car }),

      setExtras: (extras) =>
        set((state) => ({
          extras: { ...state.extras, ...extras },
        })),

      setCustomerInfo: (info) =>
        set({
          customerName: info.name,
          customerEmail: info.email,
          customerPhone: info.phone,
        }),

      setHasHydrated: (value) => set({ hasHydrated: value }),

      reset: () =>
        set({
          hasHydrated: true,
          pickupLocation: "",
          returnLocation: "",
          pickupDate: null,
          returnDate: null,
          selectedCar: null,
          extras: initialExtras,
          customerName: "",
          customerEmail: "",
          customerPhone: "",
        }),
    }),
    {
      name: "benauto-booking",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        pickupLocation: state.pickupLocation,
        returnLocation: state.returnLocation,
        pickupDate: state.pickupDate,
        returnDate: state.returnDate,
        selectedCar: state.selectedCar,
        extras: state.extras,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<BookingStore> & {
          pickupDate?: string | Date | null;
          returnDate?: string | Date | null;
        };

        return {
          ...currentState,
          ...persisted,
          pickupDate: persisted.pickupDate
            ? new Date(persisted.pickupDate)
            : currentState.pickupDate,
          returnDate: persisted.returnDate
            ? new Date(persisted.returnDate)
            : currentState.returnDate,
          extras: {
            ...initialExtras,
            ...(persisted.extras ?? {}),
          },
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
