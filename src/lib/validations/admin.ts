import { z } from "zod";

const inquiryStatuses = [
  "NEW",
  "REVIEWING",
  "BUYER_CONTACTED",
  "NEGOTIATING",
  "ACCEPTED",
  "DECLINED",
  "CLOSED",
  "CONVERTED_TO_ORDER",
] as const;

export const inquiryStatusUpdateSchema = z
  .object({
    status: z.enum(inquiryStatuses),
  })
  .strict();

export const inquiryNoteSchema = z
  .object({
    body: z.string().trim().min(1).max(5_000),
    isInternal: z.boolean().default(true),
  })
  .strict();

export const appSettingsSchema = z
  .object({
    showroomVisible: z.boolean().default(true),
    // Checkout is intentionally disabled until a payment flow is implemented.
    directCheckoutEnabled: z.literal(false).default(false),
    inquiryAutoReplyEnabled: z.boolean().default(true),
    inquiryNotificationEmail: z.string().trim().email().max(254).nullable().optional(),
    inquiryCcEmails: z.array(z.string().trim().email().max(254)).max(10).default([]),
    siteNotice: z.string().trim().max(500).nullable().optional(),
    featuredCardLimit: z.number().int().min(0).max(24).default(6),
  })
  .strict();

const cardIdsSchema = z.array(z.string().uuid()).min(1).max(100);

export const bulkCardActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("PUBLISH"), cardIds: cardIdsSchema }).strict(),
  z.object({ action: z.literal("UNPUBLISH"), cardIds: cardIdsSchema }).strict(),
  z.object({ action: z.literal("ARCHIVE"), cardIds: cardIdsSchema }).strict(),
  z.object({ action: z.literal("MARK_AVAILABLE"), cardIds: cardIdsSchema }).strict(),
  z.object({ action: z.literal("MARK_RESERVED"), cardIds: cardIdsSchema }).strict(),
  z.object({ action: z.literal("MARK_SOLD"), cardIds: cardIdsSchema }).strict(),
  z.object({ action: z.literal("SET_FEATURED"), cardIds: cardIdsSchema }).strict(),
  z.object({ action: z.literal("CLEAR_FEATURED"), cardIds: cardIdsSchema }).strict(),
]);

export type InquiryStatusUpdateInput = z.infer<typeof inquiryStatusUpdateSchema>;
export type InquiryNoteInput = z.infer<typeof inquiryNoteSchema>;
export type AppSettingsInput = z.infer<typeof appSettingsSchema>;
export type BulkCardActionInput = z.infer<typeof bulkCardActionSchema>;
