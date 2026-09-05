import type { Metadata } from "next";
import { CatalogGrid } from "@/components/cards/catalog-grid";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { getNewArrivals } from "@/lib/data/repository";

export const metadata: Metadata = { title: "New Arrivals", description: "Recently catalogued graded collectibles at Atelier Graded.", openGraph: { title: "New Arrivals | Atelier Graded" } };
export default async function NewArrivalsPage() {
  const cards = await getNewArrivals(24);
  return <Container className="py-16 sm:py-24"><SectionHeading eyebrow="Recently catalogued" title="New arrivals" description="Fresh objects for careful consideration, presented with the details that matter." /><div className="mt-12"><CatalogGrid cards={cards} /></div></Container>;
}
