import { CatalogCard } from "@/components/cards/catalog-card";
import type { CardWithImages } from "@/types/database";
import { cn } from "@/lib/utils";

export interface CatalogGridProps {
  cards: CardWithImages[];
  userId?: string | null;
  favoriteCardIds?: Iterable<string>;
  view?: "grid" | "list";
  className?: string;
  emptyMessage?: string;
}

export function CatalogGrid({
  cards,
  userId,
  favoriteCardIds,
  view = "grid",
  className,
  emptyMessage = "No cards match the current selection.",
}: CatalogGridProps) {
  const favorites = new Set(favoriteCardIds);

  if (!cards.length) {
    return (
      <div className={cn("rounded-xl border border-dashed border-border px-6 py-16 text-center", className)}>
        <p className="font-display text-2xl">No results</p>
        <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn(view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-4", className)}>
      {cards.map((card) => (
        <CatalogCard
          key={card.id}
          card={card}
          userId={userId}
          favorited={favorites.has(card.id)}
          view={view}
        />
      ))}
    </div>
  );
}

export function CatalogGridSkeleton() {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="animate-pulse border border-border bg-card"><div className="aspect-[4/5] bg-muted" /><div className="space-y-3 p-5"><div className="h-3 w-1/3 bg-muted" /><div className="h-7 w-4/5 bg-muted" /><div className="h-4 w-1/2 bg-muted" /></div></div>)}</div>;
}
