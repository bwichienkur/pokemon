import type { Metadata } from "next";
import { CatalogGrid } from "@/components/cards/catalog-grid";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { getFeaturedCards } from "@/lib/data/repository";

export const metadata: Metadata = { title: "Featured", description: "The Atelier Graded featured collection.", openGraph: { title: "Featured Acquisitions | Atelier Graded" } };
export default async function FeaturedPage() {
  const cards = await getFeaturedCards(24);
  return <Container className="py-16 sm:py-24"><SectionHeading eyebrow="The current edit" title="Featured acquisitions" description="A focused selection chosen for its condition, rarity, and lasting collector appeal." /><div className="mt-12"><CatalogGrid cards={cards} /></div></Container>;
}
