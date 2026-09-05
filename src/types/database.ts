export type Role = "USER" | "ADMIN";

export type AvailabilityStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "ARCHIVED";
export type PublicationStatus = "DRAFT" | "PUBLISHED";
export type Grader = "PSA" | "BGS" | "CGC" | "TAG";
export type InquiryStatus =
  | "NEW"
  | "REVIEWING"
  | "BUYER_CONTACTED"
  | "NEGOTIATING"
  | "ACCEPTED"
  | "DECLINED"
  | "CLOSED"
  | "CONVERTED_TO_ORDER";
export type ImageType = "FRONT" | "BACK" | "LABEL" | "DETAIL";
export type PreferredContactMethod = "EMAIL" | "PHONE" | "EITHER";

export interface PsaGraderMetadata {
  grader: "PSA";
  certNumber: string;
  labelType?: string | null;
  qualifier?: string | null;
}

export interface BgsGraderMetadata {
  grader: "BGS";
  certNumber: string;
  labelType?: string | null;
  centering?: number | null;
  corners?: number | null;
  edges?: number | null;
  surface?: number | null;
}

export interface CgcGraderMetadata {
  grader: "CGC";
  certNumber: string;
  labelType?: string | null;
  pedigree?: string | null;
  qualifiers?: string[] | null;
}

export interface TagGraderMetadata {
  grader: "TAG";
  certNumber: string;
  reportUrl?: string | null;
  score?: number | null;
}

export type GraderMetadata =
  | PsaGraderMetadata
  | BgsGraderMetadata
  | CgcGraderMetadata
  | TagGraderMetadata;

export interface Profile {
  id: string;
  email: string;
  role: Role;
  displayName: string | null;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  title: string;
  slug: string;
  cardName: string;
  setName: string;
  year: number | null;
  cardNumber: string | null;
  rarity: string | null;
  language: string;
  variant: string | null;
  description: string | null;
  grader: Grader;
  grade: string;
  graderMetadata: GraderMetadata;
  priceMinor: number;
  currency: string;
  availability: AvailabilityStatus;
  publicationStatus: PublicationStatus;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CardImage {
  id: string;
  cardId: string;
  storagePath: string;
  publicUrl: string;
  altText: string | null;
  type: ImageType;
  sortOrder: number;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export interface Favorite {
  profileId: string;
  cardId: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  cardId: string;
  profileId: string | null;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  preferredContactMethod: PreferredContactMethod;
  message: string;
  privacyAgreementAt: string;
  status: InquiryStatus;
  assignedToProfileId: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface InquiryNote {
  id: string;
  inquiryId: string;
  authorProfileId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  profileId: string | null;
  inquiryId: string | null;
  buyerName: string;
  buyerEmail: string;
  currency: string;
  subtotalMinor: number;
  totalMinor: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";
  fulfillmentStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  shippingAddress: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  cardId: string;
  title: string;
  grader: Grader;
  grade: string;
  quantity: number;
  unitPriceMinor: number;
  currency: string;
  createdAt: string;
}

export interface PaymentEvent {
  id: string;
  orderId: string | null;
  provider: string;
  providerEventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  processedAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorProfileId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AppSetting {
  key: string;
  value: unknown;
  updatedByProfileId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CardWithImages = Card & { images: CardImage[] };
