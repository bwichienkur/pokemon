import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getCardById, getInquiriesForUser } from "@/lib/data/repository";

export default async function InquiriesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const inquiries = await getInquiriesForUser(user.id);
  const records = await Promise.all(inquiries.map(async (inquiry) => ({ inquiry, card: await getCardById(inquiry.cardId) })));
  return <section><h2 className="font-display text-4xl">Your inquiries</h2><p className="mt-3 text-sm text-muted-foreground">A private record of your conversations with the showroom.</p><div className="mt-8 divide-y divide-border border-y border-border">{records.length ? records.map(({ inquiry, card }) => <div key={inquiry.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-gold">{inquiry.referenceNumber} · {inquiry.status.replaceAll("_", " ")}</p><Link href={card ? `/cards/${card.slug}` : "/cards"} className="mt-2 block font-display text-2xl hover:text-gold">{card?.title.replace(/^DEMO Inventory — /, "") ?? "Unavailable item"}</Link><p className="mt-2 text-xs text-muted-foreground">{new Date(inquiry.createdAt).toLocaleDateString()}</p></div><p className="max-w-md text-sm leading-6 text-muted-foreground">{inquiry.message}</p></div>) : <div className="py-14 text-center"><p className="font-display text-3xl">No inquiries yet</p><Link className="mt-4 inline-block text-sm font-semibold text-gold" href="/cards">Explore the collection →</Link></div>}</div></section>;
}
