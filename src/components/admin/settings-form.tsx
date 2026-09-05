"use client";

import { type FormEvent, useState, useTransition } from "react";
import { LoaderCircle, Save } from "lucide-react";

import { updateSettingsAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type { AppSetting } from "@/types/database";

function setting<T>(settings: AppSetting[], key: string, fallback: T): T {
  return (settings.find((item) => item.key === key)?.value as T | undefined) ?? fallback;
}

export function SettingsForm({ settings }: { settings: AppSetting[] }) {
  const [showroomVisible, setShowroomVisible] = useState(setting(settings, "showroomVisible", true));
  const [autoReply, setAutoReply] = useState(setting(settings, "inquiryAutoReplyEnabled", true));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const initialNotice = setting(settings, "siteNotice", "");
  const initialEmail = setting(settings, "inquiryNotificationEmail", "");
  const initialCc = setting(settings, "inquiryCcEmails", [] as string[]);
  const featuredLimit = setting(settings, "featuredCardLimit", 6);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("inquiryNotificationEmail") || "").trim();
    const cc = String(form.get("inquiryCcEmails") || "").split(",").map((value) => value.trim()).filter(Boolean);
    const payload = {
      showroomVisible,
      directCheckoutEnabled: false as const,
      inquiryAutoReplyEnabled: autoReply,
      inquiryNotificationEmail: email || null,
      inquiryCcEmails: cc,
      siteNotice: String(form.get("siteNotice") || "").trim() || null,
      featuredCardLimit: Number(form.get("featuredCardLimit") || 6),
    };
    setError(null);
    startTransition(async () => {
      try { await updateSettingsAction(payload); toast.success("Settings saved."); }
      catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save settings."); }
    });
  }

  return <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
    {error && <p role="alert" className="rounded-md border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-red-200">{error}</p>}
    <section className="rounded-lg border border-border bg-card"><div className="border-b border-border px-5 py-4"><h2 className="font-display text-2xl font-semibold">Showroom</h2><p className="mt-1 text-sm text-muted-foreground">Control high-level presentation settings.</p></div><div className="space-y-5 p-5"><div className="flex items-center justify-between gap-6"><div><Label htmlFor="showroom-visible">Showroom visibility</Label><p className="mt-1 text-sm text-muted-foreground">Allow the public collection to be presented.</p></div><Switch id="showroom-visible" checked={showroomVisible} onCheckedChange={setShowroomVisible} /></div><div className="grid gap-2"><Label htmlFor="site-notice">Site notice</Label><Textarea id="site-notice" name="siteNotice" defaultValue={initialNotice} placeholder="Optional notice shown to visitors…" /><p className="text-xs text-muted-foreground">Use this for shipping windows, travel dates, or showroom announcements.</p></div><div className="grid max-w-56 gap-2"><Label htmlFor="featured-limit">Featured card limit</Label><Input id="featured-limit" name="featuredCardLimit" type="number" min="0" max="24" defaultValue={featuredLimit} /></div></div></section>
    <section className="rounded-lg border border-border bg-card"><div className="border-b border-border px-5 py-4"><h2 className="font-display text-2xl font-semibold">Inquiry routing</h2><p className="mt-1 text-sm text-muted-foreground">Store notification preferences in application settings.</p></div><div className="space-y-5 p-5"><div className="grid gap-2"><Label htmlFor="inquiry-email">Primary notification email</Label><Input id="inquiry-email" name="inquiryNotificationEmail" type="email" defaultValue={initialEmail} placeholder="inquiries@ateliergraded.com" /></div><div className="grid gap-2"><Label htmlFor="inquiry-cc">Additional recipients</Label><Input id="inquiry-cc" name="inquiryCcEmails" defaultValue={initialCc.join(", ")} placeholder="partner@example.com, advisor@example.com" /><p className="text-xs text-muted-foreground">Comma-separated email addresses, up to 10.</p></div><div className="flex items-center justify-between gap-6"><div><Label htmlFor="auto-reply">Buyer acknowledgement</Label><p className="mt-1 text-sm text-muted-foreground">Send the saved acknowledgement when an inquiry arrives.</p></div><Switch id="auto-reply" checked={autoReply} onCheckedChange={setAutoReply} /></div></div></section>
    <section className="rounded-lg border border-border bg-card"><div className="border-b border-border px-5 py-4"><h2 className="font-display text-2xl font-semibold">Checkout</h2><p className="mt-1 text-sm text-muted-foreground">Payment settings are intentionally unavailable.</p></div><div className="flex items-center justify-between gap-6 p-5"><div><Label htmlFor="checkout-disabled">DIRECT_CHECKOUT_ENABLED</Label><p className="mt-1 max-w-xl text-sm text-muted-foreground">Direct checkout is disabled. Atelier Graded currently handles sales through collector inquiries, not an online payment flow.</p></div><Switch id="checkout-disabled" checked={false} disabled /></div></section>
    <footer className="flex justify-end"><Button type="submit" disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}<Save />Save settings</Button></footer>
  </form>;
}
