import type { MetadataRoute } from "next";
import { getCards } from "@/lib/data/repository";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/cards", "/new-arrivals", "/featured", "/sold", "/about", "/faq", "/contact", "/privacy", "/terms"];
  const cards = await getCards({ perPage: 10_000 });
  return [...staticPages.map((path) => ({ url: absoluteUrl(path), lastModified: new Date(), changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : 0.7 })), ...cards.items.filter((card) => card.publicationStatus === "PUBLISHED").map((card) => ({ url: absoluteUrl(`/cards/${card.slug}`), lastModified: new Date(card.updatedAt), changeFrequency: "monthly" as const, priority: 0.8 }))];
}
