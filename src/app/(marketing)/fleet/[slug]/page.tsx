import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const car = await prisma.car.findUnique({
    where: { slug },
  });

  if (!car) return notFound();

  const similarCars = await prisma.car.findMany({
    where: {
      category: car.category,
      slug: { not: car.slug },
      available: true,
    },
    orderBy: [{ featured: "desc" }, { dailyRate: "asc" }],
    take: 3,
  });

  const specs = [
    { label: "Seats", value: `${car.seats} passengers`, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: "Doors", value: `${car.doors} doors`, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Transmission", value: car.transmission, icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    { label: "Fuel", value: car.fuelType, icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { label: "Horsepower", value: `${car.horsepower} HP`, icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
    { label: "0-60 mph", value: car.acceleration, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Luggage", value: car.luggage, icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  ];

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/fleet" className="hover:text-foreground">Fleet</Link>
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-foreground">{car.name}</span>
        </div>
      </div>

      {/* Hero + Info */}
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Car Image */}
          <div className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a]">
              <div className="relative h-80 w-full md:h-[480px]">
                <Image
                  src={car.imageUrl}
                  alt={car.name}
                  fill
                  className="object-contain p-8"
                  priority
                />
              </div>
              {car.featured && (
                <div className="absolute left-6 top-6 rounded-full bg-[#ff5f00] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                  Featured
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl bg-card p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#ff5f00]">
                {car.brand} · {car.category}
              </p>
              <h1 className="mt-2 font-[var(--font-inter-tight)] text-3xl font-black text-foreground">
                {car.name}
              </h1>
              <p className="mt-1 text-sm italic text-muted-foreground">{car.tagline}</p>

              <div className="mt-6 flex items-baseline gap-1 border-b border-border pb-6">
                <span className="font-[var(--font-inter-tight)] text-4xl font-black text-foreground">
                  {formatCurrency(car.dailyRate)}
                </span>
                <span className="text-sm text-muted-foreground">/ day</span>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {car.description}
              </p>

              <div className="mt-6 flex items-center gap-2 rounded-xl bg-background p-4">
                <svg className="h-5 w-5 text-[#ff5f00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-foreground">Security Deposit</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(car.depositAmount)} hold · Released on return
                  </p>
                </div>
              </div>

              <Link
                href={`/book?car=${car.slug}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5f00] py-4 text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-lg hover:shadow-[#ff5f00]/25"
              >
                Book This Car
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Free cancellation up to 48h before pickup
              </p>
            </div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="mt-12">
          <h2 className="font-[var(--font-inter-tight)] text-2xl font-bold">Specifications</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
            {specs.map((spec) => (
              <div key={spec.label} className="rounded-xl bg-card p-4 text-center shadow-sm">
                <svg className="mx-auto h-6 w-6 text-[#ff5f00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={spec.icon} />
                </svg>
                <p className="mt-2 text-xs text-muted-foreground">{spec.label}</p>
                <p className="mt-0.5 text-sm font-semibold capitalize text-foreground">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What's Included */}
        <div className="mt-12">
          <h2 className="font-[var(--font-inter-tight)] text-2xl font-bold">What&apos;s Included</h2>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              "Unlimited mileage",
              "Basic insurance coverage",
              "24/7 roadside assistance",
              "Free cancellation (48h)",
              "Airport pickup available",
              "Full tank of fuel at start",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Cars */}
        {similarCars.length > 0 && (
          <div className="mt-16">
            <h2 className="font-[var(--font-inter-tight)] text-2xl font-bold">Similar Vehicles</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similarCars.map((c) => (
                <Link
                  key={c.slug}
                  href={`/fleet/${c.slug}`}
                  className="group overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-44 w-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]">
                    <Image src={c.imageUrl} alt={c.name} fill className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#ff5f00]">{c.category}</p>
                    <h3 className="mt-1 font-[var(--font-inter-tight)] text-base font-bold">{c.name}</h3>
                    <p className="mt-1 font-[var(--font-inter-tight)] text-lg font-bold">{formatCurrency(c.dailyRate)}<span className="text-xs font-normal text-muted-foreground">/day</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
