"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Archive, ArrowDown, ArrowUp, ExternalLink, GripVertical, ImagePlus, LoaderCircle, Save, Trash2 } from "lucide-react";

import { archiveCardAction, createCardAction, updateCardAction } from "@/app/actions/cards";
import { saveCardImagesAction, uploadCardImageAction } from "@/app/actions/images";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { toMinorUnits } from "@/lib/money";
import { slugify } from "@/lib/utils";
import type { CardImage, CardWithImages, ImageType } from "@/types/database";

type EditableImage = Pick<CardImage, "imageUrl" | "storagePath" | "imageType" | "altText" | "sortOrder" | "width" | "height"> & { key: string };

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="grid gap-1.5 text-sm font-semibold"><span>{label}</span>{children}{hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}</label>;
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-border bg-card"><div className="border-b border-border px-5 py-4"><h2 className="font-display text-2xl font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><div className="grid gap-4 p-5">{children}</div></section>;
}

function imageFromCard(image: CardImage): EditableImage {
  return { key: image.id, imageUrl: image.imageUrl, storagePath: image.storagePath, imageType: image.imageType, altText: image.altText, sortOrder: image.sortOrder, width: image.width, height: image.height };
}

export function CardEditor({ initialCard }: { initialCard?: CardWithImages }) {
  const router = useRouter();
  const [slug, setSlug] = useState(initialCard?.slug ?? "");
  const [slugManual, setSlugManual] = useState(Boolean(initialCard?.slug));
  const [images, setImages] = useState<EditableImage[]>(initialCard?.images.map(imageFromCard) ?? []);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<ImageType>("FRONT");

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty || pending) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, pending]);

  async function upload(files: File[]) {
    setUploading(true);
    setError(null);
    try {
      const uploads = await Promise.all(files.map(async (file) => {
        const data = new FormData();
        data.set("file", file);
        const result = await uploadCardImageAction(data);
        return { key: crypto.randomUUID(), ...result, imageType: uploadType, altText: "", sortOrder: 0, width: null, height: null } satisfies EditableImage;
      }));
      setImages((current) => [...current, ...uploads].map((image, index) => ({ ...image, sortOrder: index })));
      setDirty(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const dropzone = useDropzone({
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    maxSize: 15 * 1024 * 1024,
    onDropAccepted: upload,
    onDropRejected: () => setError("Use JPEG, PNG, or WebP files no larger than 15 MB."),
  });

  function patchImage(key: string, change: Partial<EditableImage>) {
    setImages((current) => current.map((image) => image.key === key ? { ...image, ...change } : image));
    setDirty(true);
  }
  function moveImage(key: string, direction: -1 | 1) {
    setImages((current) => {
      const position = current.findIndex((image) => image.key === key);
      const next = position + direction;
      if (position < 0 || next < 0 || next >= current.length) return current;
      const copy = [...current];
      [copy[position], copy[next]] = [copy[next], copy[position]];
      return copy.map((image, index) => ({ ...image, sortOrder: index }));
    });
    setDirty(true);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const intent = String(form.get("intent") || "DRAFT");
    const text = (name: string) => {
      const value = String(form.get(name) || "").trim();
      return value || null;
    };
    const numeric = (name: string) => {
      const value = String(form.get(name) || "").trim();
      return value ? Number(value) : null;
    };
    let priceMinor: number;
    try {
      priceMinor = toMinorUnits(String(form.get("price") || "0"), String(form.get("currency") || "USD"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Enter a valid price.");
      return;
    }
    const payload = {
      title: String(form.get("title") || "").trim(),
      slug: slug || undefined,
      pokemonName: String(form.get("pokemonName") || "").trim(),
      description: text("description"),
      year: numeric("year"),
      setName: text("setName"),
      setCode: text("setCode"),
      cardNumber: text("cardNumber"),
      setTotal: text("setTotal"),
      rarity: text("rarity"),
      variant: text("variant"),
      edition: text("edition"),
      finish: text("finish"),
      language: String(form.get("language") || "English").trim(),
      category: String(form.get("category") || "Pokemon").trim(),
      grader: String(form.get("grader") || "PSA"),
      grade: Number(form.get("grade")),
      gradeLabel: text("gradeLabel"),
      certificationNumber: String(form.get("certificationNumber") || "").trim(),
      verificationUrl: text("verificationUrl"),
      graderMetadata: {},
      priceMinor,
      currency: String(form.get("currency") || "USD").toUpperCase(),
      priceNegotiable: form.get("priceNegotiable") === "on",
      availabilityStatus: String(form.get("availabilityStatus") || "AVAILABLE"),
      publicationStatus: intent === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      featured: form.get("featured") === "on",
      populationCount: numeric("populationCount"),
      provenanceNotes: text("provenanceNotes"),
      slabNotes: text("slabNotes"),
      shippingRegions: text("shippingRegions"),
      acquiredAt: null,
      listedAt: null,
    };
    setError(null);
    startTransition(async () => {
      try {
        const card = initialCard ? await updateCardAction(initialCard.id, payload) : await createCardAction(payload);
        await saveCardImagesAction(card.id, images.map(({ key: _key, ...image }, index) => ({ ...image, sortOrder: index })));
        setDirty(false);
        toast.success(initialCard ? "Card updated." : "Card created.");
        router.push(`/admin/cards/${card.id}/edit`);
        router.refresh();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Unable to save this card.");
      }
    });
  }

  const price = useMemo(() => initialCard ? (initialCard.priceMinor / 100).toFixed(2) : "", [initialCard]);
  const previewPath = slug ? `/cards/${slug}` : null;

  return (
    <form onSubmit={onSubmit} onChange={() => setDirty(true)} className="mx-auto max-w-5xl space-y-6 pb-12">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{initialCard ? "Edit inventory" : "New inventory"}</p><h1 className="mt-2 font-display text-4xl font-semibold">{initialCard ? initialCard.title : "Add a card"}</h1><p className="mt-2 text-sm text-muted-foreground">Changes are saved only when you save this card.</p></div>{previewPath && <Link href={previewPath} target="_blank" className="inline-flex items-center gap-2 text-sm font-bold text-gold hover:text-gold-bright">Preview listing <ExternalLink className="size-4" /></Link>}</header>
      {error && <p role="alert" className="rounded-md border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <Section title="Identity" description="The collector-facing title and permanent listing address."><div className="grid gap-4 sm:grid-cols-2"><Field label="Listing title"><Input required name="title" defaultValue={initialCard?.title} onChange={(event) => { if (!slugManual) setSlug(slugify(event.target.value)); }} placeholder="1999 Base Set Charizard Holo" /></Field><Field label="Pokémon name"><Input required name="pokemonName" defaultValue={initialCard?.pokemonName} placeholder="Charizard" /></Field><Field label="URL slug" hint="Lowercase words separated by hyphens."><Input name="slug" value={slug} onChange={(event) => { setSlugManual(true); setSlug(slugify(event.target.value)); }} placeholder="1999-base-set-charizard-holo" /></Field><Field label="Language"><Input name="language" defaultValue={initialCard?.language ?? "English"} /></Field><Field label="Category"><Input name="category" defaultValue={initialCard?.category ?? "Pokemon"} /></Field></div></Section>

      <Section title="Set details" description="Catalog information collectors use to identify the exact card."><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Year"><Input name="year" type="number" min="1950" defaultValue={initialCard?.year ?? ""} /></Field><Field label="Set name"><Input name="setName" defaultValue={initialCard?.setName ?? ""} /></Field><Field label="Set code"><Input name="setCode" defaultValue={initialCard?.setCode ?? ""} /></Field><Field label="Card number"><Input name="cardNumber" defaultValue={initialCard?.cardNumber ?? ""} /></Field><Field label="Set total"><Input name="setTotal" defaultValue={initialCard?.setTotal ?? ""} /></Field><Field label="Rarity"><Input name="rarity" defaultValue={initialCard?.rarity ?? ""} /></Field><Field label="Variant"><Input name="variant" defaultValue={initialCard?.variant ?? ""} /></Field><Field label="Edition"><Input name="edition" defaultValue={initialCard?.edition ?? ""} /></Field><Field label="Finish"><Input name="finish" defaultValue={initialCard?.finish ?? ""} /></Field></div></Section>

      <Section title="Grading" description="Authentication and condition details from the grading company."><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Grader"><select required name="grader" defaultValue={initialCard?.grader ?? "PSA"} className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm"><option>PSA</option><option>BGS</option><option>CGC</option><option>TAG</option></select></Field><Field label="Grade"><Input required name="grade" type="number" min="1" max="10" step="0.5" defaultValue={initialCard?.grade ?? ""} /></Field><Field label="Grade label"><Input name="gradeLabel" defaultValue={initialCard?.gradeLabel ?? ""} placeholder="Gem Mint" /></Field><Field label="Certification number"><Input required name="certificationNumber" defaultValue={initialCard?.certificationNumber ?? ""} /></Field><Field label="Verification URL"><Input name="verificationUrl" type="url" defaultValue={initialCard?.verificationUrl ?? ""} placeholder="https://…" /></Field><Field label="Population count"><Input name="populationCount" type="number" min="0" defaultValue={initialCard?.populationCount ?? ""} /></Field></div></Section>

      <Section title="Pricing & inventory" description="Set the asking price, inventory state, and negotiation preference."><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Asking price"><Input required name="price" inputMode="decimal" defaultValue={price} placeholder="1250.00" /></Field><Field label="Currency"><Input required name="currency" minLength={3} maxLength={3} defaultValue={initialCard?.currency ?? "USD"} /></Field><Field label="Inventory status"><select name="availabilityStatus" defaultValue={initialCard?.availabilityStatus ?? "AVAILABLE"} className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm"><option value="AVAILABLE">Available</option><option value="RESERVED">Reserved</option><option value="SOLD">Sold</option><option value="ARCHIVED">Archived</option></select></Field></div><label className="flex items-center gap-2 text-sm"><Checkbox name="priceNegotiable" defaultChecked={initialCard?.priceNegotiable} />Price is negotiable</label></Section>

      <Section title="Publication" description="Drafts are visible only in the admin studio. Published cards can appear in the showroom."><div className="flex flex-wrap gap-5"><label className="flex items-center gap-2 text-sm"><Checkbox name="featured" defaultChecked={initialCard?.featured} />Feature this card</label><p className="text-sm text-muted-foreground">Use the save controls below to keep a draft or publish it.</p></div></Section>

      <Section title="Images" description="Upload JPEG, PNG, or WebP images. Use the order controls to choose the primary image."><div className="flex flex-wrap items-end gap-3"><Field label="New image type"><select value={uploadType} onChange={(event) => setUploadType(event.target.value as ImageType)} className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm"><option value="FRONT">Front</option><option value="BACK">Back</option><option value="LABEL">Label</option><option value="DETAIL">Detail</option></select></Field></div><div {...dropzone.getRootProps()} className="cursor-pointer rounded-md border border-dashed border-gold/50 bg-gold/5 p-7 text-center transition-colors hover:bg-gold/10"><input {...dropzone.getInputProps()} /><ImagePlus className="mx-auto size-6 text-gold" /><p className="mt-2 text-sm font-semibold">{uploading ? "Uploading images…" : "Drop images here or click to browse"}</p><p className="mt-1 text-xs text-muted-foreground">Up to 15 MB each</p></div><div className="space-y-3">{images.map((image, index) => <div key={image.key} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[84px_1fr_auto]"><div className="relative aspect-square overflow-hidden rounded border border-border bg-background"><img src={image.imageUrl} alt="" className="size-full object-cover" /></div><div className="grid gap-2 sm:grid-cols-2"><Field label="Type"><select value={image.imageType} onChange={(event) => patchImage(image.key, { imageType: event.target.value as ImageType })} className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm"><option value="FRONT">Front</option><option value="BACK">Back</option><option value="LABEL">Label</option><option value="DETAIL">Detail</option></select></Field><Field label="Alt text"><Input value={image.altText ?? ""} onChange={(event) => patchImage(image.key, { altText: event.target.value })} placeholder="Describe the image" /></Field></div><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon-sm" aria-label="Move image earlier" disabled={index === 0} onClick={() => moveImage(image.key, -1)}><ArrowUp /></Button><Button type="button" variant="ghost" size="icon-sm" aria-label="Move image later" disabled={index === images.length - 1} onClick={() => moveImage(image.key, 1)}><ArrowDown /></Button><Button type="button" variant="ghost" size="icon-sm" aria-label="Remove image" onClick={() => { setImages((current) => current.filter((item) => item.key !== image.key)); setDirty(true); }}><Trash2 className="text-destructive" /></Button><GripVertical className="hidden text-muted-foreground sm:block" /></div></div>)}</div></Section>

      <Section title="Notes" description="Private and public context for staff and collectors."><div className="grid gap-4"><Field label="Public description"><Textarea name="description" defaultValue={initialCard?.description ?? ""} placeholder="Describe condition, appeal, and provenance…" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Provenance notes"><Textarea name="provenanceNotes" defaultValue={initialCard?.provenanceNotes ?? ""} /></Field><Field label="Slab notes"><Textarea name="slabNotes" defaultValue={initialCard?.slabNotes ?? ""} /></Field></div><Field label="Shipping regions"><Input name="shippingRegions" defaultValue={initialCard?.shippingRegions ?? ""} placeholder="United States, Canada" /></Field></div></Section>

      <footer className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-popover/95 p-3 shadow-2xl backdrop-blur"><span className="text-xs text-muted-foreground">{dirty ? "Unsaved changes" : "All changes saved"}</span><div className="flex flex-wrap gap-2">{initialCard && <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive" disabled={pending}><Archive />Archive</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Archive this card?</AlertDialogTitle><AlertDialogDescription>This removes the card from active inventory. You can restore it later by editing its inventory status.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/85" onClick={() => startTransition(async () => { await archiveCardAction(initialCard.id); setDirty(false); router.push("/admin/cards"); router.refresh(); })}>Archive card</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}<Button type="submit" name="intent" value="DRAFT" variant="outline" disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}<Save />Save draft</Button><Button type="submit" name="intent" value="PUBLISHED" disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}Publish</Button></div></footer>
    </form>
  );
}
