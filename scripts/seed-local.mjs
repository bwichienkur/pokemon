import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cardId = (number) => `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`;

export const cards = [
  {
    id: cardId(1), slug: 'demo-pikachu-base-set-psa-10',
    title: 'DEMO Inventory — 1999 Pikachu Base Set PSA 10', pokemon_name: 'Pikachu',
    description: 'Fictional demo listing for interface development.', year: 1999,
    set_name: 'Base Set', set_code: 'BS', card_number: '58', set_total: '102',
    rarity: 'Common', variant: 'Unlimited', edition: 'Unlimited', finish: 'Holofoil',
    language: 'English', category: 'Pokemon', grader: 'PSA', grade: 10.0,
    grade_label: 'GEM MT 10', certification_number: 'DEMO-PSA-100001',
    verification_url: 'https://example.com/verify/DEMO-PSA-100001',
    grader_metadata: { label: 'GEM MT 10', population: 1245, barcode: 'DEMO100001' },
    price_minor: 42500, currency: 'USD', price_negotiable: false, availability_status: 'AVAILABLE',
    publication_status: 'PUBLISHED', featured: true, population_count: 1245,
    provenance_notes: 'Demo collection intake.', slab_notes: 'Clear slab, centered label.',
    shipping_regions: 'US, Canada', listed_at: '2026-01-05T12:00:00Z', sold_at: null,
  },
  {
    id: cardId(2), slug: 'demo-charizard-base-set-bgs-95',
    title: 'DEMO Inventory — 1999 Charizard Base Set BGS 9.5', pokemon_name: 'Charizard',
    description: 'Fictional demo listing; not an offer for an authentic card.', year: 1999,
    set_name: 'Base Set', set_code: 'BS', card_number: '4', set_total: '102',
    rarity: 'Rare Holo', variant: 'Unlimited', edition: 'Unlimited', finish: 'Holofoil',
    language: 'English', category: 'Pokemon', grader: 'BGS', grade: 9.5,
    grade_label: 'GEM MINT 9.5', certification_number: 'DEMO-BGS-200002',
    verification_url: 'https://example.com/verify/DEMO-BGS-200002',
    grader_metadata: { subgrades: { centering: 9.5, corners: 9.5, edges: 9.0, surface: 9.5 }, label: 'Gold' },
    price_minor: 185000, currency: 'USD', price_negotiable: true, availability_status: 'AVAILABLE',
    publication_status: 'PUBLISHED', featured: true, population_count: 476,
    provenance_notes: 'Demo estate-style provenance.', slab_notes: 'BGS gold label.',
    shipping_regions: 'Worldwide', listed_at: '2026-01-07T12:00:00Z', sold_at: null,
  },
  {
    id: cardId(3), slug: 'demo-blastoise-base-set-cgc-95',
    title: 'DEMO Inventory — 1999 Blastoise Base Set CGC 9.5', pokemon_name: 'Blastoise',
    description: 'Fictional demo listing for non-production testing.', year: 1999,
    set_name: 'Base Set', set_code: 'BS', card_number: '2', set_total: '102',
    rarity: 'Rare Holo', variant: 'Unlimited', edition: 'Unlimited', finish: 'Holofoil',
    language: 'English', category: 'Pokemon', grader: 'CGC', grade: 9.5,
    grade_label: 'GEM MINT 9.5', certification_number: 'DEMO-CGC-300003',
    verification_url: 'https://example.com/verify/DEMO-CGC-300003',
    grader_metadata: { label: 'Pristine-style demo', certLookup: 'DEMO-CGC-300003', graderNotes: 'No defects recorded' },
    price_minor: 92000, currency: 'USD', price_negotiable: false, availability_status: 'AVAILABLE',
    publication_status: 'PUBLISHED', featured: true, population_count: 368,
    provenance_notes: null, slab_notes: 'Even frosted inner well.', shipping_regions: 'US, Canada, UK',
    listed_at: '2026-01-10T12:00:00Z', sold_at: null,
  },
  {
    id: cardId(4), slug: 'demo-lugia-neo-genesis-tag-10',
    title: 'DEMO Inventory — 2000 Lugia Neo Genesis TAG 10', pokemon_name: 'Lugia',
    description: 'Fictional demo listing for marketplace previews.', year: 2000,
    set_name: 'Neo Genesis', set_code: 'N1', card_number: '9', set_total: '111',
    rarity: 'Rare Holo', variant: 'Unlimited', edition: 'Unlimited', finish: 'Holofoil',
    language: 'English', category: 'Pokemon', grader: 'TAG', grade: 10.0,
    grade_label: 'TAG 10', certification_number: 'DEMO-TAG-400004',
    verification_url: 'https://example.com/verify/DEMO-TAG-400004',
    grader_metadata: { score: 1000, centeringScore: 99, surfaceScore: 100, digitalReport: 'demo-tag-report-400004' },
    price_minor: 76000, currency: 'USD', price_negotiable: false, availability_status: 'RESERVED',
    publication_status: 'PUBLISHED', featured: false, population_count: 89,
    provenance_notes: 'Demo direct submission.', slab_notes: 'Reservation hold applies.', shipping_regions: 'US',
    listed_at: '2026-01-12T12:00:00Z', sold_at: null,
  },
  {
    id: cardId(5), slug: 'demo-umbreon-skyridge-psa-9',
    title: 'DEMO Inventory — 2003 Umbreon Skyridge PSA 9', pokemon_name: 'Umbreon',
    description: 'Fictional demo listing.', year: 2003, set_name: 'Skyridge', set_code: 'SK',
    card_number: 'H30', set_total: '144', rarity: 'Rare Holo', variant: 'Holo', edition: 'Unlimited',
    finish: 'Holofoil', language: 'English', category: 'Pokemon', grader: 'PSA', grade: 9.0,
    grade_label: 'MINT 9', certification_number: 'DEMO-PSA-100005',
    verification_url: 'https://example.com/verify/DEMO-PSA-100005',
    grader_metadata: { label: 'MINT 9', population: 502, barcode: 'DEMO100005' },
    price_minor: 138000, currency: 'USD', price_negotiable: true, availability_status: 'AVAILABLE',
    publication_status: 'PUBLISHED', featured: true, population_count: 502,
    provenance_notes: null, slab_notes: 'Minor sleeve scuff on outer slab.', shipping_regions: 'Worldwide',
    listed_at: '2026-01-14T12:00:00Z', sold_at: null,
  },
  {
    id: cardId(6), slug: 'demo-gengar-vmax-fusion-strike-bgs-10',
    title: 'DEMO Inventory — 2021 Gengar VMAX Fusion Strike BGS 10', pokemon_name: 'Gengar',
    description: 'Fictional demo listing.', year: 2021, set_name: 'Fusion Strike', set_code: 'SWSH08',
    card_number: '271', set_total: '264', rarity: 'Secret Rare', variant: 'Alternate Art', edition: 'Unlimited',
    finish: 'Holofoil', language: 'English', category: 'Pokemon', grader: 'BGS', grade: 10.0,
    grade_label: 'PRISTINE 10', certification_number: 'DEMO-BGS-200006',
    verification_url: 'https://example.com/verify/DEMO-BGS-200006',
    grader_metadata: { subgrades: { centering: 10, corners: 10, edges: 10, surface: 10 }, label: 'Black' },
    price_minor: 245000, currency: 'USD', price_negotiable: false, availability_status: 'AVAILABLE',
    publication_status: 'PUBLISHED', featured: true, population_count: 74,
    provenance_notes: 'Demo modern submission.', slab_notes: 'Black-label style demo.', shipping_regions: 'US, Japan',
    listed_at: '2026-01-16T12:00:00Z', sold_at: null,
  },
  {
    id: cardId(7), slug: 'demo-giratina-v-lost-origin-cgc-10',
    title: 'DEMO Inventory — 2022 Giratina V Lost Origin CGC 10', pokemon_name: 'Giratina',
    description: 'Fictional demo listing.', year: 2022, set_name: 'Lost Origin', set_code: 'SWSH11',
    card_number: '186', set_total: '196', rarity: 'Ultra Rare', variant: 'Alternate Art', edition: 'Unlimited',
    finish: 'Holofoil', language: 'English', category: 'Pokemon', grader: 'CGC', grade: 10.0,
    grade_label: 'PRISTINE 10', certification_number: 'DEMO-CGC-300007',
    verification_url: 'https://example.com/verify/DEMO-CGC-300007',
    grader_metadata: { label: 'Pristine 10', certLookup: 'DEMO-CGC-300007', graderNotes: 'Demo pristine record' },
    price_minor: 112000, currency: 'USD', price_negotiable: false, availability_status: 'AVAILABLE',
    publication_status: 'PUBLISHED', featured: false, population_count: 162,
    provenance_notes: null, slab_notes: 'Fresh demo slab.', shipping_regions: 'US, Canada',
    listed_at: '2026-01-18T12:00:00Z', sold_at: null,
  },
  {
    id: cardId(8), slug: 'demo-rayquaza-vmax-evolving-skies-tag-95',
    title: 'DEMO Inventory — 2021 Rayquaza VMAX Evolving Skies TAG 9.5', pokemon_name: 'Rayquaza',
    description: 'Fictional demo listing.', year: 2021, set_name: 'Evolving Skies', set_code: 'SWSH07',
    card_number: '218', set_total: '203', rarity: 'Secret Rare', variant: 'Alternate Art', edition: 'Unlimited',
    finish: 'Holofoil', language: 'English', category: 'Pokemon', grader: 'TAG', grade: 9.5,
    grade_label: 'TAG 9.5', certification_number: 'DEMO-TAG-400008',
    verification_url: 'https://example.com/verify/DEMO-TAG-400008',
    grader_metadata: { score: 950, centeringScore: 96, surfaceScore: 95, digitalReport: 'demo-tag-report-400008' },
    price_minor: 98000, currency: 'USD', price_negotiable: true, availability_status: 'AVAILABLE',
    publication_status: 'PUBLISHED', featured: false, population_count: 209,
    provenance_notes: null, slab_notes: 'Light cosmetic scuff on case corner.', shipping_regions: 'Worldwide',
    listed_at: '2026-01-20T12:00:00Z', sold_at: null,
  },
  {
    id: cardId(9), slug: 'demo-mewtwo-vstar-universe-psa-10-jp',
    title: 'DEMO Inventory — 2022 Mewtwo VSTAR Universe PSA 10 (Japanese)', pokemon_name: 'Mewtwo',
    description: 'Fictional Japanese-language demo listing.', year: 2022, set_name: 'VSTAR Universe', set_code: 'S12a',
    card_number: '221', set_total: '172', rarity: 'Art Rare', variant: 'SAR', edition: 'Unlimited',
    finish: 'Holofoil', language: 'Japanese', category: 'Pokemon', grader: 'PSA', grade: 10.0,
    grade_label: 'GEM MT 10', certification_number: 'DEMO-PSA-100009',
    verification_url: 'https://example.com/verify/DEMO-PSA-100009',
    grader_metadata: { label: 'GEM MT 10', population: 801, barcode: 'DEMO100009' },
    price_minor: 62000, currency: 'USD', price_negotiable: false, availability_status: 'AVAILABLE',
    publication_status: 'PUBLISHED', featured: true, population_count: 801,
    provenance_notes: 'Demo import intake.', slab_notes: 'Japanese label notation.', shipping_regions: 'US, Japan',
    listed_at: '2026-01-22T12:00:00Z', sold_at: null,
  },
  {
    id: cardId(10), slug: 'demo-eevee-heroes-umbreon-bgs-95-jp',
    title: 'DEMO Inventory — 2021 Umbreon Eevee Heroes BGS 9.5 (Japanese)', pokemon_name: 'Umbreon',
    description: 'Fictional Japanese-language demo listing.', year: 2021, set_name: 'Eevee Heroes', set_code: 'S6a',
    card_number: '095', set_total: '069', rarity: 'Secret Rare', variant: 'Alternate Art', edition: 'Unlimited',
    finish: 'Holofoil', language: 'Japanese', category: 'Pokemon', grader: 'BGS', grade: 9.5,
    grade_label: 'GEM MINT 9.5', certification_number: 'DEMO-BGS-200010',
    verification_url: 'https://example.com/verify/DEMO-BGS-200010',
    grader_metadata: { subgrades: { centering: 9.5, corners: 9.5, edges: 9.5, surface: 9.5 }, label: 'Gold' },
    price_minor: 154000, currency: 'USD', price_negotiable: false, availability_status: 'AVAILABLE',
    publication_status: 'PUBLISHED', featured: false, population_count: 218,
    provenance_notes: null, slab_notes: 'Centered label and clean case.', shipping_regions: 'Japan, US',
    listed_at: '2026-01-24T12:00:00Z', sold_at: null,
  },
  {
    id: cardId(11), slug: 'demo-venusaur-base-set-cgc-9-french',
    title: 'DEMO Inventory — 1999 Venusaur Base Set CGC 9 (French)', pokemon_name: 'Venusaur',
    description: 'Fictional French-language demo listing.', year: 1999, set_name: 'Base Set', set_code: 'BS-FR',
    card_number: '15', set_total: '102', rarity: 'Rare Holo', variant: 'Unlimited', edition: 'Unlimited',
    finish: 'Holofoil', language: 'French', category: 'Pokemon', grader: 'CGC', grade: 9.0,
    grade_label: 'MINT 9', certification_number: 'DEMO-CGC-300011',
    verification_url: 'https://example.com/verify/DEMO-CGC-300011',
    grader_metadata: { label: 'MINT 9', certLookup: 'DEMO-CGC-300011', graderNotes: 'French demo inventory' },
    price_minor: 31000, currency: 'USD', price_negotiable: false, availability_status: 'AVAILABLE',
    publication_status: 'PUBLISHED', featured: false, population_count: 47,
    provenance_notes: null, slab_notes: 'French language demo slab.', shipping_regions: 'EU, US',
    listed_at: '2026-01-26T12:00:00Z', sold_at: null,
  },
  {
    id: cardId(12), slug: 'demo-tyranitar-neo-destiny-tag-9-sold',
    title: 'DEMO Inventory — 2002 Tyranitar Neo Destiny TAG 9 (Sold)', pokemon_name: 'Tyranitar',
    description: 'Fictional sold demo listing retained to test sold inventory views.', year: 2002,
    set_name: 'Neo Destiny', set_code: 'N4', card_number: '12', set_total: '105',
    rarity: 'Rare Holo', variant: 'Unlimited', edition: 'Unlimited', finish: 'Holofoil',
    language: 'German', category: 'Pokemon', grader: 'TAG', grade: 9.0,
    grade_label: 'TAG 9', certification_number: 'DEMO-TAG-400012',
    verification_url: 'https://example.com/verify/DEMO-TAG-400012',
    grader_metadata: { score: 900, centeringScore: 91, surfaceScore: 90, digitalReport: 'demo-tag-report-400012' },
    price_minor: 47500, currency: 'USD', price_negotiable: false, availability_status: 'SOLD',
    publication_status: 'PUBLISHED', featured: false, population_count: 33,
    provenance_notes: 'Demo closed sale.', slab_notes: 'Historical listing retained.', shipping_regions: 'US',
    listed_at: '2025-12-20T12:00:00Z', sold_at: '2026-01-02T12:00:00Z',
  },
];

