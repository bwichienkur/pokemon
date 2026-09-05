"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Archive, Check, Star } from "lucide-react";

import { bulkCardsAction } from "@/app/actions/admin";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import type { CardWithImages } from "@/types/database";

const availabilityStyle: Record<CardWithImages["availabilityStatus"], "gold" | "outline" | "destructive"> = {
  AVAILABLE: "gold", RESERVED: "outline", SOLD: "outline", ARCHIVED: "destructive",
};

export function CardsTable({ cards }: { cards: CardWithImages[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allSelected = cards.length > 0 && selected.length === cards.length;

  function run(action: "SET_FEATURED" | "CLEAR_FEATURED" | "ARCHIVE") {
    startTransition(async () => {
      try {
        await bulkCardsAction({ action, cardIds: selected });
        setSelected([]);
        toast.success(action === "ARCHIVE" ? "Cards archived." : action === "SET_FEATURED" ? "Cards featured." : "Cards unfeatured.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to update cards.");
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
      {selected.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/30 bg-gold/10 px-4 py-3"><p className="text-sm font-semibold">{selected.length} selected</p><div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => run("SET_FEATURED")}><Star />Feature</Button><Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => run("CLEAR_FEATURED")}><Check />Unfeature</Button><AlertDialog><AlertDialogTrigger asChild><Button type="button" size="sm" variant="destructive" disabled={pending}><Archive />Archive</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Archive selected cards?</AlertDialogTitle><AlertDialogDescription>Archived cards are removed from active inventory. This can be reversed from the card editor.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/85" onClick={() => run("ARCHIVE")}>Archive {selected.length} cards</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-border bg-background/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="w-12 px-4 py-3"><Checkbox aria-label="Select all cards" checked={allSelected} onCheckedChange={(checked) => setSelected(checked ? cards.map((card) => card.id) : [])} /></th><th className="px-3 py-3">Card</th><th className="px-3 py-3">Grade</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Publication</th><th className="px-3 py-3" /></tr></thead>
          <tbody>{cards.map((card) => <tr key={card.id} className="border-b border-border/70 last:border-0 hover:bg-accent/45"><td className="px-4 py-3"><Checkbox aria-label={`Select ${card.title}`} checked={selectedSet.has(card.id)} onCheckedChange={(checked) => setSelected((current) => checked ? [...current, card.id] : current.filter((id) => id !== card.id))} /></td><td className="px-3 py-3"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center overflow-hidden rounded border border-border bg-background/60 text-[10px] text-muted-foreground">{card.images[0] ? <img src={card.images[0].imageUrl} alt="" className="size-full object-cover" /> : "NO IMG"}</div><div className="min-w-0"><p className="max-w-72 truncate font-semibold">{card.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{card.certificationNumber} · {card.setName || "No set"}</p></div></div></td><td className="px-3 py-3"><p className="font-semibold">{card.grader} {card.grade}</p><p className="text-xs text-muted-foreground">{card.gradeLabel || "Graded"}</p></td><td className="px-3 py-3 font-semibold">{formatPrice(card.priceMinor, card.currency)}</td><td className="px-3 py-3"><Badge variant={availabilityStyle[card.availabilityStatus]}>{card.availabilityStatus}</Badge></td><td className="px-3 py-3"><Badge variant={card.publicationStatus === "PUBLISHED" ? "gold" : "outline"}>{card.publicationStatus}</Badge></td><td className="px-3 py-3 text-right"><Link href={`/admin/cards/${card.id}/edit`} className="text-sm font-bold text-gold hover:text-gold-bright">Edit</Link></td></tr>)}</tbody>
        </table>
      </div>
      {!cards.length && <p className="px-5 py-14 text-center text-sm text-muted-foreground">No cards match these filters.</p>}
    </div>
  );
}
