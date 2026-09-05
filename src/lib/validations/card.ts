import { z } from "zod";

const graders = ["PSA", "BGS", "CGC", "TAG"] as const;
const availabilityStatuses = ["AVAILABLE", "RESERVED", "SOLD", "ARCHIVED"] as const;
const publicationStatuses = ["DRAFT", "PUBLISHED"] as const;
const imageTypes = ["FRONT", "BACK", "LABEL", "DETAIL"] as const;

const nonEmptyText = z.string().trim().min(1);
const optionalText = z.string().trim().max(500).optional().nullable();

export const psaGraderMetadataSchema = z
  .object({
    grader: z.literal("PSA").optional(),
    labelType: z.string().trim().max(100).nullable().optional(),
    qualifier: z.string().trim().max(50).nullable().optional(),
    autographGrade: z.string().trim().max(50).nullable().optional(),
    populationCount: z.number().int().nonnegative().nullable().optional(),
    psaEstimateMinor: z.number().int().nonnegative().nullable().optional(),
    psaEstimateNote: z.string().trim().max(200).nullable().optional(),
    dateGraded: z.string().trim().max(40).nullable().optional(),
    graderNotes: z.string().trim().max(2_000).nullable().optional(),
  })
  .passthrough();

export const bgsGraderMetadataSchema = z
  .object({
    grader: z.literal("BGS").optional(),
    centering: z.number().min(0).max(10).nullable().optional(),
    corners: z.number().min(0).max(10).nullable().optional(),
    edges: z.number().min(0).max(10).nullable().optional(),
    surface: z.number().min(0).max(10).nullable().optional(),
    autographGrade: z.string().trim().max(50).nullable().optional(),
    labelColor: z.string().trim().max(50).nullable().optional(),
    labelType: z.string().trim().max(100).nullable().optional(),
    dateGraded: z.string().trim().max(40).nullable().optional(),
    graderNotes: z.string().trim().max(2_000).nullable().optional(),
  })
  .passthrough();

export const cgcGraderMetadataSchema = z
  .object({
    grader: z.literal("CGC").optional(),
    pedigree: z.string().trim().max(100).nullable().optional(),
    variantAttribution: z.string().trim().max(100).nullable().optional(),
    autographDesignation: z.string().trim().max(100).nullable().optional(),
    centering: z.number().min(0).max(10).nullable().optional(),
    corners: z.number().min(0).max(10).nullable().optional(),
    edges: z.number().min(0).max(10).nullable().optional(),
    surface: z.number().min(0).max(10).nullable().optional(),
    perfectOrPristine: z.string().trim().max(50).nullable().optional(),
    dateGraded: z.string().trim().max(40).nullable().optional(),
    graderNotes: z.string().trim().max(2_000).nullable().optional(),
  })
  .passthrough();

export const tagGraderMetadataSchema = z
  .object({
    grader: z.literal("TAG").optional(),
    tagGrade: z.string().trim().max(50).nullable().optional(),
    tagScore: z.number().min(0).max(1000).nullable().optional(),
    digReportUrl: z.string().url().nullable().optional(),
    ranking: z.string().trim().max(100).nullable().optional(),
    populationInfo: z.string().trim().max(200).nullable().optional(),
    digitalReportDetails: z.string().trim().max(2_000).nullable().optional(),
    dateGraded: z.string().trim().max(40).nullable().optional(),
    graderNotes: z.string().trim().max(2_000).nullable().optional(),
  })
  .passthrough();

export const graderMetadataSchema = z.record(z.unknown()).default({});

