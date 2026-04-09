"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-surface-dark py-24 lg:py-32">
      {/* Background image */}
      <Image
        src="/heroes/loyalty-rewards.jpg"
        alt=""
        fill
        className="object-cover opacity-30"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Animated accent glow */}
      <div className="absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#ff5f00]/20 blur-[100px]" />
      <div className="absolute -right-32 bottom-0 h-48 w-48 rounded-full bg-[#ff5f00]/10 blur-[80px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5f00]">
              Start Your Journey
            </p>
            <h2 className="mt-4 font-[var(--font-inter-tight)] text-4xl font-black leading-tight text-white md:text-5xl">
              Ready to Drive
              <br />
              <span className="text-[#ff5f00]">Premium?</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/60">
              Join thousands of drivers who choose quality over compromise.
              Transparent pricing, seamless booking, and a fleet that speaks for itself.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/fleet"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ff5f00] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90 hover:shadow-xl hover:shadow-[#ff5f00]/20"
              >
                Browse Fleet
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-4 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/5"
              >
                Book Now
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center gap-6 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free cancellation
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No hidden fees
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure deposits
              </span>
            </div>
          </motion.div>

          {/* Featured car */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative h-80">
              <Image
                src="/cars/mercedes-g-class.png"
                alt="Mercedes G-Class"
                fill
                className="object-contain drop-shadow-[0_20px_60px_rgba(255,95,0,0.15)]"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-white/40">Starting from</p>
              <p className="font-[var(--font-inter-tight)] text-3xl font-black text-white">
                $49<span className="text-base font-normal text-white/40">/day</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
