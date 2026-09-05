-- Fictional, unaffiliated demo inventory for development only. No auth.users
-- rows are inserted: cards intentionally have created_by = NULL.

insert into public.cards (
  id, slug, title, pokemon_name, description, year, set_name, set_code,
  card_number, set_total, rarity, variant, edition, finish, language, category,
  grader, grade, grade_label, certification_number, verification_url,
  grader_metadata, price_minor, currency, price_negotiable, availability_status,
  publication_status, featured, population_count, provenance_notes, slab_notes,
  shipping_regions, listed_at, sold_at
) values
(
  '00000000-0000-4000-8000-000000000001', 'demo-pikachu-base-set-psa-10',
  'DEMO Inventory — 1999 Pikachu Base Set PSA 10', 'Pikachu',
  'Fictional demo listing for interface development.', 1999, 'Base Set', 'BS',
  '58', '102', 'Common', 'Unlimited', 'Unlimited', 'Holofoil', 'English', 'Pokemon',
  'PSA', 10.0, 'GEM MT 10', 'DEMO-PSA-100001', 'https://example.com/verify/DEMO-PSA-100001',
  '{"label":"GEM MT 10","population":1245,"barcode":"DEMO100001"}', 42500, 'USD', false,
  'AVAILABLE', 'PUBLISHED', true, 1245, 'Demo collection intake.', 'Clear slab, centered label.',
  'US, Canada', '2026-01-05T12:00:00Z', null
),
(
  '00000000-0000-4000-8000-000000000002', 'demo-charizard-base-set-bgs-95',
  'DEMO Inventory — 1999 Charizard Base Set BGS 9.5', 'Charizard',
  'Fictional demo listing; not an offer for an authentic card.', 1999, 'Base Set', 'BS',
  '4', '102', 'Rare Holo', 'Unlimited', 'Unlimited', 'Holofoil', 'English', 'Pokemon',
  'BGS', 9.5, 'GEM MINT 9.5', 'DEMO-BGS-200002', 'https://example.com/verify/DEMO-BGS-200002',
  '{"subgrades":{"centering":9.5,"corners":9.5,"edges":9.0,"surface":9.5},"label":"Gold"}', 185000, 'USD', true,
  'AVAILABLE', 'PUBLISHED', true, 476, 'Demo estate-style provenance.', 'BGS gold label.', 'Worldwide',
  '2026-01-07T12:00:00Z', null
),
(
  '00000000-0000-4000-8000-000000000003', 'demo-blastoise-base-set-cgc-95',
  'DEMO Inventory — 1999 Blastoise Base Set CGC 9.5', 'Blastoise',
  'Fictional demo listing for non-production testing.', 1999, 'Base Set', 'BS',
  '2', '102', 'Rare Holo', 'Unlimited', 'Unlimited', 'Holofoil', 'English', 'Pokemon',
  'CGC', 9.5, 'GEM MINT 9.5', 'DEMO-CGC-300003', 'https://example.com/verify/DEMO-CGC-300003',
  '{"label":"Pristine-style demo","certLookup":"DEMO-CGC-300003","graderNotes":"No defects recorded"}', 92000, 'USD', false,
  'AVAILABLE', 'PUBLISHED', true, 368, null, 'Even frosted inner well.', 'US, Canada, UK',
  '2026-01-10T12:00:00Z', null
),
(
  '00000000-0000-4000-8000-000000000004', 'demo-lugia-neo-genesis-tag-10',
  'DEMO Inventory — 2000 Lugia Neo Genesis TAG 10', 'Lugia',
  'Fictional demo listing for marketplace previews.', 2000, 'Neo Genesis', 'N1',
  '9', '111', 'Rare Holo', 'Unlimited', 'Unlimited', 'Holofoil', 'English', 'Pokemon',
  'TAG', 10.0, 'TAG 10', 'DEMO-TAG-400004', 'https://example.com/verify/DEMO-TAG-400004',
  '{"score":1000,"centeringScore":99,"surfaceScore":100,"digitalReport":"demo-tag-report-400004"}', 76000, 'USD', false,
  'RESERVED', 'PUBLISHED', false, 89, 'Demo direct submission.', 'Reservation hold applies.', 'US',
  '2026-01-12T12:00:00Z', null
),
(
  '00000000-0000-4000-8000-000000000005', 'demo-umbreon-skyridge-psa-9',
  'DEMO Inventory — 2003 Umbreon Skyridge PSA 9', 'Umbreon',
  'Fictional demo listing.', 2003, 'Skyridge', 'SK',
  'H30', '144', 'Rare Holo', 'Holo', 'Unlimited', 'Holofoil', 'English', 'Pokemon',
  'PSA', 9.0, 'MINT 9', 'DEMO-PSA-100005', 'https://example.com/verify/DEMO-PSA-100005',
  '{"label":"MINT 9","population":502,"barcode":"DEMO100005"}', 138000, 'USD', true,
  'AVAILABLE', 'PUBLISHED', true, 502, null, 'Minor sleeve scuff on outer slab.', 'Worldwide',
  '2026-01-14T12:00:00Z', null
),
(
  '00000000-0000-4000-8000-000000000006', 'demo-gengar-vmax-fusion-strike-bgs-10',
  'DEMO Inventory — 2021 Gengar VMAX Fusion Strike BGS 10', 'Gengar',
  'Fictional demo listing.', 2021, 'Fusion Strike', 'SWSH08',
  '271', '264', 'Secret Rare', 'Alternate Art', 'Unlimited', 'Holofoil', 'English', 'Pokemon',
  'BGS', 10.0, 'PRISTINE 10', 'DEMO-BGS-200006', 'https://example.com/verify/DEMO-BGS-200006',
  '{"subgrades":{"centering":10,"corners":10,"edges":10,"surface":10},"label":"Black"}', 245000, 'USD', false,
  'AVAILABLE', 'PUBLISHED', true, 74, 'Demo modern submission.', 'Black-label style demo.', 'US, Japan',
  '2026-01-16T12:00:00Z', null
),
(
  '00000000-0000-4000-8000-000000000007', 'demo-giratina-v-lost-origin-cgc-10',
  'DEMO Inventory — 2022 Giratina V Lost Origin CGC 10', 'Giratina',
  'Fictional demo listing.', 2022, 'Lost Origin', 'SWSH11',
  '186', '196', 'Ultra Rare', 'Alternate Art', 'Unlimited', 'Holofoil', 'English', 'Pokemon',
  'CGC', 10.0, 'PRISTINE 10', 'DEMO-CGC-300007', 'https://example.com/verify/DEMO-CGC-300007',
  '{"label":"Pristine 10","certLookup":"DEMO-CGC-300007","graderNotes":"Demo pristine record"}', 112000, 'USD', false,
  'AVAILABLE', 'PUBLISHED', false, 162, null, 'Fresh demo slab.', 'US, Canada',
  '2026-01-18T12:00:00Z', null
),
(
  '00000000-0000-4000-8000-000000000008', 'demo-rayquaza-vmax-evolving-skies-tag-95',
  'DEMO Inventory — 2021 Rayquaza VMAX Evolving Skies TAG 9.5', 'Rayquaza',
  'Fictional demo listing.', 2021, 'Evolving Skies', 'SWSH07',
  '218', '203', 'Secret Rare', 'Alternate Art', 'Unlimited', 'Holofoil', 'English', 'Pokemon',
  'TAG', 9.5, 'TAG 9.5', 'DEMO-TAG-400008', 'https://example.com/verify/DEMO-TAG-400008',
  '{"score":950,"centeringScore":96,"surfaceScore":95,"digitalReport":"demo-tag-report-400008"}', 98000, 'USD', true,
  'AVAILABLE', 'PUBLISHED', false, 209, null, 'Light cosmetic scuff on case corner.', 'Worldwide',
  '2026-01-20T12:00:00Z', null
),
(
  '00000000-0000-4000-8000-000000000009', 'demo-mewtwo-vstar-universe-psa-10-jp',
  'DEMO Inventory — 2022 Mewtwo VSTAR Universe PSA 10 (Japanese)', 'Mewtwo',
  'Fictional Japanese-language demo listing.', 2022, 'VSTAR Universe', 'S12a',
  '221', '172', 'Art Rare', 'SAR', 'Unlimited', 'Holofoil', 'Japanese', 'Pokemon',
  'PSA', 10.0, 'GEM MT 10', 'DEMO-PSA-100009', 'https://example.com/verify/DEMO-PSA-100009',
  '{"label":"GEM MT 10","population":801,"barcode":"DEMO100009"}', 62000, 'USD', false,
  'AVAILABLE', 'PUBLISHED', true, 801, 'Demo import intake.', 'Japanese label notation.', 'US, Japan',
  '2026-01-22T12:00:00Z', null
),
(
  '00000000-0000-4000-8000-000000000010', 'demo-eevee-heroes-umbreon-bgs-95-jp',
  'DEMO Inventory — 2021 Umbreon Eevee Heroes BGS 9.5 (Japanese)', 'Umbreon',
  'Fictional Japanese-language demo listing.', 2021, 'Eevee Heroes', 'S6a',
  '095', '069', 'Secret Rare', 'Alternate Art', 'Unlimited', 'Holofoil', 'Japanese', 'Pokemon',
  'BGS', 9.5, 'GEM MINT 9.5', 'DEMO-BGS-200010', 'https://example.com/verify/DEMO-BGS-200010',
  '{"subgrades":{"centering":9.5,"corners":9.5,"edges":9.5,"surface":9.5},"label":"Gold"}', 154000, 'USD', false,
  'AVAILABLE', 'PUBLISHED', false, 218, null, 'Centered label and clean case.', 'Japan, US',
  '2026-01-24T12:00:00Z', null
),
(
  '00000000-0000-4000-8000-000000000011', 'demo-venusaur-base-set-cgc-9-french',
  'DEMO Inventory — 1999 Venusaur Base Set CGC 9 (French)', 'Venusaur',
  'Fictional French-language demo listing.', 1999, 'Base Set', 'BS-FR',
  '15', '102', 'Rare Holo', 'Unlimited', 'Unlimited', 'Holofoil', 'French', 'Pokemon',
  'CGC', 9.0, 'MINT 9', 'DEMO-CGC-300011', 'https://example.com/verify/DEMO-CGC-300011',
  '{"label":"MINT 9","certLookup":"DEMO-CGC-300011","graderNotes":"French demo inventory"}', 31000, 'USD', false,
  'AVAILABLE', 'PUBLISHED', false, 47, null, 'French language demo slab.', 'EU, US',
  '2026-01-26T12:00:00Z', null
),
(
  '00000000-0000-4000-8000-000000000012', 'demo-tyranitar-neo-destiny-tag-9-sold',
  'DEMO Inventory — 2002 Tyranitar Neo Destiny TAG 9 (Sold)', 'Tyranitar',
  'Fictional sold demo listing retained to test sold inventory views.', 2002, 'Neo Destiny', 'N4',
  '12', '105', 'Rare Holo', 'Unlimited', 'Unlimited', 'Holofoil', 'German', 'Pokemon',
  'TAG', 9.0, 'TAG 9', 'DEMO-TAG-400012', 'https://example.com/verify/DEMO-TAG-400012',
  '{"score":900,"centeringScore":91,"surfaceScore":90,"digitalReport":"demo-tag-report-400012"}', 47500, 'USD', false,
  'SOLD', 'PUBLISHED', false, 33, 'Demo closed sale.', 'Historical listing retained.', 'US',
  '2025-12-20T12:00:00Z', '2026-01-02T12:00:00Z'
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  price_minor = excluded.price_minor,
  availability_status = excluded.availability_status,
  publication_status = excluded.publication_status,
  featured = excluded.featured,
  sold_at = excluded.sold_at,
  updated_at = now();

insert into public.card_images (
  id, card_id, image_url, storage_path, image_type, alt_text, sort_order, width, height
) values
  ('00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000001', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Pikachu slab front', 0, 800, 1120),
  ('00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000001', '/placeholders/slab-back-1.svg', null, 'BACK', 'DEMO Pikachu slab back', 1, 800, 1120),
  ('00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000002', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Charizard slab front', 0, 800, 1120),
  ('00000000-0000-4000-8000-000000001004', '00000000-0000-4000-8000-000000000003', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Blastoise slab front', 0, 800, 1120),
  ('00000000-0000-4000-8000-000000001005', '00000000-0000-4000-8000-000000000004', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Lugia slab front', 0, 800, 1120),
  ('00000000-0000-4000-8000-000000001006', '00000000-0000-4000-8000-000000000005', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Umbreon slab front', 0, 800, 1120),
  ('00000000-0000-4000-8000-000000001007', '00000000-0000-4000-8000-000000000006', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Gengar slab front', 0, 800, 1120),
  ('00000000-0000-4000-8000-000000001008', '00000000-0000-4000-8000-000000000007', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Giratina slab front', 0, 800, 1120),
  ('00000000-0000-4000-8000-000000001009', '00000000-0000-4000-8000-000000000008', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Rayquaza slab front', 0, 800, 1120),
  ('00000000-0000-4000-8000-000000001010', '00000000-0000-4000-8000-000000000009', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Mewtwo slab front', 0, 800, 1120),
  ('00000000-0000-4000-8000-000000001011', '00000000-0000-4000-8000-000000000010', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Japanese Umbreon slab front', 0, 800, 1120),
  ('00000000-0000-4000-8000-000000001012', '00000000-0000-4000-8000-000000000011', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Venusaur slab front', 0, 800, 1120),
  ('00000000-0000-4000-8000-000000001013', '00000000-0000-4000-8000-000000000012', '/placeholders/slab-front-1.svg', null, 'FRONT', 'DEMO Tyranitar slab front', 0, 800, 1120)
on conflict (id) do update set
  image_url = excluded.image_url,
  alt_text = excluded.alt_text,
  sort_order = excluded.sort_order;

insert into public.inquiries (
  id, reference_number, card_id, user_id, name, email, phone, offer_amount_minor,
  currency, preferred_contact_method, country, postal_code, message, status
) values
  ('00000000-0000-4000-8000-000000002001', 'DEMO-INQ-1001', '00000000-0000-4000-8000-000000000002', null, 'Morgan Lee', 'morgan@example.test', '+1-555-0101', 172500, 'USD', 'EMAIL', 'United States', '10001', 'Demo inquiry: would consider a negotiated offer.', 'NEGOTIATING'),
  ('00000000-0000-4000-8000-000000002002', 'DEMO-INQ-1002', '00000000-0000-4000-8000-000000000004', null, 'Avery Chen', 'avery@example.test', null, null, 'USD', 'EITHER', 'Canada', 'M5V 1E3', 'Demo inquiry: please notify me if the reservation expires.', 'BUYER_CONTACTED'),
  ('00000000-0000-4000-8000-000000002003', 'DEMO-INQ-1003', '00000000-0000-4000-8000-000000000009', null, 'Jordan Ruiz', 'jordan@example.test', '+34-555-0103', 59000, 'USD', 'PHONE', 'Spain', '28001', 'Demo inquiry: interested in insured international shipping.', 'NEW')
on conflict (id) do update set
  status = excluded.status,
  message = excluded.message,
  updated_at = now();
