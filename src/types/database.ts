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
export type OrderStatus =
  | "PENDING"
  | "RESERVED"
  | "PAID"
  | "FULFILLED"
  | "CANCELLED"
  | "EXPIRED";
export type PaymentEventStatus = "RECEIVED" | "PROCESSED" | "FAILED" | "IGNORED";

export interface PsaGraderMetadata {
  grader?: "PSA";
  labelType?: string | null;
  qualifier?: string | null;
  autographGrade?: string | null;
  populationCount?: number | null;
  psaEstimateMinor?: number | null;
  psaEstimateNote?: string | null;
  dateGraded?: string | null;
  graderNotes?: string | null;
}

export interface BgsGraderMetadata {
  grader?: "BGS";
  centering?: number | null;
  corners?: number | null;
  edges?: number | null;
  surface?: number | null;
  autographGrade?: string | null;
  labelColor?: string | null;
  labelType?: string | null;
  dateGraded?: string | null;
  graderNotes?: string | null;
}

export interface CgcGraderMetadata {
  grader?: "CGC";
  pedigree?: string | null;
  variantAttribution?: string | null;
  autographDesignation?: string | null;
  centering?: number | null;
  corners?: number | null;
  edges?: number | null;
  surface?: number | null;
  perfectOrPristine?: string | null;
  dateGraded?: string | null;
  graderNotes?: string | null;
}

export interface TagGraderMetadata {
  grader?: "TAG";
  tagGrade?: string | null;
  tagScore?: number | null;
  digReportUrl?: string | null;
  ranking?: string | null;
  populationInfo?: string | null;
  digitalReportDetails?: string | null;
  dateGraded?: string | null;
  graderNotes?: string | null;
}

export type GraderMetadata =
  | PsaGraderMetadata
  | BgsGraderMetadata
  | CgcGraderMetadata
  | TagGraderMetadata
  | Record<string, unknown>;

export interface Profile {
  id: string;
  displayName: string | null;
  email: string;
  phone: string | null;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  slug: string;
  title: string;
  pokemonName: string;
  description: string | null;
  year: number | null;
  setName: string | null;
  setCode: string | null;
  cardNumber: string | null;
  setTotal: string | null;
  rarity: string | null;
  variant: string | null;
  edition: string | null;
  finish: string | null;
  language: string;
  category: string;
  grader: Grader;
  grade: number;
  gradeLabel: string | null;
  certificationNumber: string;
  verificationUrl: string | null;
  graderMetadata: GraderMetadata;
  priceMinor: number;
  currency: string;
  priceNegotiable: boolean;
  availabilityStatus: AvailabilityStatus;
  publicationStatus: PublicationStatus;
  featured: boolean;
  populationCount: number | null;
  provenanceNotes: string | null;
  slabNotes: string | null;
  shippingRegions: string | null;
  acquiredAt: string | null;
  listedAt: string | null;
  soldAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface CardImage {
  id: string;
  cardId: string;
  imageUrl: string;
  storagePath: string | null;
  imageType: ImageType;
  altText: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export interface Favorite {
  userId: string;
  cardId: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  referenceNumber: string;
  cardId: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string | null;
  offerAmountMinor: number | null;
  currency: string;
  preferredContactMethod: PreferredContactMethod;
  country: string;
  postalCode: string | null;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryNote {
  id: string;
  inquiryId: string;
  authorId: string;
  note: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string | null;
  status: OrderStatus;
  currency: string;
  subtotalMinor: number;
  taxMinor: number;
  shippingMinor: number;
  totalMinor: number;
  reservationExpiresAt: string | null;
  paymentProvider: string | null;
  paymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  cardId: string;
  titleSnapshot: string;
  certificationSnapshot: string;
  gradeSnapshot: string;
  priceMinor: number;
  currency: string;
  createdAt: string;
}

export interface PaymentEvent {
  id: string;
  provider: string;
  providerEventId: string;
  idempotencyKey: string;
  status: PaymentEventStatus;
  payload: Record<string, unknown>;
  processedAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  createdAt: string;
}

export interface AppSetting {
  key: string;
  value: unknown;
  updatedAt: string;
  updatedBy: string | null;
}

export type CardWithImages = Card & { images: CardImage[] };

export interface InquiryWithCard extends Inquiry {
  card?: Pick<Card, "id" | "slug" | "title" | "priceMinor" | "currency" | "grader" | "grade"> | null;
}

export interface LocalStore {
  profiles: Profile[];
  cards: Card[];
  cardImages: CardImage[];
  favorites: Favorite[];
  inquiries: Inquiry[];
  inquiryNotes: InquiryNote[];
  orders: Order[];
  orderItems: OrderItem[];
  paymentEvents: PaymentEvent[];
  auditLogs: AuditLog[];
  appSettings: AppSetting[];
  sessions: Array<{
    id: string;
    userId: string;
    email: string;
    createdAt: string;
    expiresAt: string;
  }>;
}
