import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>}
      <h2 className="font-display text-4xl leading-[0.95] font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>}
    </div>
  );
}
