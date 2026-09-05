import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <Container className="py-10 sm:py-16"><div className="mb-10 border-b border-border pb-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-gold">Private account</p><div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><h1 className="font-display text-5xl">Welcome, {user.displayName ?? "collector"}.</h1><nav className="flex gap-5 text-xs font-bold uppercase tracking-[.13em] text-muted-foreground"><Link href="/account" className="hover:text-gold">Profile</Link><Link href="/account/inquiries" className="hover:text-gold">Inquiries</Link></nav></div></div>{children}</Container>;
}
