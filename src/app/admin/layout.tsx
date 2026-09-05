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
