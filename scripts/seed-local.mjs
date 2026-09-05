import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const id = (number) => `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`;
const adminId = "00000000-0000-4000-8000-000000000001";
const now = "2026-01-28T12:00:00.000Z";
const specs = [
  ["pikachu-base-set-psa-10", "Pikachu", 1999, "Base Set", "BS", "58", "102", "English", "PSA", 10, "GEM MT 10", 42500, "AVAILABLE", { grader: "PSA", labelType: "Standard", populationCount: 1245 }],
  ["charizard-base-set-bgs-95", "Charizard", 1999, "Base Set", "BS", "4", "102", "English", "BGS", 9.5, "GEM MINT 9.5", 185000, "AVAILABLE", { grader: "BGS", centering: 9.5, corners: 9.5, edges: 9, surface: 9.5, labelColor: "Gold" }],
  ["blastoise-base-set-cgc-95", "Blastoise", 1999, "Base Set", "BS", "2", "102", "English", "CGC", 9.5, "GEM MINT 9.5", 92000, "AVAILABLE", { grader: "CGC", centering: 9.5, corners: 9.5, edges: 9.5, surface: 9 }],
  ["lugia-neo-genesis-tag-10", "Lugia", 2000, "Neo Genesis", "N1", "9", "111", "English", "TAG", 10, "TAG 10", 76000, "RESERVED", { grader: "TAG", tagGrade: "10", tagScore: 1000 }],
  ["umbreon-skyridge-psa-9", "Umbreon", 2003, "Skyridge", "SK", "H30", "144", "English", "PSA", 9, "MINT 9", 138000, "AVAILABLE", { grader: "PSA", populationCount: 502 }],
  ["gengar-vmax-fusion-strike-bgs-10", "Gengar", 2021, "Fusion Strike", "SWSH08", "271", "264", "English", "BGS", 10, "PRISTINE 10", 245000, "AVAILABLE", { grader: "BGS", centering: 10, corners: 10, edges: 10, surface: 10 }],
  ["giratina-v-lost-origin-cgc-10", "Giratina", 2022, "Lost Origin", "SWSH11", "186", "196", "English", "CGC", 10, "PRISTINE 10", 112000, "AVAILABLE", { grader: "CGC", perfectOrPristine: "Pristine" }],
  ["rayquaza-vmax-evolving-skies-tag-95", "Rayquaza", 2021, "Evolving Skies", "SWSH07", "218", "203", "English", "TAG", 9.5, "TAG 9.5", 98000, "AVAILABLE", { grader: "TAG", tagGrade: "9.5", tagScore: 950 }],
  ["mewtwo-vstar-universe-psa-10-jp", "Mewtwo", 2022, "VSTAR Universe", "S12a", "221", "172", "Japanese", "PSA", 10, "GEM MT 10", 62000, "AVAILABLE", { grader: "PSA", populationCount: 801 }],
  ["umbreon-eevee-heroes-bgs-95-jp", "Umbreon", 2021, "Eevee Heroes", "S6a", "095", "069", "Japanese", "BGS", 9.5, "GEM MINT 9.5", 154000, "AVAILABLE", { grader: "BGS", centering: 9.5, corners: 9.5, edges: 9.5, surface: 9.5 }],
  ["venusaur-base-set-cgc-9-fr", "Venusaur", 1999, "Base Set", "BS-FR", "15", "102", "French", "CGC", 9, "MINT 9", 31000, "AVAILABLE", { grader: "CGC", variantAttribution: "French" }],
  ["tyranitar-neo-destiny-tag-9", "Tyranitar", 2002, "Neo Destiny", "N4", "12", "105", "German", "TAG", 9, "TAG 9", 47500, "SOLD", { grader: "TAG", tagGrade: "9", tagScore: 900 }],
  ["alakazam-base-set-psa-8-archived", "Alakazam", 1999, "Base Set", "BS", "1", "102", "English", "PSA", 8, "NM-MT 8", 22500, "ARCHIVED", { grader: "PSA", populationCount: 1022 }],
];

