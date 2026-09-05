import type {
  Card,
  CardImage,
  Inquiry,
  LocalStore,
  Profile,
} from "@/types/database";

export const DEMO_PASSWORDS = {
  "admin@ateliergraded.demo": "ChangeMeAdmin!23",
  "collector@ateliergraded.demo": "ChangeMeUser!23",
} as const;

const ADMIN_ID = "00000000-0000-4000-8000-000000000001";
const USER_ID = "00000000-0000-4000-8000-000000000002";
const now = "2026-01-28T12:00:00.000Z";
const id = (number: number) => `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`;

const cardSpecs = [
  ["pikachu-base-set-psa-10", "1999 Pikachu Base Set", "Pikachu", 1999, "Base Set", "BS", "58", "102", "Common", "Unlimited", "English", "PSA", 10, "GEM MT 10", "DEMO-PSA-100001", 42500, true, "AVAILABLE", { grader: "PSA", labelType: "Standard", populationCount: 1245, psaEstimateMinor: 42500, dateGraded: "2025-12-18" }],
  ["charizard-base-set-bgs-95", "1999 Charizard Base Set", "Charizard", 1999, "Base Set", "BS", "4", "102", "Rare Holo", "Unlimited", "English", "BGS", 9.5, "GEM MINT 9.5", "DEMO-BGS-200002", 185000, true, "AVAILABLE", { grader: "BGS", centering: 9.5, corners: 9.5, edges: 9, surface: 9.5, labelColor: "Gold", labelType: "With subgrades" }],
  ["blastoise-base-set-cgc-95", "1999 Blastoise Base Set", "Blastoise", 1999, "Base Set", "BS", "2", "102", "Rare Holo", "Unlimited", "English", "CGC", 9.5, "GEM MINT 9.5", "DEMO-CGC-300003", 92000, true, "AVAILABLE", { grader: "CGC", centering: 9.5, corners: 9.5, edges: 9.5, surface: 9, perfectOrPristine: "Gem Mint" }],
  ["lugia-neo-genesis-tag-10", "2000 Lugia Neo Genesis", "Lugia", 2000, "Neo Genesis", "N1", "9", "111", "Rare Holo", "Unlimited", "English", "TAG", 10, "TAG 10", "DEMO-TAG-400004", 76000, false, "RESERVED", { grader: "TAG", tagGrade: "10", tagScore: 1000, ranking: "Top 5%", populationInfo: "89 graded", digitalReportDetails: "Demo digital report" }],
  ["umbreon-skyridge-psa-9", "2003 Umbreon Skyridge", "Umbreon", 2003, "Skyridge", "SK", "H30", "144", "Rare Holo", "Holo", "English", "PSA", 9, "MINT 9", "DEMO-PSA-100005", 138000, true, "AVAILABLE", { grader: "PSA", labelType: "Standard", populationCount: 502, qualifier: null }],
  ["gengar-vmax-fusion-strike-bgs-10", "2021 Gengar VMAX Fusion Strike", "Gengar", 2021, "Fusion Strike", "SWSH08", "271", "264", "Secret Rare", "Alternate Art", "English", "BGS", 10, "PRISTINE 10", "DEMO-BGS-200006", 245000, true, "AVAILABLE", { grader: "BGS", centering: 10, corners: 10, edges: 10, surface: 10, labelColor: "Black" }],
  ["giratina-v-lost-origin-cgc-10", "2022 Giratina V Lost Origin", "Giratina", 2022, "Lost Origin", "SWSH11", "186", "196", "Ultra Rare", "Alternate Art", "English", "CGC", 10, "PRISTINE 10", "DEMO-CGC-300007", 112000, false, "AVAILABLE", { grader: "CGC", centering: 10, corners: 10, edges: 10, surface: 10, perfectOrPristine: "Pristine" }],
  ["rayquaza-vmax-evolving-skies-tag-95", "2021 Rayquaza VMAX Evolving Skies", "Rayquaza", 2021, "Evolving Skies", "SWSH07", "218", "203", "Secret Rare", "Alternate Art", "English", "TAG", 9.5, "TAG 9.5", "DEMO-TAG-400008", 98000, false, "AVAILABLE", { grader: "TAG", tagGrade: "9.5", tagScore: 950, ranking: "Top 10%", populationInfo: "209 graded" }],
  ["mewtwo-vstar-universe-psa-10-jp", "2022 Mewtwo VSTAR Universe", "Mewtwo", 2022, "VSTAR Universe", "S12a", "221", "172", "Art Rare", "SAR", "Japanese", "PSA", 10, "GEM MT 10", "DEMO-PSA-100009", 62000, true, "AVAILABLE", { grader: "PSA", labelType: "Standard", populationCount: 801, psaEstimateNote: "Demo estimate" }],
  ["umbreon-eevee-heroes-bgs-95-jp", "2021 Umbreon Eevee Heroes", "Umbreon", 2021, "Eevee Heroes", "S6a", "095", "069", "Secret Rare", "Alternate Art", "Japanese", "BGS", 9.5, "GEM MINT 9.5", "DEMO-BGS-200010", 154000, false, "AVAILABLE", { grader: "BGS", centering: 9.5, corners: 9.5, edges: 9.5, surface: 9.5, labelColor: "Gold" }],
  ["venusaur-base-set-cgc-9-fr", "1999 Venusaur Base Set", "Venusaur", 1999, "Base Set", "BS-FR", "15", "102", "Rare Holo", "Unlimited", "French", "CGC", 9, "MINT 9", "DEMO-CGC-300011", 31000, false, "AVAILABLE", { grader: "CGC", centering: 9, corners: 9, edges: 9.5, surface: 9, variantAttribution: "French" }],
  ["tyranitar-neo-destiny-tag-9", "2002 Tyranitar Neo Destiny", "Tyranitar", 2002, "Neo Destiny", "N4", "12", "105", "Rare Holo", "Unlimited", "German", "TAG", 9, "TAG 9", "DEMO-TAG-400012", 47500, false, "SOLD", { grader: "TAG", tagGrade: "9", tagScore: 900, populationInfo: "33 graded" }],
  ["alakazam-base-set-psa-8-archived", "1999 Alakazam Base Set", "Alakazam", 1999, "Base Set", "BS", "1", "102", "Rare Holo", "Unlimited", "English", "PSA", 8, "NM-MT 8", "DEMO-PSA-100013", 22500, false, "ARCHIVED", { grader: "PSA", labelType: "Standard", populationCount: 1022, graderNotes: "Archived demonstration inventory." }],
] as const;

