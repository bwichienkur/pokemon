import type {
  AppSetting,
  AuditLog,
  Card,
  CardImage,
  Favorite,
  Inquiry,
  InquiryNote,
  PaymentEvent,
  Profile,
} from "@/types/database";

type SnakeRecord = Record<string, unknown>;
const toCamel = (key: string) => key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
const toSnake = (key: string) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

function snakeToCamel<T>(record: SnakeRecord): T {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [toCamel(key), value])) as T;
}

function camelToSnake(record: Record<string, unknown>): SnakeRecord {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [toSnake(key), value]));
}

export const snakeToCard = (record: SnakeRecord): Card => snakeToCamel<Card>(record);
export const cardToSnake = (card: Partial<Card>): SnakeRecord => camelToSnake(card as Record<string, unknown>);
export const snakeToCardImage = (record: SnakeRecord): CardImage => snakeToCamel<CardImage>(record);
export const cardImageToSnake = (image: Partial<CardImage>): SnakeRecord => camelToSnake(image as Record<string, unknown>);
export const snakeToProfile = (record: SnakeRecord): Profile => snakeToCamel<Profile>(record);
export const profileToSnake = (profile: Partial<Profile>): SnakeRecord => camelToSnake(profile as Record<string, unknown>);
export const snakeToInquiry = (record: SnakeRecord): Inquiry => snakeToCamel<Inquiry>(record);
export const inquiryToSnake = (inquiry: Partial<Inquiry>): SnakeRecord => camelToSnake(inquiry as Record<string, unknown>);
export const snakeToInquiryNote = (record: SnakeRecord): InquiryNote => snakeToCamel<InquiryNote>(record);
export const inquiryNoteToSnake = (note: Partial<InquiryNote>): SnakeRecord => camelToSnake(note as Record<string, unknown>);
export const snakeToFavorite = (record: SnakeRecord): Favorite => snakeToCamel<Favorite>(record);
export const snakeToPaymentEvent = (record: SnakeRecord): PaymentEvent => snakeToCamel<PaymentEvent>(record);
export const snakeToAuditLog = (record: SnakeRecord): AuditLog => snakeToCamel<AuditLog>(record);
export const snakeToAppSetting = (record: SnakeRecord): AppSetting => snakeToCamel<AppSetting>(record);
