"use client";

import { FeatureSteps } from "@/components/ui/feature-section";

const steps = [
  {
    step: "Step 1",
    title: "Choose Your Dates & Location",
    content:
      "Pick your travel dates and select from 8+ premium locations including LAX, JFK, Miami, and San Francisco airports.",
    image: "/heroes/homepage-hero.jpg",
  },
  {
    step: "Step 2",
    title: "Browse & Select Your Car",
    content:
      "Explore 15+ curated vehicles from BMW, Mercedes, Ford and more. Filter by category, compare specs, and find your perfect ride.",
    image: "/heroes/fleet-guide-hero.jpg",
  },
  {
    step: "Step 3",
    title: "Book & Drive Away",
    content:
      "Complete checkout with Stripe. A secure deposit hold is placed on your card — released on return. Pick up your keys and go.",
    image: "/heroes/loyalty-rewards.jpg",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-background py-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5f00] mb-2">
          Simple Process
        </p>
        <FeatureSteps
          features={steps}
          title="How It Works"
          autoPlayInterval={4000}
          imageHeight="h-[400px]"
        />
      </div>
    </section>
  );
}
