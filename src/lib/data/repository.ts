import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { assertInventoryTransition } from "@/lib/inventory";
import { readStore, updateStore } from "@/lib/data/local-store";
import {
  cardImageToSnake,
  cardToSnake,
  inquiryNoteToSnake,
  inquiryToSnake,
  profileToSnake,
  snakeToAppSetting,
  snakeToAuditLog,
  snakeToCard,
  snakeToCardImage,
  snakeToInquiry,
  snakeToInquiryNote,
  snakeToPaymentEvent,
  snakeToProfile,
} from "@/lib/data/mappers";
import { AuthError, NotFoundError, RateLimitError } from "@/lib/auth/errors";
import type {
  AppSetting,
  AuditLog,
  AvailabilityStatus,
  Card,
  CardImage,
  CardWithImages,
  Inquiry,
  InquiryNote,
  InquiryStatus,
  ImageType,
  LocalStore,
  PaymentEvent,
  Profile,
  Role,
} from "@/types/database";
import type { CardCreateInput, CardFilters, CardUpdateInput } from "@/lib/validations/card";

type InquiryCreate = Omit<Inquiry, "id" | "referenceNumber" | "createdAt" | "updatedAt" | "status">;
type InquiryFilters = { status?: InquiryStatus; page?: number; perPage?: number };
type DashboardStats = { totalCards: number; availableCards: number; reservedCards: number; soldCards: number; totalInquiries: number; newInquiries: number; totalSalesMinor: number };
const uuid = () => crypto.randomUUID();
const isoNow = () => new Date().toISOString();
const asRecord = (value: unknown): Record<string, unknown> => value as Record<string, unknown>;

function cardWithImages(store: LocalStore, card: Card): CardWithImages {
  return { ...card, images: store.cardImages.filter((image) => image.cardId === card.id).sort((a, b) => a.sortOrder - b.sortOrder) };
}

async function assertAdmin(actorId: string): Promise<Profile> {
  const actor = await getProfile(actorId);
  if (!actor) throw new AuthError();
  if (actor.role !== "ADMIN") throw new AuthError("Administrator access is required.");
  return actor;
}

function localCards(store: LocalStore, filters: Partial<CardFilters> = {}): Card[] {
  let cards = store.cards.filter((card) => {
    const text = filters.q?.toLowerCase();
    return (!filters.graders || filters.graders.includes(card.grader))
      && (!filters.grades || filters.grades.includes(card.grade))
      && (!filters.availability || filters.availability.includes(card.availabilityStatus))
      && (!filters.publicationStatus || filters.publicationStatus.includes(card.publicationStatus))
      && (!filters.languages || filters.languages.includes(card.language))
      && (!filters.sets || (card.setName !== null && filters.sets.includes(card.setName)))
      && (!filters.rarities || (card.rarity !== null && filters.rarities.includes(card.rarity)))
      && (!filters.finishes || (card.finish !== null && filters.finishes.includes(card.finish)))
      && (filters.featured === undefined || card.featured === filters.featured)
      && (filters.minPriceMinor === undefined || card.priceMinor >= filters.minPriceMinor)
      && (filters.maxPriceMinor === undefined || card.priceMinor <= filters.maxPriceMinor)
      && (filters.year === undefined || card.year === filters.year)
      && (filters.minYear === undefined || (card.year !== null && card.year >= filters.minYear))
      && (filters.maxYear === undefined || (card.year !== null && card.year <= filters.maxYear))
      && (!text || [card.title, card.pokemonName, card.setName, card.certificationNumber].some((value) => value?.toLowerCase().includes(text)));
  });
  const sort = filters.sort ?? "newest";
  cards = [...cards].sort((a, b) => {
    if (sort === "price_asc") return a.priceMinor - b.priceMinor;
    if (sort === "price_desc") return b.priceMinor - a.priceMinor;
    if (sort === "grade_desc") return b.grade - a.grade;
    if (sort === "year_asc") return (a.year ?? 9999) - (b.year ?? 9999);
    if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
    return b.createdAt.localeCompare(a.createdAt);
  });
  return cards;
}

