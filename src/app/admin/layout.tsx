import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <div className="bg-[#0b0e13]"><div className="border-b border-border bg-card/70"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-gold">Atelier Graded</p><p className="font-display text-2xl">Admin atelier</p></div><p className="text-xs text-muted-foreground">{admin.email}</p></div></div><div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[190px_1fr] lg:px-12"><aside><nav className="flex gap-4 overflow-auto text-xs font-bold uppercase tracking-[.13em] text-muted-foreground lg:flex-col"><Link href="/admin" className="hover:text-gold">Overview</Link><Link href="/admin/cards" className="hover:text-gold">Cards</Link><Link href="/admin/inquiries" className="hover:text-gold">Inquiries</Link></nav></aside><section>{children}</section></div></div>;
}
import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getCurrentUser, requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Read the session here and verify the role again on the server. Middleware
  // is only an early routing gate and must not be the authorization boundary.
  const currentUser = await getCurrentUser();
  const administrator = await requireAdmin();
  const name = currentUser?.displayName || administrator.email;

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#080b10]">
      <div className="mx-auto flex max-w-[1600px]">
        <AdminSidebar administrator={name} />
        <section className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">{children}</section>
      </div>
    </div>
  );
}
