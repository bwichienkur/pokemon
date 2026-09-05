"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CardImage } from "@/types/database";
import { cn } from "@/lib/utils";

export interface CardGalleryProps {
  images: CardImage[];
  title: string;
  className?: string;
}

export function CardGallery({ images, title, className }: CardGalleryProps) {
  const displayImages = React.useMemo(() => {
    const frontBack = images.filter((image) => image.imageType === "FRONT" || image.imageType === "BACK");
    return frontBack.length ? frontBack : images;
  }, [images]);
  const [index, setIndex] = React.useState(0);
  const touchStart = React.useRef<number | null>(null);

  React.useEffect(() => setIndex((current) => Math.min(current, Math.max(displayImages.length - 1, 0))), [displayImages.length]);

  if (!displayImages.length) {
    return <div className={cn("flex aspect-[3/4] items-center justify-center rounded-xl border border-border bg-card text-muted-foreground", className)}>Images coming soon</div>;
  }

  const current = displayImages[index];
  const select = (next: number) => setIndex((next + displayImages.length) % displayImages.length);

  return (
    <section className={cn("space-y-3", className)} aria-label={`${title} image gallery`}>
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-card"
        onTouchStart={(event) => { touchStart.current = event.changedTouches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const end = event.changedTouches[0]?.clientX;
          if (start !== null && end !== undefined && Math.abs(start - end) > 35) select(start > end ? index + 1 : index - 1);
          touchStart.current = null;
        }}
      >
        <img src={current.imageUrl} alt={current.altText ?? `${title} ${current.imageType.toLowerCase()}`} className="h-full w-full object-contain p-4" />
        {displayImages.length > 1 && (
          <>
            <Button variant="ghost" size="icon-sm" className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/35 backdrop-blur-sm" onClick={() => select(index - 1)} aria-label="Previous image"><ChevronLeft /></Button>
            <Button variant="ghost" size="icon-sm" className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/35 backdrop-blur-sm" onClick={() => select(index + 1)} aria-label="Next image"><ChevronRight /></Button>
          </>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Gallery thumbnails">
        {displayImages.map((image, imageIndex) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setIndex(imageIndex)}
            className={cn("size-16 shrink-0 overflow-hidden rounded-md border bg-card p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", index === imageIndex ? "border-gold" : "border-border")}
            aria-label={`Show ${image.imageType.toLowerCase()} image`}
            aria-current={index === imageIndex}
          >
            <img src={image.imageUrl} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
    </section>
  );
}