function mapCardRow(row: Record<string, unknown>): CardWithImages {
  const { card_images, ...card } = row;
  return { ...snakeToCard(card), images: Array.isArray(card_images) ? card_images.map((image) => snakeToCardImage(asRecord(image))) : [] };
}

export async function getCards(filters: Partial<CardFilters> = {}): Promise<{ items: CardWithImages[]; total: number; page: number; perPage: number }> {
  const page = filters.page ?? 1; const perPage = filters.perPage ?? 24;
  if (!env.isSupabaseConfigured) {
    const cards = localCards(await readStore(), filters); const store = await readStore();
    return { items: cards.slice((page - 1) * perPage, page * perPage).map((card) => cardWithImages(store, card)), total: cards.length, page, perPage };
  }
  const db = createAdminClient();
  let query = db.from("cards").select("*, card_images(*)", { count: "exact" });
  if (filters.q) query = query.or(`title.ilike.%${filters.q}%,pokemon_name.ilike.%${filters.q}%,certification_number.ilike.%${filters.q}%`);
  if (filters.graders?.length) query = query.in("grader", filters.graders);
  if (filters.availability?.length) query = query.in("availability_status", filters.availability);
  if (filters.publicationStatus?.length) query = query.in("publication_status", filters.publicationStatus);
  if (filters.featured !== undefined) query = query.eq("featured", filters.featured);
  if (filters.minPriceMinor !== undefined) query = query.gte("price_minor", filters.minPriceMinor);
  if (filters.maxPriceMinor !== undefined) query = query.lte("price_minor", filters.maxPriceMinor);
  const ascending = ["oldest", "price_asc", "year_asc"].includes(filters.sort ?? "");
  const column = ({ price_asc: "price_minor", price_desc: "price_minor", grade_desc: "grade", year_asc: "year", oldest: "created_at" } as Record<string, string>)[filters.sort ?? ""] ?? "created_at";
  const { data, error, count } = await query.order(column, { ascending }).range((page - 1) * perPage, page * perPage - 1);
  if (error) throw error;
  return { items: (data ?? []).map((row: unknown) => mapCardRow(asRecord(row))), total: count ?? 0, page, perPage };
}

export async function getCardBySlug(slug: string): Promise<CardWithImages | null> {
  if (!env.isSupabaseConfigured) { const store = await readStore(); const card = store.cards.find((item) => item.slug === slug); return card ? cardWithImages(store, card) : null; }
  const { data, error } = await createAdminClient().from("cards").select("*, card_images(*)").eq("slug", slug).maybeSingle();
  if (error) throw error; return data ? mapCardRow(asRecord(data)) : null;
}
export async function getCardById(id: string): Promise<CardWithImages | null> {
  if (!env.isSupabaseConfigured) { const store = await readStore(); const card = store.cards.find((item) => item.id === id); return card ? cardWithImages(store, card) : null; }
  const { data, error } = await createAdminClient().from("cards").select("*, card_images(*)").eq("id", id).maybeSingle();
  if (error) throw error; return data ? mapCardRow(asRecord(data)) : null;
}
export async function getFeaturedCards(limit = 6) { return (await getCards({ featured: true, availability: ["AVAILABLE"], perPage: limit })).items; }
export async function getNewArrivals(limit = 12) { return (await getCards({ availability: ["AVAILABLE"], sort: "recently_added", perPage: limit })).items; }
export async function getSoldCards(limit = 12) { return (await getCards({ availability: ["SOLD"], perPage: limit })).items; }

