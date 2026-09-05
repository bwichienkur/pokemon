"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireUser } from "@/lib/auth/session";
import { ValidationError } from "@/lib/auth/errors";
import {
  archiveCard,
  createCard,
  toggleFavorite,
  updateCard,
} from "@/lib/data/repository";
import { cardCreateSchema, cardUpdateSchema } from "@/lib/validations/card";

function validated<T>(result: { success: boolean; data?: T; error?: { issues: Array<{ message: string }> } }): T {
  if (!result.success || !result.data) throw new ValidationError(result.error?.issues[0]?.message);
  return result.data;
}

export async function createCardAction(input: unknown) {
  const admin = await requireAdmin();
  const card = await createCard(validated(cardCreateSchema.safeParse(input)), admin.id);
  revalidatePath("/admin/cards"); revalidatePath("/cards");
  return card;
}

export async function updateCardAction(id: string, input: unknown) {
  const admin = await requireAdmin();
  const card = await updateCard(id, validated(cardUpdateSchema.safeParse(input)), admin.id);
  revalidatePath(`/cards/${card.slug}`); revalidatePath("/admin/cards"); revalidatePath("/cards");
  return card;
}

export async function archiveCardAction(id: string) {
  const admin = await requireAdmin();
  const card = await archiveCard(id, admin.id);
  revalidatePath(`/cards/${card.slug}`); revalidatePath("/admin/cards"); revalidatePath("/cards");
  return card;
}

export async function toggleFavoriteAction(cardId: string) {
  const user = await requireUser();
  const favorited = await toggleFavorite(user.id, cardId);
  revalidatePath("/account/favorites");
  return { favorited };
}
