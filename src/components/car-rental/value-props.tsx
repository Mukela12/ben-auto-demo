"use client";

import { CardStackFan, type CardStackItem } from "@/components/ui/card-stack-fan";

const features: CardStackItem[] = [
  {
    id: 1,
    title: "Best Price Guaranteed",
    description: "222K+ vehicles worldwide. Transparent rates, no hidden fees.",
    imageSrc: "/heroes/luxury-promo.jpg",
  },
  {
    id: 2,
    title: "Seamless Booking",
    description: "Book in 2 minutes with real-time availability and instant confirmation.",
    imageSrc: "/heroes/homepage-hero.jpg",
  },
  {
    id: 3,
    title: "Exceptional Fleet",
    description: "4.9★ rated. From convertibles to luxury SUVs, model guaranteed.",
    imageSrc: "/heroes/fleet-guide-hero.jpg",
  },
  {
    id: 4,
    title: "Deposit Protection",
    description: "Secure Stripe hold released on return. Zero risk, full transparency.",
    imageSrc: "/heroes/business-travel.jpg",
  },
  {
    id: 5,
    title: "24/7 Support",
    description: "Roadside assistance and customer service whenever you need it.",
    imageSrc: "/heroes/loyalty-rewards.jpg",
  },
];

export function ValueProps() {
  return (
    <section className="bg-background py-16 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5f00]">
            Why Choose Us
          </p>
          <h2 className="mt-3 font-[var(--font-inter-tight)] text-3xl font-black text-foreground md:text-4xl">
            The Premium Experience
          </h2>
        </div>

        <CardStackFan
          items={features}
          cardWidth={420}
          cardHeight={260}
          maxVisible={5}
          overlap={0.52}
          spreadDeg={36}
          autoAdvance
          intervalMs={3500}
          pauseOnHover
          showDots
          activeScale={1.02}
          inactiveScale={0.92}
        />
      </div>
    </section>
  );
}
