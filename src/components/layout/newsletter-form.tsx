"use client";

import { toast } from "sonner";

export function NewsletterForm() {
  return <form onSubmit={(event) => { event.preventDefault(); toast("Coming soon"); }} className="mt-7 flex max-w-md flex-col gap-3 sm:flex-row"><input type="email" required placeholder="Your email address" className="h-12 flex-1 border border-border bg-background px-4 text-sm focus:border-gold focus:outline-none" /><button className="h-12 bg-primary px-6 text-sm font-semibold text-primary-foreground">Join the list</button></form>;
}
