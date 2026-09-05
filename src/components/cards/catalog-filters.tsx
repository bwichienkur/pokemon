"use client";

import * as React from "react";
import { Grid2X2, List, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface CatalogFilterOptions {
  graders: string[];
  grades: number[];
  availability: string[];
  languages: string[];
  sets: string[];
  years: number[];
  rarities: string[];
}

export interface CatalogFiltersProps {
  options?: Partial<CatalogFilterOptions>;
  className?: string;
  /** Backwards-compatible initial values for server-rendered catalog routes. */
  query?: string;
  grader?: string;
  availability?: string;
}

const defaults: CatalogFilterOptions = {
  graders: ["PSA", "BGS", "CGC", "TAG"],
  grades: [10, 9.5, 9, 8.5, 8, 7],
  availability: ["AVAILABLE", "RESERVED", "SOLD"],
  languages: ["English", "Japanese"],
  sets: [],
  years: [],
  rarities: [],
};

const sortOptions = [
  ["newest", "Newest"],
  ["recently_added", "Recently added"],
  ["oldest", "Oldest"],
  ["price_asc", "Price: low to high"],
  ["price_desc", "Price: high to low"],
  ["grade_desc", "Grade: high to low"],
  ["year_asc", "Year: oldest first"],
] as const;

function labelFor(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

export function CatalogFilters({ options, className }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const filters = { ...defaults, ...options };

  const update = React.useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    });
    next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const value = (name: string) => searchParams.get(name) ?? "";
  const list = (name: string) => value(name).split(",").filter(Boolean);
  const setList = (name: string, item: string) => {
    const current = list(name);
    update({ [name]: current.includes(item) ? current.filter((entry) => entry !== item).join(",") : [...current, item].join(",") });
  };
  const clear = () => {
    const next = new URLSearchParams();
    const view = searchParams.get("view");
    if (view) next.set("view", view);
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
    setMobileOpen(false);
  };

  const filterFields = (
    <div className="grid gap-5">
      <label className="grid gap-2 text-sm font-medium">
        Search
        <Input value={value("q")} onChange={(event) => update({ q: event.target.value })} placeholder="Pokémon, set, or card number" />
      </label>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Price range</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={value("minPriceMinor") ? String(Number(value("minPriceMinor")) / 100) : ""}
            onChange={(event) => update({ minPriceMinor: event.target.value ? String(Math.round(Number(event.target.value) * 100)) : null })}
            placeholder="Min"
            aria-label="Minimum price"
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={value("maxPriceMinor") ? String(Number(value("maxPriceMinor")) / 100) : ""}
            onChange={(event) => update({ maxPriceMinor: event.target.value ? String(Math.round(Number(event.target.value) * 100)) : null })}
            placeholder="Max"
            aria-label="Maximum price"
          />
        </div>
      </fieldset>
      <FilterGroup label="Availability" items={filters.availability} selected={list("availability")} onToggle={(item) => setList("availability", item)} />
      <FilterGroup label="Grader" items={filters.graders} selected={list("graders")} onToggle={(item) => setList("graders", item)} />
      <FilterGroup label="Grade" items={filters.grades.map(String)} selected={list("grades")} onToggle={(item) => setList("grades", item)} />
      <FilterGroup label="Language" items={filters.languages} selected={list("languages")} onToggle={(item) => setList("languages", item)} />
      {filters.sets.length > 0 && <FilterGroup label="Set" items={filters.sets} selected={list("sets")} onToggle={(item) => setList("sets", item)} />}
      {filters.years.length > 0 && <FilterGroup label="Year" items={filters.years.map(String)} selected={[value("year")]} single onToggle={(item) => update({ year: value("year") === item ? null : item })} />}
      {filters.rarities.length > 0 && <FilterGroup label="Rarity" items={filters.rarities} selected={list("rarities")} onToggle={(item) => setList("rarities", item)} />}
      <label className="flex items-center gap-2 text-sm font-medium">
        <Checkbox checked={value("featured") === "true"} onCheckedChange={(checked) => update({ featured: checked ? "true" : null })} />
        Featured selections
      </label>
    </div>
  );

  const activeView = value("view") === "list" ? "list" : "grid";

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="hidden w-70 shrink-0 lg:block">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Refine collection</h2>
            <Button variant="link" size="sm" onClick={clear}>Clear</Button>
          </div>
          {filterFields}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-between gap-2 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline"><SlidersHorizontal />Filters</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Refine collection</SheetTitle>
              <SheetDescription>Adjust the collection to find a specific card.</SheetDescription>
            </SheetHeader>
            <div className="mt-5">{filterFields}</div>
            <Button variant="outline" className="mt-6 w-full" onClick={clear}><X />Clear filters</Button>
          </SheetContent>
        </Sheet>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <label className="sr-only" htmlFor="catalog-sort">Sort cards</label>
        <select
          id="catalog-sort"
          value={value("sort") || "newest"}
          onChange={(event) => update({ sort: event.target.value === "newest" ? null : event.target.value })}
          className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/35"
        >
          {sortOptions.map(([sort, label]) => <option key={sort} value={sort}>{label}</option>)}
        </select>
        <div className="hidden rounded-md border border-border p-0.5 sm:flex" aria-label="Catalog layout">
          <Button variant={activeView === "grid" ? "secondary" : "ghost"} size="icon-sm" onClick={() => update({ view: null })} aria-label="Grid view" aria-pressed={activeView === "grid"}><Grid2X2 /></Button>
          <Button variant={activeView === "list" ? "secondary" : "ghost"} size="icon-sm" onClick={() => update({ view: "list" })} aria-label="List view" aria-pressed={activeView === "list"}><List /></Button>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  items,
  selected,
  onToggle,
  single = false,
}: {
  label: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  single?: boolean;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="grid max-h-36 gap-2 overflow-y-auto pr-1">
        {items.map((item) => {
          const id = `${label}-${item}`.replaceAll(/\s+/g, "-").toLowerCase();
          return (
            <label key={item} htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox id={id} checked={selected.includes(item)} onCheckedChange={() => onToggle(item)} aria-label={`${label}: ${labelFor(item)}`} />
              {single ? item : labelFor(item)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
