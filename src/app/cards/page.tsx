import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { CatalogFilters } from "@/components/cards/catalog-filters";
import { CatalogGrid, CatalogGridSkeleton } from "@/components/cards/catalog-grid";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { getCards } from "@/lib/data/repository";
import { cardFiltersSchema } from "@/lib/validations/card";

export const metadata: Metadata = { title: "Collection", description: "Browse the private Atelier Graded collection.", openGraph: { title: "The Collection | Atelier Graded", description: "A considered selection of graded collectibles." } };
type Search = Record<string, string | string[] | undefined>;

async function Results({ searchParams }: { searchParams: Promise<Search> }) {
  const raw = await searchParams;
  const parsed = cardFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : cardFiltersSchema.parse({});
  const { items, total, page, perPage } = await getCards({ ...filters, publicationStatus: "PUBLISHED" } as typeof filters);
  const pages = Math.ceil(total / perPage);
  const makePage = (next: number) => { const params = new URLSearchParams(); Object.entries(raw).forEach(([key, value]) => params.set(key, Array.isArray(value) ? value.join(",") : value ?? "")); params.set("page", String(next)); return `/cards?${params}`; };
  return <><p className="mb-6 text-sm text-muted-foreground">{total} {total === 1 ? "piece" : "pieces"} in the catalogue</p><CatalogGrid cards={items} />{pages > 1 && <nav className="mt-10 flex justify-center gap-4" aria-label="Catalog pagination">{page > 1 && <Link className="border border-border px-4 py-2 text-sm hover:border-gold" href={makePage(page - 1)}>Previous</Link>}<span className="px-4 py-2 text-sm text-muted-foreground">Page {page} of {pages}</span>{page < pages && <Link className="border border-border px-4 py-2 text-sm hover:border-gold" href={makePage(page + 1)}>Next</Link>}</nav>}</>;
}

export default async function CardsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const raw = await searchParams;
  return <Container className="py-16 sm:py-24"><SectionHeading eyebrow="The collection" title="Objects of conviction" description="Every listing is designed to give your research a clear beginning." /><div className="mt-10"><CatalogFilters query={typeof raw.q === "string" ? raw.q : ""} grader={typeof raw.graders === "string" ? raw.graders : ""} availability={typeof raw.availability === "string" ? raw.availability : ""} /></div><div className="mt-10"><Suspense fallback={<CatalogGridSkeleton />}><Results searchParams={Promise.resolve(raw)} /></Suspense></div></Container>;
}