export async function createCard(input: CardCreateInput, actorId: string): Promise<Card> {
  await assertAdmin(actorId); const now = isoNow();
  const card: Card = { ...input, id: uuid(), slug: input.slug ?? `${input.pokemonName.toLowerCase().replace(/\W+/g, "-")}-${input.grader}-${input.certificationNumber.toLowerCase()}`, description: input.description ?? null, year: input.year ?? null, setName: input.setName ?? null, setCode: input.setCode ?? null, cardNumber: input.cardNumber ?? null, setTotal: input.setTotal ?? null, rarity: input.rarity ?? null, variant: input.variant ?? null, edition: input.edition ?? null, finish: input.finish ?? null, gradeLabel: input.gradeLabel ?? null, verificationUrl: input.verificationUrl ?? null, graderMetadata: input.graderMetadata ?? {}, populationCount: input.populationCount ?? null, provenanceNotes: input.provenanceNotes ?? null, slabNotes: input.slabNotes ?? null, shippingRegions: input.shippingRegions ?? null, acquiredAt: input.acquiredAt ?? null, listedAt: input.listedAt ?? null, soldAt: input.availabilityStatus === "SOLD" ? now : null, createdBy: actorId, createdAt: now, updatedAt: now, archivedAt: input.availabilityStatus === "ARCHIVED" ? now : null };
  if (!env.isSupabaseConfigured) return updateStore((store) => { store.cards.push(card); store.auditLogs.push(makeAudit(actorId, "CREATE", "CARD", card.id, null, card)); return card; });
  const { data, error } = await createAdminClient().from("cards").insert(cardToSnake(card)).select().single(); if (error) throw error;
  await appendAuditLog({ actorId, action: "CREATE", entityType: "CARD", entityId: card.id, beforeState: null, afterState: card }); return snakeToCard(asRecord(data));
}

export async function updateCard(id: string, input: CardUpdateInput, actorId: string): Promise<Card> {
  await assertAdmin(actorId); const before = await getCardById(id); if (!before) throw new NotFoundError("Card not found.");
  const updates: Partial<Card> = { ...input, updatedAt: isoNow() };
  if (input.availabilityStatus === "SOLD" && before.availabilityStatus !== "SOLD") updates.soldAt = isoNow();
  if (input.availabilityStatus && input.availabilityStatus !== "SOLD") updates.soldAt = null;
  if (input.availabilityStatus === "ARCHIVED") updates.archivedAt = isoNow();
  if (!env.isSupabaseConfigured) return updateStore((store) => { const index = store.cards.findIndex((card) => card.id === id); const card = { ...store.cards[index], ...updates }; store.cards[index] = card; store.auditLogs.push(makeAudit(actorId, "UPDATE", "CARD", id, before, card)); return card; });
  const { data, error } = await createAdminClient().from("cards").update(cardToSnake(updates)).eq("id", id).select().single(); if (error) throw error;
  const card = snakeToCard(asRecord(data)); await appendAuditLog({ actorId, action: "UPDATE", entityType: "CARD", entityId: id, beforeState: before, afterState: card }); return card;
}
export async function archiveCard(id: string, actorId: string) { return transitionInventory(id, "ARCHIVED", actorId); }
export async function replaceCardImages(
  cardId: string,
  images: Array<Pick<CardImage, "imageUrl" | "storagePath" | "imageType" | "altText" | "sortOrder" | "width" | "height">>,
  actorId: string,
): Promise<CardImage[]> {
  await assertAdmin(actorId);
  if (!await getCardById(cardId)) throw new NotFoundError("Card not found.");
  const now = isoNow();
  const normalized = images.map((image, index): CardImage => ({
    id: uuid(),
    cardId,
    imageUrl: image.imageUrl,
    storagePath: image.storagePath ?? null,
    imageType: image.imageType as ImageType,
    altText: image.altText ?? null,
    sortOrder: index,
    width: image.width ?? null,
    height: image.height ?? null,
    createdAt: now,
  }));
  if (!env.isSupabaseConfigured) {
    return updateStore((store) => {
      store.cardImages = store.cardImages.filter((image) => image.cardId !== cardId);
      store.cardImages.push(...normalized);
      store.auditLogs.push(makeAudit(actorId, "REPLACE_IMAGES", "CARD", cardId, null, { count: normalized.length }));
      return normalized;
    });
  }
  const db = createAdminClient();
  const { error: deleteError } = await db.from("card_images").delete().eq("card_id", cardId);
  if (deleteError) throw deleteError;
  if (normalized.length) {
    const { error: insertError } = await db.from("card_images").insert(normalized.map(cardImageToSnake));
    if (insertError) throw insertError;
  }
  await appendAuditLog({ actorId, action: "REPLACE_IMAGES", entityType: "CARD", entityId: cardId, beforeState: null, afterState: { count: normalized.length } });
  return normalized;
}
export async function bulkSetFeatured(ids: string[], featured: boolean, actorId: string): Promise<void> { await assertAdmin(actorId); if (!env.isSupabaseConfigured) { await updateStore((store) => { store.cards.forEach((card) => { if (ids.includes(card.id)) card.featured = featured; }); }); } else { const { error } = await createAdminClient().from("cards").update({ featured }).in("id", ids); if (error) throw error; } await appendAuditLog({ actorId, action: featured ? "SET_FEATURED" : "CLEAR_FEATURED", entityType: "CARD", entityId: null, beforeState: null, afterState: { ids } }); }
export async function bulkArchive(ids: string[], actorId: string): Promise<void> { for (const id of ids) await archiveCard(id, actorId); }