export const localCards = specs.map((spec, index) => {
  const [slug, pokemonName, year, setName, setCode, cardNumber, setTotal, language, grader, grade, gradeLabel, priceMinor, availabilityStatus, graderMetadata] = spec;
  const certificate = `DEMO-${grader}-${String(100001 + index)}`;
  const listedAt = `2026-01-${String(index + 5).padStart(2, "0")}T12:00:00.000Z`;
  return {
    id: id(100 + index), slug, title: `DEMO Inventory — ${year} ${pokemonName} ${setName} ${grader} ${grade}`, pokemonName,
    description: "Fictional demo inventory for Atelier Graded development.", year, setName, setCode, cardNumber, setTotal,
    rarity: index % 3 ? "Rare Holo" : "Secret Rare", variant: index % 2 ? "Unlimited" : "Alternate Art", edition: "Unlimited", finish: "Holofoil",
    language, category: "Pokemon", grader, grade, gradeLabel, certificationNumber: certificate, verificationUrl: `https://example.com/verify/${certificate}`,
    graderMetadata, priceMinor, currency: "USD", priceNegotiable: index % 3 === 1, availabilityStatus,
    publicationStatus: availabilityStatus === "ARCHIVED" ? "DRAFT" : "PUBLISHED", featured: index < 4 || index === 8,
    populationCount: graderMetadata.populationCount ?? null, provenanceNotes: null, slabNotes: "Demo slab; inspect images before purchase.", shippingRegions: "Worldwide",
    acquiredAt: "2025-12-01T12:00:00.000Z", listedAt, soldAt: availabilityStatus === "SOLD" ? "2026-01-02T12:00:00.000Z" : null,
    createdBy: adminId, createdAt: listedAt, updatedAt: now, archivedAt: availabilityStatus === "ARCHIVED" ? "2026-01-27T12:00:00.000Z" : null,
  };
});

export const localCardImages = localCards.flatMap((card, index) => [
  { id: id(1000 + index * 2), cardId: card.id, imageUrl: "/placeholders/slab-front-1.svg", storagePath: null, imageType: "FRONT", altText: `${card.title} — slab front`, sortOrder: 0, width: 800, height: 1120, createdAt: card.createdAt },
  { id: id(1001 + index * 2), cardId: card.id, imageUrl: "/placeholders/slab-back-1.svg", storagePath: null, imageType: "BACK", altText: `${card.title} — slab back`, sortOrder: 1, width: 800, height: 1120, createdAt: card.createdAt },
]);
export const localInquiries = [
  { id: id(2001), referenceNumber: "AG-2026-0001", cardId: localCards[1].id, userId: null, name: "Morgan Lee", email: "morgan@example.test", phone: "+1-555-0101", offerAmountMinor: 172500, currency: "USD", preferredContactMethod: "EMAIL", country: "United States", postalCode: "10001", message: "I would like to discuss a serious offer and insured shipping.", status: "NEGOTIATING", createdAt: now, updatedAt: now },
  { id: id(2002), referenceNumber: "AG-2026-0002", cardId: localCards[3].id, userId: null, name: "Avery Chen", email: "avery@example.test", phone: null, offerAmountMinor: null, currency: "USD", preferredContactMethod: "EITHER", country: "Canada", postalCode: "M5V 1E3", message: "Please let me know if the reservation expires; I am ready to proceed.", status: "BUYER_CONTACTED", createdAt: now, updatedAt: now },
  { id: id(2003), referenceNumber: "AG-2026-0003", cardId: localCards[8].id, userId: "00000000-0000-4000-8000-000000000002", name: "Jordan Ruiz", email: "jordan@example.test", phone: "+34-555-0103", offerAmountMinor: 59000, currency: "USD", preferredContactMethod: "PHONE", country: "Spain", postalCode: "28001", message: "I am interested in insured international shipping for this card.", status: "NEW", createdAt: now, updatedAt: now },
];

const snake = (value) => Object.fromEntries(Object.entries(value).map(([key, item]) => [key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), item]));
// Retained for scripts/seed.mjs, which targets the SQL schema directly.
export const cards = localCards.map(snake);
export const cardImages = localCardImages.map(snake);
export const inquiries = localInquiries.map(snake);

export function buildLocalStore() {
  return {
    profiles: [
      { id: adminId, email: "admin@ateliergraded.demo", displayName: "Gallery Director", phone: null, role: "ADMIN", avatarUrl: null, createdAt: now, updatedAt: now },
      { id: "00000000-0000-4000-8000-000000000002", email: "collector@ateliergraded.demo", displayName: "Demo Collector", phone: null, role: "USER", avatarUrl: null, createdAt: now, updatedAt: now },
    ],
    cards: localCards, cardImages: localCardImages, favorites: [], inquiries: localInquiries, inquiryNotes: [], orders: [], orderItems: [], paymentEvents: [], auditLogs: [], appSettings: [], sessions: [],
  };
}

export async function seedLocal(outputPath = path.resolve(process.cwd(), ".data/store.json")) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(buildLocalStore(), null, 2)}\n`, "utf8");
  return outputPath;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(`Local fallback seed written to ${await seedLocal()}`);
