"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, CreditCard, LayoutDashboard, MessageSquareText, Settings, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cards", label: "Cards", icon: CreditCard },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquareText },
  { href: "/admin/users", label: "Users", icon: UsersRound },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ administrator }: { administrator: string }) {
  const pathname = usePathname();
  return (
    <aside className="border-b border-border bg-[#0a0d13] md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-r md:border-b-0">
      <div className="flex h-full flex-col p-4">
        <Link href="/admin" className="mb-7 flex items-center gap-3 px-2 pt-2">
          <span className="grid size-9 place-items-center rounded-md bg-gold text-primary-foreground"><Boxes className="size-5" /></span>
          <span><span className="block font-display text-xl font-semibold">Atelier</span><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Admin studio</span></span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Administration">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn(
                "flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                active && "bg-gold/12 text-gold-bright",
              )}>
                <Icon className="size-4" />{label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden border-t border-border px-2 pt-4 md:block">
          <p className="truncate text-sm font-semibold">{administrator}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Administrator</p>
          <Link href="/" className="mt-3 inline-block text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-bright">View showroom →</Link>
        </div>
      </div>
    </aside>
  );
}
