"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  LoaderCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info" | "loading";
type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type ToastAction = {
  label: string;
  onClick: () => void;
};

export type AppToastOptions = {
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
  position?: ToastPosition;
  action?: ToastAction;
  onDismiss?: () => void;
};

const variantIcon: Record<
  ToastVariant,
  React.ComponentType<{ className?: string }>
> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: LoaderCircle,
};

const variantAccent: Record<ToastVariant, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-[#ff5f00]",
  loading: "bg-[#ff5f00]",
};

const variantIconColor: Record<ToastVariant, string> = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-[#ff5f00]",
  loading: "text-[#ff5f00]",
};

export function showToast({
  title,
  description,
  variant = "info",
  duration = 4200,
  position = "top-right",
  action,
  onDismiss,
}: AppToastOptions) {
  const Icon = variantIcon[variant];

  return sonnerToast.custom(
    (toastId) => (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="pointer-events-auto w-full max-w-sm"
      >
        <div className="relative overflow-hidden rounded-[24px] border border-border/80 bg-card/96 p-4 shadow-[0_24px_90px_-36px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-40 dark:via-white/20" />
          <div
            className={cn(
              "absolute inset-y-0 left-0 w-1 rounded-l-[24px]",
              variantAccent[variant]
            )}
          />

          <div className="flex items-start gap-3 pl-2">
            <div
              className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-background/80",
                variantIconColor[variant]
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  variant === "loading" && "animate-spin"
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-[var(--font-inter-tight)] text-sm font-black tracking-tight text-card-foreground">
                {title}
              </p>
              {description ? (
                <div className="mt-1 text-xs leading-5 text-muted-foreground">
                  {description}
                </div>
              ) : null}

              {action ? (
                <button
                  type="button"
                  onClick={() => {
                    action.onClick();
                    sonnerToast.dismiss(toastId);
                  }}
                  className="mt-3 inline-flex rounded-xl bg-[#ff5f00] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#ff5f00]/90"
                >
                  {action.label}
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                sonnerToast.dismiss(toastId);
                onDismiss?.();
              }}
              className="rounded-full border border-border/70 bg-background/70 p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: variant === "loading" ? Infinity : duration,
      position,
    }
  );
}

export function AppToaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        unstyled: true,
        className: "flex w-full justify-end",
      }}
    />
  );
}
