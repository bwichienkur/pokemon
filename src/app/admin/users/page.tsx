import { UsersTable } from "@/components/admin/users-table";
import { requireAdmin } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/repository";

export default async function UsersPage() {
  const [currentUser, users] = await Promise.all([requireAdmin(), listUsers()]);
  return <div className="mx-auto max-w-7xl space-y-7"><header><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Access control</p><h1 className="mt-2 font-display text-4xl font-semibold">Users</h1><p className="mt-2 text-sm text-muted-foreground">Manage administrator access. Your own role is protected from changes here.</p></header><UsersTable users={users} currentUserId={currentUser.id} /></div>;
}
