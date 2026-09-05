import { z } from "zod";

const graders = ["PSA", "BGS", "CGC", "TAG"] as const;
const availabilityStatuses = ["AVAILABLE", "RESERVED", "SOLD", "ARCHIVED"] as const;
const publicationStatuses = ["DRAFT", "PUBLISHED"] as const;
const imageTypes = ["FRONT", "BACK", "LABEL", "DETAIL"] as const;

const nonEmptyText = z.string().trim().min(1);
const nullableText = z.string().trim().min(1).max(500).nullable().optional();
const certificateNumber = z
  .string()
  .trim()
  .min(3)
  .max(40)
  .regex(/^[A-Za-z0-9-]+$/, "Certificate numbers may only contain letters, numbers, and hyphens.");
const grade = z.string().trim().min(1).max(30);

export const psaGraderMetadataSchema = z
  .object({
    grader: z.literal("PSA"),
    certNumber: certificateNumber,
    labelType: z.string().trim().max(100).nullable().optional(),
    qualifier: z.string().trim().max(50).nullable().optional(),
  })
  .strict();

export const bgsGraderMetadataSchema = z
  .object({
    grader: z.literal("BGS"),
    certNumber: certificateNumber,
    labelType: z.string().trim().max(100).nullable().optional(),
    centering: z.number().min(0).max(10).nullable().optional(),
    corners: z.number().min(0).max(10).nullable().optional(),
    edges: z.number().min(0).max(10).nullable().optional(),
    surface: z.number().min(0).max(10).nullable().optional(),
  })
  .strict();

export const cgcGraderMetadataSchema = z
  .object({
    grader: z.literal("CGC"),
    certNumber: certificateNumber,
    labelType: z.string().trim().max(100).nullable().optional(),
    pedigree: z.string().trim().max(100).nullable().optional(),
    qualifiers: z.array(z.string().trim().min(1).max(50)).max(8).nullable().optional(),
  })
  .strict();

export const tagGraderMetadataSchema = z
  .object({
    grader: z.literal("TAG"),
    certNumber: certificateNumber,
    reportUrl: z.string().url().nullable().optional(),
    score: z.number().min(0).max(1000).nullable().optional(),
  })
  .strict();

export const graderMetadataSchema = z.discriminatedUnion("grader", [
  psaGraderMetadataSchema,
  bgsGraderMetadataSchema,
  cgcGraderMetadataSchema,
  tagGraderMetadataSchema,
]);

const cardFieldsSchema = z
  .object({
    title: nonEmptyText.max(160),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(180)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.")
      .optional(),
    cardName: nonEmptyText.max(120),
    setName: nonEmptyText.max(160),
    year: z.number().int().min(1950).max(new Date().getFullYear() + 1).nullable().optional(),
    cardNumber: z.string().trim().min(1).max(50).nullable().optional(),
    rarity: nullableText,
    language: nonEmptyText.max(50).default("English"),
    variant: nullableText,
    description: z.string().trim().max(10_000).nullable().optional(),
    grader: z.enum(graders),
    grade,
    graderMetadata: graderMetadataSchema,
    priceMinor: z.number().int().nonnegative().safe(),
    currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).default("USD"),
    availability: z.enum(availabilityStatuses).default("AVAILABLE"),
    publicationStatus: z.enum(publicationStatuses).default("DRAFT"),
    featured: z.boolean().default(false),
    seoTitle: z.string().trim().max(70).nullable().optional(),
    seoDescription: z.string().trim().max(160).nullable().optional(),
  })
  .strict();

function validateGraderConsistency(
  value: { grader?: string; graderMetadata?: { grader: string } },
  context: z.RefinementCtx,
) {
  if (value.grader && value.graderMetadata && value.grader !== value.graderMetadata.grader) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["graderMetadata", "grader"],
      message: "Grader metadata must match the selected grader.",
    });
  }
}

export const cardCreateSchema = cardFieldsSchema.superRefine(validateGraderConsistency);

export const cardUpdateSchema = cardFieldsSchema
  .partial()
  .superRefine(validateGraderConsistency);

const queryInteger = (minimum: number, maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? Number(value) : value),
    z.number().int().min(minimum).max(maximum).optional(),
  );

const queryList = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
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
          ? value.split(",").map((item) => item.trim()).filter(Boolean)
          : value,
      z.array(z.string().min(1).max(30)).max(20).optional(),
    ),
    availability: queryList(availabilityStatuses),
    publicationStatus: queryList(publicationStatuses),
    minPriceMinor: queryInteger(0, Number.MAX_SAFE_INTEGER),
    maxPriceMinor: queryInteger(0, Number.MAX_SAFE_INTEGER),
    year: queryInteger(1950, new Date().getFullYear() + 1),
    sort: z
      .enum(["newest", "oldest", "price_asc", "price_desc", "grade_desc"])
      .default("newest"),
    page: queryInteger(1, 10_000).default(1),
    perPage: queryInteger(1, 100).default(24),
  })
  .strict()
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

export const imageUploadMetadataSchema = z
  .object({
    cardId: z.string().uuid().optional(),
    fileName: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .regex(/^[^/\\]+$/, "File names cannot contain path separators."),
    contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    fileSize: z.number().int().positive().max(15 * 1024 * 1024),
    type: z.enum(imageTypes),
    sortOrder: z.number().int().min(0).max(100).default(0),
    altText: z.string().trim().max(250).nullable().optional(),
    width: z.number().int().positive().max(12_000).nullable().optional(),
    height: z.number().int().positive().max(12_000).nullable().optional(),
  })
  .strict();

export type CardCreateInput = z.infer<typeof cardCreateSchema>;
export type CardUpdateInput = z.infer<typeof cardUpdateSchema>;
export type CardFilters = z.infer<typeof cardFiltersSchema>;
export type ImageUploadMetadata = z.infer<typeof imageUploadMetadataSchema>;