export async function toggleFavorite(userId: string, cardId: string): Promise<boolean> {
  if (!await getProfile(userId)) throw new AuthError();
  if (!env.isSupabaseConfigured) return updateStore((store) => { const index = store.favorites.findIndex((favorite) => favorite.userId === userId && favorite.cardId === cardId); if (index >= 0) { store.favorites.splice(index, 1); return false; } store.favorites.push({ userId, cardId, createdAt: isoNow() }); return true; });
  const db = createAdminClient(); const { data } = await db.from("favorites").select("user_id").eq("user_id", userId).eq("card_id", cardId).maybeSingle();
  const { error } = data ? await db.from("favorites").delete().eq("user_id", userId).eq("card_id", cardId) : await db.from("favorites").insert({ user_id: userId, card_id: cardId }); if (error) throw error; return !data;
}
export async function isFavorite(userId: string, cardId: string) { if (!env.isSupabaseConfigured) return (await readStore()).favorites.some((favorite) => favorite.userId === userId && favorite.cardId === cardId); const { data, error } = await createAdminClient().from("favorites").select("user_id").eq("user_id", userId).eq("card_id", cardId).maybeSingle(); if (error) throw error; return Boolean(data); }
export async function getFavorites(userId: string): Promise<CardWithImages[]> { if (!env.isSupabaseConfigured) { const store = await readStore(); return store.favorites.filter((favorite) => favorite.userId === userId).map((favorite) => store.cards.find((card) => card.id === favorite.cardId)).filter((card): card is Card => Boolean(card)).map((card) => cardWithImages(store, card)); } const { data, error } = await createAdminClient().from("favorites").select("cards(*, card_images(*))").eq("user_id", userId); if (error) throw error; return (data ?? []).flatMap((row: { cards?: unknown }) => row.cards ? [mapCardRow(asRecord(row.cards))] : []); }

