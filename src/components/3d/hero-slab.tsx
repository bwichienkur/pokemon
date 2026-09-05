"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardWithImages } from "@/types/database";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const HeroSlabCanvas = dynamic(
  () => import("@/components/3d/slab-scene").then((module) => module.SlabScene),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-[28rem] w-full rounded-[1.75rem]" />,
  },
);

export interface HeroSlabProps {
  card?: CardWithImages;
  frontUrl?: string;
  backUrl?: string;
  className?: string;
}

export function HeroSlab({
  card,
  frontUrl: suppliedFrontUrl,
  backUrl: suppliedBackUrl,
  className,
}: HeroSlabProps) {
  const frontUrl =
    suppliedFrontUrl ??
    card?.images.find((image) => image.imageType === "FRONT")?.imageUrl ??
    card?.images[0]?.imageUrl;
  const backUrl =
    suppliedBackUrl ??
    card?.images.find((image) => image.imageType === "BACK")?.imageUrl ??
    frontUrl;

  return (
    <div
      className={cn(
        "relative isolate h-[min(78vw,46rem)] min-h-[28rem] w-full overflow-hidden rounded-[1.75rem]",
        "border border-white/10 bg-[#05070c]",
        "shadow-[0_40px_120px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]",
        className,
      )}
    >
      {/* Atmospheric stage lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(198,167,94,0.22),transparent_42%),radial-gradient(circle_at_80%_70%,rgba(90,140,255,0.16),transparent_35%),radial-gradient(circle_at_15%_75%,rgba(180,90,255,0.1),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/3 bg-gradient-to-b from-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-8 bottom-6 z-10 h-24 rounded-full bg-black/50 blur-2xl" />

      {frontUrl && backUrl ? (
        <HeroSlabCanvas
          frontUrl={frontUrl}
          backUrl={backUrl}
          enableScrollTilt
          cinematic
          className="min-h-[28rem]"
        />
      ) : (
        <Skeleton className="h-full min-h-[28rem] w-full rounded-none" />
      )}

      {card && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-5 pt-16 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold">
                Featured slab
              </p>
              <p className="mt-1 truncate font-display text-2xl text-white sm:text-3xl">
                {card.title}
              </p>
              <p className="mt-1 text-sm text-white/65">
                {card.grader} {card.gradeLabel ?? card.grade}
                {card.year ? ` · ${card.year}` : ""}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-2xl text-gold sm:text-3xl">
                {formatMoney(card.priceMinor, card.currency)}
              </p>
              <Link
                href={`/cards/${card.slug}`}
                className="pointer-events-auto mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-white/80 underline-offset-4 hover:text-gold hover:underline"
              >
                Inspect
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
