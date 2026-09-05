"use client";

import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export interface CardTiltProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
}

export function CardTilt({ children, className, maxTilt = 7, ...props }: CardTiltProps) {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const update = () => setEnabled(!reducedMotion && !coarsePointer.matches);
    update();
    coarsePointer.addEventListener("change", update);
    return () => coarsePointer.removeEventListener("change", update);
  }, [reducedMotion]);

  const updateTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !contentRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    contentRef.current.style.setProperty("--tilt-x", `${(0.5 - y) * maxTilt}deg`);
    contentRef.current.style.setProperty("--tilt-y", `${(x - 0.5) * maxTilt}deg`);
    contentRef.current.style.setProperty("--glare-x", `${x * 100}%`);
    contentRef.current.style.setProperty("--glare-y", `${y * 100}%`);
  };

  const resetTilt = () => {
    if (!contentRef.current) return;
    contentRef.current.style.setProperty("--tilt-x", "0deg");
    contentRef.current.style.setProperty("--tilt-y", "0deg");
    contentRef.current.style.setProperty("--glare-x", "50%");
    contentRef.current.style.setProperty("--glare-y", "50%");
  };

  return (
    <div
      className={cn("group perspective-distant", className)}
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
      {...props}
    >
      <div
        ref={contentRef}
        className={cn(
          "relative transform-3d overflow-hidden transition-transform duration-300 ease-out",
          enabled && "group-hover:[transform:rotateX(var(--tilt-x))_rotateY(var(--tilt-y))]",
        )}
        style={{
          "--tilt-x": "0deg",
          "--tilt-y": "0deg",
          "--glare-x": "50%",
          "--glare-y": "50%",
        } as React.CSSProperties}
      >
        {children}
        {enabled && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--glare-x)_var(--glare-y),rgba(255,255,255,0.18),transparent_35%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </div>
    </div>
  );
}
