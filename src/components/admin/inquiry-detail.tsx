"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, LoaderCircle, LockKeyhole, Save } from "lucide-react";
import Link from "next/link";

import { addInquiryNoteAction, updateInquiryStatusAction } from "@/app/actions/inquiries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import type { AuditLog, CardWithImages, Inquiry, InquiryNote, InquiryStatus } from "@/types/database";

const statuses: InquiryStatus[] = ["NEW", "REVIEWING", "BUYER_CONTACTED", "NEGOTIATING", "ACCEPTED", "DECLINED", "CLOSED", "CONVERTED_TO_ORDER"];

export function InquiryDetail({ inquiry, card, notes, activity }: { inquiry: Inquiry; card: CardWithImages | null; notes: InquiryNote[]; activity: AuditLog[] }) {
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [message, setMessage] = useState("");
  const [localNotes, setLocalNotes] = useState(notes);
  const [pending, startTransition] = useTransition();
  const updateStatus = () => startTransition(async () => {
    try { await updateInquiryStatusAction(inquiry.id, { status }); toast.success("Inquiry status updated."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update inquiry."); }
  });
  const addNote = () => startTransition(async () => {
    try { const note = await addInquiryNoteAction(inquiry.id, { body: message, isInternal: true }); setLocalNotes((current) => [...current, note]); setMessage(""); toast.success("Internal note added."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to add note."); }
  });
  return <div className="mx-auto max-w-5xl space-y-6">
    <header><Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-bright"><ArrowLeft className="size-4" />All inquiries</Link><div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-mono text-xs text-gold">{inquiry.referenceNumber}</p><h1 className="mt-2 font-display text-4xl font-semibold">{inquiry.name}</h1><p className="mt-2 text-sm text-muted-foreground">{inquiry.email}{inquiry.phone ? ` · ${inquiry.phone}` : ""}</p></div><Badge variant={status === "NEW" ? "gold" : status === "DECLINED" ? "destructive" : "outline"}>{status.replaceAll("_", " ")}</Badge></div></header>
    <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]"><div className="space-y-6"><section className="rounded-lg border border-border bg-card p-5"><h2 className="font-display text-2xl font-semibold">Message</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground/90">{inquiry.message}</p><div className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2"><p><span className="text-muted-foreground">Preferred contact:</span> {inquiry.preferredContactMethod}</p><p><span className="text-muted-foreground">Location:</span> {inquiry.country}{inquiry.postalCode ? ` · ${inquiry.postalCode}` : ""}</p><p><span className="text-muted-foreground">Offer:</span> {inquiry.offerAmountMinor === null ? " No offer submitted" : ` ${formatPrice(inquiry.offerAmountMinor, inquiry.currency)}`}</p></div></section>
      <section className="rounded-lg border border-border bg-card p-5"><div className="flex items-center gap-2"><LockKeyhole className="size-4 text-gold" /><h2 className="font-display text-2xl font-semibold">Internal notes</h2></div><p className="mt-1 text-sm text-muted-foreground">Visible only to administrators.</p><Textarea value={message} onChange={(event) => setMessage(event.target.value)} className="mt-4" placeholder="Add a note for the team…" /><div className="mt-3 flex justify-end"><Button type="button" size="sm" disabled={pending || !message.trim()} onClick={addNote}>{pending && <LoaderCircle className="animate-spin" />}Add note</Button></div><div className="mt-5 space-y-3">{localNotes.length ? localNotes.map((note) => <div key={note.id} className="rounded-md border border-border bg-background/40 p-3"><p className="whitespace-pre-wrap text-sm">{note.note}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p></div>) : <p className="text-sm text-muted-foreground">No internal notes yet.</p>}</div></section>
      <section className="rounded-lg border border-border bg-card p-5"><h2 className="font-display text-2xl font-semibold">Activity</h2><div className="mt-4 space-y-3">{activity.length ? activity.map((log) => <div key={log.id} className="border-l border-gold/50 pl-3"><p className="text-sm font-semibold">{log.action.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p></div>) : <p className="text-sm text-muted-foreground">No recorded status activity yet.</p>}</div></section></div>
      <aside className="space-y-6"><section className="rounded-lg border border-border bg-card p-5"><h2 className="font-display text-2xl font-semibold">Status</h2><p className="mt-1 text-sm text-muted-foreground">This only updates the inquiry. It never marks a card as sold.</p><select value={status} onChange={(event) => setStatus(event.target.value as InquiryStatus)} className="mt-4 h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm">{statuses.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select><Button type="button" className="mt-3 w-full" disabled={pending || status === inquiry.status} onClick={updateStatus}>{pending && <LoaderCircle className="animate-spin" />}<Save />Save status</Button></section>
        <section className="rounded-lg border border-border bg-card p-5"><h2 className="font-display text-2xl font-semibold">Related card</h2>{card ? <Link href={`/admin/cards/${card.id}/edit`} className="mt-4 block rounded-md border border-border p-3 hover:bg-accent"><p className="font-semibold">{card.title}</p><p className="mt-1 text-sm text-muted-foreground">{card.grader} {card.grade} · {formatPrice(card.priceMinor, card.currency)}</p></Link> : <p className="mt-3 text-sm text-muted-foreground">The related card is no longer available.</p>}</section></aside></div>
  </div>;
}
