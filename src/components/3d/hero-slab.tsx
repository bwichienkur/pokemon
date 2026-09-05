"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const HeroSlabCanvas = dynamic(
  () => import("@/components/3d/slab-scene").then((module) => module.SlabScene),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-105 w-full rounded-2xl" />,
  },
);

export interface HeroSlabProps {
  frontUrl: string;
  backUrl: string;
  className?: string;
}

export function HeroSlab({ frontUrl, backUrl, className }: HeroSlabProps) {
  return (
    <div className={cn("relative h-[min(68vw,42rem)] min-h-105 w-full overflow-hidden rounded-2xl border border-border bg-[#0b0d12]", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/3 bg-linear-to-b from-white/5 to-transparent" />
      <HeroSlabCanvas
        frontUrl={frontUrl}
        backUrl={backUrl}
        enableScrollTilt
        className="min-h-105"
      />
    </div>
  );
}
"use client";

import Image from "next/image";
import type { CardWithImages } from "@/types/database";

export function HeroSlab({ card }: { card?: CardWithImages }) {
  const image = card?.images[0];
  return (
    <div className="relative mx-auto w-full max-w-sm [perspective:1000px]">
      <div className="slab-glare relative aspect-[4/5] rotate-[-5deg] overflow-hidden border border-gold/35 bg-card p-4 shadow-[20px_30px_80px_rgba(0,0,0,.55)] transition duration-700 hover:rotate-[-1deg]">
        <div className="absolute inset-x-4 top-4 z-10 border-b border-gold/30 pb-2 text-center text-[9px] font-bold tracking-[.25em] text-gold">ATELIER GRADED</div>
        {image ? <Image src={image.imageUrl} alt={image.altText ?? card?.title ?? "Featured graded collectible"} fill priority className="object-cover p-7 pt-12" /> : <div className="grid h-full place-items-center text-muted-foreground">Featured selection</div>}
        <div className="absolute inset-x-4 bottom-4 z-10 flex justify-between border-t border-gold/30 pt-2 text-[9px] font-bold tracking-wider text-gold"><span>{card?.grader ?? "PSA"} {card?.grade ?? "10"}</span><span>SHOWROOM EDITION</span></div>
      </div>
    </div>
  );
}
