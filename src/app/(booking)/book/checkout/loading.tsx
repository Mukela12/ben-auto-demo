import { LuxuryLoader } from "@/components/ui/luxury-loader";

export default function BookingCheckoutLoading() {
  return (
    <div className="py-12">
      <LuxuryLoader
        title="Opening Secure Checkout"
        subtitle="Connecting your booking details to Stripe."
      />
    </div>
  );
}
