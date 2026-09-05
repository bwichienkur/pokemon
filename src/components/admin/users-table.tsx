"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";

import { setUserRoleAction } from "@/app/actions/admin";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { Profile, Role } from "@/types/database";

export function UsersTable({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  const [pending, startTransition] = useTransition();
  const [roles, setRoles] = useState<Record<string, Role>>(() => Object.fromEntries(users.map((user) => [user.id, user.role])));
  function save(id: string) {
    const role = roles[id];
    startTransition(async () => {
      try { await setUserRoleAction(id, role); toast.success("User role updated."); }
      catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update role."); }
    });
  }
  return <div className="overflow-hidden rounded-lg border border-border bg-card"><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b border-border bg-background/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-3">User</th><th className="px-4 py-3">Current role</th><th className="px-4 py-3">Member since</th><th className="px-4 py-3 text-right">Access</th></tr></thead><tbody>{users.map((user) => { const self = user.id === currentUserId; const changed = roles[user.id] !== user.role; return <tr key={user.id} className="border-b border-border/70 last:border-0"><td className="px-5 py-4"><p className="font-semibold">{user.displayName || "Unnamed user"} {self && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}</p><p className="mt-1 text-xs text-muted-foreground">{user.email}</p></td><td className="px-4 py-4"><Badge variant={user.role === "ADMIN" ? "gold" : "outline"}>{user.role}</Badge></td><td className="px-4 py-4 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td><td className="px-4 py-4"><div className="flex justify-end gap-2"><select aria-label={`Role for ${user.email}`} value={roles[user.id]} disabled={self || pending} onChange={(event) => setRoles((current) => ({ ...current, [user.id]: event.target.value as Role }))} className="h-9 rounded-md border border-input bg-background/60 px-2 text-sm disabled:opacity-50"><option value="USER">User</option><option value="ADMIN">Administrator</option></select>{self ? <span className="flex h-9 items-center px-2 text-xs text-muted-foreground">Self protected</span> : <AlertDialog><AlertDialogTrigger asChild><Button type="button" size="sm" variant="outline" disabled={pending || !changed}>Change role</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Change {user.displayName || user.email}&apos;s role?</AlertDialogTitle><AlertDialogDescription>This immediately changes what this user can access. Administrators can manage all inventory and settings.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => save(user.id)}>{pending && <LoaderCircle className="animate-spin" />}Confirm change</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}</div></td></tr>; })}</tbody></table></div><div className="flex items-center gap-2 border-t border-border px-5 py-3 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-gold" />Role changes are checked again by a protected server action.</div></div>;
}
