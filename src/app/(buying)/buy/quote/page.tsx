"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import type { Car } from "@/types";

export default function QuoteRequestPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff5f00] border-t-transparent" /></div>}>
      <QuoteRequestContent />
    </Suspense>
  );
}

function QuoteRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carSlug = searchParams.get("car");

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [financingInterest, setFinancingInterest] = useState(false);
  const [tradeInInterest, setTradeInInterest] = useState(false);

  useEffect(() => {
    if (!carSlug) { setLoading(false); return; }
    fetch(`/api/cars?slug=${carSlug}`)
      .then((r) => r.json())
      .then((data) => { setCar(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [carSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car.id,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          message: message || null,
          financingInterest,
          tradeInInterest,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit quote request");
      }

      const data = await res.json();
      router.push(`/buy/confirmation?ref=${data.referenceNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff5f00] border-t-transparent" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-foreground">Car not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please select a car from our fleet.</p>
      </div>
    );
  }

  const salePrice = car.salePrice ? `$${(car.salePrice / 100).toLocaleString()}` : "Contact for price";

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Car Summary */}
      <div className="lg:col-span-2">
        <div className="sticky top-8 rounded-2xl border border-border bg-card p-6">
          <div className="relative mx-auto h-48 w-full">
            <Image src={car.imageUrl} alt={car.name} fill className="object-contain" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#ff5f00]">{car.category}</p>
            <h2 className="mt-1 font-[var(--font-inter-tight)] text-2xl font-bold text-foreground">{car.name}</h2>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sale Price</span>
              <span className="font-bold text-foreground">{salePrice}</span>
            </div>
            {car.year && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year</span>
                <span className="font-medium text-foreground">{car.year}</span>
              </div>
            )}
            {car.mileage != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mileage</span>
                <span className="font-medium text-foreground">{car.mileage.toLocaleString()} mi</span>
              </div>
            )}
            {car.condition && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium text-foreground capitalize">{car.condition.replace("_", " ")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Specs</span>
              <span className="font-medium text-foreground">{car.seats} seats · {car.horsepower} HP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Form */}
      <div className="lg:col-span-3">
        <h1 className="font-[var(--font-inter-tight)] text-3xl font-black text-foreground">Request a Quote</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in your details and a Ben Auto specialist will contact you within 24 hours.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#ff5f00] focus:ring-1 focus:ring-[#ff5f00]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#ff5f00] focus:ring-1 focus:ring-[#ff5f00]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Phone Number *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+260 97 1234567"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#ff5f00] focus:ring-1 focus:ring-[#ff5f00]"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${financingInterest ? "border-[#ff5f00] bg-[#ff5f00]/5" : "border-border"}`}>
              <input type="checkbox" checked={financingInterest} onChange={(e) => setFinancingInterest(e.target.checked)} className="accent-[#ff5f00]" />
              <div>
                <p className="text-sm font-medium text-foreground">Financing</p>
                <p className="text-xs text-muted-foreground">Interested in financing</p>
              </div>
            </label>
            <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${tradeInInterest ? "border-[#ff5f00] bg-[#ff5f00]/5" : "border-border"}`}>
              <input type="checkbox" checked={tradeInInterest} onChange={(e) => setTradeInInterest(e.target.checked)} className="accent-[#ff5f00]" />
              <div>
                <p className="text-sm font-medium text-foreground">Trade-in</p>
                <p className="text-xs text-muted-foreground">Have a vehicle to trade</p>
              </div>
            </label>
          </div>

          {/* Message */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Any questions or preferences..."
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#ff5f00] focus:ring-1 focus:ring-[#ff5f00]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#ff5f00] py-4 text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-lg hover:shadow-[#ff5f00]/25 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Quote Request"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            By submitting, you agree to be contacted by our team. No obligation to purchase.
          </p>
        </form>
      </div>
    </div>
  );
}
