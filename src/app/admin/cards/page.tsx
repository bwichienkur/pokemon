import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { CardsTable } from "@/components/admin/cards-table";
import { getCards } from "@/lib/data/repository";

type SearchParams = Promise<{ q?: string; availability?: string; publicationStatus?: string }>;

export default async function AdminCardsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const availability = params.availability?.split(",").filter(Boolean) as ("AVAILABLE" | "RESERVED" | "SOLD" | "ARCHIVED")[] | undefined;
  const publicationStatus = params.publicationStatus?.split(",").filter(Boolean) as ("DRAFT" | "PUBLISHED")[] | undefined;
  const { items, total } = await getCards({ q: params.q, availability, publicationStatus, perPage: 10_000 });

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Inventory management</p><h1 className="mt-2 font-display text-4xl font-semibold">Cards</h1><p className="mt-2 text-sm text-muted-foreground">{total} cards, including drafts and archived inventory.</p></div>
        <Link href="/admin/cards/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-gold-bright"><Plus className="size-4" />New card</Link>
      </header>
      <form className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_180px_180px_auto]">
        <label className="relative"><span className="sr-only">Search cards</span><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><input name="q" defaultValue={params.q} placeholder="Search title, Pokémon, or certificate…" className="h-10 w-full rounded-md border border-input bg-background/60 pr-3 pl-9 text-sm outline-none focus:border-gold/70" /></label>
        <select name="availability" defaultValue={params.availability || ""} className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm"><option value="">All inventory states</option><option value="AVAILABLE">Available</option><option value="RESERVED">Reserved</option><option value="SOLD">Sold</option><option value="ARCHIVED">Archived</option></select>
        <select name="publicationStatus" defaultValue={params.publicationStatus || ""} className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm"><option value="">All publication states</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select>
        <button className="h-10 rounded-md border border-border px-4 text-sm font-bold hover:border-gold/55 hover:bg-gold/10">Filter</button>
      </form>
      <CardsTable cards={items} />
    </div>
  );
}