export async function createInquiry(data: InquiryCreate): Promise<Inquiry> {
  const current = Date.now(); const duplicate = (inquiry: Inquiry) => inquiry.cardId === data.cardId && inquiry.email.toLowerCase() === data.email.toLowerCase() && current - new Date(inquiry.createdAt).getTime() < 300_000;
  if (!env.isSupabaseConfigured) return updateStore((store) => { if (store.inquiries.some(duplicate)) throw new RateLimitError("An inquiry for this card was recently submitted."); const inquiry: Inquiry = { ...data, id: uuid(), referenceNumber: `AG-${new Date().getUTCFullYear()}-${String(store.inquiries.length + 1).padStart(4, "0")}`, status: "NEW", createdAt: isoNow(), updatedAt: isoNow() }; store.inquiries.push(inquiry); return inquiry; });
  const db = createAdminClient(); const since = new Date(current - 300_000).toISOString(); const { data: recent, error: recentError } = await db.from("inquiries").select("id").eq("card_id", data.cardId).ilike("email", data.email).gte("created_at", since).limit(1); if (recentError) throw recentError; if (recent?.length) throw new RateLimitError("An inquiry for this card was recently submitted.");
  const { count, error: countError } = await db.from("inquiries").select("id", { count: "exact", head: true }); if (countError) throw countError;
  const inquiry: Inquiry = { ...data, id: uuid(), referenceNumber: `AG-${new Date().getUTCFullYear()}-${String((count ?? 0) + 1).padStart(4, "0")}`, status: "NEW", createdAt: isoNow(), updatedAt: isoNow() };
  const { data: created, error } = await db.from("inquiries").insert(inquiryToSnake(inquiry)).select().single(); if (error) throw error; return snakeToInquiry(asRecord(created));
}
export async function getInquiryById(id: string) { if (!env.isSupabaseConfigured) return (await readStore()).inquiries.find((item) => item.id === id) ?? null; const { data, error } = await createAdminClient().from("inquiries").select().eq("id", id).maybeSingle(); if (error) throw error; return data ? snakeToInquiry(asRecord(data)) : null; }
export async function getInquiriesForUser(userId: string): Promise<Inquiry[]> { if (!env.isSupabaseConfigured) return (await readStore()).inquiries.filter((item) => item.userId === userId); const { data, error } = await createAdminClient().from("inquiries").select().eq("user_id", userId).order("created_at", { ascending: false }); if (error) throw error; return (data ?? []).map((item: unknown) => snakeToInquiry(asRecord(item))); }
export async function getAllInquiries(filters: InquiryFilters = {}): Promise<{ items: Inquiry[]; total: number; page: number; perPage: number }> { const page = filters.page ?? 1; const perPage = filters.perPage ?? 50; if (!env.isSupabaseConfigured) { const inquiries = (await readStore()).inquiries.filter((item) => !filters.status || item.status === filters.status); return { items: inquiries.slice((page - 1) * perPage, page * perPage), total: inquiries.length, page, perPage }; } let query = createAdminClient().from("inquiries").select("*", { count: "exact" }); if (filters.status) query = query.eq("status", filters.status); const { data, error, count } = await query.order("created_at", { ascending: false }).range((page - 1) * perPage, page * perPage - 1); if (error) throw error; return { items: (data ?? []).map((item: unknown) => snakeToInquiry(asRecord(item))), total: count ?? 0, page, perPage }; }
export async function updateInquiryStatus(id: string, status: InquiryStatus, actorId: string): Promise<Inquiry> { await assertAdmin(actorId); const before = await getInquiryById(id); if (!before) throw new NotFoundError("Inquiry not found."); if (!env.isSupabaseConfigured) return updateStore((store) => { const item = store.inquiries.find((inquiry) => inquiry.id === id)!; item.status = status; item.updatedAt = isoNow(); store.auditLogs.push(makeAudit(actorId, "UPDATE_STATUS", "INQUIRY", id, before, item)); return item; }); const { data, error } = await createAdminClient().from("inquiries").update({ status }).eq("id", id).select().single(); if (error) throw error; const inquiry = snakeToInquiry(asRecord(data)); await appendAuditLog({ actorId, action: "UPDATE_STATUS", entityType: "INQUIRY", entityId: id, beforeState: before, afterState: inquiry }); return inquiry; }
export async function addInquiryNote(inquiryId: string, note: string, isInternal: boolean, actorId: string): Promise<InquiryNote> { await assertAdmin(actorId); const entry: InquiryNote = { id: uuid(), inquiryId, authorId: actorId, note, isInternal, createdAt: isoNow() }; if (!env.isSupabaseConfigured) return updateStore((store) => { store.inquiryNotes.push(entry); return entry; }); const { data, error } = await createAdminClient().from("inquiry_notes").insert(inquiryNoteToSnake(entry)).select().single(); if (error) throw error; return snakeToInquiryNote(asRecord(data)); }
export async function getInquiryNotes(inquiryId: string, includeInternal = false) { if (!env.isSupabaseConfigured) return (await readStore()).inquiryNotes.filter((note) => note.inquiryId === inquiryId && (includeInternal || !note.isInternal)); let query = createAdminClient().from("inquiry_notes").select().eq("inquiry_id", inquiryId); if (!includeInternal) query = query.eq("is_internal", false); const { data, error } = await query.order("created_at"); if (error) throw error; return (data ?? []).map((note: unknown) => snakeToInquiryNote(asRecord(note))); }

