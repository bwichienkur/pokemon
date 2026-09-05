import Link from "next/link";
import { ChevronRight, MessageSquareText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getAllInquiries, getCards } from "@/lib/data/repository";
import { formatPrice } from "@/lib/utils";
import type { Inquiry, InquiryStatus } from "@/types/database";

const statuses: InquiryStatus[] = ["NEW", "REVIEWING", "BUYER_CONTACTED", "NEGOTIATING", "ACCEPTED", "DECLINED", "CLOSED", "CONVERTED_TO_ORDER"];
const date = (value: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const selected = statuses.includes(status as InquiryStatus) ? status as InquiryStatus : undefined;
  const [inquiries, cards] = await Promise.all([getAllInquiries({ status: selected, perPage: 10_000 }), getCards({ perPage: 10_000 })]);
  const cardById = new Map(cards.items.map((card) => [card.id, card]));
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Buyer relationships</p><h1 className="mt-2 font-display text-4xl font-semibold">Inquiries</h1><p className="mt-2 text-sm text-muted-foreground">{inquiries.total} collector conversations. Updating an inquiry never changes a card&apos;s inventory status.</p></header>
      <form className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4"><label className="text-sm font-semibold">Status</label><select name="status" defaultValue={selected ?? ""} className="h-10 min-w-52 rounded-md border border-input bg-background/60 px-3 text-sm"><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select><button className="h-10 rounded-md border border-border px-4 text-sm font-bold hover:border-gold/55 hover:bg-gold/10">Filter</button></form>
      <div className="overflow-hidden rounded-lg border border-border bg-card"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border bg-background/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-3">Inquiry</th><th className="px-4 py-3">Collector</th><th className="px-4 py-3">Card</th><th className="px-4 py-3">Offer</th><th className="px-4 py-3">Received</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody>{inquiries.items.map((inquiry: Inquiry) => { const card = cardById.get(inquiry.cardId); return <tr key={inquiry.id} className="border-b border-border/70 last:border-0 hover:bg-accent/45"><td className="px-5 py-4 font-mono text-xs text-gold">{inquiry.referenceNumber}</td><td className="px-4 py-4"><p className="font-semibold">{inquiry.name}</p><p className="mt-1 text-xs text-muted-foreground">{inquiry.email}</p></td><td className="px-4 py-4"><p className="max-w-60 truncate font-medium">{card?.title || "Removed card"}</p><p className="mt-1 text-xs text-muted-foreground">{card ? `${card.grader} ${card.grade}` : inquiry.cardId.slice(0, 8)}</p></td><td className="px-4 py-4">{inquiry.offerAmountMinor === null ? <span className="text-muted-foreground">No offer</span> : formatPrice(inquiry.offerAmountMinor, inquiry.currency)}</td><td className="px-4 py-4 text-muted-foreground">{date(inquiry.createdAt)}</td><td className="px-4 py-4"><Badge variant={inquiry.status === "NEW" ? "gold" : inquiry.status === "DECLINED" ? "destructive" : "outline"}>{inquiry.status.replaceAll("_", " ")}</Badge></td><td className="px-4 py-4 text-right"><Link href={`/admin/inquiries/${inquiry.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-bright">Open <ChevronRight className="size-4" /></Link></td></tr>; })}</tbody></table></div>{!inquiries.items.length && <div className="px-5 py-14 text-center"><MessageSquareText className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">No inquiries match this status.</p></div>}</div>
    </div>
  );
}
