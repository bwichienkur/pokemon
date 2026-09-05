import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  compact?: boolean;
}

export function Logo({ className, href = "/", compact = false }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5 text-foreground focus-visible:rounded-sm", className)}
      aria-label="Atelier Graded home"
    >
      <span className="grid size-7 place-items-center rounded-sm border border-gold/55 bg-gold/10 font-display text-lg font-semibold text-gold-bright transition-colors group-hover:border-gold">
        A
      </span>
      <span className="leading-none">
        <span className="block font-display text-[1.45rem] font-semibold tracking-[0.01em]">Atelier</span>
        {!compact && <span className="block pt-0.5 text-[0.57rem] font-bold uppercase tracking-[0.27em] text-gold">Graded</span>}
      </span>
    </Link>
  );
}
