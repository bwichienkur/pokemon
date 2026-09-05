"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={250}>
      {children}
      <Toaster theme="dark" richColors position="bottom-right" />
    </TooltipProvider>
  );
}
