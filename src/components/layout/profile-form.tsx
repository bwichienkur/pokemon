"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateMyProfile } from "@/app/actions/auth";

export function ProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const [pending, setPending] = useState(false);
  return <form action={async (form) => { setPending(true); try { await updateMyProfile({ displayName: form.get("displayName"), phone: form.get("phone") }); toast.success("Profile updated."); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update profile."); } finally { setPending(false); } }} className="mt-7 max-w-xl space-y-4"><label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Email<input disabled defaultValue={email} className="mt-2 h-11 w-full border border-border bg-muted/30 px-3 text-sm text-muted-foreground" /></label><label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Display name<input required name="displayName" defaultValue={name} className="mt-2 h-11 w-full border border-border bg-background px-3 text-sm text-foreground focus:border-gold focus:outline-none" /></label><label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone<input name="phone" defaultValue={phone} className="mt-2 h-11 w-full border border-border bg-background px-3 text-sm text-foreground focus:border-gold focus:outline-none" /></label><button disabled={pending} className="h-11 bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{pending ? "Saving…" : "Save profile"}</button></form>;
}
