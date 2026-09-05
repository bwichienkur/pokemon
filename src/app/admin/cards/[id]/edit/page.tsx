import { notFound } from "next/navigation";

import { CardEditor } from "@/components/admin/card-editor";
import { getCardById } from "@/lib/data/repository";

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getCardById(id);
  if (!card) notFound();
  return <CardEditor initialCard={card} />;
}