const frontImage = (card, id) => ({
  id: cardId(id),
  card_id: card.id,
  image_url: '/placeholders/slab-front-1.svg',
  storage_path: null,
  image_type: 'FRONT',
  alt_text: `${card.title} — slab front`,
  sort_order: 0,
  width: 800,
  height: 1120,
});

export const cardImages = [
  frontImage(cards[0], 1001),
  {
    id: cardId(1002),
    card_id: cards[0].id,
    image_url: '/placeholders/slab-back-1.svg',
    storage_path: null,
    image_type: 'BACK',
    alt_text: `${cards[0].title} — slab back`,
    sort_order: 1,
    width: 800,
    height: 1120,
  },
  ...cards.slice(1).map((card, index) => frontImage(card, 1003 + index)),
];

export const inquiries = [
  {
    id: cardId(2001), reference_number: 'DEMO-INQ-1001', card_id: cardId(2), user_id: null,
    name: 'Morgan Lee', email: 'morgan@example.test', phone: '+1-555-0101', offer_amount_minor: 172500,
    currency: 'USD', preferred_contact_method: 'EMAIL', country: 'United States', postal_code: '10001',
    message: 'Demo inquiry: would consider a negotiated offer.', status: 'NEGOTIATING',
  },
  {
    id: cardId(2002), reference_number: 'DEMO-INQ-1002', card_id: cardId(4), user_id: null,
    name: 'Avery Chen', email: 'avery@example.test', phone: null, offer_amount_minor: null,
    currency: 'USD', preferred_contact_method: 'EITHER', country: 'Canada', postal_code: 'M5V 1E3',
    message: 'Demo inquiry: please notify me if the reservation expires.', status: 'BUYER_CONTACTED',
  },
  {
    id: cardId(2003), reference_number: 'DEMO-INQ-1003', card_id: cardId(9), user_id: null,
    name: 'Jordan Ruiz', email: 'jordan@example.test', phone: '+34-555-0103', offer_amount_minor: 59000,
    currency: 'USD', preferred_contact_method: 'PHONE', country: 'Spain', postal_code: '28001',
    message: 'Demo inquiry: interested in insured international shipping.', status: 'NEW',
  },
];

export const localProfiles = [
  {
    id: '00000000-0000-4000-8000-000000009001', display_name: 'Demo Administrator',
    email: 'admin@atelier-graded.test', phone: null, role: 'ADMIN', avatar_url: null,
  },
  {
    id: '00000000-0000-4000-8000-000000009002', display_name: 'Demo Collector',
    email: 'collector@atelier-graded.test', phone: null, role: 'USER', avatar_url: null,
  },
];

export function buildLocalStore() {
  return {
    generated_at: new Date().toISOString(),
    mode: 'local-fallback',
    profiles: localProfiles,
    cards,
    card_images: cardImages,
    favorites: [],
    inquiries,
    inquiry_notes: [],
    orders: [],
    order_items: [],
    payment_events: [],
    audit_logs: [],
    app_settings: {},
  };
}

export async function seedLocal(outputPath = path.resolve(process.cwd(), '.data/store.json')) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(buildLocalStore(), null, 2)}\n`, 'utf8');
  return outputPath;
}

const invokedDirectly = process.argv[1] === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const outputPath = await seedLocal();
  console.log(`Local fallback seed written to ${outputPath}`);
}
