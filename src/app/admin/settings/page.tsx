import { SettingsForm } from "@/components/admin/settings-form";
import { getAppSettings } from "@/lib/data/repository";

export default async function SettingsPage() {
  const settings = await getAppSettings();
  return <div className="space-y-7"><header className="mx-auto max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Application configuration</p><h1 className="mt-2 font-display text-4xl font-semibold">Settings</h1><p className="mt-2 text-sm text-muted-foreground">Manage public notices, inquiry routing, and stored feature flags.</p></header><SettingsForm settings={settings} /></div>;
}
