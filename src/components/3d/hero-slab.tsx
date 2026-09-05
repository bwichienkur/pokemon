"use client";

import * as React from "react";
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
    loading: () => <Skeleton className="h-full min-h-[28rem] w-full" />,
  },
);

export interface HeroSlabProps {
  card?: CardWithImages;
  frontUrl?: string;
  backUrl?: string;
  className?: string;
  /** Edge-to-edge stage with no card chrome — for immersive landing heroes. */
  fullBleed?: boolean;
  /** Hide the featured caption overlay (copy lives elsewhere on the page). */
  hideCaption?: boolean;
}

export function HeroSlab({
  card,
  frontUrl: suppliedFrontUrl,
  backUrl: suppliedBackUrl,
  className,
  fullBleed = false,
  hideCaption = false,
}: HeroSlabProps) {
  const frontUrl =
    suppliedFrontUrl ??
    card?.images.find((image) => image.imageType === "FRONT")?.imageUrl ??
    card?.images[0]?.imageUrl;
  const backUrl =
    suppliedBackUrl ??
    card?.images.find((image) => image.imageType === "BACK")?.imageUrl ??
    frontUrl;
  const [wideStage, setWideStage] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWideStage(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <div
      className={cn(
        "relative isolate h-full min-h-[28rem] w-full overflow-hidden bg-[#05070c]",
        !fullBleed &&
          "h-[min(78vw,46rem)] rounded-[1.75rem] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]",
        className,
      )}
    >
      {/* Atmospheric stage lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(198,167,94,0.28),transparent_40%),radial-gradient(circle_at_82%_68%,rgba(90,140,255,0.2),transparent_34%),radial-gradient(circle_at_12%_78%,rgba(180,90,255,0.14),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/3 bg-gradient-to-b from-white/[0.12] to-transparent" />
      <div className="pointer-events-none absolute inset-x-[12%] bottom-[8%] z-10 h-28 rounded-full bg-black/55 blur-3xl" />

      {/* Soft floating dust for depth beyond the WebGL canvas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] opacity-50 [background-image:radial-gradient(1.5px_1.5px_at_20%_30%,rgba(240,213,138,0.55),transparent),radial-gradient(1px_1px_at_70%_20%,rgba(255,255,255,0.45),transparent),radial-gradient(1.5px_1.5px_at_40%_70%,rgba(140,190,255,0.4),transparent),radial-gradient(1px_1px_at_85%_55%,rgba(240,213,138,0.35),transparent),radial-gradient(1px_1px_at_15%_80%,rgba(255,255,255,0.3),transparent)] animate-[pulse_7s_ease-in-out_infinite]"
      />

      {frontUrl && backUrl ? (
        <HeroSlabCanvas
          frontUrl={frontUrl}
          backUrl={backUrl}
          enableScrollTilt
          cinematic
          stageOffset={fullBleed && wideStage ? [1.35, 0.05, 0] : [0, 0, 0]}
          className={cn("min-h-[28rem]", fullBleed && "min-h-full")}
        />
      ) : (
        <Skeleton className="h-full min-h-[28rem] w-full rounded-none" />
      )}

      {!hideCaption && card && (
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
