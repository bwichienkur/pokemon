import type { Metadata } from "next";
import { CatalogGrid } from "@/components/cards/catalog-grid";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { getSoldCards } from "@/lib/data/repository";

export const metadata: Metadata = { title: "Sold Archive", description: "Pieces previously placed through Atelier Graded.", openGraph: { title: "Sold Archive | Atelier Graded" } };
export default async function SoldPage() {
  const cards = await getSoldCards(24);
  return <Container className="py-16 sm:py-24"><SectionHeading eyebrow="Placed with collectors" title="Sold archive" description="A record of pieces that have moved from our showroom into private collections." /><div className="mt-12"><CatalogGrid cards={cards} /></div></Container>;
}
