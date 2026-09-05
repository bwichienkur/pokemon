import { ProfileForm } from "@/components/layout/profile-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return <section className="border border-border bg-card p-6 sm:p-8"><h2 className="font-display text-4xl">Profile details</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Keep your contact details current so our correspondence reaches you smoothly.</p><ProfileForm name={user.displayName ?? ""} phone={user.phone ?? ""} email={user.email} /></section>;
}
