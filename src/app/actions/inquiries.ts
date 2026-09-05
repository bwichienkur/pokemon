"use server";

import { revalidatePath } from "next/cache";

import { HoneypotProvider } from "@/lib/bot-protection";
import { requireAdmin, getCurrentUser } from "@/lib/auth/session";
import { ValidationError } from "@/lib/auth/errors";
import { toMinorUnits } from "@/lib/money";
import {
  addInquiryNote,
  createInquiry,
  getCardById,
  updateInquiryStatus,
} from "@/lib/data/repository";
import {
  inquiryFormSchema,
  type InquiryFormInput,
} from "@/lib/validations/inquiry";
import {
  inquiryNoteSchema,
  inquiryStatusUpdateSchema,
} from "@/lib/validations/admin";
import {
  sendInquiryAdminNotification,
  sendInquiryBuyerConfirmation,
} from "@/lib/email";

function parseForm(input: unknown): InquiryFormInput {
  const parsed = inquiryFormSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
  return parsed.data;
}

export async function submitInquiry(input: unknown) {
  const values = parseForm(input);
  const botResult = await new HoneypotProvider().verify(values.website);
  if (!botResult.success) throw new ValidationError(botResult.reason);
  const card = await getCardById(values.cardId);
  if (!card) throw new ValidationError("This card is no longer available.");
  const user = await getCurrentUser();
  const inquiry = await createInquiry({
    cardId: card.id,
    userId: user?.id ?? null,
    name: values.name,
    email: values.email.toLowerCase(),
    phone: values.phone || null,
    offerAmountMinor: values.offerAmount ? toMinorUnits(values.offerAmount, card.currency) : null,
    currency: card.currency,
    preferredContactMethod: values.preferredContactMethod,
    country: values.country,
    postalCode: values.postalCode || null,
    message: values.message,
  });
  await Promise.all([
    sendInquiryAdminNotification(inquiry, card),
    sendInquiryBuyerConfirmation(inquiry, card),
  ]);
  revalidatePath(`/cards/${card.slug}`);
  return { ok: true, referenceNumber: inquiry.referenceNumber };
}

export async function updateInquiryStatusAction(id: string, input: unknown) {
  const admin = await requireAdmin();
  const parsed = inquiryStatusUpdateSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
  const inquiry = await updateInquiryStatus(id, parsed.data.status, admin.id);
  revalidatePath("/admin/inquiries"); revalidatePath(`/admin/inquiries/${id}`);
  return inquiry;
}

export async function addInquiryNoteAction(id: string, input: unknown) {
  const admin = await requireAdmin();
  const parsed = inquiryNoteSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
  const note = await addInquiryNote(id, parsed.data.body, parsed.data.isInternal, admin.id);
  revalidatePath(`/admin/inquiries/${id}`);
  return note;
}