const cardFieldsSchema = z.object({
  title: nonEmptyText.max(160),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.")
    .optional(),
  pokemonName: nonEmptyText.max(120),
  description: z.string().trim().max(10_000).nullable().optional(),
  year: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1)
    .nullable()
    .optional(),
  setName: nonEmptyText.max(160).nullable().optional(),
  setCode: z.string().trim().max(40).nullable().optional(),
  cardNumber: z.string().trim().max(50).nullable().optional(),
  setTotal: z.string().trim().max(50).nullable().optional(),
  rarity: optionalText,
  variant: optionalText,
  edition: optionalText,
  finish: optionalText,
  language: nonEmptyText.max(50).default("English"),
  category: nonEmptyText.max(80).default("Pokemon"),
  grader: z.enum(graders),
  grade: z.number().min(1).max(10),
  gradeLabel: z.string().trim().max(80).nullable().optional(),
  certificationNumber: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Za-z0-9-]+$/, "Certificate numbers may only contain letters, numbers, and hyphens."),
  verificationUrl: z.string().url().nullable().optional(),
  graderMetadata: graderMetadataSchema.optional(),
  priceMinor: z.number().int().nonnegative().safe(),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/)
    .default("USD"),
  priceNegotiable: z.boolean().default(false),
  availabilityStatus: z.enum(availabilityStatuses).default("AVAILABLE"),
  publicationStatus: z.enum(publicationStatuses).default("DRAFT"),
  featured: z.boolean().default(false),
  populationCount: z.number().int().nonnegative().nullable().optional(),
  provenanceNotes: z.string().trim().max(5_000).nullable().optional(),
  slabNotes: z.string().trim().max(5_000).nullable().optional(),
  shippingRegions: z.string().trim().max(500).nullable().optional(),
  acquiredAt: z.string().datetime().nullable().optional(),
  listedAt: z.string().datetime().nullable().optional(),
});

export const cardCreateSchema = cardFieldsSchema;
export const cardUpdateSchema = cardFieldsSchema.partial();

const queryInteger = (minimum: number, maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? Number(value) : value),
    z.number().int().min(minimum).max(maximum).optional(),
  );

const queryBoolean = z.preprocess((value) => {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return undefined;
}, z.boolean().optional());

const queryList = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
      return value;
    },
    z.array(z.enum(values)).max(values.length).optional(),
  );

export const cardFiltersSchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    graders: queryList(graders),
    grades: z.preprocess(
      (value) =>
        typeof value === "string"
          ? value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .map(Number)
          : value,
      z.array(z.number().min(1).max(10)).max(20).optional(),
    ),
    availability: queryList(availabilityStatuses),
    publicationStatus: queryList(publicationStatuses),
    languages: z.preprocess(
      (value) =>
        typeof value === "string"
          ? value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : value,
      z.array(z.string().min(1).max(50)).max(20).optional(),
    ),
    sets: z.preprocess(
      (value) =>
        typeof value === "string"
          ? value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : value,
      z.array(z.string().min(1).max(160)).max(50).optional(),
    ),
    rarities: z.preprocess(
      (value) =>
        typeof value === "string"
          ? value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : value,
      z.array(z.string().min(1).max(80)).max(30).optional(),
    ),
    finishes: z.preprocess(
      (value) =>
        typeof value === "string"
          ? value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : value,
      z.array(z.string().min(1).max(80)).max(20).optional(),
    ),
    featured: queryBoolean,
    minPriceMinor: queryInteger(0, Number.MAX_SAFE_INTEGER),
    maxPriceMinor: queryInteger(0, Number.MAX_SAFE_INTEGER),
    year: queryInteger(1950, new Date().getFullYear() + 1),
    minYear: queryInteger(1950, new Date().getFullYear() + 1),
    maxYear: queryInteger(1950, new Date().getFullYear() + 1),
    sort: z
      .enum([
        "newest",
        "oldest",
        "price_asc",
        "price_desc",
        "grade_desc",
        "year_asc",
        "recently_added",
      ])
      .default("newest"),
    page: queryInteger(1, 10_000).default(1),
    perPage: queryInteger(1, 100).default(24),
    view: z.enum(["grid", "list"]).default("grid"),
  })
  .superRefine((value, context) => {
    if (
      value.minPriceMinor !== undefined &&
      value.maxPriceMinor !== undefined &&
      value.minPriceMinor > value.maxPriceMinor
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minPriceMinor"],
        message: "Minimum price cannot exceed maximum price.",
      });
    }
  });

export const imageUploadMetadataSchema = z.object({
  cardId: z.string().uuid().optional(),
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[^/\\]+$/, "File names cannot contain path separators."),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(15 * 1024 * 1024),
  imageType: z.enum(imageTypes),
  sortOrder: z.number().int().min(0).max(100).default(0),
  altText: z.string().trim().max(250).nullable().optional(),
  width: z.number().int().positive().max(12_000).nullable().optional(),
  height: z.number().int().positive().max(12_000).nullable().optional(),
});

export type CardCreateInput = z.infer<typeof cardCreateSchema>;
export type CardUpdateInput = z.infer<typeof cardUpdateSchema>;
export type CardFilters = z.infer<typeof cardFiltersSchema>;
export type ImageUploadMetadata = z.infer<typeof imageUploadMetadataSchema>;