export async function getProfile(id: string) { if (!env.isSupabaseConfigured) return (await readStore()).profiles.find((profile) => profile.id === id) ?? null; const { data, error } = await createAdminClient().from("profiles").select().eq("id", id).maybeSingle(); if (error) throw error; return data ? snakeToProfile(asRecord(data)) : null; }
export async function getProfileByEmail(email: string) { if (!env.isSupabaseConfigured) return (await readStore()).profiles.find((profile) => profile.email.toLowerCase() === email.toLowerCase()) ?? null; const { data, error } = await createAdminClient().from("profiles").select().ilike("email", email).maybeSingle(); if (error) throw error; return data ? snakeToProfile(asRecord(data)) : null; }
export async function listUsers() { if (!env.isSupabaseConfigured) return (await readStore()).profiles; const { data, error } = await createAdminClient().from("profiles").select().order("created_at"); if (error) throw error; return (data ?? []).map((item: unknown) => snakeToProfile(asRecord(item))); }
export async function updateProfile(id: string, data: Pick<Partial<Profile>, "displayName" | "phone" | "avatarUrl">): Promise<Profile> { const profile = await getProfile(id); if (!profile) throw new AuthError(); if (!env.isSupabaseConfigured) return updateStore((store) => { const current = store.profiles.find((item) => item.id === id)!; Object.assign(current, data, { updatedAt: isoNow() }); return current; }); const { data: updated, error } = await createAdminClient().from("profiles").update(profileToSnake({ ...data, updatedAt: isoNow() })).eq("id", id).select().single(); if (error) throw error; return snakeToProfile(asRecord(updated)); }
export async function setUserRole(targetId: string, role: Role, actorId: string): Promise<Profile> { await assertAdmin(actorId); const before = await getProfile(targetId); if (!before) throw new NotFoundError("User not found."); if (!env.isSupabaseConfigured) return updateStore((store) => { const profile = store.profiles.find((item) => item.id === targetId)!; profile.role = role; profile.updatedAt = isoNow(); store.auditLogs.push(makeAudit(actorId, "SET_ROLE", "PROFILE", targetId, before, profile)); return profile; }); const { data, error } = await createAdminClient().from("profiles").update({ role }).eq("id", targetId).select().single(); if (error) throw error; const profile = snakeToProfile(asRecord(data)); await appendAuditLog({ actorId, action: "SET_ROLE", entityType: "PROFILE", entityId: targetId, beforeState: before, afterState: profile }); return profile; }

