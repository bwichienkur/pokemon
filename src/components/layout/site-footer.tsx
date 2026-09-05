import Link from "next/link";

import { Instagram, Mail, MessageCircle } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";

const shopLinks = [
  { href: "/collection", label: "Collection" },
  { href: "/new-arrivals", label: "New arrivals" },
  { href: "/featured", label: "Featured pieces" },
  { href: "/sold", label: "Archive of sold" },
];
const policyLinks = [
  { href: "/shipping", label: "Shipping & returns" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms of sale" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-[#090b0f]">
      <Container className="py-14 sm:py-18">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-6 text-muted-foreground">A discreet, considered marketplace for exceptional graded collectibles.</p>
            <div className="mt-6 flex gap-2">
              <a href="mailto:concierge@ateliergraded.com" className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold" aria-label="Email Atelier Graded"><Mail className="size-4" /></a>
              <a href="#" className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold" aria-label="Instagram placeholder"><Instagram className="size-4" /></a>
              <a href="#" className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold" aria-label="Community placeholder"><MessageCircle className="size-4" /></a>
            </div>
          </div>
          <FooterColumn title="Browse" links={shopLinks} />
          <FooterColumn title="Client care" links={[{ href: "/contact", label: "Contact concierge" }, { href: "/how-it-works", label: "How it works" }, { href: "/authentication", label: "Authentication" }]} />
          <FooterColumn title="Policies" links={policyLinks} />
        </div>
        <div className="mt-12 grid gap-4 border-t border-border pt-6 text-xs leading-5 text-muted-foreground md:grid-cols-[1fr_auto]">
          <p>© {new Date().getFullYear()} Atelier Graded. All rights reserved.</p>
          <p className="max-w-xl md:text-right">Atelier Graded is an independent marketplace and is not affiliated with The Pokémon Company, Nintendo, or any grading company.</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => <li key={link.href}><Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link></li>)}
      </ul>
    </div>
  );
}
