import { LuxuryLoader } from "@/components/ui/luxury-loader";

export default function BookingExtrasLoading() {
  return (
    <div className="py-12">
      <LuxuryLoader
        title="Preparing Your Vehicle"
        subtitle="Loading extras and final pricing for your selected car."
      />
    </div>
  );
}