export async function getAdminDashboardStats(): Promise<DashboardStats> { const cards = !env.isSupabaseConfigured ? (await readStore()).cards : (await getCards({ perPage: 10000 })).items; const inquiries = !env.isSupabaseConfigured ? (await readStore()).inquiries : (await getAllInquiries({ perPage: 10000 })).items; return { totalCards: cards.length, availableCards: cards.filter((card) => card.availabilityStatus === "AVAILABLE").length, reservedCards: cards.filter((card) => card.availabilityStatus === "RESERVED").length, soldCards: cards.filter((card) => card.availabilityStatus === "SOLD").length, totalInquiries: inquiries.length, newInquiries: inquiries.filter((inquiry: Inquiry) => inquiry.status === "NEW").length, totalSalesMinor: cards.filter((card) => card.availabilityStatus === "SOLD").reduce((sum, card) => sum + card.priceMinor, 0) }; }
export async function getAuditLogs(limit = 100): Promise<AuditLog[]> { if (!env.isSupabaseConfigured) return (await readStore()).auditLogs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit); const { data, error } = await createAdminClient().from("audit_logs").select().order("created_at", { ascending: false }).limit(limit); if (error) throw error; return (data ?? []).map((entry: unknown) => snakeToAuditLog(asRecord(entry))); }
function makeAudit(actorId: string | null, action: string, entityType: string, entityId: string | null, beforeState: object | null, afterState: object | null): AuditLog { return { id: uuid(), actorId, action, entityType, entityId, beforeState: beforeState as Record<string, unknown> | null, afterState: afterState as Record<string, unknown> | null, createdAt: isoNow() }; }
export async function appendAuditLog(input: Omit<AuditLog, "id" | "createdAt" | "beforeState" | "afterState"> & { beforeState: object | null; afterState: object | null }): Promise<AuditLog> { const entry = makeAudit(input.actorId, input.action, input.entityType, input.entityId, input.beforeState, input.afterState); if (!env.isSupabaseConfigured) return updateStore((store) => { store.auditLogs.push(entry); return entry; }); const { error } = await createAdminClient().from("audit_logs").insert({ id: entry.id, actor_id: entry.actorId, action: entry.action, entity_type: entry.entityType, entity_id: entry.entityId, before_state: entry.beforeState, after_state: entry.afterState, created_at: entry.createdAt }); if (error) throw error; return entry; }
export async function processPaymentEventIdempotent(event: PaymentEvent): Promise<{ event: PaymentEvent; processed: boolean }> { if (!env.isSupabaseConfigured) return updateStore((store) => { const existing = store.paymentEvents.find((item) => item.idempotencyKey === event.idempotencyKey); if (existing) return { event: existing, processed: false }; store.paymentEvents.push(event); return { event, processed: true }; }); const { data: existing, error: findError } = await createAdminClient().from("payment_events").select().eq("idempotency_key", event.idempotencyKey).maybeSingle(); if (findError) throw findError; if (existing) return { event: snakeToPaymentEvent(asRecord(existing)), processed: false }; const { data, error } = await createAdminClient().from("payment_events").insert({ id: event.id, provider: event.provider, provider_event_id: event.providerEventId, idempotency_key: event.idempotencyKey, status: event.status, payload: event.payload, processed_at: event.processedAt, created_at: event.createdAt }).select().single(); if (error) { if ((error as { code?: string }).code === "23505") return { event, processed: false }; throw error; } return { event: snakeToPaymentEvent(asRecord(data)), processed: true }; }
export async function transitionInventory(cardId: string, toStatus: AvailabilityStatus, actorId: string): Promise<Card> { await assertAdmin(actorId); const card = await getCardById(cardId); if (!card) throw new NotFoundError("Card not found."); assertInventoryTransition(card.availabilityStatus, toStatus); return updateCard(cardId, { availabilityStatus: toStatus }, actorId); }
export async function getAppSettings(): Promise<AppSetting[]> { if (!env.isSupabaseConfigured) return (await readStore()).appSettings; const { data, error } = await createAdminClient().from("app_settings").select(); if (error) throw error; return (data ?? []).map((entry: unknown) => snakeToAppSetting(asRecord(entry))); }
export async function updateAppSettings(settings: Record<string, unknown>, actorId: string): Promise<AppSetting[]> { await assertAdmin(actorId); const now = isoNow(); const entries = Object.entries(settings).map(([key, value]) => ({ key, value, updatedAt: now, updatedBy: actorId })); if (!env.isSupabaseConfigured) return updateStore((store) => { for (const entry of entries) { const index = store.appSettings.findIndex((current) => current.key === entry.key); if (index >= 0) store.appSettings[index] = entry; else store.appSettings.push(entry); } return entries; }); const { data, error } = await createAdminClient().from("app_settings").upsert(entries.map((entry) => ({ key: entry.key, value: entry.value, updated_at: entry.updatedAt, updated_by: entry.updatedBy }))).select(); if (error) throw error; await appendAuditLog({ actorId, action: "UPDATE_SETTINGS", entityType: "APP_SETTING", entityId: null, beforeState: null, afterState: settings }); return (data ?? []).map((entry: unknown) => snakeToAppSetting(asRecord(entry))); }
