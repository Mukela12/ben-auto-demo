import Image from "next/image";
import Link from "next/link";
import { ValueProps } from "@/components/car-rental/value-props";
import { HeroSection } from "@/components/car-rental/hero-section";
import { HowItWorks } from "@/components/car-rental/how-it-works";
import { CTASection } from "@/components/car-rental/cta-section";

export default function Home() {
  return (
    <main>
      {/* Hero Section with Rent/Buy Toggle */}
      <HeroSection />

      {/* Value Props */}
      <ValueProps />

      {/* Featured Fleet */}
      <section className="bg-surface-dark py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-[var(--font-inter-tight)] text-3xl font-black uppercase tracking-tight text-white md:text-5xl">Our Premium Fleet</h2>
            <p className="mt-3 text-white/60">Curated selection of the finest vehicles</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { name: "Mercedes G-Class", category: "Luxury SUV", price: "$349", image: "/cars/mercedes-g-class.png", specs: "5 seats · Automatic · 416 HP" },
              { name: "BMW 7 Series", category: "Luxury Sedan", price: "$289", image: "/cars/bmw-7-series.png", specs: "5 seats · Automatic · 375 HP" },
              { name: "Ford Mustang", category: "Convertible", price: "$189", image: "/cars/ford-mustang.png", specs: "4 seats · Automatic · 310 HP" },
            ].map((car, i) => (
              <Link key={i} href="/fleet" className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/10 to-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#ff5f00]/10">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#ff5f00]">{car.category}</p>
                    <h3 className="mt-1 font-[var(--font-inter-tight)] text-xl font-bold text-white">{car.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-white/50">From</span>
                    <p className="font-[var(--font-inter-tight)] text-2xl font-bold text-white">{car.price}<span className="text-sm font-normal text-white/50">/day</span></p>
                  </div>
                </div>
                <div className="relative mx-auto h-44 w-full">
                  <Image src={car.image} alt={car.name} fill className="object-contain transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-xs text-white/50">{car.specs}</p>
                  <span className="flex items-center gap-1 text-xs font-medium text-[#ff5f00] transition-transform group-hover:translate-x-1">
                    View Details
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/fleet" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/5">
              View Full Fleet
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <HowItWorks />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="bg-surface-dark py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Image src="/brand/ben-auto-logo.png" alt="Ben Auto" width={120} height={40} className="h-10 w-auto" />
              <p className="mt-3 text-sm text-white/50">Premium car rental &amp; sales.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Fleet</h4>
              <ul className="mt-3 space-y-2">
                {["Sedans", "SUVs", "Convertibles", "Luxury"].map((item) => (
                  <li key={item}><Link href="/fleet" className="text-sm text-white/60 hover:text-white">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Company</h4>
              <ul className="mt-3 space-y-2">
                {["About", "Locations", "Careers", "Contact"].map((item) => (
                  <li key={item}><Link href="/" className="text-sm text-white/60 hover:text-white">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Support</h4>
              <ul className="mt-3 space-y-2">
                {["Help Center", "Terms", "Privacy", "Cookies"].map((item) => (
                  <li key={item}><Link href="/" className="text-sm text-white/60 hover:text-white">{item}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row">
            <p className="text-xs text-white/30">&copy; 2026 Ben Auto. All rights reserved.</p>
            <div className="mt-4 flex gap-4 md:mt-0">
              {["Instagram", "LinkedIn", "Twitter"].map((social) => (
                <span key={social} className="cursor-pointer text-xs text-white/30 hover:text-white/60">{social}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
