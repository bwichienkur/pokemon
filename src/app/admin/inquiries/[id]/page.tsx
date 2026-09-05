import { notFound } from "next/navigation";

import { InquiryDetail } from "@/components/admin/inquiry-detail";
import { getAuditLogs, getCardById, getInquiryById, getInquiryNotes } from "@/lib/data/repository";
import type { AuditLog } from "@/types/database";

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await getInquiryById(id);
  if (!inquiry) notFound();
  const [card, notes, allActivity] = await Promise.all([
    getCardById(inquiry.cardId),
    getInquiryNotes(inquiry.id, true),
    getAuditLogs(100),
  ]);
  return <InquiryDetail inquiry={inquiry} card={card} notes={notes} activity={allActivity.filter((entry: AuditLog) => entry.entityType === "INQUIRY" && entry.entityId === inquiry.id)} />;
}
