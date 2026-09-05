"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { CatalogCard } from "@/components/cards/catalog-card";
import { Button } from "@/components/ui/button";
import type { CardWithImages } from "@/types/database";
import { cn } from "@/lib/utils";

export interface FeaturedCarouselProps {
  cards: CardWithImages[];
  userId?: string | null;
  favoriteCardIds?: Iterable<string>;
  className?: string;
}

export function FeaturedCarousel({ cards, userId, favoriteCardIds, className }: FeaturedCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const favorites = React.useMemo(() => new Set(favoriteCardIds), [favoriteCardIds]);

  const updateControls = React.useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    const frame = requestAnimationFrame(() => updateControls());
    emblaApi.on("select", updateControls);
    emblaApi.on("reInit", updateControls);
    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", updateControls);
      emblaApi.off("reInit", updateControls);
    };
  }, [emblaApi, updateControls]);

  if (!cards.length) return null;

  return (
    <section className={cn("relative", className)} aria-label="Featured cards">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Curated selection</p>
          <h2 className="mt-1 font-display text-3xl font-semibold">Featured cards</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => emblaApi?.scrollPrev()} disabled={!canScrollPrev} aria-label="Previous featured cards"><ArrowLeft /></Button>
          <Button variant="outline" size="icon-sm" onClick={() => emblaApi?.scrollNext()} disabled={!canScrollNext} aria-label="Next featured cards"><ArrowRight /></Button>
        </div>
      </div>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-5">
          {cards.map((card) => (
            <div key={card.id} className="min-w-0 flex-[0_0_86%] sm:flex-[0_0_48%] xl:flex-[0_0_calc(33.333%-0.875rem)]">
              <CatalogCard card={card} userId={userId} favorited={favorites.has(card.id)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
