"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { ValidationError } from "@/lib/auth/errors";
import {
  bulkArchive,
  bulkSetFeatured,
  getAdminDashboardStats,
  getAllInquiries,
  getAppSettings,
  getAuditLogs,
  listUsers,
  setUserRole,
  transitionInventory,
  updateAppSettings,
  updateCard,
} from "@/lib/data/repository";
import { appSettingsSchema, bulkCardActionSchema } from "@/lib/validations/admin";
import type { Role } from "@/types/database";

export async function getDashboardData() {
  await requireAdmin();
  const [stats, inquiries, users, settings, auditLogs] = await Promise.all([
    getAdminDashboardStats(), getAllInquiries({ perPage: 10 }), listUsers(), getAppSettings(), getAuditLogs(20),
  ]);
  return { stats, inquiries, users, settings, auditLogs };
}

export async function bulkCardsAction(input: unknown) {
  const admin = await requireAdmin();
  const parsed = bulkCardActionSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
  const { action, cardIds } = parsed.data;
  if (action === "ARCHIVE") await bulkArchive(cardIds, admin.id);
  else if (action === "SET_FEATURED") await bulkSetFeatured(cardIds, true, admin.id);
  else if (action === "CLEAR_FEATURED") await bulkSetFeatured(cardIds, false, admin.id);
  else {
    const changes = action === "PUBLISH" ? { publicationStatus: "PUBLISHED" as const }
      : action === "UNPUBLISH" ? { publicationStatus: "DRAFT" as const }
      : action === "MARK_AVAILABLE" ? { availabilityStatus: "AVAILABLE" as const }
      : action === "MARK_RESERVED" ? { availabilityStatus: "RESERVED" as const }
      : { availabilityStatus: "SOLD" as const };
    await Promise.all(cardIds.map((cardId) => {
      const status = changes.availabilityStatus;
      return status
        ? transitionInventory(cardId, status, admin.id)
        : updateCard(cardId, changes, admin.id);
    }));
  }
  revalidatePath("/admin/cards"); revalidatePath("/cards");
  return { ok: true };
}

export async function updateSettingsAction(input: unknown) {
  const admin = await requireAdmin();
  const parsed = appSettingsSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
  const settings = await updateAppSettings(parsed.data, admin.id);
  revalidatePath("/", "layout");
  return settings;
}

export async function setUserRoleAction(targetId: string, role: Role) {
  const admin = await requireAdmin();
  if (role !== "ADMIN" && role !== "USER") throw new ValidationError("Invalid role.");
  if (targetId === admin.id) {
    throw new ValidationError("You cannot change your own administrator role.");
  }
  const user = await setUserRole(targetId, role, admin.id);
  revalidatePath("/admin/users");
  return user;
}
