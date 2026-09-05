import Link from "next/link";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return <Container className="flex min-h-[60vh] items-center py-16"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-gold">404 · Lost in the archive</p><h1 className="mt-5 font-display text-6xl leading-none">This object is not<br />in the showroom.</h1><p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">It may have moved to a private collection, or the link may no longer be current.</p><Link href="/cards" className="mt-8 inline-block bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Return to the collection</Link></div></Container>;
}
