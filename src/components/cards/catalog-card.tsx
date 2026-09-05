"use client";

import Link from "next/link";
import * as React from "react";
import { Heart } from "lucide-react";

import { toggleFavoriteAction } from "@/app/actions/cards";
import { CardTilt } from "@/components/cards/card-tilt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CardWithImages } from "@/types/database";
import { cn, formatPrice } from "@/lib/utils";

export interface CatalogCardProps {
  card: CardWithImages;
  userId?: string | null;
  favorited?: boolean;
  className?: string;
  view?: "grid" | "list";
}

function availabilityVariant(status: CardWithImages["availabilityStatus"]) {
  if (status === "AVAILABLE") return "gold";
  if (status === "SOLD") return "destructive";
  return "outline";
}

export function CatalogCard({
  card,
  userId,
  favorited = false,
  className,
  view = "grid",
}: CatalogCardProps) {
  const [isFavorited, setIsFavorited] = React.useState(favorited);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState("");
  const frontImage = card.images.find((image) => image.imageType === "FRONT") ?? card.images[0];
  const details = [card.setName, card.year].filter(Boolean).join(" · ");

  const toggleFavorite = () => {
    setError("");
    startTransition(async () => {
      try {
        const result = await toggleFavoriteAction(card.id);
        setIsFavorited(result.favorited);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to update favorite.");
      }
    });
  };

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card shadow-[0_12px_32px_rgba(0,0,0,0.16)] transition-colors hover:border-gold/35",
        view === "list" && "sm:grid sm:grid-cols-[minmax(12rem,18rem)_1fr] sm:items-stretch",
        className,
      )}
    >
      <CardTilt className={cn("bg-[#0c0e13]", view === "list" && "sm:h-full")}>
        <Link href={`/cards/${card.slug}`} className="block h-full focus-visible:outline-none" aria-label={`View ${card.title}`}>
          <div className={cn("relative aspect-[3/4] overflow-hidden", view === "list" && "sm:aspect-auto sm:h-full sm:min-h-64")}>
            {frontImage ? (
              <img
                src={frontImage.imageUrl}
                alt={frontImage.altText ?? `${card.title} front`}
                className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.025]"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-secondary font-display text-3xl text-muted-foreground">
                {card.pokemonName.slice(0, 1)}
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/45 to-transparent" />
          </div>
        </Link>
      </CardTilt>

      <div className="flex min-w-0 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {card.featured && <Badge variant="gold">Featured</Badge>}
            {card.rarity && <Badge variant="outline">{card.rarity}</Badge>}
          </div>
          <Badge variant={availabilityVariant(card.availabilityStatus)}>{card.availabilityStatus.toLowerCase()}</Badge>
        </div>
        <Link href={`/cards/${card.slug}`} className="group/title w-fit focus-visible:rounded-sm">
          <h3 className="line-clamp-2 font-display text-2xl font-semibold leading-tight text-foreground transition-colors group-hover/title:text-gold">
            {card.title}
          </h3>
        </Link>
        {details && <p className="mt-1.5 text-sm text-muted-foreground">{details}</p>}
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.13em] text-muted-foreground">
          {card.cardNumber ? `No. ${card.cardNumber} · ` : ""}{card.language}
        </p>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{card.grader} {card.gradeLabel ?? card.grade}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-gold">{formatPrice(card.priceMinor, card.currency)}</p>
          </div>
          {userId ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              disabled={pending}
              aria-pressed={isFavorited}
              aria-label={isFavorited ? `Remove ${card.title} from favorites` : `Add ${card.title} to favorites`}
            >
              <Heart className={cn(isFavorited && "fill-gold text-gold")} />
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon">
              <Link href={`/login?next=${encodeURIComponent(`/cards/${card.slug}`)}`} aria-label={`Sign in to favorite ${card.title}`}>
                <Heart />
              </Link>
            </Button>
          )}
        </div>
        {error && <p className="mt-2 text-xs text-destructive" role="alert">{error}</p>}
      </div>
    </article>
  );
}
