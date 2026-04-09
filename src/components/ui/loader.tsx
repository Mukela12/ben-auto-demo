"use client";

import { cn } from "@/lib/utils";

type LoaderSize = "sm" | "md" | "lg";

const dotSizeClasses: Record<LoaderSize, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

const dotContainerClasses: Record<LoaderSize, string> = {
  sm: "h-4 gap-1",
  md: "h-5 gap-1.5",
  lg: "h-6 gap-2",
};

const waveHeightMap: Record<LoaderSize, string[]> = {
  sm: ["6px", "9px", "12px", "9px", "6px"],
  md: ["8px", "12px", "16px", "12px", "8px"],
  lg: ["10px", "15px", "20px", "15px", "10px"],
};

const waveWidthClasses: Record<LoaderSize, string> = {
  sm: "w-0.5",
  md: "w-0.5",
  lg: "w-1",
};

const waveContainerClasses: Record<LoaderSize, string> = {
  sm: "h-4 gap-0.5",
  md: "h-5 gap-0.5",
  lg: "h-6 gap-1",
};

export function DotsLoader({
  className,
  size = "md",
}: {
  className?: string;
  size?: LoaderSize;
}) {
  return (
    <div
      className={cn(
        "flex items-center text-current",
        dotContainerClasses[size],
        className
      )}
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "animate-[bounce-dots_1.2s_ease-in-out_infinite] rounded-full bg-current",
            dotSizeClasses[size]
          )}
          style={{ animationDelay: `${index * 140}ms` }}
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function WaveLoader({
  className,
  size = "md",
}: {
  className?: string;
  size?: LoaderSize;
}) {
  return (
    <div
      className={cn(
        "flex items-center text-current",
        waveContainerClasses[size],
        className
      )}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className={cn(
            "animate-[wave_1s_ease-in-out_infinite] rounded-full bg-current",
            waveWidthClasses[size]
          )}
          style={{
            animationDelay: `${index * 100}ms`,
            height: waveHeightMap[size][index],
          }}
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}
