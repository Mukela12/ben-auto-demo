"use client";

import { WaveLoader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

type LuxuryLoaderProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
};

export function LuxuryLoader({
  title = "Loading",
  subtitle = "Preparing your experience...",
  className,
  compact = false,
}: LuxuryLoaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-border/80 bg-card/95 shadow-[0_22px_70px_-30px_rgba(0,0,0,0.45)] backdrop-blur",
        compact ? "p-5" : "p-7 md:p-9",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#ff5f00]/70 to-transparent" />
      <div className="pointer-events-none absolute -left-10 top-8 h-28 w-28 rounded-full bg-[#ff5f00]/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-6 h-28 w-28 rounded-full bg-[#ffb38a]/10 blur-3xl dark:bg-[#ff5f00]/14" />

      <div className="relative flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center text-[#ff5f00]">
          <div className="absolute inset-0 rounded-full border border-[#ff5f00]/20 bg-[#ff5f00]/8" />
          <div className="absolute inset-[8px] rounded-full border border-[#ff5f00]/10 bg-card/75" />
          <WaveLoader size={compact ? "sm" : "md"} className="relative z-10" />
        </div>
        <div className="min-w-0">
          <p className="font-[var(--font-inter-tight)] text-lg font-black tracking-tight text-foreground">
            {title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export function VehicleCardsSkeleton({
  count = 3,
  className,
  layout = "stack",
}: {
  count?: number;
  className?: string;
  layout?: "stack" | "grid";
}) {
  return (
    <div
      className={cn(
        layout === "grid"
          ? "grid grid-cols-1 gap-4 xl:grid-cols-2"
          : "space-y-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative h-48 shrink-0 overflow-hidden bg-gradient-to-br from-secondary to-background md:h-auto md:w-64">
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.5)_35%,transparent_70%)] bg-[length:200%_100%] animate-shimmer dark:bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.08)_35%,transparent_70%)]" />
            </div>
            <div className="flex-1 space-y-4 p-5">
              <div className="space-y-3">
                <div className="h-3 w-20 rounded-full bg-secondary" />
                <div className="h-6 w-48 rounded-full bg-secondary" />
                <div className="h-4 w-64 rounded-full bg-secondary" />
                <div className="h-4 w-40 rounded-full bg-secondary" />
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="h-10 w-32 rounded-2xl bg-secondary" />
                <div className="h-12 w-32 rounded-xl bg-[#ff5f00]/20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetricCardsSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 xl:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl bg-card p-4 shadow-sm md:p-6">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-secondary" />
            <div className="h-5 w-20 rounded-full bg-secondary" />
          </div>
          <div className="mt-4 h-8 w-24 rounded-full bg-secondary" />
          <div className="mt-2 h-4 w-28 rounded-full bg-secondary" />
        </div>
      ))}
    </div>
  );
}

export function TableRowsSkeleton({
  rows = 5,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-background/60 px-6 py-4">
        <div className="h-4 w-40 rounded-full bg-secondary" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 px-6 py-4"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, columnIndex) => (
              <div
                key={`${rowIndex}-${columnIndex}`}
                className={cn(
                  "h-4 rounded-full bg-secondary",
                  columnIndex === 0 && "w-20",
                  columnIndex === 1 && "w-28",
                  columnIndex === 2 && "w-24",
                  columnIndex > 2 && "w-16"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
