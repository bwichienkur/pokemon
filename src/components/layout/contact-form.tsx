"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitContact } from "@/app/actions/contact";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  return <form action={async (data) => { setPending(true); try { await submitContact(Object.fromEntries(data)); toast.success("Your note has been received."); (document.getElementById("contact-form") as HTMLFormElement | null)?.reset(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to send your note."); } finally { setPending(false); } }} id="contact-form" className="space-y-4"><input required name="name" placeholder="Name" className="h-12 w-full border border-border bg-background px-4 text-sm focus:border-gold focus:outline-none" /><input required type="email" name="email" placeholder="Email address" className="h-12 w-full border border-border bg-background px-4 text-sm focus:border-gold focus:outline-none" /><textarea required minLength={10} name="message" rows={6} placeholder="How can we help?" className="w-full border border-border bg-background p-4 text-sm focus:border-gold focus:outline-none" /><button disabled={pending} className="h-12 w-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50">{pending ? "Sending…" : "Send a note"}</button></form>;
}
