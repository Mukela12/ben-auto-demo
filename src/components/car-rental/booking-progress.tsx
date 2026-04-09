"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Dates & Location" },
  { id: 2, label: "Select Car" },
  { id: 3, label: "Extras" },
  { id: 4, label: "Checkout" },
  { id: 5, label: "Confirmation" },
];

const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 20,
  mass: 0.8,
};

export function BookingProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-10">
      {/* Animated dot progress */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center gap-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "relative z-10 h-2.5 w-2.5 rounded-full transition-colors duration-300",
                step.id <= currentStep ? "bg-white" : "bg-border"
              )}
            />
          ))}

          {/* Orange sliding progress bar */}
          <motion.div
            className="absolute -left-2 top-1/2 -translate-y-1/2 h-[18px] rounded-full bg-[#ff5f00] shadow-lg shadow-[#ff5f00]/30"
            initial={{ width: 18 }}
            animate={{
              width: currentStep === 1 ? 18 : currentStep === 2 ? 52 : currentStep === 3 ? 88 : currentStep === 4 ? 124 : 158,
            }}
            transition={springConfig}
          />

          {/* Connector line behind dots */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-border -z-10" />
        </div>

        {/* Step labels */}
        <div className="hidden md:flex items-center gap-4">
          {steps.map((step) => (
            <motion.span
              key={step.id}
              className={cn(
                "text-[11px] font-medium px-2 transition-colors",
                step.id === currentStep
                  ? "text-[#ff5f00]"
                  : step.id < currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
              )}
              animate={{
                scale: step.id === currentStep ? 1.05 : 1,
                fontWeight: step.id === currentStep ? 700 : 500,
              }}
              transition={{ duration: 0.2 }}
            >
              {step.label}
            </motion.span>
          ))}
        </div>

        {/* Mobile: current step label */}
        <p className="text-sm font-medium text-foreground md:hidden">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.label}
        </p>
      </div>
    </div>
  );
}
