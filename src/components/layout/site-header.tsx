"use client";

import Link from "next/link";
import * as React from "react";
import { Menu, UserRound } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/cards", label: "Collection" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/featured", label: "Featured" },
  { href: "/sold", label: "Sold" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-40 border-b border-transparent transition-all duration-300", scrolled && "glass border-border")}>
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Logo />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-gold focus-visible:rounded-sm">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <Button asChild variant="ghost" size="sm"><Link href="/login"><UserRound />Sign in</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/account">Account</Link></Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="ghost" size="icon" aria-label="Open navigation menu"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm">
            <SheetHeader>
              <SheetTitle><Logo /></SheetTitle>
              <SheetDescription>Private access to exceptional graded collectibles.</SheetDescription>
            </SheetHeader>
            <nav className="mt-6 flex flex-col border-t border-border pt-4" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-sm px-2 py-3 font-display text-2xl text-foreground transition-colors hover:bg-accent hover:text-gold">
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto grid gap-2 border-t border-border pt-5">
              <Button asChild variant="outline"><Link href="/login" onClick={() => setOpen(false)}>Sign in</Link></Button>
              <Button asChild><Link href="/account" onClick={() => setOpen(false)}>My account</Link></Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
