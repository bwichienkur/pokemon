import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, MessageSquareText, PackageOpen, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/app/actions/admin";
import { getAllInquiries, getCards } from "@/lib/data/repository";
import { formatPrice } from "@/lib/utils";
import type { AuditLog, Inquiry } from "@/types/database";

const date = (value: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export default async function AdminDashboardPage() {
  const [dashboard, allInquiries, recentCards, recentSold] = await Promise.all([
    getDashboardData(),
    getAllInquiries({ perPage: 10_000 }),
    getCards({ perPage: 5, sort: "newest" }),
    getCards({ availability: ["SOLD"], perPage: 5, sort: "newest" }),
  ]);
  const { stats, auditLogs } = dashboard;
  const archived = stats.totalCards - stats.availableCards - stats.reservedCards - stats.soldCards;
  const activeListings = stats.availableCards + stats.reservedCards;
  const conversions = allInquiries.items.filter((inquiry: Inquiry) => inquiry.status === "ACCEPTED" || inquiry.status === "CONVERTED_TO_ORDER").length;
  const conversionRate = allInquiries.total ? Math.round((conversions / allInquiries.total) * 100) : 0;
  const metrics = [
    { label: "Active listings", value: activeListings, hint: `${stats.availableCards} available`, icon: PackageOpen },
    { label: "New inquiries", value: stats.newInquiries, hint: "Awaiting first response", icon: MessageSquareText },
    { label: "Inquiry conversion", value: `${conversionRate}%`, hint: `${conversions} accepted or converted`, icon: CheckCircle2 },
    { label: "Recorded sales", value: formatPrice(stats.totalSalesMinor), hint: `${stats.soldCards} cards sold`, icon: Sparkles },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Operations overview</p><h1 className="mt-2 font-display text-4xl font-semibold">Dashboard</h1><p className="mt-2 text-sm text-muted-foreground">A live view of your collectible inventory and buyer interest.</p></div>
        <Link href="/admin/cards/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-gold-bright"><Sparkles className="size-4" />Add a card</Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, hint, icon: Icon }) => <Card key={label} className="overflow-hidden"><CardContent className="p-5"><div className="flex items-start justify-between"><span className="text-sm text-muted-foreground">{label}</span><Icon className="size-4 text-gold" /></div><p className="mt-3 font-display text-4xl font-semibold">{value}</p><p className="mt-2 text-xs text-muted-foreground">{hint}</p></CardContent></Card>)}
      </div>

      <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Inventory status</CardTitle><p className="mt-1 text-sm text-muted-foreground">{stats.totalCards} cards across every publication state.</p></div><Link href="/admin/cards" className="text-sm font-bold text-gold hover:text-gold-bright">Manage inventory <ArrowUpRight className="inline size-4" /></Link></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-4">{[
        ["Available", stats.availableCards, "bg-emerald-400"], ["Reserved", stats.reservedCards, "bg-amber-400"], ["Sold", stats.soldCards, "bg-sky-400"], ["Archived", archived, "bg-zinc-500"],
      ].map(([label, value, color]) => <div key={label as string} className="rounded-md border border-border bg-background/40 p-4"><div className={`size-2 rounded-full ${color}`} /><p className="mt-3 text-2xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}</div></CardContent></Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Recently added</CardTitle><p className="mt-1 text-sm text-muted-foreground">Latest cards, including drafts.</p></div><Link href="/admin/cards" className="text-sm font-bold text-gold">All cards</Link></CardHeader><CardContent className="space-y-3">{recentCards.items.length ? recentCards.items.map((card) => <Link key={card.id} href={`/admin/cards/${card.id}/edit`} className="flex items-center justify-between rounded-md border border-border px-3 py-3 transition-colors hover:bg-accent"><div className="min-w-0"><p className="truncate text-sm font-semibold">{card.title}</p><p className="mt-1 text-xs text-muted-foreground">{card.grader} {card.grade} · Added {date(card.createdAt)}</p></div><Badge variant={card.publicationStatus === "PUBLISHED" ? "gold" : "outline"}>{card.publicationStatus}</Badge></Link>) : <p className="py-6 text-sm text-muted-foreground">No cards have been added yet.</p>}</CardContent></Card>
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Recently sold</CardTitle><p className="mt-1 text-sm text-muted-foreground">Latest completed inventory changes.</p></div><Link href="/admin/cards?availability=SOLD" className="text-sm font-bold text-gold">Sold cards</Link></CardHeader><CardContent className="space-y-3">{recentSold.items.length ? recentSold.items.map((card) => <div key={card.id} className="flex items-center justify-between rounded-md border border-border px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{card.title}</p><p className="mt-1 text-xs text-muted-foreground">Sold {card.soldAt ? date(card.soldAt) : "recently"}</p></div><span className="text-sm font-bold text-gold">{formatPrice(card.priceMinor, card.currency)}</span></div>) : <p className="py-6 text-sm text-muted-foreground">No sold cards yet.</p>}</CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Activity</CardTitle><p className="mt-1 text-sm text-muted-foreground">Recent administrative actions across inventory, inquiries, and settings.</p></CardHeader><CardContent className="space-y-2">{auditLogs.length ? auditLogs.map((log: AuditLog) => <div key={log.id} className="flex gap-3 rounded-md px-2 py-2.5"><Clock3 className="mt-0.5 size-4 shrink-0 text-gold" /><p className="flex-1 text-sm"><span className="font-semibold">{log.action.replaceAll("_", " ").toLowerCase()}</span> <span className="text-muted-foreground">on {log.entityType.toLowerCase()}{log.entityId ? ` ${log.entityId.slice(0, 8)}` : ""}</span></p><time className="shrink-0 text-xs text-muted-foreground">{date(log.createdAt)}</time></div>) : <p className="py-4 text-sm text-muted-foreground">Administrative activity will appear here.</p>}</CardContent></Card>
    </div>
  );
}
