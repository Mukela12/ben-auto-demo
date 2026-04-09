"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  showToast,
  type AppToastOptions,
} from "@/components/ui/toast";

type NotifyOptions = {
  description?: ReactNode;
  duration?: number;
  action?: AppToastOptions["action"];
  onDismiss?: () => void;
};

export const notify = {
  success(title: ReactNode, options?: NotifyOptions) {
    return showToast({
      title,
      variant: "success",
      ...options,
    });
  },
  error(title: ReactNode, options?: NotifyOptions) {
    return showToast({
      title,
      variant: "error",
      ...options,
    });
  },
  info(title: ReactNode, options?: NotifyOptions) {
    return showToast({
      title,
      variant: "info",
      ...options,
    });
  },
  loading(title: ReactNode, options?: NotifyOptions) {
    return showToast({
      title,
      variant: "loading",
      ...options,
    });
  },
  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
};
