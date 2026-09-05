"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardWithImages } from "@/types/database";
import { cn } from "@/lib/utils";

const HeroSlabCanvas = dynamic(
  () => import("@/components/3d/slab-scene").then((module) => module.SlabScene),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-105 w-full rounded-2xl" />,
  },
);

export interface HeroSlabProps {
  card?: CardWithImages;
  frontUrl?: string;
  backUrl?: string;
  className?: string;
}

export function HeroSlab({ card, frontUrl: suppliedFrontUrl, backUrl: suppliedBackUrl, className }: HeroSlabProps) {
  const frontUrl = suppliedFrontUrl ?? card?.images.find((image) => image.imageType === "FRONT")?.imageUrl ?? card?.images[0]?.imageUrl;
  const backUrl = suppliedBackUrl ?? card?.images.find((image) => image.imageType === "BACK")?.imageUrl ?? frontUrl;

  return (
    <div className={cn("relative h-[min(68vw,42rem)] min-h-105 w-full overflow-hidden rounded-2xl border border-border bg-[#0b0d12]", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/3 bg-linear-to-b from-white/5 to-transparent" />
      {frontUrl && backUrl ? (
        <HeroSlabCanvas frontUrl={frontUrl} backUrl={backUrl} enableScrollTilt className="min-h-105" />
      ) : (
        <Skeleton className="h-full min-h-105 w-full rounded-none" />
      )}
    </div>
  );
}
