"use client";

import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export interface CardTiltProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
}

export function CardTilt({ children, className, maxTilt = 14, ...props }: CardTiltProps) {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<number | null>(null);
  const targetRef = React.useRef({ x: 0, y: 0, glareX: 50, glareY: 50 });

  React.useEffect(() => {
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const update = () => setEnabled(!reducedMotion && !coarsePointer.matches);
    update();
    coarsePointer.addEventListener("change", update);
    return () => coarsePointer.removeEventListener("change", update);
  }, [reducedMotion]);

  React.useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      const node = contentRef.current;
      if (!node) return;
      const currentX = Number.parseFloat(node.style.getPropertyValue("--tilt-x")) || 0;
      const currentY = Number.parseFloat(node.style.getPropertyValue("--tilt-y")) || 0;
      const nextX = currentX + (targetRef.current.x - currentX) * 0.16;
      const nextY = currentY + (targetRef.current.y - currentY) * 0.16;
      node.style.setProperty("--tilt-x", `${nextX}deg`);
      node.style.setProperty("--tilt-y", `${nextY}deg`);
      node.style.setProperty("--glare-x", `${targetRef.current.glareX}%`);
      node.style.setProperty("--glare-y", `${targetRef.current.glareY}%`);
      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [enabled]);

  const updateTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    targetRef.current = {
      x: (0.5 - y) * maxTilt,
      y: (x - 0.5) * maxTilt,
      glareX: x * 100,
      glareY: y * 100,
    };
  };

  const resetTilt = () => {
    targetRef.current = { x: 0, y: 0, glareX: 50, glareY: 50 };
  };

  return (
    <div
      className={cn("group [perspective:1400px]", className)}
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
      {...props}
    >
      <div
        ref={contentRef}
        className={cn(
          "relative transform-gpu overflow-hidden transition-shadow duration-500 ease-out will-change-transform",
          "[transform-style:preserve-3d]",
          enabled &&
            "[transform:rotateX(var(--tilt-x))_rotateY(var(--tilt-y))_translateZ(0)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.45),0_0_40px_rgba(198,167,94,0.12)]",
        )}
        style={
          {
            "--tilt-x": "0deg",
            "--tilt-y": "0deg",
            "--glare-x": "50%",
            "--glare-y": "50%",
          } as React.CSSProperties
        }
      >
        {children}
        {enabled && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle at var(--glare-x) var(--glare-y), rgba(255,255,255,0.34), transparent 34%)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-color-dodge transition-opacity duration-500 group-hover:opacity-70"
              style={{
                background:
                  "linear-gradient(115deg, transparent 20%, rgba(120,200,255,0.18) 40%, rgba(255,180,90,0.22) 52%, rgba(190,120,255,0.16) 64%, transparent 80%)",
                backgroundSize: "220% 220%",
                backgroundPosition: "var(--glare-x) var(--glare-y)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(232,200,122,0.16)",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
