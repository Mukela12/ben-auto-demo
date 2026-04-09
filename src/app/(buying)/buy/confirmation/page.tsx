"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function QuoteConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff5f00] border-t-transparent" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      {/* Success Icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="mt-6 font-[var(--font-inter-tight)] text-3xl font-black text-foreground">
        Quote Request Submitted!
      </h1>

      {ref && (
        <p className="mt-3 text-sm text-muted-foreground">
          Reference: <span className="font-bold text-[#ff5f00]">{ref}</span>
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
        <h3 className="font-semibold text-foreground">What happens next?</h3>
        <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff5f00]/10 text-xs font-bold text-[#ff5f00]">1</span>
            <span>A Ben Auto specialist will review your inquiry</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff5f00]/10 text-xs font-bold text-[#ff5f00]">2</span>
            <span>We will contact you within <strong className="text-foreground">24 hours</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff5f00]/10 text-xs font-bold text-[#ff5f00]">3</span>
            <span>We&apos;ll discuss pricing, financing, and arrange a viewing</span>
          </li>
        </ol>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        A confirmation email has been sent to your inbox with full details of your inquiry.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/fleet?mode=buy"
          className="inline-flex items-center justify-center rounded-lg bg-[#ff5f00] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#ff5f00]/90"
        >
          Browse More Cars
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
