"use client";

import * as React from "react";
import { FlipHorizontal2, Minus, Plus, RotateCcw } from "lucide-react";

import { SlabScene } from "@/components/3d/slab-scene";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export interface SlabViewerProps {
  frontUrl: string;
  backUrl: string;
  alt?: string;
  className?: string;
  initialBack?: boolean;
  enableZoom?: boolean;
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function SlabViewer({
  frontUrl,
  backUrl,
  alt = "Graded card",
  className,
  initialBack = false,
  enableZoom = true,
}: SlabViewerProps) {
  const reducedMotion = useReducedMotion();
  const [webgl, setWebgl] = React.useState<boolean | null>(null);
  const [showBack, setShowBack] = React.useState(initialBack);
  const [rotation, setRotation] = React.useState<[number, number]>([0, 0]);
  const [scale, setScale] = React.useState(1);
  const dragStart = React.useRef<{ x: number; y: number; rotation: [number, number] } | null>(null);

  React.useEffect(() => setWebgl(supportsWebGL()), []);

  const reset = () => {
    setShowBack(false);
    setRotation([0, 0]);
    setScale(1);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || webgl === false) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY, rotation };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start) return;
    setRotation([
      Math.max(-0.55, Math.min(0.55, start.rotation[0] + (event.clientY - start.y) / 260)),
      start.rotation[1] + (event.clientX - start.x) / 210,
    ]);
  };

  const stopDragging = () => {
    dragStart.current = null;
  };

  const displayUrl = showBack ? backUrl : frontUrl;

  return (
    <section className={cn("overflow-hidden rounded-xl border border-border bg-card/70 shadow-2xl", className)} aria-label="Interactive graded card viewer">
      <div
        className={cn(
          "relative aspect-[4/5] min-h-80 touch-none bg-[#0b0d12]",
          !reducedMotion && webgl !== false && "cursor-grab active:cursor-grabbing",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        {webgl === null ? (
          <div className="h-full w-full animate-pulse bg-muted" aria-label="Loading card viewer" />
        ) : reducedMotion || !webgl ? (
          <img src={displayUrl} alt={alt} className="h-full w-full object-contain p-5" />
        ) : (
          <SlabScene
            frontUrl={frontUrl}
            backUrl={backUrl}
            showBack={showBack}
            rotation={rotation}
            scale={scale}
            enablePointerTilt={false}
            cinematic
            className="min-h-0"
          />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {reducedMotion || !webgl ? "Image view" : "Drag to inspect the slab"}
        </p>
        <div className="flex items-center gap-1" aria-label="Card viewer controls">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowBack((current) => !current)}
            aria-label={showBack ? "Show front of card" : "Show back of card"}
          >
            <FlipHorizontal2 />
          </Button>
          {enableZoom && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setScale((current) => Math.max(0.82, Number((current - 0.1).toFixed(2))))}
                aria-label="Zoom out"
                disabled={scale <= 0.82}
              >
                <Minus />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setScale((current) => Math.min(1.28, Number((current + 0.1).toFixed(2))))}
                aria-label="Zoom in"
                disabled={scale >= 1.28}
              >
                <Plus />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon-sm" onClick={reset} aria-label="Reset card view">
            <RotateCcw />
          </Button>
        </div>
      </div>
    </section>
  );
}