function makeCard(spec: (typeof cardSpecs)[number], index: number): Card {
  const [slug, title, pokemonName, year, setName, setCode, cardNumber, setTotal, rarity, variant, language, grader, grade, gradeLabel, certificationNumber, priceMinor, featured, availabilityStatus, graderMetadata] = spec;
  const listedAt = `2026-01-${String(5 + index).padStart(2, "0")}T12:00:00.000Z`;
  return {
    id: id(100 + index), slug, title: `DEMO Inventory — ${title} ${grader} ${grade}`,
    pokemonName, description: "Fictional demo inventory for Atelier Graded development. Not an offer for an authentic card.",
    year, setName, setCode, cardNumber, setTotal, rarity, variant, edition: "Unlimited", finish: "Holofoil",
    language, category: "Pokemon", grader, grade, gradeLabel, certificationNumber,
    verificationUrl: `https://example.com/verify/${certificationNumber}`, graderMetadata,
    priceMinor, currency: "USD", priceNegotiable: index % 3 === 1, availabilityStatus,
    publicationStatus: availabilityStatus === "ARCHIVED" ? "DRAFT" : "PUBLISHED", featured,
    populationCount: ("populationCount" in graderMetadata ? graderMetadata.populationCount : null) ?? null,
    provenanceNotes: index % 2 ? null : "Demo collection intake with documented chain of custody.",
    slabNotes: "Demo slab; inspect images before purchase.", shippingRegions: index % 3 ? "US, Canada, UK" : "Worldwide",
    acquiredAt: "2025-12-01T12:00:00.000Z", listedAt,
    soldAt: availabilityStatus === "SOLD" ? "2026-01-02T12:00:00.000Z" : null,
    createdBy: ADMIN_ID, createdAt: listedAt, updatedAt: now,
    archivedAt: availabilityStatus === "ARCHIVED" ? "2026-01-27T12:00:00.000Z" : null,
  };
}

export function createInitialStore(): LocalStore {
  const cards = cardSpecs.map(makeCard);
  const cardImages: CardImage[] = cards.flatMap((card, index) => [
    { id: id(1_000 + index * 2), cardId: card.id, imageUrl: "/placeholders/slab-front-1.svg", storagePath: null, imageType: "FRONT", altText: `${card.title} — slab front`, sortOrder: 0, width: 800, height: 1120, createdAt: card.createdAt },
    { id: id(1_001 + index * 2), cardId: card.id, imageUrl: "/placeholders/slab-back-1.svg", storagePath: null, imageType: "BACK", altText: `${card.title} — slab back`, sortOrder: 1, width: 800, height: 1120, createdAt: card.createdAt },
  ]);
  const profiles: Profile[] = [
    { id: ADMIN_ID, email: "admin@ateliergraded.demo", displayName: "Gallery Director", phone: null, role: "ADMIN", avatarUrl: null, createdAt: now, updatedAt: now },
    { id: USER_ID, email: "collector@ateliergraded.demo", displayName: "Demo Collector", phone: null, role: "USER", avatarUrl: null, createdAt: now, updatedAt: now },
  ];
  const inquiries: Inquiry[] = [
    { id: id(2_001), referenceNumber: "AG-2026-0001", cardId: cards[1].id, userId: null, name: "Morgan Lee", email: "morgan@example.test", phone: "+1-555-0101", offerAmountMinor: 172500, currency: "USD", preferredContactMethod: "EMAIL", country: "United States", postalCode: "10001", message: "I would like to discuss a serious offer and insured shipping.", status: "NEGOTIATING", createdAt: now, updatedAt: now },
    { id: id(2_002), referenceNumber: "AG-2026-0002", cardId: cards[3].id, userId: null, name: "Avery Chen", email: "avery@example.test", phone: null, offerAmountMinor: null, currency: "USD", preferredContactMethod: "EITHER", country: "Canada", postalCode: "M5V 1E3", message: "Please let me know if the reservation expires; I am ready to proceed.", status: "BUYER_CONTACTED", createdAt: now, updatedAt: now },
    { id: id(2_003), referenceNumber: "AG-2026-0003", cardId: cards[8].id, userId: USER_ID, name: "Jordan Ruiz", email: "jordan@example.test", phone: "+34-555-0103", offerAmountMinor: 59000, currency: "USD", preferredContactMethod: "PHONE", country: "Spain", postalCode: "28001", message: "I am interested in insured international shipping for this card.", status: "NEW", createdAt: now, updatedAt: now },
  ];
  return { profiles, cards, cardImages, favorites: [], inquiries, inquiryNotes: [], orders: [], orderItems: [], paymentEvents: [], auditLogs: [], appSettings: [], sessions: [] };
}
